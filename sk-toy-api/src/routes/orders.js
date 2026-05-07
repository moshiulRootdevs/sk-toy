const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const { adminAuth, customerAuth, optionalCustomer } = require('../middleware/auth');
const audit = require('../middleware/audit');
const { sendOrderConfirmation } = require('../utils/mailer');

// ── Stock management helpers ─────────────────────────────────────────────

// Statuses where stock has been released (not held by the order)
const STOCK_RELEASED_STATUSES = new Set(['cancelled', 'returned']);

/**
 * Restore stock for all lines in an order (when cancelled/returned).
 * Increments product stock and variant stock back.
 */
async function restoreStock(order) {
  if (!order.lines || !order.lines.length) return;
  const bulkOps = [];
  for (const line of order.lines) {
    if (line.variant) {
      bulkOps.push({
        updateOne: {
          filter: { _id: line.product, 'variants.name': line.variant },
          update: { $inc: { stock: line.qty, 'variants.$.stock': line.qty, orderCount: -line.qty } },
        },
      });
    } else {
      bulkOps.push({
        updateOne: { filter: { _id: line.product }, update: { $inc: { stock: line.qty, orderCount: -line.qty } } },
      });
    }
  }
  if (bulkOps.length) await Product.bulkWrite(bulkOps);
}

/**
 * Deduct stock for all lines in an order (when reactivating a cancelled/returned order).
 * Decrements product stock and variant stock.
 */
async function deductStock(order) {
  if (!order.lines || !order.lines.length) return;
  const bulkOps = [];
  for (const line of order.lines) {
    if (line.variant) {
      bulkOps.push({
        updateOne: {
          filter: { _id: line.product, 'variants.name': line.variant },
          update: { $inc: { stock: -line.qty, 'variants.$.stock': -line.qty, orderCount: line.qty } },
        },
      });
    } else {
      bulkOps.push({
        updateOne: { filter: { _id: line.product }, update: { $inc: { stock: -line.qty, orderCount: line.qty } } },
      });
    }
  }
  if (bulkOps.length) await Product.bulkWrite(bulkOps);
}

// ── Public / customer ────────────────────────────────────────────────────

