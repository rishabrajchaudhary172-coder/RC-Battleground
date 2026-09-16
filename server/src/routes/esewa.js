const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { getExchangeRate, usdToNpr, nprToUsd } = require('../services/currency');
const { sendMail, sendAdminNotificationAsync, buildOrderEmail } = require('../services/email');
const { generateEsewaSignature, verifyEsewaSignature, queryEsewaStatus } = require('../utils/esewa');

const router = express.Router();

const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q(';
const ESEWA_FORM_URL = process.env.ESEWA_FORM_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_STATUS_URL = process.env.ESEWA_STATUS_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || 'http://localhost:3000/payment/esewa/success';
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/payment/esewa/failure';

/**
 * 1. INITIATE PAYMENT
 * POST /payment/esewa/initiate
 */
router.post('/initiate', authenticateToken, async (req, res) => {
  const client = await db.getClient();
  try {
    const { items, shipping_address, points_to_redeem, currency } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!shipping_address || !shipping_address.trim()) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    await client.query('BEGIN');

    // 1. Fetch current reward settings
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

    // 2. User Reward Points Balance check
    let availablePoints = 0;
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

      const rawPriceUsd = parseFloat(product.price_usd || 0) || parseFloat(product.price || 0) || parseFloat(item.price || 0);
      const unitPriceNpr = parseFloat(product.price_npr || 0) || usdToNpr(rawPriceUsd, exchangeRate);
      subtotalUsd += rawPriceUsd * qty;
      subtotalNpr += unitPriceNpr * qty;
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        quantity: qty,
        unit_price: rawPriceUsd,
        unit_price_usd: rawPriceUsd,
        unit_price_npr: unitPriceNpr,
      });
    }

    let discountUsd = requestedPointsRedeem * dollarsPerPoint;
    if (discountUsd > subtotalUsd) discountUsd = subtotalUsd;
    const discountNpr = discountUsd * exchangeRate;

    const finalTotalUsd = Math.max(0, subtotalUsd - discountUsd);
    const finalTotalNpr = Math.max(0, subtotalNpr - discountNpr);

    // 4. Membership Points Multiplier
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
      console.warn('Membership multiplier query fallback:', memErr.message);
    }

    const pointsEarned = Math.floor(finalTotalUsd * pointsPerDollar * membershipMultiplier);

    // 5. Generate unique IDs
    const orderNumber = `RC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transactionUuid = `ORD-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 6. Insert Order
    const orderRes = await client.query(
      `INSERT INTO orders 
         (user_id, order_number, transaction_uuid, total_amount, total_amount_npr, total_amount_usd, currency, discount_amount, points_redeemed, points_earned, status, shipping_address, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11, 'eSewa')
       RETURNING *`,
      [
        req.user.id,
        orderNumber,
        transactionUuid,
        finalTotalUsd,
        finalTotalNpr,
        finalTotalUsd,
        currency || 'NPR',
        discountUsd,
        requestedPointsRedeem,
        pointsEarned,
        shipping_address.trim()
      ]
    );
    const order = orderRes.rows[0];

    // 7. Insert Order Items & Deduct Stock
    for (const vItem of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, unit_price_usd, unit_price_npr)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, vItem.product_id, vItem.quantity, vItem.unit_price, vItem.unit_price_usd, vItem.unit_price_npr]
      );

      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [vItem.quantity, vItem.product_id]
      );
    }

    // 8. Calculate eSewa v2 Amounts & Signature
    const amountVal = Math.round(finalTotalNpr * 100) / 100;
    const taxAmountVal = 0;
    const serviceChargeVal = 0;
    const deliveryChargeVal = 0;
    const totalAmountVal = amountVal + taxAmountVal + serviceChargeVal + deliveryChargeVal;

    const amountStr = amountVal.toFixed(2).replace(/\.00$/, '');
    const taxAmountStr = taxAmountVal.toString();
    const serviceChargeStr = serviceChargeVal.toString();
    const deliveryChargeStr = deliveryChargeVal.toString();
    const totalAmountStr = totalAmountVal.toFixed(2).replace(/\.00$/, '');

    const signature = generateEsewaSignature(totalAmountStr, transactionUuid, ESEWA_PRODUCT_CODE, ESEWA_SECRET_KEY);

    // 9. Record Payment Transaction Audit Log
    const txnRef = `ESEWA-${Date.now()}`;
    await client.query(
      `INSERT INTO payment_transactions
         (user_id, order_id, gateway, transaction_uuid, amount_npr, amount_usd, currency, status, transaction_ref, metadata)
       VALUES ($1, $2, 'esewa', $3, $4, $5, 'NPR', 'pending', $6, $7)`,
      [
        req.user.id,
        order.id,
        transactionUuid,
        totalAmountVal,
        finalTotalUsd,
        txnRef,
        JSON.stringify({
          initiated_at: new Date().toISOString(),
          product_code: ESEWA_PRODUCT_CODE,
          order_number: orderNumber
        })
      ]
    );

    await client.query('COMMIT');

    console.log(`[eSewa Initiate] Created order #${orderNumber} (${transactionUuid}) for NPR ${totalAmountStr}`);

    res.status(201).json({
      message: 'eSewa payment initiated successfully',
      esewa_form_url: ESEWA_FORM_URL,
      params: {
        amount: amountStr,
        tax_amount: taxAmountStr,
        total_amount: totalAmountStr,
        transaction_uuid: transactionUuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: serviceChargeStr,
        product_delivery_charge: deliveryChargeStr,
        success_url: ESEWA_SUCCESS_URL,
        failure_url: ESEWA_FAILURE_URL,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature
      },
      order: {
        ...order,
        items: validatedItems
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('eSewa initiate payment error:', err);
    res.status(500).json({ error: 'Server error initiating eSewa payment' });
  } finally {
    client.release();
  }
});

