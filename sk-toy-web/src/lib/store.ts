import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

// Fire-and-forget tracker — never blocks UI, never throws
function track(path: string, body?: any) {
  api.post(path, body || {}).catch(() => {});
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  slug?: string;
  variant?: string;
  sku?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQty: (productId: string, qty: number, variant?: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        track(`/products/${item.productId}/cart-add`, { qty: item.qty });
        set((s) => {
          const key = item.productId + (item.variant || '');
          const existing = s.items.find(i => i.productId + (i.variant || '') === key);
          if (existing) {
            return { items: s.items.map(i => i.productId + (i.variant || '') === key ? { ...i, qty: i.qty + item.qty } : i) };
          }
          return { items: [...s.items, item] };
        });
      },
      removeItem: (productId, variant) => set((s) => ({
        items: s.items.filter(i => !(i.productId === productId && (i.variant || '') === (variant || ''))),
      })),
      updateQty: (productId, qty, variant) => {
        if (qty < 1) return get().removeItem(productId, variant);
        set((s) => ({
          items: s.items.map(i => i.productId === productId && (i.variant || '') === (variant || '') ? { ...i, qty } : i),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: 'sk-cart', skipHydration: true }
  )
);

interface WishlistStore {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((s) => {
        const turningOn = !s.ids.includes(id);
        if (turningOn) track(`/products/${id}/wishlist-add`);
        return { ids: turningOn ? [...s.ids, id] : s.ids.filter(x => x !== id) };
      }),
      has: (id) => get().ids.includes(id),
    }),
    { name: 'sk-wishlist', skipHydration: true }
  )
);

interface AuthStore {
  adminUser: { id: string; name: string; email: string; role: string } | null;
  customer: { id: string; name: string; email: string; tier?: string } | null;
  setAdmin: (user: AuthStore['adminUser'], token: string) => void;
  setCustomer: (customer: AuthStore['customer'], token: string) => void;
  logoutAdmin: () => void;
  logoutCustomer: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  adminUser: null,
  customer: null,
  setAdmin: (user, token) => {
    if (typeof window !== 'undefined') localStorage.setItem('sk_admin_token', token);
    set({ adminUser: user });
  },
  setCustomer: (customer, token) => {
    if (typeof window !== 'undefined') localStorage.setItem('sk_customer_token', token);
    set({ customer });
  },
  logoutAdmin: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('sk_admin_token');
    set({ adminUser: null });
  },
  logoutCustomer: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('sk_customer_token');
    set({ customer: null });
  },
}));

interface UIStore {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setMobileMenuOpen: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
}));
