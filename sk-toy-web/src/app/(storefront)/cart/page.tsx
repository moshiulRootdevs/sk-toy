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
        <svg className="w-20 h-20 mx-auto text-gray-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({count} items)</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.productId + (item.variant || '')} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4">
              <Link href={`/products/${item.productId}`} className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 relative">
                  <Image src={imgUrl(item.image)} alt={item.name} fill className="object-cover" />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base hover:text-[#EC5D4A] transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>}
                {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1, item.variant)}
                      className="px-3 py-1.5 text-gray-500 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium min-w-[2rem] text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1, item.variant)}
                      className="px-3 py-1.5 text-gray-500 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">{fmtTk(item.price * item.qty)}</span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId, item.variant)}
                className="shrink-0 p-2 text-gray-300 hover:text-red-400 self-start"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 hover:underline">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({count} items)</span>
                <span className="font-medium">{fmtTk(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-500">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{fmtTk(subtotal)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-5">
              <Button fullWidth size="lg">Proceed to Checkout</Button>
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
