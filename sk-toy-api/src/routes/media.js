const router = require('express').Router();
const Media = require('../models/Media');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');
const { deleteFile, uploadFile } = require('../utils/storage');
const { convertToMp4, NEEDS_TRANSCODE } = require('../utils/convertVideo');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

router.get('/admin/all', adminAuth, async (req, res) => {
  const { tag, page = 1, limit = 48 } = req.query;
  const q = tag && tag !== 'all' ? { tag } : {};
  const [files, total] = await Promise.all([
    Media.find(q).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
    Media.countDocuments(q),
  ]);
  res.json({ files, total });
});

router.post('/upload', adminAuth, (req, res, next) => { req.setTimeout(600000); res.setTimeout(600000); next(); }, ...uploadMedia.array('files', 20), async (req, res) => {
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

// Helper: download a file from URL into a buffer
function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// POST /api/media/convert-videos — convert all existing .mov/.avi/.mkv files to .mp4
router.post('/convert-videos', adminAuth, async (req, res) => {
  const extPattern = /\.(mov|avi|mkv|m4v|3gp|wmv|flv)(\?.*)?$/i;
  let converted = 0;
  const errors = [];

  try {
    // 1. Fix Media collection
    const mediaFiles = await Media.find({ url: { $regex: extPattern } }).lean();
    for (const m of mediaFiles) {
      try {
        const buffer = await downloadBuffer(m.url);
        const originalname = path.basename(m.url.split('?')[0]);
        const result = await convertToMp4(buffer, originalname, m.mimetype || 'video/quicktime');
        const newUrl = await uploadFile(result.buffer, result.originalname, result.mimetype, 'media');
        await Media.findByIdAndUpdate(m._id, { url: newUrl, mimetype: result.mimetype, name: result.originalname });
        await deleteFile(m.url).catch(() => {});
        converted++;
      } catch (err) {
        errors.push({ id: m._id, url: m.url, error: err.message });
      }
    }

    // 2. Fix Product images arrays
    const products = await Product.find({ images: { $regex: extPattern } }).lean();
    for (const p of products) {
      let updated = false;
      const newImages = [];
      for (const imgUrl of p.images) {
        if (extPattern.test(imgUrl)) {
          try {
            const buffer = await downloadBuffer(imgUrl);
            const originalname = path.basename(imgUrl.split('?')[0]);
            const result = await convertToMp4(buffer, originalname, 'video/quicktime');
            const newUrl = await uploadFile(result.buffer, result.originalname, result.mimetype, 'products');
            newImages.push(newUrl);
            await deleteFile(imgUrl).catch(() => {});
            updated = true;
            converted++;
          } catch (err) {
            newImages.push(imgUrl);
            errors.push({ productId: p._id, url: imgUrl, error: err.message });
          }
        } else {
          newImages.push(imgUrl);
        }
      }
      if (updated) {
        await Product.findByIdAndUpdate(p._id, { images: newImages });
      }
    }

    res.json({ message: `Converted ${converted} video(s) to mp4`, converted, errors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
