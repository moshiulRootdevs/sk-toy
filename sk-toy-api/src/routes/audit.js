const router = require('express').Router();
const AuditLog = require('../models/AuditLog');
const { adminAuth } = require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  const [logs, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).lean(),
    AuditLog.countDocuments(),
  ]);
  res.json({ logs, total });
});

module.exports = router;
