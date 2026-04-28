'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Category } from '@/types';
import { imgUrl } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const CAT_COLORS = ['#EC5D4A','#F5C443','#F39436','#4FA36A','#6FB8D9','#9C7BC9','#F28BA8','#EC5D4A','#4FA36A','#F39436','#6FB8D9','#F5C443'];
const CAT_ICONS: Record<string, string> = {
  'new-arrivals': '✦', 'by-age': '🎂', 'by-gender': '👧', 'toys': '🚗',
  'learning': '📐', 'baby': '🍼', 'outdoor': '🌿', 'brands': '🏷', 'sale': '🏷',
  'clearance': '📦', 'damaged': '🔖', 'journal': '📖',
};

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories-tree'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const roots = (categories || []).filter((c) => !c.parent);

  return (
    <div style={{ background: '#FBF4E8', minHeight: '60vh' }}>
      {/* Page header */}
      <div className="max-w-[1360px] mx-auto px-8 pt-12 pb-6">
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8B8176', marginBottom: 16 }}>
          <Link href="/" style={{ color: '#8B8176', textDecoration: 'none' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EC5D4A'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
          >Home</Link>
          <span>/</span>
          <span style={{ color: '#2A2420', fontWeight: 500 }}>All Categories</span>
        </nav>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#EC5D4A', fontFamily: 'var(--font-mono-var, monospace)', marginBottom: 8 }}>
          Browse · {roots.length} categories
        </div>
        <h1 style={{ fontFamily: 'var(--font-fredoka, Fredoka, sans-serif)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#1F2F4A', margin: 0 }}>
          Shop by <span style={{ color: '#EC5D4A' }}>Category</span>
        </h1>
      </div>

      {/* Grid */}
      <div className="max-w-[1360px] mx-auto px-8 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : roots.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80, color: '#A89E92' }}>No categories found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
            {roots.map((cat, i) => {
              const color = CAT_COLORS[i % CAT_COLORS.length];
              const icon = cat.icon || CAT_ICONS[cat.slug] || '🧸';
              const subNames = (cat.children || []).slice(0, 3).map((c: any) => c.name || c).join(', ');
              return (
                <Link
                  key={cat._id}
                  href={`/categories/${cat.slug}`}
                  style={{ textDecoration: 'none' }}
                  className="group flex flex-col items-center text-center p-5 bg-[#FFFBF2] border-2 border-[#E9DAB9] rounded-[18px] transition-all duration-200"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = 'translateY(-4px) rotate(-1deg)';
                    el.style.borderColor = color;
                    el.style.boxShadow = `0 12px 28px -12px ${color}`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.transform = '';
                    el.style.borderColor = '';
                    el.style.boxShadow = '';
                  }}
                >
                  <div
                    className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-[32px] mb-3 group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300"
                    style={{ background: color + '22' }}
                  >
                    {cat.image
                      ? <Image src={imgUrl(cat.image)} alt={cat.name} width={48} height={48} className="object-contain" />
                      : <span>{icon}</span>}
                  </div>
                  <p className="text-[13px] font-[500] text-[#1F2F4A] leading-tight">{cat.name}</p>
                  {(cat.tag || subNames) && (
                    <p className="mt-1 text-[11px] text-[#8B8176] leading-tight line-clamp-2">
                      {cat.tag || subNames}
                    </p>
                  )}
                  {/* Subcategory count badge */}
                  {cat.children && cat.children.length > 0 && (
                    <span className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: color + '18', color }}>
                      {cat.children.length} sub
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Per-category subcategory panels */}
        {!isLoading && roots.filter((c) => c.children && c.children.length > 0).length > 0 && (
          <div className="mt-16 space-y-10">
            {roots.filter((c) => c.children && c.children.length > 0).map((cat, i) => {
              const color = CAT_COLORS[i % CAT_COLORS.length];
              return (
                <div key={cat._id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-[.1em] px-3 py-1 rounded-full" style={{ background: color + '18', color }}>
                      {cat.name}
                    </span>
                    <div className="h-px flex-1" style={{ background: '#E9DAB9' }} />
                    <Link href={`/categories/${cat.slug}`} style={{ fontSize: 12, color, textDecoration: 'none', fontWeight: 500 }}>
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {(cat.children as Category[]).map((sub: any) => (
                      <Link
                        key={sub._id}
                        href={`/categories/${sub.slug}`}
                        style={{ textDecoration: 'none' }}
                        className="flex flex-col items-center text-center p-3 bg-[#FFFBF2] border border-[#E9DAB9] rounded-2xl hover:border-current transition-colors"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = color; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = ''; }}
                      >
                        {sub.image ? (
                          <div className="w-10 h-10 relative mb-2">
                            <Image src={imgUrl(sub.image)} alt={sub.name} fill className="object-contain" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2" style={{ background: color + '18' }}>
                            {sub.icon || CAT_ICONS[sub.slug] || '🧸'}
                          </div>
                        )}
                        <p className="text-[12px] font-medium text-[#1F2F4A] leading-tight">{sub.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
