const mongoose = require('mongoose');

const benefitItemSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
}, { _id: true });

const benefitSchema = new mongoose.Schema({
  title:      { type: String, required: true, default: 'Premium Benefits' },
  items:      [benefitItemSchema],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applyToAll: { type: Boolean, default: true },
  status:     { type: String, enum: ['draft', 'published'], default: 'published' },
  order:      { type: Number, default: 0 },
}, { timestamps: true });

benefitSchema.index({ categories: 1 });
benefitSchema.index({ applyToAll: 1 });

module.exports = mongoose.model('Benefit', benefitSchema);
