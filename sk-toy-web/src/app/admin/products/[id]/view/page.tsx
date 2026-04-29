'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import { fmtTk, imgUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Pill from '@/components/ui/Pill';
import Spinner from '@/components/ui/Spinner';

const badgeColors: Record<string, string> = {
  new: 'green', sale: 'red', hot: 'orange', clearance: 'blue',
};

export default function ProductViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['admin-product', id],
    queryFn: () => api.get(`/products/admin/${id}`).then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#A89E92' }}>Product not found</div>;

  const cats = (Array.isArray(product.categories) && product.categories.length
    ? product.categories
    : product.category ? [product.category] : []
  ) as Category[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Back
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#2A2420', margin: 0 }}>{product.name}</h1>
            <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'monospace', marginTop: 2 }}>SKU: {product.sku || '—'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/products/${product.slug}`} target="_blank"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View on Store
          </Link>
          <Button size="md" onClick={() => router.push(`/admin/products/${id}`)}>Edit Product</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Images */}
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 12 }}>Images</div>
            {product.images.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {product.images.map((img, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#F4EEE3', position: 'relative', border: i === 0 ? '2px solid #EC5D4A' : '1px solid #E8DFD2' }}>
                    <Image src={imgUrl(img)} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                    {i === 0 && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, fontWeight: 700, background: '#EC5D4A', color: '#FFF', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Cover</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#A89E92', fontSize: 13 }}>No images</div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 12 }}>Description</div>
              <div className="prose-description" style={{ fontSize: 14, color: '#5A5048', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 12 }}>Variants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {product.variants.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#FAF6EF', borderRadius: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 500, color: '#2A2420' }}>{v.name}</span>
                    <div style={{ display: 'flex', gap: 16, color: '#8B8176', fontSize: 12 }}>
                      {v.sku && <span style={{ fontFamily: 'monospace' }}>{v.sku}</span>}
                      <span>Stock: {v.stock}</span>
                      {v.price != null && <span style={{ fontWeight: 600, color: '#2A2420' }}>{fmtTk(v.price)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status & Price */}
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Pill label={product.active ? 'Active' : 'Inactive'} color={product.active ? 'green' : 'gray'} />
              {product.badge && <Pill label={product.badge} color={badgeColors[product.badge] || 'gray'} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#EC5D4A' }}>{fmtTk(product.price)}</span>
              {product.comparePrice != null && product.comparePrice > product.price && (
                <span style={{ fontSize: 16, color: '#A89E92', textDecoration: 'line-through' }}>{fmtTk(product.comparePrice)}</span>
              )}
            </div>
            {product.comparePrice != null && product.comparePrice > product.price && (
              <div style={{ fontSize: 12, color: '#4FA36A', fontWeight: 600 }}>
                Save {fmtTk(product.comparePrice - product.price)} ({Math.round((1 - product.price / product.comparePrice) * 100)}% off)
              </div>
            )}
          </div>

          {/* Inventory */}
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 12 }}>Inventory</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Stock" value={
                <span style={{ fontWeight: 600, color: product.stock === 0 ? '#EC5D4A' : product.stock < 8 ? '#F39436' : '#4FA36A' }}>
                  {product.stock} {product.stock === 0 ? '(Out of stock)' : product.stock < 8 ? '(Low)' : '(In stock)'}
                </span>
              } />
              <InfoRow label="Track Inventory" value={product.trackInventory ? 'Yes' : 'No'} />
              <InfoRow label="SKU" value={<span style={{ fontFamily: 'monospace' }}>{product.sku || '—'}</span>} />
            </div>
          </div>

          {/* Organization */}
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 12 }}>Organization</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Categories" value={
                cats.length > 0
                  ? <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{cats.map((c) => <span key={typeof c === 'object' ? c._id : c} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#F4EEE3', color: '#5A5048', fontWeight: 500 }}>{typeof c === 'object' ? c.name : c}</span>)}</div>
                  : '—'
              } />
              <InfoRow label="Age Group" value={product.ageGroup?.replace('age-', '') || '—'} />
              <InfoRow label="Gender" value={product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : '—'} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 12 }}>Performance</div>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Rating" value={product.rating ? `${product.rating.toFixed(1)} / 5` : '—'} color="#F5C443" />
              <StatBox label="Reviews" value={String(product.reviewCount || 0)} color="#6FB8D9" />
            </div>
          </div>

          {/* SEO */}
          {(product.metaTitle || product.metaDescription) && (
            <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 12 }}>SEO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.metaTitle && <InfoRow label="Meta Title" value={product.metaTitle} />}
                {product.metaDescription && <InfoRow label="Meta Description" value={<span style={{ fontSize: 12, color: '#5A5048', lineHeight: 1.5 }}>{product.metaDescription}</span>} />}
                <InfoRow label="Slug" value={<span style={{ fontFamily: 'monospace', fontSize: 12 }}>{product.slug}</span>} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, fontSize: 13 }}>
      <span style={{ color: '#8B8176', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#2A2420', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#FAF6EF', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
