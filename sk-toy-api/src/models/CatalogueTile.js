const mongoose = require('mongoose');

const catalogueTileSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  icon:        String,   // emoji character or image path
  bgColor:     String,   // hex color for icon circle background
  link:        { type: String, required: true },
  enabled:     { type: Boolean, default: true },
  order:       { type: Number, required: true },
}, { timestamps: true });

catalogueTileSchema.index({ order: 1 });

module.exports = mongoose.model('CatalogueTile', catalogueTileSchema);
