const mongoose = require('mongoose');

// Each document = one homepage section. Order field controls display order.
const homeSectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hero', 'categories', 'products', 'editorial_band', 'brands', 'journal', 'newsletter', 'banner', 'ages'],
    required: true,
  },
  title:    String,          // admin label & storefront heading
  eyebrow:  String,          // small label above heading
  subtitle: String,
  enabled:  { type: Boolean, default: true },
  order:    { type: Number, required: true },

  // For 'products' sections (e.g. Just Landed, Mark-down shelf)
  filter:   String,          // 'new', 'sale', 'clearance', 'featured', or category slug
  limit:    { type: Number, default: 8 },
  ctaLabel: String,
  ctaLink:  String,

  // For 'products' showcase — ordered list of manually curated product refs
  productRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // For 'categories' section — ordered list of manually curated category refs
  // When empty, falls back to all top-level categories sorted by order
  categoryRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

  // For 'banner' section
  bannerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Banner' },

  // For 'editorial_band'
  bandStyle: { type: String, enum: ['yellow', 'dark', 'coral'], default: 'yellow' },
  bandText:  String,
  bandImage: String,
  bandButtons: [{
    label: String,
    link:  String,
    style: { type: String, enum: ['dark', 'outline', 'coral'], default: 'dark' },
  }],
}, { timestamps: true });

homeSectionSchema.index({ order: 1 });

module.exports = mongoose.model('HomeSection', homeSectionSchema);
