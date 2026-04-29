'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Category, Product } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import Spinner from '@/components/ui/Spinner';
import SelectUI from '@/components/ui/Select';
import { imgUrl } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'newest',     label: 'Newest first' },
  { value: 'price-low',  label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'rating',     label: 'Top rated' },
];

// Virtual collections that don't exist as real DB categories
const VIRTUAL_CATS: Record<string, { name: string; tag: string; badge?: string; defaultSort?: string }> = {
  'new-arrivals': { name: 'New Arrivals', tag: 'Fresh from the warehouse — first to land, first to go.', badge: 'new', defaultSort: 'newest' },
  'sale':         { name: 'Sale',          tag: 'Up to 40% off — while stocks last.', badge: 'sale' },
  'clearance':    { name: 'Stock Clearance', tag: 'End-of-line stock at unbeatable prices.', badge: 'clearance' },
  'damaged':      { name: 'Damaged & Returned', tag: 'Inspected and verified. Cosmetic imperfections only.', badge: 'clearance' },
};

const AGE_OPTS = [
  { value: 'age-0-2',  label: '0–2 yrs' },
  { value: 'age-3-5',  label: '3–5 yrs' },
  { value: 'age-6-8',  label: '6–8 yrs' },
  { value: 'age-9-12', label: '9–12 yrs' },
  { value: 'age-teen', label: 'Teens' },
];

interface Filters {
  ageGroup: string;
  gender: string;
  minPrice: number;
  maxPrice: number;
  badge: string;
}

const EMPTY_FILTERS: Filters = { ageGroup: '', gender: '', minPrice: 0, maxPrice: 10000, badge: '' };

