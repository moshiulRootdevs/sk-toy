const router = require('express').Router();
const Order = require('../models/Order');
const { adminAuth } = require('../middleware/auth');
const bkash = require('../utils/bkash');

// ── bKash payment flow ───────────────────────────────────────────────────

// POST /api/payments/bkash/create — called after order is placed (COD-pending with bkash method)
router.post('/bkash/create', async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.paymentStatus === 'paid') return res.status(400).json({ message: 'Already paid' });

  const callbackUrl = `${process.env.API_BASE_URL}/api/payments/bkash/callback?orderId=${orderId}`;
  try {
    const data = await bkash.createPayment({
      amount:      order.total,
      orderId:     order.orderNo,
      callbackUrl,
    });
    if (data.statusCode !== '0000') {
      return res.status(400).json({ message: data.statusMessage || 'bKash payment creation failed' });
    }
    // Save paymentID on order
    await Order.findByIdAndUpdate(orderId, { bkashPaymentId: data.paymentID });
    res.json({ bkashURL: data.bkashURL, paymentID: data.paymentID });
  } catch (err) {
    console.error('bKash create error:', err.response?.data || err.message);
    res.status(502).json({ message: 'bKash service unavailable' });
  }
});

// GET /api/payments/bkash/callback — bKash redirects here after customer pays
router.get('/bkash/callback', async (req, res) => {
  const { orderId, paymentID, status } = req.query;
  const frontendBase = process.env.CLIENT_URL || 'http://localhost:3000';

  if (status === 'cancel' || status === 'failure') {
    return res.redirect(`${frontendBase}/checkout?payment=failed`);
  }

  const order = await Order.findById(orderId);
  if (!order) return res.redirect(`${frontendBase}/checkout?payment=error`);

  try {
    const result = await bkash.executePayment(paymentID);
    if (result.statusCode === '0000' && result.transactionStatus === 'Completed') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus:  'paid',
        bkashPaymentId: paymentID,
        bkashTrxId:     result.trxID,
        status:         'confirmed',
      });
      return res.redirect(`${frontendBase}/track?orderNo=${order.orderNo}&payment=success`);
    }
    res.redirect(`${frontendBase}/checkout?payment=failed`);
  } catch (err) {
    console.error('bKash execute error:', err.response?.data || err.message);
    res.redirect(`${frontendBase}/checkout?payment=error`);
  }
});

// POST /api/payments/bkash/refund
router.post('/bkash/refund', adminAuth, async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order || !order.bkashPaymentId) return res.status(400).json({ message: 'No bKash payment on record' });

  try {
    const result = await bkash.refundPayment({
      paymentId: order.bkashPaymentId,
      trxId:     order.bkashTrxId,
      amount:    order.total,
      orderId:   order.orderNo,
    });
    if (result.statusCode === '0000') {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'refunded', status: 'returned' });
      return res.json({ message: 'Refunded successfully' });
    }
    res.status(400).json({ message: result.statusMessage || 'Refund failed' });
  } catch (err) {
    res.status(502).json({ message: 'bKash refund failed' });
  }
});

// ── COD reconciliation ────────────────────────────────────────────────────
router.patch('/cod/:orderId/collect', adminAuth, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.orderId,
    { paymentStatus: 'collected' }, { new: true });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

// ── Payment stats for admin ───────────────────────────────────────────────
router.get('/admin/stats', adminAuth, async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const orders = await Order.find({ createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } }).lean();

  const stats = { bkash: 0, nagad: 0, card: 0, cod: 0, codPending: 0, codPendingAmount: 0 };
  orders.forEach(o => {
    if (o.paymentMethod in stats) stats[o.paymentMethod] += o.total;
    if (o.paymentMethod === 'cod' && o.paymentStatus === 'pending') {
      stats.codPending++;
      stats.codPendingAmount += o.total;
    }
  });
  res.json(stats);
});

module.exports = router;