// POST /api/orders — place order
router.post('/', optionalCustomer, async (req, res) => {
  const { lines, customerName, customerEmail, phone, altPhone, address, area, district, deliveryZone, paymentMethod, coupon: couponCode, giftWrap, note } = req.body;

  if (!lines?.length || !customerName || !phone || !address || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Resolve products and compute subtotal — lean + Map lookup is O(N+M) instead
  // of O(N*M) from the previous .find() inside .map().
  const productIds = lines.map((l) => l.product);
  const products = await Product.find({ _id: { $in: productIds } })
    .select('name sku price images variants stock')
    .lean();
  const productById = new Map(products.map((p) => [String(p._id), p]));
  let subtotal = 0;
  const resolvedLines = lines.map((l) => {
    const p = productById.get(String(l.product));
    if (!p) return res.status(400).json({ message: `Product ${l.product} not found` });
    // Require variant selection for products that have variants
    if (p.variants?.length && !l.variant) {
      return res.status(400).json({ message: `Please select a variant for "${p.name}"` });
    }
    // Resolve variant price and SKU if a variant is specified
    let price = p.price;
    let sku = p.sku;
    let variantImage = '';
    if (l.variant && p.variants?.length) {
      const matchedVariant = p.variants.find((v) => v.name === l.variant);
      if (matchedVariant) {
        if (matchedVariant.price) price = matchedVariant.price;
        if (matchedVariant.sku) sku = matchedVariant.sku;
        if (matchedVariant.image) variantImage = matchedVariant.image;
      }
    }
    subtotal += price * l.qty;
    return { product: p._id, name: p.name, sku, image: variantImage || p.images?.[0] || '', price, qty: l.qty, variant: l.variant };
  });

  // Shipping cost — single source of truth is settings.shipping (admin edits
  // these in Settings → Shipping). The customer chooses Inside/Outside Dhaka
  // at checkout; fall back to district-based selection if the client omits it.
  const settings = await Settings.findOne({ key: 'global' }).lean();
  const districtIsDhaka = String(district || '').trim().toLowerCase() === 'dhaka';
  const isInsideDhaka = deliveryZone === 'inside' || deliveryZone === 'outside'
    ? deliveryZone === 'inside'
    : districtIsDhaka;
  const shippingConfig = isInsideDhaka
    ? settings?.shipping?.insideDhaka
    : settings?.shipping?.outsideDhaka;

  const flat = typeof shippingConfig?.amount === 'number'
    ? shippingConfig.amount
    : (isInsideDhaka ? 60 : 120);
  const freeOver = shippingConfig?.freeOver || 0;
  let shippingCost = (freeOver > 0 && subtotal >= freeOver) ? 0 : flat;
  if (settings?.policies?.freeShippingOver && subtotal >= settings.policies.freeShippingOver) {
    shippingCost = 0;
  }

  // Coupon
  let discount = 0;
  if (couponCode) {
    const couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'active' });
    if (couponDoc && (!couponDoc.endsAt || couponDoc.endsAt > new Date()) && subtotal >= couponDoc.minSpend) {
      if (couponDoc.type === 'percent') {
        discount = Math.round(subtotal * couponDoc.value / 100);
        if (couponDoc.maxDiscount && discount > couponDoc.maxDiscount) discount = couponDoc.maxDiscount;
      }
      else if (couponDoc.type === 'fixed') discount = couponDoc.value;
      else if (couponDoc.type === 'shipping') discount = shippingCost;
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { uses: 1 } });
    }
  }

  const giftWrapCost = giftWrap ? (settings?.policies?.giftWrapCost || 120) : 0;
  const total = subtotal + shippingCost + giftWrapCost - discount;

  const order = await Order.create({
    customerName,
    customerEmail,
    phone,
    altPhone,
    address,
    area,
    district,
    customer: req.customer?._id,
    lines: resolvedLines,
    subtotal,
    shipping: shippingCost,
    discount,
    giftWrap,
    giftWrapCost,
    total,
    coupon: couponCode,
    paymentMethod,
    note,
  });

  // Decrement stock and increment order counter (used for trending).
  // For variant products, decrement both the variant stock and product-level stock.
  if (resolvedLines.length) {
    const bulkOps = [];
    for (const l of resolvedLines) {
      const originalLine = lines.find((ol) => String(ol.product) === String(l.product) && (ol.variant || '') === (l.variant || ''));
      const variantName = originalLine?.variant || l.variant;
      if (variantName) {
        // Decrement variant stock + product-level stock + increment orderCount
        bulkOps.push({
          updateOne: {
            filter: { _id: l.product, 'variants.name': variantName },
            update: { $inc: { stock: -l.qty, orderCount: l.qty, 'variants.$.stock': -l.qty } },
          },
        });
      } else {
        bulkOps.push({
          updateOne: { filter: { _id: l.product }, update: { $inc: { stock: -l.qty, orderCount: l.qty } } },
        });
      }
    }
    await Product.bulkWrite(bulkOps);
  }

  // Update customer stats
  if (req.customer) {
    await Customer.findByIdAndUpdate(req.customer._id, {
      $inc: { orders: 1, spend: total },
      lastOrder: new Date(),
    });
  }

  // Send invoice email (non-blocking — never fails the response)
  sendOrderConfirmation(order.toObject()).catch(() => {});

  res.status(201).json(order);
});

