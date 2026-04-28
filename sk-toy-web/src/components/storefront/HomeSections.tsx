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
          case 'brands':      return <BrandsSection key={section._id} section={section} />;
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
  { rot: '-6deg', pos: 'top-0 left-[2%]' },
  { rot: '5deg',  pos: 'top-[4%] right-0' },
  { rot: '4deg',  pos: 'bottom-0 left-[12%]' },
  { rot: '-8deg', pos: 'bottom-[6%] right-[6%]' },
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop',
];

const DEFAULT_STATS = [
  { num: '64+',    label: 'Trusted Brands' },
  { num: '1,200+', label: 'Products' },
  { num: '7-day',  label: 'Easy Returns' },
];

function HeroSection({ section }: { section: HomeSection }) {
  const banner = (section as any).banner;

  const title           = banner?.title          || 'Big smiles, handpicked toys.';
  const eyebrow         = banner?.eyebrow        || "Spring '26 · Making childhood more joyful";
  const subtitle        = banner?.subtitle       || "Bangladesh's friendliest toy house. Thousands of toys from 64 trusted brands.";
  const cta             = banner?.cta            || 'Shop new arrivals';
  const ctaLink         = banner?.ctaLink        || '/products';
  const secondaryCta    = banner?.secondaryCta   || 'Read the journal';
  const secondaryCtaLink = banner?.secondaryCtaLink || '/blog';
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
    <section className="relative overflow-hidden bg-[#EC5D4A] text-[#FFFBF2]">
      {/* Decorative shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[180px] h-[180px] rounded-full bg-[#F5C443] opacity-20 -top-10 left-[8%]" />
        <div className="absolute w-[90px]  h-[90px]  rounded-full bg-[#4FA36A] opacity-20 top-[30%] left-[3%]" />
        <div className="absolute w-[60px]  h-[60px]  rounded-full bg-[#6FB8D9] opacity-20 bottom-[18%] left-[24%]" />
        <div className="absolute w-[220px] h-[220px] rounded-full bg-[#FFFBF2] opacity-[0.07] -top-16 -right-10" />
        <div className="absolute w-[50px]  h-[50px]  rounded-full bg-[#F5C443] opacity-30 bottom-[22%] right-[48%]" />
        <div className="absolute w-[32px]  h-[32px]  rounded-full bg-[#FFFBF2] opacity-30 top-[42%] left-[40%]" />
        <div className="absolute w-[24px]  h-[24px]  rounded-full bg-[#4FA36A] opacity-50 top-[18%] left-[52%]" />
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 py-20 lg:py-24 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-[#FFFBF2] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#F5C443] inline-block" />
              {eyebrow}
            </div>

            <h1 className="text-[clamp(52px,7vw,88px)] font-semibold leading-[0.92] tracking-tight text-[#FFFBF2] mb-6"
                style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>
              {title}
            </h1>

            <p className="text-[18px] leading-relaxed text-[#FFFBF2]/85 max-w-[480px] mb-9">{subtitle}</p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link href={ctaLink}
                className="inline-flex items-center gap-2 bg-[#FFFBF2] text-[#EC5D4A] font-bold px-6 py-3 rounded-full text-sm shadow-[0_4px_0_0_rgba(0,0,0,.15)] hover:-translate-y-px hover:shadow-[0_5px_0_0_rgba(0,0,0,.15)] active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(0,0,0,.15)] transition-all">
                {cta}
              </Link>
              <Link href={secondaryCtaLink}
                className="inline-flex items-center gap-2 text-[#FFFBF2] border-2 border-[#FFFBF2]/40 hover:bg-white/10 hover:border-[#FFFBF2] font-semibold px-6 py-3 rounded-full text-sm transition-all">
                {secondaryCta}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-9 mt-11 pt-6 border-t border-[#FFFBF2]/20 max-w-[520px]">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="text-[34px] font-semibold leading-none text-[#FFFBF2] mb-1.5"
                       style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>{s.num}</div>
                  <div className="text-[11px] uppercase tracking-[0.1em] text-[#FFFBF2]/70 font-semibold"
                       style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stacked image cards */}
          <div className="relative aspect-square hidden lg:block overflow-hidden">
            {HERO_CARD_META.map((card, i) => (
              <div key={i}
                className={`absolute w-[54%] aspect-square rounded-[28px] overflow-hidden shadow-[0_16px_40px_-12px_rgba(0,0,0,.35)] ${card.pos}`}
                style={{ transform: `rotate(${card.rot})` }}>
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
            <div className="absolute top-[42%] left-[42%] -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full bg-[#FFFBF2] flex flex-col items-center justify-center text-center z-10 shadow-[0_12px_28px_-8px_rgba(0,0,0,.3)] border-4 border-dashed border-[#EC5D4A]/20 -rotate-12">
              <span className="text-[9px] font-bold tracking-[.15em] text-[#1F2F4A] uppercase"
                    style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>{badgeTopLine}</span>
              <span className="text-[36px] font-bold leading-none text-[#EC5D4A]"
                    style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>{badgeValue}</span>
              <span className="text-[11px] text-[#344463] font-semibold">{badgeBottomLine}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scallop bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
           style={{
             background: 'radial-gradient(circle at 24px -4px, #EC5D4A 24px, #FBF4E8 24.5px) 0 0 / 48px 48px repeat-x',
           }} />
      <div className="h-12" />
    </section>
  );
}

/* ─── Categories ─────────────────────────────────────────────────────────── */
const CAT_COLORS = ['#EC5D4A','#F5C443','#F39436','#4FA36A','#6FB8D9','#9C7BC9','#F28BA8','#EC5D4A','#4FA36A','#F39436','#6FB8D9','#F5C443'];
const CAT_ICONS: Record<string, string> = {
  'new-arrivals': '✦',
  'by-age':       '🎂',
  'by-gender':    '👧',
  'toys':         '🚗',
  'learning':     '📐',
  'baby':         '🍼',
  'outdoor':      '🌿',
  'brands':       '🏷',
  'sale':         '🏷',
  'clearance':    '📦',
  'damaged':      '🔖',
  'journal':      '📖',
};

function CategoriesSection({ section }: { section: HomeSection }) {
  const cats = (section as any).categories || [];
  return (
    <section className="py-16 bg-[#FBF4E8]">
      <div className="max-w-[1360px] mx-auto px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-8">
          {cats.map((cat: any, i: number) => {
            const color = cat.bgColor || CAT_COLORS[i % CAT_COLORS.length];
            const icon  = cat.icon || CAT_ICONS[cat.slug] || '🧸';
            const subNames = cat.tag || (cat.children || []).slice(0, 3).map((c: any) => c.name || c).join(', ');
            const href  = cat.link || `/categories/${cat.slug}`;
            return (
              <Link key={String(cat._id)} href={href}
                className="group flex flex-col items-center text-center p-5 bg-[#FFFBF2] border-2 border-[#E9DAB9] rounded-[18px] transition-all duration-200"
                style={{ '--tile-color': color } as React.CSSProperties}
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
                }}>
                <div
                  className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-[32px] mb-3 group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300"
                  style={{ background: color + '22' }}
                >
                  {cat.image
                    ? <Image src={imgUrl(cat.image)} alt={cat.name} width={48} height={48} className="object-contain" />
                    : <span>{icon}</span>}
                </div>
                <p className="text-[13px] font-[500] text-[#1F2F4A] leading-tight">{cat.name}</p>
                {subNames && (
                  <p className="mt-1 text-[11px] text-[#8B8176] leading-tight line-clamp-2">
                    {subNames}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Shop by Age ────────────────────────────────────────────────────────── */
const AGE_TILES = [
  { range: '0–2',  label: 'YEARS', sub: 'First rattles & soft toys', href: '/products?age=0-2', bg: '#F5E9D2', ink: '#1F2F4A' },
  { range: '3–5',  label: 'YEARS', sub: 'Building & pretend play',   href: '/products?age=3-5', bg: '#FBDDD7', ink: '#1F2F4A' },
  { range: '6–8',  label: 'YEARS', sub: 'STEM & outdoor adventure',  href: '/products?age=6-8', bg: '#D8EBDC', ink: '#1F2F4A' },
  { range: '9–12', label: 'YEARS', sub: 'RC, drones & strategy',     href: '/products?age=9-12', bg: '#CFE5EF', ink: '#1F2F4A' },
  { range: '12+',  label: 'TEENS', sub: 'Tech, models & collectibles', href: '/products?age=teen', bg: '#FBE7A8', ink: '#1F2F4A' },
];

function AgesSection({ section }: { section: HomeSection }) {
  return (
    <section className="py-16 bg-[#FBF4E8]">
      <div className="max-w-[1360px] mx-auto px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-8">
          {AGE_TILES.map((tile) => (
            <Link key={tile.range} href={tile.href}
              className="group rounded-[24px] p-7 text-left hover:-translate-y-1 hover:rotate-[-1deg] hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,.22)] transition-all duration-200 overflow-hidden"
              style={{ background: tile.bg, color: tile.ink }}>
              <div className="text-[72px] font-semibold leading-[0.85] tracking-tighter mb-3.5"
                   style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>
                {tile.range}
              </div>
              <div className="text-[10px] uppercase tracking-[.12em] opacity-60 font-bold mb-1"
                   style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>{tile.label}</div>
              <div className="text-[14px] font-semibold mt-2">{tile.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Products ───────────────────────────────────────────────────────────── */
function ProductsSection({ section }: { section: HomeSection }) {
  const products = section.products || [];
  return (
    <section className="py-16 bg-[#FBF4E8]">
      <div className="max-w-[1360px] mx-auto px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 mt-8">
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
    bg: 'linear-gradient(135deg, #F5C443 0%, #F39436 100%)',
    ink: '#1F2F4A',
    eyebrowInk: 'rgba(31,47,74,.65)',
    blobs: [
      { color: '#EC5D4A', opacity: 0.20 },
      { color: '#4FA36A', opacity: 0.18 },
      { color: '#6FB8D9', opacity: 0.20 },
    ],
    rightCardBg: 'rgba(255,255,255,.30)',
  },
  dark: {
    bg: 'linear-gradient(135deg, #243556 0%, #1F2F4A 50%, #2A1F4A 100%)',
    ink: '#FFFBF2',
    eyebrowInk: 'rgba(255,251,242,.65)',
    blobs: [
      { color: '#EC5D4A', opacity: 0.22 },
      { color: '#F5C443', opacity: 0.18 },
      { color: '#6FB8D9', opacity: 0.20 },
      { color: '#F28BA8', opacity: 0.16 },
    ],
    rightCardBg: 'rgba(255,255,255,.08)',
  },
  coral: {
    bg: 'linear-gradient(135deg, #F28BA8 0%, #EC5D4A 55%, #D14434 100%)',
    ink: '#FFFBF2',
    eyebrowInk: 'rgba(255,251,242,.75)',
    blobs: [
      { color: '#F5C443', opacity: 0.25 },
      { color: '#FFFBF2', opacity: 0.18 },
      { color: '#9C7BC9', opacity: 0.20 },
    ],
    rightCardBg: 'rgba(255,255,255,.18)',
  },
  green: {
    bg: 'linear-gradient(135deg, #6FB8D9 0%, #4FA36A 50%, #2D7A4A 100%)',
    ink: '#FBF4E8',
    eyebrowInk: 'rgba(251,244,232,.75)',
    blobs: [
      { color: '#F5C443', opacity: 0.20 },
      { color: '#F28BA8', opacity: 0.18 },
      { color: '#FFFBF2', opacity: 0.16 },
    ],
    rightCardBg: 'rgba(255,255,255,.18)',
  },
};

const BLOB_POSITIONS = [
  { className: 'absolute -top-12 -left-10 w-[260px] h-[260px] rounded-full blur-2xl' },
  { className: 'absolute top-[55%] -left-16 w-[180px] h-[180px] rounded-full blur-2xl' },
  { className: 'absolute -bottom-10 left-[40%] w-[200px] h-[200px] rounded-full blur-2xl' },
  { className: 'absolute top-[10%] right-[30%] w-[140px] h-[140px] rounded-full blur-2xl' },
];

function EditorialBand({ section }: { section: HomeSection }) {
  const style = BAND_STYLES[section.bandStyle || 'dark'] || BAND_STYLES.dark;

  return (
    <section className="py-6 px-8 max-w-[1360px] mx-auto">
      <div className="rounded-[32px] p-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative overflow-hidden"
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
            <p className="text-[11px] uppercase tracking-[.14em] font-medium mb-3"
               style={{ color: style.eyebrowInk, fontFamily: 'var(--font-mono-var, monospace)' }}>
              {section.eyebrow}
            </p>
          )}
          <h2 className="text-[52px] lg:text-[56px] font-semibold leading-[0.95] tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>
            {section.title}
          </h2>
          {section.bandText && (
            <p className="text-[16px] opacity-85 max-w-[480px] mb-6">{section.bandText}</p>
          )}
          {section.bandButtons && section.bandButtons.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {section.bandButtons.map((btn, i) => {
                const isDark   = btn.style === 'dark';
                const isCoral  = btn.style === 'coral';
                const isOutline = btn.style === 'outline';
                return (
                  <Link key={i} href={btn.link}
                    className={`px-6 py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                      isDark   ? 'bg-[#1F2F4A] text-[#FFFBF2] hover:bg-black' :
                      isCoral  ? 'bg-[#EC5D4A] text-white hover:bg-[#D14434] shadow-[0_4px_0_0_rgba(0,0,0,.18)]' :
                      isOutline ? 'bg-transparent border-2 border-current opacity-80 hover:opacity-100' :
                      'bg-[#FFFBF2] text-[#1F2F4A] hover:bg-white shadow-[0_4px_0_0_rgba(0,0,0,.18)]'
                    }`}>
                    {btn.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — playful colored card cluster */}
        <div className="relative aspect-[16/10] hidden lg:block">
          <div className="absolute inset-3 rounded-[18px] backdrop-blur-sm"
               style={{ background: style.rightCardBg, border: '1px solid rgba(255,255,255,.18)' }} />
          {/* Floating color tiles */}
          <div className="absolute top-[12%] left-[10%] w-[28%] h-[36%] rounded-2xl rotate-[-6deg] shadow-lg"
               style={{ background: '#F5C443' }} />
          <div className="absolute top-[8%] right-[12%] w-[32%] h-[42%] rounded-2xl rotate-[5deg] shadow-lg"
               style={{ background: '#EC5D4A' }} />
          <div className="absolute bottom-[10%] left-[22%] w-[34%] h-[38%] rounded-2xl rotate-[3deg] shadow-lg"
               style={{ background: '#6FB8D9' }} />
          <div className="absolute bottom-[14%] right-[8%] w-[24%] h-[32%] rounded-2xl rotate-[-4deg] shadow-lg"
               style={{ background: '#4FA36A' }} />
          {/* Center sticker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full bg-[#FFFBF2] flex items-center justify-center shadow-lg border-4 border-dashed border-[#EC5D4A]/30 -rotate-12"
               style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>
            <svg className="w-8 h-8 text-[#EC5D4A]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2 14.5 9.5 22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Brands ─────────────────────────────────────────────────────────────── */
function BrandsSection({ section }: { section: HomeSection }) {
  const brands = (section as any).brands || [];
  return (
    <section className="py-16 bg-[#FBF4E8]">
      <div className="max-w-[1360px] mx-auto px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-8 border-t border-b border-[#E6D9BD] py-6">
          {brands.map((brand: any) => (
            <Link key={brand._id} href={`/brands/${brand.slug}`}
              className="aspect-[3/2] bg-[#FFFBF2] border border-[#E6D9BD] rounded-[10px] flex items-center justify-center text-[20px] font-semibold tracking-tight hover:border-[#1F2F4A] hover:-translate-y-px transition-all"
              style={{ fontFamily: 'var(--font-inter, system-ui)' }}>
              {brand.logo
                ? <Image src={imgUrl(brand.logo)} alt={brand.name} width={80} height={40} className="object-contain" />
                : <span className="text-[#7A8299]">{brand.em || brand.name}</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Journal ────────────────────────────────────────────────────────────── */
function JournalSection({ section }: { section: HomeSection }) {
  const posts = section.posts || [];
  return (
    <section className="py-16 bg-[#FBF4E8]">
      <div className="max-w-[1360px] mx-auto px-8">
        <SectionHead section={section} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
          {posts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="group block">
              <div className="aspect-[4/3] rounded-[18px] overflow-hidden mb-4 relative border border-[#E6D9BD] bg-[#F5E9D2]">
                {post.coverImage && (
                  <Image src={imgUrl(post.coverImage)} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
                )}
              </div>
              <p className="text-[11px] uppercase tracking-[.1em] mb-1"
                 style={{ color: '#7A8299', fontFamily: 'var(--font-mono-var, monospace)' }}>
                <span style={{ color: '#EC5D4A', marginRight: 8 }}>{post.category}</span>
                {post.readTime}
              </p>
              <h3 className="text-[24px] font-semibold leading-snug tracking-tight group-hover:text-[#EC5D4A] transition-colors mb-2"
                  style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-[14px] text-[#344463] leading-relaxed line-clamp-2">{post.excerpt}</p>
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
    <section className="py-0 bg-[#1F2F4A] text-[#FFFBF2]">
      <div className="max-w-[1360px] mx-auto px-8 py-3">
        <p className="text-center text-xs tracking-[.04em]"
           style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>
          {banner.title}
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
          <p className="eyebrow mb-2">{section.eyebrow}</p>
        )}
        {section.title && (
          <h2 className="text-[44px] font-semibold leading-none tracking-tight text-[#1F2F4A]"
              style={{ fontFamily: 'var(--font-fredoka, system-ui)' }}>
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-[14px] text-[#7A8299] mt-2 max-w-[360px]">{section.subtitle}</p>
        )}
      </div>
      {section.ctaLink && (
        <Link href={section.ctaLink}
          className="shrink-0 inline-flex items-center gap-2 border border-[#E6D9BD] text-[#1F2F4A] text-sm font-medium px-5 py-2.5 rounded-full hover:border-[#1F2F4A] hover:bg-[#FFFBF2] transition-all">
          {section.ctaLabel || 'See all'} →
        </Link>
      )}
    </div>
  );
}
