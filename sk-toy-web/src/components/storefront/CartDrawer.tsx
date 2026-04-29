'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, useUIStore } from '@/lib/store';
import { fmtTk, imgUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import Tooltip from '@/components/ui/Tooltip';

export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQty } = useCartStore();
  // Slug lookup map for items that were stored before slug was tracked
  const [slugMap, setSlugMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const missing = items.filter((i) => !i.slug).map((i) => i.productId);
    if (!missing.length) return;
    api.get('/products', { params: { ids: missing.join(',') } }).then((r) => {
      const map: Record<string, string> = {};
      (r.data.products ?? []).forEach((p: any) => { if (p._id && p.slug) map[p._id] = p.slug; });
      setSlugMap((prev) => ({ ...prev, ...map }));
    }).catch(() => {});
  }, [items]);
  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const subtotal = useCartStore((s) => s.items.reduce((a, i) => a + i.price * i.qty, 0));

  useEffect(() => {
    if (cartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  return (
    <>
      {cartOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setCartOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-lg">Cart ({count})</h2>
          <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="text-sm font-medium">Your cart is empty</p>
              <button onClick={() => setCartOpen(false)} className="text-sm text-[#EC5D4A] hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => {
              const slug = item.slug || slugMap[item.productId];
              const href = slug ? `/products/${slug}` : null;
              return (
              <div key={item.productId + (item.variant || '')} className="flex gap-3">
                {href ? (
                  <Link href={href} onClick={() => setCartOpen(false)} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 block">
                    <Image src={imgUrl(item.image)} alt={item.name} width={64} height={64} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </Link>
                ) : (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={imgUrl(item.image)} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {href ? (
                    <Link href={href} onClick={() => setCartOpen(false)} className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#EC5D4A] transition-colors block">{item.name}</Link>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                  )}
                  {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold">{fmtTk(item.price * item.qty)}</span>
                    <div className="flex items-center gap-1.5">
                      <Tooltip label="Decrease quantity">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1, item.variant)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      >
                        −
                      </button>
                      </Tooltip>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <Tooltip label="Increase quantity">
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1, item.variant)}
                        className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                      >
                        +
                      </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <Tooltip label="Remove item">
                <button
                  onClick={() => removeItem(item.productId, item.variant)}
                  className="shrink-0 p-1 text-gray-300 hover:text-red-400"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
                </Tooltip>
              </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-lg">{fmtTk(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
            <div className="flex flex-col gap-2">
              <Link href="/checkout" onClick={() => setCartOpen(false)}>
                <Button fullWidth size="lg">Proceed to Checkout</Button>
              </Link>
              <Link href="/cart" onClick={() => setCartOpen(false)}>
                <Button fullWidth variant="outline" size="md">View Full Cart</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
