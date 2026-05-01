'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Product, Review, Benefit, Settings } from '@/types';
import { fmtTk, imgUrl, cls, isAnimatedImage } from '@/lib/utils';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import Stars from '@/components/ui/Stars';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ProductCard from '@/components/storefront/ProductCard';
import Tooltip from '@/components/ui/Tooltip';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

  const { addItem } = useCartStore();
  const { has, toggle } = useWishlistStore();
  const { customer } = useAuthStore();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/slug/${slug}`).then((r) => r.data),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', product?._id],
    queryFn: () => api.get(`/products/${product?._id}/reviews`).then((r) => r.data),
    enabled: !!product?._id,
  });

  const { data: canReviewData } = useQuery({
    queryKey: ['can-review', product?._id],
    queryFn: () => api.get(`/reviews/can-review/${product!._id}`).then((r) => r.data),
    enabled: !!product?._id && !!customer,
    retry: false,
  });
  const canReview = !!canReviewData?.canReview;

  const { data: benefits } = useQuery<Benefit[]>({
    queryKey: ['product-benefits', product?._id],
    queryFn: () => api.get(`/benefits/for-product/${product?._id}`).then((r) => r.data),
    enabled: !!product?._id,
  });

  const { data: related } = useQuery<Product[]>({
    queryKey: ['related-products', product?._id],
    queryFn: () => api.get(`/products/${product!._id}/related`, { params: { limit: 8 } }).then((r) => r.data),
    enabled: !!product?._id,
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const DEFAULT_TRUST_BADGES = [
    { icon: '🚚',  label: 'Fast delivery',  color: '#FF9A4D', enabled: true },
    { icon: '🔄',  label: '7-day returns',  color: '#4FC081', enabled: true },
    { icon: '🛡️',  label: 'Safe & tested',  color: '#6BC8E6', enabled: true },
  ];
  const trustBadges = (settings?.productTrustBadges?.length ? settings.productTrustBadges : DEFAULT_TRUST_BADGES)
    .filter((b) => b.enabled && b.label?.trim());

  useEffect(() => {
    if (!product?._id) return;
    api.post(`/products/${product._id}/view`).catch(() => {});
  }, [product?._id]);

  if (isLoading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
  );

  if (!product) return (
    <div className="text-center py-32 text-[#7A8299] font-semibold">Product not found.</div>
  );

  const activeVariant = selectedVariant
    ? product.variants.find((v) => v.name === selectedVariant)
    : null;
  const price = activeVariant?.price ?? product.price;
  const inStock = activeVariant ? activeVariant.stock > 0 : product.stock > 0;
  const wishlisted = has(product._id);
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  function addToCart() {
    addItem({
      productId: product!._id,
      name: product!.name,
      price,
      image: product!.images[0] || '',
      qty,
      slug: product!.slug,
      variant: selectedVariant,
      sku: activeVariant?.sku || product!.sku,
    });
    toast.success('Added to cart!');
  }

  async function submitReview() {
    if (!reviewText.trim()) {
      toast.error('Please write your review');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { product: product!._id, stars: reviewStars, text: reviewText });
      toast.success('Review submitted! It will appear after approval.');
      setReviewText('');
      setReviewStars(5);
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb pill */}
      <div className="flex items-center gap-2 text-xs font-bold text-[#7A8299] mb-5">
        <Link href="/" className="hover:text-[#FF6FB1]">Home</Link>
        <span>›</span>
        <Link href="/products" className="hover:text-[#FF6FB1]">Products</Link>
        <span>›</span>
        <span className="text-[#1F2F4A] line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-[28px] overflow-hidden bg-gradient-to-br from-[#FFE0EC] to-[#FFEDB6] border-4 border-white shadow-soft">
            {isVideo(product.images[selectedImage] || product.images[0]) ? (
              <video
                key={product.images[selectedImage]}
                src={imgUrl(product.images[selectedImage] || product.images[0])}
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            ) : (
              <Image
                src={imgUrl(product.images[selectedImage] || product.images[0])}
                alt={product.name}
                fill
                className="object-cover"
                priority
                unoptimized={isAnimatedImage(product.images[selectedImage] || product.images[0])}
              />
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 text-white text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-soft-pink"
                    style={{ background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)' }}>
                –{discount}% OFF
              </span>
            )}
            {product.badge && (
              <span className="absolute top-4 right-4 text-[#1F2F4A] text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wide bg-[#FFCB47]">
                {product.badge}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cls(
                    'relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-3 transition-all',
                    selectedImage === i ? 'border-[#FF6FB1] scale-105' : 'border-white hover:border-[#FFD4E6]'
                  )}
                  style={{ borderWidth: 3 }}
                >
                  {isVideo(img) ? (
                    <>
                      <video src={imgUrl(img)} preload="metadata" muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg width="14" height="16" viewBox="0 0 10 12" fill="white"><path d="M0 0l10 6-10 6z" /></svg>
                      </div>
                    </>
                  ) : (
                    <Image src={imgUrl(img)} alt={`View ${i + 1}`} fill className="object-cover" unoptimized={isAnimatedImage(img)} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && typeof product.category === 'object' && (
            <p className="eyebrow mb-2">✨ {(product.category as any).name}</p>
          )}

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1F2F4A] leading-tight">{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Stars value={product.rating} size="md" />
              <span className="text-sm text-[#7A8299] font-semibold">{product.reviewCount} reviews</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mt-5 bg-[#FFF5F8] border-2 border-[#FFE0EC] rounded-2xl px-5 py-4">
            <span className="font-display text-3xl sm:text-4xl font-bold text-[#FF5B6E]">{fmtTk(price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-base text-[#A89E92] line-through font-semibold">{fmtTk(product.comparePrice)}</span>
            )}
            {discount > 0 && (
              <span className="ml-auto text-xs font-extrabold text-white bg-[#FF6FB1] px-2.5 py-1 rounded-full uppercase">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-[#1F2F4A] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> Choose a variant
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(v.name === selectedVariant ? undefined : v.name)}
                    disabled={v.stock === 0}
                    className={cls(
                      'px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-colors',
                      selectedVariant === v.name
                        ? 'border-[#FF6FB1] bg-[#FFE0EC] text-[#FF5B6E]'
                        : 'border-[#FFE0EC] bg-white text-[#1F2F4A] hover:border-[#FFD4E6]',
                      v.stock === 0 && 'opacity-40 line-through pointer-events-none'
                    )}
                  >
                    {v.name}
                    {v.price && v.price !== product.price && ` (+${fmtTk(v.price - product.price)})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Cart */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <div className="flex items-center bg-[#FFF5F8] border-2 border-[#FFD4E6] rounded-full overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-2.5 text-[#FF6FB1] hover:bg-[#FFE0EC] text-lg font-bold leading-none"
              >
                −
              </button>
              <span className="px-4 py-2.5 text-sm font-extrabold min-w-[40px] text-center text-[#1F2F4A]">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-4 py-2.5 text-[#FF6FB1] hover:bg-[#FFE0EC] text-lg font-bold leading-none"
              >
                +
              </button>
            </div>
            <Button
              onClick={addToCart}
              disabled={!inStock}
              className="flex-1 min-w-[140px]"
              size="lg"
              variant="outline"
            >
              {inStock ? 'Add to Cart' : 'Sold Out'}
            </Button>
            <Button
              onClick={() => { addToCart(); router.push('/checkout'); }}
              disabled={!inStock}
              className="flex-1 min-w-[140px]"
              size="lg"
            >
              Buy Now 🎁
            </Button>
            <Tooltip label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'} position="top">
              <button
                onClick={() => toggle(product._id)}
                className={cls(
                  'p-3.5 rounded-full border-2 transition-colors',
                  wishlisted ? 'border-[#FF6FB1] text-white bg-[#FF6FB1]' : 'border-[#FFE0EC] bg-white text-[#FF6FB1] hover:bg-[#FFE0EC]'
                )}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg className={cls('w-5 h-5', wishlisted && 'fill-current')} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill={wishlisted ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </Tooltip>
          </div>

          {!inStock && (
            <p className="mt-2 text-sm text-[#FF5B6E] font-bold">⚠ This item is currently out of stock.</p>
          )}

          {/* Trust strip */}
          {trustBadges.length > 0 && (
            <div className="mt-6 grid gap-3"
                 style={{ gridTemplateColumns: `repeat(${Math.min(trustBadges.length, 4)}, minmax(0, 1fr))` }}>
              {trustBadges.map((t, i) => (
                <div key={`${t.label}-${i}`} className="bg-white border-2 border-[#FFE0EC] rounded-2xl p-3 text-center">
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: t.color }}>{t.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-6 border-t-2 border-dashed border-[#FFD4E6] pt-5">
              <h3 className="font-display text-base font-bold text-[#1F2F4A] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> Description
              </h3>
              <div
                className="prose-description text-sm text-[#5A5048] leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Meta info */}
          <div className="mt-5 space-y-1.5 text-sm text-[#7A8299] font-semibold">
            {product.sku && <p>SKU: <span className="text-[#1F2F4A]">{product.sku}</span></p>}
            {product.ageGroup && <p>Age Group: <span className="text-[#1F2F4A]">{product.ageGroup}</span></p>}
            {product.gender && product.gender !== 'All' && <p>Gender: <span className="text-[#1F2F4A]">{product.gender}</span></p>}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <p className="eyebrow mb-2">💬 What parents say</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F2F4A] mb-6">Customer Reviews</h2>
        <div className={`grid grid-cols-1 gap-8 ${reviewsData?.reviews?.length ? 'lg:grid-cols-2' : ''}`}>
          {/* Write review */}
          <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 shadow-soft">
            <h3 className="font-display font-bold text-[#1F2F4A] mb-4 text-lg">Write a Review</h3>
            {!customer ? (
              <div className="text-center py-6">
                <div className="inline-flex w-14 h-14 rounded-full bg-[#FFE0EC] items-center justify-center mb-3 border-2 border-dashed border-[#FF6FB1]">
                  <span className="text-2xl">🔒</span>
                </div>
                <p className="text-sm text-[#1F2F4A] mb-1 font-bold">Sign in to leave a review</p>
                <p className="text-xs text-[#7A8299] mb-4 font-medium">Only customers who have purchased this product can write a review.</p>
                <a href="/login" className="inline-block text-sm font-extrabold text-[#FF6FB1] hover:underline">Sign in →</a>
              </div>
            ) : !canReview ? (
              <div className="text-center py-6">
                <div className="inline-flex w-14 h-14 rounded-full bg-[#FFEDB6] items-center justify-center mb-3 border-2 border-dashed border-[#FFCB47]">
                  <span className="text-2xl">🛍️</span>
                </div>
                <p className="text-sm text-[#1F2F4A] mb-1 font-bold">Purchase required</p>
                <p className="text-xs text-[#7A8299] font-medium">Only customers who have purchased this product are allowed to leave a review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-[#1F2F4A] block mb-1.5">Your Rating</label>
                  <Stars value={reviewStars} interactive onChange={setReviewStars} size="lg" />
                </div>
                <p className="text-xs text-[#7A8299] font-medium">Posting as <strong className="text-[#1F2F4A]">{customer.name}</strong></p>
                <textarea
                  placeholder="Share your experience with this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full border-2 border-[#FFE0EC] bg-[#FFF8FB] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6FB1] resize-none font-medium"
                />
                <Button onClick={submitReview} loading={submittingReview}>Submit Review ✨</Button>
              </div>
            )}
          </div>

          {/* Reviews list */}
          {reviewsData?.reviews?.length ? (
            <div className="space-y-3">
              {reviewsData.reviews.map((review: Review) => (
                <div key={review._id} className="bg-white border-2 border-[#FFE0EC] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-[#1F2F4A]">{review.who}</span>
                    <Stars value={review.stars} size="sm" />
                  </div>
                  <p className="text-sm text-[#5A5048] font-medium leading-relaxed">{review.text}</p>
                  {review.adminReply && (
                    <div className="mt-3 border-l-3 border-[#FF6FB1] pl-3 py-1">
                      <p className="text-xs font-extrabold text-[#FF6FB1] uppercase tracking-wider">Store Reply</p>
                      <p className="text-xs text-[#5A5048] mt-0.5 font-medium">{review.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Premium Benefits */}
      {benefits && benefits.length > 0 && benefits.map((benefit) => (
        benefit.items?.length > 0 && (
          <div key={benefit._id} className="mt-14">
            <div className="rounded-[28px] border-2 border-[#FFE0EC] p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #FFE0EC 0%, #FFEDB6 100%)' }}>
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#FF6FB1] bg-white text-[#FF6FB1] text-sm font-extrabold">
                  <span>👑</span>
                  <span>{benefit.title}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefit.items.map((item, idx) => (
                  <div key={item._id || idx} className="flex gap-3 rounded-2xl bg-white border-2 border-white p-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#D7F5E2] flex items-center justify-center text-[#4FC081]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-[#1F2F4A] text-sm">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-[#5A5048] mt-1 leading-relaxed font-medium">{item.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      ))}

      {/* Related products */}
      {related && related.length > 0 && (
        <div className="mt-14">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <p className="eyebrow mb-1">💖 Hand-picked for you</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1F2F4A]">You May Also Like</h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-[#FF5B6E] to-[#FF6FB1] px-5 py-2.5 rounded-full whitespace-nowrap shadow-soft-pink hover:-translate-y-0.5 transition-all"
            >
              View all <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
