import { Metadata } from 'next';
import HomeSections from '@/components/storefront/HomeSections';
import TrendingSection from '@/components/storefront/TrendingSection';
import JsonLd from '@/components/JsonLd';
import { buildOrganizationJsonLd, buildLocalBusinessJsonLd, SITE_URL } from '@/lib/seo';
import api from '@/lib/api';
import { HomeSection, Product } from '@/types';

export const metadata: Metadata = {
  title: "SK Toy — Buy Toys Online in Bangladesh | Best Toy Shop Dhaka",
  description: "Bangladesh's favourite online toy store. Shop 1,200+ safe, educational & fun toys for babies, toddlers & kids. Fast delivery across Dhaka & nationwide. 7-day easy returns.",
  alternates: { canonical: SITE_URL },
};

async function getSections(): Promise<HomeSection[]> {
  try {
    const res = await api.get('/homepage');
    return res.data;
  } catch {
    return [];
  }
}

async function getTrending(): Promise<Product[]> {
  try {
    const res = await api.get('/products/trending', { params: { limit: 8 } });
    return res.data;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [sections, trending] = await Promise.all([getSections(), getTrending()]);

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildLocalBusinessJsonLd()} />
      <HomeSections sections={sections} />
      <TrendingSection products={trending} />
    </>
  );
}
