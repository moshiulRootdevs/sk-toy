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
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { has, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  const wishlisted = has(product._id);
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAddToCart() {
    if (product.stock === 0) return;
    addItem({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0] ?? '', qty: 1, slug: product.slug, sku: product.sku });
    toast.success(`Added "${product.name}" to cart`);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className={cls('group relative cursor-pointer transition-transform hover:-translate-y-0.5 duration-150', className)}>
      {/* Image container */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[#F5E9D2] rounded-[18px] overflow-hidden border border-[#E6D9BD]">
          <Image
            src={imgUrl(product.images?.[0] ?? '')}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            unoptimized={isAnimatedImage(product.images?.[0] ?? '')}
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase bg-[#F5C443] text-[#1F2F4A]"
                    style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>LOW STOCK</span>
            )}
            {product.stock === 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase bg-[#1F2F4A] text-[#FFFBF2]"
                    style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>OOS</span>
            )}
            {discount > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase bg-[#EC5D4A] text-white"
                    style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>–{discount}%</span>
            )}
            {product.badge === 'new' && !discount && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase bg-[#4FA36A] text-white"
                    style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>NEW</span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product._id); }}
            className={cls(
              'absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all z-10',
              wishlisted
                ? 'bg-[#EC5D4A] text-white'
                : 'bg-[#FFFBF2]/85 text-[#7A8299] hover:bg-[#FFFBF2]'
            )}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                 fill={wishlisted ? 'currentColor' : 'none'}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* Body */}
      <div className="pt-3 px-0.5 pb-1">
        <p className="text-[10px] text-[#7A8299] uppercase tracking-[0.08em] mb-1"
           style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>
          {(product as any).brand?.name || ''}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[14px] font-medium text-[#1F2F4A] leading-snug truncate hover:text-[#EC5D4A] transition-colors mb-2"
              style={{ fontFamily: 'var(--font-inter, system-ui)' }}
              title={product.name}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[#F39436] text-xs tracking-wide">{'★'.repeat(Math.round(product.rating ?? 0))}{'☆'.repeat(5 - Math.round(product.rating ?? 0))}</span>
          <span className="text-[10px] text-[#7A8299]" style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>({product.reviewCount ?? 0})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[15px] font-semibold text-[#1F2F4A]">{fmtTk(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[13px] text-[#7A8299] line-through">{fmtTk(product.comparePrice)}</span>
          )}
          {discount > 0 && (
            <span className="text-[10px] text-[#EC5D4A] font-semibold" style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>
              –{discount}%
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={cls(
            'w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium tracking-tight transition-all duration-200 active:scale-95',
            product.stock === 0
              ? 'bg-[#F5E9D2] text-[#7A8299] cursor-not-allowed'
              : added
                ? 'bg-[#F5C443] text-[#1F2F4A] cursor-pointer'
                : 'bg-[#1F2F4A] text-[#FFFBF2] hover:bg-[#EC5D4A] cursor-pointer'
          )}
        >
          {product.stock === 0 ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Out of Stock
            </>
          ) : added ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added to cart
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
