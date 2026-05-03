const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Otp = require('../models/Otp');
const { adminAuth, customerAuth } = require('../middleware/auth');
const { sendSms } = require('../utils/sms');

const sign = (id, type = 'admin') =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Bangladeshi phone numbers — 11 digits starting with 01, optional +880 prefix.
function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/[^\d+]/g, '');
  if (/^\+8801\d{9}$/.test(digits)) return digits;
  if (/^8801\d{9}$/.test(digits)) return '+' + digits;
  if (/^01\d{9}$/.test(digits)) return '+880' + digits.slice(1);
  return '';
}

function newCode() {
  if (process.env.NODE_ENV !== 'production') return '000000';
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

const customerPayload = (c) => ({
  id: c._id, name: c.name, phone: c.phone, email: c.email || '',
});

// ── Admin auth ──────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (!user.active) return res.status(403).json({ message: 'Account disabled' });
  res.json({ token: sign(user._id, 'admin'), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.get('/admin/me', adminAuth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

router.put('/admin/profile', adminAuth, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  const user = await User.findByIdAndUpdate(req.user._id, { name: name.trim() }, { new: true });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.put('/admin/password', adminAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ message: 'Wrong current password' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

// ── Customer auth (phone + OTP) ────────────────────────────────────────
// Configurable via env so tests / CI can override
const OTP_TTL_MIN = Number(process.env.OTP_TTL_MIN || 5);
const OTP_RESEND_COOLDOWN_S = Number(process.env.OTP_RESEND_COOLDOWN_S || 30);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
// Brand name shown in SMS bodies. Required by SMS providers in BD so the
// recipient can identify the sender.
const BRAND_NAME = process.env.BRAND_NAME || 'SK Toy';

// POST /api/auth/otp/request — body: { phone, purpose? }
// purpose = 'signup' (default) — phone must NOT already have an account
// purpose = 'reset'            — phone MUST already have an account
router.post('/otp/request', async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const purpose = ['signup', 'reset'].includes(req.body.purpose) ? req.body.purpose : 'signup';
    if (!phone) return res.status(400).json({ message: 'Please enter a valid Bangladeshi phone number.' });

    // Validate phone state matches the requested purpose
    const existing = await Customer.findOne({ phone, isGuest: { $ne: true } });
    if (purpose === 'signup' && existing) {
      return res.status(409).json({ message: 'An account with this number already exists. Please log in.', accountExists: true });
    }
    if (purpose === 'reset' && !existing) {
      return res.status(404).json({ message: 'No account found for this number.', noAccount: true });
    }

    // Resend cooldown — block if a recent OTP was issued for this phone+purpose
    const recent = await Otp.findOne({ phone, purpose, consumed: false }).sort({ createdAt: -1 });
    if (recent) {
      const ageMs = Date.now() - new Date(recent.createdAt).getTime();
      if (ageMs < OTP_RESEND_COOLDOWN_S * 1000) {
        const wait = Math.ceil((OTP_RESEND_COOLDOWN_S * 1000 - ageMs) / 1000);
        return res.status(429).json({ message: `Please wait ${wait}s before requesting another code.` });
      }
    }

    // Invalidate prior OTPs for this phone+purpose so only the freshest is valid
    await Otp.updateMany({ phone, purpose, consumed: false }, { $set: { consumed: true } });

    const code = newCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
    await Otp.create({ phone, code, purpose, expiresAt });

    const body = { message: 'OTP sent. It will expire in ' + OTP_TTL_MIN + ' minutes.', expiresInMin: OTP_TTL_MIN };

    // Skip SMS gateway in non-production to avoid charges; the OTP is the fixed dev code.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP/${purpose}] ${phone} → ${code} (dev mode; SMS not sent)`);
      body.devCode = code;
      return res.json(body);
    }

    // Dispatch via sms.net.bd in the format required by BD SMS providers.
    const message = `Your ${BRAND_NAME} OTP Code is ${code}`;
    const smsResult = await sendSms(phone, message);
    if (smsResult.ok) {
      console.log(`[OTP/${purpose}] ${phone} → sent via SMS gateway`);
    } else if (smsResult.skipped) {
      // No SMS gateway configured — log the code so devs can complete the flow
      console.log(`[OTP/${purpose}] ${phone} → ${code} (SMS_API_KEY not set; expires in ${OTP_TTL_MIN} min)`);
    } else {
      // Gateway returned an error — log details and reject so the user sees a real error.
      console.error(`[OTP/${purpose}] ${phone} → SMS gateway error:`, smsResult.error);
      return res.status(502).json({ message: 'Could not send SMS right now. Please try again in a moment.' });
    }

    res.json(body);
  } catch (err) {
    next(err);
  }
});

// Internal helper — verify an OTP for a given phone+purpose. Returns the OTP
// document on success and consumes it; returns { error, status } on failure.
async function consumeOtp(phone, code, purpose) {
  if (!/^\d{6}$/.test(code)) return { error: 'Enter the 6-digit code.', status: 400 };
  const otp = await Otp.findOne({ phone, purpose, consumed: false }).sort({ createdAt: -1 });
  if (!otp) return { error: 'No active code for this number. Request a new one.', status: 400 };
  if (new Date(otp.expiresAt).getTime() < Date.now()) {
    otp.consumed = true; await otp.save();
    return { error: 'This code has expired. Request a new one.', status: 400 };
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    otp.consumed = true; await otp.save();
    return { error: 'Too many wrong attempts. Request a new code.', status: 429 };
  }
  if (otp.code !== code) {
    otp.attempts += 1;
    await otp.save();
    const remaining = OTP_MAX_ATTEMPTS - otp.attempts;
    return { error: `Wrong code. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`, status: 400 };
  }
  otp.consumed = true;
  await otp.save();
  return { otp };
}

// POST /api/auth/otp/verify — body: { phone, code, name, password }
// Final step of signup: verifies OTP then creates the customer with a hashed
// password. Rejects if an account already exists for this phone (use login).
router.post('/otp/verify', async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || '').trim();
    const name = String(req.body.name || '').trim();
    const password = String(req.body.password || '');

    if (!phone) return res.status(400).json({ message: 'Invalid phone number.' });
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    // Validate the OTP first. This consumes it (so a wrong/expired code can't
    // be paired with a different action later), and gives the user a clear
    // OTP-specific error message if the code is invalid.
    const result = await consumeOtp(phone, code, 'signup');
    if (result.error) return res.status(result.status).json({ message: result.error });

    // Look up any prior customer doc for this phone. If a real (non-guest)
    // account already exists, the request endpoint should have blocked the
    // OTP request in the first place — but we re-check here for safety.
    const existing = await Customer.findOne({ phone });
    if (existing && !existing.isGuest) {
      return res.status(409).json({ message: 'An account with this number already exists. Please log in.', accountExists: true });
    }

    let customer;
    try {
      if (existing) {
        // Promote a previously-created guest customer into a real account.
        existing.name = name;
        existing.password = password;
        existing.phoneVerified = true;
        existing.isGuest = false;
        await existing.save();
        customer = existing;
      } else {
        customer = await Customer.create({ name, phone, password, phoneVerified: true });
      }
    } catch (err) {
      // Distinguish the two duplicate-key cases: phone conflict (real
      // account-exists) vs anything else (most commonly a stale unique
      // index on `email` from an older schema). The latter shouldn't be
      // shown to the user as "account exists".
      if (err && err.code === 11000) {
        const conflictKey = Object.keys(err.keyValue || err.keyPattern || {})[0];
        if (conflictKey === 'phone') {
          return res.status(409).json({ message: 'An account with this number already exists. Please log in.', accountExists: true });
        }
        console.error('[otp/verify] non-phone duplicate-key error during signup:', err.keyValue || err.keyPattern, err.message);
        return res.status(500).json({ message: 'Signup failed due to a database conflict. Please contact support.' });
      }
      throw err;
    }

    res.json({
      token: sign(customer._id, 'customer'),
      customer: customerPayload(customer),
      isNew: true,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/password/reset — body: { phone, code, newPassword }
// Final step of forgot-password: verifies the OTP issued for purpose='reset'
// and updates the customer's password. The customer is also signed in.
router.post('/password/reset', async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const code = String(req.body.code || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!phone) return res.status(400).json({ message: 'Invalid phone number.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const customer = await Customer.findOne({ phone, isGuest: { $ne: true } });
    if (!customer) return res.status(404).json({ message: 'No account found for this number.' });

    const result = await consumeOtp(phone, code, 'reset');
    if (result.error) return res.status(result.status).json({ message: result.error });

    customer.password = newPassword; // hashed by pre-save hook
    customer.phoneVerified = true;
    await customer.save();

    res.json({
      token: sign(customer._id, 'customer'),
      customer: customerPayload(customer),
      message: 'Password updated. You are now signed in.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — body: { phone, password }
// Returning users sign in with phone + password.
router.post('/login', async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || '');

  if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required.' });

  const customer = await Customer.findOne({ phone, isGuest: { $ne: true } }).select('+password');
  if (!customer || !customer.password || !(await customer.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid phone or password.' });
  }

  res.json({
    token: sign(customer._id, 'customer'),
    customer: customerPayload(customer),
  });
});

// PUT /api/auth/password — body: { currentPassword, newPassword }
// Logged-in customer changes their own password. Requires the current password
// for proof-of-possession; OTP is not needed for an already-authenticated user.
router.put('/password', customerAuth, async (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ message: 'New password must be different from the current one.' });
  }

  const customer = await Customer.findById(req.customer._id).select('+password');
  if (!customer) return res.status(404).json({ message: 'Account not found.' });

  // Accounts created via OTP only (no password yet) — can't verify a current
  // password. They should use the forgot-password flow to set one.
  if (!customer.password) {
    return res.status(400).json({ message: 'No password set on this account. Use "Forgot password" instead.' });
  }

  const ok = await customer.comparePassword(currentPassword);
  if (!ok) return res.status(401).json({ message: 'Current password is incorrect.' });

  customer.password = newPassword; // hashed by pre-save hook
  await customer.save();
  res.json({ message: 'Password updated.' });
});

module.exports = router;
