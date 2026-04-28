/* Global data store for SK Toy */

const CATEGORIES = [
  {
    id: 'new-arrivals', name: 'New Arrivals', slug: 'new-arrivals', tag: 'NEW',
    children: []
  },
  {
    id: 'by-age', name: 'Shop by Age', slug: 'by-age',
    children: [
      { id: 'age-0-2', name: '0–2 yrs', slug: 'age/0-2' },
      { id: 'age-3-5', name: '3–5 yrs', slug: 'age/3-5' },
      { id: 'age-6-8', name: '6–8 yrs', slug: 'age/6-8' },
      { id: 'age-9-12', name: '9–12 yrs', slug: 'age/9-12' },
      { id: 'age-teen', name: 'Teens', slug: 'age/teen' },
    ]
  },
  {
    id: 'by-gender', name: 'Shop by Gender', slug: 'by-gender',
    children: [
      { id: 'boys', name: 'For Boys', slug: 'gender/boys' },
      { id: 'girls', name: 'For Girls', slug: 'gender/girls' },
      { id: 'neutral', name: 'Unisex', slug: 'gender/neutral' },
    ]
  },
  {
    id: 'toys', name: 'Toys', slug: 'toys',
    children: [
      {
        id: 'diecast', name: 'Diecast & Vehicles', slug: 'toys/diecast',
        children: [
          { id: 'diecast-cars', name: 'Cars', slug: 'toys/diecast/cars' },
          { id: 'diecast-trucks', name: 'Trucks', slug: 'toys/diecast/trucks' },
          { id: 'diecast-military', name: 'Military', slug: 'toys/diecast/military' },
          { id: 'diecast-aviation', name: 'Aviation', slug: 'toys/diecast/aviation' },
        ]
      },
      {
        id: 'plush', name: 'Plush & Soft', slug: 'toys/plush',
        children: [
          { id: 'plush-animal', name: 'Stuffed Animals', slug: 'toys/plush/animal' },
          { id: 'plush-character', name: 'Characters', slug: 'toys/plush/character' },
          { id: 'plush-teddy', name: 'Teddy Bears', slug: 'toys/plush/teddy' },
        ]
      },
      {
        id: 'figures', name: 'Action Figures', slug: 'toys/figures',
        children: [
          { id: 'fig-super', name: 'Superheroes', slug: 'toys/figures/super' },
          { id: 'fig-dino', name: 'Dinosaurs', slug: 'toys/figures/dino' },
          { id: 'fig-animal', name: 'Animals', slug: 'toys/figures/animal' },
        ]
      },
      {
        id: 'rc', name: 'Remote Control', slug: 'toys/rc',
        children: [
          { id: 'rc-car', name: 'RC Cars', slug: 'toys/rc/car' },
          { id: 'rc-drone', name: 'Drones', slug: 'toys/rc/drone' },
          { id: 'rc-heli', name: 'Helicopters', slug: 'toys/rc/heli' },
        ]
      },
      {
        id: 'building', name: 'Building Blocks', slug: 'toys/building',
        children: [
          { id: 'build-brick', name: 'Bricks', slug: 'toys/building/brick' },
          { id: 'build-magnet', name: 'Magnetic', slug: 'toys/building/magnet' },
          { id: 'build-wood', name: 'Wooden', slug: 'toys/building/wood' },
        ]
      },
    ]
  },
  {
    id: 'learning', name: 'Education & Learning', slug: 'learning',
    children: [
      {
        id: 'school', name: 'School Supplies', slug: 'learning/school',
        children: [
          { id: 'sch-backpack', name: 'Backpacks', slug: 'learning/school/backpack' },
          { id: 'sch-lunch', name: 'Lunch Boxes', slug: 'learning/school/lunch' },
          { id: 'sch-stationery', name: 'Stationery', slug: 'learning/school/stationery' },
          { id: 'sch-geometry', name: 'Geometry Sets', slug: 'learning/school/geometry' },
        ]
      },
      { id: 'stem', name: 'STEM Toys', slug: 'learning/stem' },
      { id: 'puzzle', name: 'Puzzles', slug: 'learning/puzzle' },
      { id: 'books', name: 'Activity Books', slug: 'learning/books' },
      { id: 'montessori', name: 'Montessori', slug: 'learning/montessori' },
    ]
  },
  {
    id: 'baby', name: 'Baby Gear', slug: 'baby',
    children: [
      { id: 'baby-bath', name: 'Bath Toys', slug: 'baby/bath' },
      { id: 'baby-rattle', name: 'Rattles', slug: 'baby/rattle' },
      { id: 'baby-stroller', name: 'Strollers', slug: 'baby/stroller' },
      { id: 'baby-teether', name: 'Teethers', slug: 'baby/teether' },
    ]
  },
  {
    id: 'outdoor', name: 'Outdoor & Sports', slug: 'outdoor',
    children: [
      { id: 'out-pool', name: 'Pool & Water', slug: 'outdoor/pool' },
      { id: 'out-bike', name: 'Bikes & Ride-ons', slug: 'outdoor/bike' },
      { id: 'out-sport', name: 'Sports Gear', slug: 'outdoor/sport' },
      { id: 'out-garden', name: 'Garden Play', slug: 'outdoor/garden' },
    ]
  },
  {
    id: 'brands', name: 'Brands', slug: 'brands', children: []
  },
  {
    id: 'sale', name: 'Sale', slug: 'sale', tag: 'SALE', children: []
  },
  {
    id: 'clearance', name: 'Stock Clearance', slug: 'clearance', children: []
  },
  {
    id: 'damaged', name: 'Damaged & Returned', slug: 'damaged', children: []
  },
  {
    id: 'blogs', name: 'Journal', slug: 'journal', children: []
  },
];

