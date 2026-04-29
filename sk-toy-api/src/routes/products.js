const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { adminAuth } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');
const audit = require('../middleware/audit');
const slugify = require('../utils/slugify');

// Returns the given category ID plus all descendant IDs (one DB query)
async function getCategoryAndDescendants(categoryId) {
  const all = await Category.find().select('_id parent').lean();
  const childMap = {};
  all.forEach((c) => {
    const p = String(c.parent || '');
    if (!childMap[p]) childMap[p] = [];
    childMap[p].push(String(c._id));
  });
  const ids = [];
  function collect(id) {
    ids.push(id);
    (childMap[id] || []).forEach(collect);
  }
  collect(String(categoryId));
  return ids;
}

// ── Public endpoints ─────────────────────────────────────────────────────

// GET /api/products — with filters & pagination
router.get('/', async (req, res, next) => {
  try {
    // Admin picker: fetch specific products by comma-separated IDs
    if (req.query.ids) {
      const idList = String(req.query.ids).split(',').filter(Boolean);
      const products = await Product.find({ _id: { $in: idList } })
        .populate('category', 'name slug').populate('categories', 'name slug').lean();
      return res.json({ products, total: products.length, page: 1, pages: 1 });
    }

    const { search, category, ageGroup, gender, badge, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
    const q = { active: true };

    if (search)   q.$text = { $search: search };
    if (category) {
      const ids = await getCategoryAndDescendants(category);
      q.categories = { $in: ids };
    }
    if (ageGroup) q.ageGroup = ageGroup;
    if (gender)   q.gender = gender;
    if (minPrice || maxPrice) {
      q.price = {};
      if (minPrice) q.price.$gte = +minPrice;
      if (maxPrice) q.price.$lte = +maxPrice;
    }

    const sortMap = {
      newest:       { createdAt: -1 },
      'price-low':  { price: 1 },
      'price-high': { price: -1 },
      rating:       { rating: -1 },
    };

    if (badge === 'featured') {
      // "Featured" is not a badge value — show all active products sorted by top rating
    } else if (badge) {
      q.badge = badge;
    }

    const sortBy = badge === 'featured'
      ? { rating: -1, reviewCount: -1 }
      : (sortMap[sort] || { createdAt: -1 });

    const skip = (+page - 1) * +limit;
    const [products, total] = await Promise.all([
      Product.find(q).populate('category', 'name slug').populate('categories', 'name slug').sort(sortBy).skip(skip).limit(+limit).lean(),
      Product.countDocuments(q),
    ]);

    res.json({ products, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { next(err); }
});

// GET /api/products/slug/:slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true })
      .populate('category', 'name slug').populate('categories', 'name slug')
      .lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// GET /api/products/sku/check?sku=XXX&excludeId=YYY
router.get('/sku/check', adminAuth, async (req, res, next) => {
  try {
    const { sku, excludeId } = req.query;
    if (!sku) return res.json({ available: false });
    const query = { sku: sku.trim() };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Product.findOne(query).lean();
    res.json({ available: !exists });
  } catch (err) { next(err); }
});

// GET /api/products/trending — weighted score across views, cart-adds, wishlists, orders
router.get('/trending', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 24);
    // Score weights — orders matter most, cart-adds next, wishlists, then views.
    const W = { view: 1, cart: 3, wish: 2, order: 5 };

    const docs = await Product.aggregate([
      { $match: { active: true } },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$viewCount', 0] },     W.view] },
              { $multiply: [{ $ifNull: ['$cartAddCount', 0] },  W.cart] },
              { $multiply: [{ $ifNull: ['$wishlistCount', 0] }, W.wish] },
              { $multiply: [{ $ifNull: ['$orderCount', 0] },    W.order] },
            ],
          },
        },
      },
      { $match: { trendingScore: { $gt: 0 } } },
      { $sort: { trendingScore: -1, rating: -1, reviewCount: -1, createdAt: -1 } },
      { $limit: limit },
    ]);

    const populated = await Product.populate(docs, [
      { path: 'category', select: 'name slug' },
      { path: 'categories', select: 'name slug' },
    ]);
    res.json(populated);
  } catch (err) { next(err); }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug').populate('categories', 'name slug')
      .lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id, status: 'approved' }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { next(err); }
});

