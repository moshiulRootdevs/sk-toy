'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { imgUrl } from '@/lib/utils';
import { Settings } from '@/types';
import Tooltip from '@/components/ui/Tooltip';

export default function Footer() {
  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const s = settings?.store;
  const social = settings?.social;

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await api.post('/newsletter/subscribe', { email, source: 'footer' });
      toast.success(res.data?.message || 'Subscribed!');
      setNewsletterEmail('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Could not subscribe right now.';
      toast.error(msg);
    } finally {
      setNewsletterLoading(false);
    }
  }

  const SECTION_COLORS = {
    shop:    '#FF6FB1',
    help:    '#6BC8E6',
    company: '#4FC081',
    loop:    '#FFCB47',
  } as const;

  const DEFAULT_PAYMENT_BADGES = [
    { label: 'bKash', bg: '#E2136E', textColor: '#FFFFFF', enabled: true },
    { label: 'COD',   bg: '#FFCB47', textColor: '#1F2F4A', enabled: true },
    { label: 'Nagad', bg: '#FF9A4D', textColor: '#FFFFFF', enabled: true },
  ];
  const paymentBadges = (settings?.paymentBadges?.length ? settings.paymentBadges : DEFAULT_PAYMENT_BADGES)
    .filter((b) => b.enabled && b.label?.trim());

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
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {TRUST_BADGES.map((b, idx) => (
              <div key={b.title}
                   className={`flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-white border border-[#FFE0EC] p-2.5 sm:p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft ${idx === TRUST_BADGES.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}>
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${b.color}22`, color: b.color }}>
                  <span className="scale-[0.7] sm:scale-100 origin-center">{b.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-[13px] font-extrabold leading-tight text-[#1F2F4A] truncate">{b.title}</div>
                  <div className="text-[9px] sm:text-[11px] text-[#7A8299] mt-0.5 font-semibold truncate">{b.subtitle}</div>
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

        <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-14 pb-14 sm:pb-20">
          {/* Top grid — responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-x-6 gap-y-7 sm:gap-x-8 sm:gap-y-8 lg:gap-12 pb-5 sm:pb-10">

            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-auto text-center sm:text-center lg:text-left">
              <Link href="/" className="inline-flex items-end leading-none select-none mb-3 sm:mb-4">
                {s?.logo ? (
                  <Image
                    src={imgUrl(s.logo)}
                    alt={s.name || 'SK Toy'}
                    width={200}
                    height={64}
                    style={{ objectFit: 'contain', maxHeight: 56, width: 'auto' }}
                  />
                ) : (
                  <span className="font-display flex items-end text-[28px] sm:text-[38px]" style={{ fontWeight: 700 }}>
                    <span style={{ color: '#4FC081' }}>S</span>
                    <span style={{ color: '#FF5B6E' }}>K</span>
                    <span className="logo-dot" />
                    <span style={{ color: '#FF9A4D' }}>T</span>
                    <span style={{ color: '#6BC8E6' }}>O</span>
                    <span style={{ color: '#B093E8' }}>Y</span>
                  </span>
                )}
              </Link>
              <p className="text-[13px] sm:text-[15px] font-semibold leading-snug mb-3 sm:mb-4 text-[#1F2F4A]">
                {s?.tagline || (
                  <>
                    Bangladesh&apos;s <span className="text-[#FF6FB1]">friendliest</span> toy house — making childhood more joyful.
                  </>
                )}
              </p>
              {/* Phone & Email in a row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-2">
                {s?.phone && (
                  <a
                    href={`tel:${s.phone.replace(/[^+\d]/g, '')}`}
                    className="text-[12px] sm:text-[13px] text-[#1F2F4A]/85 hover:text-[#4FC081] inline-flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <span className="inline-flex w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#4FC081]/20 items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#4FC081]" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </span>
                    {s.phone}
                  </a>
                )}
                {s?.email && (
                  <a
                    href={`mailto:${s.email}`}
                    className="text-[12px] sm:text-[13px] text-[#1F2F4A]/85 hover:text-[#6BC8E6] inline-flex items-center gap-1.5 font-semibold transition-colors"
                  >
                    <span className="inline-flex w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#6BC8E6]/30 items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-[#6BC8E6]" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="m22 6-10 7L2 6" /></svg>
                    </span>
                    <span className="truncate">{s.email}</span>
                  </a>
                )}
              </div>
              {s?.address && (
                <p className="text-[12px] sm:text-[13px] text-[#1F2F4A]/70 leading-relaxed font-medium">{s.address}</p>
              )}
            </div>

            {/* Shop & Help — side by side on mobile */}
            <div className="grid grid-cols-2 gap-6 sm:contents text-center sm:text-center lg:text-left">
              {/* Shop */}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 mb-3 sm:mb-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                     style={{ border: `2px solid ${SECTION_COLORS.shop}` }}>
                  <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.shop }} />
                  <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.12em] sm:tracking-[.16em] font-extrabold" style={{ color: SECTION_COLORS.shop }}>Shop</h4>
                </div>
                <ul className="space-y-2 sm:space-y-2.5">
                  {[
                    { href: '/categories/new-arrivals', label: 'New Arrivals' },
                    { href: '/products?filter=sale',    label: 'Sale Items' },
                    { href: '/categories/shop-by-age',  label: 'Shop by Age' },
                    { href: '/products',                label: 'All Products' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[13px] sm:text-[14px] text-[#1F2F4A]/85 hover:text-[#FF6FB1] transition-colors font-semibold">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Help */}
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 mb-3 sm:mb-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                     style={{ border: `2px solid ${SECTION_COLORS.help}` }}>
                  <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.help }} />
                  <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.12em] sm:tracking-[.16em] font-extrabold" style={{ color: SECTION_COLORS.help }}>Help</h4>
                </div>
                <ul className="space-y-2 sm:space-y-2.5">
                  {[
                    { href: '/track',                   label: 'Track Order' },
                    { href: '/pages/shipping-info',     label: 'Shipping' },
                    { href: '/pages/faq',               label: 'FAQ' },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[13px] sm:text-[14px] text-[#1F2F4A]/85 hover:text-[#6BC8E6] transition-colors font-semibold">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Company */}
            <div className="sm:col-span-2 lg:col-auto min-w-0 text-center sm:text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 mb-3 sm:mb-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                   style={{ border: `2px solid ${SECTION_COLORS.company}` }}>
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.company }} />
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.12em] sm:tracking-[.16em] font-extrabold" style={{ color: SECTION_COLORS.company }}>Company</h4>
              </div>
              <ul className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 sm:flex-col sm:items-center lg:items-start sm:gap-y-2.5 sm:gap-x-0">
                {[
                  { href: '/pages/about', label: 'About' },
                  { href: '/blog',        label: 'Journal' },
                  { href: '/account',     label: 'My Account' },
                  { href: '/wishlist',    label: 'Wishlist' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] sm:text-[14px] text-[#1F2F4A]/85 hover:text-[#4FC081] transition-colors font-semibold">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter + social */}
            <div className="sm:col-span-2 lg:col-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 border-2 sm:border-4 border-white shadow-soft"
                 style={{ background: 'linear-gradient(160deg, #FFE0EC 0%, #FFEDB6 100%)' }}>
              <div className="inline-flex items-center gap-1.5 mb-2.5 sm:mb-3 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white"
                   style={{ border: `2px solid ${SECTION_COLORS.loop}` }}>
                <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: SECTION_COLORS.loop }} />
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[.1em] sm:tracking-[.16em] font-extrabold" style={{ color: '#E5A82A' }}>Stay in the loop</h4>
              </div>
              <p className="text-[11.5px] sm:text-[12px] text-[#1F2F4A]/80 mb-2.5 sm:mb-3 leading-relaxed font-semibold">
                Fresh toy drops & exclusive offers — straight to your inbox 🎁
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={newsletterLoading}
                  placeholder="Your email"
                  aria-label="Email address"
                  className="flex-1 min-w-0 bg-white border-2 border-[#FFD4E6] rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm text-[#1F2F4A] placeholder-[#B591A8] outline-none focus:border-[#FF6FB1] transition-colors font-medium disabled:opacity-60"
                />
                <button type="submit"
                  disabled={newsletterLoading}
                  className="text-white text-[13px] sm:text-sm font-extrabold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)', boxShadow: '0 8px 18px -8px rgba(255,91,110,.6)' }}>
                  {newsletterLoading ? '…' : 'Go'}
                </button>
              </form>

              {/* Social + payments combined row */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="flex gap-1.5 sm:gap-2">
                  {[
                    { href: social?.facebook, label: 'Facebook', color: '#1877F2', icon: (
                      <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.747v8.202h3.318z" />
                      </svg>
                    )},
                    { href: social?.instagram, label: 'Instagram', color: '#E1306C', icon: (
                      <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 2.163c3.204 0 3.584.012 4.849.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                      </svg>
                    )},
                    { href: social?.youtube, label: 'YouTube', color: '#FF0000', icon: (
                      <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden fillRule="evenodd" clipRule="evenodd">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    )},
                  ].filter(s => s.href).map((soc) => (
                    <Tooltip key={soc.label} label={`Follow us on ${soc.label}`} position="top">
                      <a href={soc.href!} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${soc.label}`}
                         className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 hover:-rotate-6 shadow-soft"
                         style={{ background: soc.color }}>
                        {soc.icon}
                      </a>
                    </Tooltip>
                  ))}
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {paymentBadges.map((b) => (
                    <span key={b.label}
                          className="text-[10px] font-extrabold px-2 sm:px-2.5 py-1 rounded-full"
                          style={{ background: b.bg, color: b.textColor }}>
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-3 pt-5 sm:pt-6 text-[11px] sm:text-[12px] text-[#1F2F4A]/65 border-t-2 border-dashed border-[#FFFFFF]/60 font-semibold text-center sm:text-left">
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