const BRANDS = [
  { name: 'Kinsmart', em: 'Kin' },
  { name: 'Intex', em: 'In' },
  { name: 'Maisto', em: 'Ma' },
  { name: 'Bburago', em: 'Bb' },
  { name: 'Fisher', em: 'Fi' },
  { name: 'Crayola', em: 'Cr' },
  { name: 'Bestway', em: 'Be' },
  { name: 'Syma', em: 'Sy' },
  { name: 'Mattel', em: 'Ma' },
  { name: 'Playmobil', em: 'Pl' },
  { name: 'Hot Wheels', em: 'HW' },
  { name: 'Schleich', em: 'Sc' },
];

const CATEGORY_ICONS = {
  toys: 'T', diecast: '🚗', plush: '🧸', figures: 'F', rc: 'R',
  building: 'B', learning: 'L', baby: 'B', outdoor: 'O', school: 'S',
};

/* Generate a product catalog with enough variety */
const PRODUCT_SEEDS = [
  { name: 'Wooden Rainbow Stacker', cat: 'toys', sub: 'building', subsub: 'build-wood', brand: 'Playmobil', age: 'age-0-2', gender: 'neutral', price: 1450, was: 1890, img: 3 },
  { name: 'Classic Red Sports Diecast 1:24', cat: 'toys', sub: 'diecast', subsub: 'diecast-cars', brand: 'Kinsmart', age: 'age-6-8', gender: 'boys', price: 1299, was: 1750, img: 11, badge: 'sale' },
  { name: 'Plush Honey Bear — Caramel', cat: 'toys', sub: 'plush', subsub: 'plush-teddy', brand: 'Fisher', age: 'age-3-5', gender: 'neutral', price: 990, was: null, img: 4, badge: 'new' },
  { name: 'Double-Sided Geometry Case', cat: 'learning', sub: 'school', subsub: 'sch-geometry', brand: 'Crayola', age: 'age-6-8', gender: 'neutral', price: 680, was: 950, img: 9, badge: 'sale' },
  { name: 'RC Rally Car — Sand Beige', cat: 'toys', sub: 'rc', subsub: 'rc-car', brand: 'Syma', age: 'age-9-12', gender: 'boys', price: 3450, was: 4200, img: 2 },
  { name: 'Mini Dinosaur Bath Friends (set of 6)', cat: 'baby', sub: 'baby-bath', brand: 'Fisher', age: 'age-0-2', gender: 'neutral', price: 540, was: 880, img: 5, badge: 'sale' },
  { name: 'Magnetic Tiles — Forest Palette', cat: 'toys', sub: 'building', subsub: 'build-magnet', brand: 'Playmobil', age: 'age-3-5', gender: 'neutral', price: 2890, was: null, img: 10, badge: 'new' },
  { name: 'Classic Teddy — Warm Cream', cat: 'toys', sub: 'plush', subsub: 'plush-teddy', brand: 'Fisher', age: 'age-0-2', gender: 'neutral', price: 1190, was: 1490, img: 8 },
  { name: 'Starter Stationery Kit, 42-pc', cat: 'learning', sub: 'school', subsub: 'sch-stationery', brand: 'Crayola', age: 'age-6-8', gender: 'neutral', price: 1290, was: 1590, img: 6 },
  { name: 'Dinosaur Expedition Figure Set', cat: 'toys', sub: 'figures', subsub: 'fig-dino', brand: 'Schleich', age: 'age-6-8', gender: 'boys', price: 2150, was: 2850, img: 12, badge: 'sale' },
  { name: 'Soft Silicone Teether Ring', cat: 'baby', sub: 'baby-teether', brand: 'Fisher', age: 'age-0-2', gender: 'neutral', price: 390, was: null, img: 1 },
  { name: 'Pool Noodle Set, Sherbet', cat: 'outdoor', sub: 'out-pool', brand: 'Intex', age: 'age-3-5', gender: 'neutral', price: 490, was: 690, img: 7 },
  { name: 'Silent RC Quadcopter Drone', cat: 'toys', sub: 'rc', subsub: 'rc-drone', brand: 'Syma', age: 'age-9-12', gender: 'neutral', price: 4990, was: 6500, img: 11, badge: 'sale' },
  { name: 'Embroidered Canvas Backpack, Terra', cat: 'learning', sub: 'school', subsub: 'sch-backpack', brand: 'Crayola', age: 'age-6-8', gender: 'girls', price: 2450, was: 2990, img: 9 },
  { name: 'Fine Motor Activity Board', cat: 'learning', sub: 'montessori', brand: 'Fisher', age: 'age-0-2', gender: 'neutral', price: 1890, was: 2390, img: 3, badge: 'sale' },
  { name: 'Bamboo Building Blocks, 40-pc', cat: 'toys', sub: 'building', subsub: 'build-wood', brand: 'Playmobil', age: 'age-3-5', gender: 'neutral', price: 1790, was: null, img: 10, badge: 'new' },
  { name: 'Princess Figurine Play Set', cat: 'toys', sub: 'figures', brand: 'Mattel', age: 'age-3-5', gender: 'girls', price: 1590, was: 1990, img: 4 },
  { name: 'Stuffed Ocean Whale — Deep Teal', cat: 'toys', sub: 'plush', subsub: 'plush-animal', brand: 'Fisher', age: 'age-3-5', gender: 'neutral', price: 1390, was: null, img: 2 },
  { name: 'Kids\' Ride-On Scooter, Sage', cat: 'outdoor', sub: 'out-bike', brand: 'Bestway', age: 'age-3-5', gender: 'neutral', price: 3890, was: 4890, img: 5, badge: 'sale' },
  { name: 'Farm Animal Tin-Rattle Set', cat: 'baby', sub: 'baby-rattle', brand: 'Fisher', age: 'age-0-2', gender: 'neutral', price: 690, was: 890, img: 6 },
  { name: 'Classic Puzzle — World Map, 200pc', cat: 'learning', sub: 'puzzle', brand: 'Crayola', age: 'age-6-8', gender: 'neutral', price: 890, was: 1190, img: 7 },
  { name: 'Wooden Train Set with Depot', cat: 'toys', sub: 'building', subsub: 'build-wood', brand: 'Playmobil', age: 'age-3-5', gender: 'neutral', price: 3290, was: 3990, img: 8 },
  { name: 'Sports Car Diecast 1:18, Cream', cat: 'toys', sub: 'diecast', subsub: 'diecast-cars', brand: 'Maisto', age: 'age-9-12', gender: 'boys', price: 2490, was: null, img: 12, badge: 'new' },
  { name: 'Inflatable Pool — Botanical Print', cat: 'outdoor', sub: 'out-pool', brand: 'Intex', age: 'age-3-5', gender: 'neutral', price: 2190, was: 2890, img: 1 },
];

