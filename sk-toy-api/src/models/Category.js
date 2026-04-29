const mongoose = require('mongoose');

// Self-referencing tree — unlimited depth via parent ref + children array of IDs
const categorySchema = new mongoose.Schema({
  name:     { type: String, required: true },
  slug:     { type: String, required: true, unique: true },
  parent:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tag:      { type: String },          // e.g. 'NEW', 'SALE'
  icon:     { type: String },          // icon key
  image:    { type: String },          // category banner image path
  hidden:   { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
  metaTitle:       String,
  metaDescription: String,
}, { timestamps: true });

categorySchema.index({ parent: 1 });

module.exports = mongoose.model('Category', categorySchema);
