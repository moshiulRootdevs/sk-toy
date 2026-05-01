const router = require('express').Router();
const Customer = require('../models/Customer');
const { adminAuth, customerAuth } = require('../middleware/auth');

// ── Customer self-service ────────────────────────────────────────────────
router.get('/me', customerAuth, async (req, res) => {
  res.json(req.customer);
});

router.put('/me', customerAuth, async (req, res) => {
  // Phone is the verified identifier — customers can't change it from /me.
  // To change phone they'd need to re-verify via OTP (separate flow).
  const allowed = ['name', 'email', 'addresses'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const customer = await Customer.findByIdAndUpdate(req.customer._id, updates, { new: true });
  res.json(customer);
});

// ── Saved addresses ─────────────────────────────────────────────────────
const ADDRESS_FIELDS = ['label', 'line1', 'line2', 'area', 'district', 'zip', 'isDefault'];

function pickAddress(body) {
  const a = {};
  ADDRESS_FIELDS.forEach((k) => { if (body[k] !== undefined) a[k] = body[k]; });
  return a;
}

router.get('/me/addresses', customerAuth, async (req, res) => {
  const c = await Customer.findById(req.customer._id).lean();
  res.json(c?.addresses || []);
});

router.post('/me/addresses', customerAuth, async (req, res) => {
  const data = pickAddress(req.body);
  if (!data.line1) return res.status(400).json({ message: 'Address line is required.' });
  const customer = await Customer.findById(req.customer._id);
  // First address auto-becomes default
  if (!customer.addresses.length) data.isDefault = true;
  // If this one is being marked default, clear default on others
  if (data.isDefault) customer.addresses.forEach((a) => { a.isDefault = false; });
  customer.addresses.push(data);
  await customer.save();
  res.status(201).json(customer.addresses);
});

router.put('/me/addresses/:id', customerAuth, async (req, res) => {
  const data = pickAddress(req.body);
  const customer = await Customer.findById(req.customer._id);
  const addr = customer.addresses.id(req.params.id);
  if (!addr) return res.status(404).json({ message: 'Address not found.' });
  if (data.isDefault) customer.addresses.forEach((a) => { a.isDefault = String(a._id) === String(addr._id); });
  Object.assign(addr, data);
  await customer.save();
  res.json(customer.addresses);
});

router.delete('/me/addresses/:id', customerAuth, async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  const addr = customer.addresses.id(req.params.id);
  if (!addr) return res.status(404).json({ message: 'Address not found.' });
  const wasDefault = addr.isDefault;
  customer.addresses.pull(addr._id);
  // Promote the first remaining address to default if we removed the default
  if (wasDefault && customer.addresses.length) customer.addresses[0].isDefault = true;
  await customer.save();
  res.json(customer.addresses);
});

router.post('/me/addresses/:id/default', customerAuth, async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  const target = customer.addresses.id(req.params.id);
  if (!target) return res.status(404).json({ message: 'Address not found.' });
  customer.addresses.forEach((a) => { a.isDefault = String(a._id) === String(target._id); });
  await customer.save();
  res.json(customer.addresses);
});

router.get('/me/wishlist', customerAuth, async (req, res) => {
  const customer = await Customer.findById(req.customer._id).populate('wishlist', 'name slug price comparePrice images rating').lean();
  res.json(customer.wishlist || []);
});

router.post('/me/wishlist/:productId', customerAuth, async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  const pid = req.params.productId;
  const idx = customer.wishlist.findIndex(id => String(id) === pid);
  if (idx >= 0) {
    customer.wishlist.splice(idx, 1);
  } else {
    customer.wishlist.push(pid);
  }
  await customer.save();
  res.json({ wishlist: customer.wishlist });
});

