export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sktoy.com';
export const SITE_NAME = 'SK Toy';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export function buildProductJsonLd(product: {
  name: string;
  slug?: string;
  description?: string;
  images?: string[];
  sku?: string;
  price: number;
  comparePrice?: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  category?: { name?: string } | string | null;
}) {
  const image = product.images?.[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : `${SITE_URL}${product.images[0]}`)
    : DEFAULT_OG_IMAGE;

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.slice(0, 500) || `Buy ${product.name} online in Bangladesh at SK Toy.`,
    image,
    sku: product.sku || product.slug || '',
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'BDT',
      availability: (product.stock ?? 1) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.slug || ''}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };

  if (product.comparePrice && product.comparePrice > product.price) {
    jsonLd.offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }

  if (product.rating && product.reviewCount) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
    };
  }

  if (product.category && typeof product.category === 'object' && product.category.name) {
    jsonLd.category = product.category.name;
  }

  return jsonLd;
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Bangladesh's favourite online toy store. Safe, educational & fun toys for all ages.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressRegion: 'Dhaka Division',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Bengali'],
    },
    sameAs: [],
  };
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ToyStore',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: DEFAULT_OG_IMAGE,
    description: "Bangladesh's friendliest toy house. 1,200+ safe toys, 64 trusted brands, fast delivery across Dhaka and nationwide.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dhaka',
      addressRegion: 'Dhaka Division',
      postalCode: '1200',
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.8103,
      longitude: 90.4125,
    },
    priceRange: '৳৳',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash, bKash, Nagad',
    areaServed: {
      '@type': 'Country',
      name: 'Bangladesh',
    },
  };
}
