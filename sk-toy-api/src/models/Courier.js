const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  apiKey:   String,
  baseRate: { type: Number, default: 60 },
  zones:    [String],
  enabled:  { type: Boolean, default: false },
  trackingUrlPattern: String,  // e.g. https://pathao.com/track?id={trackingNo}
}, { timestamps: true });

module.exports = mongoose.model('Courier', courierSchema);
