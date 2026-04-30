'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Settings } from '@/types';

export default function Footer() {
  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const s = settings?.store;
  const social = settings?.social;

  const SECTION_COLORS = {
    shop:    '#FF6FB1',
    help:    '#6BC8E6',
    company: '#4FC081',
    loop:    '#FFCB47',
  } as const;

  const PAYMENT_STYLES: Record<string, string> = {
    bKash: 'bg-[#E2136E] text-white',
    COD:   'bg-[#FFCB47] text-[#1F2F4A]',
    Nagad: 'bg-[#FF9A4D] text-white',
  };

  const TRUST_BADGES = [
    {
      color: '#FF6FB1', title: 'Reliable Shopping', subtitle: 'Safe & worry-free',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      ),
    },
    {
      color: '#4FC081', title: 'Secure Payment', subtitle: 'Protected checkout',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
      ),
    },
    {
      color: '#6BC8E6', title: 'Customer Support', subtitle: '24/7 friendly help',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      ),
    },
    {
      color: '#FF9A4D', title: 'Nationwide Delivery', subtitle: 'Across Bangladesh',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 9h4l3 4v4h-7" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></svg>
      ),
    },
    {
      color: '#B093E8', title: 'Easy Return', subtitle: '7-day hassle-free',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>
      ),
    },
  ];

  return (
    <footer className="relative text-[#1F2F4A] mt-12 sm:mt-20 overflow-hidden">
      {/* Trust strip — sits on the page background, above the blue footer */}
      <div className="relative">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-5 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {TRUST_BADGES.map((b) => (
              <div key={b.title}
                   className="flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl bg-white border border-[#FFE0EC] p-2.5 sm:p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${b.color}22`, color: b.color }}>
                  <span className="scale-75 sm:scale-100 origin-center">{b.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] sm:text-[13px] font-extrabold leading-tight text-[#1F2F4A] truncate">{b.title}</div>
                  <div className="text-[10px] sm:text-[11px] text-[#7A8299] mt-0.5 font-semibold truncate">{b.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer panel — soft sky/cream gradient */}
      <div className="relative" style={{ background: 'linear-gradient(180deg, #E5F4FB 0%, #D4EEF7 60%, #C4E5F2 100%)' }}>
        {/* Cloud blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-10 left-[8%] w-32 h-16 bg-white/70 rounded-full blur-md" />
          <div className="absolute top-12 left-[20%] w-24 h-12 bg-white/60 rounded-full blur-md" />
          <div className="absolute top-6 right-[12%] w-40 h-20 bg-white/70 rounded-full blur-md" />
          <div className="absolute top-24 right-[28%] w-28 h-14 bg-white/55 rounded-full blur-md" />
        </div>

        {/* Grass illustration at the very bottom */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-8 sm:h-16 pointer-events-none" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#7BD8A1" />
              <stop offset="1" stopColor="#4FC081" />
            </linearGradient>
          </defs>
          <path d="M0 50 Q 60 20 120 50 T 240 50 T 360 50 T 480 50 T 600 50 T 720 50 T 840 50 T 960 50 T 1080 50 T 1200 50 T 1320 50 T 1440 50 V80 H0 Z" fill="url(#grass)" />
        </svg>

        <div className="relative max-w-[1360px] mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-14 sm:pb-20">
          {/* Top grid — 6-col on mobile lets brand+newsletter span full while Shop/Help/Company sit in a 3-col row */}
          <div className="grid grid-cols-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-x-3 gap-y-5 sm:gap-x-8 sm:gap-y-8 lg:gap-12 pb-5 sm:pb-10">

            {/* Brand column */}
            <div className="col-span-6 sm:col-span-2 lg:col-auto">
              <Link href="/" className="inline-flex items-end leading-none select-none mb-3 sm:mb-4">
                <span className="font-display flex items-end text-[28px] sm:text-[38px]" style={{ fontWeight: 700 }}>
                  <span style={{ color: '#4FC081' }}>S</span>
                  <span style={{ color: '#FF5B6E' }}>K</span>
                  <span className="logo-dot" />
                  <span style={{ color: '#FF9A4D' }}>T</span>
                  <span style={{ color: '#6BC8E6' }}>O</span>
                  <span style={{ color: '#B093E8' }}>Y</span>
                </span>
              </Link>
              <p className="text-[13px] sm:text-[15px] font-semibold leading-snug mb-3 sm:mb-4 text-[#1F2F4A]">
                {s?.tagline || (
                  <>
                    Bangladesh&apos;s <span className="text-[#FF6FB1]">friendliest</span> toy house — making childhood more joyful.
                  </>
                )}
              </p>
              <div className="space-y-1.5">
                {s?.phone && (
                  <p className="text-[12px] sm:text-[13px] text-[#1F2F4A]/85 flex items-center gap-2 font-semibold">
                    <span className="inline-flex w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4FC081]/20 items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#4FC081]" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </span>
                    {s.phone}
                  </p>
                )}
                {s?.email && (
                  <p className="text-[12px] sm:text-[13px] text-[#1F2F4A]/85 flex items-center gap-2 font-semibold">
                    <span className="inline-flex w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#6BC8E6]/30 items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#6BC8E6]" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" /></svg>
                    </span>
                    <span className="truncate">{s.email}</span>
                  </p>
                )}
                {s?.address && (
                  <p className="text-[12px] sm:text-[13px] text-[#1F2F4A]/70 mt-2 leading-relaxed font-medium">{s.address}</p>
                )}
              </div>
            </div>

            {/* Shop */}
            <div className="col-span-3 sm:col-span-1 lg:col-auto min-w-0">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 mb-2.5 sm:mb-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                   style={{ border: `2px solid ${SECTION_COLORS.shop}` }}>
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.shop }} />
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.1em] sm:tracking-[.16em] font-extrabold" style={{ color: SECTION_COLORS.shop }}>Shop</h4>
              </div>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {[
                  { href: '/categories/new-arrivals', label: 'New Arrivals' },
                  { href: '/products?filter=sale',    label: 'Sale Items' },
                  { href: '/categories/shop-by-age',  label: 'Shop by Age' },
                  { href: '/products',                label: 'All Products' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[12px] sm:text-[14px] text-[#1F2F4A]/85 hover:text-[#FF6FB1] transition-colors font-semibold">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div className="col-span-3 sm:col-span-1 lg:col-auto min-w-0">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 mb-2.5 sm:mb-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                   style={{ border: `2px solid ${SECTION_COLORS.help}` }}>
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.help }} />
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.1em] sm:tracking-[.16em] font-extrabold" style={{ color: SECTION_COLORS.help }}>Help</h4>
              </div>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {[
                  { href: '/track',                   label: 'Track Order' },
                  { href: '/pages/shipping-info',     label: 'Shipping' },
                  { href: '/pages/faq',               label: 'FAQ' },
                  { href: '/pages/privacy',           label: 'Privacy' },
                  { href: '/pages/terms',             label: 'Terms' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[12px] sm:text-[14px] text-[#1F2F4A]/85 hover:text-[#6BC8E6] transition-colors font-semibold">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="col-span-6 sm:col-span-2 lg:col-auto min-w-0">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 mb-2.5 sm:mb-4 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                   style={{ border: `2px solid ${SECTION_COLORS.company}` }}>
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.company }} />
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.1em] sm:tracking-[.16em] font-extrabold" style={{ color: SECTION_COLORS.company }}>Company</h4>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5 sm:flex-col sm:gap-y-2.5 sm:gap-x-0">
                {[
                  { href: '/pages/about', label: 'About' },
                  { href: '/blog',        label: 'Journal' },
                  { href: '/account',     label: 'My Account' },
                  { href: '/wishlist',    label: 'Wishlist' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[12px] sm:text-[14px] text-[#1F2F4A]/85 hover:text-[#4FC081] transition-colors font-semibold">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter + social */}
            <div className="col-span-6 sm:col-span-2 lg:col-auto rounded-2xl sm:rounded-3xl bg-white p-3.5 sm:p-5 border-2 sm:border-4 border-white shadow-soft"
                 style={{ background: 'linear-gradient(160deg, #FFE0EC 0%, #FFEDB6 100%)' }}>
              <div className="inline-flex items-center gap-1.5 mb-2.5 sm:mb-3 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                   style={{ border: `2px solid ${SECTION_COLORS.loop}` }}>
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.loop }} />
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.1em] sm:tracking-[.16em] font-extrabold" style={{ color: '#E5A82A' }}>Stay in the loop</h4>
              </div>
              <p className="text-[11.5px] sm:text-[12px] text-[#1F2F4A]/80 mb-2.5 sm:mb-3 leading-relaxed font-semibold">
                Fresh toy drops & exclusive offers — straight to your inbox 🎁
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 min-w-0 bg-white border-2 border-[#FFD4E6] rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm text-[#1F2F4A] placeholder-[#B591A8] outline-none focus:border-[#FF6FB1] transition-colors font-medium"
                />
                <button type="submit"
                  className="text-white text-[13px] sm:text-sm font-extrabold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)', boxShadow: '0 8px 18px -8px rgba(255,91,110,.6)' }}>
                  Go
                </button>
              </form>

              {/* Social + payments combined row on mobile, separate on desktop */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex gap-1.5 sm:gap-2">
                  {[
                    { href: social?.facebook, label: 'Facebook', color: '#1877F2', icon: (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    )},
                    { href: social?.instagram, label: 'Instagram', color: '#E1306C', icon: (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    )},
                    { href: social?.youtube, label: 'YouTube', color: '#FF0000', icon: (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white" /></svg>
                    )},
                  ].filter(s => s.href).map((soc) => (
                    <a key={soc.label} href={soc.href!} target="_blank" rel="noopener noreferrer" aria-label={soc.label}
                       className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:-rotate-6 shadow-soft"
                       style={{ background: soc.color }}>
                      {soc.icon}
                    </a>
                  ))}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {['bKash', 'COD', 'Nagad'].map((m) => (
                    <span key={m} className={`text-[10px] font-extrabold px-2 sm:px-2.5 py-1 rounded-full ${PAYMENT_STYLES[m]}`}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 pt-4 sm:pt-6 text-[11px] sm:text-[12px] text-[#1F2F4A]/65 border-t-2 border-dashed border-[#FFFFFF]/60 font-semibold text-center sm:text-left">
            <p>© {new Date().getFullYear()} SK Toy. All rights reserved.</p>
            <p className="hidden sm:block">
              Crafted with <span className="text-[#FF6FB1]">♥</span> by{' '}
              <a href="https://rootdevs.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6FB1] hover:underline font-extrabold">Rootdevs</a>
            </p>
            <div className="flex gap-4 sm:gap-5">
              <Link href="/pages/privacy" className="hover:text-[#FF6FB1] transition-colors">Privacy</Link>
              <Link href="/pages/terms"   className="hover:text-[#FF6FB1] transition-colors">Terms</Link>
              <Link href="/pages/about"   className="hover:text-[#FF6FB1] transition-colors">About</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
