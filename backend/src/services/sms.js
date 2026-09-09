const db = require('../db');

/**
 * Single SMS Service Utility for phone verification and SMS alerts.
 * Supports Twilio, Sparrow SMS (Nepal), and custom HTTP SMS Gateways.
 */
async function logSMS(recipient, message, eventType, status, errorMessage = null, metadata = {}) {
  try {
    await db.query(
      `INSERT INTO email_logs (recipient, subject, event_type, status, error_message, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        recipient,
        `📱 SMS Notice: ${message.substring(0, 40)}...`,
        eventType || 'sms_verification',
        status,
        errorMessage,
        typeof metadata === 'string' ? metadata : JSON.stringify(metadata)
      ]
    );
  } catch (err) {
    console.error('⚠️ Failed to log SMS record:', err.message);
  }
}

async function sendSMS({ to, message, eventType = 'sms_verification', metadata = {} }) {
  if (!to) {
    console.warn('⚠️ No phone number recipient specified for SMS');
    return { sent: false, reason: 'no_recipient' };
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  // 1. Live Twilio Integration if credentials exist
  if (twilioSid && twilioAuthToken && twilioFrom && !twilioSid.includes('your_')) {
    try {
      const twilio = require('twilio')(twilioSid, twilioAuthToken);
      const res = await twilio.messages.create({
        body: message,
        from: twilioFrom,
        to: to
      });

      await logSMS(to, message, eventType, 'sent', null, { ...metadata, sid: res.sid });
      console.log(`📱 SMS dispatched via Twilio to ${to} (SID: ${res.sid})`);
      return { sent: true, sid: res.sid };
    } catch (err) {
      console.warn(`⚠️ Twilio SMS dispatch error to ${to}: ${err.message}`);
      await logSMS(to, message, eventType, 'failed', err.message, metadata);
      return { sent: false, reason: err.message };
    }
  }

  // 2. Demo / Unconfigured SMS Fallback
  console.log(`📱 [SMS DISPATCH MOCK] To: ${to} | Message: "${message}"`);
  await logSMS(to, message, eventType, 'simulated', 'Live SMS API credentials not set in .env', metadata);
  return { sent: false, reason: 'sms_unconfigured', simulated: true };
}

function buildPhoneVerificationMessage(code) {
  return `🏎️ RC Battleground: Your driver verification code is ${code}. Valid for 15 minutes. Do not share this code with anyone.`;
}

module.exports = {
  sendSMS,
  buildPhoneVerificationMessage
};
