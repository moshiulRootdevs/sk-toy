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
        <div className="absolute w-[220px] h-[220px] rounded-full bg-[#FFCB47] opacity-30 blur-2xl -top-12 left-[6%]" />
        <div className="absolute w-[180px] h-[180px] rounded-full bg-[#FF6FB1] opacity-25 blur-2xl top-[28%] left-[2%]" />
        <div className="absolute w-[260px] h-[260px] rounded-full bg-[#6BC8E6] opacity-25 blur-3xl -top-10 -right-10" />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-[#B093E8] opacity-25 blur-2xl bottom-[-40px] right-[18%]" />
        {/* Sprinkle of dots */}
        <div className="absolute w-3 h-3 rounded-full bg-[#FF6FB1] top-[18%] left-[42%]" />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#4FC081] top-[58%] left-[38%]" />
        <div className="absolute w-2 h-2 rounded-full bg-[#FFCB47] top-[34%] right-[40%]" />
        <div className="absolute w-3 h-3 rounded-full bg-[#6BC8E6] bottom-[18%] left-[18%]" />
      </div>

      <div className="relative max-w-[1360px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 py-16 lg:py-24 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-[#FF6FB1] px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-[#FFD4E6] shadow-soft">
              <span className="w-2 h-2 rounded-full bg-[#FF6FB1] inline-block animate-pulse" />
              {eyebrow}
            </div>

            <h1 className="font-display text-[clamp(30px,8vw,84px)] font-bold leading-[1.05] tracking-tight mb-5 sm:mb-6 text-[#1F2F4A] break-words">
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

            <p className="text-[14px] sm:text-[16px] md:text-[17px] leading-relaxed text-[#5A5048] max-w-[500px] mb-7 sm:mb-9 font-medium">{subtitle}</p>

            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <Link href={ctaLink}
                className="inline-flex items-center gap-2 text-white font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all"
                style={{ background: 'linear-gradient(135deg, #FF5B6E 0%, #FF6FB1 100%)', boxShadow: '0 12px 24px -10px rgba(255,91,110,.6)' }}>
                {cta}
                <span className="text-base">→</span>
              </Link>
              <Link href={secondaryCtaLink}
                className="inline-flex items-center gap-2 text-[#1F2F4A] bg-white border-2 border-[#FFD4E6] hover:border-[#FF6FB1] font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm transition-all">
                {secondaryCta}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 sm:gap-9 mt-10 pt-6 border-t-2 border-dashed border-[#FFD4E6] max-w-[520px]">
              {stats.map((s, i) => {
                const colors = ['#FF6FB1', '#4FC081', '#6BC8E6'];
                return (
                  <div key={i}>
                    <div className="font-display text-[28px] sm:text-[34px] font-bold leading-none mb-1.5"
                         style={{ color: colors[i % colors.length] }}>{s.num}</div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#7A8299] font-bold">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — stacked image cards */}
          <div className="relative aspect-square hidden lg:block overflow-hidden">
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
            <div className="absolute top-[42%] left-[42%] -translate-x-1/2 -translate-y-1/2 w-[124px] h-[124px] rounded-full bg-white flex flex-col items-center justify-center text-center z-10 shadow-[0_18px_36px_-10px_rgba(255,91,110,.4)] border-4 border-dashed border-[#FF6FB1] -rotate-12">
              <span className="font-display text-[10px] font-bold tracking-[.16em] text-[#7A8299] uppercase">{badgeTopLine}</span>
              <span className="font-display text-[40px] font-bold leading-none text-gradient-rainbow">{badgeValue}</span>
              <span className="text-[11px] text-[#1F2F4A] font-bold uppercase tracking-wider">{badgeBottomLine}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wavy bottom edge */}
      <svg className="absolute bottom-0 left-0 right-0 w-full h-14 text-[#FFF8F2]" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none" aria-hidden>
        <path d="M0 30 Q 120 60 240 30 T 480 30 T 720 30 T 960 30 T 1200 30 T 1440 30 V60 H0 Z" />
      </svg>
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
    <section className="py-14 sm:py-16 relative overflow-hidden">
      {/* Soft background blobs to add visual energy when the row is short */}
      {len > 0 && len <= 3 && (
        <>
          <div className="absolute top-1/2 -left-12 w-[200px] h-[200px] rounded-full bg-[#FFCB47] opacity-15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-12 w-[220px] h-[220px] rounded-full bg-[#6BC8E6] opacity-15 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="max-w-[1360px] mx-auto px-6 sm:px-8 relative">
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
  { range: '0–2',  label: 'YEARS', sub: 'First rattles & soft toys',     href: '/products?age=0-2',  bg: '#FFE0EC', dot: '#FF6FB1', emoji: '🍼' },
  { range: '3–5',  label: 'YEARS', sub: 'Building & pretend play',       href: '/products?age=3-5',  bg: '#FFEDB6', dot: '#FFCB47', emoji: '🧩' },
  { range: '6–8',  label: 'YEARS', sub: 'STEM & outdoor adventure',      href: '/products?age=6-8',  bg: '#D7F5E2', dot: '#4FC081', emoji: '🎨' },
  { range: '9–12', label: 'YEARS', sub: 'RC, drones & strategy',         href: '/products?age=9-12', bg: '#D4EEF7', dot: '#6BC8E6', emoji: '🚁' },
  { range: '12+',  label: 'TEENS', sub: 'Tech, models & collectibles',   href: '/products?age=teen', bg: '#E5D9F8', dot: '#B093E8', emoji: '🎮' },
];

function AgesSection({ section }: { section: HomeSection }) {
  return (
    <section className="py-14 sm:py-16">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {AGE_TILES.map((tile) => (
            <Link key={tile.range} href={tile.href}
              className="group relative rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 text-left hover:-translate-y-1.5 hover:rotate-[-2deg] transition-all duration-200 overflow-hidden border-4 border-white"
              style={{ background: tile.bg, boxShadow: `0 14px 28px -16px ${tile.dot}99` }}>
              <div className="absolute -top-4 -right-4 text-[60px] sm:text-[80px] opacity-25 group-hover:scale-110 transition-transform">{tile.emoji}</div>
              <div className="relative">
                <div className="font-display text-[44px] sm:text-[60px] font-bold leading-[0.85] tracking-tighter mb-2 sm:mb-3 text-[#1F2F4A]">
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
    <section className={`py-14 sm:py-16 relative ${bandClass}`}>
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-5 mt-8">
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
    bg: 'linear-gradient(135deg, #2A1F4A 0%, #1F2F4A 50%, #243556 100%)',
    ink: '#FFFFFF',
    eyebrowInk: '#FFCB47',
    blobs: [
      { color: '#FF6FB1', opacity: 0.30 },
      { color: '#FFCB47', opacity: 0.20 },
      { color: '#6BC8E6', opacity: 0.22 },
      { color: '#B093E8', opacity: 0.20 },
    ],
    rightCardBg: 'rgba(255,255,255,.10)',
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

function EditorialBand({ section }: { section: HomeSection }) {
  const style = BAND_STYLES[section.bandStyle || 'coral'] || BAND_STYLES.coral;

  return (
    <section className="py-6 px-4 sm:px-8 max-w-[1360px] mx-auto">
      <div className="rounded-[24px] sm:rounded-[36px] p-7 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center relative overflow-hidden"
           style={{ background: style.bg, color: style.ink }}>
        {/* Color blob layer */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {style.blobs.map((b, i) => (
            <div key={i}
                 className={BLOB_POSITIONS[i % BLOB_POSITIONS.length].className}
                 style={{ background: b.color, opacity: b.opacity }} />
          ))}
        </div>

        <div className="relative">
          {section.eyebrow && (
            <p className="font-display text-[12px] uppercase tracking-[.18em] font-bold mb-3"
               style={{ color: style.eyebrowInk }}>
              ✨ {section.eyebrow}
            </p>
          )}
          <h2 className="font-display text-[32px] sm:text-[48px] lg:text-[60px] font-bold leading-[0.95] tracking-tight mb-4">
            {section.title}
          </h2>
          {section.bandText && (
            <p className="text-[16px] opacity-90 max-w-[500px] mb-6 font-medium">{section.bandText}</p>
          )}
          {section.bandButtons && section.bandButtons.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {section.bandButtons.map((btn, i) => {
                const isDark   = btn.style === 'dark';
                const isCoral  = btn.style === 'coral';
                const isOutline = btn.style === 'outline';
                return (
                  <Link key={i} href={btn.link}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 ${
                      isDark   ? 'bg-[#1F2F4A] text-white hover:bg-black' :
                      isCoral  ? 'text-white shadow-soft-coral' :
                      isOutline ? 'bg-transparent border-2 border-current opacity-90 hover:opacity-100' :
                      'bg-white text-[#1F2F4A] hover:bg-white shadow-soft'
                    }`}
                    style={isCoral ? { background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)' } : undefined}>
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
               style={{ background: style.rightCardBg, border: '1px solid rgba(255,255,255,.25)' }} />
          <div className="absolute top-[12%] left-[10%] w-[28%] h-[36%] rounded-2xl rotate-[-6deg] shadow-lg animate-float border-4 border-white"
               style={{ background: '#FFCB47', animationDelay: '0s', ['--r' as any]: '-6deg' }} />
          <div className="absolute top-[8%] right-[12%] w-[32%] h-[42%] rounded-2xl rotate-[5deg] shadow-lg animate-float border-4 border-white"
               style={{ background: '#FF6FB1', animationDelay: '0.5s', ['--r' as any]: '5deg' }} />
          <div className="absolute bottom-[10%] left-[22%] w-[34%] h-[38%] rounded-2xl rotate-[3deg] shadow-lg animate-float border-4 border-white"
               style={{ background: '#6BC8E6', animationDelay: '1s', ['--r' as any]: '3deg' }} />
          <div className="absolute bottom-[14%] right-[8%] w-[24%] h-[32%] rounded-2xl rotate-[-4deg] shadow-lg animate-float border-4 border-white"
               style={{ background: '#4FC081', animationDelay: '1.5s', ['--r' as any]: '-4deg' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-dashed border-[#FF6FB1] -rotate-12">
            <svg className="w-9 h-9 text-[#FF6FB1]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2 14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
            </svg>
          </div>
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
      <div className="max-w-[1360px] mx-auto px-6 sm:px-8">
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
  return (
    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div>
        {section.eyebrow && (
          <p className="eyebrow mb-2">✨ {section.eyebrow}</p>
        )}
        {section.title && (
          <h2 className="font-display text-[36px] sm:text-[44px] font-bold leading-tight tracking-tight text-[#1F2F4A]">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-[14px] text-[#7A8299] mt-2 max-w-[420px] font-medium">{section.subtitle}</p>
        )}
      </div>
      {section.ctaLink && (
        <Link href={section.ctaLink}
          className="shrink-0 inline-flex items-center gap-2 bg-white border-2 border-[#FFD4E6] text-[#FF6FB1] text-sm font-bold px-5 py-2.5 rounded-full hover:border-[#FF6FB1] hover:bg-[#FFF5F8] transition-all">
          {section.ctaLabel || 'See all'} <span>→</span>
        </Link>
      )}
    </div>
  );
}
