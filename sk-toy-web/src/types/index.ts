export interface Category {
  _id: string;
  name: string;
  slug: string;
  tag?: string;
  icon?: string;
  image?: string;
  hidden: boolean;
  order: number;
  parent?: string | Category | null;
  children?: Category[];
}

export interface ProductVariant {
  _id?: string;
  name: string;
  sku?: string;
  stock: number;
  price?: number;
  image?: string;
  images?: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  category?: Category | string;
  categories?: Array<Category | string>;
  ageGroup?: string;
  gender?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  trackInventory: boolean;
  variants: ProductVariant[];
  badge?: string;
  showcaseSections?: string[];
  active: boolean;
  rating: number;
  reviewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  weight?: number;
  dimensions?: { l: number; w: number; h: number };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string | Product;
  who: string;
  stars: number;
  text?: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  adminReply?: string;
  customer?: string;
  createdAt: string;
}

export interface Address {
  _id?: string;
  label?: string;
  line1: string;
  line2?: string;
  city?: string;
  area?: string;
  district?: string;
  zip?: string;
  isDefault?: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  /** Live count from the Order collection (computed by the admin endpoint) */
  orderCount: number;
  /** Live sum of order totals (computed by the admin endpoint) */
  totalSpend: number;
  /** Most recent order date (computed by the admin endpoint) */
  lastOrder?: string;
  isGuest: boolean;
  active: boolean;
  createdAt: string;
}

export interface OrderLine {
  product: string | Product;
  name: string;
  sku?: string;
  image?: string;
  price: number;
  qty: number;
  variant?: string;
}

export interface Order {
  _id: string;
  orderNo: string;
  customer?: string | Customer;
  customerName: string;
  customerEmail?: string;
  phone: string;
  altPhone?: string;
  address: string;
  area?: string;
  district?: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  giftWrap?: boolean;
  giftWrapCost?: number;
  coupon?: string;
  total: number;
  note?: string;
  status: 'new' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  paymentStatus: 'pending' | 'paid' | 'collected' | 'refunded' | 'failed';
  bkashPaymentId?: string;
  bkashTrxId?: string;
  courier?: string;
  trackingNo?: string;
  staffNote?: string;
  adjustments?: Array<{
    field: 'subtotal' | 'shipping' | 'discount' | 'total';
    oldValue: number;
    newValue: number;
    note: string;
    by?: string;
    byName?: string;
    at: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  maxDiscount?: number;
  minSpend?: number;
  limit?: number;
  uses: number;
  appliesTo?: string;
  startsAt?: string;
  endsAt?: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface BandButton {
  label: string;
  link: string;
  style?: string;
}

export interface HomeSection {
  _id: string;
  type: 'hero' | 'categories' | 'products' | 'editorial_band' | 'journal' | 'newsletter' | 'banner' | 'ages';
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  filter?: string;
  limit?: number;
  productRefs?: string[];
  categoryRefs?: string[];
  ctaLabel?: string;
  ctaLink?: string;
  bannerId?: string | Banner;
  bandStyle?: 'yellow' | 'dark' | 'coral';
  bandText?: string;
  bandImage?: string;
  bandButtons?: BandButton[];
  products?: Product[];
  banner?: Banner;
  posts?: BlogPost[];
}

export interface Banner {
  _id: string;
  slot: 'hero' | 'strip' | 'promo';
  title?: string;
  subtitle?: string;
  cta?: string;
  ctaLink?: string;
  image?: string;
  bgColor?: string;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  order: number;
}

export interface NavChild {
  label: string;
  link: string;
  badge?: string;
  children?: NavChild[];
}

export interface NavigationItem {
  _id: string;
  label: string;
  link: string;
  badge?: string;
  order: number;
  children?: NavChild[];
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  category?: string;
  author?: string;
  readTime?: number;
  coverImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
}

export interface CmsBlock {
  type: 'heading' | 'paragraph' | 'qa' | 'image' | 'divider' | 'list';
  text?: string;
  q?: string;
  a?: string;
  src?: string;
  items?: string[];
}

export interface CmsPage {
  _id: string;
  title: string;
  slug: string;
  blocks: CmsBlock[];
  status: 'draft' | 'published';
}

export interface BenefitItem {
  _id?: string;
  title: string;
  description?: string;
}

export interface Benefit {
  _id: string;
  title: string;
  items: BenefitItem[];
  categories: Array<{ _id: string; name: string; slug: string } | string>;
  applyToAll: boolean;
  status: 'draft' | 'published';
  order: number;
}

export interface ShippingZone {
  _id: string;
  name: string;
  areas: string[];
  flat: number;
  freeOver?: number;
  etaDays?: string;
  default: boolean;
  active: boolean;
}

export interface Settings {
  store: {
    name: string;
    tagline?: string;
    email?: string;
    phone?: string;
    address?: string;
    logoText?: string;
    logo?: string;
    timezone?: string;
  };
  locale: {
    currency: string;
    currencySymbol: string;
    defaultLanguage: string;
  };
  tax: {
    vatEnabled: boolean;
    vatRate: number;
    vatInclusive: boolean;
    vatNumber?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  seo: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  policies: {
    returnDays: number;
    freeShippingOver?: number;
    codChargeBdt: number;
    giftWrapCost: number;
  };
  topStrip: {
    enabled: boolean;
    messages: string[];
  };
  shipping?: {
    insideDhaka?:  { title: string; amount: number; description?: string; freeOver?: number };
    outsideDhaka?: { title: string; amount: number; description?: string; freeOver?: number };
  };
  paymentMethods?: {
    cod?:   { enabled: boolean; label: string; description: string };
    bkash?: { enabled: boolean; label: string; description: string };
  };
  paymentBadges?: Array<{
    label: string;
    bg: string;
    textColor: string;
    enabled: boolean;
  }>;
  productTrustBadges?: Array<{
    icon: string;
    label: string;
    color: string;
    enabled: boolean;
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
