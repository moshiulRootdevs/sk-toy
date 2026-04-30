'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { fmtTk, imgUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart } = useCartStore();
  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const subtotal = useCartStore((s) => s.items.reduce((a, i) => a + i.price * i.qty, 0));

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-24 h-24 rounded-full bg-[#FFE0EC] items-center justify-center mb-5 border-4 border-dashed border-[#FF6FB1]">
          <svg className="w-12 h-12 text-[#FF6FB1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1F2F4A] mb-2">Your cart is empty 🧸</h1>
        <p className="text-[#7A8299] mb-6 font-medium">Looks like you haven't added any joy yet!</p>
        <Link href="/products">
          <Button size="lg">Start Shopping ✨</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <p className="eyebrow mb-2">🛍️ Almost there</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1F2F4A]">Your Cart <span className="text-[#FF6FB1]">({count})</span></h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div key={item.productId + (item.variant || '')} className="flex gap-4 bg-white border-2 border-[#FFE0EC] rounded-[22px] p-4 transition-all hover:border-[#FFD4E6] hover:shadow-soft">
              <Link href={`/products/${item.productId}`} className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FFE0EC] relative">
                  <Image src={imgUrl(item.image)} alt={item.name} fill className="object-cover" />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-bold text-[#1F2F4A] text-sm sm:text-base hover:text-[#FF6FB1] transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                {item.variant && <p className="text-xs text-[#7A8299] mt-0.5 font-semibold">{item.variant}</p>}
                {item.sku && <p className="text-xs text-[#A89E92] font-medium">SKU: {item.sku}</p>}
                <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-1 bg-[#FFF5F8] border-2 border-[#FFD4E6] rounded-full overflow-hidden">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1, item.variant)}
                      className="px-3 py-1.5 text-[#FF6FB1] hover:bg-[#FFE0EC] transition-colors text-lg leading-none font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-extrabold min-w-[2rem] text-center text-[#1F2F4A]">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1, item.variant)}
                      className="px-3 py-1.5 text-[#FF6FB1] hover:bg-[#FFE0EC] transition-colors text-lg leading-none font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-extrabold text-[#FF5B6E] text-lg">{fmtTk(item.price * item.qty)}</span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId, item.variant)}
                className="shrink-0 w-9 h-9 rounded-full text-[#B591A8] hover:text-white hover:bg-[#FF5B6E] transition-colors self-start flex items-center justify-center"
                aria-label="Remove"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-[#FF5B6E] hover:underline font-bold ml-2">
            🗑 Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-6 sticky top-32 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" />
              <h2 className="font-display font-bold text-[#1F2F4A] text-lg">Order Summary</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#7A8299] font-medium">Subtotal ({count} items)</span>
                <span className="font-bold text-[#1F2F4A]">{fmtTk(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A8299] font-medium">Shipping</span>
                <span className="text-[#7A8299] font-medium">at checkout</span>
              </div>
              <div className="border-t-2 border-dashed border-[#FFD4E6] pt-3 flex justify-between font-extrabold text-base">
                <span className="text-[#1F2F4A]">Total</span>
                <span className="text-[#FF5B6E]">{fmtTk(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-5">
              <Button fullWidth size="lg">Proceed to Checkout 🎁</Button>
            </Link>
            <Link href="/products" className="block mt-2">
              <Button fullWidth size="md" variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
