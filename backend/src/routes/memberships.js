const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendMail, sendAdminNotificationAsync, buildMembershipEmail } = require('../services/email');

const router = express.Router();

// GET All Membership Plans (Public / Buyer view)
router.get('/plans', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM membership_plans ORDER BY price ASC');
    const plans = result.rows.map(p => ({
      ...p,
      price: parseFloat(p.price_usd || p.price),
      price_usd: parseFloat(p.price_usd || p.price),
      price_npr: parseFloat(p.price_npr || 0),
      point_multiplier: parseFloat(p.point_multiplier || 1),
    }));
    res.json({ plans });
  } catch (err) {
    console.error('Fetch membership plans error:', err);
    res.status(500).json({ error: 'Server error fetching membership plans' });
  }
});

// GET Buyer Active Membership Status
router.get('/my-status', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM user_memberships
       WHERE user_id = $1 AND status = 'active' AND end_date > CURRENT_TIMESTAMP
       ORDER BY id DESC LIMIT 1`,
      [req.user.id]
    );

    const membership = result.rows.length > 0 ? result.rows[0] : null;
    res.json({ membership });
  } catch (err) {
    console.error('Fetch membership status error:', err);
    res.status(500).json({ error: 'Server error fetching membership status' });
  }
});

// POST Subscribe / Purchase Membership (Buyer)
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { plan_id, payment_method, payment_gateway } = req.body;
    if (!plan_id) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    const planRes = await db.query('SELECT * FROM membership_plans WHERE id = $1', [plan_id]);
    if (planRes.rows.length === 0) {
      return res.status(404).json({ error: 'Membership plan not found' });
    }

    const plan = planRes.rows[0];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

    // Deactivate previous active memberships for this user
    await db.query(
      `UPDATE user_memberships SET status = 'expired' WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    );

    // Create new active membership record
    const insertRes = await db.query(
      `INSERT INTO user_memberships (user_id, plan_id, plan_name, price, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [req.user.id, plan.id, plan.plan_name, parseFloat(plan.price_usd || plan.price), startDate, endDate]
    );

    const purchaseRes = await db.query(
      `INSERT INTO membership_purchases (user_id, plan_id, plan_name, amount_npr, amount_usd, payment_method, transaction_ref, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed') RETURNING *`,
      [
        req.user.id, plan.id, plan.plan_name,
        parseFloat(plan.price_npr || 0), parseFloat(plan.price_usd || plan.price),
        payment_method || 'Credit Card',
        `MEM-${Date.now()}`
      ]
    );

    const gateway = payment_gateway || 'credit_card';
    await db.query(
      `INSERT INTO payment_transactions (user_id, membership_purchase_id, gateway, amount_npr, amount_usd, currency, status, transaction_ref)
       VALUES ($1, $2, $3, $4, $5, 'USD', 'completed', $6)`,
      [req.user.id, purchaseRes.rows[0].id, gateway, parseFloat(plan.price_npr || 0), parseFloat(plan.price_usd || plan.price), `MEM-TXN-${Date.now()}`]
    );

    // Earn bonus reward points for upgrading membership! (50 bonus points)
    await db.query(
      `INSERT INTO reward_points_transactions (user_id, type, points, description)
       VALUES ($1, 'earned', 50, $2)`,
      [req.user.id, `Membership upgrade reward bonus (${plan.plan_name})`]
    );

    const buyerRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const buyer = buyerRes.rows[0] || req.user;
    const emailPayload = buildMembershipEmail(insertRes.rows[0], buyer, plan);

    sendAdminNotificationAsync({
      ...emailPayload,
      metadata: { plan_id: plan.id, user_id: req.user.id }
    });

    if (buyer.email) {
      setImmediate(() => {
        sendMail({
          to: buyer.email,
          ...emailPayload,
          metadata: { plan_id: plan.id }
        }).catch(() => {});
      });
    }

    res.status(201).json({
      message: `Successfully subscribed to ${plan.plan_name}`,
      membership: insertRes.rows[0]
    });
  } catch (err) {
    console.error('Subscribe membership error:', err);
    res.status(500).json({ error: 'Server error processing membership subscription' });
  }
});

// POST Add Membership Plan (Admin Only)
router.post('/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { plan_name, description, price, price_npr, price_usd, duration_days, point_multiplier, perks } = req.body;
    if (!plan_name || price === undefined || !duration_days) {
      return res.status(400).json({ error: 'Plan name, price, and duration in days are required' });
    }

    const usd = parseFloat(price_usd || price);
    const npr = parseFloat(price_npr || usd * 133.5);

    const result = await db.query(
      `INSERT INTO membership_plans (plan_name, description, price, price_npr, price_usd, duration_days, point_multiplier, perks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [plan_name.trim(), description || '', usd, npr, usd, parseInt(duration_days, 10), parseFloat(point_multiplier || 1), perks || []]
    );

    res.status(201).json({ plan: result.rows[0] });
  } catch (err) {
    console.error('Add membership plan error:', err);
    res.status(500).json({ error: 'Server error adding membership plan' });
  }
});

// PUT Edit Membership Plan (Admin Only - Pricing, Duration, Perks)
router.put('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_name, description, price, price_npr, price_usd, duration_days, point_multiplier, perks } = req.body;

    const result = await db.query(
      `UPDATE membership_plans SET
         plan_name = COALESCE($1, plan_name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         price_npr = COALESCE($4, price_npr),
         price_usd = COALESCE($5, price_usd),
         duration_days = COALESCE($6, duration_days),
         point_multiplier = COALESCE($7, point_multiplier),
         perks = COALESCE($8, perks)
       WHERE id = $9 RETURNING *`,
      [
        plan_name,
        description,
        price_usd !== undefined ? parseFloat(price_usd) : (price !== undefined ? parseFloat(price) : null),
        price_npr !== undefined ? parseFloat(price_npr) : null,
        price_usd !== undefined ? parseFloat(price_usd) : (price !== undefined ? parseFloat(price) : null),
        duration_days !== undefined ? parseInt(duration_days, 10) : null,
        point_multiplier !== undefined ? parseFloat(point_multiplier) : null,
        perks,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ plan: result.rows[0] });
  } catch (err) {
    console.error('Update membership plan error:', err);
    res.status(500).json({ error: 'Server error updating membership plan' });
  }
});

// DELETE Membership Plan (Admin Only)
router.delete('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM membership_plans WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ message: 'Membership plan deleted', id });
  } catch (err) {
    console.error('Delete membership plan error:', err);
    res.status(500).json({ error: 'Server error deleting membership plan' });
  }
});

module.exports = router;
