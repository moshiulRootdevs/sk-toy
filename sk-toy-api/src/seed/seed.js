require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User        = require('../models/User');
const Customer    = require('../models/Customer');
const Category    = require('../models/Category');
const Brand       = require('../models/Brand');
const Product     = require('../models/Product');
const Order       = require('../models/Order');
const Review      = require('../models/Review');
const Coupon      = require('../models/Coupon');
const HomeSection = require('../models/HomeSection');
const Banner      = require('../models/Banner');
const Navigation  = require('../models/Navigation');
const BlogPost    = require('../models/BlogPost');
const CmsPage     = require('../models/CmsPage');
const Settings    = require('../models/Settings');
const ShippingZone = require('../models/ShippingZone');
const Courier     = require('../models/Courier');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    User.deleteMany(), Customer.deleteMany(), Category.deleteMany(), Brand.deleteMany(),
    Product.deleteMany(), Order.deleteMany(), Review.deleteMany(), Coupon.deleteMany(),
    HomeSection.deleteMany(), Banner.deleteMany(), Navigation.deleteMany(),
    BlogPost.deleteMany(), CmsPage.deleteMany(), Settings.deleteMany(),
    ShippingZone.deleteMany(), Courier.deleteMany(),
  ]);
  console.log('Collections cleared');

  // ── Admin user ───────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Nazia Ahmed', email: 'admin@sktoy.com.bd', password: 'Admin@1234', role: 'super_admin',
  });
  console.log('Admin user created: admin@sktoy.com.bd / Admin@1234');

  // ── Settings ─────────────────────────────────────────────────────────────
  await Settings.create({ key: 'global' });

  // ── Shipping zones ───────────────────────────────────────────────────────
  await ShippingZone.insertMany([
    { name: 'Dhaka City', areas: ['Dhaka', 'Mirpur', 'Gulshan', 'Banani', 'Dhanmondi', 'Mohammadpur', 'Uttara'], flat: 60, freeOver: 2500, etaDays: '1', default: true },
    { name: 'Chittagong / Sylhet / Rajshahi', areas: ['Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'], flat: 120, freeOver: 3000, etaDays: '2' },
    { name: 'Rest of Bangladesh', areas: [], flat: 180, freeOver: 4000, etaDays: '2-3' },
  ]);

  // ── Couriers ─────────────────────────────────────────────────────────────
  await Courier.insertMany([
    { name: 'Pathao', baseRate: 60, zones: ['Dhaka'], enabled: false },
    { name: 'Paperfly', baseRate: 80, zones: ['Dhaka', 'Chittagong'], enabled: false },
    { name: 'Sundarban', baseRate: 100, zones: ['All'], enabled: false },
    { name: 'RedX', baseRate: 70, zones: ['Dhaka', 'Chittagong', 'Sylhet'], enabled: false },
  ]);

  // ── Categories ───────────────────────────────────────────────────────────
  const catData = [
    { name: 'New Arrivals',      slug: 'new-arrivals',  tag: 'NEW', order: 0 },
    { name: 'Shop by Age',       slug: 'by-age',        order: 1 },
    { name: 'Shop by Gender',    slug: 'by-gender',     order: 2 },
    { name: 'Toys',              slug: 'toys',          order: 3 },
    { name: 'Education & Learning', slug: 'learning',   order: 4 },
    { name: 'Baby Gear',         slug: 'baby',          order: 5 },
    { name: 'Outdoor & Sports',  slug: 'outdoor',       order: 6 },
    { name: 'Brands',            slug: 'brands',        order: 7 },
    { name: 'Sale',              slug: 'sale', tag: 'SALE', order: 8 },
    { name: 'Stock Clearance',   slug: 'clearance',     order: 9 },
    { name: 'Damaged & Returned', slug: 'damaged',      order: 10 },
    { name: 'Journal',           slug: 'journal',       order: 11 },
  ];
  const topCats = await Category.insertMany(catData);
  const catMap = Object.fromEntries(topCats.map(c => [c.slug, c]));

  const subCatDefs = [
    // by-age
    { name: '0–2 yrs', slug: 'age/0-2', parent: 'by-age', order: 0 },
    { name: '3–5 yrs', slug: 'age/3-5', parent: 'by-age', order: 1 },
    { name: '6–8 yrs', slug: 'age/6-8', parent: 'by-age', order: 2 },
    { name: '9–12 yrs', slug: 'age/9-12', parent: 'by-age', order: 3 },
    { name: 'Teens',   slug: 'age/teen', parent: 'by-age', order: 4 },
    // by-gender
    { name: 'For Boys', slug: 'gender/boys',   parent: 'by-gender', order: 0 },
    { name: 'For Girls', slug: 'gender/girls', parent: 'by-gender', order: 1 },
    { name: 'Unisex',   slug: 'gender/neutral', parent: 'by-gender', order: 2 },
    // toys
    { name: 'Diecast & Vehicles', slug: 'toys/diecast',  parent: 'toys', order: 0 },
    { name: 'Plush & Soft',       slug: 'toys/plush',    parent: 'toys', order: 1 },
    { name: 'Action Figures',     slug: 'toys/figures',  parent: 'toys', order: 2 },
    { name: 'Remote Control',     slug: 'toys/rc',       parent: 'toys', order: 3 },
    { name: 'Building Blocks',    slug: 'toys/building', parent: 'toys', order: 4 },
    // learning
    { name: 'School Supplies', slug: 'learning/school',      parent: 'learning', order: 0 },
    { name: 'STEM Toys',       slug: 'learning/stem',        parent: 'learning', order: 1 },
    { name: 'Puzzles',         slug: 'learning/puzzle',      parent: 'learning', order: 2 },
    { name: 'Activity Books',  slug: 'learning/books',       parent: 'learning', order: 3 },
    { name: 'Montessori',      slug: 'learning/montessori',  parent: 'learning', order: 4 },
    // baby
    { name: 'Bath Toys', slug: 'baby/bath',    parent: 'baby', order: 0 },
    { name: 'Rattles',   slug: 'baby/rattle',  parent: 'baby', order: 1 },
    { name: 'Strollers', slug: 'baby/stroller', parent: 'baby', order: 2 },
    { name: 'Teethers',  slug: 'baby/teether', parent: 'baby', order: 3 },
    // outdoor
    { name: 'Pool & Water',    slug: 'outdoor/pool',   parent: 'outdoor', order: 0 },
    { name: 'Bikes & Ride-ons', slug: 'outdoor/bike',  parent: 'outdoor', order: 1 },
    { name: 'Sports Gear',     slug: 'outdoor/sport',  parent: 'outdoor', order: 2 },
    { name: 'Garden Play',     slug: 'outdoor/garden', parent: 'outdoor', order: 3 },
  ];

  const subCatsCreated = await Promise.all(subCatDefs.map(s =>
    Category.create({ name: s.name, slug: s.slug, parent: catMap[s.parent]._id, order: s.order })
  ));
  // Update parent children arrays
  for (const sub of subCatsCreated) {
    await Category.findByIdAndUpdate(sub.parent, { $push: { children: sub._id } });
  }
  const subCatMap = Object.fromEntries(subCatsCreated.map(c => [c.slug, c]));

  // Level-3 sub-sub-categories
  const subSubDefs = [
    { name: 'Cars', slug: 'toys/diecast/cars', parent: 'toys/diecast', order: 0 },
    { name: 'Trucks', slug: 'toys/diecast/trucks', parent: 'toys/diecast', order: 1 },
    { name: 'Military', slug: 'toys/diecast/military', parent: 'toys/diecast', order: 2 },
    { name: 'Aviation', slug: 'toys/diecast/aviation', parent: 'toys/diecast', order: 3 },
    { name: 'Stuffed Animals', slug: 'toys/plush/animal', parent: 'toys/plush', order: 0 },
    { name: 'Characters', slug: 'toys/plush/character', parent: 'toys/plush', order: 1 },
    { name: 'Teddy Bears', slug: 'toys/plush/teddy', parent: 'toys/plush', order: 2 },
    { name: 'Superheroes', slug: 'toys/figures/super', parent: 'toys/figures', order: 0 },
    { name: 'Dinosaurs', slug: 'toys/figures/dino', parent: 'toys/figures', order: 1 },
    { name: 'Animals', slug: 'toys/figures/animal', parent: 'toys/figures', order: 2 },
    { name: 'RC Cars', slug: 'toys/rc/car', parent: 'toys/rc', order: 0 },
    { name: 'Drones', slug: 'toys/rc/drone', parent: 'toys/rc', order: 1 },
    { name: 'Helicopters', slug: 'toys/rc/heli', parent: 'toys/rc', order: 2 },
    { name: 'Bricks', slug: 'toys/building/brick', parent: 'toys/building', order: 0 },
    { name: 'Magnetic', slug: 'toys/building/magnet', parent: 'toys/building', order: 1 },
    { name: 'Wooden', slug: 'toys/building/wood', parent: 'toys/building', order: 2 },
    { name: 'Backpacks', slug: 'learning/school/backpack', parent: 'learning/school', order: 0 },
    { name: 'Lunch Boxes', slug: 'learning/school/lunch', parent: 'learning/school', order: 1 },
    { name: 'Stationery', slug: 'learning/school/stationery', parent: 'learning/school', order: 2 },
    { name: 'Geometry Sets', slug: 'learning/school/geometry', parent: 'learning/school', order: 3 },
  ];

  const subSubCreated = await Promise.all(subSubDefs.map(s =>
    Category.create({ name: s.name, slug: s.slug, parent: subCatMap[s.parent]._id, order: s.order })
  ));
  for (const sub of subSubCreated) {
    await Category.findByIdAndUpdate(sub.parent, { $push: { children: sub._id } });
  }
  const allSubMap = { ...subCatMap, ...Object.fromEntries(subSubCreated.map(c => [c.slug, c])) };
  console.log('Categories seeded');

  // ── Brands ───────────────────────────────────────────────────────────────
  const brandData = [
    { name: 'Kinsmart', slug: 'kinsmart', em: 'Ki' },
    { name: 'Intex', slug: 'intex', em: 'In' },
    { name: 'Maisto', slug: 'maisto', em: 'Ma' },
    { name: 'Bburago', slug: 'bburago', em: 'Bb' },
    { name: 'Fisher-Price', slug: 'fisher-price', em: 'Fi' },
    { name: 'Crayola', slug: 'crayola', em: 'Cr' },
    { name: 'Bestway', slug: 'bestway', em: 'Be' },
    { name: 'Syma', slug: 'syma', em: 'Sy' },
    { name: 'Mattel', slug: 'mattel', em: 'Ma' },
    { name: 'Playmobil', slug: 'playmobil', em: 'Pl' },
    { name: 'Hot Wheels', slug: 'hot-wheels', em: 'HW' },
    { name: 'Schleich', slug: 'schleich', em: 'Sc' },
  ].map((b, i) => ({ ...b, order: i }));
  const brands = await Brand.insertMany(brandData);
  const brandMap = Object.fromEntries(brands.map(b => [b.name, b]));
  console.log('Brands seeded');

  // ── Products ─────────────────────────────────────────────────────────────
  const IMG = [
    'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560785496-3c9d27877182?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=75&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&q=75&auto=format&fit=crop',
  ];

  const productSeeds = [
    { name: 'Wooden Rainbow Stacker', cat: 'toys/building/wood', brand: 'Playmobil', ageGroup: 'age-0-2', gender: 'neutral', price: 1450, comparePrice: 1890, img: 2, badge: '' },
    { name: 'Classic Red Sports Diecast 1:24', cat: 'toys/diecast/cars', brand: 'Kinsmart', ageGroup: 'age-6-8', gender: 'boys', price: 1299, comparePrice: 1750, img: 10, badge: 'sale' },
    { name: 'Plush Honey Bear — Caramel', cat: 'toys/plush/teddy', brand: 'Fisher-Price', ageGroup: 'age-3-5', gender: 'neutral', price: 990, img: 3, badge: 'new' },
    { name: 'Double-Sided Geometry Case', cat: 'learning/school/geometry', brand: 'Crayola', ageGroup: 'age-6-8', gender: 'neutral', price: 680, comparePrice: 950, img: 5, badge: 'sale' },
    { name: 'RC Rally Car — Sand Beige', cat: 'toys/rc/car', brand: 'Syma', ageGroup: 'age-9-12', gender: 'boys', price: 3450, comparePrice: 4200, img: 1, badge: '' },
    { name: 'Mini Dinosaur Bath Friends (set of 6)', cat: 'baby/bath', brand: 'Fisher-Price', ageGroup: 'age-0-2', gender: 'neutral', price: 540, comparePrice: 880, img: 4, badge: 'sale' },
    { name: 'Magnetic Tiles — Forest Palette', cat: 'toys/building/magnet', brand: 'Playmobil', ageGroup: 'age-3-5', gender: 'neutral', price: 2890, img: 9, badge: 'new' },
    { name: 'Classic Teddy — Warm Cream', cat: 'toys/plush/teddy', brand: 'Fisher-Price', ageGroup: 'age-0-2', gender: 'neutral', price: 1190, comparePrice: 1490, img: 7, badge: '' },
    { name: 'Starter Stationery Kit, 42-pc', cat: 'learning/school/stationery', brand: 'Crayola', ageGroup: 'age-6-8', gender: 'neutral', price: 1290, comparePrice: 1590, img: 5, badge: '' },
    { name: 'Dinosaur Expedition Figure Set', cat: 'toys/figures/dino', brand: 'Schleich', ageGroup: 'age-6-8', gender: 'boys', price: 2150, comparePrice: 2850, img: 11, badge: 'sale' },
    { name: 'Soft Silicone Teether Ring', cat: 'baby/teether', brand: 'Fisher-Price', ageGroup: 'age-0-2', gender: 'neutral', price: 390, img: 0, badge: '' },
    { name: 'Pool Noodle Set, Sherbet', cat: 'outdoor/pool', brand: 'Intex', ageGroup: 'age-3-5', gender: 'neutral', price: 490, comparePrice: 690, img: 6, badge: '' },
    { name: 'Silent RC Quadcopter Drone', cat: 'toys/rc/drone', brand: 'Syma', ageGroup: 'age-9-12', gender: 'neutral', price: 4990, comparePrice: 6500, img: 10, badge: 'sale' },
    { name: 'Embroidered Canvas Backpack, Terra', cat: 'learning/school/backpack', brand: 'Crayola', ageGroup: 'age-6-8', gender: 'girls', price: 2450, comparePrice: 2990, img: 8, badge: '' },
    { name: 'Fine Motor Activity Board', cat: 'learning/montessori', brand: 'Fisher-Price', ageGroup: 'age-0-2', gender: 'neutral', price: 1890, comparePrice: 2390, img: 2, badge: 'sale' },
    { name: 'Bamboo Building Blocks, 40-pc', cat: 'toys/building/wood', brand: 'Playmobil', ageGroup: 'age-3-5', gender: 'neutral', price: 1790, img: 9, badge: 'new' },
    { name: 'Princess Figurine Play Set', cat: 'toys/figures', brand: 'Mattel', ageGroup: 'age-3-5', gender: 'girls', price: 1590, comparePrice: 1990, img: 3, badge: '' },
    { name: 'Stuffed Ocean Whale — Deep Teal', cat: 'toys/plush/animal', brand: 'Fisher-Price', ageGroup: 'age-3-5', gender: 'neutral', price: 1390, img: 1, badge: '' },
    { name: "Kids' Ride-On Scooter, Sage", cat: 'outdoor/bike', brand: 'Bestway', ageGroup: 'age-3-5', gender: 'neutral', price: 3890, comparePrice: 4890, img: 0, badge: 'sale' },
    { name: 'Farm Animal Tin-Rattle Set', cat: 'baby/rattle', brand: 'Fisher-Price', ageGroup: 'age-0-2', gender: 'neutral', price: 690, comparePrice: 890, img: 5, badge: '' },
    { name: 'Classic Puzzle — World Map, 200pc', cat: 'learning/puzzle', brand: 'Crayola', ageGroup: 'age-6-8', gender: 'neutral', price: 890, comparePrice: 1190, img: 6, badge: '' },
    { name: 'Wooden Train Set with Depot', cat: 'toys/building/wood', brand: 'Playmobil', ageGroup: 'age-3-5', gender: 'neutral', price: 3290, comparePrice: 3990, img: 7, badge: '' },
    { name: 'Sports Car Diecast 1:18, Cream', cat: 'toys/diecast/cars', brand: 'Maisto', ageGroup: 'age-9-12', gender: 'boys', price: 2490, img: 10, badge: 'new' },
    { name: 'Inflatable Pool — Botanical Print', cat: 'outdoor/pool', brand: 'Intex', ageGroup: 'age-3-5', gender: 'neutral', price: 2190, comparePrice: 2890, img: 0, badge: '' },
  ];

  const productDocs = productSeeds.map((p, i) => {
    const catDoc = allSubMap[p.cat] || subCatMap[p.cat] || catMap[p.cat] || catMap['toys'];
    const brandDoc = brandMap[p.brand] || brands[0];
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {
      name: p.name, slug, sku: `SKT-${String(i + 1).padStart(4, '0')}`,
      description: `A carefully chosen ${p.name.toLowerCase()} from ${p.brand}. Age-graded by our in-house team for ${p.ageGroup?.replace('age-', '')} years.`,
      brand: brandDoc._id, category: catDoc._id,
      ageGroup: p.ageGroup, gender: p.gender,
      price: p.price, comparePrice: p.comparePrice || null,
      images: [IMG[p.img % IMG.length], IMG[(p.img + 3) % IMG.length]],
      stock: i % 7 === 0 ? 3 : 20 + (i % 30),
      badge: p.badge || '',
      rating: +(4 + ((i * 7) % 10) / 10).toFixed(1),
      reviewCount: 12 + ((i * 13) % 140),
      active: true,
    };
  });
  const products = await Product.insertMany(productDocs);
  console.log(`${products.length} products seeded`);

  // ── Reviews ──────────────────────────────────────────────────────────────
  const reviewData = [
    { who: 'Ayesha R.', text: "Arrived wrapped beautifully — my daughter adores it. The finish feels like it'll last years, not months.", stars: 5, verified: true },
    { who: 'Tahmid H.', text: 'Better in person than the photos. The colors are softer and more boutique than we expected.', stars: 5, verified: true },
    { who: 'Nazia K.', text: 'Shipping to Dhanmondi took two days. Packaging was immaculate. Solid build.', stars: 4, verified: true },
    { who: 'Rafiq M.', text: "Lovely gift, wrapped it for my nephew's third birthday. Went over very well at the party.", stars: 5, verified: false },
    { who: 'Shireen A.', text: 'Good value at this price. Paint edges could be cleaner in a couple of places but nothing that bothers a kid.', stars: 4, verified: true },
  ];
  await Review.insertMany(reviewData.flatMap((r, ri) =>
    products.slice(0, 8).map(p => ({ ...r, product: p._id, status: 'approved', createdAt: new Date(Date.now() - ri * 86400000 * 3) }))
  ));
  console.log('Reviews seeded');

  // ── Customers ────────────────────────────────────────────────────────────
  const customerData = [
    { name: 'Ayesha Rahman', email: 'ayesha@example.com', phone: '01711000001', area: 'Dhanmondi', tier: 'VIP', orders: 12, spend: 48600, joined: new Date('2024-01-15') },
    { name: 'Tahmid Hossain', email: 'tahmid@example.com', phone: '01711000002', area: 'Uttara', tier: 'Gold', orders: 7, spend: 22400, joined: new Date('2024-03-10') },
    { name: 'Nazia Khanam', email: 'nazia@example.com', phone: '01711000003', area: 'Sylhet', tier: 'Silver', orders: 4, spend: 12800, joined: new Date('2024-06-20') },
    { name: 'Rafiq Miah', email: 'rafiq@example.com', phone: '01711000004', area: 'Mirpur', tier: 'Bronze', orders: 2, spend: 4200, joined: new Date('2024-09-05') },
    { name: 'Shireen Akter', email: 'shireen@example.com', phone: '01711000005', area: 'Gulshan', tier: 'Gold', orders: 9, spend: 31500, joined: new Date('2024-02-28') },
    { name: 'Imran Khan', email: 'imran@example.com', phone: '01711000006', area: 'Chittagong', tier: 'Bronze', orders: 1, spend: 1890, joined: new Date('2025-01-12') },
  ];
  const customers = await Customer.insertMany(customerData.map(c => ({ ...c, password: 'Customer@1234', lastOrder: new Date() })));
  console.log('Customers seeded');

  // ── Orders ───────────────────────────────────────────────────────────────
  const orderStatuses = ['delivered', 'shipped', 'confirmed', 'new', 'packed', 'delivered', 'returned'];
  const paymentMethods = ['cod', 'bkash', 'cod', 'card', 'nagad'];
  const seededOrders = [];
  for (let i = 0; i < 20; i++) {
    const c = customers[i % customers.length];
    const p1 = products[i % products.length];
    const p2 = products[(i + 3) % products.length];
    const qty1 = 1 + (i % 3);
    const subtotal = p1.price * qty1 + p2.price;
    const shipping = subtotal >= 2500 ? 0 : 60;
    const order = await Order.create({
      customerName: c.name, customerEmail: c.email, phone: c.phone,
      customer: c._id, address: `${i + 1} Sample Street, ${c.area}`, area: c.area,
      lines: [
        { product: p1._id, name: p1.name, sku: p1.sku, price: p1.price, qty: qty1, image: p1.images[0] },
        { product: p2._id, name: p2.name, sku: p2.sku, price: p2.price, qty: 1, image: p2.images[0] },
      ],
      subtotal, shipping, discount: 0, total: subtotal + shipping,
      paymentMethod: paymentMethods[i % paymentMethods.length],
      paymentStatus: i % 5 === 0 ? 'pending' : (paymentMethods[i % paymentMethods.length] === 'cod' ? 'collected' : 'paid'),
      status: orderStatuses[i % orderStatuses.length],
      createdAt: new Date(Date.now() - i * 86400000),
    });
    seededOrders.push(order);
  }
  console.log(`${seededOrders.length} orders seeded`);

  // ── Coupons ──────────────────────────────────────────────────────────────
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percent', value: 10, description: '10% off your first order', minSpend: 1000, limit: 100, status: 'active', startsAt: new Date(), endsAt: new Date(Date.now() + 90 * 86400000) },
    { code: 'EID30', type: 'percent', value: 30, description: 'Eid special — 30% off', minSpend: 2500, limit: 200, status: 'active', startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 86400000) },
    { code: 'FREESHIP', type: 'shipping', value: 0, description: 'Free shipping on any order', minSpend: 0, status: 'active', startsAt: new Date(), endsAt: new Date(Date.now() + 60 * 86400000) },
    { code: 'SAVE500', type: 'fixed', value: 500, description: '৳500 off orders over ৳3000', minSpend: 3000, limit: 50, status: 'active', startsAt: new Date(), endsAt: new Date(Date.now() + 45 * 86400000) },
  ]);
  console.log('Coupons seeded');

  // ── Banners ──────────────────────────────────────────────────────────────
  await Banner.insertMany([
    { slot: 'hero', title: 'Spring \'26 — Big smiles, handpicked toys.', subtitle: 'Bangladesh\'s friendliest toy house. Thousands of toys from 64 trusted brands.', cta: 'Shop new arrivals', ctaLink: '/categories/new-arrivals', active: true, order: 0 },
    { slot: 'strip', title: 'Free shipping over ৳2,500 · COD available · 7-day returns', active: true, order: 0 },
    { slot: 'promo', title: 'End-of-season sale', subtitle: 'Up to 40% off selected toys', cta: 'Shop sale', ctaLink: '/sale', active: true, order: 0 },
  ]);
  console.log('Banners seeded');

  // ── Navigation ───────────────────────────────────────────────────────────
  const navItems = [
    { label: 'New Arrivals', link: '/categories/new-arrivals', badge: 'NEW', order: 0 },
    { label: 'Shop by Age', link: '/products?ageGroup=all', order: 1, children: [
      { label: '0–2 yrs', link: '/products?ageGroup=age-0-2' },
      { label: '3–5 yrs', link: '/products?ageGroup=age-3-5' },
      { label: '6–8 yrs', link: '/products?ageGroup=age-6-8' },
      { label: '9–12 yrs', link: '/products?ageGroup=age-9-12' },
      { label: 'Teens', link: '/products?ageGroup=age-teen' },
    ]},
    { label: 'Toys', link: '/categories/toys', order: 2, children: [
      { label: 'Diecast & Vehicles', link: '/categories/diecast' },
      { label: 'Plush & Soft', link: '/categories/plush' },
      { label: 'Action Figures', link: '/categories/figures' },
      { label: 'Remote Control', link: '/categories/rc' },
      { label: 'Building Blocks', link: '/categories/building' },
    ]},
    { label: 'Learning', link: '/categories/learning', order: 3 },
    { label: 'Baby', link: '/categories/baby', order: 4 },
    { label: 'Outdoor', link: '/categories/outdoor', order: 5 },
    { label: 'Brands', link: '/brands', order: 6 },
    { label: 'Sale', link: '/categories/sale', badge: 'SALE', order: 7 },
    { label: 'Journal', link: '/blog', order: 8 },
  ];
  await Navigation.insertMany(navItems);
  console.log('Navigation seeded');

  // ── Homepage sections ────────────────────────────────────────────────────
  await HomeSection.insertMany([
    { type: 'hero', title: 'Hero Banner', enabled: true, order: 0 },
    { type: 'categories', title: 'The Catalogue', eyebrow: 'The catalogue', enabled: true, order: 1 },
    { type: 'ages', title: 'Shop by Age', eyebrow: 'Shop by age', enabled: true, order: 2 },
    { type: 'products', title: 'Just Landed', eyebrow: 'This week', filter: 'new', limit: 8, ctaLabel: 'See all new arrivals', ctaLink: '/categories/new-arrivals', enabled: true, order: 3 },
    { type: 'editorial_band', title: 'For Every Kind of Play', eyebrow: 'Editorial', bandStyle: 'yellow', bandText: 'Boys, girls, and not-a-category-kids each have a shelf.', bandButtons: [{ label: 'For boys', link: '/products?gender=boys', style: 'dark' }, { label: 'For girls', link: '/products?gender=girls', style: 'dark' }, { label: 'Unisex →', link: '/products?gender=neutral', style: 'outline' }], enabled: true, order: 4 },
    { type: 'products', title: 'The Mark-down Shelf', eyebrow: 'End-of-season sale · up to 40% off', filter: 'sale', limit: 8, ctaLabel: 'Shop all sale', ctaLink: '/categories/sale', enabled: true, order: 5 },
    { type: 'editorial_band', title: 'Slightly Imperfect. Significantly Less.', eyebrow: 'Second chances', bandStyle: 'dark', bandText: 'A small corner of the shop for open-box, returned, or gently-dented items. Up to 65% off.', bandButtons: [{ label: 'Shop damaged & returned', link: '/categories/damaged', style: 'coral' }], enabled: true, order: 6 },
    { type: 'brands', title: 'Sixty-four Brands, Carefully Chosen', eyebrow: 'The shelf', enabled: true, order: 7 },
    { type: 'products', title: "What Dhaka's Kids Are Reaching For", eyebrow: 'On the play-table', filter: 'featured', limit: 8, enabled: true, order: 8 },
    { type: 'journal', title: 'Read, Then Play', eyebrow: 'The journal', ctaLabel: 'All stories', ctaLink: '/blog', enabled: true, order: 9 },
    { type: 'newsletter', title: 'Letters from SK Toy', enabled: true, order: 10 },
  ]);
  console.log('Homepage sections seeded');

  // ── Blog posts ───────────────────────────────────────────────────────────
  await BlogPost.insertMany([
    { title: "A Parent's Short Guide to Choosing a First Diecast", slug: 'choose-first-diecast', excerpt: 'Scale, finish, safety — what actually matters when your six-year-old asks for a model car for the third weekend running.', category: 'Buying Guides', author: 'Nusrat K.', readTime: '6 min read', status: 'published', publishedAt: new Date('2026-04-14'), coverImage: IMG[10], body: '## Start with scale, not brand\n\nScale tells you how close the model is to the real car. 1:18 is display-case material. 1:24 is the comfortable daily-play size.\n\n## Weight is a real signal\n\nPick the box up. A good diecast has real heft — that\'s the metal you\'re paying for.' },
    { title: 'The Capsule Playroom — Ten Toys That Do a Lot', slug: 'playroom-capsule', excerpt: 'We asked twelve families in Gulshan what their kids reached for most often. These ten showed up on almost every list.', category: 'Editorial', author: 'Tahia R.', readTime: '9 min read', status: 'published', publishedAt: new Date('2026-04-02'), coverImage: IMG[9] },
    { title: 'Why We Keep Coming Back to Wooden Toys', slug: 'why-wood', excerpt: 'A soft argument for heavier play: what wooden toys teach about weight, balance, and slowness.', category: 'Journal', author: 'Imtiaz S.', readTime: '4 min read', status: 'published', publishedAt: new Date('2026-03-21'), coverImage: IMG[2] },
    { title: 'STEM Before Screens: Open-Ended Play for 3–5', slug: 'stem-early', excerpt: 'Magnetic tiles, simple circuits, and sorting trays — building early reasoning without adding another device.', category: 'Learning', author: 'Nusrat K.', readTime: '7 min read', status: 'published', publishedAt: new Date('2026-03-09'), coverImage: IMG[6] },
    { title: 'Sensory Play for Babies, Without Plastic Overload', slug: 'sensory-baby', excerpt: 'Texture, rattle, and stretch. A short list of what our team stocks for our own little ones.', category: 'Baby', author: 'Nazia A.', readTime: '5 min read', status: 'published', publishedAt: new Date('2026-02-24'), coverImage: IMG[4] },
    { title: 'Ten Gift-Ready Toys Under ৳1500', slug: 'gift-10', excerpt: 'Occasion gifts that feel thought-through, even on a tight budget. Wrap-ready and wait-worthy.', category: 'Gift Guide', author: 'Tahia R.', readTime: '3 min read', status: 'published', publishedAt: new Date('2026-02-10'), coverImage: IMG[3] },
  ]);
  console.log('Blog posts seeded');

  // ── CMS Pages ────────────────────────────────────────────────────────────
  await CmsPage.insertMany([
    { title: 'FAQ', slug: 'faq', status: 'published', blocks: [
      { type: 'heading', text: 'Frequently Asked Questions' },
      { type: 'qa', q: 'Do you offer Cash on Delivery?', a: 'Yes, COD is available across all 64 districts of Bangladesh.' },
      { type: 'qa', q: 'What is your return policy?', a: 'We offer 7-day easy returns on unused items in original packaging.' },
      { type: 'qa', q: 'How long does shipping take?', a: 'Dhaka: 1 day. Chittagong/Sylhet/Rajshahi: 2 days. Rest of Bangladesh: 2–3 days.' },
    ]},
    { title: 'Shipping & Returns', slug: 'shipping', status: 'published', blocks: [
      { type: 'heading', text: 'Shipping Information' },
      { type: 'paragraph', text: 'Free standard shipping on orders over ৳2,500 — anywhere in Bangladesh.' },
    ]},
    { title: 'Privacy Policy', slug: 'privacy', status: 'published', blocks: [
      { type: 'heading', text: 'Privacy Policy' },
      { type: 'paragraph', text: 'We take your privacy seriously. We never sell your personal data.' },
    ]},
    { title: 'Terms & Conditions', slug: 'terms', status: 'published', blocks: [
      { type: 'heading', text: 'Terms & Conditions' },
      { type: 'paragraph', text: 'By using SK Toy you agree to these terms.' },
    ]},
    { title: 'About SK Toy', slug: 'about', status: 'published', blocks: [
      { type: 'heading', text: 'About SK Toy' },
      { type: 'paragraph', text: 'Bangladesh\'s friendliest toy house, right in Dhaka. Hand-picked toys delivered from our warehouse in Gulshan.' },
    ]},
  ]);
  console.log('CMS pages seeded');

  console.log('\n✅ Seed completed successfully!');
  console.log('   Admin login: admin@sktoy.com.bd / Admin@1234');
  console.log('   Customer login: ayesha@example.com / Customer@1234');
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
