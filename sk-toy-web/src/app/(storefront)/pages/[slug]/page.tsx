'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CmsPage } from '@/types';
import Spinner from '@/components/ui/Spinner';

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
    { key: 'inside', data: options?.insideDhaka, color: '#4FA36A' },
    { key: 'outside', data: options?.outsideDhaka, color: '#EC5D4A' },
  ];

  return (
    <div className="w-full">
      {/* Hero banner */}
      <div className="w-full py-14 sm:py-20 text-center" style={{ background: 'linear-gradient(135deg, #1F4858 0%, #143849 60%, #0E2B38 100%)' }}>
        <div className="max-w-[1360px] mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <svg className="w-4 h-4 text-[#F5C443]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 4v4h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>
            <span className="text-[12px] text-white/80 font-medium uppercase tracking-wider">Delivery Information</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3">
            {page?.title || 'Shipping & Delivery'}
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto">
            Fast, reliable delivery across Bangladesh. Here&apos;s everything you need to know.
          </p>
        </div>
      </div>

      {/* Delivery zone cards */}
      <div className="max-w-[1360px] mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {zones.map(({ key, data, color }) => {
            if (!data) return null;
            const isFreeAvailable = data.freeOver > 0;
            const isInside = key === 'inside';
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                  {isInside ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 4v4h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-gray-900">{data.title}</div>
                  <div className="text-[12px] text-gray-400">{data.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold" style={{ color }}>{fmtTk(data.amount)}</div>
                  {isFreeAvailable && (
                    <div className="text-[11px] text-[#4FA36A] font-medium">Free over {fmtTk(data.freeOver)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CMS content blocks */}
      {blocks.length > 0 && (
        <div className="max-w-[1360px] mx-auto px-6 py-10 sm:py-14">
          <div className="space-y-6">
            {(() => {
              let qaNum = 0;
              return blocks.map((block, i) => {
              switch (block.type) {
                case 'heading':
                  return (
                    <h2 key={i} className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 pb-2 border-b border-gray-100">
                      {block.text}
                    </h2>
                  );
                case 'paragraph':
                  return <p key={i} className="text-gray-600 leading-relaxed text-[15px]">{block.text}</p>;
                case 'qa': {
                  qaNum++;
                  return (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                      <p className="font-semibold text-gray-900 flex items-start gap-2">
                        <span className="text-[#EC5D4A] font-bold mt-0.5 shrink-0">Q{qaNum}.</span>
                        {block.q}
                      </p>
                      <p className="text-gray-600 mt-2 ml-8 leading-relaxed">{block.a}</p>
                    </div>
                  );
                }
                case 'image':
                  return block.src ? <img key={i} src={block.src} alt="" className="rounded-xl w-full" /> : null;
                case 'list':
                  return (
                    <ul key={i} className="space-y-2 text-gray-600">
                      {(block.items ?? []).map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EC5D4A] mt-2 shrink-0" />
                          <span className="text-[15px] leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  );
                case 'divider':
                  return <hr key={i} className="border-gray-200 my-4" />;
                default:
                  return null;
              }
            });
            })()}
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
  if (!page) return <div className="text-center py-32 text-gray-400">Page not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8">{page.title}</h1>
      <div className="space-y-5">
        {page.blocks.map((block, i) => {
          switch (block.type) {
            case 'heading':
              return <h2 key={i} className="text-xl font-bold text-gray-900 mt-6">{block.text}</h2>;
            case 'paragraph':
              return <p key={i} className="text-gray-600 leading-relaxed">{block.text}</p>;
            case 'qa':
              return (
                <div key={i} className="border-l-4 border-[#EC5D4A] pl-4">
                  <p className="font-semibold text-gray-900">{block.q}</p>
                  <p className="text-gray-600 mt-1">{block.a}</p>
                </div>
              );
            case 'image':
              return block.src ? (
                <img key={i} src={block.src} alt="" className="rounded-xl w-full" />
              ) : null;
            case 'list':
              return (
                <ul key={i} className="list-disc list-inside space-y-1 text-gray-600">
                  {(block.items ?? []).map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            case 'divider':
              return <hr key={i} className="border-gray-200" />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

/* ─── Router ────────────────────────────────────────────────────────────── */
export default function PageRouter() {
  const { slug } = useParams();

  // Shipping page shows live data from Settings API instead of static CMS
  if (slug === 'shipping' || slug === 'shipping-info') return <ShippingInfoPage />;

  return <CmsPageView slug={slug as string} />;
}