/**
 * Helper to process order completion after verified payment
 */
async function processOrderCompletion(client, orderId, transactionUuid, refId, decodedPayload) {
  // Update order status to paid
  const orderRes = await client.query(
    `UPDATE orders SET status = 'paid' WHERE id = $1 RETURNING *`,
    [orderId]
  );
  const order = orderRes.rows[0];
  if (!order) return null;

  // Update payment transaction record
  await client.query(
    `UPDATE payment_transactions
     SET status = 'completed', ref_id = $1, verified = true, raw_response = $2
     WHERE order_id = $3 OR transaction_uuid = $4`,
    [refId, JSON.stringify(decodedPayload), orderId, transactionUuid]
  );

  // Handle reward points transactions
  try {
    if (order.points_redeemed > 0) {
      await client.query(
        `INSERT INTO reward_points_transactions (user_id, type, points, description)
         VALUES ($1, 'redeemed', $2, $3)`,
        [order.user_id, order.points_redeemed, `Redeemed on Order #${order.order_number}`]
      );
    }
    if (order.points_earned > 0) {
      await client.query(
        `INSERT INTO reward_points_transactions (user_id, type, points, description)
         VALUES ($1, 'earned', $2, $3)`,
        [order.user_id, order.points_earned, `Earned from eSewa Order #${order.order_number}`]
      );
    }
  } catch (ptsErr) {
    console.warn('Reward points insertion fallback:', ptsErr.message);
  }

  // Fetch buyer details & items for notifications
  const buyerRes = await client.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
  const buyer = buyerRes.rows[0];

  const itemsRes = await client.query(
    `SELECT oi.*, p.name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`,
    [order.id]
  );
  const validatedItems = itemsRes.rows.map((i) => ({
    name: i.name || 'RC Vehicle',
    quantity: i.quantity,
    unit_price: parseFloat(i.unit_price)
  }));

  const emailPayload = buildOrderEmail(order, buyer || { full_name: 'Buyer', email: '' }, validatedItems);

  // Send admin notification
  sendAdminNotificationAsync({
    ...emailPayload,
    subject: `⚡ eSewa Payment Received: Order #${order.order_number} (Ref: ${refId})`,
    metadata: { order_id: order.id, transaction_uuid: transactionUuid, ref_id: refId }
  });

  // Send buyer confirmation email
  if (buyer && buyer.email) {
    setTimeout(() => {
      sendMail({
        to: buyer.email,
        ...emailPayload,
        metadata: { order_id: order.id }
      }).catch((e) => console.error('Buyer order email error:', e.message));
    }, 300);
  }

  return order;
}

