const nodemailer = require('nodemailer');
const db = require('../db');

let transporter = null;

/**
 * Initializes and caches the Nodemailer SMTP transporter using env credentials.
 * Supports Gmail, Outlook, SendGrid, Mailgun, Amazon SES, and custom SMTP servers.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const rawPort = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || pass === 'your_app_password') {
    console.warn('⚠️ Live SMTP credentials not set in .env (SMTP_USER, SMTP_PASS). Emails will log to database.');
    return null;
  }

  if (!transporter) {
    const isGmail = host.toLowerCase().includes('gmail');
    const port = rawPort ? parseInt(rawPort, 10) : 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    transporter = nodemailer.createTransport({
      host: isGmail ? 'smtp.gmail.com' : host,
      port,
      secure,
      auth: { user, pass },
      family: 4, // CRITICAL: Force IPv4 resolution on Render containers to fix IPv6 socket timeout
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return transporter;
}

/**
 * Logs every email attempt into PostgreSQL / in-memory email_logs table.
 */
async function logEmail(recipient, subject, eventType, status, errorMessage = null, metadata = {}) {
  try {
    await db.query(
      `INSERT INTO email_logs (recipient, subject, event_type, status, error_message, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        recipient,
        subject,
        eventType,
        status,
        errorMessage,
        typeof metadata === 'string' ? metadata : JSON.stringify(metadata)
      ]
    );
  } catch (err) {
    console.error('⚠️ Failed to insert record into email_logs:', err.message);
  }
}

/**
 * Single Mail Utility function to send HTML emails asynchronously with automatic retries.
 */
async function sendMail({ to, subject, html, text, eventType = 'general', metadata = {}, retries = 1 }) {
  const recipient = to || process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!recipient) {
    console.warn('⚠️ No email recipient specified — skipping sendMail');
    return { sent: false, reason: 'no_recipient' };
  }

  // 1. HTTP API Direct Delivery (Resend API fallback if RESEND_API_KEY is configured)
  if (process.env.RESEND_API_KEY) {
    try {
      const from = process.env.SMTP_FROM || 'RC Battleground <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject,
          html,
        }),
      });
      const data = await resendRes.json();
      if (resendRes.ok) {
        await logEmail(recipient, subject, eventType, 'sent', null, { ...metadata, messageId: data.id, provider: 'resend' });
        return { sent: true, messageId: data.id };
      }
    } catch (resendErr) {
      console.warn('Resend API failed, falling back to SMTP:', resendErr.message);
    }
  }

  const transport = getTransporter();
  const from = process.env.SMTP_FROM || `"RC Battleground" <${process.env.SMTP_USER || 'admin@rcbattleground.com'}>`;

  const mailOptions = {
    from,
    to: recipient,
    subject,
    html,
    text: text || html.replace(/<[^>]*>?/gm, ''),
  };

  if (!transport) {
    await logEmail(recipient, subject, eventType, 'failed', 'SMTP Credentials Not Configured', metadata);
    return { sent: false, reason: 'smtp_unconfigured' };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    attempt++;
    try {
      const info = await transport.sendMail(mailOptions);
      await logEmail(recipient, subject, eventType, 'sent', null, { ...metadata, messageId: info.messageId, attempt });
      console.log(`📧 Email dispatched successfully to ${recipient} (Subject: "${subject}") [Attempt ${attempt}]`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ SMTP send error (Attempt ${attempt}/${retries + 1}) to ${recipient}: ${err.message}`);
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff delay
      }
    }
  }

  await logEmail(recipient, subject, eventType, 'failed', lastError ? lastError.message : 'Unknown error', metadata);
  return { sent: false, reason: lastError ? lastError.message : 'Send failed' };
}

/**
 * Sends non-blocking notification to ADMIN_NOTIFY_EMAIL
 */
function sendAdminNotificationAsync(payload) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return;

  setImmediate(async () => {
    try {
      await sendMail({
        to: adminEmail,
        ...payload
      });
    } catch (err) {
      console.error('Async admin email notification failed:', err.message);
    }
  });
}

/**
 * Base HTML Template Wrapper
 */
