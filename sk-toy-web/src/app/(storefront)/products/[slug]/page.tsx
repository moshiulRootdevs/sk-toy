import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import JsonLd from '@/components/JsonLd';
import { buildProductJsonLd, buildBreadcrumbJsonLd, SITE_URL, SITE_NAME } from '@/lib/seo';
import { imgUrl } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API}/products/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Product Not Found — SK Toy' };
  }

  const title = product.metaTitle || `${product.name} — Buy Online in Bangladesh | ${SITE_NAME}`;
  const description = product.metaDescription || product.description?.slice(0, 160) || `Buy ${product.name} online at the best price in Bangladesh. Safe toys, fast delivery across Dhaka & nationwide. Shop now at SK Toy!`;
  const image = product.images?.[0] ? imgUrl(product.images[0]) : `${SITE_URL}/og-default.jpg`;
  const url = `${SITE_URL}/products/${slug}`;

  return {
    title,
    description,
    keywords: `${product.name}, buy toys online Bangladesh, toy shop Dhaka, ${product.category?.name || 'toys'}, SK Toy`,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 800, height: 800, alt: product.name }],
      type: 'website',
      locale: 'en_BD',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Products', url: `${SITE_URL}/products` },
  ];
  if (product?.category && typeof product.category === 'object') {
    breadcrumbItems.push({ name: product.category.name, url: `${SITE_URL}/categories/${product.category.slug}` });
  }
  if (product) {
    breadcrumbItems.push({ name: product.name, url: `${SITE_URL}/products/${slug}` });
  }

  return (
    <>
      {product && (
        <>
          <JsonLd data={buildProductJsonLd(product)} />
          <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
        </>
      )}
      <ProductDetailClient />
    </>
  );
}