/**
 * 2. HANDLE SUCCESS REDIRECT RESPONSE
 * GET /payment/esewa/success
 */
router.get('/success', async (req, res) => {
  const { data } = req.query;

  if (!data) {
    console.warn('[eSewa Success Route] No data parameter received');
    return res.redirect(`${ESEWA_FAILURE_URL}?error=no_data`);
  }

  let decodedJson = null;
  try {
    const jsonStr = Buffer.from(data, 'base64').toString('utf-8');
    decodedJson = JSON.parse(jsonStr);
  } catch (err) {
    console.error('[eSewa Success Route] Failed to decode Base64 payload:', err.message);
    return res.redirect(`${ESEWA_FAILURE_URL}?error=invalid_payload`);
  }

  const { transaction_code, status, total_amount, transaction_uuid, product_code, signed_field_names, signature } = decodedJson;
  console.log(`[eSewa Redirect] Received response for ${transaction_uuid} with status ${status}`);

  // Signature verification to prevent tampering
  const isValidSignature = verifyEsewaSignature(decodedJson, ESEWA_SECRET_KEY);
  if (!isValidSignature) {
    console.error(`[eSewa Security Alert] Signature verification failed for ${transaction_uuid}!`);
    await db.query(
      `UPDATE payment_transactions SET status = 'failed', verified = false, raw_response = $1 WHERE transaction_uuid = $2`,
      [JSON.stringify(decodedJson), transaction_uuid]
    );
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(400).json({ error: 'Tampered payment payload or invalid signature' });
    }
    return res.redirect(`${ESEWA_FAILURE_URL}?error=signature_mismatch&uuid=${transaction_uuid}`);
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Retrieve order by transaction_uuid
    const orderRes = await client.query('SELECT * FROM orders WHERE transaction_uuid = $1', [transaction_uuid]);
    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error(`[eSewa Success] Order with transaction_uuid ${transaction_uuid} not found!`);
      return res.redirect(`${ESEWA_FAILURE_URL}?error=order_not_found`);
    }

    const order = orderRes.rows[0];

    if (status === 'COMPLETE') {
      if (order.status !== 'paid') {
        await processOrderCompletion(client, order.id, transaction_uuid, transaction_code, decodedJson);
      }
      await client.query('COMMIT');

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ message: 'Payment verified and order completed', order_id: order.id, transaction_code });
      }
      return res.redirect(`http://localhost:3000/payment/esewa/success?status=COMPLETE&transaction_uuid=${transaction_uuid}&ref_id=${transaction_code}&order_number=${order.order_number}`);
    } else {
      await client.query(
        `UPDATE orders SET status = 'failed' WHERE id = $1`,
        [order.id]
      );
      await client.query(
        `UPDATE payment_transactions SET status = 'failed', raw_response = $1 WHERE transaction_uuid = $2`,
        [JSON.stringify(decodedJson), transaction_uuid]
      );
      await client.query('COMMIT');

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({ error: `Payment incomplete with status: ${status}` });
      }
      return res.redirect(`http://localhost:3000/payment/esewa/failure?status=${status}&transaction_uuid=${transaction_uuid}`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('eSewa success route error:', err);
    return res.redirect(`${ESEWA_FAILURE_URL}?error=server_error`);
  } finally {
    client.release();
  }
});

/**
 * 3. HANDLE FAILURE REDIRECT RESPONSE
 * GET /payment/esewa/failure
 */
router.get('/failure', async (req, res) => {
  const { data, uuid } = req.query;
  let transactionUuid = uuid;

  if (data) {
    try {
      const jsonStr = Buffer.from(data, 'base64').toString('utf-8');
      const decoded = JSON.parse(jsonStr);
      transactionUuid = decoded.transaction_uuid || transactionUuid;
    } catch (e) {}
  }

  if (transactionUuid) {
    try {
      // Mark order as cancelled/failed and restore product stock
      const orderRes = await db.query('SELECT * FROM orders WHERE transaction_uuid = $1', [transactionUuid]);
      if (orderRes.rows.length > 0) {
        const order = orderRes.rows[0];
        if (order.status !== 'cancelled' && order.status !== 'paid') {
          await db.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [order.id]);
          await db.query(`UPDATE payment_transactions SET status = 'failed' WHERE transaction_uuid = $1`, [transactionUuid]);

          // Restore product stock
          const itemsRes = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [order.id]);
          for (const item of itemsRes.rows) {
            await db.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
          }
        }
      }
    } catch (err) {
      console.error('Restore stock on eSewa failure error:', err.message);
    }
  }

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(400).json({ error: 'Payment failed or was cancelled by user', transaction_uuid: transactionUuid });
  }

  return res.redirect(`http://localhost:3000/payment/esewa/failure?status=CANCELED${transactionUuid ? `&transaction_uuid=${transactionUuid}` : ''}`);
});

