'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect, Suspense } from 'react';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import Spinner from '@/components/ui/Spinner';
import SelectUI from '@/components/ui/Select';
import { cls } from '@/lib/utils';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price-low',  label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useBodyScrollLock(sidebarOpen);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const age = searchParams.get('age') || '';
  const filter = searchParams.get('filter') || '';

  // Comma-separated filter params parsed into Sets for O(1) lookup.
  const csvToSet = (v: string) => new Set(v.split(',').map((s) => s.trim()).filter(Boolean));
  const selectedCategories = csvToSet(category);
  const selectedAges = csvToSet(age);
  const selectedFilters = csvToSet(filter);

  const ITEMS_PER_PAGE = 20;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', { q, category, sort, age, filter }],
    queryFn: ({ pageParam = 1 }) => {
      const params: Record<string, string | number> = { sort, page: pageParam, limit: ITEMS_PER_PAGE };
      if (q)        params.search   = q;
      if (category) params.category = category;
      if (age)      params.ageGroup = age;
      if (filter)   params.badge    = filter;
      return api.get('/products', { params }).then((r) => r.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.length * ITEMS_PER_PAGE;
      if (totalFetched >= (lastPage.total ?? 0)) return undefined;
      return allPages.length + 1;
    },
  });

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // Read query params directly from window.location to avoid stale-closure bugs
  // when clicks happen faster than React can re-render the new searchParams.
  function getLiveParams(): URLSearchParams {
    if (typeof window === 'undefined') return new URLSearchParams(searchParams.toString());
    return new URLSearchParams(window.location.search);
  }

  function setParam(key: string, val: string) {
    const p = getLiveParams();
    if (val) p.set(key, val);
    else p.delete(key);
    if (key !== 'page') p.delete('page');
    router.push(`/products?${p.toString()}`);
  }

  // Toggle a single value in/out of a comma-separated URL param.
  function toggleParam(key: string, value: string) {
    const p = getLiveParams();
    const current = csvToSet(p.get(key) || '');
    if (current.has(value)) current.delete(value);
    else current.add(value);
    const joined = [...current].join(',');
    if (joined) p.set(key, joined);
    else p.delete(key);
    p.delete('page');
    router.push(`/products?${p.toString()}`);
  }

  const products: Product[] = data?.pages.flatMap((p) => p.products ?? []) ?? [];
  const total: number = data?.pages[0]?.total || 0;

  const title = (() => {
    if (q) return `Results for "${q}"`;
    if (selectedCategories.size === 1) {
      const id = [...selectedCategories][0];
      return categories?.find((c) => c._id === id)?.name || 'Products';
    }
    if (selectedCategories.size > 1) return `${selectedCategories.size} categories`;
    return 'All Products';
  })();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10">
      {/* Top bar */}
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="eyebrow mb-1">🛍️ Browse our shelves</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F2F4A]">{title}</h1>
          {!isLoading && <p className="text-sm text-[#7A8299] mt-1 font-semibold">{total} happy toys waiting</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 text-sm font-bold border-2 border-[#FFD4E6] bg-white text-[#FF6FB1] rounded-full px-4 py-2 hover:bg-[#FFE0EC] lg:hidden"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="15" y1="18" x2="21" y2="18" />
            </svg>
            Filters
          </button>
          <SelectUI
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            options={SORT_OPTIONS}
            pill
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={cls(
          'shrink-0 w-56 space-y-6',
          'hidden lg:block',
          sidebarOpen && 'fixed inset-0 z-40 bg-white p-6 overflow-y-auto block lg:static lg:z-auto lg:bg-transparent lg:p-0'
        )}>
          {sidebarOpen && (
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="font-bold">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Quick filters */}
          <FilterGroup
            title="Quick Filter"
            onClear={selectedFilters.size > 0 ? () => setParam('filter', '') : undefined}
          >
            {[
              { label: 'New Arrivals', value: 'new' },
              { label: 'On Sale', value: 'sale' },
              { label: 'Clearance', value: 'clearance' },
              { label: 'Featured', value: 'featured' },
            ].map((f) => (
              <FilterItem
                key={f.value}
                label={f.label}
                active={selectedFilters.has(f.value)}
                onClick={() => toggleParam('filter', f.value)}
              />
            ))}
          </FilterGroup>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <FilterGroup
              title="Category"
              onClear={selectedCategories.size > 0 ? () => setParam('category', '') : undefined}
            >
              {categories.map((cat) => (
                <FilterItem
                  key={cat._id}
                  label={cat.name}
                  active={selectedCategories.has(cat._id)}
                  onClick={() => toggleParam('category', cat._id)}
                />
              ))}
            </FilterGroup>
          )}

          {/* Age group */}
          <FilterGroup
            title="Age Group"
            onClear={selectedAges.size > 0 ? () => setParam('age', '') : undefined}
          >
            {['0-2', '3-5', '6-8', '9-12', '12+'].map((a) => (
              <FilterItem
                key={a}
                label={`${a} Years`}
                active={selectedAges.has(a)}
                onClick={() => toggleParam('age', a)}
              />
            ))}
          </FilterGroup>

        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">Failed to load products</p>
              <p className="text-sm mt-1">Please check your connection or try again</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isFetchingNextPage && <Spinner size="md" />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children, onClear }: { title: string; children: React.ReactNode; onClear?: () => void }) {
  return (
    <div className="bg-white border-2 border-[#FFE0EC] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-extrabold text-[#FF6FB1] uppercase tracking-[.16em] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6FB1]" /> {title}
        </h3>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[10px] font-bold text-[#7A8299] hover:text-[#FF6FB1] uppercase tracking-wider transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cls(
        'w-full text-left text-sm px-3 py-1.5 rounded-xl transition-colors flex items-center gap-2 font-semibold',
        active ? 'bg-[#FFE0EC] text-[#FF6FB1]' : 'text-[#1F2F4A] hover:bg-[#FFF5F8]'
      )}
    >
      <span className={cls('w-4 h-4 rounded-md border-2 flex-shrink-0 flex items-center justify-center',
        active ? 'bg-[#FF6FB1] border-[#FF6FB1]' : 'border-[#FFD4E6] bg-white'
      )}>
        {active && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M20 6 9 17l-5-5" /></svg>}
      </span>
      {label}
    </button>
  );
}
