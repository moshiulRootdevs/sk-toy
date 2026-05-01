const router = require('express').Router();
const HomeSection = require('../models/HomeSection');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const BlogPost = require('../models/BlogPost');
const Category = require('../models/Category');

const CatalogueTile = require('../models/CatalogueTile');
const { adminAuth } = require('../middleware/auth');

// Public: get all enabled sections with resolved data
router.get('/', async (req, res) => {
  const sections = await HomeSection.find({ enabled: true }).sort({ order: 1 }).lean();

  // Detect what we need up-front so cross-section data can be fetched in
  // parallel and reused (e.g. the same banner / blog query never fires twice).
  const needHero    = sections.some((s) => s.type === 'hero');
  const needStrip   = sections.some((s) => s.type === 'strip');
  const needJournal = sections.some((s) => s.type === 'journal');
  const needCats    = sections.some((s) => s.type === 'categories');
  const bannerIds   = sections.filter((s) => s.type === 'banner' && s.bannerId).map((s) => s.bannerId);

  const [heroBanner, stripBanner, journalPosts, catalogueTiles, namedBanners] = await Promise.all([
    needHero    ? Banner.findOne({ slot: 'hero', active: true }).lean()  : null,
    needStrip   ? Banner.findOne({ slot: 'strip', active: true }).lean() : null,
    needJournal ? BlogPost.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(3).lean() : [],
    needCats    ? CatalogueTile.find({ enabled: true }).sort({ order: 1 }).lean() : [],
    bannerIds.length ? Banner.find({ _id: { $in: bannerIds } }).lean() : [],
  ]);
  const bannerById = new Map(namedBanners.map((b) => [String(b._id), b]));

  // Resolve each section concurrently — Promise.all over independent work.
  const populated = await Promise.all(sections.map(async (s) => {
    if (s.type === 'products') {
      if (s.filter === 'showcase') {
        const refs = (s.productRefs || []).map(String);
        if (!refs.length) { s.products = []; return s; }
        const prods = await Product.find({ _id: { $in: refs }, active: true })
          .populate('category', 'name slug').lean();
        const byId = new Map(prods.map((p) => [String(p._id), p]));
        s.products = refs.map((id) => byId.get(id)).filter(Boolean);
      } else if (s.filter === 'trending') {
        const W = { view: 1, cart: 3, wish: 2, order: 5 };
        const limit = Math.min(s.limit || 8, 24);
        s.products = await Product.aggregate([
          { $match: { active: true } },
          { $addFields: {
              trendingScore: {
                $add: [
                  { $multiply: [{ $ifNull: ['$viewCount', 0] },     W.view] },
                  { $multiply: [{ $ifNull: ['$cartAddCount', 0] },  W.cart] },
                  { $multiply: [{ $ifNull: ['$wishlistCount', 0] }, W.wish] },
                  { $multiply: [{ $ifNull: ['$orderCount', 0] },    W.order] },
                ],
              },
          } },
          { $sort: { trendingScore: -1, createdAt: -1 } },
          { $limit: limit },
          { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          { $project: { 'category.name': 1, 'category.slug': 1, 'category._id': 1, name: 1, slug: 1, sku: 1, price: 1, comparePrice: 1, images: 1, badge: 1, stock: 1, ageGroup: 1, rating: 1, reviewCount: 1, active: 1 } },
        ]);
      } else {
        const q = { active: true };
        if (s.filter === 'new')            q.badge = 'new';
        else if (s.filter === 'sale')      q.$or = [{ badge: 'sale' }, { comparePrice: { $exists: true, $ne: null } }];
        else if (s.filter === 'clearance') q.badge = 'clearance';
        else if (s.filter === 'featured')  q.badge = 'featured';
        else if (s.filter)                 q.category = s.filter;
        const sortBy = s.filter === 'featured' ? { rating: -1, reviewCount: -1 } : { createdAt: -1 };
        s.products = await Product.find(q).sort(sortBy).limit(s.limit || 8)
          .populate('category', 'name slug').lean();
      }
    } else if (s.type === 'hero') {
      s.banner = heroBanner;
    } else if (s.type === 'strip') {
      s.banner = stripBanner;
    } else if (s.type === 'banner' && s.bannerId) {
      s.banner = bannerById.get(String(s.bannerId)) || null;
    } else if (s.type === 'categories') {
      if (catalogueTiles.length) {
        s.categories = catalogueTiles.map((t) => ({
          _id: t._id, name: t.title, tag: t.description, icon: t.icon, bgColor: t.bgColor, link: t.link,
        }));
      } else {
        const refs = (s.categoryRefs || []).map(String);
        if (refs.length) {
          const cats = await Category.find({ _id: { $in: refs } })
            .populate('children', 'name slug icon tag image').lean();
          const byId = new Map(cats.map((c) => [String(c._id), c]));
          s.categories = refs.map((id) => byId.get(id)).filter(Boolean);
        } else {
          s.categories = await Category.find({ parent: null }).sort({ order: 1 }).limit(12)
            .populate('children', 'name slug icon tag image').lean();
        }
      }
    } else if (s.type === 'journal') {
      s.posts = journalPosts;
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
  const maxOrder = await HomeSection.findOne().sort({ order: -1 }).select('order').lean();
  const order = (maxOrder?.order ?? -1) + 1;
  const section = await HomeSection.create({ ...req.body, order });
  res.status(201).json(section);
});

// PUT /api/homepage/reorder — must be before /:id to avoid wildcard capture
// Bulk-update via ordered bulkWrite — single round-trip instead of N updates.
router.put('/reorder', adminAuth, async (req, res) => {
  const { ids } = req.body; // ordered array of section IDs
  if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'ids array required' });
  await HomeSection.bulkWrite(
    ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { order: index } } })),
  );
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
