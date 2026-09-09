const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendMail, getTransporter, buildTestEmail } = require('../services/email');

const router = express.Router();

// GET Admin Dashboard Key Metrics & Stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const revRes = await db.query(`SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status != 'cancelled'`);
    const usersRes = await db.query(`SELECT COUNT(id) AS total_users FROM users WHERE role = 'buyer'`);
    const ordersRes = await db.query(`SELECT COUNT(id) AS total_orders FROM orders`);
    const memsRes = await db.query(`SELECT COUNT(id) AS active_memberships FROM user_memberships WHERE status = 'active' AND end_date > CURRENT_TIMESTAMP`);
    const productsRes = await db.query(`SELECT COUNT(id) AS total_products FROM products`);

    // Recent activity (latest 8 orders)
    const recentActivityRes = await db.query(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, u.full_name AS buyer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 8
    `);

    res.json({
      stats: {
        total_revenue: parseFloat(revRes.rows[0]?.total_revenue || 0),
        total_users: parseInt(usersRes.rows[0]?.total_users || 0, 10),
        total_orders: parseInt(ordersRes.rows[0]?.total_orders || 0, 10),
        active_memberships: parseInt(memsRes.rows[0]?.active_memberships || 0, 10),
        total_products: parseInt(productsRes.rows[0]?.total_products || 0, 10)
      },
      recent_activity: recentActivityRes.rows || []
    });
  } catch (err) {
    console.error('Fetch admin stats error:', err);
    res.status(500).json({ error: 'Server error fetching dashboard metrics' });
  }
});

// GET Full Buyers & User Directory List with Summary Stats
router.get('/buyers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.is_verified, u.phone, u.address, u.created_at,
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(DISTINCT CASE WHEN o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) AS total_spent,
        (
          SELECT COALESCE(SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END), 0) -
                 COALESCE(SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END), 0)
          FROM reward_points_transactions
          WHERE user_id = u.id
        ) AS reward_points_balance,
        (
          SELECT plan_name FROM user_memberships
          WHERE user_id = u.id AND status = 'active' AND end_date > CURRENT_TIMESTAMP
          ORDER BY id DESC LIMIT 1
        ) AS active_membership
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    const buyers = result.rows.map(b => ({
      ...b,
      role: b.role || 'buyer',
      is_verified: b.is_verified ?? true,
      total_orders: parseInt(b.total_orders, 10),
      total_spent: parseFloat(b.total_spent),
      reward_points_balance: parseInt(b.reward_points_balance || 0, 10),
      active_membership: b.active_membership || 'None (Standard)'
    }));

    res.json({ buyers });
  } catch (err) {
    console.error('Fetch buyer list error:', err);
    res.status(500).json({ error: 'Server error fetching buyer list' });
  }
});

// GET Detailed View of Single Buyer (Profile, Full Purchase History, Membership Status, Reward Points Log)
router.get('/buyers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. User profile
    const userRes = await db.query(
      `SELECT id, full_name, email, role, phone, address, is_verified, created_at FROM users WHERE id = $1`,
      [id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User profile account not found' });
    }

    const buyer = userRes.rows[0];

    // 2. Full Order History
    const ordersRes = await db.query(
      `SELECT o.*,
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'name', p.name,
             'quantity', oi.quantity,
             'unit_price', oi.unit_price
           )
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [id]
    );

    // 3. Membership History & Active Status
    const membershipRes = await db.query(
      `SELECT * FROM user_memberships WHERE user_id = $1 ORDER BY id DESC`,
      [id]
    );

    // 4. Reward Points Transactions History & Balance
    const rewardTxRes = await db.query(
      `SELECT * FROM reward_points_transactions WHERE user_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    const pointsSummaryRes = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END), 0) AS balance
       FROM reward_points_transactions WHERE user_id = $1`,
      [id]
    );

    res.json({
      buyer: {
        ...buyer,
        reward_points_balance: parseInt(pointsSummaryRes.rows[0].balance || 0, 10),
        active_membership: membershipRes.rows.find(m => m.status === 'active') || null
      },
      orders: ordersRes.rows.map(o => ({ ...o, total_amount: parseFloat(o.total_amount) })),
      memberships: membershipRes.rows,
      reward_transactions: rewardTxRes.rows
    });
  } catch (err) {
    console.error('Fetch detailed buyer error:', err);
    res.status(500).json({ error: 'Server error fetching buyer details' });
  }
});

// POST Verify & Test Email SMTP Configuration (Admin Only)
router.post('/test-email', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const targetEmail = req.body.target_email || process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        error: 'Target email is required or ADMIN_NOTIFY_EMAIL must be set in .env'
      });
    }

    const transporter = getTransporter();
    if (!transporter) {
      return res.status(400).json({
        success: false,
        error: 'SMTP Transporter not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env file.',
        config_status: {
          SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
          SMTP_PORT: process.env.SMTP_PORT || '587',
          SMTP_USER: process.env.SMTP_USER ? 'CONFIGURED' : 'NOT SET',
          SMTP_PASS: process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_app_password' ? 'CONFIGURED' : 'NOT SET / DEFAULT',
          ADMIN_NOTIFY_EMAIL: process.env.ADMIN_NOTIFY_EMAIL || 'NOT SET'
        }
      });
    }

    // Verify SMTP Connection Transporter
    let verifyStatus = false;
    try {
      await transporter.verify();
      verifyStatus = true;
    } catch (verifyErr) {
      return res.status(500).json({
        success: false,
        error: `SMTP Transporter verification failed: ${verifyErr.message}`,
        details: verifyErr.stack
      });
    }

    // Build and send test HTML email
    const emailPayload = buildTestEmail(targetEmail);
    const sendResult = await sendMail({
      to: targetEmail,
      ...emailPayload,
      metadata: { initiated_by: req.user.email, is_admin_test: true }
    });

    if (sendResult.sent) {
      return res.json({
        success: true,
        message: `🧪 Test email successfully dispatched to ${targetEmail}`,
        messageId: sendResult.messageId,
        smtp_verified: verifyStatus
      });
    } else {
      return res.status(500).json({
        success: false,
        error: `Failed to dispatch test email: ${sendResult.reason}`,
        smtp_verified: verifyStatus
      });
    }
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
