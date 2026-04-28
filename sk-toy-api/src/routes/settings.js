const router = require('express').Router();
const Settings = require('../models/Settings');
const { adminAuth } = require('../middleware/auth');

const getOrCreate = () => Settings.findOneAndUpdate(
  { key: 'global' },
  { $setOnInsert: { key: 'global' } },
  { upsert: true, new: true }
);

router.get('/', async (req, res) => {
  const settings = await getOrCreate();
  res.json(settings);
});

router.put('/', adminAuth, async (req, res) => {
  // Deep merge: req.body should only contain the keys to update
  const settings = await Settings.findOneAndUpdate(
    { key: 'global' },
    { $set: flattenUpdates(req.body) },
    { upsert: true, new: true }
  );
  res.json(settings);
});

// Flatten nested object to dot-notation for $set
function flattenUpdates(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const val = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenUpdates(val, fullKey));
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

module.exports = router;
