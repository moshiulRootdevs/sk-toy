'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CmsPage } from '@/types';
import Spinner from '@/components/ui/Spinner';

/* ─── Reusable colourful page header ─────────────────────────────────────── */
function PageHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-8 pt-8 pb-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-[#7A8299] mb-5">
        <Link href="/" className="hover:text-[#FF6FB1]">Home</Link>
        <span>›</span>
        <span className="text-[#1F2F4A]">{title}</span>
      </div>
      {/* Gradient pill title — like the reference Policy screenshot */}
      <div className="rounded-[28px] py-10 sm:py-14 px-6 text-center relative overflow-hidden border-4 border-white shadow-soft"
           style={{ background: 'linear-gradient(90deg, #FFD4E6 0%, #FFE0CB 30%, #FFEDB6 50%, #D7F5E2 75%, #D4EEF7 100%)' }}>
        <div className="absolute -top-6 left-[10%] w-20 h-20 rounded-full bg-white/40 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 right-[15%] w-24 h-24 rounded-full bg-white/40 blur-xl pointer-events-none" />
        {eyebrow && <p className="text-[11px] uppercase tracking-[.18em] font-extrabold text-[#FF6FB1] mb-2 relative">✨ {eyebrow}</p>}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2F4A] leading-tight relative">{title}</h1>
      </div>
    </div>
  );
}

