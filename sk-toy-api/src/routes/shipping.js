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

// Public: get shipping cost for area + subtotal
router.post('/calculate', async (req, res) => {
  const { area, district, subtotal } = req.body;
  const zone = await ShippingZone.findOne({ areas: { $in: [district || area] }, active: true }) ||
               await ShippingZone.findOne({ default: true, active: true });
  if (!zone) return res.json({ cost: 60, etaDays: '2-4' });
  const cost = subtotal >= zone.freeOver ? 0 : zone.flat;
  res.json({ cost, etaDays: zone.etaDays, zoneName: zone.name });
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
