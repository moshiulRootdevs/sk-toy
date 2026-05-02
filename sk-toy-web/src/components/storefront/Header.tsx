'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore, useUIStore, useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { NavigationItem, Category, Settings, Product } from '@/types';
import { imgUrl, fmtTk } from '@/lib/utils';

function catSlug(link: string): string | null {
  const m = link.match(/^\/(?:categories|cat)\/([^?#/]+)/);
  return m ? m[1] : null;
}

function buildCatMap(cats: Category[], map: Map<string, Category> = new Map()): Map<string, Category> {
  for (const c of cats) {
    map.set(c.slug, c);
    if (c.children?.length) buildCatMap(c.children, map);
  }
  return map;
}

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
        <div className="bg-[#1F2F4A] text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold leading-none">
          {label}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-2.5 h-2.5 bg-[#1F2F4A] rotate-45 rounded-[2px]" />
      </div>
    </div>
  );
}

function MegaLink({ href, onClose, children, muted }: { href: string; onClose: () => void; children: React.ReactNode; muted?: boolean }) {
  return (
    <li style={{ marginBottom: '6px' }}>
      <Link href={href} onClick={onClose} className="mega-link" style={{ fontSize: muted ? '13px' : '14px', color: muted ? '#7A8299' : '#1F2F4A', fontWeight: muted ? 400 : 500 }}>
        <span>{children}</span>
        <span className="arrow">→</span>
      </Link>
    </li>
  );
}

const MEGA_ACCENT = ['#FF6FB1', '#FFCB47', '#4FC081', '#6BC8E6'];

function MegaMenu({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const cols = (cat.children || []).slice(0, 4);
  if (!cols.length) return null;

  const catPageHref = `/categories/${cat.slug}`;
  function subHref(sub: Category) {
    return `/products?category=${sub._id}`;
  }

  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0,
      background: '#FFFFFF',
      borderTop: '2px solid #FFD4E6',
      boxShadow: '0 22px 50px -16px rgba(31,47,74,0.18)',
      padding: '28px 0 32px',
      zIndex: 50,
    }}>
      <div className="max-w-[1360px] mx-auto px-8">
        <div style={{ display: 'grid', gridTemplateColumns: `1.2fr ${cols.map(() => '1fr').join(' ')}`, gap: '36px', alignItems: 'start' }}>

          {/* Feature card */}
          <div style={{
            background: 'linear-gradient(140deg, #FFE0EC 0%, #FFE9D6 50%, #E5F1FB 100%)',
            borderRadius: '22px', padding: '24px 22px',
            minHeight: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#FFCB47]/40 blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-6 w-28 h-28 rounded-full bg-[#B093E8]/30 blur-2xl pointer-events-none" />
            <div style={{ position: 'relative' }}>
              <span className="font-display" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#FF6FB1', fontWeight: 700 }}>
                Shop the collection
              </span>
              <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 600, margin: '8px 0 6px', lineHeight: 1.15, color: '#1F2F4A' }}>
                {cat.name}
              </h3>
              <p style={{ color: '#5A5048', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                {(cat as any).tag || 'Browse the full range — filtered, sorted, ready to shop.'}
              </p>
            </div>
            <Link
              href={catPageHref}
              onClick={onClose}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FF5B6E', color: '#FFFFFF', padding: '9px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', alignSelf: 'flex-start', marginTop: '16px', boxShadow: '0 6px 14px -6px rgba(255,91,110,.6)', position: 'relative' }}
            >
              See all <span>→</span>
            </Link>
          </div>

          {/* Subcategory columns */}
          {cols.map((sub, i) => (
            <div key={sub._id}>
              <Link
                href={subHref(sub)}
                onClick={onClose}
                className="font-display"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', color: MEGA_ACCENT[i % 4], fontWeight: 700, marginBottom: '12px', textDecoration: 'none' }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: MEGA_ACCENT[i % 4], display: 'inline-block' }} />
                {sub.name}
              </Link>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {(sub.children || []).map((s3) => (
                  <MegaLink key={s3._id} href={subHref(s3)} onClose={onClose}>
                    {s3.name}
                  </MegaLink>
                ))}
                {(sub.children || []).length > 0 && (
                  <MegaLink href={subHref(sub)} onClose={onClose} muted>
                    Shop all {sub.name.toLowerCase()}
                  </MegaLink>
                )}
              </ul>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default function Header({ initialSettings, initialCategories }: { initialSettings?: Settings | null; initialCategories?: Category[] | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQ, setSearchQ] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function openMega(id: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(id);
  }
  function closeMega() {
    closeTimer.current = setTimeout(() => setMegaOpen(null), 120);
  }

  const count = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const { setCartOpen, setMobileMenuOpen } = useUIStore();
  const { customer, logoutCustomer } = useAuthStore();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close the account menu on outside click / Escape
  useEffect(() => {
    if (!accountMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (!accountMenuRef.current?.contains(e.target as Node)) setAccountMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setAccountMenuOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountMenuOpen]);

  const [cartShaking, setCartShaking] = useState(false);
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      setCartShaking(true);
      const t = setTimeout(() => setCartShaking(false), 600);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  const { data: nav } = useQuery<NavigationItem[]>({
    queryKey: ['navigation'],
    queryFn: () => api.get('/navigation').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
    initialData: initialSettings ?? undefined,
    staleTime: 60_000,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
    initialData: initialCategories ?? undefined,
    staleTime: 10 * 60 * 1000,
  });

  const catMap = categories ? buildCatMap(categories) : null;

  useEffect(() => {
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  }, []);

  // Debounced product suggestions
  useEffect(() => {
    if (searchQ.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSuggestLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await api.get(`/products?search=${encodeURIComponent(searchQ.trim())}&limit=6`);
        setSuggestions(r.data.products || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQ]);

  // Compute portal position whenever suggestions open
  useEffect(() => {
    if (!showSuggestions || !formRef.current) return;
    function update() {
      if (!formRef.current) return;
      const r = formRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width });
    }
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showSuggestions, suggestions.length]);

  // Close on click-outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      const inForm = formRef.current?.contains(e.target as Node);
      const inPanel = (e.target as Element)?.closest('[data-search-panel]');
      if (!inForm && !inPanel) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // "/" shortcut to focus search
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setShowSuggestions(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const stripMessages: string[] =
    settings?.topStrip?.enabled && settings.topStrip.messages?.filter(Boolean).length
      ? settings.topStrip.messages.filter(Boolean)
      : ['Free shipping over ৳2,500 · COD available across Bangladesh · 7-day easy returns'];

  const [stripIdx, setStripIdx] = useState(0);
  const [stripVisible, setStripVisible] = useState(true);
  const [stripShowAll, setStripShowAll] = useState(false);

  useEffect(() => {
    if (stripMessages.length <= 1) return;

    let idx = 0;
    let running = true;

    function next() {
      if (!running) return;
      setStripVisible(false);
      setTimeout(() => {
        if (!running) return;
        idx++;
        if (idx < stripMessages.length) {
          setStripIdx(idx);
          setStripVisible(true);
          setTimeout(next, 3500);
        } else {
          setStripShowAll(true);
          setStripVisible(true);
          setTimeout(() => {
            if (!running) return;
            setStripVisible(false);
            setTimeout(() => {
              if (!running) return;
              idx = 0;
              setStripIdx(0);
              setStripShowAll(false);
              setStripVisible(true);
              setTimeout(next, 3500);
            }, 300);
          }, 3000);
        }
      }, 300);
    }

    const firstTimer = setTimeout(next, 3500);
    return () => {
      running = false;
      clearTimeout(firstTimer);
    };
  }, [stripMessages.length]);

  const megaCat: Category | null = (() => {
    if (!megaOpen || !nav || !catMap) return null;
    const navItem = nav.find((n) => n._id === megaOpen);
    if (!navItem) return null;
    const slug = catSlug(navItem.link);
    return slug ? (catMap.get(slug) ?? null) : null;
  })();

  return (
    <>
      {/* Top strip — solid brand-navy with playful colored dot separators */}
      <div className="text-white py-1.5 sm:py-2 px-3 sm:px-4 text-center relative overflow-hidden text-[10.5px] sm:text-[12.5px]"
           style={{ background: '#1F2F4A', letterSpacing: '0.04em', fontWeight: 600 }}>
        <div className="max-w-[1360px] mx-auto" style={{ overflow: 'hidden' }}>
          <span
            className="block text-center w-full"
            style={{ transition: 'opacity 0.3s ease', opacity: stripVisible ? 1 : 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {stripShowAll ? (
              <span style={{ display: 'inline-flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                {stripMessages.map((msg, i) => {
                  const dotColors = ['#FFCB47', '#FF6FB1', '#4FC081', '#6BC8E6'];
                  return (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {i > 0 && (
                        <span style={{
                          display: 'inline-block',
                          width: 5, height: 5,
                          borderRadius: '50%',
                          background: dotColors[(i - 1) % dotColors.length],
                          margin: '0 14px',
                          flexShrink: 0,
                        }} />
                      )}
                      {msg}
                    </span>
                  );
                })}
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFCB47" aria-hidden>
                  <path d="M12 2 14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                </svg>
                <span>{stripMessages[stripIdx]}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFCB47" aria-hidden>
                  <path d="M12 2 14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                </svg>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#FFE0EC]"
              style={{ boxShadow: '0 6px 24px -16px rgba(255,111,177,.35)' }}>
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
          {/* Mobile: hamburger + logo + cart on top, search below. Desktop: 3-col grid with search. */}
          <div className="flex sm:grid sm:grid-cols-[1fr_auto_1fr] items-center justify-between gap-3 sm:gap-6 py-2.5 sm:py-3">

            {/* Search (desktop only here; mobile has it below) */}
            <div ref={searchRef} className="relative max-w-[400px] w-full hidden sm:block">
              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQ.trim()) {
                    setShowSuggestions(false);
                    router.push(`/products?search=${encodeURIComponent(searchQ.trim())}`);
                  }
                }}
                className="flex items-center bg-[#FFF5F8] border-2 border-[#FFD4E6] px-4 py-2 gap-3 rounded-full focus-within:border-[#FF6FB1] focus-within:bg-white transition-colors"
              >
                <svg className="w-4 h-4 text-[#FF6FB1] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={inputRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="Search dinosaurs, diecast, drones…"
                  className="flex-1 bg-transparent text-sm text-[#1F2F4A] placeholder-[#B591A8] outline-none min-w-0 font-medium"
                />
                {suggestLoading
                  ? <svg className="w-3.5 h-3.5 text-[#FF6FB1] animate-spin shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  : <kbd className="hidden sm:inline-block text-[10px] text-[#FF6FB1] border border-[#FFD4E6] px-1.5 py-0.5 rounded shrink-0 font-bold">/</kbd>
                }
              </form>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && dropPos && typeof window !== 'undefined' && createPortal(
                <div
                  data-search-panel=""
                  style={{
                    position: 'absolute',
                    top: dropPos.top + 6,
                    left: dropPos.left,
                    width: dropPos.width,
                    zIndex: 99999,
                    background: '#FFFFFF',
                    border: '2px solid #FFD4E6',
                    borderRadius: '20px',
                    boxShadow: '0 22px 48px -14px rgba(255,111,177,.35)',
                    overflow: 'hidden',
                  }}
                >
                  <ul>
                    {suggestions.map((product) => (
                      <li key={product._id}>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => { setShowSuggestions(false); setSearchQ(''); }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FFF5F8] transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative bg-[#FFE0EC]">
                            {product.images?.[0] && (
                              <Image src={imgUrl(product.images[0])} alt={product.name} fill className="object-cover" sizes="40px" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1F2F4A] truncate group-hover:text-[#FF6FB1] transition-colors">
                              {product.name}
                            </p>
                            {product.category && typeof product.category === 'object' && (
                              <p className="text-[11px] text-[#B591A8] font-semibold uppercase tracking-wider">
                                {(product.category as any).name}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-bold text-[#FF5B6E] shrink-0">{fmtTk(product.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-[#FFE0EC] px-4 py-2.5 bg-[#FFF5F8]">
                    <Link
                      href={`/products?search=${encodeURIComponent(searchQ.trim())}`}
                      onClick={() => { setShowSuggestions(false); setSearchQ(''); }}
                      className="flex items-center justify-between text-sm text-[#5A5048] hover:text-[#FF6FB1] transition-colors font-medium"
                    >
                      <span>See all results for <strong className="text-[#1F2F4A]">"{searchQ}"</strong></span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>,
                document.body,
              )}
            </div>

            {/* Logo — scrolls to top when already on the homepage */}
            <Link
              href="/"
              className="flex items-center"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              {settings?.store?.logo ? (
                <Image
                  src={imgUrl(settings.store.logo)}
                  alt={settings.store.name || 'SK Toy'}
                  width={200} height={64}
                  style={{ objectFit: 'contain', maxHeight: 56, width: 'auto' }}
                  priority
                />
              ) : (
                <span className="font-display flex items-end leading-none select-none" style={{ fontSize: '34px', fontWeight: 700 }}>
                  <span className="logo-letter" style={{ color: '#4FC081', animationDelay: '0s' }}>S</span>
                  <span className="logo-letter" style={{ color: '#FF5B6E', animationDelay: '.08s' }}>K</span>
                  <span className="logo-dot" />
                  <span className="logo-letter" style={{ color: '#FF9A4D', animationDelay: '.24s' }}>T</span>
                  <span className="logo-letter" style={{ color: '#6BC8E6', animationDelay: '.32s' }}>O</span>
                  <span className="logo-letter" style={{ color: '#B093E8', animationDelay: '.40s' }}>Y</span>
                </span>
              )}
            </Link>

            {/* Right cluster: icons + Login pill */}
            <div className="flex items-center gap-1.5 justify-end">
              <button
                className="lg:hidden p-2 rounded-full hover:bg-[#FFE0EC] text-[#1F2F4A] transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>

              <Tooltip label="Track Order">
                <Link href="/track" className="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#D4EEF7] text-[#3FA1C5] hover:scale-110 hover:bg-[#6BC8E6] hover:text-white transition-all" aria-label="Track order">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <path d="M16 8h4l3 5v3h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </Link>
              </Tooltip>

              <Tooltip label="Wishlist">
                <Link href="/wishlist" className="hidden sm:inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#FFD4E6] text-[#E5539B] hover:scale-110 hover:bg-[#FF6FB1] hover:text-white transition-all" aria-label="Wishlist">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </Link>
              </Tooltip>

              <Tooltip label={count > 0 ? `Cart (${count})` : 'Cart'}>
                <button
                  onClick={() => setCartOpen(true)}
                  className={`relative inline-flex w-9 h-9 items-center justify-center rounded-full bg-[#FFE0CB] text-[#E5783A] hover:scale-110 hover:bg-[#FF9A4D] hover:text-white transition-all${cartShaking ? ' cart-shake' : ''}`}
                  aria-label="Cart"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[#FF5B6E] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 border-2 border-white">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </button>
              </Tooltip>

              {/* Login / Account pill */}
              {!customer ? (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-2 ml-1.5 pl-2 pr-3.5 py-1.5 rounded-full text-white text-[13px] font-bold transition-all hover:scale-[1.03] active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #FF6FB1 0%, #FF5B6E 100%)',
                    boxShadow: '0 8px 18px -8px rgba(255,91,110,.6)',
                  }}
                >
                  <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap">Login / Sign Up</span>
                </Link>
              ) : (
                <div ref={accountMenuRef} className="hidden sm:block relative ml-1.5">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((o) => !o)}
                    aria-haspopup="menu"
                    aria-expanded={accountMenuOpen}
                    className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-white text-[13px] font-bold transition-all hover:scale-[1.03] active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #FF6FB1 0%, #FF5B6E 100%)',
                      boxShadow: '0 8px 18px -8px rgba(255,91,110,.6)',
                    }}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <span className="whitespace-nowrap">{customer.name?.split(' ')[0] || 'Account'}</span>
                    <svg className={`w-3 h-3 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {accountMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border-2 border-[#FFE0EC] shadow-[0_18px_36px_-12px_rgba(255,111,177,0.35)] overflow-hidden z-50"
                    >
                      {/* Header strip */}
                      <div className="px-4 py-3 border-b border-[#FFE0EC]" style={{ background: 'linear-gradient(160deg, #FFF5F8 0%, #FFE0EC 100%)' }}>
                        <div className="text-[11px] font-extrabold text-[#FF6FB1] uppercase tracking-[.12em]">Signed in as</div>
                        <div className="text-[14px] font-bold text-[#1F2F4A] truncate mt-0.5">{customer.name}</div>
                        {customer.phone && <div className="text-[11px] text-[#7A8299] font-mono truncate">{customer.phone}</div>}
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        {[
                          { href: '/account?tab=profile', icon: 'user',     label: 'Profile' },
                          { href: '/account?tab=orders',  icon: 'orders',   label: 'My Orders' },
                          { href: '/account?tab=profile&section=password', icon: 'key', label: 'Change Password' },
                          { href: '/wishlist',            icon: 'heart',    label: 'Wishlist' },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-[#1F2F4A] hover:bg-[#FFF5F8] hover:text-[#FF6FB1] transition-colors"
                          >
                            <AccountMenuIcon name={item.icon} />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout — separated */}
                      <div className="border-t border-[#FFE0EC] py-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            logoutCustomer();
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-[#9B2914] hover:bg-[#FBDED8] transition-colors"
                        >
                          <AccountMenuIcon name="logout" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile-only search bar (below the main header row) */}
          <div className="sm:hidden pb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQ.trim()) {
                  router.push(`/products?search=${encodeURIComponent(searchQ.trim())}`);
                }
              }}
              className="flex items-center bg-[#FFF5F8] border-2 border-[#FFD4E6] px-4 py-2.5 gap-3 rounded-full focus-within:border-[#FF6FB1] focus-within:bg-white transition-colors"
            >
              <svg className="w-4 h-4 text-[#FF6FB1] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search toys, brands, ages…"
                className="flex-1 bg-transparent text-sm text-[#1F2F4A] placeholder-[#B591A8] outline-none min-w-0 font-medium"
              />
            </form>
          </div>
        </div>

        {/* Nav bar */}
        <nav
          ref={navRef}
          className="hidden lg:block border-t border-[#FFE0EC] bg-white relative"
          onMouseLeave={closeMega}
        >
          <div className="max-w-[1360px] mx-auto px-8">
            <ul className="flex items-center justify-center gap-1">
              {(nav || []).filter((item) => item.label?.trim().toLowerCase() !== 'brands').map((item) => {
                const slug = catSlug(item.link);
                const cat = slug && catMap ? catMap.get(slug) : null;
                const hasMega = (cat?.children?.length ?? 0) > 0;
                const isOpen = megaOpen === item._id;

                return (
                  <li key={item._id}
                      onMouseEnter={() => hasMega ? openMega(item._id) : closeMega()}>
                    <Link
                      href={item.link}
                      onClick={() => setMegaOpen(null)}
                      className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-semibold transition-all whitespace-nowrap rounded-full mx-0.5 my-1"
                      style={{
                        color: isOpen ? '#FF6FB1' : '#1F2F4A',
                        background: isOpen ? '#FFE0EC' : 'transparent',
                      }}
                    >
                      {item.label}
                      {item.badge && (
                        <span className={`text-[9px] text-white px-1.5 py-0.5 rounded-md font-extrabold tracking-wider uppercase ${item.badge === 'SALE' ? 'bg-[#FF6FB1]' : 'bg-[#FF5B6E]'}`}>
                          {item.badge}
                        </span>
                      )}
                      {hasMega && (
                        <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mega panel */}
          {megaOpen && megaCat && megaCat.children?.length ? (
            <div onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)} onMouseLeave={closeMega}>
              <MegaMenu cat={megaCat} onClose={() => setMegaOpen(null)} />
            </div>
          ) : null}
        </nav>
      </header>
    </>
  );
}

/* ── Small icon set for the account dropdown menu ── */
function AccountMenuIcon({ name }: { name: string }) {
  const common = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'shrink-0' };
  switch (name) {
    case 'user':
      return (<svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
    case 'orders':
      return (<svg {...common}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>);
    case 'key':
      return (<svg {...common}><circle cx="8" cy="15" r="4" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" /></svg>);
    case 'heart':
      return (<svg {...common}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
    case 'logout':
      return (<svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
    default:
      return null;
  }
}
