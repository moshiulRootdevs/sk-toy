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
  // Display-only "we accept" badges shown in the storefront footer.
  // Order in the array = order shown to customers.
  paymentBadges: {
    type: [
      new mongoose.Schema({
        label:     { type: String, required: true },
        bg:        { type: String, default: '#FFCB47' },
        textColor: { type: String, default: '#1F2F4A' },
        enabled:   { type: Boolean, default: true },
      }, { _id: false }),
    ],
    default: () => ([
      { label: 'bKash', bg: '#E2136E', textColor: '#FFFFFF', enabled: true },
      { label: 'COD',   bg: '#FFCB47', textColor: '#1F2F4A', enabled: true },
      { label: 'Nagad', bg: '#FF9A4D', textColor: '#FFFFFF', enabled: true },
    ]),
  },
  // Trust badges shown on the product details page (Fast delivery / Returns / etc).
  productTrustBadges: {
    type: [
      new mongoose.Schema({
        icon:    { type: String, default: '🚚' },
        label:   { type: String, required: true },
        color:   { type: String, default: '#FF9A4D' },
        enabled: { type: Boolean, default: true },
      }, { _id: false }),
    ],
    default: () => ([
      { icon: '🚚',  label: 'Fast delivery',  color: '#FF9A4D', enabled: true },
      { icon: '🔄',  label: '7-day returns',  color: '#4FC081', enabled: true },
      { icon: '🛡️',  label: 'Safe & tested',  color: '#6BC8E6', enabled: true },
    ]),
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
