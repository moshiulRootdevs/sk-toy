const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  line1:    { type: String, required: true },
  line2:    String,
  area:     String,
  district: String,
  zip:      String,
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const customerSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  // Phone is now the primary identity (verified via OTP). Sparse unique so guest
  // customers without a phone don't collide on null.
  phone:     { type: String, unique: true, sparse: true, trim: true },
  phoneVerified: { type: Boolean, default: false },
  // Email is optional — kept for receipts/notifications only, no longer unique.
  email:     { type: String, lowercase: true, trim: true },
  // Legacy password field — retained for backwards-compat with old accounts.
  // New accounts created via OTP have no password.
  password:  { type: String, select: false },
  addresses: [addressSchema],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  area:      String,
  orders:    { type: Number, default: 0 },
  spend:     { type: Number, default: 0 },
  lastOrder: Date,
  joined:    { type: Date, default: Date.now },
  active:    { type: Boolean, default: true },
  isGuest:   { type: Boolean, default: false },
}, { timestamps: true });

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

customerSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