// GET /api/orders/confirm/:orderNo — public, for order confirmation page
router.get('/confirm/:orderNo', async (req, res) => {
  const order = await Order.findOne({ orderNo: req.params.orderNo }).lean();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// GET /api/orders/track?orderNo=SK00001&phone=...
router.get('/track', async (req, res) => {
  const { orderNo, phone } = req.query;
  if (!orderNo || !phone) return res.status(400).json({ message: 'orderNo and phone required' });
  const order = await Order.findOne({ orderNo, phone }).populate('lines.product', 'name images slug').lean();
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// GET /api/orders/my — customer's own orders.
// Match by customer ref OR by phone — covers orders placed before login or
// where the token didn't attach for some reason, so a registered user always
// sees orders tied to their verified phone number.
router.get('/my', customerAuth, async (req, res) => {
  const conditions = [{ customer: req.customer._id }];
  if (req.customer.phone) conditions.push({ phone: req.customer.phone });
  const orders = await Order.find({ $or: conditions }).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

// ── Admin ────────────────────────────────────────────────────────────────

router.get('/admin/all', adminAuth, async (req, res) => {
  const { status, search, page = 1, limit = 50, from, to } = req.query;
  const q = {};
  if (status && status !== 'all') q.status = status;
  if (search) q.$or = [
    { orderNo: { $regex: search, $options: 'i' } },
    { customerName: { $regex: search, $options: 'i' } },
    { phone: { $regex: search, $options: 'i' } },
  ];
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
  }
  const skip = (+page - 1) * +limit;
  const [orders, total] = await Promise.all([
    Order.find(q).sort({ createdAt: -1 }).skip(skip).limit(+limit).lean(),
    Order.countDocuments(q),
  ]);
  res.json({ orders, total, page: +page, pages: Math.ceil(total / +limit) });
});

// GET /api/orders/admin/stats — aggregate stats with optional date range
router.get('/admin/stats', adminAuth, async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
  }

  const [stats] = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' },
        totalShipping: { $sum: '$shipping' },
        totalDiscount: { $sum: '$discount' },
      },
    },
  ]);

  const statusCounts = await Order.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const paymentCounts = await Order.aggregate([
    { $match: match },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } },
  ]);

  const paymentStatusRevenue = await Order.aggregate([
    { $match: match },
    { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$total' } } },
  ]);

  res.json({
    totalOrders: stats?.totalOrders || 0,
    totalRevenue: stats?.totalRevenue || 0,
    avgOrderValue: stats?.avgOrderValue || 0,
    totalShipping: stats?.totalShipping || 0,
    totalDiscount: stats?.totalDiscount || 0,
    statusCounts: statusCounts.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
    paymentCounts: paymentCounts.reduce((acc, p) => { acc[p._id] = { count: p.count, total: p.total }; return acc; }, {}),
    paymentStatusRevenue: paymentStatusRevenue.reduce((acc, p) => { acc[p._id] = { count: p.count, total: p.total }; return acc; }, {}),
  });
});

// GET /api/orders/admin/phone-history/:phone — order count by phone
router.get('/admin/phone-history/:phone', adminAuth, async (req, res) => {
  const count = await Order.countDocuments({ phone: req.params.phone });
  res.json({ count });
});

