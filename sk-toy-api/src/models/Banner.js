const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  slot:     { type: String, enum: ['hero', 'strip', 'promo'], default: 'hero' },
  title:    { type: String, required: true },
  subtitle: String,
  eyebrow:  String,
  cta:      String,
  ctaLink:  String,
  image:    String,
  bgColor:  String,
  active:   { type: Boolean, default: true },
  startsAt: Date,
  endsAt:   Date,
  order:    { type: Number, default: 0 },

  // Hero-specific extended fields
  secondaryCta:     String,
  secondaryCtaLink: String,
  stats: [{
    num:   { type: String, default: '' },
    label: { type: String, default: '' },
    _id: false,
  }],
  heroImages: [{ type: String }],
  badgeTopLine:    String,
  badgeValue:      String,
  badgeBottomLine: String,
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
