const router = require('express').Router();
const Navigation = require('../models/Navigation');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const items = await Navigation.find().sort({ order: 1 }).lean();
  res.json(items);
});

router.post('/', adminAuth, async (req, res) => {
  const maxOrder = await Navigation.findOne().sort({ order: -1 }).select('order');
  const item = await Navigation.create({ ...req.body, order: (maxOrder?.order ?? -1) + 1 });
  res.status(201).json(item);
});

router.put('/:id', adminAuth, async (req, res) => {
  const item = await Navigation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.delete('/:id', adminAuth, async (req, res) => {
  await Navigation.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

router.put('/reorder', adminAuth, async (req, res) => {
  const { items } = req.body;
  await Promise.all(items.map(i => Navigation.findByIdAndUpdate(i.id, { order: i.order })));
  res.json({ message: 'Reordered' });
});

module.exports = router;
