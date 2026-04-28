const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  who:      { type: String, required: true },
  email:    String,
  stars:    { type: Number, required: true, min: 1, max: 5 },
  title:    String,
  text:     { type: String, required: true },
  verified: { type: Boolean, default: false },
  status:   { type: String, enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'pending' },
  adminReply: String,
}, { timestamps: true });

reviewSchema.index({ product: 1 });
reviewSchema.index({ status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
