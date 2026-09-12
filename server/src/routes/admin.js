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

// PUT Toggle Buyer Email Verification Status (Admin Only)
router.put('/buyers/:id/toggle-verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id, 10);

    let updatedUser = null;
    if (db.memoryDb && Array.isArray(db.memoryDb.users)) {
      const user = db.memoryDb.users.find(u => u.id === targetUserId);
      if (user) {
        user.is_verified = !user.is_verified;
        user.verification_code = null;
        user.verification_token = null;
        user.verification_expires = null;
        updatedUser = user;
        if (db.saveMemoryDbToDisk) db.saveMemoryDbToDisk();
      }
    }

    if (!updatedUser) {
      const updateRes = await db.query(
        `UPDATE users SET is_verified = NOT COALESCE(is_verified, false) WHERE id = $1 RETURNING id, full_name, email, is_verified`,
        [targetUserId]
      );
      if (updateRes.rows.length === 0) {
        return res.status(404).json({ error: 'User account not found' });
      }
      updatedUser = updateRes.rows[0];
    }

    res.json({
      message: `✅ User '${updatedUser.full_name}' verification status updated to ${updatedUser.is_verified ? 'VERIFIED' : 'PENDING'}`,
      is_verified: updatedUser.is_verified
    });
  } catch (err) {
    console.error('Toggle verify error:', err);
    res.status(500).json({ error: 'Server error updating verification status' });
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
// ADMIN MANAGEMENT ENDPOINTS (MASTER ADMIN "SECOND LIEUTENANT" CONTROLS)
// =========================================================================

// GET List of All Admin Accounts & Max Admin Limit
router.get('/admins-list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`SELECT id, full_name, email, role, is_master_admin, created_at FROM users WHERE role = 'admin' ORDER BY id ASC`);
    
    let maxAdminLimit = (db.memoryDb && db.memoryDb.max_admin_limit) ? db.memoryDb.max_admin_limit : 5;
    try {
      const limitRes = await db.query(`SELECT value FROM site_settings WHERE key = 'max_admin_limit'`);
      if (limitRes.rows.length > 0 && limitRes.rows[0].value) {
        const val = limitRes.rows[0].value;
        const parsed = typeof val === 'string' ? JSON.parse(val) : val;
        maxAdminLimit = parseInt(parsed.limit || parsed, 10) || maxAdminLimit;
      }
    } catch (e) {}

    const admins = result.rows.map(a => ({
      ...a,
      is_master_admin: Boolean(a.is_master_admin || a.id === 1)
    }));

    res.json({
      admins,
      max_admin_limit: maxAdminLimit,
      current_admin_count: admins.length
    });
  } catch (err) {
    console.error('Fetch admins list error:', err);
    res.status(500).json({ error: 'Server error fetching admins list' });
  }
});

// POST Create New Admin Account (Master Admin Only)
router.post('/create-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full Name, Email/ID, and Password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check current admin count vs max limit
    const countRes = await db.query(`SELECT COUNT(id) AS count FROM users WHERE role = 'admin'`);
    const currentCount = parseInt(countRes.rows[0]?.count || 0, 10);

    let maxAdminLimit = 5;
    try {
      const limitRes = await db.query(`SELECT value FROM site_settings WHERE key = 'max_admin_limit'`);
      if (limitRes.rows.length > 0 && limitRes.rows[0].value) {
        maxAdminLimit = parseInt(limitRes.rows[0].value.limit || limitRes.rows[0].value, 10) || 5;
      }
    } catch (e) {}

    if (currentCount >= maxAdminLimit) {
      return res.status(400).json({
        error: `Admin limit reached (${currentCount}/${maxAdminLimit}). Please increase the max admin limit to add more admins.`
      });
    }

    // Check email uniqueness
    const existingRes = await db.query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
    if (existingRes.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email/ID already exists' });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, is_master_admin, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id, full_name, email, role, is_master_admin, created_at`,
      [full_name.trim(), cleanEmail, passwordHash, 'admin', false, true]
    );

    res.json({
      message: `✅ New admin account '${full_name}' created successfully!`,
      admin: insertRes.rows[0]
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Server error creating new admin account' });
  }
});

