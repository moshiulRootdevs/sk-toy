require('dotenv').config();
const app = require('./app');
const connect = require('./db');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

const PORT = process.env.PORT || 5000;

// One-shot cleanup: older versions of the Customer schema had `email`
// declared as a unique index. The current schema dropped that, but the
// index can persist in MongoDB and cause E11000 on any second customer
// created without an email — breaking signup. We drop it once at startup.
async function dropStaleCustomerIndexes() {
  try {
    const indexes = await Customer.collection.indexes();
    const stale = indexes.find((idx) =>
      idx.key && idx.key.email === 1 && idx.unique === true && idx.sparse !== true,
    );
    if (stale) {
      await Customer.collection.dropIndex(stale.name);
      console.log(`[migration] Dropped stale unique index on Customer.email (${stale.name})`);
    }
  } catch (e) {
    console.warn('[migration] Could not check Customer indexes:', e.message);
  }
}

async function backfillProductCategories() {
  // For products that have a single `category` set but no `categories` array,
  // copy the legacy field into the new array so multi-category queries work.
  const result = await Product.updateMany(
    { category: { $exists: true, $ne: null }, $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }] },
    [{ $set: { categories: ['$category'] } }],
  );
  if (result.modifiedCount > 0) {
    console.log(`[migration] Backfilled categories[] on ${result.modifiedCount} product(s)`);
  }
}

connect().then(async () => {
  try { await dropStaleCustomerIndexes(); } catch (e) { console.error('customer index cleanup failed:', e.message); }
  try { await backfillProductCategories(); } catch (e) { console.error('backfill failed:', e.message); }
  const server = app.listen(PORT, () => {
    console.log(`SK Toy API running on http://localhost:${PORT}`);
  });
  server.timeout = 600000; // 10 minutes for video upload + transcoding
  server.keepAliveTimeout = 620000;
}).catch(err => {
  console.error('DB connection failed:', err);
  process.exit(1);
});
