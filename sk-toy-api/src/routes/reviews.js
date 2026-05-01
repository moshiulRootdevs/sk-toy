const router = require('express').Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { adminAuth, customerAuth } = require('../middleware/auth');

// GET /api/reviews/can-review/:productId — check if logged-in customer can review
router.get('/can-review/:productId', customerAuth, async (req, res) => {
  const order = await Order.findOne({
    customer: req.customer._id,
    'lines.product': req.params.productId,
    status: { $nin: ['cancelled', 'returned'] },
  }).lean();
  res.json({ canReview: !!order });
});

// POST /api/reviews — submit a review (requires purchase)
router.post('/', customerAuth, async (req, res) => {
  const { product, stars, title, text } = req.body;
  if (!product || !stars || !text) return res.status(400).json({ message: 'Missing fields' });

  const order = await Order.findOne({
    customer: req.customer._id,
    'lines.product': product,
    status: { $nin: ['cancelled', 'returned'] },
  }).lean();
  if (!order) return res.status(403).json({ message: 'You can only review products you have purchased.' });

  const review = await Review.create({
    product,
    who: req.customer.name,
    email: req.customer.email || undefined,
    stars, title, text,
    customer: req.customer._id,
    verified: true,
  });
  res.status(201).json(review);
});

// Admin: list all
router.get('/admin/all', adminAuth, async (req, res) => {
  const { status = 'pending', page = 1, limit = 50 } = req.query;
  const q = status !== 'all' ? { status } : {};
  const [reviews, total] = await Promise.all([
    Review.find(q).populate('product', 'name images').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
    Review.countDocuments(q),
  ]);
  res.json({ reviews, total });
});

// PATCH /api/reviews/:id/status
router.patch('/:id/status', adminAuth, async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!review) return res.status(404).json({ message: 'Not found' });

  // Recompute product rating
  const approvedReviews = await Review.find({ product: review.product, status: 'approved' });
  if (approvedReviews.length > 0) {
    const avg = approvedReviews.reduce((s, r) => s + r.stars, 0) / approvedReviews.length;
    await Product.findByIdAndUpdate(review.product, { rating: +avg.toFixed(1), reviewCount: approvedReviews.length });
  }

  res.json(review);
});

// PATCH /api/reviews/:id/reply
router.patch('/:id/reply', adminAuth, async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { adminReply: req.body.reply }, { new: true });
  res.json(review);
});

router.delete('/:id', adminAuth, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
