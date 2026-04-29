const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const ShippingZone = require('../models/ShippingZone');
const Settings = require('../models/Settings');
const { adminAuth, customerAuth, optionalCustomer } = require('../middleware/auth');
const audit = require('../middleware/audit');
const { sendOrderConfirmation } = require('../utils/mailer');

// ── Public / customer ────────────────────────────────────────────────────

// POST /api/orders — place order
router.post('/', optionalCustomer, async (req, res) => {
  const { lines, customerName, customerEmail, phone, address, area, district, paymentMethod, coupon: couponCode, giftWrap, note } = req.body;

  if (!lines?.length || !customerName || !phone || !address || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Resolve products and compute subtotal
  const productIds = lines.map(l => l.product);
  const products = await Product.find({ _id: { $in: productIds } });
  let subtotal = 0;
  const resolvedLines = lines.map(l => {
    const p = products.find(x => String(x._id) === String(l.product));
    if (!p) throw new Error(`Product ${l.product} not found`);
    const price = p.price;
    subtotal += price * l.qty;
    return { product: p._id, name: p.name, sku: p.sku, image: p.images?.[0] || '', price, qty: l.qty, variant: l.variant };
  });

  // Shipping cost
  const settings = await Settings.findOne({ key: 'global' });
  let shippingCost = 60;
  const zone = await ShippingZone.findOne({ areas: { $in: [district || area] } }) || await ShippingZone.findOne({ default: true });
  if (zone) {
    shippingCost = subtotal >= zone.freeOver ? 0 : zone.flat;
  } else if (settings && subtotal >= settings.policies.freeShippingOver) {
    shippingCost = 0;
  }

  // Coupon
  let discount = 0;
  if (couponCode) {
    const couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'active' });
    if (couponDoc && (!couponDoc.endsAt || couponDoc.endsAt > new Date()) && subtotal >= couponDoc.minSpend) {
      if (couponDoc.type === 'percent') discount = Math.round(subtotal * couponDoc.value / 100);
      else if (couponDoc.type === 'fixed') discount = couponDoc.value;
      else if (couponDoc.type === 'shipping') discount = shippingCost;
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { uses: 1 } });
    }
  }

  const giftWrapCost = giftWrap ? (settings?.policies?.giftWrapCost || 120) : 0;
  const total = subtotal + shippingCost + giftWrapCost - discount;

  const order = await Order.create({
    customerName,
    customerEmail,
    phone,
    address,
    area,
    district,
    customer: req.customer?._id,
    lines: resolvedLines,
    subtotal,
    shipping: shippingCost,
    discount,
    giftWrap,
    giftWrapCost,
    total,
    coupon: couponCode,
    paymentMethod,
    note,
  });

  // Decrement stock and increment order counter (used for trending)
  for (const l of resolvedLines) {
    await Product.findByIdAndUpdate(l.product, { $inc: { stock: -l.qty, orderCount: l.qty } });
  }

  // Update customer stats
  if (req.customer) {
    await Customer.findByIdAndUpdate(req.customer._id, {
      $inc: { orders: 1, spend: total },
      lastOrder: new Date(),
    });
  }

  // Send invoice email (non-blocking — never fails the response)
  sendOrderConfirmation(order.toObject()).catch(() => {});

  res.status(201).json(order);
});

// GET /api/orders/confirm/:orderNo — public, for order confirmation page
router.get('/confirm/:orderNo', async (req, res) => {
  const order = await Order.findOne({ orderNo: req.params.orderNo }).lean();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// GET /api/orders/track?orderNo=SK00001&phone=...
router.get('/track', async (req, res) => {
  const { orderNo, phone } = req.query;
  if (!orderNo || !phone) return res.status(400).json({ message: 'orderNo and phone required' });
  const order = await Order.findOne({ orderNo, phone }).populate('lines.product', 'name images slug').lean();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// GET /api/orders/my — customer's own orders
router.get('/my', customerAuth, async (req, res) => {
  const orders = await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

// ── Admin ────────────────────────────────────────────────────────────────

router.get('/admin/all', adminAuth, async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  const q = {};
  if (status && status !== 'all') q.status = status;
  if (search) q.$or = [
    { orderNo: { $regex: search, $options: 'i' } },
    { customerName: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } },
  ];
  const skip = (+page - 1) * +limit;
  const [orders, total] = await Promise.all([
    Order.find(q).sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
    Order.countDocuments(q),
  ]);
  res.json({ orders, total, page: +page, pages: Math.ceil(total / +limit) });
});

// GET /api/orders/admin/phone-history/:phone — order count by phone
router.get('/admin/phone-history/:phone', adminAuth, async (req, res) => {
  const count = await Order.countDocuments({ phone: req.params.phone });
  res.json({ count });
});

router.get('/admin/:id', adminAuth, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('lines.product', 'name images sku').lean();
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

router.put('/admin/:id', adminAuth, audit('UPDATED', 'Order', (req) => `Updated order ${req.params.id}`), async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

// PATCH /api/orders/admin/:id/status
router.patch('/admin/:id/status', adminAuth, audit('UPDATED', 'Order', (req) => `Status → ${req.body.status} for order ${req.params.id}`), async (req, res) => {
  const { status, paymentStatus, trackingNo, staffNote } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (paymentStatus) updates.paymentStatus = paymentStatus;
  if (trackingNo !== undefined) updates.trackingNo = trackingNo;
  if (staffNote !== undefined) updates.staffNote = staffNote;
  const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

module.exports = router;