/* ─── Shipping info: delivery charges from Settings + CMS content blocks ── */
function ShippingInfoPage() {
  const { data: options, isLoading: optionsLoading } = useQuery<{
    insideDhaka:  { title: string; amount: number; description: string; freeOver: number };
    outsideDhaka: { title: string; amount: number; description: string; freeOver: number };
  }>({
    queryKey: ['shipping-options'],
    queryFn: () => api.get('/shipping/options').then((r) => r.data),
  });

  const { data: page, isLoading: pageLoading } = useQuery<CmsPage>({
    queryKey: ['cms-page', 'shipping-info'],
    queryFn: () => api.get('/cms/slug/shipping-info').then((r) => r.data).catch(() => null),
  });

  const isLoading = optionsLoading || pageLoading;
  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;

  const fmtTk = (n: number) => `BDT ${n.toLocaleString('en-BD')}`;
  const blocks = page?.blocks || [];

  const zones = [
    { key: 'inside',  data: options?.insideDhaka,  color: '#4FC081', emoji: '🏙️' },
    { key: 'outside', data: options?.outsideDhaka, color: '#FF6FB1', emoji: '🚚' },
  ];

  return (
    <div className="w-full">
      <PageHeader title={page?.title || 'Shipping & Delivery'} eyebrow="Delivery Information" />

      {/* Delivery zone cards */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {zones.map(({ key, data, color, emoji }) => {
            if (!data) return null;
            const isFreeAvailable = data.freeOver > 0;
            return (
              <div key={key} className="bg-white rounded-[22px] border-2 border-[#FFE0EC] p-5 flex items-center gap-4 shadow-soft">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl" style={{ background: `${color}22` }}>
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-extrabold text-[#1F2F4A]">{data.title}</div>
                  <div className="text-[12px] text-[#7A8299] font-medium">{data.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold" style={{ color }}>{fmtTk(data.amount)}</div>
                  {isFreeAvailable && (
                    <div className="text-[11px] text-[#4FC081] font-bold">Free over {fmtTk(data.freeOver)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CMS content blocks */}
      {blocks.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 sm:py-14">
          <div className="bg-white rounded-[28px] border-2 border-[#FFE0EC] p-8 sm:p-10 shadow-soft">
            <div className="space-y-5">
              {(() => {
                let qaNum = 0;
                return blocks.map((block, i) => {
                  switch (block.type) {
                    case 'heading':
                      return (
                        <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-[#1F2F4A] mt-8 pb-2 border-b-2 border-dashed border-[#FFD4E6] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> {block.text}
                        </h2>
                      );
                    case 'paragraph':
                      return <p key={i} className="text-[#5A5048] leading-relaxed text-[15px] font-medium">{block.text}</p>;
                    case 'qa': {
                      qaNum++;
                      return (
                        <div key={i} className="bg-[#FFF5F8] rounded-2xl border-2 border-[#FFE0EC] p-5">
                          <p className="font-extrabold text-[#1F2F4A] flex items-start gap-2">
                            <span className="text-[#FF6FB1] mt-0.5 shrink-0">Q{qaNum}.</span>
                            {block.q}
                          </p>
                          <p className="text-[#5A5048] mt-2 ml-7 leading-relaxed font-medium">{block.a}</p>
                        </div>
                      );
                    }
                    case 'image':
                      return block.src ? <img key={i} src={block.src} alt="" className="rounded-[22px] w-full" /> : null;
                    case 'list':
                      return (
                        <ul key={i} className="space-y-2 text-[#5A5048]">
                          {(block.items ?? []).map((item, j) => (
                            <li key={j} className="flex items-start gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-[#FF6FB1] mt-2 shrink-0" />
                              <span className="text-[15px] leading-relaxed font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    case 'divider':
                      return <hr key={i} className="border-2 border-dashed border-[#FFD4E6] my-4" />;
                    default:
                      return null;
                  }
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Generic CMS page ──────────────────────────────────────────────────── */
function CmsPageView({ slug }: { slug: string }) {
  const { data: page, isLoading } = useQuery<CmsPage>({
    queryKey: ['cms-page', slug],
    queryFn: () => api.get(`/cms/slug/${slug}`).then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!page) return <div className="text-center py-32 text-[#7A8299] font-semibold">Page not found.</div>;

  return (
    <div className="w-full">
      <PageHeader title={page.title} />
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10">
        <div className="bg-white rounded-[28px] border-2 border-[#FFE0EC] p-8 sm:p-10 shadow-soft">
          <div className="space-y-5">
            {page.blocks.map((block, i) => {
              switch (block.type) {
                case 'heading':
                  return <h2 key={i} className="font-display text-xl sm:text-2xl font-bold text-[#1F2F4A] mt-6 pb-2 border-b-2 border-dashed border-[#FFD4E6] flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> {block.text}</h2>;
                case 'paragraph':
                  return <p key={i} className="text-[#5A5048] leading-relaxed text-[15px] font-medium">{block.text}</p>;
                case 'qa':
                  return (
                    <div key={i} className="bg-[#FFF5F8] border-l-4 border-[#FF6FB1] rounded-r-2xl pl-4 py-3 pr-4">
                      <p className="font-extrabold text-[#1F2F4A]">{block.q}</p>
                      <p className="text-[#5A5048] mt-1 font-medium">{block.a}</p>
                    </div>
                  );
                case 'image':
                  return block.src ? (
                    <img key={i} src={block.src} alt="" className="rounded-[22px] w-full" />
                  ) : null;
                case 'list':
                  return (
                    <ul key={i} className="space-y-1.5 text-[#5A5048]">
                      {(block.items ?? []).map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[#FF6FB1] mt-2 shrink-0" />
                          <span className="font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                case 'divider':
                  return <hr key={i} className="border-2 border-dashed border-[#FFD4E6]" />;
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Slug normalization — handle common alternative slugs ─────────────── */
const SLUG_ALIASES: Record<string, string> = {
  'privacy-policy': 'privacy',
  'terms-and-conditions': 'terms',
  'terms-conditions': 'terms',
  'about-us': 'about',
};

/* ─── Router ────────────────────────────────────────────────────────────── */
export default function PageRouter() {
  const { slug } = useParams();
  const rawSlug = slug as string;

  if (rawSlug === 'shipping' || rawSlug === 'shipping-info') return <ShippingInfoPage />;

  // Normalize slug via alias map
  const resolvedSlug = SLUG_ALIASES[rawSlug] || rawSlug;

  return <CmsPageView slug={resolvedSlug} />;
}
