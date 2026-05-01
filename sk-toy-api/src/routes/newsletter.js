const router = require('express').Router();
const Subscriber = require('../models/Subscriber');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// POST /api/newsletter/subscribe — public
router.post('/subscribe', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const source = String(req.body.source || 'footer').slice(0, 32);

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  try {
    // Idempotent: re-subscribing an existing email returns success without creating a duplicate.
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
      }
      return res.json({ message: "You're already on the list — thanks!", existed: true });
    }

    await Subscriber.create({ email, source });
    return res.json({ message: 'Subscribed! Watch your inbox for fresh toy drops.', existed: false });
  } catch (err) {
    return res.status(500).json({ message: 'Could not subscribe right now. Please try again.' });
  }
});

module.exports = router;