// POST /api/products/:id/view — increment view counter (fire-and-forget)
router.post('/:id/view', async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/products/:id/cart-add — increment cart-add counter
router.post('/:id/cart-add', async (req, res, next) => {
  try {
    const qty = Math.max(1, Math.min(parseInt(req.body?.qty, 10) || 1, 99));
    await Product.findByIdAndUpdate(req.params.id, { $inc: { cartAddCount: qty } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/products/:id/wishlist-add — increment wishlist counter (called only when toggled ON)
router.post('/:id/wishlist-add', async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { wishlistCount: 1 } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// GET /api/products/:id/related — relevance-scored suggestions
router.get('/:id/related', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const sourceCatIds = (product.categories?.length ? product.categories : (product.category ? [product.category] : []));
    const categoryIds = [];
    for (const cid of sourceCatIds) {
      const ids = await getCategoryAndDescendants(cid);
      ids.forEach((id) => categoryIds.push(id));
    }
    const uniqueCategoryIds = [...new Set(categoryIds.map(String))];

    const orClauses = [];
    if (uniqueCategoryIds.length) orClauses.push({ categories: { $in: uniqueCategoryIds } });
    if (product.ageGroup)   orClauses.push({ ageGroup: product.ageGroup });
    if (product.gender)     orClauses.push({ gender: product.gender });
    if (orClauses.length === 0) return res.json([]);

    const candidates = await Product.find({
      _id: { $ne: product._id },
      active: true,
      $or: orClauses,
    })
      .populate('category', 'name slug').populate('categories', 'name slug')
      .lean();

    const sameCatSet = new Set(uniqueCategoryIds);
    const scored = candidates.map((p) => {
      let score = 0;
      const pCatIds = (p.categories?.length ? p.categories : (p.category ? [p.category] : []))
        .map((c) => String(c._id || c));
      const matched = pCatIds.filter((id) => sameCatSet.has(id)).length;
      if (matched > 0) score += 3 + (matched - 1); // bonus for multi-overlap
      if (product.ageGroup && p.ageGroup === product.ageGroup) score += 1;
      if (product.gender && p.gender === product.gender) score += 1;
      return { p, score };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.p.rating || 0) !== (a.p.rating || 0)) return (b.p.rating || 0) - (a.p.rating || 0);
      return (b.p.reviewCount || 0) - (a.p.reviewCount || 0);
    });

    res.json(scored.slice(0, limit).map((s) => s.p));
  } catch (err) { next(err); }
});

// ── Admin endpoints ──────────────────────────────────────────────────────

// GET /api/products/admin/all — unfiltered list for admin (must come before /admin/:id)
router.get('/admin/all', adminAuth, async (req, res, next) => {
  try {
    const { search, category, stockFilter, page = 1, limit = 50 } = req.query;
    const q = {};
    if (search) q.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];
    if (category && category !== 'all') q.categories = category;
    if (stockFilter === 'low') { q.stock = { $gt: 0, $lt: 8 }; }
    else if (stockFilter === 'out') { q.stock = 0; }
    else if (stockFilter === 'ok') { q.stock = { $gte: 8 }; }

    const skip = (+page - 1) * +limit;
    const [products, total] = await Promise.all([
      Product.find(q).populate('category', 'name slug').populate('categories', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
      Product.countDocuments(q),
    ]);
    res.json({ products, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err) { next(err); }
});

// GET /api/products/admin/:id — single product for admin
router.get('/admin/:id', adminAuth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug').populate('categories', 'name slug')
      .lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});

// Normalize category fields from incoming body — accepts either `categories` (array)
// or legacy `category` (single). Returns { categories: ObjectId[], category: ObjectId|null }.
function normalizeCategoryFields(body) {
  const raw = Array.isArray(body.categories)
    ? body.categories
    : (body.categories ? [body.categories] : (body.category ? [body.category] : []));
  const cleaned = raw.filter(Boolean).map(String);
  const unique = [...new Set(cleaned)];
  return { categories: unique, primary: unique[0] || null };
}

// POST /api/products
router.post('/', adminAuth, audit('CREATED', 'Product', (req) => `Created product: ${req.body.name}`), async (req, res, next) => {
  try {
    const { name, slug: clientSlug, category, categories, sku, ...rest } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
    const slug = clientSlug?.trim() ? clientSlug.trim() : await uniqueSlug(name.trim());
    const data = { name: name.trim(), slug, ...rest };
    const { categories: cats, primary } = normalizeCategoryFields({ category, categories });
    if (cats.length) { data.categories = cats; data.category = primary; }
    if (sku?.trim()) data.sku = sku.trim();
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(400).json({ message: `A product with this ${field} already exists` });
    }
    next(err);
  }
});

// PUT /api/products/:id
router.put('/:id', adminAuth, audit('UPDATED', 'Product', (req) => `Updated product: ${req.body.name || req.params.id}`), async (req, res, next) => {
  try {
    const { slug: clientSlug, category, categories, sku, ...rest } = req.body;
    const updates = { ...rest };
    if (clientSlug?.trim()) updates.slug = clientSlug.trim();

    const hasCategoryInput = category !== undefined || categories !== undefined;
    if (hasCategoryInput) {
      const { categories: cats, primary } = normalizeCategoryFields({ category, categories });
      if (cats.length) {
        updates.categories = cats;
        updates.category = primary;
      } else {
        updates.categories = [];
        updates.$unset = { ...updates.$unset, category: 1 };
      }
    }

    if (sku?.trim()) updates.sku = sku.trim(); else updates.$unset = { ...updates.$unset, sku: 1 };
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(400).json({ message: `A product with this ${field} already exists` });
    }
    next(err);
  }
});

// POST /api/products/:id/images — upload images
router.post('/:id/images', adminAuth, ...uploadProduct.array('images', 10), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    const urls = req.files.map(f => f.url);
    product.images.push(...urls);
    await product.save();
    res.json({ images: product.images });
  } catch (err) { next(err); }
});

// DELETE /api/products/:id
router.delete('/:id', adminAuth, audit('DELETED', 'Product', (req) => `Deleted product ${req.params.id}`), async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// POST /api/products/bulk-delete
router.post('/bulk-delete', adminAuth, async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ deleted: ids.length });
  } catch (err) { next(err); }
});

// POST /api/products/bulk-update
router.post('/bulk-update', adminAuth, async (req, res, next) => {
  try {
    const { ids, updates } = req.body;
    await Product.updateMany({ _id: { $in: ids } }, updates);
    res.json({ updated: ids.length });
  } catch (err) { next(err); }
});

async function uniqueSlug(name) {
  let base = slugify(name);
  let slug = base;
  let i = 1;
  while (await Product.exists({ slug })) { slug = `${base}-${i++}`; }
  return slug;
}

module.exports = router;
