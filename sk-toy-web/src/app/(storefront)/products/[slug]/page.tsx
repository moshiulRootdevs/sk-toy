'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Product, Review, Benefit } from '@/types';
import { fmtTk, imgUrl, cls, isAnimatedImage } from '@/lib/utils';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import Stars from '@/components/ui/Stars';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ProductCard from '@/components/storefront/ProductCard';

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

  // Track view (fire-and-forget) — once per product per page mount
  useEffect(() => {
    if (!product?._id) return;
    api.post(`/products/${product._id}/view`).catch(() => {});
  }, [product?._id]);

  if (isLoading) return (
    <div className="flex justify-center items-center py-32"><Spinner size="lg" /></div>
  );

  if (!product) return (
    <div className="text-center py-32 text-gray-400">Product not found.</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
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
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cls(
                    'relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors',
                    selectedImage === i ? 'border-[#EC5D4A]' : 'border-transparent hover:border-gray-300'
                  )}
                >
                  {isVideo(img) ? (
                    <>
                      <video src={imgUrl(img)} preload="metadata" muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg width="12" height="14" viewBox="0 0 10 12" fill="white"><path d="M0 0l10 6-10 6z" /></svg>
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
          {product.badge && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-[#EC5D4A] text-white px-2.5 py-0.5 rounded-full font-semibold">{product.badge}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Stars value={product.rating} size="md" />
              <span className="text-sm text-gray-500">{product.reviewCount} reviews</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-extrabold text-gray-900">{fmtTk(price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-gray-400 line-through">{fmtTk(product.comparePrice)}</span>
            )}
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Select Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(v.name === selectedVariant ? undefined : v.name)}
                    disabled={v.stock === 0}
                    className={cls(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                      selectedVariant === v.name
                        ? 'border-[#EC5D4A] bg-[#EC5D4A]/10 text-[#EC5D4A]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400',
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
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 text-lg"
              >
                −
              </button>
              <span className="px-4 py-2.5 text-sm font-semibold min-w-[40px] text-center">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="px-3 py-2.5 text-gray-500 hover:bg-gray-50 text-lg"
              >
                +
              </button>
            </div>
            <Button
              onClick={addToCart}
              disabled={!inStock}
              className="flex-1"
              size="lg"
              variant="outline"
            >
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              onClick={() => { addToCart(); router.push('/checkout'); }}
              disabled={!inStock}
              className="flex-1"
              size="lg"
            >
              Buy Now
            </Button>
            <button
              onClick={() => toggle(product._id)}
              className={cls(
                'p-3 rounded-xl border transition-colors',
                wishlisted ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'
              )}
              aria-label="Wishlist"
            >
              <svg className={cls('w-5 h-5', wishlisted && 'fill-current')} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {!inStock && (
            <p className="mt-2 text-sm text-red-500">This item is currently out of stock.</p>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <div
                className="prose-description text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* Meta info */}
          <div className="mt-5 space-y-1.5 text-sm text-gray-500">
            {product.sku && <p>SKU: <span className="text-gray-700">{product.sku}</span></p>}
            {product.ageGroup && <p>Age Group: <span className="text-gray-700">{product.ageGroup}</span></p>}
            {product.gender && product.gender !== 'All' && <p>Gender: <span className="text-gray-700">{product.gender}</span></p>}
            {(() => {
              const cats = Array.isArray(product.categories) && product.categories.length
                ? product.categories
                : (product.category ? [product.category] : []);
              const names = cats
                .map((c: any) => (typeof c === 'object' ? c?.name : ''))
                .filter(Boolean);
              if (!names.length) return null;
              return (
                <p>{names.length === 1 ? 'Category' : 'Categories'}: <span className="text-gray-700">{names.join(', ')}</span></p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-14">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        <div className={`grid grid-cols-1 gap-8 ${reviewsData?.reviews?.length ? 'lg:grid-cols-2' : ''}`}>
          {/* Write review */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
            {!customer ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-3">🔒</p>
                <p className="text-sm text-gray-600 mb-1 font-medium">Sign in to leave a review</p>
                <p className="text-xs text-gray-400 mb-4">Only customers who have purchased this product can write a review.</p>
                <a href="/login" className="inline-block text-sm font-medium text-[#EC5D4A] hover:underline">Sign in →</a>
              </div>
            ) : !canReview ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-3">🛍️</p>
                <p className="text-sm text-gray-600 mb-1 font-medium">Purchase required</p>
                <p className="text-xs text-gray-400">Only customers who have purchased this product are allowed to leave a review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Your Rating</label>
                  <Stars value={reviewStars} interactive onChange={setReviewStars} size="lg" />
                </div>
                <p className="text-xs text-gray-400">Posting as <strong className="text-gray-600">{customer.name}</strong></p>
                <textarea
                  placeholder="Share your experience with this product..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC5D4A] resize-none"
                />
                <Button onClick={submitReview} loading={submittingReview}>Submit Review</Button>
              </div>
            )}
          </div>

          {/* Reviews list */}
          {reviewsData?.reviews?.length ? (
            <div className="space-y-4">
              {reviewsData.reviews.map((review: Review) => (
                <div key={review._id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-900">{review.who}</span>
                    <Stars value={review.stars} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600">{review.text}</p>
                  {review.adminReply && (
                    <div className="mt-2 border-l-2 border-[#EC5D4A] pl-3">
                      <p className="text-xs font-semibold text-[#EC5D4A]">Store Reply</p>
                      <p className="text-xs text-gray-600">{review.adminReply}</p>
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
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-6 sm:p-8">
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-200 bg-white text-cyan-700 text-sm font-semibold">
                  <span>👑</span>
                  <span>{benefit.title}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefit.items.map((item, idx) => (
                  <div key={item._id || idx} className="flex gap-3 rounded-xl bg-white border border-cyan-100 p-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</div>
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
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900">You May Also Like</h2>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#EC5D4A] hover:underline whitespace-nowrap"
            >
              View all <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
