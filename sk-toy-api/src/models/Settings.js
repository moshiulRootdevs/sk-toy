const mongoose = require('mongoose');

// Singleton — always one document with key='global'
const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  store: {
    name:     { type: String, default: 'SK Toy' },
    tagline:  { type: String, default: 'A quieter kind of toy shop.' },
    email:    { type: String, default: 'hello@sktoy.com.bd' },
    phone:    { type: String, default: '+880 1700-000000' },
    address:  { type: String, default: '63/B Gulshan Avenue, Dhaka 1212' },
    logoText: { type: String, default: 'SK Toy' },
    logo:     { type: String, default: '' },
    timezone: { type: String, default: 'Asia/Dhaka' },
  },
  locale: {
    currency:        { type: String, default: 'BDT' },
    currencySymbol:  { type: String, default: '৳' },
    defaultLanguage: { type: String, default: 'en' },
    languages:       { type: [String], default: ['en', 'bn'] },
  },
  tax: {
    vatEnabled:  { type: Boolean, default: false },
    vatRate:     { type: Number, default: 0 },
    vatInclusive: { type: Boolean, default: false },
    vatNumber:   String,
  },
  social: {
    facebook:  { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube:   { type: String, default: '' },
    tiktok:    { type: String, default: '' },
    whatsapp:  { type: String, default: '' },
  },
  seo: {
    title:       { type: String, default: 'SK Toy — Bangladesh\'s friendliest toy shop' },
    description: { type: String, default: 'Hand-picked toys delivered from Dhaka.' },
    keywords:    { type: String, default: 'toys, kids, bangladesh, dhaka' },
  },
  policies: {
    returnDays:       { type: Number, default: 7 },
    freeShippingOver: { type: Number, default: 2500 },
    codChargeBdt:     { type: Number, default: 0 },
    giftWrapCost:     { type: Number, default: 120 },
  },
  topStrip: {
    enabled: { type: Boolean, default: true },
    messages: { type: [String], default: ['Free shipping over ৳2,500', 'COD available across Bangladesh', '7-day easy returns'] },
  },
  shipping: {
    insideDhaka: {
      title:       { type: String, default: 'Inside Dhaka' },
      amount:      { type: Number, default: 60 },
      description: { type: String, default: 'Delivered within 1–2 business days' },
      freeOver:    { type: Number, default: 0 },
    },
    outsideDhaka: {
      title:       { type: String, default: 'Outside Dhaka' },
      amount:      { type: Number, default: 120 },
      description: { type: String, default: 'Delivered within 3–5 business days' },
      freeOver:    { type: Number, default: 0 },
    },
  },
  paymentMethods: {
    cod: {
      enabled:     { type: Boolean, default: true },
      label:       { type: String,  default: 'Cash on Delivery' },
      description: { type: String,  default: 'Pay when you receive the parcel' },
    },
    bkash: {
      enabled:     { type: Boolean, default: true },
      label:       { type: String,  default: 'bKash' },
      description: { type: String,  default: 'Pay securely via bKash' },
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
