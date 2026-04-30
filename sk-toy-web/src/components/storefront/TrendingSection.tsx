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
    <section className="py-14 sm:py-16 relative overflow-hidden">
      {/* Soft accent background */}
      <div className="absolute inset-0 -z-10 bg-[#FFF5F8]" />
      <div className="absolute -top-12 -left-10 w-[260px] h-[260px] rounded-full bg-[#FFCB47] opacity-15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-[220px] h-[220px] rounded-full bg-[#6BC8E6] opacity-15 blur-3xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="eyebrow mb-2">🔥 What's hot right now</p>
            <h2 className="font-display text-[32px] sm:text-[44px] font-bold leading-tight tracking-tight text-[#1F2F4A]">
              Best Selling Products
            </h2>
            <p className="text-sm text-[#7A8299] mt-2 max-w-[480px] font-medium">
              Most loved by parents this season — picked for happy little hands.
            </p>
          </div>
          <Link href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-[#FF5B6E] to-[#FF6FB1] px-5 py-2.5 rounded-full whitespace-nowrap shadow-soft-pink hover:-translate-y-0.5 transition-all">
            View all <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {products.slice(0, 8).map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
