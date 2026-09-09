const db = require('../db');

const DEFAULT_RATE = 133.50; // NPR per 1 USD

async function getExchangeRate() {
  try {
    const res = await db.query(
      `SELECT value FROM site_settings WHERE key = 'exchange_rate' LIMIT 1`
    );
    if (res.rows.length > 0) {
      const val = res.rows[0].value;
      return parseFloat(val.rate || val.npr_per_usd || DEFAULT_RATE);
    }
  } catch (_) {}
  return DEFAULT_RATE;
}

function usdToNpr(usd, rate) {
  return Math.round(parseFloat(usd) * rate * 100) / 100;
}

function nprToUsd(npr, rate) {
  return Math.round((parseFloat(npr) / rate) * 100) / 100;
}

function formatDualPrice(usd, npr, currency = 'USD') {
  const u = parseFloat(usd);
  const n = parseFloat(npr);
  if (currency === 'NPR') {
    return { primary: `Rs. ${n.toLocaleString('en-NP', { minimumFractionDigits: 2 })}`, secondary: `$${u.toFixed(2)}`, npr: n, usd: u };
  }
  return { primary: `$${u.toFixed(2)}`, secondary: `Rs. ${n.toLocaleString('en-NP', { minimumFractionDigits: 2 })}`, npr: n, usd: u };
}

module.exports = { getExchangeRate, usdToNpr, nprToUsd, formatDualPrice, DEFAULT_RATE };
