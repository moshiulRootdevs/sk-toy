const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { adminAuth } = require('../middleware/auth');

router.get('/dashboard', adminAuth, async (req, res) => {
  const now = new Date();

  // Day boundaries (local midnight → next midnight)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1);

  // Month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // 14-day window for chart
  const chartStart = new Date(todayStart); chartStart.setDate(chartStart.getDate() - 13);

  const [
    todayAgg,
    monthAgg,
    pendingCount,
    totalCustomers,
    newCustomers,
    chartAgg,
    lowStock,
    newOrders,
    recentCustomers,
  ] = await Promise.all([
    // Today revenue + orders
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lt: todayEnd }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),

    // This month revenue + orders
    Order.aggregate([
      { $match: { createdAt: { $gte: monthStart, $lt: monthEnd }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]),

    // Pending (new) orders count
    Order.countDocuments({ status: 'new' }),

    // Total customers
    Customer.countDocuments(),

    // New customers this month
    Customer.countDocuments({ createdAt: { $gte: monthStart, $lt: monthEnd } }),

    // Revenue by day for last 14 days
    Order.aggregate([
      { $match: { createdAt: { $gte: chartStart }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day:   { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]),

    // Low stock products
    Product.find({ stock: { $lt: 8 } }, 'name stock').lean().limit(7),

    // New orders (status = 'new'), most recent first
    Order.find({ status: 'new' }, 'orderNo customerName total status createdAt')
      .sort({ createdAt: -1 }).limit(8).lean(),

    // Recent customers
    Customer.find({}, 'name email tier createdAt')
      .sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  // Build a full 14-day date array filled with zeros then overlay actual data
  const revenueMap = {};
  chartAgg.forEach(({ _id, revenue }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, '0')}-${String(_id.day).padStart(2, '0')}`;
    revenueMap[key] = revenue;
  });

  const revenueByDay = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    revenueByDay.push({ date: key, revenue: revenueMap[key] || 0 });
  }

  const today = todayAgg[0] || {};
  const month = monthAgg[0] || {};

  res.json({
    adminName: req.user?.name || 'Admin',
    kpis: {
      todayRevenue:   today.revenue  || 0,
      todayOrders:    today.orders   || 0,
      monthRevenue:   month.revenue  || 0,
      monthOrders:    month.orders   || 0,
      totalCustomers,
      newCustomers,
      pendingOrders:  pendingCount,
    },
    revenueByDay,
    lowStock,
    newOrders,
    recentCustomers,
  });
});

router.get('/sales-by-category', adminAuth, async (req, res) => {
  const orders = await Order.find({ status: { $ne: 'cancelled' } }).lean();
  const productIds = [...new Set(orders.flatMap(o => o.lines.map(l => String(l.product))))];
  const products = await Product.find({ _id: { $in: productIds } }).populate('category', 'name').lean();
  const map = Object.fromEntries(products.map(p => [String(p._id), p]));

  const byCategory = {};
  orders.forEach(o => {
    o.lines.forEach(l => {
      const p = map[String(l.product)];
      if (!p) return;
      const cat = p.category?.name || 'Unknown';
      byCategory[cat] = (byCategory[cat] || 0) + l.price * l.qty;
    });
  });

  res.json(Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue })));
});

module.exports = router;
