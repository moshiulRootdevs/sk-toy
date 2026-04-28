const router = require('express').Router();
const BlogPost = require('../models/BlogPost');
const { adminAuth } = require('../middleware/auth');
const slugify = require('../utils/slugify');

router.get('/', async (req, res) => {
  const { category, page = 1, limit = 12 } = req.query;
  const q = { status: 'published' };
  if (category) q.category = category;
  const [posts, total] = await Promise.all([
    BlogPost.find(q).sort({ publishedAt: -1, createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
    BlogPost.countDocuments(q),
  ]);
  res.json({ posts, total, page: +page, pages: Math.ceil(total / +limit) });
});

router.get('/slug/:slug', async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' }).lean();
  if (!post) return res.status(404).json({ message: 'Not found' });
  res.json(post);
});

router.get('/admin/all', adminAuth, async (req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 }).lean();
  res.json(posts);
});

router.get('/admin/:id', adminAuth, async (req, res) => {
  const post = await BlogPost.findById(req.params.id).lean();
  if (!post) return res.status(404).json({ message: 'Not found' });
  res.json(post);
});

router.post('/', adminAuth, async (req, res) => {
  const { title, ...rest } = req.body;
  const slug = await uniqueSlug(title);
  const post = await BlogPost.create({ title, slug, ...rest, publishedAt: rest.status === 'published' ? new Date() : undefined });
  res.status(201).json(post);
});

router.put('/:id', adminAuth, async (req, res) => {
  const existing = await BlogPost.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Not found' });
  const updates = { ...req.body };
  if (updates.status === 'published' && !existing.publishedAt) updates.publishedAt = new Date();
  const post = await BlogPost.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(post);
});

router.delete('/:id', adminAuth, async (req, res) => {
  await BlogPost.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

async function uniqueSlug(title) {
  let base = slugify(title);
  let slug = base;
  let i = 1;
  while (await BlogPost.exists({ slug })) { slug = `${base}-${i++}`; }
  return slug;
}

module.exports = router;
