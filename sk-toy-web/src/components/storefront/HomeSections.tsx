'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HomeSection } from '@/types';
import { imgUrl } from '@/lib/utils';
import ProductCard from './ProductCard';

export default function HomeSections({ sections }: { sections: HomeSection[] }) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case 'hero':        return <HeroSection key={section._id} section={section} />;
          case 'categories':  return <CategoriesSection key={section._id} section={section} />;
          case 'ages':        return <AgesSection key={section._id} section={section} />;
          case 'products':    return <ProductsSection key={section._id} section={section} />;
          case 'editorial_band': return <EditorialBand key={section._id} section={section} />;
          case 'journal':     return <JournalSection key={section._id} section={section} />;
          case 'newsletter':  return null;
          case 'banner':      return <BannerSection key={section._id} section={section} />;
          default:            return null;
        }
      })}
    </>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
const HERO_CARD_META = [
  { rot: '-6deg', pos: 'top-0 left-[2%]',         tint: '#FFE0EC' },
  { rot: '5deg',  pos: 'top-[4%] right-0',        tint: '#FFEDB6' },
  { rot: '4deg',  pos: 'bottom-0 left-[12%]',     tint: '#D7F5E2' },
  { rot: '-8deg', pos: 'bottom-[6%] right-[6%]',  tint: '#D4EEF7' },
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop',
];

const DEFAULT_STATS = [
  { num: '1,200+', label: 'Happy Toys' },
  { num: '64',     label: 'Brands' },
  { num: '7-day',  label: 'Easy Returns' },
];

