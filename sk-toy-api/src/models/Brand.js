const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, required: true, unique: true },
  em:          { type: String },       // short 2-char tag for display
  logo:        { type: String },       // image path
  description: String,
  website:     String,
  active:      { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
