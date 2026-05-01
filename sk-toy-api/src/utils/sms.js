// Thin wrapper around the sms.net.bd HTTP API.
// https://docs.sms.net.bd
//
// Usage:
//   const { sendSms } = require('./sms');
//   await sendSms('+8801XXXXXXXXX', 'Your code is 123456');
//
// Behaviour:
//   • Returns { ok: true, response } on success.
//   • Returns { ok: false, error } on any failure — never throws, so callers
//     can decide whether to surface the error or silently continue.
//   • If SMS_API_KEY is not set, no HTTP call is made — the helper returns
//     { ok: false, error: 'SMS_API_KEY not configured', skipped: true }.
//     The OTP route uses this to fall back to logging in development.

const SMS_API_URL = 'https://api.sms.net.bd/sendsms';

// sms.net.bd expects MSISDN format without the leading "+" (e.g. 8801XXXXXXXXX).
function toMsisdn(phone) {
  return String(phone || '').replace(/^\+/, '').replace(/[^\d]/g, '');
}

async function sendSms(to, msg) {
  const apiKey = process.env.SMS_API_KEY;
  const recipient = toMsisdn(to);

  // Always log what we're about to send (phone + full message body) so it
  // shows up in server logs whether or not a real gateway is configured.
  console.log(`[SMS] → ${to || recipient || '(no number)'} | "${msg}"`);

  if (!apiKey) {
    return { ok: false, error: 'SMS_API_KEY not configured', skipped: true };
  }
  if (!recipient) {
    return { ok: false, error: 'Invalid recipient number' };
  }

  const form = new FormData();
  form.append('api_key', apiKey);
  form.append('msg', msg);
  form.append('to', recipient);

  // Optional sender ID (mask) — only set if env var is provided
  if (process.env.SMS_SENDER_ID) form.append('sender_id', process.env.SMS_SENDER_ID);

  try {
    const res = await fetch(SMS_API_URL, { method: 'POST', body: form });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }

    // sms.net.bd returns { error: 0, msg: "Success", ... } on success;
    // non-zero error codes indicate failures (insufficient balance, bad key, etc.)
    if (!res.ok || (parsed && parsed.error && parsed.error !== 0)) {
      return { ok: false, error: parsed?.msg || `HTTP ${res.status}`, response: parsed };
    }

    return { ok: true, response: parsed };
  } catch (err) {
    return { ok: false, error: err.message || 'Network error' };
  }
}

module.exports = { sendSms };
