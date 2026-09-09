const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET Reward Settings (Public / Config)
router.get('/settings', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reward_settings LIMIT 1');
    if (result.rows.length === 0) {
      return res.json({
        settings: { points_per_dollar_spent: 1.00, dollars_per_point_redeemed: 0.05 }
      });
    }
    const settings = {
      ...result.rows[0],
      points_per_dollar_spent: parseFloat(result.rows[0].points_per_dollar_spent),
      dollars_per_point_redeemed: parseFloat(result.rows[0].dollars_per_point_redeemed)
    };
    res.json({ settings });
  } catch (err) {
    console.error('Fetch reward settings error:', err);
    res.status(500).json({ error: 'Server error fetching reward settings' });
  }
});

// PUT Update Reward Settings (Admin Only)
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { points_per_dollar_spent, dollars_per_point_redeemed } = req.body;
    if (points_per_dollar_spent === undefined || dollars_per_point_redeemed === undefined) {
      return res.status(400).json({ error: 'Both earning rate and redemption rate are required' });
    }

    const check = await db.query('SELECT id FROM reward_settings LIMIT 1');
    let result;
    if (check.rows.length === 0) {
      result = await db.query(
        `INSERT INTO reward_settings (points_per_dollar_spent, dollars_per_point_redeemed)
         VALUES ($1, $2) RETURNING *`,
        [parseFloat(points_per_dollar_spent), parseFloat(dollars_per_point_redeemed)]
      );
    } else {
      result = await db.query(
        `UPDATE reward_settings SET
           points_per_dollar_spent = $1,
           dollars_per_point_redeemed = $2,
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [parseFloat(points_per_dollar_spent), parseFloat(dollars_per_point_redeemed), check.rows[0].id]
      );
    }

    const settings = {
      ...result.rows[0],
      points_per_dollar_spent: parseFloat(result.rows[0].points_per_dollar_spent),
      dollars_per_point_redeemed: parseFloat(result.rows[0].dollars_per_point_redeemed)
    };

    res.json({ settings, message: 'Reward points settings updated successfully' });
  } catch (err) {
    console.error('Update reward settings error:', err);
    res.status(500).json({ error: 'Server error updating reward settings' });
  }
});

// GET Buyer Reward Points Balance & Transactions History
router.get('/my-points', authenticateToken, async (req, res) => {
  try {
    const txRes = await db.query(
      `SELECT * FROM reward_points_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const balanceRes = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END), 0) -
         COALESCE(SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END), 0) AS balance,
         COALESCE(SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END), 0) AS total_earned,
         COALESCE(SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END), 0) AS total_redeemed
       FROM reward_points_transactions
       WHERE user_id = $1`,
      [req.user.id]
    );

    const summary = balanceRes.rows[0];

    res.json({
      balance: parseInt(summary.balance || 0, 10),
      total_earned: parseInt(summary.total_earned || 0, 10),
      total_redeemed: parseInt(summary.total_redeemed || 0, 10),
      history: txRes.rows
    });
  } catch (err) {
    console.error('Fetch my points error:', err);
    res.status(500).json({ error: 'Server error fetching reward points history' });
  }
});

module.exports = router;
