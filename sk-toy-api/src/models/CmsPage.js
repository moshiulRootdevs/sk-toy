const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  type:  { type: String, enum: ['heading', 'paragraph', 'qa', 'image', 'divider', 'list'], required: true },
  text:  String,
  q:     String,
  a:     String,
  src:   String,
  items: [String],
}, { _id: true });

const cmsPageSchema = new mongoose.Schema({
  title:  { type: String, required: true },
  slug:   { type: String, required: true, unique: true },
  blocks: [blockSchema],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  metaTitle:       String,
  metaDescription: String,
}, { timestamps: true });

module.exports = mongoose.model('CmsPage', cmsPageSchema);