/**
 * 4. STATUS CHECK API (fallback / reconciliation)
 * GET /payment/esewa/status/:transactionUuid
 */
router.get('/status/:transactionUuid', async (req, res) => {
  const { transactionUuid } = req.params;

  try {
    // 1. Fetch transaction/order record from database
    const txnRes = await db.query('SELECT * FROM payment_transactions WHERE transaction_uuid = $1', [transactionUuid]);
    const orderRes = await db.query('SELECT * FROM orders WHERE transaction_uuid = $1', [transactionUuid]);

    if (txnRes.rows.length === 0 && orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction or order record not found' });
    }

    const txn = txnRes.rows[0];
    const order = orderRes.rows[0];
    const amountNpr = txn ? txn.amount_npr : (order ? order.total_amount_npr : 0);

    const amountVal = Math.round(parseFloat(amountNpr) * 100) / 100;
    const amountStr = amountVal.toFixed(2).replace(/\.00$/, '');

    // 2. Query eSewa Status API with retry
    const statusResult = await queryEsewaStatus(
      ESEWA_PRODUCT_CODE,
      amountStr,
      transactionUuid,
      ESEWA_STATUS_URL,
      ESEWA_SECRET_KEY
    );

    if (!statusResult.success) {
      return res.status(502).json({
        error: 'Failed to communicate with eSewa status service after retries',
        details: statusResult.error,
        local_order_status: order ? order.status : 'unknown'
      });
    }

    const esewaData = statusResult.data;
    const esewaStatus = (esewaData.status || '').toUpperCase();
    const refId = esewaData.ref_id || esewaData.transaction_code || null;

    console.log(`[eSewa Status Query] eSewa returned status "${esewaStatus}" for ${transactionUuid}`);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      if (esewaStatus === 'COMPLETE') {
        if (order && order.status !== 'paid') {
          await processOrderCompletion(client, order.id, transactionUuid, refId, esewaData);
        }
      } else if (esewaStatus === 'PENDING') {
        // Keep order pending
      } else if (esewaStatus === 'FULL_REFUND' || esewaStatus === 'PARTIAL_REFUND') {
        if (order) await client.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [order.id]);
        if (txn) await client.query(`UPDATE payment_transactions SET status = 'refunded', raw_response = $1 WHERE id = $2`, [JSON.stringify(esewaData), txn.id]);
      } else if (esewaStatus === 'AMBIGUOUS') {
        if (order) await client.query(`UPDATE orders SET status = 'ambiguous' WHERE id = $1`, [order.id]);
        if (txn) await client.query(`UPDATE payment_transactions SET status = 'ambiguous', raw_response = $1 WHERE id = $2`, [JSON.stringify(esewaData), txn.id]);
      } else if (esewaStatus === 'NOT_FOUND' || esewaStatus === 'CANCELED') {
        if (order && order.status !== 'paid') {
          await client.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [order.id]);
          if (txn) await client.query(`UPDATE payment_transactions SET status = 'failed', raw_response = $1 WHERE id = $2`, [JSON.stringify(esewaData), txn.id]);
        }
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      console.error('Status check DB update error:', dbErr);
    } finally {
      client.release();
    }

    res.json({
      transaction_uuid: transactionUuid,
      esewa_status: esewaStatus,
      ref_id: refId,
      esewa_response: esewaData,
    });

  } catch (err) {
    console.error('eSewa status check error:', err);
    res.status(500).json({ error: 'Server error executing status check' });
  }
});

module.exports = router;
