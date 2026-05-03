const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  type:        { type: String, enum: ['percent', 'fixed', 'shipping'], required: true },
  value:       { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },
  description: String,
  minSpend:    { type: Number, default: 0 },
  limit:       { type: Number, default: null },
  uses:        { type: Number, default: 0 },
  appliesTo:   { type: String, default: 'all' }, // 'all' | 'category:toys' | etc.
  startsAt:    Date,
  endsAt:      Date,
  status:      { type: String, enum: ['active', 'scheduled', 'expired'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