const REVIEW_SNIPPETS = [
  { who: 'Ayesha R.', text: 'Arrived wrapped beautifully — my daughter adores it. The finish feels like it\'ll last years, not months.', stars: 5, date: '12 Mar', verified: true },
  { who: 'Tahmid H.', text: 'Better in person than the photos. The colors are softer and more boutique than we expected.', stars: 5, date: '28 Feb', verified: true },
  { who: 'Nazia K.', text: 'Shipping to Dhanmondi took two days. Packaging was immaculate. Solid build.', stars: 4, date: '19 Feb', verified: true },
  { who: 'Rafiq M.', text: 'Lovely gift, wrapped it for my nephew\'s third birthday. Went over very well at the party.', stars: 5, date: '07 Feb', verified: false },
  { who: 'Shireen A.', text: 'Good value at this price. Paint edges could be cleaner in a couple of places but nothing that bothers a kid.', stars: 4, date: '02 Feb', verified: true },
];

const BLOG_POSTS = [
  {
    id: 'choose-first-diecast',
    title: 'A Parent\'s Short Guide to Choosing a First Diecast',
    excerpt: 'Scale, finish, safety — what actually matters when your six-year-old asks for a model car for the third weekend running.',
    category: 'Buying Guides',
    read: '6 min read',
    date: 'April 14, 2026',
    author: 'Nusrat K.',
    img: 11,
  },
  {
    id: 'playroom-capsule',
    title: 'The Capsule Playroom — Ten Toys That Do a Lot',
    excerpt: 'We asked twelve families in Gulshan what their kids reached for most often. These ten showed up on almost every list.',
    category: 'Editorial',
    read: '9 min read',
    date: 'April 02, 2026',
    author: 'Tahia R.',
    img: 10,
  },
  {
    id: 'why-wood',
    title: 'Why We Keep Coming Back to Wooden Toys',
    excerpt: 'A soft argument for heavier play: what wooden toys teach about weight, balance, and slowness.',
    category: 'Journal',
    read: '4 min read',
    date: 'March 21, 2026',
    author: 'Imtiaz S.',
    img: 3,
  },
  {
    id: 'stem-early',
    title: 'STEM Before Screens: Open-Ended Play for 3–5',
    excerpt: 'Magnetic tiles, simple circuits, and sorting trays — building early reasoning without adding another device.',
    category: 'Learning',
    read: '7 min read',
    date: 'March 09, 2026',
    author: 'Nusrat K.',
    img: 7,
  },
  {
    id: 'sensory-baby',
    title: 'Sensory Play for Babies, Without Plastic Overload',
    excerpt: 'Texture, rattle, and stretch. A short list of what our team stocks for our own little ones.',
    category: 'Baby',
    read: '5 min read',
    date: 'February 24, 2026',
    author: 'Nazia A.',
    img: 5,
  },
  {
    id: 'gift-10',
    title: 'Ten Gift-Ready Toys Under ৳1500',
    excerpt: 'Occasion gifts that feel thought-through, even on a tight budget. Wrap-ready and wait-worthy.',
    category: 'Gift Guide',
    read: '3 min read',
    date: 'February 10, 2026',
    author: 'Tahia R.',
    img: 4,
  },
];