function getHtmlWrapper(headerTitle, bodyHtml) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 20px; }
        .card { max-width: 620px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: #000000; border-bottom: 1px solid #27272a; padding: 24px; text-align: center; }
        .header-logo { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; font-family: monospace; }
        .header-sub { font-size: 11px; font-weight: 700; color: #34d399; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
        .content { padding: 30px; font-size: 14px; line-height: 1.6; color: #d4d4d8; }
        .title { font-size: 18px; font-weight: 900; text-transform: uppercase; color: #ffffff; margin-bottom: 16px; font-family: monospace; letter-spacing: 1px; border-bottom: 1px solid #27272a; padding-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; font-family: monospace; }
        .table th, .table td { padding: 10px 12px; border-bottom: 1px solid #27272a; text-align: left; }
        .table th { background: #09090b; color: #a1a1aa; text-transform: uppercase; font-size: 11px; }
        .badge { display: inline-block; padding: 4px 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; border-radius: 4px; font-family: monospace; }
        .badge-green { background: #064e3b; color: #6ee7b7; border: 1px solid #047857; }
        .badge-amber { background: #451a03; color: #fde047; border: 1px solid #78350f; }
        .badge-blue { background: #1e3a8a; color: #93c5fd; border: 1px solid #1d4ed8; }
        .footer { background: #09090b; border-top: 1px solid #27272a; padding: 16px; text-align: center; font-size: 11px; color: #71717a; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="header-logo">🏎️ RC BATTLEGROUND</div>
          <div class="header-sub">PRECISION RC VEHICLES & TELEMETRY</div>
        </div>
        <div class="content">
          <div class="title">${headerTitle}</div>
          ${bodyHtml}
        </div>
        <div class="footer">
          RC Battleground System Notification • ${new Date().toUTCString()}
        </div>
      </div>
    </body>
    </html>
  `;
}

// ----------------------------------------------------
// Specific HTML Email Builders for Events
// ----------------------------------------------------

/**
 * 1. New Order Placed Email Builder
 */
function buildOrderEmail(order, buyer, items) {
  const nprPrice = order.total_amount_npr ? `Rs. ${parseFloat(order.total_amount_npr).toLocaleString('en-NP', { minimumFractionDigits: 2 })}` : `Rs. ${(parseFloat(order.total_amount) * 133.5).toLocaleString('en-NP', { minimumFractionDigits: 2 })}`;
  const usdPrice = `$${parseFloat(order.total_amount_usd || order.total_amount).toFixed(2)}`;

  const itemRows = (items || []).map((i) => `
    <tr>
      <td style="color:#ffffff;font-weight:bold;">${i.name || i.product_name}</td>
      <td style="text-align:center;">${i.quantity}</td>
      <td style="text-align:right;color:#34d399;">Rs. ${(parseFloat(i.unit_price_npr || i.unit_price * 133.5)).toLocaleString('en-NP', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const html = getHtmlWrapper(
    `🛒 NEW ORDER #${order.order_number}`,
    `
      <p>A new purchase order has been placed on RC Battleground.</p>
      
      <table class="table">
        <tr><th>Order Number</th><td><strong style="color:#fff;">${order.order_number}</strong></td></tr>
        <tr><th>Buyer Name</th><td>${buyer.full_name}</td></tr>
        <tr><th>Buyer Email</th><td>${buyer.email}</td></tr>
        <tr><th>Shipping Address</th><td>${order.shipping_address}</td></tr>
        <tr><th>Payment Method</th><td><span class="badge badge-green">${order.payment_method}</span></td></tr>
        <tr><th>Total Price (NPR)</th><td><strong style="color:#34d399;font-size:16px;">${nprPrice}</strong></td></tr>
        <tr><th>Total Price (USD)</th><td>${usdPrice}</td></tr>
        <tr><th>Points Earned / Redeemed</th><td>+${order.points_earned || 0} PTS / -${order.points_redeemed || 0} PTS</td></tr>
        <tr><th>Timestamp</th><td>${new Date(order.created_at || Date.now()).toLocaleString()}</td></tr>
      </table>

      <div style="margin-top:20px;font-weight:bold;color:#fff;font-family:monospace;font-size:12px;">ORDERED ITEMS (${items?.length || 0})</div>
      <table class="table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    `
  );

  return {
    subject: `🛒 New Order Received – RC Battleground (#${order.order_number})`,
    html,
    eventType: 'new_order'
  };
}

/**
 * 2. Payment Transaction Email Builder
 */
function buildPaymentEmail(paymentTx, buyer) {
  const nprAmount = `Rs. ${parseFloat(paymentTx.amount_npr || 0).toLocaleString('en-NP', { minimumFractionDigits: 2 })}`;
  const usdAmount = `$${parseFloat(paymentTx.amount_usd || 0).toFixed(2)}`;

  const html = getHtmlWrapper(
    `💳 PAYMENT TELEMETRY — ${paymentTx.status.toUpperCase()}`,
    `
      <p>Payment transaction status update recorded.</p>
      <table class="table">
        <tr><th>Transaction Reference</th><td><strong style="color:#fff;">${paymentTx.transaction_ref || paymentTx.id}</strong></td></tr>
        <tr><th>Status</th><td><span class="badge ${paymentTx.status === 'completed' ? 'badge-green' : 'badge-amber'}">${paymentTx.status}</span></td></tr>
        <tr><th>Payment Gateway</th><td>${paymentTx.gateway || 'eSewa / Khalti / Card'}</td></tr>
        <tr><th>Buyer</th><td>${buyer.full_name} (${buyer.email})</td></tr>
        <tr><th>Amount Paid (NPR)</th><td><strong style="color:#34d399;font-size:16px;">${nprAmount}</strong></td></tr>
        <tr><th>Amount Paid (USD)</th><td>${usdAmount}</td></tr>
        <tr><th>Timestamp</th><td>${new Date(paymentTx.created_at || Date.now()).toLocaleString()}</td></tr>
      </table>
    `
  );

  return {
    subject: `💳 Payment Confirmation – RC Battleground`,
    html,
    eventType: 'payment_transaction'
  };
}

/**
 * 3. Membership Purchase Email Builder
 */
function buildMembershipEmail(membership, buyer, plan) {
  const nprPrice = `Rs. ${parseFloat(plan.price_npr || plan.price * 133.5).toLocaleString('en-NP', { minimumFractionDigits: 2 })}`;
  const usdPrice = `$${parseFloat(plan.price_usd || plan.price).toFixed(2)}`;

  const html = getHtmlWrapper(
    `⭐ NEW MEMBERSHIP PURCHASE`,
    `
      <p>Driver <strong>${buyer.full_name}</strong> has subscribed to a membership plan.</p>
      <table class="table">
        <tr><th>Membership Plan</th><td><strong style="color:#fff;font-size:16px;">${plan.plan_name} Tier</strong></td></tr>
        <tr><th>Buyer Name</th><td>${buyer.full_name}</td></tr>
        <tr><th>Buyer Email</th><td>${buyer.email}</td></tr>
        <tr><th>Price (NPR)</th><td><strong style="color:#34d399;">${nprPrice}</strong></td></tr>
        <tr><th>Price (USD)</th><td>${usdPrice}</td></tr>
        <tr><th>Plan Duration</th><td>${plan.duration_days} Days</td></tr>
        <tr><th>Active End Date</th><td>${new Date(membership.end_date).toLocaleDateString()}</td></tr>
      </table>
    `
  );

  return {
    subject: `⭐ New Membership Purchase – RC Battleground`,
    html,
    eventType: 'membership_purchase'
  };
}

/**
 * 4. New Buyer Registration Email Builder
 */
function buildRegistrationEmail(user) {
  const html = getHtmlWrapper(
    `🏎️ NEW BUYER REGISTRATION`,
    `
      <p>A new driver account has registered on RC Battleground.</p>
      <table class="table">
        <tr><th>Driver Name</th><td><strong style="color:#fff;">${user.full_name}</strong></td></tr>
        <tr><th>Email Address</th><td>${user.email}</td></tr>
        <tr><th>Phone</th><td>${user.phone || 'Not provided'}</td></tr>
        <tr><th>Address</th><td>${user.address || 'Not provided'}</td></tr>
        <tr><th>Registration Time</th><td>${new Date(user.created_at || Date.now()).toLocaleString()}</td></tr>
      </table>
    `
  );

  return {
    subject: `🏎️ New Buyer Registration – RC Battleground`,
    html,
    eventType: 'buyer_registration'
  };
}

/**
 * 5. New Product Review Email Builder
 */
function buildReviewEmail(review, product, reviewer) {
  const stars = '⭐'.repeat(parseInt(review.rating || 5, 10));
  const html = getHtmlWrapper(
    `⭐ NEW PRODUCT REVIEW SUBMITTED`,
    `
      <p>A buyer has submitted a new review for <strong>${product.name}</strong>.</p>
      <table class="table">
        <tr><th>Target Product</th><td><strong style="color:#fff;">${product.name}</strong></td></tr>
        <tr><th>Reviewer</th><td>${reviewer.full_name} (${reviewer.email})</td></tr>
        <tr><th>Rating</th><td><span style="font-size:16px;">${stars}</span> (${review.rating} / 5)</td></tr>
        <tr><th>Review Comment</th><td style="font-style:italic;color:#e4e4e7;">"${review.comment}"</td></tr>
        <tr><th>Timestamp</th><td>${new Date(review.created_at || Date.now()).toLocaleString()}</td></tr>
      </table>
    `
  );

  return {
    subject: `⭐ New Product Review Submitted – RC Battleground`,
    html,
    eventType: 'product_review'
  };
}

/**
 * 6. Admin Verification Test Email Builder
 */
function buildTestEmail(targetEmail) {
  const html = getHtmlWrapper(
    `🧪 SMTP VERIFICATION TEST`,
    `
      <p style="color:#34d399;font-weight:bold;">✅ Nodemailer Transporter Connection Successful!</p>
      <p>Your RC Battleground SMTP mail system is fully configured and ready for live order, payment, and membership notifications.</p>
      <table class="table">
        <tr><th>SMTP Host</th><td>${process.env.SMTP_HOST || 'smtp.gmail.com'}</td></tr>
        <tr><th>SMTP Port</th><td>${process.env.SMTP_PORT || '587'}</td></tr>
        <tr><th>Sender Address</th><td>${process.env.SMTP_FROM || process.env.SMTP_USER}</td></tr>
        <tr><th>Target Email</th><td>${targetEmail}</td></tr>
        <tr><th>Test Timestamp</th><td>${new Date().toLocaleString()}</td></tr>
      </table>
    `
  );

  return {
    subject: `🧪 SMTP Verification Test – RC Battleground`,
    html,
    eventType: 'smtp_test'
  };
}

/**
 * 7. Buyer Personal Email Verification Builder (OTP & Device Link)
 */
function buildVerificationEmail(user, code, token) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;

  const html = getHtmlWrapper(
    `🔐 VERIFY YOUR PERSONAL EMAIL ACCOUNT`,
    `
      <p>Welcome to <strong>RC Battleground</strong>, ${user.full_name || 'Driver'}!</p>
      <p>To complete your account creation and verify ownership of this email address on your logged-in device, please use the 6-digit verification code below or click the direct verification button.</p>

      <div style="margin:24px 0;text-align:center;background:#09090b;padding:20px;border:1px solid #27272a;">
        <div style="font-size:11px;color:#a1a1aa;font-family:monospace;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">YOUR 6-DIGIT VERIFICATION CODE</div>
        <div style="font-size:36px;font-weight:900;letter-spacing:10px;color:#34d399;display:inline-block;font-family:monospace;margin:8px 0;">
          ${code}
        </div>
        <div style="font-size:11px;color:#71717a;font-family:monospace;margin-top:4px;">(Expires in 15 minutes)</div>
      </div>

      <div style="text-align:center;margin-top:24px;margin-bottom:12px;">
        <a href="${verifyUrl}" style="background:#ffffff;color:#000000;padding:14px 28px;text-decoration:none;font-weight:900;font-family:monospace;font-size:13px;text-transform:uppercase;display:inline-block;border:1px solid #ffffff;letter-spacing:1px;">
          VERIFY EMAIL ON THIS DEVICE →
        </a>
      </div>
      
      <p style="font-size:11px;color:#71717a;text-align:center;margin-top:16px;">
        If you did not request this verification code, you can safely ignore this email.
      </p>
    `
  );

  return {
    subject: `🔐 Verify Your Personal Email Account – RC Battleground (${code})`,
    html,
    eventType: 'email_verification'
  };
}

module.exports = {
  getTransporter,
  sendMail,
  sendAdminNotificationAsync,
  logEmail,
  buildOrderEmail,
  buildPaymentEmail,
  buildMembershipEmail,
  buildRegistrationEmail,
  buildReviewEmail,
  buildTestEmail,
  buildVerificationEmail,
};
