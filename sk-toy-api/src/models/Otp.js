const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone:     { type: String, required: true, index: true, trim: true },
  code:      { type: String, required: true },
  // What the OTP is intended to authorize. Verifications check this so a
  // signup OTP can't be used to reset a password and vice-versa.
  purpose:   { type: String, enum: ['signup', 'reset'], default: 'signup', index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL — Mongo auto-deletes after expiry
  attempts:  { type: Number, default: 0 },
  consumed:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