router.get('/admin/:id', adminAuth, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('lines.product', 'name images sku').lean();
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

router.put('/admin/:id', adminAuth, audit('UPDATED', 'Order', (req) => `Updated order ${req.params.id}`), async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

// PATCH /api/orders/admin/:id/amounts — super-admin edits subtotal/shipping/
// discount with a mandatory note. Each changed field is recorded in
// order.adjustments for an audit trail. The total is recomputed from the
// resulting subtotal + shipping − discount + giftWrapCost so it stays consistent.
router.patch('/admin/:id/amounts', adminAuth, audit('UPDATED', 'Order', (req) => `Edited amounts on order ${req.params.id}`), async (req, res) => {
  const note = String(req.body.note || '').trim();
  if (!note) return res.status(400).json({ message: 'A note is required when editing order amounts.' });
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admins can edit order amounts.' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });

  const changes = [];
  for (const field of ['subtotal', 'shipping', 'discount']) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') continue;
    const newValue = Number(req.body[field]);
    if (!Number.isFinite(newValue) || newValue < 0) {
      return res.status(400).json({ message: `${field} must be a non-negative number.` });
    }
    const oldValue = Number(order[field] || 0);
    if (newValue !== oldValue) {
      changes.push({ field, oldValue, newValue });
      order[field] = newValue;
    }
  }

  if (!changes.length) return res.status(400).json({ message: 'No changes were made.' });

  const recomputedTotal = Number(order.subtotal || 0) + Number(order.shipping || 0) + Number(order.giftWrapCost || 0) - Number(order.discount || 0);
  if (recomputedTotal !== Number(order.total || 0)) {
    changes.push({ field: 'total', oldValue: Number(order.total || 0), newValue: recomputedTotal });
    order.total = recomputedTotal;
  }

  const stamp = { note, by: req.user?._id, byName: req.user?.name || req.user?.email || 'admin', at: new Date() };
  for (const c of changes) order.adjustments.push({ ...c, ...stamp });

  await order.save();
  res.json(order);
});

// PATCH /api/orders/admin/:id/lines — super-admin edits an order on behalf of
// the customer: add / remove / change qty / swap variants, plus optional
// shipping & discount overrides. Mandatory note. Stock is corrected to match
// the line diff. Subtotal + total are recomputed automatically.
router.patch('/admin/:id/lines', adminAuth, audit('UPDATED', 'Order', (req) => `Edited items on order ${req.params.id}`), async (req, res) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admins can edit order items.' });
  }
  const note = String(req.body.note || '').trim();
  if (!note) return res.status(400).json({ message: 'A note is required when editing order items.' });

  const incoming = Array.isArray(req.body.lines) ? req.body.lines : null;
  if (!incoming || incoming.length === 0) {
    return res.status(400).json({ message: 'Order must have at least one item.' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });

  // Resolve all referenced products in one query.
  const productIds = [...new Set(incoming.map((l) => String(l.product)).filter(Boolean))];
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  // Build new line snapshots (price + sku from the current product/variant) and
  // index the old lines so we can compute stock deltas per product+variant.
  const oldKey = (l) => `${String(l.product)}::${l.variant || ''}`;
  const oldQty = new Map();
  for (const l of order.lines) oldQty.set(oldKey(l), (oldQty.get(oldKey(l)) || 0) + l.qty);

  const resolved = [];
  for (const raw of incoming) {
    const qty = Number(raw.qty);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: 'Each line must have a qty of at least 1.' });
    }
    const product = byId.get(String(raw.product));
    if (!product) return res.status(400).json({ message: `Product ${raw.product} not found.` });

    let price = product.price;
    let sku = product.sku;
    let image = product.images?.[0] || '';
    const variantName = raw.variant || '';
    if (variantName && product.variants?.length) {
      const v = product.variants.find((vv) => vv.name === variantName);
      if (v) {
        if (v.price) price = v.price;
        if (v.sku) sku = v.sku;
        if (v.image) image = v.image;
      }
    }
    resolved.push({ product: product._id, name: product.name, sku, image, price, qty, variant: variantName });
  }

  const newQty = new Map();
  for (const l of resolved) newQty.set(oldKey(l), (newQty.get(oldKey(l)) || 0) + l.qty);

  // Stock adjustment: positive delta = more units sold => decrement stock.
  const allKeys = new Set([...oldQty.keys(), ...newQty.keys()]);
  const bulkOps = [];
  for (const k of allKeys) {
    const [productId, variantName] = k.split('::');
    const delta = (newQty.get(k) || 0) - (oldQty.get(k) || 0);
    if (delta === 0) continue;
    if (variantName) {
      bulkOps.push({
        updateOne: {
          filter: { _id: productId, 'variants.name': variantName },
          update: { $inc: { stock: -delta, 'variants.$.stock': -delta, orderCount: delta } },
        },
      });
    } else {
      bulkOps.push({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { stock: -delta, orderCount: delta } },
        },
      });
    }
  }
  if (bulkOps.length) await Product.bulkWrite(bulkOps);

  // Build a short before/after summary for the audit log.
  const summarize = (lines) =>
    lines.map((l) => `${l.name || l.product}${l.variant ? ` (${l.variant})` : ''} ×${l.qty}`).join(', ') || '—';
  const oldSummary = summarize(order.lines);
  const newSummary = summarize(resolved);

  // Optional shipping / discount overrides — validate before applying.
  const oldShipping = Number(order.shipping || 0);
  const oldDiscount = Number(order.discount || 0);
  let newShipping = oldShipping;
  let newDiscount = oldDiscount;
  if (req.body.shipping !== undefined && req.body.shipping !== null && req.body.shipping !== '') {
    const v = Number(req.body.shipping);
    if (!Number.isFinite(v) || v < 0) return res.status(400).json({ message: 'Shipping must be a non-negative number.' });
    newShipping = v;
  }
  if (req.body.discount !== undefined && req.body.discount !== null && req.body.discount !== '') {
    const v = Number(req.body.discount);
    if (!Number.isFinite(v) || v < 0) return res.status(400).json({ message: 'Discount must be a non-negative number.' });
    newDiscount = v;
  }

  // Recompute subtotal + total from the new lines and shipping / discount.
  const newSubtotal = resolved.reduce((a, l) => a + l.price * l.qty, 0);
  const newTotal = newSubtotal + newShipping + Number(order.giftWrapCost || 0) - newDiscount;

  const stamp = { note, by: req.user._id, byName: req.user.name || req.user.email || 'admin', at: new Date() };
  if (oldSummary !== newSummary) {
    order.adjustments.push({ field: 'lines', oldValue: oldSummary, newValue: newSummary, ...stamp });
  }
  if (newSubtotal !== order.subtotal) {
    order.adjustments.push({ field: 'subtotal', oldValue: order.subtotal, newValue: newSubtotal, ...stamp });
  }
  if (newShipping !== oldShipping) {
    order.adjustments.push({ field: 'shipping', oldValue: oldShipping, newValue: newShipping, ...stamp });
  }
  if (newDiscount !== oldDiscount) {
    order.adjustments.push({ field: 'discount', oldValue: oldDiscount, newValue: newDiscount, ...stamp });
  }
  if (newTotal !== order.total) {
    order.adjustments.push({ field: 'total', oldValue: order.total, newValue: newTotal, ...stamp });
  }

  order.lines = resolved;
  order.subtotal = newSubtotal;
  order.shipping = newShipping;
  order.discount = newDiscount;
  order.total = newTotal;
  await order.save();

  res.json(order);
});

