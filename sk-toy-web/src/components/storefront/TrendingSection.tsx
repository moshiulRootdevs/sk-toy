'use client';

import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
}

export default function TrendingSection({ products }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-[#FBF4E8]">
      <div className="max-w-[1360px] mx-auto px-8">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="eyebrow mb-2">What's hot right now</p>
            <h2 className="text-[32px] sm:text-[40px] font-semibold leading-tight tracking-tight text-[#1F2F4A]"
                style={{ fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>
              Trending Products
            </h2>
            <p className="text-sm text-[#7A8299] mt-2 max-w-[480px]">
              Most viewed, wishlisted, and ordered toys this season — picked for you by what other parents love.
            </p>
          </div>
          <Link href="/products"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#EC5D4A] hover:underline whitespace-nowrap">
            View all <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
