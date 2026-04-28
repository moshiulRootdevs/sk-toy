/* Admin state store - single source of truth for ALL editable content.
   Storefront reads from window.SK_ADMIN.<module>; admin writes & persists to localStorage. */

const ADMIN_STORAGE_KEY = 'sk-admin-v1';

/* ---------- seed data ---------- */

function seedOrders() {
  const statuses = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];
  const couriers = ['Pathao', 'Steadfast', 'RedX', 'Paperfly'];
  const pay = ['bkash', 'nagad', 'card', 'cod'];
  const areas = ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Bashundhara', 'Mohammadpur', 'Chattogram', 'Sylhet', 'Rajshahi'];
  const names = ['Ayesha Rahman', 'Tahmid Hossain', 'Nazia Karim', 'Rafiq Miah', 'Shireen Ahmed', 'Imtiaz Siddique', 'Nusrat Kabir', 'Tahia Rashid', 'Mahbub Alam', 'Farzana Begum', 'Shahriar Kabir', 'Maliha Noor', 'Kawsar Ahmed', 'Sabrina Haq', 'Zarif Islam'];
  const out = [];
  const products = window.SK.PRODUCTS;
  for (let i = 0; i < 48; i++) {
    const lineCount = 1 + (i % 3);
    const lines = [];
    for (let l = 0; l < lineCount; l++) {
      const p = products[(i * 3 + l) % products.length];
      lines.push({ id: p.id, qty: 1 + ((i + l) % 3) });
    }
    const subtotal = lines.reduce((s, ln) => {
      const p = products.find(x => x.id === ln.id);
      return s + (p ? p.price * ln.qty : 0);
    }, 0);
    const shipping = subtotal > 2500 ? 0 : 80;
    const paymentMethod = pay[i % pay.length];
    const statusIdx = Math.min(statuses.length - 1, Math.floor(i / 6));
    out.push({
      id: 'SK' + (102400 + i),
      date: new Date(Date.now() - i * 3600_000 * 5).toISOString(),
      customer: names[i % names.length],
      phone: '+8801' + (700000000 + i * 1337).toString().slice(-9),
      email: names[i % names.length].toLowerCase().replace(' ', '.') + '@mail.bd',
      area: areas[i % areas.length],
      address: (i + 3) + '/B, Road ' + (i % 30 + 1) + ', ' + areas[i % areas.length] + ', Dhaka',
      lines,
      subtotal,
      shipping,
      discount: i % 5 === 0 ? 150 : 0,
      total: subtotal + shipping - (i % 5 === 0 ? 150 : 0),
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? (statusIdx >= 4 ? 'collected' : 'pending') : (i % 11 === 0 ? 'pending' : 'paid'),
      status: statuses[statusIdx],
      courier: statusIdx >= 2 ? couriers[i % couriers.length] : null,
      trackingNo: statusIdx >= 2 ? 'SF' + (900000 + i * 7) : null,
      note: i % 7 === 0 ? 'Customer asked for gift wrap' : '',
      tags: i % 4 === 0 ? ['gift'] : [],
    });
  }
  return out;
}

function seedCustomers() {
  const names = ['Ayesha Rahman', 'Tahmid Hossain', 'Nazia Karim', 'Rafiq Miah', 'Shireen Ahmed', 'Imtiaz Siddique', 'Nusrat Kabir', 'Tahia Rashid', 'Mahbub Alam', 'Farzana Begum', 'Shahriar Kabir', 'Maliha Noor', 'Kawsar Ahmed', 'Sabrina Haq', 'Zarif Islam', 'Shakib Anwar', 'Humaira Ali', 'Rifat Khan', 'Sadia Parvin', 'Arif Hasan'];
  const areas = ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Bashundhara'];
  const tiers = ['Bronze', 'Silver', 'Gold', 'VIP'];
  return names.map((n, i) => ({
    id: 'c-' + (i + 1),
    name: n,
    email: n.toLowerCase().replace(' ', '.') + '@mail.bd',
    phone: '+8801' + (700000000 + i * 9711).toString().slice(-9),
    area: areas[i % areas.length],
    orders: 1 + (i % 14),
    spend: 590 + (i * 1337) % 48000,
    lastOrder: new Date(Date.now() - i * 3600_000 * 24 * (1 + i % 40)).toISOString(),
    tier: tiers[Math.min(tiers.length - 1, Math.floor((i * 1337 % 48000) / 12000))],
    tags: i % 6 === 0 ? ['repeat'] : i % 9 === 0 ? ['vip'] : [],
    joined: new Date(Date.now() - 86400000 * (30 + i * 9)).toISOString(),
  }));
}

