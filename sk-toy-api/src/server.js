require('dotenv').config();
const app = require('./app');
const connect = require('./db');
const Product = require('./models/Product');

const PORT = process.env.PORT || 5000;

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
