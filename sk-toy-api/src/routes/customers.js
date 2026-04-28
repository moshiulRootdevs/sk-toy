const router = require('express').Router();
const Customer = require('../models/Customer');
const { adminAuth, customerAuth } = require('../middleware/auth');

// ── Customer self-service ────────────────────────────────────────────────
router.get('/me', customerAuth, async (req, res) => {
  res.json(req.customer);
});

router.put('/me', customerAuth, async (req, res) => {
  const allowed = ['name', 'phone', 'addresses'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const customer = await Customer.findByIdAndUpdate(req.customer._id, updates, { new: true });
  res.json(customer);
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
  const { search, tier, page = 1, limit = 50 } = req.query;
  const q = {};
  if (search) q.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } },
  ];
  if (tier && tier !== 'all') q.tier = tier;

  const skip = (+page - 1) * +limit;
  const [customers, total] = await Promise.all([
    Customer.find(q).sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
    Customer.countDocuments(q),
  ]);
  res.json({ customers, total, page: +page, pages: Math.ceil(total / +limit) });
});

router.get('/admin/:id', adminAuth, async (req, res) => {
  const c = await Customer.findById(req.params.id).lean();
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

router.put('/admin/:id', adminAuth, async (req, res) => {
  const c = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

module.exports = router;
