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
    shop: '#F5C443',
    help: '#6FB8D9',
    company: '#4FA36A',
    loop: '#F28BA8',
  } as const;

  const PAYMENT_STYLES: Record<string, string> = {
    bKash: 'bg-[#E2136E]/20 text-[#FFAFD0] border border-[#E2136E]/40',
    COD:   'bg-[#F5C443]/20 text-[#F5C443] border border-[#F5C443]/40',
    Nagad: 'bg-[#F39436]/20 text-[#F39436] border border-[#F39436]/40',
  };

  const TRUST_BADGES = [
    {
      color: '#F5C443', title: 'Fast Delivery', subtitle: 'Across Bangladesh',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="14" height="11" rx="1" /><path d="M15 9h4l3 4v4h-7" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></svg>
      ),
    },
    {
      color: '#4FA36A', title: '7-Day Returns', subtitle: 'Easy & hassle-free',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>
      ),
    },
    {
      color: '#6FB8D9', title: 'Safe Toys', subtitle: 'Quality guaranteed',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
      ),
    },
    {
      color: '#F28BA8', title: 'Friendly Help', subtitle: "We're a message away",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      ),
    },
  ];

  return (
    <footer className="relative text-[#FFFBF2] mt-20 overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #1F4858 0%, #143849 60%, #0E2B38 100%)' }}>
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-20 -left-10 w-[300px] h-[300px] rounded-full bg-[#EC5D4A] opacity-[0.10] blur-2xl" />
        <div className="absolute top-[20%] right-[5%] w-[260px] h-[260px] rounded-full bg-[#F5C443] opacity-[0.10] blur-2xl" />
        <div className="absolute bottom-[-40px] left-[35%] w-[320px] h-[320px] rounded-full bg-[#6FB8D9] opacity-[0.10] blur-3xl" />
      </div>

      <div className="relative max-w-[1360px] mx-auto px-8 pt-14 pb-6">

        {/* Trust badges row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-12 mb-12 border-b border-[#FFFBF2]/15">
          {TRUST_BADGES.map((b) => (
            <div key={b.title}
                 className="flex items-center gap-3 rounded-2xl bg-[#FFFBF2]/[0.05] border border-[#FFFBF2]/10 p-3.5 transition-colors hover:bg-[#FFFBF2]/[0.10]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: `${b.color}25`, border: `1px solid ${b.color}55`, color: b.color }}>
                {b.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold leading-tight" style={{ color: b.color }}>{b.title}</div>
                <div className="text-[11px] text-[#FFFBF2]/65 mt-0.5">{b.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-12 pb-12 border-b border-[#FFFBF2]/15">

          {/* Brand column */}
          <div>
            <p className="text-[22px] font-medium leading-snug mb-4"
               style={{ fontFamily: 'var(--font-inter, system-ui)' }}>
              {s?.tagline || (
                <>
                  Bangladesh&apos;s <span className="text-[#F5C443] font-semibold">friendliest</span> toy house.
                </>
              )}
            </p>
            {s?.phone && (
              <p className="text-[14px] text-[#FFFBF2]/85 mb-1 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4FA36A]" />
                {s.phone}
              </p>
            )}
            {s?.email && (
              <p className="text-[14px] text-[#FFFBF2]/85 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6FB8D9]" />
                {s.email}
              </p>
            )}
            {s?.address && (
              <p className="text-[13px] text-[#FFFBF2]/55 mt-3 leading-relaxed">{s.address}</p>
            )}
          </div>

          {/* Shop */}
          <div>
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full"
                 style={{ background: `${SECTION_COLORS.shop}1A`, border: `1px solid ${SECTION_COLORS.shop}55` }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: SECTION_COLORS.shop }} />
              <h4 className="text-[10px] uppercase tracking-[.14em] font-bold"
                  style={{ fontFamily: 'var(--font-mono-var, monospace)', color: SECTION_COLORS.shop }}>Shop</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                { href: '/categories/new-arrivals', label: 'New Arrivals' },
                { href: '/products?filter=sale',    label: 'Sale Items' },
                { href: '/brands',                  label: 'Shop by Brand' },
                { href: '/categories/by-age',       label: 'Shop by Age' },
                { href: '/products',                label: 'All Products' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-[#FFFBF2]/85 hover:text-[#F5C443] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full"
                 style={{ background: `${SECTION_COLORS.help}1A`, border: `1px solid ${SECTION_COLORS.help}55` }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: SECTION_COLORS.help }} />
              <h4 className="text-[10px] uppercase tracking-[.14em] font-bold"
                  style={{ fontFamily: 'var(--font-mono-var, monospace)', color: SECTION_COLORS.help }}>Help</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                { href: '/track',            label: 'Track Order' },
                { href: '/pages/shipping',   label: 'Shipping Info' },
                { href: '/pages/faq',        label: 'FAQ' },
                { href: '/pages/privacy',    label: 'Privacy Policy' },
                { href: '/pages/terms',      label: 'Terms & Conditions' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-[#FFFBF2]/85 hover:text-[#6FB8D9] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full"
                 style={{ background: `${SECTION_COLORS.company}1A`, border: `1px solid ${SECTION_COLORS.company}55` }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: SECTION_COLORS.company }} />
              <h4 className="text-[10px] uppercase tracking-[.14em] font-bold"
                  style={{ fontFamily: 'var(--font-mono-var, monospace)', color: SECTION_COLORS.company }}>Company</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                { href: '/pages/about', label: 'About SK Toy' },
                { href: '/blog',        label: 'Journal' },
                { href: '/brands',      label: 'Our Brands' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[14px] text-[#FFFBF2]/85 hover:text-[#4FA36A] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + social */}
          <div className="rounded-2xl border p-4"
               style={{ background: 'linear-gradient(135deg, rgba(242,139,168,0.10), rgba(245,196,67,0.06))', borderColor: 'rgba(242,139,168,0.30)' }}>
            <div className="inline-flex items-center gap-1.5 mb-4 px-2.5 py-1 rounded-full"
                 style={{ background: `${SECTION_COLORS.loop}22`, border: `1px solid ${SECTION_COLORS.loop}55` }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: SECTION_COLORS.loop }} />
              <h4 className="text-[10px] uppercase tracking-[.14em] font-bold"
                  style={{ fontFamily: 'var(--font-mono-var, monospace)', color: SECTION_COLORS.loop }}>Stay in the loop</h4>
            </div>
            <p className="text-[12px] text-[#FFFBF2]/70 mb-3 leading-relaxed">
              Get fresh toy drops & exclusive offers — straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 mb-4">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 border rounded-full px-4 py-2.5 text-sm text-[#FFFBF2] placeholder-[#FFFBF2]/50 outline-none transition-colors"
                style={{ background: 'rgba(255,251,242,.06)', borderColor: 'rgba(255,251,242,0.20)' }}
              />
              <button type="submit"
                className="bg-[#EC5D4A] hover:bg-[#D14434] text-white text-sm font-bold px-4 py-2.5 rounded-full transition-all hover:scale-105 whitespace-nowrap shadow-[0_4px_0_0_rgba(0,0,0,.18)] active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(0,0,0,.18)]">
                Go
              </button>
            </form>

            {/* Social icons */}
            <div className="flex gap-2">
              {[
                { href: social?.facebook, label: 'Facebook', color: '#1877F2', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                )},
                { href: social?.instagram, label: 'Instagram', color: '#E1306C', icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                )},
                { href: social?.youtube, label: 'YouTube', color: '#FF0000', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white" /></svg>
                )},
              ].filter(s => s.href).map((soc) => (
                <a key={soc.label} href={soc.href!} target="_blank" rel="noopener noreferrer" aria-label={soc.label}
                   className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
                   style={{ background: soc.color }}>
                  {soc.icon}
                </a>
              ))}
            </div>

            {/* Payment methods */}
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#FFFBF2]/45 mr-1"
                    style={{ fontFamily: 'var(--font-mono-var, monospace)' }}>Accepted</span>
              {['bKash', 'COD', 'Nagad'].map((m) => (
                <span key={m} className={`text-[11px] font-bold px-2 py-1 rounded ${PAYMENT_STYLES[m]}`}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-[11px] text-[#FFFBF2]/55"
             style={{ fontFamily: 'var(--font-mono-var, monospace)', letterSpacing: '.05em' }}>
          <p>© {new Date().getFullYear()} SK Toy. All rights reserved.</p>
          <p>
            Developed by{' '}
            <a href="https://rootdevs.com" target="_blank" rel="noopener noreferrer" className="text-[#FFFBF2]/85 hover:text-[#F5C443] transition-colors">Rootdevs</a>
          </p>
          <div className="flex gap-6">
            <Link href="/pages/privacy" className="hover:text-[#F5C443] transition-colors">Privacy</Link>
            <Link href="/pages/terms"   className="hover:text-[#F5C443] transition-colors">Terms</Link>
            <Link href="/pages/about"   className="hover:text-[#F5C443] transition-colors">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