// PATCH /api/orders/admin/:id/address — super-admin updates the customer
// contact / shipping address on the order. Mandatory note. Each changed
// field is recorded as a separate adjustment entry. Note: this also
// re-evaluates the shipping cost zone if district changes — but does NOT
// auto-recompute, since the admin may have negotiated a custom shipping
// price already (use Edit Items if shipping needs to follow the new district).
router.patch('/admin/:id/address', adminAuth, audit('UPDATED', 'Order', (req) => `Edited address on order ${req.params.id}`), async (req, res) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admins can edit order address.' });
  }
  const note = String(req.body.note || '').trim();
  if (!note) return res.status(400).json({ message: 'A note is required when editing the address.' });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });

  const editable = ['customerName', 'phone', 'altPhone', 'address', 'area', 'district'];
  const required = ['customerName', 'phone', 'address'];
  const changes = [];
  for (const field of editable) {
    if (req.body[field] === undefined) continue;
    const newValue = String(req.body[field] ?? '').trim();
    if (required.includes(field) && !newValue) {
      return res.status(400).json({ message: `${field} cannot be empty.` });
    }
    const oldValue = String(order[field] ?? '');
    if (newValue !== oldValue) {
      changes.push({ field, oldValue, newValue });
      order[field] = newValue;
    }
  }
  if (!changes.length) return res.status(400).json({ message: 'No changes were made.' });

  const stamp = { note, by: req.user._id, byName: req.user.name || req.user.email || 'admin', at: new Date() };
  for (const c of changes) order.adjustments.push({ ...c, ...stamp });

  await order.save();
  res.json(order);
});

// PATCH /api/orders/admin/:id/status
router.patch('/admin/:id/status', adminAuth, audit('UPDATED', 'Order', (req) => `Status → ${req.body.status} for order ${req.params.id}`), async (req, res) => {
  const { status, paymentStatus, trackingNo, staffNote } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });

  // Handle stock changes when status transitions
  if (status && status !== order.status) {
    const wasReleased = STOCK_RELEASED_STATUSES.has(order.status);
    const willRelease = STOCK_RELEASED_STATUSES.has(status);

    if (!wasReleased && willRelease) {
      // Moving to cancelled/returned → restore stock
      await restoreStock(order);
    } else if (wasReleased && !willRelease) {
      // Reactivating from cancelled/returned → deduct stock again
      await deductStock(order);
    }
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (trackingNo !== undefined) order.trackingNo = trackingNo;
  if (staffNote !== undefined) order.staffNote = staffNote;
  await order.save();
  res.json(order);
});

module.exports = router;
