const router = require('express').Router();
const Benefit = require('../models/Benefit');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');

// Public: benefits to show on a product detail page
router.get('/for-product/:productId', async (req, res) => {
  const product = await Product.findById(req.params.productId).select('category categories').lean();
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const productCats = (product.categories?.length ? product.categories : (product.category ? [product.category] : []));
  const filter = {
    status: 'published',
    $or: [
      { applyToAll: true },
      ...(productCats.length ? [{ categories: { $in: productCats } }] : []),
    ],
  };
  const benefits = await Benefit.find(filter).sort({ order: 1, createdAt: 1 }).lean();
  res.json(benefits);
});

// Admin
router.get('/admin/all', adminAuth, async (req, res) => {
  const benefits = await Benefit.find()
    .populate('categories', 'name slug')
    .sort({ order: 1, createdAt: -1 })
    .lean();
  res.json(benefits);
});

router.get('/admin/:id', adminAuth, async (req, res) => {
  const benefit = await Benefit.findById(req.params.id)
    .populate('categories', 'name slug')
    .lean();
  if (!benefit) return res.status(404).json({ message: 'Not found' });
  res.json(benefit);
});

router.post('/', adminAuth, async (req, res) => {
  const benefit = await Benefit.create(req.body);
  res.status(201).json(benefit);
});

router.put('/reorder', adminAuth, async (req, res) => {
  const { items } = req.body; // [{ id, order }]
  if (!Array.isArray(items)) return res.status(400).json({ message: 'items array required' });
  await Promise.all(items.map(i => Benefit.findByIdAndUpdate(i.id, { order: i.order })));
  res.json({ message: 'Reordered' });
});

router.put('/:id', adminAuth, async (req, res) => {
  const benefit = await Benefit.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!benefit) return res.status(404).json({ message: 'Not found' });
  res.json(benefit);
});

router.delete('/:id', adminAuth, async (req, res) => {
  await Benefit.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
