'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Category } from '@/types';
import { imgUrl } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const CAT_TINTS = [
  { bg: '#FFE0EC', dot: '#FF6FB1' },
  { bg: '#FFEDB6', dot: '#FFCB47' },
  { bg: '#FFE0CB', dot: '#FF9A4D' },
  { bg: '#D7F5E2', dot: '#4FC081' },
  { bg: '#D4EEF7', dot: '#6BC8E6' },
  { bg: '#E5D9F8', dot: '#B093E8' },
  { bg: '#FFD4E6', dot: '#E5539B' },
  { bg: '#FFE0EC', dot: '#FF6FB1' },
];

const CAT_ICONS: Record<string, string> = {
  'shop-by-age': '👶', 'cars-vehicles': '🚗', 'baby-toddler': '🧸', 'educational': '🧠',
  'electronic-entertainment': '🎮', 'dolls-figures': '🪆', 'books-learning': '📚', 'combo-gift-sets': '🎁',
};

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories-tree'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const roots = (categories || []).filter((c) => !c.parent);

  return (
    <div className="min-h-[60vh]">
      {/* Page header */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 pt-10 pb-6">
        <nav className="flex items-center gap-2 text-xs font-bold text-[#7A8299] mb-4">
          <Link href="/" className="hover:text-[#FF6FB1]">Home</Link>
          <span>›</span>
          <span className="text-[#1F2F4A]">All Categories</span>
        </nav>
        <p className="eyebrow mb-2">🌈 Browse · {roots.length} categories</p>
        <h1 className="font-display text-[clamp(36px,5vw,56px)] font-bold leading-[1.05] tracking-tight text-[#1F2F4A]">
          Shop by <span className="text-gradient-rainbow">Category</span>
        </h1>
      </div>

      {/* Grid */}
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : roots.length === 0 ? (
          <div className="text-center py-20 text-[#7A8299] font-semibold">No categories found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {roots.map((cat, i) => {
              const tint = CAT_TINTS[i % CAT_TINTS.length];
              const icon = cat.icon || CAT_ICONS[cat.slug] || '🧸';
              const subNames = (cat.children || []).slice(0, 3).map((c: any) => c.name || c).join(', ');
              return (
                <Link
                  key={cat._id}
                  href={`/categories/${cat.slug}`}
                  className="group flex flex-col items-center text-center p-5 bg-white border-2 border-[#FFE0EC] rounded-[22px] transition-all duration-200 hover:-translate-y-1 hover:rotate-[-1deg] hover:shadow-[0_20px_40px_-18px_rgba(255,111,177,.5)] hover:border-[#FFD4E6]"
                >
                  <div
                    className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-[34px] mb-3 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: tint.bg, boxShadow: `0 8px 18px -10px ${tint.dot}80` }}
                  >
                    {cat.image
                      ? <Image src={imgUrl(cat.image)} alt={cat.name} width={56} height={56} className="object-contain" />
                      : <span>{icon}</span>}
                  </div>
                  <p className="text-[14px] font-bold text-[#1F2F4A] leading-tight">{cat.name}</p>
                  {(cat.tag || subNames) && (
                    <p className="mt-1 text-[11px] text-[#8B8176] leading-tight line-clamp-2 font-medium">
                      {cat.tag || subNames}
                    </p>
                  )}
                  {cat.children && cat.children.length > 0 && (
                    <span className="mt-2 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white" style={{ background: tint.dot }}>
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
              const tint = CAT_TINTS[i % CAT_TINTS.length];
              return (
                <div key={cat._id}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-[.14em] px-3 py-1.5 rounded-full text-white" style={{ background: tint.dot }}>
                      {cat.name}
                    </span>
                    <div className="h-0.5 flex-1 bg-[#FFE0EC] rounded-full" />
                    <Link href={`/categories/${cat.slug}`} className="text-xs font-bold text-[#FF6FB1] hover:underline">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {(cat.children as Category[]).map((sub: any, j: number) => {
                      const subTint = CAT_TINTS[(i + j + 1) % CAT_TINTS.length];
                      return (
                        <Link
                          key={sub._id}
                          href={`/categories/${sub.slug}`}
                          className="flex flex-col items-center text-center p-3 bg-white border-2 border-[#FFE0EC] rounded-2xl hover:border-[#FFD4E6] hover:-translate-y-0.5 transition-all"
                        >
                          {sub.image ? (
                            <div className="w-10 h-10 relative mb-2">
                              <Image src={imgUrl(sub.image)} alt={sub.name} fill className="object-contain" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2" style={{ background: subTint.bg }}>
                              {sub.icon || CAT_ICONS[sub.slug] || '🧸'}
                            </div>
                          )}
                          <p className="text-[12px] font-bold text-[#1F2F4A] leading-tight">{sub.name}</p>
                        </Link>
                      );
                    })}
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