function seedReviews() {
  const products = window.SK.PRODUCTS;
  const names = ['Ayesha R.', 'Tahmid H.', 'Nazia K.', 'Rafiq M.', 'Shireen A.', 'Imtiaz S.', 'Nusrat K.'];
  const texts = [
    "Arrived beautifully wrapped — my daughter adores it. Strong build.",
    "Better in person than the photos suggested. Colors are softer.",
    "Shipping to Dhanmondi took two days. Packaging was immaculate.",
    "Lovely gift for my nephew's third birthday.",
    "Good value. Paint edges could be cleaner but kid doesn't mind.",
    "Needed a return — support was helpful, refund in 3 days.",
    "Smaller than I expected for the price but quality is good.",
  ];
  return products.slice(0, 14).flatMap((p, i) => {
    const n = 1 + (i % 3);
    return Array.from({ length: n }).map((_, j) => ({
      id: 'r-' + p.id + '-' + j,
      productId: p.id,
      who: names[(i + j) % names.length],
      stars: 3 + ((i + j) % 3),
      text: texts[(i + j) % texts.length],
      date: new Date(Date.now() - (i * 4 + j) * 86400000 * 2).toISOString(),
      status: j === 0 && i % 5 === 0 ? 'pending' : (j === 1 && i % 7 === 0 ? 'flagged' : 'approved'),
      helpful: (i + j) * 3,
    }));
  });
}

function seedCoupons() {
  return [
    { id: 'c1', code: 'EID25', type: 'percent', value: 25, status: 'active', uses: 847, limit: 2000, startsAt: '2026-04-01', endsAt: '2026-05-15', minSpend: 1500, appliesTo: 'all', description: 'Eid sale — 25% off sitewide' },
    { id: 'c2', code: 'NEWBABY', type: 'percent', value: 15, status: 'active', uses: 112, limit: 500, startsAt: '2026-01-01', endsAt: '2026-12-31', minSpend: 0, appliesTo: 'category:baby', description: 'First-time parents discount on Baby Gear' },
    { id: 'c3', code: 'SHIPFREE', type: 'shipping', value: 0, status: 'active', uses: 2144, limit: null, startsAt: '2026-01-01', endsAt: '2026-12-31', minSpend: 1800, appliesTo: 'all', description: 'Free shipping over ৳1,800' },
    { id: 'c4', code: 'WINTER20', type: 'percent', value: 20, status: 'expired', uses: 432, limit: 500, startsAt: '2025-11-01', endsAt: '2025-12-31', minSpend: 1000, appliesTo: 'all', description: 'Winter promo — expired' },
    { id: 'c5', code: 'FLAT300', type: 'fixed', value: 300, status: 'scheduled', uses: 0, limit: 300, startsAt: '2026-05-01', endsAt: '2026-05-31', minSpend: 2000, appliesTo: 'all', description: '৳300 off orders over ৳2,000' },
  ];
}

