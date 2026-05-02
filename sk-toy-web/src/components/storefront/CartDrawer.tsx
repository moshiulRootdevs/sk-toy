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
        <div
          className="fixed inset-0 bg-[#1F2F4A]/45 z-40"
          style={{ WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)' }}
          onClick={() => setCartOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ WebkitTransform: cartOpen ? 'translateX(0)' : 'translateX(100%)', willChange: 'transform' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#FFE0EC]"
             style={{ background: 'linear-gradient(135deg,#FFE0EC,#FFEDB6)' }}>
          <h2 className="font-display font-extrabold text-lg text-[#1F2F4A] flex items-center gap-2">
            🛍️ Cart <span className="text-[#FF6FB1]">({count})</span>
          </h2>
          <button onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-full bg-white text-[#FF6FB1] hover:bg-[#FFE0EC] flex items-center justify-center transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#7A8299]">
              <div className="inline-flex w-20 h-20 rounded-full bg-[#FFE0EC] items-center justify-center border-4 border-dashed border-[#FF6FB1]">
                <svg className="w-10 h-10 text-[#FF6FB1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#1F2F4A]">Your cart is empty 🧸</p>
              <button onClick={() => setCartOpen(false)} className="text-sm text-[#FF6FB1] hover:underline font-extrabold">
                Continue Shopping →
              </button>
            </div>
          ) : (
            items.map((item) => {
              const slug = item.slug || slugMap[item.productId];
              const href = slug ? `/products/${slug}` : null;
              return (
              <div key={item.productId + (item.variant || '')} className="flex gap-3 bg-white border-2 border-[#FFE0EC] rounded-2xl p-3">
                {href ? (
                  <Link href={href} onClick={() => setCartOpen(false)} className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFE0EC] shrink-0 block">
                    <Image src={imgUrl(item.image)} alt={item.name} width={64} height={64} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </Link>
                ) : (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFE0EC] shrink-0">
                    <Image src={imgUrl(item.image)} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {href ? (
                    <Link href={href} onClick={() => setCartOpen(false)} className="text-sm font-bold text-[#1F2F4A] line-clamp-2 hover:text-[#FF6FB1] transition-colors block">{item.name}</Link>
                  ) : (
                    <p className="text-sm font-bold text-[#1F2F4A] line-clamp-2">{item.name}</p>
                  )}
                  {item.variant && <p className="text-xs text-[#7A8299] font-semibold">{item.variant}</p>}
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#FF5B6E]">{fmtTk(item.price * item.qty)}</span>
                    <div className="flex items-center gap-1 bg-[#FFF5F8] rounded-full border border-[#FFD4E6] px-1">
                      <Tooltip label="Decrease quantity">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1, item.variant)}
                        className="w-6 h-6 flex items-center justify-center text-[#FF6FB1] hover:bg-[#FFE0EC] rounded-full font-bold text-base leading-none"
                      >
                        −
                      </button>
                      </Tooltip>
                      <span className="w-5 text-center text-xs font-extrabold text-[#1F2F4A]">{item.qty}</span>
                      <Tooltip label="Increase quantity">
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1, item.variant)}
                        className="w-6 h-6 flex items-center justify-center text-[#FF6FB1] hover:bg-[#FFE0EC] rounded-full font-bold text-base leading-none"
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
                  className="shrink-0 w-7 h-7 rounded-full text-[#B591A8] hover:text-white hover:bg-[#FF5B6E] transition-colors flex items-center justify-center self-start"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
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
          <div className="px-5 py-4 border-t-2 border-[#FFE0EC] space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[#7A8299] font-semibold text-sm">Subtotal</span>
              <span className="font-extrabold text-xl text-[#FF5B6E]">{fmtTk(subtotal)}</span>
            </div>
            <p className="text-xs text-[#A89E92] font-medium">Shipping calculated at checkout</p>
            <div className="flex flex-col gap-2">
              <Link href="/checkout" onClick={() => setCartOpen(false)}>
                <Button fullWidth size="lg">Checkout 🎁</Button>
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
