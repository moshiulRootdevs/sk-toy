const router = require('express').Router();
const CmsPage = require('../models/CmsPage');
const { adminAuth } = require('../middleware/auth');

router.get('/slug/:slug', async (req, res) => {
  const page = await CmsPage.findOne({ slug: req.params.slug, status: 'published' }).lean();
  if (!page) return res.status(404).json({ message: 'Not found' });
  res.json(page);
});

router.get('/admin/all', adminAuth, async (req, res) => {
  const pages = await CmsPage.find().sort({ updatedAt: -1 }).lean();
  res.json(pages);
});

router.get('/admin/:id', adminAuth, async (req, res) => {
  const page = await CmsPage.findById(req.params.id).lean();
  if (!page) return res.status(404).json({ message: 'Not found' });
  res.json(page);
});

router.post('/', adminAuth, async (req, res) => {
  const page = await CmsPage.create(req.body);
  res.status(201).json(page);
});

router.put('/:id', adminAuth, async (req, res) => {
  const page = await CmsPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!page) return res.status(404).json({ message: 'Not found' });
  res.json(page);
});

router.delete('/:id', adminAuth, async (req, res) => {
  await CmsPage.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
