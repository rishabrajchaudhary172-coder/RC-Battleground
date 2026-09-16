const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendMail, sendAdminNotificationAsync, buildPaymentEmail } = require('../services/email');
const { getExchangeRate, usdToNpr, nprToUsd, DEFAULT_RATE } = require('../services/currency');

const router = express.Router();

const GATEWAYS = ['esewa'];

const GATEWAY_LABELS = {
  esewa: 'eSewa',
};

// GET available payment gateways
router.get('/gateways', (_req, res) => {
  res.json({
    gateways: GATEWAYS.map((g) => ({ id: g, label: GATEWAY_LABELS[g] })),
  });
});

// POST process payment (simulated gateway — records transaction)
router.post('/process', authenticateToken, async (req, res) => {
  const client = await db.getClient();
  try {
    const { gateway, amount_usd, amount_npr, currency, order_id, membership_purchase_id } = req.body;

    if (!gateway || !GATEWAYS.includes(gateway)) {
      return res.status(400).json({ error: `Invalid gateway. Must be one of: ${GATEWAYS.join(', ')}` });
    }

    const rate = await getExchangeRate();
    const usd = parseFloat(amount_usd || 0);
    const npr = parseFloat(amount_npr || usdToNpr(usd, rate));
    const finalUsd = amount_usd ? usd : nprToUsd(npr, rate);

    if (finalUsd <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const transactionRef = `${gateway.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO payment_transactions
         (user_id, order_id, membership_purchase_id, gateway, amount_npr, amount_usd, currency, status, transaction_ref, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', $8, $9)
       RETURNING *`,
      [
        req.user.id,
        order_id || null,
        membership_purchase_id || null,
        gateway,
        npr,
        finalUsd,
        currency || 'USD',
        transactionRef,
        JSON.stringify({ processed_at: new Date().toISOString(), gateway_label: GATEWAY_LABELS[gateway] }),
      ]
    );

    await client.query('COMMIT');

    // Send async payment emails (non-blocking)
    const buyerRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const buyer = buyerRes.rows[0] || req.user;
    const emailPayload = buildPaymentEmail(result.rows[0], buyer);

    sendAdminNotificationAsync({
      ...emailPayload,
      metadata: { transaction_id: result.rows[0].id, gateway }
    });

    if (buyer.email) {
      setImmediate(() => {
        sendMail({
          to: buyer.email,
          ...emailPayload,
          metadata: { transaction_id: result.rows[0].id }
        }).catch(() => {});
      });
    }

    res.status(201).json({
      message: 'Payment processed successfully',
      transaction: result.rows[0],
      transaction_ref: transactionRef,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payment process error:', err);
    res.status(500).json({ error: 'Server error processing payment' });
  } finally {
    client.release();
  }
});

// GET payment transactions (Admin)
router.get('/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, gateway } = req.query;
    let query = `
      SELECT pt.*, COALESCE(pt.payment_screenshot, o.payment_screenshot) AS payment_screenshot, o.order_number, u.full_name AS buyer_name, u.email AS buyer_email
      FROM payment_transactions pt
      LEFT JOIN orders o ON pt.order_id = o.id
      LEFT JOIN users u ON pt.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND pt.status = $${params.length}`;
    }
    if (gateway) {
      params.push(gateway);
      query += ` AND pt.gateway = $${params.length}`;
    }

    query += ' ORDER BY pt.created_at DESC LIMIT 200';

    const result = await db.query(query, params);
    res.json({ transactions: result.rows });
  } catch (err) {
    console.error('Fetch transactions error:', err);
    res.status(500).json({ error: 'Server error fetching payment transactions' });
  }
});

// GET email logs (Admin)
router.get('/email-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 100'
    );
    res.json({ logs: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching email logs' });
  }
});

module.exports = router;
