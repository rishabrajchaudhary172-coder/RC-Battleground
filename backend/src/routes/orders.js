const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getExchangeRate, usdToNpr } = require('../services/currency');
const { sendMail, sendAdminNotificationAsync, buildOrderEmail } = require('../services/email');

const router = express.Router();

// POST Checkout / Create Order Booking (Buyer)
router.post('/checkout', authenticateToken, async (req, res) => {
  const client = await db.getClient();
  try {
    const { items, shipping_address, payment_method, payment_screenshot, payment_ref, points_to_redeem, currency } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!shipping_address || !shipping_address.trim()) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }
    if (!payment_screenshot) {
      return res.status(400).json({ error: 'Please upload your Fonepay QR payment screenshot as proof of payment to complete your booking.' });
    }

    await client.query('BEGIN');

    // 1. Fetch current reward rates
    let rewardSettings = { points_per_dollar_spent: 1.00, dollars_per_point_redeemed: 0.05 };
    try {
      const rewardSettingsRes = await client.query('SELECT * FROM reward_settings LIMIT 1');
      if (rewardSettingsRes.rows.length > 0) {
        rewardSettings = rewardSettingsRes.rows[0];
      }
    } catch (rsErr) {
      console.warn('Reward settings fallback:', rsErr.message);
    }
    const pointsPerDollar = parseFloat(rewardSettings.points_per_dollar_spent);
    const dollarsPerPoint = parseFloat(rewardSettings.dollars_per_point_redeemed);

    // 2. Fetch user's current points balance
    let availablePoints = 350;
    try {
      const ptsRes = await client.query(
        `SELECT 
           COALESCE(SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END), 0) -
           COALESCE(SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END), 0) AS balance
         FROM reward_points_transactions
         WHERE user_id = $1`,
        [req.user.id]
      );
      if (ptsRes.rows.length > 0 && ptsRes.rows[0].balance !== null) {
        availablePoints = parseInt(ptsRes.rows[0].balance || 0, 10);
      }
    } catch (ptsErr) {
      console.warn('Points balance fallback:', ptsErr.message);
    }

    const requestedPointsRedeem = parseInt(points_to_redeem || 0, 10);
    if (requestedPointsRedeem > availablePoints) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Cannot redeem ${requestedPointsRedeem} points. Available balance is ${availablePoints} points.` });
    }

    const exchangeRate = await getExchangeRate();

    // 3. Calculate order subtotal and verify product stock
    let subtotalUsd = 0;
    let subtotalNpr = 0;
    const validatedItems = [];

    for (const item of items) {
      const prodRes = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Product ID ${item.product_id} not found` });
      }

      const product = prodRes.rows[0];
      const qty = parseInt(item.quantity || 1, 10);
      if (product.stock < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for "${product.name}". Remaining stock: ${product.stock}` });
      }

      const rawPrice = parseFloat(product.price_usd || 0) || parseFloat(product.price || 0) || parseFloat(item.price || 0);
      const unitPriceUsd = rawPrice;
      const unitPriceNpr = parseFloat(product.price_npr || 0) || usdToNpr(unitPriceUsd, exchangeRate);
      subtotalUsd += unitPriceUsd * qty;
      subtotalNpr += unitPriceNpr * qty;
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        description: product.description || '',
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80',
        quantity: qty,
        unit_price: unitPriceUsd,
        unit_price_usd: unitPriceUsd,
        unit_price_npr: unitPriceNpr,
      });
    }

    let discountAmount = requestedPointsRedeem * dollarsPerPoint;
    if (discountAmount > subtotalUsd) {
      discountAmount = subtotalUsd;
    }
    const finalTotalUsd = Math.max(0, subtotalUsd - discountAmount);
    const finalTotalNpr = Math.max(0, subtotalNpr - (discountAmount * exchangeRate));

    // 5. Calculate reward points earned based on membership
    let membershipMultiplier = 1.0;
    try {
      const memRes = await client.query(
        `SELECT um.*
         FROM user_memberships um
         WHERE um.user_id = $1 AND um.status = 'active' AND um.end_date > CURRENT_TIMESTAMP
         LIMIT 1`,
        [req.user.id]
      );
      if (memRes.rows.length > 0) {
        const planName = (memRes.rows[0].plan_name || '').toLowerCase();
        if (planName.includes('elite') || planName.includes('apex')) membershipMultiplier = 2.0;
        else if (planName.includes('pro')) membershipMultiplier = 1.5;
      }
    } catch (memErr) {
      console.warn('Membership query fallback:', memErr.message);
    }

    const pointsEarned = Math.floor(finalTotalUsd * pointsPerDollar * membershipMultiplier);

    // 6. Generate unique order number and save static receipt screenshot file if base64
    const orderNumber = `RC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPaymentMethod = payment_method || 'QR Code (Fonepay / Sanima Bank)';

    let finalScreenshotUrl = payment_screenshot;
    if (payment_screenshot && payment_screenshot.startsWith('data:image/')) {
      try {
        const matches = payment_screenshot.match(/^data:image\/([a-zA-Z0-9+\-]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const fname = `receipt-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}.${ext}`;
          const uploadsDir = path.join(__dirname, '../../uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          fs.writeFileSync(path.join(uploadsDir, fname), buffer);
          finalScreenshotUrl = `/uploads/${fname}`;
        }
      } catch (saveImgErr) {
        console.warn('Screenshot file save fallback:', saveImgErr.message);
      }
    }

    // 7. Insert Order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, total_amount_npr, total_amount_usd, currency, discount_amount, points_redeemed, points_earned, status, shipping_address, payment_method, payment_screenshot, payment_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12, $13) RETURNING *`,
      [
        req.user.id,
        orderNumber,
        finalTotalUsd,
        finalTotalNpr,
        finalTotalUsd,
        currency || 'NPR',
        discountAmount,
        requestedPointsRedeem,
        pointsEarned,
        shipping_address.trim(),
        finalPaymentMethod,
        finalScreenshotUrl,
        payment_ref || null
      ]
    );
    const order = orderRes.rows[0];

    // 8. Insert Order Items & Deduct Product Stock Immediately
    for (const vItem of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, unit_price_usd, unit_price_npr)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, vItem.product_id, vItem.quantity, vItem.unit_price, vItem.unit_price_usd, vItem.unit_price_npr]
      );

      // Decrease stock count immediately upon order booking
      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [vItem.quantity, vItem.product_id]
      );
    }

    // 9. Handle Reward Points Transactions
    try {
      if (requestedPointsRedeem > 0) {
        await client.query(
          `INSERT INTO reward_points_transactions (user_id, type, points, description)
           VALUES ($1, 'redeemed', $2, $3)`,
          [req.user.id, requestedPointsRedeem, `Redeemed on Order #${orderNumber}`]
        );
      }

      if (pointsEarned > 0) {
        await client.query(
          `INSERT INTO reward_points_transactions (user_id, type, points, description)
           VALUES ($1, 'earned', $2, $3)`,
          [req.user.id, pointsEarned, `Earned from Order #${orderNumber}`]
        );
      }
    } catch (ptsTxErr) {
      console.warn('Points transaction logging fallback:', ptsTxErr.message);
    }

    // 10. Commit Main Order Transaction Immediately
    await client.query('COMMIT');

    // 11. Record Fonepay QR Payment Transaction
    try {
      const txnRef = payment_ref || `FONEPAY-${Date.now()}`;
      await db.query(
        `INSERT INTO payment_transactions (user_id, order_id, gateway, amount_npr, amount_usd, currency, status, transaction_ref, payment_screenshot, metadata)
         VALUES ($1, $2, 'fonepay_qr', $3, $4, $5, 'pending_verification', $6, $7, $8)`,
        [
          req.user.id,
          order.id,
          finalTotalNpr,
          finalTotalUsd,
          'NPR',
          txnRef,
          payment_screenshot,
          JSON.stringify({
            payment_method: finalPaymentMethod,
            payment_ref: payment_ref || null,
            screenshot_attached: true
          })
        ]
      );
    } catch (payTxErr) {
      console.warn('Payment transaction logging fallback:', payTxErr.message);
    }

    // 11. Send admin & buyer email notifications with payment screenshot info
    const buyerRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const buyer = buyerRes.rows[0] || req.user;
    const emailPayload = buildOrderEmail(order, buyer, validatedItems);

    // Send Admin Notification
    sendAdminNotificationAsync({
      ...emailPayload,
      subject: `⚡ New QR Payment Booking: Order #${orderNumber} (${buyer.full_name})`,
      metadata: { order_id: order.id, order_number: orderNumber, payment_screenshot, payment_ref }
    });

    if (buyer.email) {
      setTimeout(() => {
        sendMail({
          to: buyer.email,
          ...emailPayload,
          metadata: { order_id: order.id }
        }).catch((e) => console.error('Buyer order email error:', e.message));
      }, 500);
    }

    res.status(201).json({
      message: 'Booking completed successfully! Your payment screenshot has been submitted for admin verification.',
      order: {
        ...order,
        payment_screenshot,
        payment_ref,
        items: validatedItems
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Server error processing order checkout' });
  } finally {
    client.release();
  }
});

