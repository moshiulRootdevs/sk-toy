const router = require('express').Router();
const Banner = require('../models/Banner');
const { adminAuth } = require('../middleware/auth');
const { uploadBanner } = require('../middleware/upload');

router.get('/', async (req, res) => {
  const { slot } = req.query;
  const q = { active: true };
  if (slot) q.slot = slot;
  const banners = await Banner.find(q).sort({ order: 1 }).lean();
  res.json(banners);
});

router.get('/admin/all', adminAuth, async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 }).lean();
  res.json(banners);
});

router.post('/', adminAuth, async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json(banner);
});

router.post('/:id/image', adminAuth, ...uploadBanner.single('image'), async (req, res) => {
  const url = req.file.url;
  const banner = await Banner.findByIdAndUpdate(req.params.id, { image: url }, { new: true });
  res.json({ image: url, banner });
});

router.put('/:id', adminAuth, async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) return res.status(404).json({ message: 'Not found' });
  res.json(banner);
});

router.delete('/:id', adminAuth, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
