const router = require('express').Router();
const Brand = require('../models/Brand');
const { adminAuth } = require('../middleware/auth');
const audit = require('../middleware/audit');
const slugify = require('../utils/slugify');

router.get('/', async (req, res) => {
  const brands = await Brand.find({ active: true }).sort({ order: 1, name: 1 }).lean();
  res.json(brands);
});

router.get('/admin/all', adminAuth, async (req, res) => {
  const brands = await Brand.find().sort({ order: 1, name: 1 }).lean();
  res.json(brands);
});

router.post('/', adminAuth, audit('CREATED', 'Brand', (req) => `Created brand: ${req.body.name}`), async (req, res) => {
  const { name, ...rest } = req.body;
  const slug = slugify(name);
  const brand = await Brand.create({ name, slug, ...rest });
  res.status(201).json(brand);
});

router.put('/:id', adminAuth, audit('UPDATED', 'Brand', (req) => `Updated brand ${req.params.id}`), async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!brand) return res.status(404).json({ message: 'Not found' });
  res.json(brand);
});

router.delete('/:id', adminAuth, audit('DELETED', 'Brand', (req) => `Deleted brand ${req.params.id}`), async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