// GET My Orders (Buyer)
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const ordersRes = await db.query(
      `SELECT o.*,
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'item_id', oi.id,
             'product_id', oi.product_id,
             'name', p.name,
             'image', p.images[1],
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
      [req.user.id]
    );

    const orders = ordersRes.rows.map(o => ({
      ...o,
      total_amount: parseFloat(o.total_amount),
      discount_amount: parseFloat(o.discount_amount)
    }));

    res.json({ orders });
  } catch (err) {
    console.error('Fetch my orders error:', err);
    res.status(500).json({ error: 'Server error fetching your order history' });
  }
});

// GET All Orders / Bookings (Admin Only)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let queryText = `
      SELECT o.*, u.full_name AS buyer_name, u.email AS buyer_email,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'item_id', oi.id,
            'product_id', oi.product_id,
            'name', p.name,
            'description', p.description,
            'image', p.images[1],
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'unit_price_usd', oi.unit_price_usd,
            'unit_price_npr', oi.unit_price_npr
          )
        ) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE 1=1
    `;
    const queryParams = [];

    if (status) {
      queryParams.push(status);
      queryText += ` AND o.status = $${queryParams.length}`;
    }

    queryText += ` GROUP BY o.id, u.full_name, u.email ORDER BY o.created_at DESC`;

    const result = await db.query(queryText, queryParams);
    const orders = result.rows.map(o => ({
      ...o,
      total_amount: parseFloat(o.total_amount),
      discount_amount: parseFloat(o.discount_amount)
    }));

    res.json({ orders });
  } catch (err) {
    console.error('Admin fetch orders error:', err);
    res.status(500).json({ error: 'Server error fetching order bookings' });
  }
});

// PUT Update Order Status (Admin Only - pending, shipped, delivered, cancelled)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const existingRes = await db.query('SELECT status FROM orders WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = existingRes.rows[0].status;
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      try {
        const itemsRes = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
        for (const item of itemsRes.rows) {
          await db.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
        }
      } catch (stockErr) {
        console.warn('Restore stock on order cancel error:', stockErr.message);
      }
    }

    const result = await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: `Order #${result.rows[0].order_number} status updated to ${status}`, order: result.rows[0] });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error updating order status' });
  }
});

module.exports = router;
