require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User        = require('../models/User');
const Customer    = require('../models/Customer');
const Category    = require('../models/Category');

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
    User.deleteMany(), Customer.deleteMany(), Category.deleteMany(),
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

  // ── Categories (from SK Toy Category PDF) ─────────────────────────────────
  const catData = [
    { name: 'Shop by Age',                    slug: 'shop-by-age',       order: 0 },
    { name: 'Cars & Vehicles',                slug: 'cars-vehicles',     order: 1 },
    { name: 'Baby & Toddler Toys',            slug: 'baby-toddler',     order: 2 },
    { name: 'Educational Toys',               slug: 'educational',       order: 3 },
    { name: 'Electronic & Entertainment Toys', slug: 'electronic-entertainment', order: 4 },
    { name: 'Dolls & Figures',                slug: 'dolls-figures',     order: 5 },
    { name: 'Books & Learning Materials',     slug: 'books-learning',    order: 6 },
    { name: 'Combo & Gift Sets',              slug: 'combo-gift-sets',   order: 7 },
  ];
  const topCats = await Category.insertMany(catData);
  const catMap = Object.fromEntries(topCats.map(c => [c.slug, c]));

  const subCatDefs = [
    // Shop by Age
    { name: '0-12 Months', slug: 'age/0-12-months', parent: 'shop-by-age', order: 0 },
    { name: '1-2 Years',   slug: 'age/1-2-years',   parent: 'shop-by-age', order: 1 },
    { name: '3-5 Years',   slug: 'age/3-5-years',   parent: 'shop-by-age', order: 2 },
    { name: '6-8 Years',   slug: 'age/6-8-years',   parent: 'shop-by-age', order: 3 },
    { name: '9-12 Years',  slug: 'age/9-12-years',  parent: 'shop-by-age', order: 4 },
    // Cars & Vehicles
    { name: 'Hot Wheels Cars',        slug: 'cars/hot-wheels',        parent: 'cars-vehicles', order: 0 },
    { name: 'Die Cast Cars',          slug: 'cars/die-cast',          parent: 'cars-vehicles', order: 1 },
    { name: 'Remote Control (RC) Cars', slug: 'cars/rc-cars',         parent: 'cars-vehicles', order: 2 },
    { name: 'Battery Operated Cars',  slug: 'cars/battery-operated',  parent: 'cars-vehicles', order: 3 },
    { name: 'Construction Vehicles',  slug: 'cars/construction',      parent: 'cars-vehicles', order: 4 },
    { name: 'Bike & Motorcycle Toys', slug: 'cars/bike-motorcycle',   parent: 'cars-vehicles', order: 5 },
    { name: 'Track Sets & Racing Sets', slug: 'cars/track-racing',    parent: 'cars-vehicles', order: 6 },
    // Baby & Toddler Toys
    { name: 'Rattle & Teether',       slug: 'baby/rattle-teether',    parent: 'baby-toddler', order: 0 },
    { name: 'Soft Toys',              slug: 'baby/soft-toys',         parent: 'baby-toddler', order: 1 },
    { name: 'Musical Toys',           slug: 'baby/musical-toys',      parent: 'baby-toddler', order: 2 },
    { name: 'Learning Toys (0-3 Years)', slug: 'baby/learning-toys',  parent: 'baby-toddler', order: 3 },
    { name: 'Activity Toys',          slug: 'baby/activity-toys',     parent: 'baby-toddler', order: 4 },
    // Educational Toys
    { name: 'Learning Boards',        slug: 'edu/learning-boards',    parent: 'educational', order: 0 },
    { name: 'Flash Cards',            slug: 'edu/flash-cards',        parent: 'educational', order: 1 },
    { name: 'Puzzle & Brain Games',   slug: 'edu/puzzle-brain-games', parent: 'educational', order: 2 },
    { name: 'Writing & Drawing Practice', slug: 'edu/writing-drawing', parent: 'educational', order: 3 },
    // Electronic & Entertainment Toys
    { name: 'Musical Toys',           slug: 'electronic/musical-toys',  parent: 'electronic-entertainment', order: 0 },
    { name: 'Dancing Toys',           slug: 'electronic/dancing-toys',  parent: 'electronic-entertainment', order: 1 },
    { name: 'Light & Sound Toys',     slug: 'electronic/light-sound',   parent: 'electronic-entertainment', order: 2 },
    { name: 'Interactive Toys',       slug: 'electronic/interactive',   parent: 'electronic-entertainment', order: 3 },
    { name: 'Gaming Toys',            slug: 'electronic/gaming-toys',   parent: 'electronic-entertainment', order: 4 },
    // Dolls & Figures
    { name: 'Barbie Dolls',           slug: 'dolls/barbie',            parent: 'dolls-figures', order: 0 },
    { name: 'Baby Dolls',             slug: 'dolls/baby-dolls',        parent: 'dolls-figures', order: 1 },
    { name: 'Action Figures',         slug: 'dolls/action-figures',    parent: 'dolls-figures', order: 2 },
    { name: 'Cartoon Characters',     slug: 'dolls/cartoon-characters', parent: 'dolls-figures', order: 3 },
    // Books & Learning Materials
    { name: 'Story Books',            slug: 'books/story-books',       parent: 'books-learning', order: 0 },
    { name: 'Kids Educational Books', slug: 'books/educational-books', parent: 'books-learning', order: 1 },
    { name: 'Activity Books',         slug: 'books/activity-books',    parent: 'books-learning', order: 2 },
    // Combo & Gift Sets
    { name: 'Toy Combo Packs',        slug: 'combo/toy-combo-packs',   parent: 'combo-gift-sets', order: 0 },
    { name: 'Gift Box',               slug: 'combo/gift-box',          parent: 'combo-gift-sets', order: 1 },
    { name: 'Bundle Offers',          slug: 'combo/bundle-offers',     parent: 'combo-gift-sets', order: 2 },
  ];

  const subCatsCreated = await Promise.all(subCatDefs.map(s =>
    Category.create({ name: s.name, slug: s.slug, parent: catMap[s.parent]._id, order: s.order })
  ));
  // Update parent children arrays
  for (const sub of subCatsCreated) {
    await Category.findByIdAndUpdate(sub.parent, { $push: { children: sub._id } });
  }
  const subCatMap = Object.fromEntries(subCatsCreated.map(c => [c.slug, c]));
  const allSubMap = { ...subCatMap };
  console.log('Categories seeded');

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
    { name: 'Wooden Rainbow Stacker', cat: 'edu/learning-boards', ageGroup: 'age-0-2', gender: 'neutral', price: 1450, comparePrice: 1890, img: 2, badge: '' },
    { name: 'Classic Red Sports Diecast 1:24', cat: 'cars/die-cast', ageGroup: 'age-6-8', gender: 'boys', price: 1299, comparePrice: 1750, img: 10, badge: 'sale' },
    { name: 'Plush Honey Bear — Caramel', cat: 'baby/soft-toys', ageGroup: 'age-3-5', gender: 'neutral', price: 990, img: 3, badge: 'new' },
    { name: 'Double-Sided Flash Card Set', cat: 'edu/flash-cards', ageGroup: 'age-6-8', gender: 'neutral', price: 680, comparePrice: 950, img: 5, badge: 'sale' },
    { name: 'RC Rally Car — Sand Beige', cat: 'cars/rc-cars', ageGroup: 'age-9-12', gender: 'boys', price: 3450, comparePrice: 4200, img: 1, badge: '' },
    { name: 'Musical Rattle & Teether Set', cat: 'baby/rattle-teether', ageGroup: 'age-0-2', gender: 'neutral', price: 540, comparePrice: 880, img: 4, badge: 'sale' },
    { name: 'Interactive Learning Board', cat: 'edu/learning-boards', ageGroup: 'age-3-5', gender: 'neutral', price: 2890, img: 9, badge: 'new' },
    { name: 'Soft Plush Teddy — Warm Cream', cat: 'baby/soft-toys', ageGroup: 'age-0-2', gender: 'neutral', price: 1190, comparePrice: 1490, img: 7, badge: '' },
    { name: 'Writing & Drawing Practice Kit', cat: 'edu/writing-drawing', ageGroup: 'age-6-8', gender: 'neutral', price: 1290, comparePrice: 1590, img: 5, badge: '' },
    { name: 'Dinosaur Action Figure Set', cat: 'dolls/action-figures', ageGroup: 'age-6-8', gender: 'boys', price: 2150, comparePrice: 2850, img: 11, badge: 'sale' },
    { name: 'Soft Silicone Teether Ring', cat: 'baby/rattle-teether', ageGroup: 'age-0-2', gender: 'neutral', price: 390, img: 0, badge: '' },
    { name: 'Dancing Musical Robot', cat: 'electronic/dancing-toys', ageGroup: 'age-3-5', gender: 'neutral', price: 490, comparePrice: 690, img: 6, badge: '' },
    { name: 'Battery Operated Racing Car', cat: 'cars/battery-operated', ageGroup: 'age-9-12', gender: 'neutral', price: 4990, comparePrice: 6500, img: 10, badge: 'sale' },
    { name: 'Kids Story Book Collection', cat: 'books/story-books', ageGroup: 'age-6-8', gender: 'girls', price: 2450, comparePrice: 2990, img: 8, badge: '' },
    { name: 'Fine Motor Activity Board', cat: 'baby/activity-toys', ageGroup: 'age-0-2', gender: 'neutral', price: 1890, comparePrice: 2390, img: 2, badge: 'sale' },
    { name: 'Puzzle & Brain Games Set, 40-pc', cat: 'edu/puzzle-brain-games', ageGroup: 'age-3-5', gender: 'neutral', price: 1790, img: 9, badge: 'new' },
    { name: 'Barbie Princess Doll Set', cat: 'dolls/barbie', ageGroup: 'age-3-5', gender: 'girls', price: 1590, comparePrice: 1990, img: 3, badge: '' },
    { name: 'Cartoon Character Figure — Deep Teal', cat: 'dolls/cartoon-characters', ageGroup: 'age-3-5', gender: 'neutral', price: 1390, img: 1, badge: '' },
    { name: 'Bike & Motorcycle Toy Set', cat: 'cars/bike-motorcycle', ageGroup: 'age-3-5', gender: 'neutral', price: 3890, comparePrice: 4890, img: 0, badge: 'sale' },
    { name: 'Baby Musical Toy Set', cat: 'baby/musical-toys', ageGroup: 'age-0-2', gender: 'neutral', price: 690, comparePrice: 890, img: 5, badge: '' },
    { name: 'Light & Sound Spaceship', cat: 'electronic/light-sound', ageGroup: 'age-6-8', gender: 'neutral', price: 890, comparePrice: 1190, img: 6, badge: '' },
    { name: 'Construction Vehicle Set with Depot', cat: 'cars/construction', ageGroup: 'age-3-5', gender: 'neutral', price: 3290, comparePrice: 3990, img: 7, badge: '' },
    { name: 'Hot Wheels Sports Car Pack', cat: 'cars/hot-wheels', ageGroup: 'age-9-12', gender: 'boys', price: 2490, img: 10, badge: 'new' },
    { name: 'Toy Combo Gift Box — Birthday', cat: 'combo/gift-box', ageGroup: 'age-3-5', gender: 'neutral', price: 2190, comparePrice: 2890, img: 0, badge: '' },
  ];

  const productDocs = productSeeds.map((p, i) => {
    const catDoc = allSubMap[p.cat] || catMap[p.cat] || topCats[0];
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {
      name: p.name, slug, sku: `SKT-${String(i + 1).padStart(4, '0')}`,
      description: `A carefully chosen ${p.name.toLowerCase()}. Age-graded by our in-house team for ${p.ageGroup?.replace('age-', '')} years.`,
      category: catDoc._id,
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
    { slot: 'hero', title: 'Spring \'26 — Big smiles, handpicked toys.', subtitle: 'Bangladesh\'s friendliest toy house. Thousands of toys for every age.', cta: 'Shop new arrivals', ctaLink: '/categories/new-arrivals', active: true, order: 0 },
    { slot: 'strip', title: 'Free shipping over ৳2,500 · COD available · 7-day returns', active: true, order: 0 },
    { slot: 'promo', title: 'End-of-season sale', subtitle: 'Up to 40% off selected toys', cta: 'Shop sale', ctaLink: '/sale', active: true, order: 0 },
  ]);
  console.log('Banners seeded');

  // ── Navigation ───────────────────────────────────────────────────────────
  const navItems = [
    { label: 'Shop by Age', link: '/categories/shop-by-age', order: 0, children: [
      { label: '0-12 Months', link: '/categories/age/0-12-months' },
      { label: '1-2 Years', link: '/categories/age/1-2-years' },
      { label: '3-5 Years', link: '/categories/age/3-5-years' },
      { label: '6-8 Years', link: '/categories/age/6-8-years' },
      { label: '9-12 Years', link: '/categories/age/9-12-years' },
    ]},
    { label: 'Cars & Vehicles', link: '/categories/cars-vehicles', order: 1, children: [
      { label: 'Hot Wheels Cars', link: '/categories/cars/hot-wheels' },
      { label: 'Die Cast Cars', link: '/categories/cars/die-cast' },
      { label: 'RC Cars', link: '/categories/cars/rc-cars' },
      { label: 'Battery Operated', link: '/categories/cars/battery-operated' },
      { label: 'Construction Vehicles', link: '/categories/cars/construction' },
      { label: 'Bike & Motorcycle', link: '/categories/cars/bike-motorcycle' },
      { label: 'Track & Racing Sets', link: '/categories/cars/track-racing' },
    ]},
    { label: 'Baby & Toddler', link: '/categories/baby-toddler', order: 2, children: [
      { label: 'Rattle & Teether', link: '/categories/baby/rattle-teether' },
      { label: 'Soft Toys', link: '/categories/baby/soft-toys' },
      { label: 'Musical Toys', link: '/categories/baby/musical-toys' },
      { label: 'Learning Toys', link: '/categories/baby/learning-toys' },
      { label: 'Activity Toys', link: '/categories/baby/activity-toys' },
    ]},
    { label: 'Educational', link: '/categories/educational', order: 3, children: [
      { label: 'Learning Boards', link: '/categories/edu/learning-boards' },
      { label: 'Flash Cards', link: '/categories/edu/flash-cards' },
      { label: 'Puzzle & Brain Games', link: '/categories/edu/puzzle-brain-games' },
      { label: 'Writing & Drawing', link: '/categories/edu/writing-drawing' },
    ]},
    { label: 'Electronic & Entertainment', link: '/categories/electronic-entertainment', order: 4 },
    { label: 'Dolls & Figures', link: '/categories/dolls-figures', order: 5 },
    { label: 'Books', link: '/categories/books-learning', order: 6 },
    { label: 'Gift Sets', link: '/categories/combo-gift-sets', order: 7 },
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
    { type: 'products', title: "What Dhaka's Kids Are Reaching For", eyebrow: 'On the play-table', filter: 'featured', limit: 8, enabled: true, order: 7 },
    { type: 'journal', title: 'Read, Then Play', eyebrow: 'The journal', ctaLabel: 'All stories', ctaLink: '/blog', enabled: true, order: 8 },
    { type: 'newsletter', title: 'Letters from SK Toy', enabled: true, order: 9 },
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