const ARTICLE_BODY = `Every parent arrives at the diecast aisle the same way — usually trailing a six-year-old who has suddenly developed strong opinions about scale. Before you commit, it helps to know what's worth paying for and what isn't.

## Start with scale, not brand

Scale — the ratio on the box — tells you how close the model is to the real car. 1:18 is display-case material. 1:24 is the comfortable daily-play size. 1:64 is the pocket size that ends up under couches. For a first diecast, 1:24 is almost always the right call.

## Weight is a real signal

Pick the box up. A good diecast has real heft — that's the metal you're paying for. If it feels light as air, you're holding mostly plastic painted silver.

> Our rule of thumb: if you can't feel the weight through the box, skip it.

## Paint and panel fit

Open the box and look at the panel gaps under the hood. On a decent model, they're even. On a cheap one, the hood sits lopsided. Same for paint — a good finish has no runs around wheel arches or door seams.

## When it's okay to spend less

For a child who is still chewing on things, skip the collector pieces entirely. Get something chunky, wooden, and obvious. The diecast conversation starts properly around age five.`;

/* ---------- derive ---------- */
function flattenCats(nodes, acc = []) {
  for (const n of nodes || []) {
    acc.push(n);
    if (n.children) flattenCats(n.children, acc);
  }
  return acc;
}
const FLAT_CATS = flattenCats(CATEGORIES);
const CAT_BY_ID = Object.fromEntries(FLAT_CATS.map(c => [c.id, c]));
const CAT_BY_SLUG = Object.fromEntries(FLAT_CATS.map(c => [c.slug, c]));

/* Build full products list with ids/ratings */
const PRODUCTS = PRODUCT_SEEDS.map((p, i) => ({
  id: 'p-' + (i + 1),
  slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  rating: 4 + ((i * 7) % 10) / 10,
  reviews: 12 + ((i * 13) % 140),
  stock: (i % 7 === 0) ? 3 : 20 + (i % 30),
  ...p,
}));

window.SK = {
  CATEGORIES, FLAT_CATS, CAT_BY_ID, CAT_BY_SLUG,
  PRODUCTS, BRANDS, REVIEW_SNIPPETS, BLOG_POSTS, ARTICLE_BODY,
  CATEGORY_ICONS,
};
