const router = require('express').Router();
const HomeSection = require('../models/HomeSection');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const BlogPost = require('../models/BlogPost');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const CatalogueTile = require('../models/CatalogueTile');
const { adminAuth } = require('../middleware/auth');

// Public: get all enabled sections with resolved data
router.get('/', async (req, res) => {
  const sections = await HomeSection.find({ enabled: true }).sort({ order: 1 }).lean();
  const populated = await Promise.all(sections.map(async (s) => {
    if (s.type === 'products') {
      if (s.filter === 'showcase') {
        const refs = (s.productRefs || []).map(String);
        if (refs.length) {
          const prods = await Product.find({ _id: { $in: refs }, active: true })
            .populate('brand', 'name').populate('category', 'name slug').lean();
          s.products = refs.map((id) => prods.find((p) => String(p._id) === id)).filter(Boolean);
        } else {
          s.products = [];
        }
      } else {
        const q = { active: true };
        if (s.filter === 'new')            q.badge = 'new';
        else if (s.filter === 'sale')      q.comparePrice = { $exists: true, $ne: null };
        else if (s.filter === 'clearance') q.badge = 'clearance';
        else if (s.filter === 'featured')  { /* no extra filter — sort by rating below */ }
        else if (s.filter)                 q.category = s.filter;
        const sortBy = s.filter === 'featured' ? { rating: -1, reviewCount: -1 } : { createdAt: -1 };
        s.products = await Product.find(q).sort(sortBy).limit(s.limit || 8)
          .populate('brand', 'name').populate('category', 'name slug').lean();
      }
    }
    if (s.type === 'hero') {
      s.banner = await Banner.findOne({ slot: 'hero', active: true }).lean();
    }
    if (s.type === 'strip') {
      s.banner = await Banner.findOne({ slot: 'strip', active: true }).lean();
    }
    if (s.type === 'banner' && s.bannerId) {
      s.banner = await Banner.findById(s.bannerId).lean();
    }
    if (s.type === 'categories') {
      // Priority 1: custom CatalogueTiles
      const tiles = await CatalogueTile.find({ enabled: true }).sort({ order: 1 }).lean();
      if (tiles.length) {
        s.categories = tiles.map((t) => ({
          _id: t._id,
          name: t.title,
          tag: t.description,
          icon: t.icon,
          bgColor: t.bgColor,
          link: t.link,
        }));
      } else {
        // Priority 2: manually curated category refs
        const refs = (s.categoryRefs || []).map(String);
        if (refs.length) {
          const cats = await Category.find({ _id: { $in: refs } })
            .populate('children', 'name slug icon tag image').lean();
          s.categories = refs.map((id) => cats.find((c) => String(c._id) === id)).filter(Boolean);
        } else {
          // Priority 3: all top-level categories
          s.categories = await Category.find({ parent: null }).sort({ order: 1 }).limit(12)
            .populate('children', 'name slug icon tag image').lean();
        }
      }
    }
    if (s.type === 'brands') {
      s.brands = await Brand.find({}).sort({ order: 1 }).limit(12).lean();
    }
    if (s.type === 'journal') {
      s.posts = await BlogPost.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(3).lean();
    }
    return s;
  }));
  res.json(populated);
});

// Admin: full list (including disabled)
router.get('/admin/all', adminAuth, async (req, res) => {
  const sections = await HomeSection.find().sort({ order: 1 }).lean();
  res.json(sections);
});

// POST /api/homepage — create a new section
router.post('/', adminAuth, async (req, res) => {
  const maxOrder = await HomeSection.findOne().sort({ order: -1 }).select('order');
  const order = (maxOrder?.order ?? -1) + 1;
  const section = await HomeSection.create({ ...req.body, order });
  res.status(201).json(section);
});

// PUT /api/homepage/reorder — must be before /:id to avoid wildcard capture
router.put('/reorder', adminAuth, async (req, res) => {
  const { ids } = req.body; // ordered array of section IDs
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids array required' });
  await Promise.all(ids.map((id, index) => HomeSection.findByIdAndUpdate(id, { order: index })));
  res.json({ message: 'Reordered' });
});

// PUT /api/homepage/:id
router.put('/:id', adminAuth, async (req, res) => {
  const section = await HomeSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!section) return res.status(404).json({ message: 'Not found' });
  res.json(section);
});

// DELETE /api/homepage/:id
router.delete('/:id', adminAuth, async (req, res) => {
  await HomeSection.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
