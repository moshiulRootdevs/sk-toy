'use client';

import { useState } from 'react';
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
import AdminIcon from '@/components/admin/AdminIcon';

const badgeColors: Record<string, string> = {
  new: 'green', sale: 'red', hot: 'orange', clearance: 'blue',
};

export default function ProductViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);

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

  const images = product.images || [];
  const heroImg = images[activeImg] || images[0];
  const discountPct = product.comparePrice != null && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;
  const stockTone = product.stock === 0 ? 'red' : product.stock < 8 ? 'orange' : 'green';
  const stockColor = stockTone === 'red' ? '#EC5D4A' : stockTone === 'orange' ? '#F39436' : '#4FA36A';
  const stockBg = stockTone === 'red' ? '#FBDED8' : stockTone === 'orange' ? '#FFEFD5' : '#E5F1E0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Breadcrumb + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button
            onClick={() => router.push('/admin/products')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px 4px 8px', borderRadius: 999,
              border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: 8,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFF'; }}
          >
            <AdminIcon name="chevL" size={12} />
            Back to Products
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2A2420', margin: 0, lineHeight: 1.2 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 12, color: '#8B8176' }}>
            <span style={{ fontFamily: 'monospace' }}>SKU: {product.sku || '—'}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D8CFBF' }} />
            <Pill label={product.active ? 'Active' : 'Inactive'} color={product.active ? 'green' : 'gray'} />
            {product.badge && <Pill label={product.badge} color={badgeColors[product.badge] || 'gray'} />}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
            <AdminIcon name="external" size={13} />
            View on Store
          </Link>
          <Button size="md" onClick={() => router.push(`/admin/products/${id}`)}>Edit Product</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Price"
          value={fmtTk(product.price)}
          accent="#EC5D4A"
          sub={
            product.comparePrice != null && product.comparePrice > product.price
              ? <span><span style={{ textDecoration: 'line-through', color: '#A89E92' }}>{fmtTk(product.comparePrice)}</span> · {discountPct}% off</span>
              : null
          }
        />
        <KpiCard
          label="Stock"
          value={String(product.stock)}
          accent={stockColor}
          accentBg={stockBg}
          sub={
            product.stock === 0 ? 'Out of stock'
              : product.stock < 8 ? 'Low'
              : 'In stock'
          }
        />
        <KpiCard
          label="Rating"
          value={product.rating ? product.rating.toFixed(1) : '—'}
          accent="#F5C443"
          sub={product.rating ? `out of 5` : 'No reviews yet'}
        />
        <KpiCard
          label="Reviews"
          value={String(product.reviewCount || 0)}
          accent="#6FB8D9"
          sub={(product.reviewCount || 0) === 0 ? 'No reviews yet' : 'customer reviews'}
        />
      </div>

      {/* Main grid — Gallery on the right, everything else on the left */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start">
        {/* Left column — details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Description */}
          <Card title="Description" accent="#FF6FB1">
            {product.description ? (
              <div className="prose-description" style={{ fontSize: 14, color: '#3F362F', lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <div style={{ fontSize: 13, color: '#A89E92', fontStyle: 'italic' }}>No description provided.</div>
            )}
          </Card>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <Card title="Variants" subtitle={`${product.variants.length} variant${product.variants.length === 1 ? '' : 's'}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {product.variants.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAF6EF', borderRadius: 8, fontSize: 13, border: '1px solid #F4EEE3' }}>
                    <span style={{ fontWeight: 600, color: '#2A2420' }}>{v.name}</span>
                    <div style={{ display: 'flex', gap: 18, color: '#8B8176', fontSize: 12, alignItems: 'center' }}>
                      {v.sku && <span style={{ fontFamily: 'monospace' }}>{v.sku}</span>}
                      <span>Stock: <strong style={{ color: v.stock === 0 ? '#EC5D4A' : '#2A2420' }}>{v.stock}</strong></span>
                      {v.price != null && <span style={{ fontWeight: 700, color: '#EC5D4A' }}>{fmtTk(v.price)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Inventory" accent="#4FA36A">
            <InfoRow label="Stock" value={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: stockColor }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: stockColor }} />
                {product.stock}
                <span style={{ color: stockColor, fontWeight: 500, fontSize: 12 }}>
                  ({product.stock === 0 ? 'Out of stock' : product.stock < 8 ? 'Low' : 'In stock'})
                </span>
              </span>
            } />
            <InfoRow label="Track Inventory" value={product.trackInventory ? 'Yes' : 'No'} />
            <InfoRow label="SKU" value={<span style={{ fontFamily: 'monospace' }}>{product.sku || '—'}</span>} />
          </Card>

          <Card title="Organization" accent="#6FB8D9">
            <InfoRow label="Categories" value={
              cats.length > 0
                ? <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{cats.map((c) => <span key={typeof c === 'object' ? c._id : c} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: '#E8F1FA', color: '#3F8FBF', fontWeight: 600 }}>{typeof c === 'object' ? c.name : c}</span>)}</div>
                : '—'
            } />
            <InfoRow label="Age Group" value={product.ageGroup?.replace('age-', '') || '—'} />
            <InfoRow label="Gender" value={product.gender ? product.gender.charAt(0).toUpperCase() + product.gender.slice(1) : '—'} />
          </Card>

          {(product.metaTitle || product.metaDescription) && (
            <Card title="SEO" accent="#B093E8">
              {product.metaTitle && <InfoRow label="Meta Title" value={product.metaTitle} />}
              {product.metaDescription && (
                <div style={{ fontSize: 12, color: '#5A5048', lineHeight: 1.55, padding: '6px 0', borderTop: '1px solid #F4EEE3' }}>
                  <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Meta Description</div>
                  {product.metaDescription}
                </div>
              )}
              <InfoRow label="Slug" value={<span style={{ fontFamily: 'monospace', fontSize: 12 }}>/{product.slug}</span>} />
            </Card>
          )}
        </div>

        {/* Right column — gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 16 }}>
          <Card title="Gallery" subtitle={`${images.length} image${images.length === 1 ? '' : 's'}`}>
            {images.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Hero image */}
                <div style={{
                  position: 'relative', aspectRatio: '1',
                  width: '100%',
                  borderRadius: 12, overflow: 'hidden', background: '#F4EEE3',
                  border: '1px solid #E8DFD2',
                }}>
                  <Image src={imgUrl(heroImg)} alt={product.name} fill className="object-cover" sizes="800px" />
                  {activeImg === 0 && (
                    <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 700, background: '#EC5D4A', color: '#FFF', padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Cover
                    </span>
                  )}
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        style={{
                          padding: 0, cursor: 'pointer',
                          aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                          background: '#F4EEE3', position: 'relative',
                          border: i === activeImg ? '2px solid #EC5D4A' : '1px solid #E8DFD2',
                          transition: 'transform .15s, border-color .15s',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                      >
                        <Image src={imgUrl(img)} alt={`${product.name} thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '56px 0', textAlign: 'center', color: '#A89E92', fontSize: 13, background: '#FAF6EF', borderRadius: 10, border: '1px dashed #E8DFD2' }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🖼</div>
                No images uploaded
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Small presentational components ───────────────────────────────────── */

function Card({ title, subtitle, accent, children }: { title: string; subtitle?: string; accent?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid #F4EEE3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {accent && <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />}
          <span style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>{title}</span>
        </div>
        {subtitle && <span style={{ fontSize: 11, color: '#8B8176', fontWeight: 500 }}>{subtitle}</span>}
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent, accentBg }: { label: string; value: string; sub?: React.ReactNode; accent: string; accentBg?: string }) {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentBg || accent, opacity: accentBg ? 1 : 0.18 }} />
      <div style={{ fontSize: 11, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#8B8176', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: '#8B8176', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#2A2420', textAlign: 'right', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
