const router = require('express').Router();
const Coupon = require('../models/Coupon');
const { adminAuth } = require('../middleware/auth');

// Public: validate a coupon code
router.post('/validate', async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), status: 'active' });
  if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon' });
  if (coupon.endsAt && coupon.endsAt < new Date()) return res.status(400).json({ message: 'Coupon expired' });
  if (coupon.limit && coupon.uses >= coupon.limit) return res.status(400).json({ message: 'Coupon usage limit reached' });
  if (subtotal < coupon.minSpend) return res.status(400).json({ message: `Minimum order ৳${coupon.minSpend} required` });

  let discount = 0;
  if (coupon.type === 'percent') discount = Math.round(subtotal * coupon.value / 100);
  else if (coupon.type === 'fixed') discount = coupon.value;

  res.json({ valid: true, discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, description: coupon.description } });
});

// Admin CRUD
router.get('/admin/all', adminAuth, async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json(coupons);
});

router.post('/', adminAuth, async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, code: req.body.code?.toUpperCase() });
  res.status(201).json(coupon);
});

router.put('/:id', adminAuth, async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ message: 'Not found' });
  res.json(coupon);
});

router.delete('/:id', adminAuth, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
