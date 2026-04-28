'use client';

import { useEffect } from 'react';
import { useCartStore, useWishlistStore } from '@/lib/store';

export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);
  return null;
}
