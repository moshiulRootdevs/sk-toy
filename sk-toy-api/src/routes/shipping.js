const router = require('express').Router();
const ShippingZone = require('../models/ShippingZone');
const Courier = require('../models/Courier');
const Settings = require('../models/Settings');
const { adminAuth } = require('../middleware/auth');

// Public: get the two delivery options (Inside / Outside Dhaka)
router.get('/options', async (req, res) => {
  const settings = await Settings.findOne({ key: 'global' }).lean();
  const s = settings?.shipping || {};
  res.json({
    insideDhaka: {
      title:       s.insideDhaka?.title       || 'Inside Dhaka',
      amount:      s.insideDhaka?.amount      ?? 60,
      description: s.insideDhaka?.description || 'Delivered within 1–2 business days',
      freeOver:    s.insideDhaka?.freeOver    ?? 0,
    },
    outsideDhaka: {
      title:       s.outsideDhaka?.title       || 'Outside Dhaka',
      amount:      s.outsideDhaka?.amount      ?? 120,
      description: s.outsideDhaka?.description || 'Delivered within 3–5 business days',
      freeOver:    s.outsideDhaka?.freeOver    ?? 0,
    },
  });
});

// Public: get shipping cost for area + subtotal — uses settings.shipping so
// it stays in sync with the admin Settings → Shipping page everywhere.
router.post('/calculate', async (req, res) => {
  const { district, subtotal = 0 } = req.body;
  const settings = await Settings.findOne({ key: 'global' }).lean();
  const isInsideDhaka = String(district || '').trim().toLowerCase() === 'dhaka';
  const cfg = isInsideDhaka ? settings?.shipping?.insideDhaka : settings?.shipping?.outsideDhaka;

  const flat = typeof cfg?.amount === 'number' ? cfg.amount : (isInsideDhaka ? 60 : 120);
  const freeOver = cfg?.freeOver || 0;
  let cost = (freeOver > 0 && subtotal >= freeOver) ? 0 : flat;
  if (settings?.policies?.freeShippingOver && subtotal >= settings.policies.freeShippingOver) cost = 0;

  res.json({
    cost,
    zoneName: isInsideDhaka ? (cfg?.title || 'Inside Dhaka') : (cfg?.title || 'Outside Dhaka'),
  });
});

// Zones
router.get('/zones', adminAuth, async (req, res) => {
  res.json(await ShippingZone.find().sort({ createdAt: 1 }).lean());
});

router.post('/zones', adminAuth, async (req, res) => {
  const zone = await ShippingZone.create(req.body);
  res.status(201).json(zone);
});

router.put('/zones/:id', adminAuth, async (req, res) => {
  const zone = await ShippingZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!zone) return res.status(404).json({ message: 'Not found' });
  res.json(zone);
});

router.delete('/zones/:id', adminAuth, async (req, res) => {
  await ShippingZone.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Couriers
router.get('/couriers', adminAuth, async (req, res) => {
  res.json(await Courier.find().lean());
});

router.put('/couriers/:id', adminAuth, async (req, res) => {
  const c = await Courier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(c);
});

module.exports = router;