function HeroSection({ section }: { section: HomeSection }) {
  const banner = (section as any).banner;

  const title           = banner?.title          || 'Play Safe, Grow Happy!';
  const eyebrow         = banner?.eyebrow        || "Hand-picked toys · Made for little adventurers";
  const subtitle        = banner?.subtitle       || "Carefully selected toys that support learning, comfort, and creativity. Bangladesh's friendliest toy house — thousands of toys, 64 trusted brands.";
  const cta             = banner?.cta            || 'Shop new arrivals';
  const ctaLink         = banner?.ctaLink        || '/products';
  const secondaryCta    = banner?.secondaryCta   || 'Explore by age';
  const secondaryCtaLink = banner?.secondaryCtaLink || '/categories/shop-by-age';
  const badgeTopLine    = banner?.badgeTopLine   || 'Up to';
  const badgeValue      = banner?.badgeValue     || '40%';
  const badgeBottomLine = banner?.badgeBottomLine || 'off sale';

  const stats: { num: string; label: string }[] =
    banner?.stats?.length ? banner.stats : DEFAULT_STATS;

  const heroImages: string[] = (() => {
    const imgs: string[] = banner?.heroImages || [];
    return HERO_CARD_META.map((_, i) => imgs[i] || FALLBACK_IMAGES[i]);
  })();

  return (
    <section className="relative overflow-hidden">
      {/* Soft pastel gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      {/* Decorative shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[120px] sm:w-[220px] h-[120px] sm:h-[220px] rounded-full bg-[#FFCB47] opacity-20 sm:opacity-30 blur-2xl -top-12 left-[6%]" />
        <div className="absolute w-[100px] sm:w-[180px] h-[100px] sm:h-[180px] rounded-full bg-[#FF6FB1] opacity-15 sm:opacity-25 blur-2xl top-[28%] left-[2%]" />
        <div className="absolute w-[140px] sm:w-[260px] h-[140px] sm:h-[260px] rounded-full bg-[#6BC8E6] opacity-15 sm:opacity-25 blur-3xl -top-10 -right-10" />
        <div className="absolute w-[100px] sm:w-[200px] h-[100px] sm:h-[200px] rounded-full bg-[#B093E8] opacity-15 sm:opacity-25 blur-2xl bottom-[-40px] right-[18%]" />
        {/* Sprinkle of dots — hidden on mobile */}
        <div className="hidden sm:block absolute w-3 h-3 rounded-full bg-[#FF6FB1] top-[18%] left-[42%]" />
        <div className="hidden sm:block absolute w-2.5 h-2.5 rounded-full bg-[#4FC081] top-[58%] left-[38%]" />
        <div className="hidden sm:block absolute w-2 h-2 rounded-full bg-[#FFCB47] top-[34%] right-[40%]" />
        <div className="hidden sm:block absolute w-3 h-3 rounded-full bg-[#6BC8E6] bottom-[18%] left-[18%]" />
      </div>

      <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 sm:gap-6 lg:gap-10 py-6 sm:py-5 lg:py-6 items-center">
          {/* Left */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm text-[#FF6FB1] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 border border-[#FFD4E6] shadow-soft">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#FF6FB1] inline-block animate-pulse" />
              {eyebrow}
            </div>

            <h1 className="font-display text-[clamp(26px,6vw,56px)] font-bold leading-[1.1] tracking-tight mb-3 sm:mb-4 text-[#1F2F4A]">
              {title.split(',').map((part: string, i: number, arr: string[]) => (
                <span key={i}>
                  {i === arr.length - 1 ? (
                    <span className="text-gradient-rainbow">{part.trim()}{i < arr.length - 1 ? ',' : ''}</span>
                  ) : (
                    <>{part}{i < arr.length - 1 ? ',' : ''}</>
                  )}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="text-[13px] sm:text-[15px] leading-relaxed text-[#5A5048] max-w-[500px] mx-auto lg:mx-0 mb-5 sm:mb-6 font-medium">{subtitle}</p>

            <div className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 flex-wrap">
              <Link href={ctaLink}
                className="inline-flex items-center gap-2 text-white font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[13px] sm:text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all"
                style={{ background: 'linear-gradient(135deg, #FF5B6E 0%, #FF6FB1 100%)', boxShadow: '0 12px 24px -10px rgba(255,91,110,.6)' }}>
                {cta}
                <span className="text-base">→</span>
              </Link>
              <Link href={secondaryCtaLink}
                className="inline-flex items-center gap-2 text-[#1F2F4A] bg-white border-2 border-[#FFD4E6] hover:border-[#FF6FB1] font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[13px] sm:text-sm transition-all">
                {secondaryCta}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-5 sm:gap-8 mt-5 pt-3 border-t-2 border-dashed border-[#FFD4E6] max-w-[520px] mx-auto lg:mx-0">
              {stats.map((s, i) => {
                const colors = ['#FF6FB1', '#4FC081', '#6BC8E6'];
                return (
                  <div key={i} className="text-center lg:text-left">
                    <div className="font-display text-[20px] sm:text-[26px] font-bold leading-none mb-1"
                         style={{ color: colors[i % colors.length] }}>{s.num}</div>
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#7A8299] font-bold">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — stacked image cards */}
          <div className="relative aspect-[5/4] hidden lg:block overflow-hidden max-w-[460px] w-full mx-auto">
            {HERO_CARD_META.map((card, i) => (
              <div key={i}
                className={`absolute w-[54%] aspect-square rounded-[28px] overflow-hidden shadow-[0_22px_44px_-14px_rgba(31,47,74,0.25)] border-4 border-white animate-float ${card.pos}`}
                style={{ transform: `rotate(${card.rot})`, background: card.tint, animationDelay: `${i * 0.4}s`, ['--r' as any]: card.rot }}>
                <Image
                  src={heroImages[i].startsWith('http') ? heroImages[i] : imgUrl(heroImages[i])}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="30vw"
                />
              </div>
            ))}
            {/* Center sticker */}
            <div className="absolute top-[42%] left-[42%] -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full bg-white flex flex-col items-center justify-center text-center z-10 shadow-[0_18px_36px_-10px_rgba(255,91,110,.4)] border-4 border-dashed border-[#FF6FB1] -rotate-12">
              <span className="font-display text-[9px] font-bold tracking-[.16em] text-[#7A8299] uppercase">{badgeTopLine}</span>
              <span className="font-display text-[32px] font-bold leading-none text-gradient-rainbow">{badgeValue}</span>
              <span className="text-[10px] text-[#1F2F4A] font-bold uppercase tracking-wider">{badgeBottomLine}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Soft fade-out to blend with the page background (no hard seam) */}
      <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
           style={{ background: 'linear-gradient(180deg, rgba(255,248,242,0) 0%, rgba(255,248,242,0.6) 60%, rgba(255,248,242,0.95) 100%)' }} />
    </section>
  );
}

/* ─── Categories ─────────────────────────────────────────────────────────── */
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
  'shop-by-age':              '👶',
  'cars-vehicles':            '🚗',
  'baby-toddler':             '🧸',
  'educational':              '🧠',
  'electronic-entertainment': '🎮',
  'dolls-figures':            '🪆',
  'books-learning':           '📚',
  'combo-gift-sets':          '🎁',
};

function CategoriesSection({ section }: { section: HomeSection }) {
  const cats = (section as any).categories || [];
  const len = cats.length;

  // Layout shifts so 1–3 cards never look stranded in a left-aligned grid
  const layoutClass = len === 0
    ? ''
    : len <= 3
      ? 'flex flex-wrap justify-center gap-5 sm:gap-6'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5';

  return (
    <section className="pt-4 sm:pt-6 pb-14 sm:pb-16 relative overflow-hidden">
      {/* Soft background blobs to add visual energy when the row is short */}
      {len > 0 && len <= 3 && (
        <>
          <div className="absolute top-1/2 -left-12 w-[200px] h-[200px] rounded-full bg-[#FFCB47] opacity-15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-12 w-[220px] h-[220px] rounded-full bg-[#6BC8E6] opacity-15 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 relative">
        <SectionHead section={section} />
        {len === 0 ? null : (
          <div className={`${layoutClass} mt-8`}>
            {cats.map((cat: any, i: number) => {
              const tint = CAT_TINTS[i % CAT_TINTS.length];
              const icon = cat.icon || CAT_ICONS[cat.slug] || '🧸';
              const subNames = cat.tag || (cat.children || []).slice(0, 3).map((c: any) => c.name || c).join(', ');
              const href = cat.link || `/categories/${cat.slug}`;
              const childCount = (cat.children || []).length;
              const cardSizeClass = len <= 3 ? 'w-full sm:w-[280px]' : '';

              return (
                <Link
                  key={String(cat._id)}
                  href={href}
                  className={`${cardSizeClass} group relative flex flex-col items-center text-center p-6 pb-5 rounded-[28px] border-2 border-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-1.5deg] hover:shadow-[0_28px_56px_-22px_var(--dot)]`}
                  style={{
                    background: `linear-gradient(160deg, #FFFFFF 0%, ${tint.bg} 100%)`,
                    ['--dot' as any]: tint.dot,
                    boxShadow: `0 10px 24px -14px ${tint.dot}80`,
                  }}
                >
                  {/* Decorative confetti */}
                  <span className="pointer-events-none absolute inset-0" aria-hidden>
                    <span className="absolute top-3 right-3 text-sm opacity-60">✨</span>
                    <span className="absolute top-8 right-10 w-1.5 h-1.5 rounded-full" style={{ background: tint.dot, opacity: 0.45 }} />
                    <span className="absolute bottom-7 left-3 w-2 h-2 rounded-full" style={{ background: tint.dot, opacity: 0.35 }} />
                    <span className="absolute top-12 left-4 w-1 h-1 rounded-full" style={{ background: tint.dot, opacity: 0.55 }} />
                    <span className="absolute bottom-12 right-5 w-1.5 h-1.5 rounded-full" style={{ background: tint.dot, opacity: 0.4 }} />
                  </span>

                  {/* Icon — concentric rings for a sticker feel */}
                  <div className="relative mb-4">
                    {/* Outer dashed ring (rotates on hover) */}
                    <div
                      className="absolute -inset-2 rounded-full border-2 border-dashed opacity-50 group-hover:rotate-[120deg] transition-transform duration-[900ms]"
                      style={{ borderColor: tint.dot }}
                    />
                    {/* Tinted disc */}
                    <div
                      className="relative w-[112px] h-[112px] rounded-full flex items-center justify-center text-[46px] group-hover:scale-110 transition-transform duration-300 border-[6px] border-white"
                      style={{ background: tint.bg, boxShadow: `0 14px 28px -10px ${tint.dot}` }}
                    >
                      {cat.image
                        ? <Image src={imgUrl(cat.image)} alt={cat.name} width={72} height={72} className="object-contain" />
                        : <span>{icon}</span>}
                    </div>
                    {/* Sub-count chip */}
                    {childCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 text-[10px] font-extrabold text-white rounded-full min-w-[22px] h-[22px] px-1.5 inline-flex items-center justify-center border-2 border-white"
                        style={{ background: tint.dot, boxShadow: `0 4px 10px -4px ${tint.dot}` }}
                      >
                        {childCount}
                      </span>
                    )}
                  </div>

                  <p className="font-display text-[16px] sm:text-[18px] font-bold text-[#1F2F4A] leading-tight">{cat.name}</p>
                  {subNames && (
                    <p className="mt-1.5 text-[12px] text-[#5A5048] leading-snug line-clamp-2 font-semibold max-w-[220px]">
                      {subNames}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Shop by Age ────────────────────────────────────────────────────────── */
const AGE_TILES = [
  { range: '0–2',  label: 'YEARS', sub: 'First rattles & soft toys',     href: '/products?age=age-0-2',  bg: '#FFE0EC', dot: '#FF6FB1', emoji: '🍼' },
  { range: '3–5',  label: 'YEARS', sub: 'Building & pretend play',       href: '/products?age=age-3-5',  bg: '#FFEDB6', dot: '#FFCB47', emoji: '🧩' },
  { range: '6–8',  label: 'YEARS', sub: 'STEM & outdoor adventure',      href: '/products?age=age-6-8',  bg: '#D7F5E2', dot: '#4FC081', emoji: '🎨' },
  { range: '9–12', label: 'YEARS', sub: 'RC, drones & strategy',         href: '/products?age=age-9-12', bg: '#D4EEF7', dot: '#6BC8E6', emoji: '🚁' },
  { range: '12+',  label: 'TEENS', sub: 'Tech, models & collectibles',   href: '/products?age=age-teen', bg: '#E5D9F8', dot: '#B093E8', emoji: '🎮' },
];

function AgesSection({ section }: { section: HomeSection }) {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {AGE_TILES.map((tile) => (
            <Link key={tile.range} href={tile.href}
              className="group relative rounded-[18px] sm:rounded-[24px] md:rounded-[28px] p-3 sm:p-5 md:p-6 text-left hover:-translate-y-1.5 hover:rotate-[-2deg] transition-all duration-200 overflow-hidden border-3 sm:border-4 border-white"
              style={{ background: tile.bg, boxShadow: `0 14px 28px -16px ${tile.dot}99` }}>
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 text-[40px] sm:text-[60px] md:text-[80px] opacity-25 group-hover:scale-110 transition-transform">{tile.emoji}</div>
              <div className="relative">
                <div className="font-display text-[28px] sm:text-[44px] md:text-[60px] font-bold leading-[0.85] tracking-tighter mb-1.5 sm:mb-3 text-[#1F2F4A]">
                  {tile.range}
                </div>
                <div className="text-[10px] uppercase tracking-[.16em] font-extrabold mb-1.5" style={{ color: tile.dot }}>{tile.label}</div>
                <div className="text-[12px] sm:text-[13px] font-semibold text-[#1F2F4A]/80">{tile.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Products ───────────────────────────────────────────────────────────── */
const PRODUCT_BG_BANDS = [
  '',                                  // first products section: plain page
  'bg-[#FFF5F8]',                       // pinkish wash
  'bg-[#F4FBF7]',                       // mintish wash
  'bg-[#F2F9FD]',                       // sky wash
];

function ProductsSection({ section }: { section: HomeSection }) {
  const products = section.products || [];
  // Use section title hash to vary background subtly for visual rhythm
  let h = 0;
  for (const c of (section.title || section._id || '')) h = (h * 31 + c.charCodeAt(0)) | 0;
  const bandClass = PRODUCT_BG_BANDS[Math.abs(h) % PRODUCT_BG_BANDS.length];

  return (
    <section className={`pt-4 sm:pt-6 pb-14 sm:pb-16 relative ${bandClass}`}>
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 md:px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-5 mt-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Editorial Band ─────────────────────────────────────────────────────── */
type BandStyleConfig = {
  bg: string;
  ink: string;
  eyebrowInk: string;
  blobs: { color: string; opacity: number }[];
  rightCardBg: string;
};

const BAND_STYLES: Record<string, BandStyleConfig> = {
  yellow: {
    bg: 'linear-gradient(135deg, #FFEDB6 0%, #FFE0CB 60%, #FFD4E6 100%)',
    ink: '#1F2F4A',
    eyebrowInk: '#E5783A',
    blobs: [
      { color: '#FF6FB1', opacity: 0.25 },
      { color: '#4FC081', opacity: 0.20 },
      { color: '#6BC8E6', opacity: 0.22 },
    ],
    rightCardBg: 'rgba(255,255,255,.55)',
  },
  dark: {
    bg: 'linear-gradient(120deg, #6B2BB5 0%, #B93BA8 35%, #FF5B6E 70%, #FF9A4D 100%)',
    ink: '#FFFFFF',
    eyebrowInk: '#FFEDB6',
    blobs: [
      { color: '#FFCB47', opacity: 0.55 },
      { color: '#6BC8E6', opacity: 0.50 },
      { color: '#4FC081', opacity: 0.45 },
      { color: '#FFFFFF', opacity: 0.30 },
    ],
    rightCardBg: 'rgba(255,255,255,.18)',
  },
  coral: {
    bg: 'linear-gradient(135deg, #FFD4E6 0%, #FF6FB1 50%, #FF5B6E 100%)',
    ink: '#FFFFFF',
    eyebrowInk: '#FFEDB6',
    blobs: [
      { color: '#FFCB47', opacity: 0.30 },
      { color: '#FFFFFF', opacity: 0.20 },
      { color: '#B093E8', opacity: 0.22 },
    ],
    rightCardBg: 'rgba(255,255,255,.22)',
  },
  green: {
    bg: 'linear-gradient(135deg, #D4EEF7 0%, #4FC081 50%, #2D7A4A 100%)',
    ink: '#FFFFFF',
    eyebrowInk: '#FFEDB6',
    blobs: [
      { color: '#FFCB47', opacity: 0.25 },
      { color: '#FF6FB1', opacity: 0.20 },
      { color: '#FFFFFF', opacity: 0.18 },
    ],
    rightCardBg: 'rgba(255,255,255,.22)',
  },
};

const BLOB_POSITIONS = [
  { className: 'absolute -top-12 -left-10 w-[260px] h-[260px] rounded-full blur-2xl' },
  { className: 'absolute top-[55%] -left-16 w-[200px] h-[200px] rounded-full blur-2xl' },
  { className: 'absolute -bottom-10 left-[40%] w-[220px] h-[220px] rounded-full blur-2xl' },
  { className: 'absolute top-[10%] right-[30%] w-[160px] h-[160px] rounded-full blur-2xl' },
];

const BAND_CONFETTI = [
  { top: '12%',  left: '34%', size: 8,  color: '#FFCB47', shape: 'dot' },
  { top: '22%',  left: '6%',  size: 10, color: '#FFFFFF', shape: 'star' },
  { top: '70%',  left: '14%', size: 7,  color: '#6BC8E6', shape: 'dot' },
  { top: '40%',  left: '46%', size: 6,  color: '#FFFFFF', shape: 'dot' },
  { top: '82%',  left: '38%', size: 9,  color: '#4FC081', shape: 'star' },
  { top: '18%',  left: '52%', size: 5,  color: '#FFEDB6', shape: 'dot' },
  { top: '54%',  left: '4%',  size: 11, color: '#FFFFFF', shape: 'star' },
];

function EditorialBand({ section }: { section: HomeSection }) {
  const style = BAND_STYLES[section.bandStyle || 'coral'] || BAND_STYLES.coral;
  const cardPalette = ['#FFCB47', '#FF6FB1', '#6BC8E6', '#4FC081'];
  const cardPatterns = [
    'repeating-linear-gradient(45deg, rgba(255,255,255,.35) 0 6px, transparent 6px 14px)',
    'radial-gradient(circle at 30% 30%, rgba(255,255,255,.45) 4px, transparent 5px), radial-gradient(circle at 70% 70%, rgba(255,255,255,.45) 4px, transparent 5px)',
    'repeating-linear-gradient(0deg, rgba(255,255,255,.35) 0 5px, transparent 5px 12px)',
    'radial-gradient(circle at 50% 50%, rgba(255,255,255,.45) 5px, transparent 6px)',
  ];

  return (
    <section className="py-6 px-4 sm:px-8 max-w-[1360px] mx-auto">
      <div className="rounded-[24px] sm:rounded-[36px] p-7 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center relative overflow-hidden shadow-[0_20px_60px_-20px_rgba(31,47,74,0.35)]"
           style={{ background: style.bg, color: style.ink }}>
        {/* Color blob layer */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {style.blobs.map((b, i) => (
            <div key={i}
                 className={BLOB_POSITIONS[i % BLOB_POSITIONS.length].className}
                 style={{ background: b.color, opacity: b.opacity }} />
          ))}
          {/* Confetti / sparkle scatter */}
          {BAND_CONFETTI.map((c, i) => (
            c.shape === 'star' ? (
              <svg key={i} viewBox="0 0 24 24" fill={c.color}
                   className="absolute animate-float drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                   style={{ top: c.top, left: c.left, width: c.size * 2, height: c.size * 2, animationDelay: `${i * 0.3}s` }}>
                <path d="M12 2 14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
              </svg>
            ) : (
              <span key={i}
                    className="absolute rounded-full animate-float"
                    style={{ top: c.top, left: c.left, width: c.size, height: c.size, background: c.color, opacity: 0.85, animationDelay: `${i * 0.4}s` }} />
            )
          ))}
        </div>

        <div className="relative">
          {section.eyebrow && (
            <p className="font-display text-[12px] uppercase tracking-[.18em] font-bold mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
               style={{ color: style.eyebrowInk, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}>
              <span aria-hidden>✨</span> {section.eyebrow}
            </p>
          )}
          <h2 className="font-display text-[32px] sm:text-[48px] lg:text-[60px] font-bold leading-[0.95] tracking-tight mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
            {section.title}
          </h2>
          {section.bandText && (
            <p className="text-[16px] opacity-95 max-w-[500px] mb-6 font-medium">{section.bandText}</p>
          )}
          {section.bandButtons && section.bandButtons.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {section.bandButtons.map((btn, i) => {
                const isDark   = btn.style === 'dark';
                const isCoral  = btn.style === 'coral';
                const isOutline = btn.style === 'outline';
                return (
                  <Link key={i} href={btn.link}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 hover:scale-[1.03] ${
                      isDark   ? 'bg-[#1F2F4A] text-white hover:bg-black shadow-lg' :
                      isCoral  ? 'text-white shadow-soft-coral' :
                      isOutline ? 'bg-white/15 backdrop-blur-sm border-2 border-white/70 text-white hover:bg-white/25' :
                      'bg-white text-[#1F2F4A] hover:bg-white shadow-soft'
                    }`}
                    style={isCoral ? { background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)', boxShadow: '0 10px 24px -8px rgba(255,91,110,0.6)' } : undefined}>
                    {btn.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — playful colored card cluster */}
        <div className="relative aspect-[16/10] hidden lg:block">
          <div className="absolute inset-3 rounded-[24px] backdrop-blur-sm"
               style={{ background: style.rightCardBg, border: '1px solid rgba(255,255,255,.35)' }} />

          {/* Floating cards with playful patterns */}
          {[
            { pos: 'top-[10%] left-[8%]',     w: '30%', h: '38%', rot: '-7deg', delay: '0s' },
            { pos: 'top-[6%] right-[10%]',    w: '34%', h: '44%', rot: '6deg',  delay: '0.5s' },
            { pos: 'bottom-[8%] left-[20%]',  w: '36%', h: '40%', rot: '4deg',  delay: '1s' },
            { pos: 'bottom-[12%] right-[6%]', w: '26%', h: '34%', rot: '-5deg', delay: '1.5s' },
          ].map((card, i) => (
            <div key={i}
                 className={`absolute ${card.pos} rounded-2xl shadow-xl animate-float border-4 border-white overflow-hidden`}
                 style={{ width: card.w, height: card.h, transform: `rotate(${card.rot})`, background: cardPalette[i], animationDelay: card.delay, ['--r' as any]: card.rot }}>
              <div className="absolute inset-0 mix-blend-overlay" style={{ backgroundImage: cardPatterns[i], backgroundSize: i === 1 ? '24px 24px' : i === 3 ? '20px 20px' : 'auto' }} />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/80 shadow-md" />
            </div>
          ))}

          {/* Center sparkle medallion */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-dashed border-[#FF6FB1] -rotate-12 animate-spin-slow">
            <div className="absolute inset-2 rounded-full" style={{ background: 'conic-gradient(from 0deg, #FFEDB6, #FFD4E6, #D4EEF7, #D7F5E2, #FFEDB6)', opacity: 0.5 }} />
            <svg className="relative w-10 h-10 text-[#FF5B6E]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2 14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
            </svg>
          </div>

          {/* Mini orbiting dots */}
          <span className="absolute top-[18%] left-[44%] w-3 h-3 rounded-full bg-[#FFCB47] shadow-md animate-float" style={{ animationDelay: '0.2s' }} />
          <span className="absolute bottom-[22%] right-[36%] w-2.5 h-2.5 rounded-full bg-[#6BC8E6] shadow-md animate-float" style={{ animationDelay: '0.9s' }} />
          <span className="absolute top-[46%] right-[18%] w-2 h-2 rounded-full bg-white shadow-md animate-float" style={{ animationDelay: '1.4s' }} />
        </div>
      </div>
    </section>
  );
}

/* ─── Journal ────────────────────────────────────────────────────────────── */
function JournalSection({ section }: { section: HomeSection }) {
  const posts = section.posts || [];
  const tints = ['#FFE0EC', '#FFEDB6', '#D7F5E2'];
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {posts.map((post, i) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
              <div className="aspect-[4/3] rounded-[22px] overflow-hidden mb-4 relative border-4 border-white shadow-soft" style={{ background: tints[i % tints.length] }}>
                {post.coverImage && (
                  <Image src={imgUrl(post.coverImage)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                )}
              </div>
              <p className="text-[11px] uppercase tracking-[.14em] mb-1.5 font-bold">
                <span className="text-[#FF6FB1] mr-2">{post.category}</span>
                <span className="text-[#7A8299]">{post.readTime}</span>
              </p>
              <h3 className="font-display text-[22px] font-bold leading-snug tracking-tight group-hover:text-[#FF6FB1] transition-colors mb-2 text-[#1F2F4A]">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-[14px] text-[#5A5048] leading-relaxed line-clamp-2 font-medium">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Banner (strip/promo) ───────────────────────────────────────────────── */
function BannerSection({ section }: { section: HomeSection }) {
  const banner = (section as any).banner;
  if (!banner) return null;
  return (
    <section className="py-0 text-white"
             style={{ background: 'linear-gradient(90deg, #FF6FB1 0%, #FF9A4D 50%, #FFCB47 100%)' }}>
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-3">
        <p className="text-center text-sm font-bold tracking-wide">
          ✨ {banner.title} ✨
        </p>
      </div>
    </section>
  );
}

/* ─── Section header ─────────────────────────────────────────────────────── */
function SectionHead({ section }: { section: HomeSection }) {
  if (!section.title && !section.eyebrow) return null;

  // Highlight the last word of the title with the rainbow gradient
  const titleWords = (section.title || '').trim().split(/\s+/);
  const titleLead = titleWords.slice(0, -1).join(' ');
  const titleAccent = titleWords[titleWords.length - 1] || '';

  return (
    <div>
      {section.eyebrow && (
        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[9.5px] sm:text-[10.5px] font-extrabold uppercase tracking-[.12em] sm:tracking-[.16em] text-[#E0539B] mb-2 sm:mb-3"
              style={{ background: 'linear-gradient(135deg, #FFE0EC 0%, #FFEDB6 100%)', border: '1px solid #FFD4E6' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6FB1] animate-pulse" />
          {section.eyebrow}
        </span>
      )}
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {section.title && (
          <h2 className="font-display text-[20px] sm:text-[28px] md:text-[36px] font-bold leading-[1.15] tracking-tight text-[#1F2F4A] min-w-0">
            {titleWords.length > 1 && <>{titleLead} </>}
            <span className="relative inline-block">
              <span className="text-[#FF5B6E]">{titleAccent}</span>
              <span aria-hidden
                    className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full"
                    style={{ background: '#FF5B6E', opacity: 0.35 }} />
            </span>
          </h2>
        )}
        {section.ctaLink && (
          <Link href={section.ctaLink}
            className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 text-white text-[11px] sm:text-sm font-bold px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full transition-all hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #FF5B6E 0%, #FF6FB1 100%)', boxShadow: '0 10px 22px -10px rgba(255,91,110,.55)' }}>
            {section.ctaLabel || 'See all'}
            <span className="inline-flex w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/25 items-center justify-center text-[10px] sm:text-xs leading-none">→</span>
          </Link>
        )}
      </div>
      {section.subtitle && (
        <p className="text-[12px] sm:text-[14px] text-[#5A5048] mt-2 sm:mt-3 max-w-[460px] font-medium leading-relaxed">{section.subtitle}</p>
      )}
    </div>
  );
}