function seedCmsPages() {
  return [
    {
      id: 'about', slug: 'about', title: 'About SK Toy', status: 'published', updatedAt: Date.now() - 86400000 * 3,
      blocks: [
        { type: 'paragraph', text: "SK Toy is Bangladesh's friendliest toy house, started in Dhaka in 2019 by a family that couldn't find the kinds of toys we wanted for our own kids — ones that felt considered, well-built, and not just flashy for the sake of it." },
        { type: 'heading', text: "What we stand for" },
        { type: 'paragraph', text: "We carry 64 brands, chosen by a team of parents who also happen to be buyers. Everything we stock is something we'd put on our own shelves." },
      ],
    },
    {
      id: 'faq', slug: 'faq', title: 'Frequently Asked Questions', status: 'published', updatedAt: Date.now() - 86400000 * 1,
      blocks: [
        { type: 'qa', q: 'Where do you ship?', a: 'We ship across Bangladesh. Dhaka city deliveries arrive in 1–2 days. Outside Dhaka: 2–4 days.' },
        { type: 'qa', q: 'Do you accept cash on delivery?', a: 'Yes — COD is available across Bangladesh. There is a small ৳20 COD handling charge.' },
        { type: 'qa', q: 'What payment methods do you accept?', a: 'bKash, Nagad, all major cards (Visa/Mastercard/Amex), and cash on delivery.' },
        { type: 'qa', q: 'How do returns work?', a: '7-day easy returns on most items. Items must be unused and in original packaging. Contact support within 7 days of delivery to initiate a return.' },
        { type: 'qa', q: 'Are your toys genuine?', a: 'Every toy we carry is sourced directly from the brand or an authorised distributor. We publish authenticity certificates on brand pages.' },
        { type: 'qa', q: 'Do you offer gift wrapping?', a: 'Yes — free gift wrapping on any order. Add a note at checkout with your message.' },
        { type: 'qa', q: 'How do I track my order?', a: 'Visit the Track page and enter your order number. You will also receive SMS updates.' },
      ],
    },
    {
      id: 'terms', slug: 'terms', title: 'Terms & Conditions', status: 'published', updatedAt: Date.now() - 86400000 * 30,
      blocks: [
        { type: 'heading', text: '1. Welcome' },
        { type: 'paragraph', text: 'These terms govern your use of SK Toy. By placing an order, you agree to them.' },
        { type: 'heading', text: '2. Pricing & Availability' },
        { type: 'paragraph', text: 'Prices are in Bangladeshi Taka (BDT) and include VAT where applicable. We reserve the right to correct errors and update prices without notice.' },
        { type: 'heading', text: '3. Orders' },
        { type: 'paragraph', text: 'An order is accepted once payment is confirmed or COD is verified by phone. We may cancel orders for stock or fraud reasons with full refund.' },
        { type: 'heading', text: '4. Shipping' },
        { type: 'paragraph', text: 'Delivery times are estimates. Courier delays outside our control may occur during festivals and national holidays.' },
        { type: 'heading', text: '5. Returns & Refunds' },
        { type: 'paragraph', text: 'Items can be returned within 7 days of delivery if unused and in original packaging. Refunds are issued to the original payment method within 5–7 business days.' },
        { type: 'heading', text: '6. Liability' },
        { type: 'paragraph', text: 'SK Toy is not liable for indirect damages. Our liability is limited to the amount paid for the product.' },
      ],
    },
    {
      id: 'privacy', slug: 'privacy', title: 'Privacy Policy', status: 'published', updatedAt: Date.now() - 86400000 * 60,
      blocks: [
        { type: 'heading', text: 'What we collect' },
        { type: 'paragraph', text: 'We collect your name, phone, email, and shipping address to fulfil orders. We do not sell your data. We share with couriers only what is needed to deliver.' },
        { type: 'heading', text: 'Cookies' },
        { type: 'paragraph', text: 'We use cookies to keep you logged in and remember your cart. You can disable them in your browser settings.' },
        { type: 'heading', text: 'Your rights' },
        { type: 'paragraph', text: 'You can request a copy of your data or delete your account at any time by emailing privacy@sktoy.bd.' },
      ],
    },
    {
      id: 'shipping', slug: 'shipping', title: 'Shipping & Delivery', status: 'published', updatedAt: Date.now() - 86400000 * 14,
      blocks: [
        { type: 'heading', text: 'Zones & times' },
        { type: 'paragraph', text: 'Dhaka city: 1–2 days. Chattogram metro: 2–3 days. Elsewhere in Bangladesh: 3–5 days.' },
        { type: 'heading', text: 'Charges' },
        { type: 'paragraph', text: 'Free shipping on orders over ৳2,500. Otherwise ৳80 inside Dhaka, ৳120 elsewhere.' },
      ],
    },
  ];
}

