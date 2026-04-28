const AuditLog = require('../models/AuditLog');

// Factory — creates middleware that logs an admin action after route completes
const audit = (action, entity, getDetail) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // Fire-and-forget audit log after successful write (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const entityId = body?._id || body?.data?._id || req.params.id || '';
      const detail = typeof getDetail === 'function'
        ? getDetail(req, body)
        : (getDetail || `${action} ${entity}`);
      AuditLog.create({
        who:      req.user.name,
        userId:   req.user._id,
        action,
        entity,
        entityId: String(entityId),
        detail,
        ip:       req.ip,
      }).catch(() => {});
    }
    return originalJson(body);
  };
  next();
};

module.exports = audit;
