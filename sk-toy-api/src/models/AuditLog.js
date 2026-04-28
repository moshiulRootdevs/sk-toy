const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  who:    { type: String, required: true },      // user name
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },       // e.g. 'CREATED', 'UPDATED', 'DELETED'
  entity: { type: String, required: true },       // e.g. 'Product', 'Order'
  entityId: String,
  detail: String,                                 // human-readable summary
  ip:     String,
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
