const mongoose = require('mongoose');

const stockTransferSchema = new mongoose.Schema({
  from:   { type: String, required: true },
  to:     { type: String, required: true },
  items:  { type: Number, default: 0 },
  units:  { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'in_transit', 'received', 'completed'], default: 'pending' },
  lines:  [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty:     Number,
  }],
  note:   String,
  transferDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('StockTransfer', stockTransferSchema);
