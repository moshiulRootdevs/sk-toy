const router = require('express').Router();
const CatalogueTile = require('../models/CatalogueTile');
const { adminAuth } = require('../middleware/auth');

// Public — enabled tiles sorted by order
router.get('/', async (req, res) => {
  const tiles = await CatalogueTile.find({ enabled: true }).sort({ order: 1 }).lean();
  res.json(tiles);
});

// Admin — all tiles (including disabled)
router.get('/admin/all', adminAuth, async (req, res) => {
  const tiles = await CatalogueTile.find().sort({ order: 1 }).lean();
  res.json(tiles);
});

// Create
router.post('/', adminAuth, async (req, res) => {
  const maxOrder = await CatalogueTile.findOne().sort({ order: -1 }).select('order');
  const order = (maxOrder?.order ?? -1) + 1;
  const tile = await CatalogueTile.create({ ...req.body, order });
  res.status(201).json(tile);
});

// Reorder — must be before /:id
router.put('/reorder', adminAuth, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids array required' });
  await Promise.all(ids.map((id, index) => CatalogueTile.findByIdAndUpdate(id, { order: index })));
  res.json({ message: 'Reordered' });
});

// Update
router.put('/:id', adminAuth, async (req, res) => {
  const tile = await CatalogueTile.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tile) return res.status(404).json({ message: 'Not found' });
  res.json(tile);
});

// Delete
router.delete('/:id', adminAuth, async (req, res) => {
  await CatalogueTile.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