// PUT Edit Admin Account (Master Admin Edits any Admin or Admin edits own ID/Password)
router.put('/edit-admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password } = req.body;

    const targetUserId = parseInt(id, 10);
    const isSelf = req.user.id === targetUserId;
    const isMaster = Boolean(req.user.is_master_admin || req.user.id === 1);

    if (!isSelf && !isMaster) {
      return res.status(403).json({ error: 'Only Master Admin (Second Lieutenant) can edit other admin accounts' });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;

    if (cleanEmail) {
      const existingRes = await db.query(`SELECT id FROM users WHERE email = $1 AND id != $2`, [cleanEmail, targetUserId]);
      if (existingRes.rows.length > 0) {
        return res.status(400).json({ error: 'Email/ID already in use by another account' });
      }
    }

    let passwordHash = null;
    if (password && password.trim().length > 0) {
      const bcrypt = require('bcryptjs');
      passwordHash = await bcrypt.hash(password, 10);
    }

    if (passwordHash) {
      await db.query(
        `UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), password_hash = $3 WHERE id = $4`,
        [full_name ? full_name.trim() : null, cleanEmail, passwordHash, targetUserId]
      );
    } else {
      await db.query(
        `UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email) WHERE id = $3`,
        [full_name ? full_name.trim() : null, cleanEmail, targetUserId]
      );
    }

    const updatedRes = await db.query(`SELECT id, full_name, email, role, is_master_admin FROM users WHERE id = $1`, [targetUserId]);

    res.json({
      message: `✅ Admin account updated successfully!`,
      admin: updatedRes.rows[0]
    });
  } catch (err) {
    console.error('Edit admin error:', err);
    res.status(500).json({ error: 'Server error updating admin account' });
  }
});

// DELETE Admin Account (Master Admin Only)
router.delete('/delete-admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id, 10);

    const isMaster = Boolean(req.user.is_master_admin || req.user.id === 1);
    if (!isMaster) {
      return res.status(403).json({ error: 'Only Master Admin (Second Lieutenant) can delete admin accounts' });
    }

    const userRes = await db.query(`SELECT id, full_name, is_master_admin FROM users WHERE id = $1`, [targetUserId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Target admin account not found' });
    }

    const targetUser = userRes.rows[0];
    if (targetUser.is_master_admin || targetUser.id === 1) {
      return res.status(400).json({ error: 'Master Admin (Second Lieutenant) account cannot be deleted' });
    }

    await db.query(`DELETE FROM users WHERE id = $1`, [targetUserId]);

    res.json({
      message: `✅ Admin account '${targetUser.full_name}' deleted successfully!`
    });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Server error deleting admin account' });
  }
});

// PUT Update Max Admin Limit Setting (Master Admin Only)
router.put('/update-admin-limit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { max_admin_limit } = req.body;
    const newLimit = parseInt(max_admin_limit, 10);

    if (!newLimit || newLimit < 1) {
      return res.status(400).json({ error: 'Max admin limit must be a positive number greater than 0' });
    }

    const isMaster = Boolean(req.user.is_master_admin || req.user.id === 1);
    if (!isMaster) {
      return res.status(403).json({ error: 'Only Master Admin (Second Lieutenant) can update the max admin limit' });
    }

    if (db.memoryDb) {
      db.memoryDb.max_admin_limit = newLimit;
      if (!Array.isArray(db.memoryDb.site_settings)) db.memoryDb.site_settings = [];
      const existingIdx = db.memoryDb.site_settings.findIndex(s => s.key === 'max_admin_limit');
      const settingObj = { key: 'max_admin_limit', value: { limit: newLimit }, updated_at: new Date() };
      if (existingIdx >= 0) db.memoryDb.site_settings[existingIdx] = settingObj;
      else db.memoryDb.site_settings.push(settingObj);

      if (db.saveMemoryDbToDisk) db.saveMemoryDbToDisk();
    }

    try {
      await db.query(
        `INSERT INTO site_settings (key, value) VALUES ('max_admin_limit', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify({ limit: newLimit })]
      );
    } catch (e) {}

    res.json({
      message: `✅ Max admin account limit updated to ${newLimit}!`,
      max_admin_limit: newLimit
    });
  } catch (err) {
    console.error('Update admin limit error:', err);
    res.status(500).json({ error: 'Server error updating admin limit setting' });
  }
});

module.exports = router;
