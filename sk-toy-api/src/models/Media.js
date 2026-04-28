const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  url:       { type: String, required: true },
  mimetype:  String,
  size:      Number,
  tag:       { type: String, enum: ['product', 'banner', 'blog', 'general', 'logo', 'hero'], default: 'general' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
