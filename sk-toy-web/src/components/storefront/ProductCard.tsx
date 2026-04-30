'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import { fmtTk, imgUrl, cls, isAnimatedImage } from '@/lib/utils';
import { useWishlistStore, useCartStore } from '@/lib/store';

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Optional pastel tint for the image area background */
  tint?: 'pink' | 'mint' | 'sky' | 'peach' | 'butter' | 'lilac';
}

const TINT_BG: Record<NonNullable<ProductCardProps['tint']>, string> = {
  pink:   '#FFE0EC',
  mint:   '#D7F5E2',
  sky:    '#D4EEF7',
  peach:  '#FFE0CB',
  butter: '#FFEDB6',
  lilac:  '#E5D9F8',
};

// Stable pseudo-random tint per product so the grid feels colourful but consistent
const TINT_KEYS: Array<keyof typeof TINT_BG> = ['pink', 'peach', 'butter', 'mint', 'sky', 'lilac'];
function tintFor(id: string): keyof typeof TINT_BG {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return TINT_KEYS[Math.abs(hash) % TINT_KEYS.length];
}

export default function ProductCard({ product, className, tint }: ProductCardProps) {
  const { has, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  const wishlisted = has(product._id);
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tintKey = tint || tintFor(product._id);
  const tintBg = TINT_BG[tintKey];

  function handleAddToCart() {
    if (product.stock === 0) return;
    addItem({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0] ?? '', qty: 1, slug: product.slug, sku: product.sku });
    toast.success(`Added "${product.name}" to cart`);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={cls('group relative cursor-pointer transition-all duration-200 hover:-translate-y-1 bg-white rounded-[22px] border border-[#FFE0EC] p-3 hover:shadow-[0_18px_38px_-18px_rgba(255,111,177,.45)]', className)}>
      {/* Image container */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square rounded-[16px] overflow-hidden" style={{ background: tintBg }}>
          <Image
            src={imgUrl(product.images?.[0] ?? '')}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized={isAnimatedImage(product.images?.[0] ?? '')}
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {discount > 0 && (
              <span className="text-[10px] font-extrabold px-2 py-1 rounded-full tracking-wide uppercase text-white shadow-soft-pink"
                    style={{ background: 'linear-gradient(135deg,#FF6FB1,#FF5B6E)' }}>
                –{discount}% OFF
              </span>
            )}
            {product.badge === 'new' && !discount && (
              <span className="text-[10px] font-extrabold px-2 py-1 rounded-full tracking-wide uppercase text-white"
                    style={{ background: 'linear-gradient(135deg,#4FC081,#3FA46A)' }}>
                NEW
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[10px] font-extrabold px-2 py-1 rounded-full tracking-wide uppercase text-[#1F2F4A]"
                    style={{ background: '#FFCB47' }}>
                LOW STOCK
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-[10px] font-extrabold px-2 py-1 rounded-full tracking-wide uppercase bg-[#1F2F4A] text-white">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product._id); }}
            className={cls(
              'absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 active:scale-90',
              wishlisted
                ? 'bg-[#FF5B6E] text-white shadow-soft-coral scale-100'
                : 'bg-white/90 backdrop-blur text-[#FF6FB1] hover:bg-[#FF6FB1] hover:text-white hover:scale-110'
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"
                 fill={wishlisted ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Age tag (if present) */}
          {product.ageGroup && (
            <span className="absolute bottom-2.5 left-2.5 bg-white/85 backdrop-blur text-[10px] font-bold text-[#1F2F4A] px-2 py-1 rounded-full">
              {product.ageGroup}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="pt-3 px-1 pb-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[14px] font-semibold text-[#1F2F4A] leading-snug line-clamp-2 hover:text-[#FF6FB1] transition-colors mb-1.5 min-h-[2.6em]"
              title={product.name}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[#FFCB47] text-xs tracking-tight">{'★'.repeat(Math.round(product.rating ?? 0))}{'☆'.repeat(5 - Math.round(product.rating ?? 0))}</span>
          <span className="text-[10px] text-[#7A8299] font-semibold">({product.reviewCount ?? 0})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[16px] font-extrabold text-[#FF5B6E]">{fmtTk(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[12px] text-[#A89E92] line-through">{fmtTk(product.comparePrice)}</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={cls(
            'w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-200 active:scale-95',
            product.stock === 0
              ? 'bg-[#F0E5DC] text-[#A89E92] cursor-not-allowed'
              : added
                ? 'bg-[#4FC081] text-white cursor-pointer'
                : 'text-white cursor-pointer hover:shadow-[0_8px_18px_-8px_rgba(255,91,110,.6)] hover:-translate-y-0.5'
          )}
          style={
            product.stock === 0 || added
              ? undefined
              : { background: 'linear-gradient(135deg, #FF5B6E 0%, #FF6FB1 100%)' }
          }
        >
          {product.stock === 0 ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Sold Out
            </>
          ) : added ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Buy Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}
