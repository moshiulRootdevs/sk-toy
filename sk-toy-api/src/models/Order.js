const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  sku:      String,
  image:    String,
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
  variant:  String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNo:       { type: String, unique: true },
  customer:      { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName:  { type: String, required: true },
  customerEmail: String,
  phone:         { type: String, required: true },
  address:       { type: String, required: true },
  area:          String,
  district:      String,
  lines:         [lineSchema],
  subtotal:      { type: Number, required: true },
  shipping:      { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  coupon:        String,
  giftWrap:      { type: Boolean, default: false },
  giftWrapCost:  { type: Number, default: 0 },
  note:          String,
  // Fulfilment
  status: {
    type: String,
    enum: ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'new',
  },
  // Payment
  paymentMethod: { type: String, enum: ['cod', 'bkash', 'nagad', 'card'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'collected', 'refunded', 'failed'], default: 'pending' },
  bkashPaymentId: String,
  bkashTrxId:     String,
  // Courier
  courier:     String,
  trackingNo:  String,
  // Internal
  staffNote:   String,
}, { timestamps: true });

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const count = await this.constructor.countDocuments();
  this.orderNo = 'SK' + String(count + 1).padStart(5, '0');
  next();
});

orderSchema.index({ orderNo: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
