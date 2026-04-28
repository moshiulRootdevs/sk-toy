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
  email:     { type: String, required: true, unique: true, lowercase: true },
  phone:     { type: String },
  password:  { type: String, select: false },
  addresses: [addressSchema],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  tier:      { type: String, enum: ['Bronze', 'Silver', 'Gold', 'VIP'], default: 'Bronze' },
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
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
