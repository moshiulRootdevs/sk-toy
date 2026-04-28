const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

// Admin/staff auth — requires a valid admin JWT
const adminAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+active');
    if (!user || !user.active) return res.status(401).json({ message: 'Unauthorized' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Super-admin only
const superAdmin = (req, res, next) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

// Customer auth — storefront JWT
const customerAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);
    if (!customer || !customer.active) return res.status(401).json({ message: 'Unauthorized' });
    req.customer = customer;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Optional customer auth — attaches customer if token present, but doesn't block
const optionalCustomer = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      if (decoded.type === 'customer') {
        req.customer = await Customer.findById(decoded.id);
      }
    } catch {}
  }
  next();
};

module.exports = { adminAuth, superAdmin, customerAuth, optionalCustomer };
