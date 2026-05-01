'use client';

import { useEffect } from 'react';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';

export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);
  return null;
}
