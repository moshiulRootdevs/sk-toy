const router = require('express').Router();
const Product = require('../models/Product');
const StockTransfer = require('../models/StockTransfer');
const { adminAuth } = require('../middleware/auth');

router.get('/summary', adminAuth, async (req, res) => {
  const products = await Product.find().select('name sku stock price').lean();
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 8).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  res.json({ totalUnits, totalValue, lowStock, outOfStock, totalSkus: products.length });
});

// Adjust stock for a product
router.patch('/products/:id/stock', adminAuth, async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { stock: +stock }, { new: true });
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});

// Stock transfers
router.get('/transfers', adminAuth, async (req, res) => {
  const transfers = await StockTransfer.find().sort({ createdAt: -1 }).limit(20).lean();
  res.json(transfers);
});

router.post('/transfers', adminAuth, async (req, res) => {
  const transfer = await StockTransfer.create(req.body);
  res.status(201).json(transfer);
});

router.patch('/transfers/:id/status', adminAuth, async (req, res) => {
  const transfer = await StockTransfer.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(transfer);
});

module.exports = router;