/* ─── Filter sidebar ─────────────────────────────────────────────────────── */
function FilterSidebar({
  filters, onChange,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}) {
  const [priceMax, setPriceMax] = useState(filters.maxPrice);

  const activeCount = [
    filters.ageGroup, filters.gender, filters.badge,
    filters.maxPrice < 10000 ? 'price' : '',
  ].filter(Boolean).length;

  const clear = () => {
    setPriceMax(10000);
    onChange(EMPTY_FILTERS);
  };

  const sectionStyle: React.CSSProperties = { marginBottom: 24 };
  const headStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
    color: '#8B8176', marginBottom: 10,
    fontFamily: 'var(--font-mono-var, monospace)',
  };
  const checkRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer',
    fontSize: 13, color: '#2A2420',
  };

  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>
          Filters
          {activeCount > 0 && (
            <span style={{ marginLeft: 6, background: '#EC5D4A', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button onClick={clear} style={{ fontSize: 11, color: '#EC5D4A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear all
          </button>
        )}
      </div>

      {/* Availability */}
      <div style={sectionStyle}>
        <div style={headStyle}>Availability</div>
        <label style={checkRow}>
          <input type="checkbox" checked={filters.badge === 'sale'} onChange={(e) => onChange({ badge: e.target.checked ? 'sale' : '' })} />
          On sale
        </label>
        <label style={checkRow}>
          <input type="checkbox" checked={filters.badge === 'new'} onChange={(e) => onChange({ badge: e.target.checked ? 'new' : '' })} />
          New arrivals
        </label>
      </div>

      {/* Age */}
      <div style={sectionStyle}>
        <div style={headStyle}>Age</div>
        {AGE_OPTS.map((a) => (
          <label key={a.value} style={checkRow}>
            <input
              type="radio"
              name="ageGroup"
              checked={filters.ageGroup === a.value}
              onChange={() => onChange({ ageGroup: filters.ageGroup === a.value ? '' : a.value })}
              onClick={() => { if (filters.ageGroup === a.value) onChange({ ageGroup: '' }); }}
            />
            {a.label}
          </label>
        ))}
      </div>

      {/* Gender */}
      <div style={sectionStyle}>
        <div style={headStyle}>Gender</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['boys', 'Boys'], ['girls', 'Girls'], ['neutral', 'Unisex']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => onChange({ gender: filters.gender === v ? '' : v })}
              style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${filters.gender === v ? '#1F2F4A' : '#E6D9BD'}`,
                background: filters.gender === v ? '#1F2F4A' : '#FFFBF2',
                color: filters.gender === v ? '#FFFBF2' : '#2A2420',
                fontFamily: 'inherit',
              }}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div style={sectionStyle}>
        <div style={headStyle}>
          <span>Price</span>
          <span style={{ fontWeight: 500, color: '#5A5048', textTransform: 'none', letterSpacing: 0 }}>up to ৳{priceMax.toLocaleString()}</span>
        </div>
        <input
          type="range" min={0} max={10000} step={100} value={priceMax}
          onChange={(e) => setPriceMax(+e.target.value)}
          onMouseUp={() => onChange({ maxPrice: priceMax })}
          onTouchEnd={() => onChange({ maxPrice: priceMax })}
          style={{ width: '100%', accentColor: '#EC5D4A' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A89E92', marginTop: 4 }}>
          <span>৳0</span><span>৳10,000</span>
        </div>
      </div>

    </aside>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const virtual = VIRTUAL_CATS[slug] ?? null;
  const [sort, setSort] = useState(virtual?.defaultSort ?? 'featured');
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateFilter = useCallback((patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const { data: category, isLoading: catLoading } = useQuery<Category>({
    queryKey: ['category', slug],
    queryFn: () => api.get(`/categories/slug/${slug}`).then((r) => r.data).catch(() => null),
    enabled: !virtual,
    staleTime: 5 * 60 * 1000,
  });

  // Resolved category info — either DB category or virtual
  const catName = virtual?.name ?? category?.name ?? '';
  const catTag  = virtual?.tag  ?? category?.tag  ?? '';

  // Detect special "Shop by Age" / "Shop by Gender" category types from slug
  const isAgeParent    = slug === 'by-age';
  const isGenderParent = slug === 'by-gender';
  const isSpecialParent = isAgeParent || isGenderParent;

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['products-by-category', slug, activeSub, activeSubSlug, sort, filters],
    queryFn: () => {
      const params: Record<string, string | number> = { limit: 24 };
      if (sort && sort !== 'featured') params.sort = sort;
      if (filters.badge)              params.badge    = filters.badge;
      if (filters.maxPrice < 10000)   params.maxPrice = filters.maxPrice;

      if (virtual) {
        const badge = filters.badge || virtual.badge;
        if (badge) params.badge = badge;
      } else if (isAgeParent) {
        // Subcategory pill slug like "age/6-8" → ageGroup "age-6-8"
        if (activeSubSlug?.startsWith('age/')) params.ageGroup = `age-${activeSubSlug.slice(4)}`;
        else if (filters.ageGroup) params.ageGroup = filters.ageGroup;
        if (filters.gender) params.gender = filters.gender;
      } else if (isGenderParent) {
        // Subcategory pill slug like "gender/boys" → gender "boys"
        if (activeSubSlug?.startsWith('gender/')) params.gender = activeSubSlug.slice(7);
        else if (filters.gender) params.gender = filters.gender;
        if (filters.ageGroup) params.ageGroup = filters.ageGroup;
      } else {
        // Normal product category — category filter (includes all descendants via backend)
        params.category = activeSub || (category?._id ?? '');
        if (filters.ageGroup) params.ageGroup = filters.ageGroup;
        if (filters.gender)   params.gender   = filters.gender;
      }

      return api.get('/products', { params }).then((r) => r.data);
    },
    enabled: virtual ? true : isSpecialParent ? true : !!category?._id,
  });

  if (!virtual && catLoading) return (
    <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  );
  if (!virtual && !category) return (
    <div className="text-center py-32" style={{ color: '#A89E92' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>∅</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2F4A' }}>Category not found</div>
      <Link href="/categories" style={{ display: 'inline-block', marginTop: 16, color: '#EC5D4A', textDecoration: 'none' }}>← All categories</Link>
    </div>
  );

  const products: Product[] = productsData?.products || [];
  const subCats: Category[] = (category as any)?.children || [];
  const words = catName.split(' ');
  const headRest = words.slice(0, -1).join(' ');
  const headLast = words[words.length - 1];

  const activeFilterCount = [
    filters.ageGroup, filters.gender, filters.badge,
    filters.maxPrice < 10000 ? 'price' : '',
  ].filter(Boolean).length;

  return (
    <div style={{ background: '#FBF4E8', minHeight: '60vh' }}>
      {/* Breadcrumb */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pt-6">
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8B8176' }}>
          <Link href="/" style={{ color: '#8B8176', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EC5D4A'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
          >Home</Link>
          <span>/</span>
          <Link href="/categories" style={{ color: '#8B8176', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EC5D4A'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
          >Categories</Link>
          <span>/</span>
          {category?.parent && (
            <>
              <Link href={`/categories/${(category.parent as any)?.slug || ''}`}
                style={{ color: '#8B8176', textDecoration: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EC5D4A'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
              >{(category.parent as any)?.name || ''}</Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: '#2A2420', fontWeight: 500 }}>{catName}</span>
        </nav>
      </div>

      {/* Category header */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8" style={{ paddingTop: 24, paddingBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#EC5D4A', fontFamily: 'var(--font-mono-var, monospace)', marginBottom: 6 }}>
          Category · {productsData?.total ?? 0} products
        </div>
        <h1 style={{ fontFamily: 'var(--font-inter, system-ui, sans-serif)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#1F2F4A', margin: '0 0 8px' }}>
          {headRest && <>{headRest} </>}
          <span style={{ color: '#EC5D4A' }}>{headLast}</span>
        </h1>
        <p style={{ fontSize: 14, color: '#5A5048', maxWidth: 600, margin: 0 }}>
          {catTag || `A curated edit within ${catName}. Use the filters to narrow by age, gender, or price.`}
        </p>

        {/* Subcategory subnav pills */}
        {subCats.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            <button
              onClick={() => { setActiveSub(null); setActiveSubSlug(null); }}
              style={{
                padding: '5px 14px', borderRadius: 999, fontSize: 12,
                border: `1px solid ${activeSub === null ? '#1F2F4A' : '#E6D9BD'}`,
                background: activeSub === null ? '#1F2F4A' : '#FFFBF2',
                color: activeSub === null ? '#FBF4E8' : '#2A2420',
                cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
              }}
            >All {catName.toLowerCase()}</button>
            {subCats.map((sub) => (
              <button
                key={sub._id}
                onClick={() => {
                  if (sub._id === activeSub) { setActiveSub(null); setActiveSubSlug(null); }
                  else { setActiveSub(sub._id); setActiveSubSlug((sub as any).slug ?? null); }
                }}
                style={{
                  padding: '5px 14px', borderRadius: 999, fontSize: 12,
                  border: `1px solid ${activeSub === sub._id ? '#1F2F4A' : '#E6D9BD'}`,
                  background: activeSub === sub._id ? '#1F2F4A' : '#FFFBF2',
                  color: activeSub === sub._id ? '#FBF4E8' : '#2A2420',
                  cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                }}
              >{sub.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Main layout: sidebar + products */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 pb-24">
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #E6D9BD', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #E6D9BD', background: '#FFFBF2', fontSize: 13, color: '#2A2420', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" />
              </svg>
              Filters {activeFilterCount > 0 && <span style={{ background: '#EC5D4A', color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: 10 }}>{activeFilterCount}</span>}
            </button>
            <span style={{ fontSize: 12, color: '#8B8176', fontFamily: 'var(--font-mono-var, monospace)' }}>
              {productsData?.total ?? 0} products
            </span>
          </div>
          <SelectUI
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORT_OPTIONS}
            pill
          />
        </div>

        {/* Content row */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Sidebar — desktop always visible, mobile toggled */}
          <div className={sidebarOpen ? 'block' : 'hidden lg:block'} style={{ flexShrink: 0 }}>
            <div style={{ background: '#FFFBF2', border: '1px solid #E8DFD2', borderRadius: 16, padding: 20, position: 'sticky', top: 90 }}>
              <FilterSidebar filters={filters} onChange={updateFilter} />
            </div>
          </div>

          {/* Product grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {prodLoading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>∅</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#1F2F4A', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>Nothing matches</div>
                <p style={{ color: '#8B8176', marginTop: 8 }}>Try loosening a filter or check back soon.</p>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters(EMPTY_FILTERS)} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', background: '#EC5D4A', color: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
