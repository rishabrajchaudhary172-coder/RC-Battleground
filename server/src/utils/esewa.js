const crypto = require('crypto');

/**
 * Generate eSewa v2 HMAC-SHA256 Signature (Base64)
 * Standard message format for initiation: total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}
 */
function generateEsewaSignature(totalAmount, transactionUuid, productCode, secretKey) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
}

/**
 * Verify signature from eSewa v2 callback/response payload
 * Uses signed_field_names list provided by eSewa response payload
 */
function verifyEsewaSignature(payload, secretKey) {
  try {
    if (!payload || !payload.signed_field_names || !payload.signature) {
      return false;
    }

    const fieldNames = payload.signed_field_names.split(',');
    const messageParts = fieldNames.map((fieldName) => {
      const val = payload[fieldName] !== undefined && payload[fieldName] !== null ? payload[fieldName] : '';
      return `${fieldName}=${val}`;
    });

    const message = messageParts.join(',');
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

    const signatureBuffer = Buffer.from(payload.signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (err) {
    console.error('Signature verification error:', err.message);
    return false;
  }
}

/**
 * Perform eSewa Transaction Status Check with Retry Support
 */
async function queryEsewaStatus(productCode, totalAmount, transactionUuid, statusUrl, secretKey, maxRetries = 3) {
  const url = `${statusUrl}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(totalAmount)}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;
  
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const text = await response.text();
        if (response.status === 503 || text.includes('Service is currently unavailable')) {
          console.warn(`[eSewa Status Check] Service unavailable (Attempt ${attempt}/${maxRetries}), retrying in 1s...`);
          await new Promise((r) => setTimeout(r, 1000 * attempt));
          continue;
        }
        throw new Error(`eSewa status check returned HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.error(`[eSewa Status Check Error - Attempt ${attempt}/${maxRetries}]:`, err.message);
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  return { success: false, error: lastError ? lastError.message : 'Failed status check after retries' };
}

module.exports = {
  generateEsewaSignature,
  verifyEsewaSignature,
  queryEsewaStatus,
};
