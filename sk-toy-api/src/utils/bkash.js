const axios = require('axios');

const BASE = process.env.BKASH_BASE_URL;

let _token = null;
let _tokenExpiry = 0;

async function getToken() {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const res = await axios.post(`${BASE}/token/grant`, {
    app_key: process.env.BKASH_APP_KEY,
    app_secret: process.env.BKASH_APP_SECRET,
  }, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: process.env.BKASH_USERNAME,
      password: process.env.BKASH_PASSWORD,
    },
  });

  _token = res.data.id_token;
  // token is valid for 3600s — refresh 60s early
  _tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return _token;
}

function headers(token) {
  return {
    Authorization: token,
    'X-APP-Key': process.env.BKASH_APP_KEY,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

// Create a bKash payment and get the redirect URL
async function createPayment({ amount, orderId, callbackUrl }) {
  const token = await getToken();
  const res = await axios.post(`${BASE}/checkout/create`, {
    mode: '0011',
    payerReference: String(orderId),
    callbackURL: callbackUrl,
    amount: String(amount),
    currency: 'BDT',
    intent: 'sale',
    merchantInvoiceNumber: String(orderId),
  }, { headers: headers(token) });
  return res.data; // { paymentID, bkashURL, statusCode, statusMessage }
}

// Execute a payment after customer completes the bKash flow
async function executePayment(paymentId) {
  const token = await getToken();
  const res = await axios.post(`${BASE}/checkout/execute`, { paymentID: paymentId }, { headers: headers(token) });
  return res.data; // { trxID, paymentID, amount, statusCode, statusMessage }
}

// Query payment status
async function queryPayment(paymentId) {
  const token = await getToken();
  const res = await axios.post(`${BASE}/checkout/payment/status`, { paymentID: paymentId }, { headers: headers(token) });
  return res.data;
}

// Refund a payment
async function refundPayment({ paymentId, trxId, amount, orderId }) {
  const token = await getToken();
  const res = await axios.post(`${BASE}/checkout/payment/refund`, {
    paymentID: paymentId,
    amount:    String(amount),
    trxID:     trxId,
    sku:       String(orderId),
    reason:    'Customer refund',
  }, { headers: headers(token) });
  return res.data;
}

module.exports = { createPayment, executePayment, queryPayment, refundPayment };
