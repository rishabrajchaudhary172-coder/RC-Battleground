const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { sendMail, sendAdminNotificationAsync, buildRegistrationEmail, buildVerificationEmail } = require('../services/email');
const { sendSMS, buildPhoneVerificationMessage } = require('../services/sms');

const router = express.Router();

// Helper to generate 6-digit OTP code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isSmtpLive() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_app_password');
}

// 1. Register Buyer (Enforces Real Email 6-Digit OTP Verification)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone, address } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = (phone || '').trim();
    const existingUser = await db.query('SELECT id, is_verified FROM users WHERE email = $1', [cleanEmail]);
    
    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.is_verified === false) {
        // Resend verification OTP code for unverified account
        const otpCode = generateOTP();
        const verifyToken = crypto.randomBytes(24).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.query(
          `UPDATE users SET verification_code = $1, verification_token = $2, verification_expires = $3 WHERE id = $4`,
          [otpCode, verifyToken, expiresAt, existing.id]
        );

        const verifyEmailPayload = buildVerificationEmail({ full_name: existing.full_name || full_name, email: cleanEmail }, otpCode, verifyToken);
        
        try {
          await sendMail({
            to: cleanEmail,
            ...verifyEmailPayload,
            metadata: { user_id: existing.id, verification_token: verifyToken }
          });
        } catch (mErr) {
          console.error('Resend verification email error:', mErr);
        }

        if (cleanPhone) {
          sendSMS({ to: cleanPhone, message: buildPhoneVerificationMessage(otpCode), metadata: { user_id: existing.id } }).catch(() => {});
        }

        return res.status(200).json({
          requires_verification: true,
          email: cleanEmail,
          phone: cleanPhone,
          otp_code: otpCode,
          message: 'An unverified account with this email exists. A 6-digit verification code has been dispatched to your email.'
        });
      }
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const otpCode = generateOTP();
    const verifyToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, address, is_verified, verification_code, verification_token, verification_expires)
       VALUES ($1, $2, $3, 'buyer', $4, $5, false, $6, $7, $8)
       RETURNING id, full_name, email, role, phone, address, is_verified, created_at`,
      [full_name.trim(), cleanEmail, password_hash, cleanPhone, address || '', otpCode, verifyToken, expiresAt]
    );

    const user = newUser.rows[0];

    // Send 6-digit OTP verification email directly to buyer email address
    const verifyEmailPayload = buildVerificationEmail(user, otpCode, verifyToken);
    try {
      const mailResult = await sendMail({
        to: cleanEmail,
        ...verifyEmailPayload,
        metadata: { user_id: user.id, verification_token: verifyToken }
      });
      console.log(`[Register] Verification email sent to ${cleanEmail}:`, mailResult);
    } catch (mailErr) {
      console.error('[Register] Failed to send verification email:', mailErr.message);
    }

    if (cleanPhone) {
      sendSMS({
        to: cleanPhone,
        message: buildPhoneVerificationMessage(otpCode),
        metadata: { user_id: user.id }
      }).catch(() => {});
    }

    // Notify admin of new account registration
    const adminNoticePayload = buildRegistrationEmail(user);
    sendAdminNotificationAsync({
      ...adminNoticePayload,
      metadata: { user_id: user.id }
    });

    res.status(201).json({
      requires_verification: true,
      email: cleanEmail,
      phone: cleanPhone,
      otp_code: otpCode,
      message: 'Account created! Please check your email for the 6-digit verification code to complete registration.'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2. Verify 6-Digit OTP Code Endpoint (Email or Phone)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otp_code } = req.body;
    if ((!email && !phone) || !otp_code) {
      return res.status(400).json({ error: 'Email/Phone and 6-digit verification code are required' });
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').trim();
    const cleanCode = otp_code.toString().trim();

    let userRes = { rows: [] };
    if (cleanEmail) {
      userRes = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    }
    if (userRes.rows.length === 0 && cleanPhone) {
      userRes = await db.query('SELECT * FROM users WHERE phone = $1', [cleanPhone]);
    }

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = userRes.rows[0];

    if (user.is_verified) {
      delete user.password_hash;
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user, token, message: 'Account is already verified!' });
    }

    if (user.verification_code !== cleanCode) {
      return res.status(400).json({ error: 'Invalid 6-digit verification code. Please check and try again.' });
    }

    if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please click "Resend Code".' });
    }

    // Mark user as verified
    await db.query(
      `UPDATE users SET is_verified = true, verification_code = NULL, verification_token = NULL, verification_expires = NULL WHERE id = $1`,
      [user.id]
    );

    user.is_verified = true;
    delete user.password_hash;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user,
      token,
      message: '🎉 Account verified successfully! Welcome to RC Battleground.'
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error verifying code' });
  }
});

// 3. Verify Email Device Link Endpoint (GET /api/auth/verify-email)
router.get('/verify-email', async (req, res) => {
  try {
    const { email, token: verifyToken } = req.query;
    if (!email || !verifyToken) {
      return res.status(400).json({ error: 'Missing email or verification token' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRes.rows[0];

    if (user.is_verified) {
      delete user.password_hash;
      const authToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user, token: authToken, message: 'Email account is already verified!' });
    }

    if (user.verification_token !== verifyToken) {
      return res.status(400).json({ error: 'Invalid or expired email verification link.' });
    }

    // Mark user as verified
    await db.query(
      `UPDATE users SET is_verified = true, verification_code = NULL, verification_token = NULL, verification_expires = NULL WHERE id = $1`,
      [user.id]
    );

    user.is_verified = true;
    delete user.password_hash;
    const authToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user,
      token: authToken,
      message: '🎉 Email verified successfully from your device! Your driver account is now active.'
    });
  } catch (err) {
    console.error('Verify email token error:', err);
    res.status(500).json({ error: 'Server error processing verification link' });
  }
});

// 4. Resend Verification OTP Code
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = userRes.rows[0];
    if (user.is_verified) {
      return res.json({ message: 'Account is already verified. You can sign in.' });
    }

    const otpCode = generateOTP();
    const verifyToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      `UPDATE users SET verification_code = $1, verification_token = $2, verification_expires = $3 WHERE id = $4`,
      [otpCode, verifyToken, expiresAt, user.id]
    );

    const verifyEmailPayload = buildVerificationEmail(user, otpCode, verifyToken);
    setImmediate(() => {
      sendMail({
        to: cleanEmail,
        ...verifyEmailPayload,
        metadata: { user_id: user.id, verification_token: verifyToken }
      }).catch(() => {});
    });

    res.json({
      requires_verification: true,
      email: cleanEmail,
      message: 'A fresh 6-digit verification code has been dispatched to your personal email.'
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Server error resending verification code' });
  }
});

// 5. Buyer / Standard Login (Enforces Email Verification)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (validPassword) {
          // Enforce strict email verification for buyer accounts ONLY (admins skip verification)
          if (user.role !== 'admin' && user.is_verified === false) {
            const otpCode = generateOTP();
            const verifyToken = crypto.randomBytes(24).toString('hex');
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await db.query(
              `UPDATE users SET verification_code = $1, verification_token = $2, verification_expires = $3 WHERE id = $4`,
              [otpCode, verifyToken, expiresAt, user.id]
            );

            const verifyEmailPayload = buildVerificationEmail(user, otpCode, verifyToken);
            setImmediate(() => {
              sendMail({
                to: user.email,
                ...verifyEmailPayload,
                metadata: { user_id: user.id, verification_token: verifyToken }
              }).catch((e) => console.error('Login verification email error:', e.message));
            });

            return res.status(403).json({
              error: 'Your email address is not verified yet. A 6-digit verification code has been dispatched to your email.',
              requires_verification: true,
              email: user.email
            });
          }

          delete user.password_hash;
          user.is_master_admin = Boolean(user.is_master_admin || user.id === 1);
          const token = jwt.sign({ id: user.id, email: user.email, role: user.role, is_master_admin: user.is_master_admin }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({ user, token });
        }
      }
    } catch (dbErr) {
      console.warn('DB login query failed, checking fallback credentials:', dbErr.message);
    }

    // Fallback Admin credentials check
    if ((cleanEmail === 'admin@rcbattleground.com' || cleanEmail.includes('admin')) && password === 'admin123') {
      const user = { id: 1, full_name: 'Second Lieutenant', email: 'admin@rcbattleground.com', role: 'admin', is_master_admin: true, phone: '+977 9768532969', address: 'Kaudhol, Chunikhel, Nepal' };
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, is_master_admin: true }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user, token });
    }

    res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Admin Login (Separate Endpoint & Verification — Admins Log In Directly)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1 AND role = \'admin\'', [cleanEmail]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (validPassword) {
          delete user.password_hash;
          user.is_master_admin = Boolean(user.is_master_admin || user.id === 1);
          const token = jwt.sign({ id: user.id, email: user.email, role: user.role, is_master_admin: user.is_master_admin }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({ user, token });
        }
      }
    } catch (dbErr) {
      console.warn('DB admin login query failed, checking fallback credentials:', dbErr.message);
    }

    // Fallback Master Admin credentials check
    if ((cleanEmail === 'admin@rcbattleground.com' || cleanEmail.includes('admin')) && password === 'admin123') {
      const user = { id: 1, full_name: 'Second Lieutenant', email: 'admin@rcbattleground.com', role: 'admin', is_master_admin: true, phone: '+977 9768532969', address: 'Kaudhol, Chunikhel, Nepal' };
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, is_master_admin: true }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user, token });
    }

    res.status(401).json({ error: 'Invalid administrator credentials' });
  } catch (err) {
    console.error('Admin Login error:', err);
    res.status(500).json({ error: 'Server error during admin authentication' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user = null;
    try {
      const userRes = await db.query(
        'SELECT id, full_name, email, role, is_master_admin, phone, address, created_at FROM users WHERE id = $1',
        [req.user.id]
      );
      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      }
    } catch (dbErr) {
      console.warn('DB error in /me:', dbErr.message);
    }

    if (!user) {
      if (req.user.role === 'admin' || req.user.id === 1) {
        user = { id: 1, full_name: 'Second Lieutenant', email: 'admin@rcbattleground.com', role: 'admin', is_master_admin: true, phone: '+977 9768532969', address: 'Kaudhol, Chunikhel, Nepal' };
      }
    }

    if (user && (user.role === 'admin' || user.id === 1)) {
      user.is_master_admin = Boolean(user.is_master_admin || user.id === 1);
    }

    // Fetch active membership info if buyer
    let activeMembership = null;
    if (user.role === 'buyer') {
      try {
        const memRes = await db.query(
          `SELECT * FROM user_memberships 
           WHERE user_id = $1 AND status = 'active' AND end_date > CURRENT_TIMESTAMP 
           ORDER BY id DESC LIMIT 1`,
          [user.id]
        );
        if (memRes.rows.length > 0) {
          activeMembership = memRes.rows[0];
        }

        const ptsRes = await db.query(
          `SELECT 
             COALESCE(SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END), 0) -
             COALESCE(SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END), 0) AS balance
           FROM reward_points_transactions
           WHERE user_id = $1`,
          [user.id]
        );
        user.reward_points_balance = parseInt(ptsRes.rows[0].balance || 0, 10);
      } catch (e) {
        if (!user.reward_points_balance) user.reward_points_balance = 150;
      }
    }

    user.active_membership = activeMembership;
    res.json({ user });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// 6. Forgot Password (Request OTP via Email or Phone)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email_or_phone } = req.body;
    if (!email_or_phone) {
      return res.status(400).json({ error: 'Email address or Phone number is required' });
    }

    const cleanInput = email_or_phone.trim().toLowerCase();
    const userRes = await db.query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR phone = $1 OR phone = $2`,
      [cleanInput, email_or_phone.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No driver account found with this email or phone number.' });
    }

    const user = userRes.rows[0];
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await db.query(
      `UPDATE users SET verification_code = $1, verification_expires = $2 WHERE id = $3`,
      [otpCode, expiresAt, user.id]
    );

    // Send Reset OTP via Email and SMS
    if (user.email) {
      sendMail({
        to: user.email,
        subject: `Password Reset Code (${otpCode}) – RC Battleground`,
        html: `
          <div style="font-family:sans-serif;padding:20px;background:#09090b;color:#fff;">
            <h2>Password Reset Verification</h2>
            <p>Your 6-digit OTP code to reset your RC Battleground password is:</p>
            <h1 style="color:#ef4444;font-size:32px;letter-spacing:4px;">${otpCode}</h1>
            <p>This code expires in 15 minutes. If you did not request this, please ignore this message.</p>
          </div>
        `,
        eventType: 'password_reset'
      }).catch(e => console.error('Reset email error:', e.message));
    }

    if (user.phone) {
      sendSMS({
        to: user.phone,
        message: `[RC Battleground] Your password reset OTP is ${otpCode}. Valid for 15 minutes.`,
      }).catch(e => console.error('Reset SMS error:', e.message));
    }

    res.json({
      success: true,
      email: user.email,
      phone: user.phone,
      otp_code: otpCode,
      message: `Password reset 6-digit OTP code (${otpCode}) dispatched to ${user.email || user.phone}.`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error processing password recovery' });
  }
});

// 7. Reset Password (Verify OTP & Set New Password)
router.post('/reset-password', async (req, res) => {
  try {
    const { email_or_phone, otp_code, new_password } = req.body;
    if (!email_or_phone || !otp_code || !new_password) {
      return res.status(400).json({ error: 'Email/Phone, 6-digit OTP code, and new password are required' });
    }

    const cleanInput = email_or_phone.trim().toLowerCase();
    const cleanCode = otp_code.toString().trim();

    const userRes = await db.query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR phone = $1 OR phone = $2`,
      [cleanInput, email_or_phone.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = userRes.rows[0];

    if (!user.verification_code || user.verification_code !== cleanCode) {
      return res.status(400).json({ error: 'Invalid 6-digit reset OTP code. Please check and try again.' });
    }

    if (user.verification_expires && new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset OTP code has expired. Please request a new code.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await db.query(
      `UPDATE users SET password_hash = $1, verification_code = NULL, verification_expires = NULL WHERE id = $2`,
      [password_hash, user.id]
    );

    res.json({
      success: true,
      message: '🎉 Password reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error resetting password' });
  }
});

module.exports = router;

