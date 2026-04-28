const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { adminAuth } = require('../middleware/auth');

const sign = (id, type = 'admin') =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── Admin auth ──────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!user.active) return res.status(403).json({ message: 'Account disabled' });
  res.json({ token: sign(user._id, 'admin'), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/admin/me', adminAuth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

router.put('/admin/password', adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ message: 'Wrong current password' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

// ── Customer auth ───────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
  if (await Customer.findOne({ email })) return res.status(409).json({ message: 'Email already registered' });
  const customer = await Customer.create({ name, email, password, phone });
  res.status(201).json({ token: sign(customer._id, 'customer'), customer: { id: customer._id, name: customer.name, email: customer.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const customer = await Customer.findOne({ email }).select('+password');
  if (!customer || customer.isGuest || !(await customer.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: sign(customer._id, 'customer'), customer: { id: customer._id, name: customer.name, email: customer.email, tier: customer.tier } });
});

module.exports = router;
