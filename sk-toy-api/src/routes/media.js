const router = require('express').Router();
const Media = require('../models/Media');
const { adminAuth } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');
const { deleteFile } = require('../utils/storage');

router.get('/admin/all', adminAuth, async (req, res) => {
  const { tag, page = 1, limit = 48 } = req.query;
  const q = tag && tag !== 'all' ? { tag } : {};
  const [files, total] = await Promise.all([
    Media.find(q).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
    Media.countDocuments(q),
  ]);
  res.json({ files, total });
});

router.post('/upload', adminAuth, ...uploadMedia.array('files', 20), async (req, res) => {
  const tag = req.body.tag || 'general';
  const docs = req.files.map(f => ({
    name:      f.originalname,
    url:       f.url,
    mimetype:  f.mimetype,
    size:      f.size,
    tag,
    uploadedBy: req.user._id,
  }));
  const saved = await Media.insertMany(docs);
  res.json(saved);
});

router.delete('/:id', adminAuth, async (req, res) => {
  const file = await Media.findById(req.params.id);
  if (!file) return res.status(404).json({ message: 'Not found' });
  await deleteFile(file.url).catch(() => {});
  await Media.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