function seedBanners() {
  return [
    { id: 'b1', slot: 'hero', title: 'Big smiles, handpicked toys.', subtitle: "Bangladesh's friendliest toy house, right in Dhaka. Thousands of toys from 64 trusted brands — wooden builds, cuddly plush, drones, dinosaurs and everything between.", cta: 'Shop new arrivals', ctaLink: '#cat/new-arrivals', secondaryCta: 'Shop by age', secondaryLink: '#cat/by-age', eyebrow: "Spring '26 · Making childhood more joyful", active: true },
    { id: 'b2', slot: 'strip', title: 'Free shipping over ৳2,500', active: true },
    { id: 'b3', slot: 'strip', title: 'COD available across Bangladesh', active: true },
    { id: 'b4', slot: 'strip', title: '7-day easy returns', active: true },
    { id: 'b5', slot: 'promo', title: 'Eid Sale — 25% off sitewide', subtitle: 'Use code EID25 at checkout', active: true, endsAt: '2026-05-15' },
  ];
}

function seedHomepage() {
  return [
    { id: 's1', type: 'hero', bannerId: 'b1', enabled: true },
    { id: 's2', type: 'categories', title: 'Shop by age', enabled: true },
    { id: 's3', type: 'products', title: 'New this week', filter: 'badge:new', limit: 8, enabled: true },
    { id: 's4', type: 'editorial', title: 'The toy-buying companion', bodyId: 'choose-first-diecast', enabled: true },
    { id: 's5', type: 'products', title: 'On sale now', filter: 'badge:sale', limit: 8, enabled: true },
    { id: 's6', type: 'brands', title: 'Brands we love', enabled: true },
    { id: 's7', type: 'journal', title: 'From the Journal', limit: 3, enabled: true },
    { id: 's8', type: 'newsletter', title: 'Joy, in your inbox', enabled: true },
  ];
}

