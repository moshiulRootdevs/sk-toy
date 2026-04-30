'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useWishlistStore } from '@/lib/store';
import api from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function WishlistPage() {
  const { ids } = useWishlistStore();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['wishlist-products', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const results = await Promise.all(ids.map((id) => api.get(`/products/${id}`).then((r) => r.data).catch(() => null)));
      return results.filter(Boolean);
    },
    enabled: ids.length > 0,
  });

  if (ids.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-24 h-24 rounded-full bg-[#FFE0EC] items-center justify-center mb-5 border-4 border-dashed border-[#FF6FB1]">
          <svg className="w-12 h-12 text-[#FF6FB1]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1F2F4A] mb-2">Your Wishlist is Empty 💔</h1>
        <p className="text-[#7A8299] mb-6 font-medium">Save products you love to buy them later.</p>
        <Link href="/products">
          <Button size="lg">Browse Products ✨</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <p className="eyebrow mb-1">💖 Saved for later</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1F2F4A]">My Wishlist <span className="text-[#FF6FB1]">({ids.length})</span></h1>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {(products || []).map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
