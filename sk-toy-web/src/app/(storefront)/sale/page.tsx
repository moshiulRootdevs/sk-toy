'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useEffect, useState } from 'react';
import api from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import Spinner from '@/components/ui/Spinner';
import SelectUI from '@/components/ui/Select';

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'newest',     label: 'Newest first' },
  { value: 'price-low',  label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
];

const ITEMS_PER_PAGE = 24;

export default function SalePage() {
  const [sort, setSort] = useState('featured');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['sale-products', sort],
    queryFn: ({ pageParam = 1 }) => {
      const params: Record<string, string | number> = {
        badge: 'sale',
        limit: ITEMS_PER_PAGE,
        page: pageParam,
      };
      if (sort && sort !== 'featured') params.sort = sort;
      return api.get('/products', { params }).then((r) => r.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * ITEMS_PER_PAGE;
      if (totalFetched >= (lastPage.total ?? 0)) return undefined;
      return allPages.length + 1;
    },
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products: Product[] = data?.pages.flatMap((p) => p.products ?? []) ?? [];
  const total: number = data?.pages[0]?.total || 0;

  return (
    <div style={{ minHeight: '60vh' }}>
      {/* Sale banner */}
      <section className="relative overflow-hidden py-10 sm:py-14">
        <div className="absolute inset-0 -z-10"
             style={{ background: 'linear-gradient(135deg, #FF5B6E 0%, #FF6FB1 40%, #FF9A4D 100%)' }} />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[200px] h-[200px] rounded-full bg-white opacity-10 blur-2xl -top-10 left-[10%]" />
          <div className="absolute w-[160px] h-[160px] rounded-full bg-[#FFCB47] opacity-20 blur-2xl bottom-0 right-[15%]" />
        </div>
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-white/30">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Limited time offers
          </div>
          <h1 className="font-display text-[clamp(32px,6vw,56px)] font-bold text-white leading-tight tracking-tight mb-3">
            Sale &amp; <span className="text-[#FFEDB6]">Deals</span>
          </h1>
          <p className="text-white/85 text-sm sm:text-base max-w-[500px] mx-auto font-medium">
            Up to 40% off on selected toys — grab them before they&apos;re gone!
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between py-5 border-b border-[#FFE0EC]">
          <span className="text-sm text-[#7A8299] font-semibold">
            {!isLoading && <>{total} products on sale</>}
          </span>
          <SelectUI
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORT_OPTIONS}
            pill
          />
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏷️</div>
            <p className="text-lg font-bold text-[#1F2F4A]">No sale items right now</p>
            <p className="text-sm text-[#7A8299] mt-2">Check back soon — new deals drop every week!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isFetchingNextPage && <Spinner size="md" />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
