/**
 * One-time migration: fix invalid gender / ageGroup values stored by the old admin UI.
 * Run once: node src/seed/fix-gender.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const GENDER_MAP = {
  'All': '', 'all': '', 'Unisex': 'neutral', 'unisex': 'neutral',
  'Boys': 'boys', 'Girls': 'girls',
};
const AGE_MAP = {
  '0-2': 'age-0-2', '3-5': 'age-3-5', '6-8': 'age-6-8',
  '9-12': 'age-9-12', '12+': 'age-teen', 'teen': 'age-teen',
};

const VALID_GENDERS = new Set(['boys', 'girls', 'neutral', '']);
const VALID_AGES   = new Set(['age-0-2', 'age-3-5', 'age-6-8', 'age-9-12', 'age-teen', '']);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = require('../models/Product');

  const products = await Product.find({}).lean();
  let fixed = 0;

  for (const p of products) {
    const update = {};

    if (!VALID_GENDERS.has(p.gender ?? '')) {
      update.gender = GENDER_MAP[p.gender] ?? '';
    }
    if (!VALID_AGES.has(p.ageGroup ?? '')) {
      update.ageGroup = AGE_MAP[p.ageGroup] ?? '';
    }

    if (Object.keys(update).length) {
      await Product.updateOne({ _id: p._id }, { $set: update });
      console.log(`Fixed ${p.name}: ${JSON.stringify(update)}`);
      fixed++;
    }
  }

  console.log(`\nDone — ${fixed} of ${products.length} products updated.`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
