const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getExchangeRate, usdToNpr, DEFAULT_RATE } = require('../services/currency');

const router = express.Router();

// GET exchange rate & site settings (public)
router.get('/', async (_req, res) => {
  try {
    const rate = await getExchangeRate();
    res.json({
      exchange_rate: rate,
      npr_per_usd: rate,
      default_currency: 'USD',
    });
  } catch (err) {
    res.json({ exchange_rate: DEFAULT_RATE, npr_per_usd: DEFAULT_RATE, default_currency: 'USD' });
  }
});

// PUT update exchange rate (Admin)
router.put('/exchange-rate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rate, npr_per_usd } = req.body;
    const newRate = parseFloat(rate || npr_per_usd);

    if (!newRate || newRate <= 0) {
      return res.status(400).json({ error: 'Valid exchange rate required (NPR per 1 USD)' });
    }

    const existing = await db.query(`SELECT key FROM site_settings WHERE key = 'exchange_rate'`);
    let result;

    if (existing.rows.length === 0) {
      result = await db.query(
        `INSERT INTO site_settings (key, value) VALUES ('exchange_rate', $1) RETURNING *`,
        [JSON.stringify({ rate: newRate, npr_per_usd: newRate, updated_by: 'admin' })]
      );
    } else {
      result = await db.query(
        `UPDATE site_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = 'exchange_rate' RETURNING *`,
        [JSON.stringify({ rate: newRate, npr_per_usd: newRate, updated_by: 'admin' })]
      );
    }

    res.json({ message: 'Exchange rate updated', exchange_rate: newRate, settings: result.rows[0] });
  } catch (err) {
    console.error('Update exchange rate error:', err);
    res.status(500).json({ error: 'Server error updating exchange rate' });
  }
});

// GET email notification settings (Admin)
router.get('/email', authenticateToken, requireAdmin, async (_req, res) => {
  res.json({
    smtp_configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    admin_email: process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER || '',
    notifications_enabled: process.env.EMAIL_NOTIFICATIONS !== 'false',
  });
});

module.exports = router;
