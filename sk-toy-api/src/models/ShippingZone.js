const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  areas:    [String],
  flat:     { type: Number, default: 60 },
  freeOver: { type: Number, default: 2500 },
  etaDays:  { type: String, default: '1-3' },
  default:  { type: Boolean, default: false },
  active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
