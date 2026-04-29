const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  slug:     { type: String, required: true, unique: true },
  excerpt:  String,
  body:     String,            // Markdown
  category: String,
  author:   String,
  readTime: String,
  coverImage: String,
  status:   { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: Date,
  metaTitle:       String,
  metaDescription: String,
}, { timestamps: true });

blogPostSchema.index({ status: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
