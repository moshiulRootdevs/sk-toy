const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  sku:   String,
  stock: { type: Number, default: 0 },
  price: Number,              // override price if different
  image: String,
}, { _id: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  sku:         { type: String, unique: true, sparse: true },
  description: String,
  // `category` is the legacy primary category (mirrors categories[0]). Kept for back-compat.
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  // `categories` is the canonical multi-category field.
  categories:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  // Additional taxonomy
  ageGroup:    { type: String, enum: ['age-0-2', 'age-3-5', 'age-6-8', 'age-9-12', 'age-teen', ''] },
  gender:      { type: String, enum: ['boys', 'girls', 'neutral', ''] },
  price:       { type: Number, required: true },
  comparePrice: Number,       // was / crossed-out price
  images:      [String],      // array of image paths
  stock:       { type: Number, default: 0 },
  trackInventory: { type: Boolean, default: true },
  variants:    [variantSchema],
  badge:       { type: String, enum: ['new', 'sale', 'hot', 'clearance', ''], default: '' },
  active:      { type: Boolean, default: true },
  rating:      { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // Engagement counters used for the Trending list
  viewCount:     { type: Number, default: 0 },
  cartAddCount:  { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
  orderCount:    { type: Number, default: 0 },
  // Homepage showcase — manually assigned sections
  showcaseSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HomeSection' }],
  // SEO
  metaTitle:       String,
  metaDescription: String,
  // Shipping
  weight:      Number,
  dimensions:  { l: Number, w: Number, h: Number },
}, { timestamps: true });

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ categories: 1 });

productSchema.index({ active: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
