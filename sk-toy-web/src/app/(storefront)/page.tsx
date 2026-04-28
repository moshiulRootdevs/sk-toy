import { Metadata } from 'next';
import HomeSections from '@/components/storefront/HomeSections';
import TrendingSection from '@/components/storefront/TrendingSection';
import api from '@/lib/api';
import { HomeSection, Product } from '@/types';

export const metadata: Metadata = {
  title: 'SK Toy — Bangladesh\'s Favourite Toy Store',
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
      <HomeSections sections={sections} />
      <TrendingSection products={trending} />
    </>
  );
}
