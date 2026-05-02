const router = require('express').Router();
const Category = require('../models/Category');
const { adminAuth } = require('../middleware/auth');
const audit = require('../middleware/audit');
const slugify = require('../utils/slugify');

// Build nested tree from flat list
function buildTree(categories) {
  const map = {};
  categories.forEach(c => { map[c._id] = { ...c, children: [] }; });
  const roots = [];
  categories.forEach(c => {
    if (c.parent) {
      if (map[c.parent]) map[c.parent].children.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });
  return roots.sort((a, b) => a.order - b.order);
}

// GET /api/categories — public tree
router.get('/', async (req, res) => {
  const cats = await Category.find({ hidden: false }).sort({ order: 1 }).lean();
  res.json(buildTree(cats));
});

// GET /api/categories/flat — flat list for dropdowns
router.get('/flat', async (req, res) => {
  const cats = await Category.find().sort({ order: 1 }).lean();
  res.json(cats);
});

// GET /api/categories/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  const cat = await Category.findOne({ slug: req.params.slug })
    .populate('children', 'name slug icon tag image order')
    .lean();
  if (!cat) return res.status(404).json({ message: 'Not found' });
  res.json(cat);
});

// GET /api/categories/:id/children
router.get('/:id/children', async (req, res) => {
  const children = await Category.find({ parent: req.params.id }).sort({ order: 1 }).lean();
  res.json(children);
});

// Admin: full tree including hidden
router.get('/admin/tree', adminAuth, async (req, res) => {
  const cats = await Category.find().sort({ order: 1 }).lean();
  res.json(buildTree(cats));
});

// POST /api/categories
router.post('/', adminAuth, audit('CREATED', 'Category', (req) => `Created category: ${req.body.name}`), async (req, res) => {
  const { name, parent, ...rest } = req.body;
  const slug = await uniqueSlug(name);
  const cat = await Category.create({ name, slug, parent: parent || null, ...rest });
  if (parent) {
    await Category.findByIdAndUpdate(parent, { $push: { children: cat._id } });
  }
  res.status(201).json(cat);
});

// PUT /api/categories/reorder — bulk reorder (must be before /:id to avoid matching "reorder" as an ObjectId)
router.put('/reorder', adminAuth, async (req, res) => {
  try {
    const { items } = req.body; // [{ id, order }]
    if (!items?.length) return res.status(400).json({ message: 'No items provided' });
    await Promise.all(items.map(i => Category.findByIdAndUpdate(i.id, { order: i.order })));
    res.json({ message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ message: 'Reorder failed' });
  }
});

// PUT /api/categories/:id
router.put('/:id', adminAuth, audit('UPDATED', 'Category', (req) => `Updated category ${req.params.id}`), async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!cat) return res.status(404).json({ message: 'Not found' });
  res.json(cat);
});

// DELETE /api/categories/:id
router.delete('/:id', adminAuth, audit('DELETED', 'Category', (req) => `Deleted category ${req.params.id}`), async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Not found' });
  // Remove from parent's children array
  if (cat.parent) {
    await Category.findByIdAndUpdate(cat.parent, { $pull: { children: cat._id } });
  }
  // Re-parent children to null (make them top-level)
  await Category.updateMany({ parent: cat._id }, { parent: null });
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

async function uniqueSlug(name) {
  let base = slugify(name);
  let slug = base;
  let i = 1;
  while (await Category.exists({ slug })) { slug = `${base}-${i++}`; }
  return slug;
}

module.exports = router;