// ── Admin ────────────────────────────────────────────────────────────────
router.get('/admin/all', adminAuth, async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const q = {};
  if (search) q.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } },
  ];

  const skip = (+page - 1) * +limit;
  const total = await Customer.countDocuments(q);
  // Aggregate so order counts/spend/last order date are computed live from the
  // Order collection (cached fields on Customer can drift for guest orders or
  // older records). Match by customer ref OR by phone — covers both registered
  // customers and guest orders that happen to share their phone number.
  const customers = await Customer.aggregate([
    { $match: q },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: +limit },
    { $lookup: {
        from: 'orders',
        let: { customerId: '$_id', phone: '$phone' },
        pipeline: [
          { $match: { $expr: { $or: [
            { $eq: ['$customer', '$$customerId'] },
            { $and: [{ $ne: ['$$phone', null] }, { $ne: ['$$phone', ''] }, { $eq: ['$phone', '$$phone'] }] },
          ] } } },
          { $project: { total: 1, createdAt: 1, status: 1 } },
        ],
        as: 'orderDocs',
    } },
    { $addFields: {
        orderCount: { $size: '$orderDocs' },
        totalSpend: { $sum: '$orderDocs.total' },
        lastOrder:  { $max: '$orderDocs.createdAt' },
    } },
    { $project: { password: 0, orderDocs: 0, wishlist: 0 } },
  ]);
  res.json({ customers, total, page: +page, pages: Math.ceil(total / +limit) });
});

router.get('/admin/:id', adminAuth, async (req, res) => {
  const c = await Customer.findById(req.params.id).lean();
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

router.put('/admin/:id', adminAuth, async (req, res) => {
  // Restrict updatable fields — never accept raw req.body so admins can't
  // accidentally clobber timestamps / counters / wishlist refs.
  const allowed = ['name', 'email', 'phone', 'active'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const c = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

// DELETE /api/customers/admin/:id — permanent removal
router.delete('/admin/:id', adminAuth, async (req, res) => {
  const c = await Customer.findByIdAndDelete(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Customer deleted' });
});

// PUT /api/customers/admin/:id/password — admin sets a new password.
// The customer's pre-save hook hashes it.
router.put('/admin/:id/password', adminAuth, async (req, res) => {
  const newPassword = String(req.body.newPassword || '');
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  const c = await Customer.findById(req.params.id).select('+password');
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.password = newPassword;
  await c.save();
  res.json({ message: 'Password updated' });
});

// ── Admin address management — same shape as the customer self-service
// endpoints, but scoped to a target customer ID.
router.get('/admin/:id/addresses', adminAuth, async (req, res) => {
  const c = await Customer.findById(req.params.id).lean();
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c.addresses || []);
});

router.post('/admin/:id/addresses', adminAuth, async (req, res) => {
  const data = pickAddress(req.body);
  if (!data.line1) return res.status(400).json({ message: 'Address line is required.' });
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Not found' });
  if (!customer.addresses.length) data.isDefault = true;
  if (data.isDefault) customer.addresses.forEach((a) => { a.isDefault = false; });
  customer.addresses.push(data);
  await customer.save();
  res.status(201).json(customer.addresses);
});

router.put('/admin/:id/addresses/:addrId', adminAuth, async (req, res) => {
  const data = pickAddress(req.body);
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Not found' });
  const addr = customer.addresses.id(req.params.addrId);
  if (!addr) return res.status(404).json({ message: 'Address not found.' });
  if (data.isDefault) customer.addresses.forEach((a) => { a.isDefault = String(a._id) === String(addr._id); });
  Object.assign(addr, data);
  await customer.save();
  res.json(customer.addresses);
});

router.delete('/admin/:id/addresses/:addrId', adminAuth, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Not found' });
  const addr = customer.addresses.id(req.params.addrId);
  if (!addr) return res.status(404).json({ message: 'Address not found.' });
  const wasDefault = addr.isDefault;
  customer.addresses.pull(addr._id);
  if (wasDefault && customer.addresses.length) customer.addresses[0].isDefault = true;
  await customer.save();
  res.json(customer.addresses);
});

// GET /api/customers/admin/:id/orders — orders tied to this customer
// (matched by customer ref OR by phone, same logic as /orders/my).
router.get('/admin/:id/orders', adminAuth, async (req, res) => {
  const Order = require('../models/Order');
  const customer = await Customer.findById(req.params.id).lean();
  if (!customer) return res.status(404).json({ message: 'Not found' });
  const conditions = [{ customer: customer._id }];
  if (customer.phone) conditions.push({ phone: customer.phone });
  const orders = await Order.find({ $or: conditions })
    .sort({ createdAt: -1 })
    .select('orderNo createdAt status paymentStatus paymentMethod total lines.qty')
    .lean();
  res.json(orders);
});

module.exports = router;