function seedShippingZones() {
  return [
    { id: 'z1', name: 'Dhaka City', areas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Bashundhara', 'Mohammadpur', 'Motijheel', 'Old Dhaka'], flat: 80, freeOver: 2500, etaDays: '1–2', default: false },
    { id: 'z2', name: 'Chattogram Metro', areas: ['Chattogram'], flat: 120, freeOver: 3000, etaDays: '2–3', default: false },
    { id: 'z3', name: 'Rest of Bangladesh', areas: ['All other districts'], flat: 150, freeOver: 3500, etaDays: '3–5', default: true },
  ];
}

function seedCouriers() {
  return [
    { id: 'pathao', name: 'Pathao', enabled: true, apiKey: '••••••••3f21', webhookUrl: 'https://sktoy.bd/hooks/pathao', baseRate: 80, zones: ['z1', 'z2'] },
    { id: 'steadfast', name: 'Steadfast', enabled: true, apiKey: '••••••••a7c1', webhookUrl: 'https://sktoy.bd/hooks/steadfast', baseRate: 120, zones: ['z2', 'z3'] },
    { id: 'redx', name: 'RedX', enabled: true, apiKey: '••••••••bf90', webhookUrl: 'https://sktoy.bd/hooks/redx', baseRate: 110, zones: ['z1', 'z2', 'z3'] },
    { id: 'paperfly', name: 'Paperfly', enabled: false, apiKey: '', webhookUrl: '', baseRate: 130, zones: ['z3'] },
  ];
}

function seedPayments() {
  return {
    methods: [
      { id: 'bkash', name: 'bKash', enabled: true, merchantNo: '01700000000', fee: '1.5%', settlement: 'T+2', description: 'Mobile wallet' },
      { id: 'nagad', name: 'Nagad', enabled: true, merchantNo: '01800000000', fee: '1.2%', settlement: 'T+2', description: 'Mobile wallet' },
      { id: 'card', name: 'Card (Visa/Mastercard)', enabled: true, merchantNo: 'SSL-12983', fee: '2.5%', settlement: 'T+3', description: 'SSLCOMMERZ' },
      { id: 'cod', name: 'Cash on Delivery', enabled: true, merchantNo: '', fee: '৳20 / order', settlement: 'On collection', description: 'Collected by courier' },
    ],
    reconciliation: [
      { id: 'rx1', date: '2026-04-18', method: 'bkash', expected: 142500, received: 142500, status: 'reconciled', txns: 42 },
      { id: 'rx2', date: '2026-04-18', method: 'nagad', expected: 88200, received: 88200, status: 'reconciled', txns: 28 },
      { id: 'rx3', date: '2026-04-18', method: 'card', expected: 76400, received: 76400, status: 'reconciled', txns: 19 },
      { id: 'rx4', date: '2026-04-18', method: 'cod', expected: 68300, received: 58300, status: 'short', txns: 24, note: '2 orders not collected, 1 disputed' },
      { id: 'rx5', date: '2026-04-17', method: 'bkash', expected: 128700, received: 128700, status: 'reconciled', txns: 37 },
      { id: 'rx6', date: '2026-04-17', method: 'cod', expected: 71200, received: 71200, status: 'reconciled', txns: 26 },
      { id: 'rx7', date: '2026-04-16', method: 'bkash', expected: 94800, received: 93300, status: 'short', txns: 29, note: '1 refund pending' },
    ],
  };
}

function seedStockTransfers() {
  return [
    { id: 't1', from: 'Warehouse A', to: 'Dhanmondi Store', items: 4, units: 47, status: 'in_transit', date: '2026-04-18' },
    { id: 't2', from: 'Warehouse A', to: 'Gulshan Store', items: 7, units: 92, status: 'completed', date: '2026-04-16' },
    { id: 't3', from: 'Supplier — Playmobil BD', to: 'Warehouse A', items: 12, units: 240, status: 'received', date: '2026-04-14' },
    { id: 't4', from: 'Warehouse A', to: 'Uttara Store', items: 3, units: 21, status: 'draft', date: '2026-04-19' },
  ];
}

function seedMedia() {
  const out = [];
  for (let i = 1; i <= 12; i++) {
    out.push({ id: 'm-' + i, name: `product-${i}.webp`, type: 'image', size: 120000 + i * 9999, uploaded: Date.now() - i * 86400000, tag: 'product', color: `hsl(${(i * 30) % 360} 55% 78%)` });
  }
  for (let i = 1; i <= 4; i++) {
    out.push({ id: 'b-' + i, name: `banner-${i}.webp`, type: 'image', size: 420000 + i * 9999, uploaded: Date.now() - i * 86400000 * 2, tag: 'banner', color: `hsl(${(i * 70) % 360} 60% 72%)` });
  }
  return out;
}

function seedNavigation() {
  return [
    { id: 'n1', label: 'New Arrivals', link: '#cat/new-arrivals', badge: 'NEW', children: [] },
    { id: 'n2', label: 'Shop by Age', link: '#cat/by-age', children: [
      { id: 'n2a', label: '0–2 yrs', link: '#cat/age/0-2' },
      { id: 'n2b', label: '3–5 yrs', link: '#cat/age/3-5' },
      { id: 'n2c', label: '6–8 yrs', link: '#cat/age/6-8' },
      { id: 'n2d', label: '9–12 yrs', link: '#cat/age/9-12' },
    ]},
    { id: 'n3', label: 'Toys', link: '#cat/toys', children: [] },
    { id: 'n4', label: 'Education & Learning', link: '#cat/learning', children: [] },
    { id: 'n5', label: 'Baby Gear', link: '#cat/baby', children: [] },
    { id: 'n6', label: 'Outdoor & Sports', link: '#cat/outdoor', children: [] },
    { id: 'n7', label: 'Brands', link: '#brands', children: [] },
    { id: 'n8', label: 'Sale', link: '#sale', badge: 'SALE', children: [] },
    { id: 'n9', label: 'Journal', link: '#blog', children: [] },
  ];
}

function seedSettings() {
  return {
    store: {
      name: 'SK Toy',
      tagline: "Bangladesh's Joyful Toy House",
      email: 'hello@sktoy.bd',
      phone: '+8801-700-000-000',
      address: 'House 42, Road 7, Dhanmondi, Dhaka 1205, Bangladesh',
      logoText: 'SK·TOY',
      favicon: '🧸',
      timezone: 'Asia/Dhaka',
    },
    locale: {
      currency: 'BDT',
      currencySymbol: '৳',
      languages: ['English', 'বাংলা'],
      defaultLanguage: 'English',
    },
    tax: {
      vatEnabled: true,
      vatRate: 15,
      vatInclusive: true,
      vatNumber: 'VAT-BD-18428299',
    },
    social: {
      facebook: 'https://facebook.com/sktoybd',
      instagram: 'https://instagram.com/sktoy.bd',
      youtube: '',
      tiktok: 'https://tiktok.com/@sktoybd',
      whatsapp: '+8801700000000',
    },
    seo: {
      title: 'SK Toy — Bangladesh\'s Joyful Toy House',
      description: 'Thousands of toys from 64 trusted brands — wooden builds, cuddly plush, drones, dinosaurs and everything between. Delivered across Bangladesh.',
      keywords: 'toys, bangladesh, dhaka, kids, plush, diecast, lego alternative, wooden toys',
      ogImage: '',
    },
    policies: {
      returnDays: 7,
      freeShippingOver: 2500,
      codChargeBdt: 20,
    },
  };
}

function seedAuditLog() {
  const events = [
    ['Nazia A.', 'Updated product', 'p-3: price ৳1,490 → ৳1,190'],
    ['Imtiaz S.', 'Refunded order', 'SK102419: refunded ৳3,290 via bKash'],
    ['Nusrat K.', 'Approved review', 'r-p-4-0: 5-star review by Ayesha R.'],
    ['Nazia A.', 'Created coupon', 'FLAT300 — ৳300 off over ৳2,000'],
    ['Tahia R.', 'Published page', 'faq: 7 questions updated'],
    ['Nazia A.', 'Added product', 'Inflatable Pool — Botanical Print'],
    ['Imtiaz S.', 'Bulk stock update', '+240 units across 12 SKUs'],
    ['Nusrat K.', 'Replied to review', 'r-p-6-0: thanked customer'],
    ['Nazia A.', 'Updated settings', 'Free shipping threshold ৳2,500'],
    ['Imtiaz S.', 'Marked shipped', 'SK102438: Pathao SF900294'],
    ['Nazia A.', 'Flagged review', 'r-p-9-1: possible spam'],
    ['Tahia R.', 'Added banner', 'Eid Sale — 25% off sitewide'],
  ];
  return events.map((e, i) => ({
    id: 'log-' + i,
    who: e[0],
    action: e[1],
    detail: e[2],
    at: Date.now() - i * 3600_000 * (1 + i % 6),
  }));
}

function seedTasks() {
  return [
    { id: 'tk1', title: 'Confirm 6 COD orders for today', done: false, priority: 'high' },
    { id: 'tk2', title: 'Restock Magnetic Tiles — Forest', done: false, priority: 'high' },
    { id: 'tk3', title: 'Reply to 3 pending reviews', done: false, priority: 'med' },
    { id: 'tk4', title: 'Upload product photos for new Diecast line', done: false, priority: 'med' },
    { id: 'tk5', title: 'Schedule Eid banner for May 1', done: true, priority: 'low' },
    { id: 'tk6', title: 'Reconcile Apr 17 COD with Pathao', done: true, priority: 'med' },
  ];
}

/* ---------- initial blob ---------- */

function buildInitialState() {
  const products = window.SK.PRODUCTS.map(p => ({
    ...p,
    sku: 'SKT-' + p.id.replace('p-', '').padStart(4, '0'),
    active: true,
    description: `A thoughtfully-chosen piece in our ${p.cat} range. Sourced from ${p.brand}, suitable for ages ${p.age.replace('age-', '').replace('-', '–')}. Meets SK Toy's quality bar.`,
    variants: p.cat === 'toys' && p.sub === 'plush' ? [
      { id: 'v1', name: 'Cream', stock: 8, sku: 'SKT-' + p.id + '-CRM' },
      { id: 'v2', name: 'Caramel', stock: p.stock, sku: 'SKT-' + p.id + '-CML' },
      { id: 'v3', name: 'Teal', stock: 3, sku: 'SKT-' + p.id + '-TEL' },
    ] : [],
  }));

  return {
    version: 1,
    products,
    categories: window.SK.CATEGORIES.slice(),
    brands: window.SK.BRANDS.slice(),
    orders: seedOrders(),
    customers: seedCustomers(),
    reviews: seedReviews(),
    coupons: seedCoupons(),
    cmsPages: seedCmsPages(),
    banners: seedBanners(),
    homepage: seedHomepage(),
    blogPosts: window.SK.BLOG_POSTS.slice(),
    shippingZones: seedShippingZones(),
    couriers: seedCouriers(),
    payments: seedPayments(),
    stockTransfers: seedStockTransfers(),
    media: seedMedia(),
    navigation: seedNavigation(),
    settings: seedSettings(),
    auditLog: seedAuditLog(),
    tasks: seedTasks(),
    ui: {
      sidebarCollapsed: false,
      theme: 'light',
      density: 'comfortable',
    },
  };
}

/* ---------- provider ---------- */

const AdminCtx = React.createContext(null);

function AdminProvider({ children }) {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1) {
          // merge with seeds for any missing keys
          const seed = buildInitialState();
          return { ...seed, ...parsed, ui: { ...seed.ui, ...parsed.ui } };
        }
      }
    } catch {}
    return buildInitialState();
  });
  const [route, setAdminRoute] = React.useState(() => {
    const h = window.location.hash.replace('#', '');
    if (h.startsWith('admin')) return h.slice(5).replace(/^\//, '') || 'dashboard';
    return 'dashboard';
  });
  const [toast, setToast] = React.useState(null);
  const [cmdOpen, setCmdOpen] = React.useState(false);

  React.useEffect(() => {
    try { localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state)); } catch {}
    // Make state globally readable for the storefront
    window.SK_ADMIN = state;
    window.dispatchEvent(new Event('sk-admin-update'));
  }, [state]);

  React.useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (h.startsWith('admin')) {
        setAdminRoute(h.slice(5).replace(/^\//, '') || 'dashboard');
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(x => !x);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navigateAdmin = React.useCallback((r) => {
    window.location.hash = 'admin/' + r;
  }, []);

  const pushToast = React.useCallback((msg, kind = 'success') => {
    const id = Date.now();
    setToast({ id, msg, kind });
    setTimeout(() => setToast(t => (t && t.id === id ? null : t)), 2800);
  }, []);

  const pushAudit = React.useCallback((action, detail) => {
    setState(s => ({
      ...s,
      auditLog: [{ id: 'log-' + Date.now(), who: 'You', action, detail, at: Date.now() }, ...s.auditLog].slice(0, 400),
    }));
  }, []);

  /* ---------- actions for each module ---------- */

  const actions = React.useMemo(() => ({
    // generic patch
    patch: (key, updater) => setState(s => ({ ...s, [key]: typeof updater === 'function' ? updater(s[key]) : updater })),

    // products
    updateProduct: (id, updates) => {
      setState(s => ({ ...s, products: s.products.map(p => p.id === id ? { ...p, ...updates } : p) }));
      pushAudit('Updated product', `${id}: ${Object.keys(updates).join(', ')}`);
    },
    addProduct: (p) => {
      const id = 'p-' + (Date.now() % 100000);
      const product = { id, sku: 'SKT-' + id.replace('p-', '').padStart(4, '0'), slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), active: true, stock: 0, rating: 0, reviews: 0, variants: [], ...p };
      setState(s => ({ ...s, products: [product, ...s.products] }));
      pushAudit('Added product', p.name || id);
      return id;
    },
    deleteProducts: (ids) => {
      setState(s => ({ ...s, products: s.products.filter(p => !ids.includes(p.id)) }));
      pushAudit('Deleted products', `${ids.length} product${ids.length === 1 ? '' : 's'}`);
    },

    // orders
    updateOrder: (id, updates) => {
      setState(s => ({ ...s, orders: s.orders.map(o => o.id === id ? { ...o, ...updates } : o) }));
      pushAudit('Updated order', `${id}: ${Object.keys(updates).join(', ')}`);
    },
    advanceOrder: (id, nextStatus) => {
      setState(s => ({ ...s, orders: s.orders.map(o => o.id === id ? { ...o, status: nextStatus } : o) }));
      pushAudit('Advanced order', `${id} → ${nextStatus}`);
    },

    // reviews
    setReviewStatus: (id, status) => {
      setState(s => ({ ...s, reviews: s.reviews.map(r => r.id === id ? { ...r, status } : r) }));
      pushAudit(status === 'approved' ? 'Approved review' : status === 'rejected' ? 'Rejected review' : 'Updated review', id);
    },

    // coupons
    upsertCoupon: (c) => {
      setState(s => {
        const exists = s.coupons.find(x => x.id === c.id);
        if (exists) return { ...s, coupons: s.coupons.map(x => x.id === c.id ? { ...x, ...c } : x) };
        return { ...s, coupons: [{ id: 'c' + Date.now(), uses: 0, ...c }, ...s.coupons] };
      });
      pushAudit(c.id ? 'Updated coupon' : 'Created coupon', c.code || '');
    },
    deleteCoupon: (id) => {
      setState(s => ({ ...s, coupons: s.coupons.filter(c => c.id !== id) }));
      pushAudit('Deleted coupon', id);
    },

    // customers
    updateCustomer: (id, updates) => {
      setState(s => ({ ...s, customers: s.customers.map(c => c.id === id ? { ...c, ...updates } : c) }));
    },

    // cms
    updateCmsPage: (id, updates) => {
      setState(s => ({ ...s, cmsPages: s.cmsPages.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p) }));
      pushAudit('Updated page', id);
    },
    addCmsPage: (page) => {
      const id = page.slug || 'page-' + Date.now();
      setState(s => ({ ...s, cmsPages: [{ id, slug: id, blocks: [], status: 'draft', updatedAt: Date.now(), ...page }, ...s.cmsPages] }));
      pushAudit('Created page', id);
    },
    deleteCmsPage: (id) => {
      setState(s => ({ ...s, cmsPages: s.cmsPages.filter(p => p.id !== id) }));
      pushAudit('Deleted page', id);
    },

    // banners
    updateBanner: (id, updates) => {
      setState(s => ({ ...s, banners: s.banners.map(b => b.id === id ? { ...b, ...updates } : b) }));
      pushAudit('Updated banner', id);
    },

    // homepage sections
    updateHomeSection: (id, updates) => {
      setState(s => ({ ...s, homepage: s.homepage.map(h => h.id === id ? { ...h, ...updates } : h) }));
    },
    reorderHomeSections: (sections) => {
      setState(s => ({ ...s, homepage: sections }));
      pushAudit('Reordered homepage', `${sections.length} sections`);
    },

    // navigation
    updateNav: (nav) => {
      setState(s => ({ ...s, navigation: nav }));
      pushAudit('Updated navigation', `${nav.length} top-level items`);
    },

    // settings
    updateSettings: (path, value) => {
      setState(s => {
        const keys = path.split('.');
        const next = JSON.parse(JSON.stringify(s.settings));
        let ref = next;
        for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
        ref[keys[keys.length - 1]] = value;
        return { ...s, settings: next };
      });
    },

    // tasks
    toggleTask: (id) => setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) })),
    addTask: (title, priority = 'med') => setState(s => ({ ...s, tasks: [{ id: 'tk-' + Date.now(), title, priority, done: false }, ...s.tasks] })),

    // shipping
    updateZone: (id, updates) => setState(s => ({ ...s, shippingZones: s.shippingZones.map(z => z.id === id ? { ...z, ...updates } : z) })),
    updateCourier: (id, updates) => setState(s => ({ ...s, couriers: s.couriers.map(c => c.id === id ? { ...c, ...updates } : c) })),

    // payments
    updatePaymentMethod: (id, updates) => setState(s => ({
      ...s,
      payments: { ...s.payments, methods: s.payments.methods.map(m => m.id === id ? { ...m, ...updates } : m) },
    })),

    // ui
    setUi: (updates) => setState(s => ({ ...s, ui: { ...s.ui, ...updates } })),

    // reset
    resetAll: () => {
      if (confirm('Reset all admin data to defaults? This cannot be undone.')) {
        const fresh = buildInitialState();
        setState(fresh);
        pushAudit('Reset admin data', 'restored seed state');
      }
    },
  }), [pushAudit]);

  const value = { state, actions, route, navigateAdmin, toast, pushToast, cmdOpen, setCmdOpen };

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

function useAdmin() { return React.useContext(AdminCtx); }

window.AdminProvider = AdminProvider;
window.useAdmin = useAdmin;
