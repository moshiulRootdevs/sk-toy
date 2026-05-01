'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/lib/api';
import { imgUrl } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Preview tile metadata mirrored from src/components/storefront/HomeSections.tsx
// so the admin preview matches the live hero collage.
const HERO_CARD_PREVIEW = [
  { rot: '-6deg', top: '0%',   left: '2%',   right: 'auto', bottom: 'auto', tint: '#FFE0EC' },
  { rot: '5deg',  top: '4%',   left: 'auto', right: '0%',   bottom: 'auto', tint: '#FFEDB6' },
  { rot: '4deg',  top: 'auto', left: '12%',  right: 'auto', bottom: '0%',   tint: '#D7F5E2' },
  { rot: '-8deg', top: 'auto', left: 'auto', right: '6%',   bottom: '6%',   tint: '#D4EEF7' },
];

/* ── section wrapper ── */
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #F4EEE3' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  outline: 'none', fontFamily: 'inherit', width: '100%',
};
const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4, display: 'block' };

/* ── sortable image upload slot ── */
function SortableImageSlot(props: { id: string; url: string; index: number; onUpload: (url: string) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    position: 'relative',
  };
  return (
    <div ref={setNodeRef} style={style}>
      <ImageSlot
        url={props.url}
        index={props.index}
        onUpload={props.onUpload}
        onRemove={props.onRemove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

/* ── image upload slot ── */
function ImageSlot({ url, onUpload, onRemove, index, dragHandleProps }: { url: string; onUpload: (url: string) => void; onRemove: () => void; index: number; dragHandleProps?: React.HTMLAttributes<HTMLDivElement> }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('tag', 'hero');
      const [saved] = (await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
      onUpload(saved.url);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); if (ref.current) ref.current.value = ''; }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={lbl}>Image {index + 1}</span>
      <div
        {...(dragHandleProps || {})}
        onClick={() => !uploading && !url && ref.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
        onDragOver={(e) => e.preventDefault()}
        title={url ? 'Drag to reorder' : 'Click or drop a file to upload'}
        style={{
          touchAction: 'none', userSelect: 'none',
          width: '100%', aspectRatio: '1', borderRadius: 12, overflow: 'hidden',
          border: url ? '1px solid #E8DFD2' : '2px dashed #D8CFBF',
          background: url ? 'transparent' : '#FAF6EF',
          cursor: url ? 'grab' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        {url ? (
          <>
            <Image src={imgUrl(url)} alt="" fill style={{ objectFit: 'cover' }} sizes="200px" />
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 0, color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, lineHeight: 1 }}
            >×</button>
          </>
        ) : uploading ? (
          <svg className="animate-spin" style={{ width: 24, height: 24, color: '#8B8176' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" opacity=".75" />
          </svg>
        ) : (
          <div style={{ textAlign: 'center', color: '#A89E92' }}>
            <div style={{ fontSize: 22 }}>🖼</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Click or drop</div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      </div>
      {url && (
        <button
          onClick={() => ref.current?.click()}
          style={{ fontSize: 11, color: '#5A5048', background: 'none', border: '1px solid #E8DFD2', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit' }}
        >Replace</button>
      )}
    </div>
  );
}

/* ── main page ── */
const DEFAULT_STATS = [
  { num: '1,200+', label: 'Products' },
  { num: '8', label: 'Categories' },
  { num: '7-day', label: 'Easy Returns' },
];

export default function HeroAdminPage() {
  const qc = useQueryClient();

  const { data: banners = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-banners'],
    queryFn: () => api.get('/banners/admin/all').then((r) => r.data),
  });

  const hero = banners.find((b) => b.slot === 'hero');

  const [form, setForm] = useState<any>({
    title: '', eyebrow: '', subtitle: '',
    cta: '', ctaLink: '/products',
    secondaryCta: 'Read the journal', secondaryCtaLink: '/blog',
    stats: DEFAULT_STATS,
    heroImages: ['', '', '', ''],
    badgeTopLine: 'Up to', badgeValue: '40%', badgeBottomLine: 'off sale',
    active: true,
  });

  useEffect(() => {
    if (!hero) return;
    setForm({
      title:            hero.title || '',
      eyebrow:          hero.eyebrow || '',
      subtitle:         hero.subtitle || '',
      cta:              hero.cta || '',
      ctaLink:          hero.ctaLink || '/products',
      secondaryCta:     hero.secondaryCta || 'Read the journal',
      secondaryCtaLink: hero.secondaryCtaLink || '/blog',
      stats:            hero.stats?.length ? hero.stats : DEFAULT_STATS,
      heroImages:       hero.heroImages?.length === 4 ? hero.heroImages : ['', '', '', ''],
      badgeTopLine:     hero.badgeTopLine || 'Up to',
      badgeValue:       hero.badgeValue || '40%',
      badgeBottomLine:  hero.badgeBottomLine || 'off sale',
      active:           hero.active ?? true,
    });
  }, [hero]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, slot: 'hero', order: 0 };
      return hero?._id
        ? api.put(`/banners/${hero._id}`, payload)
        : api.post('/banners', payload);
    },
    onSuccess: () => { toast.success('Hero section saved!'); qc.invalidateQueries({ queryKey: ['admin-banners'] }); },
    onError: () => toast.error('Save failed'),
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }));

  function setStat(i: number, k: 'num' | 'label', v: string) {
    const stats = [...form.stats];
    stats[i] = { ...stats[i], [k]: v };
    setForm((p: any) => ({ ...p, stats }));
  }

  function setImage(i: number, url: string) {
    const imgs = [...form.heroImages];
    imgs[i] = url;
    setForm((p: any) => ({ ...p, heroImages: imgs }));
  }

  // Drag-and-drop reorder for the 4 hero collage slots
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  function handleImageReorder(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = form.heroImages.map((_: string, i: number) => `slot-${i}`);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    setForm((p: any) => ({ ...p, heroImages: arrayMove(p.heroImages, oldIdx, newIdx) }));
  }

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: '#A89E92', fontSize: 13 }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Hero Section</h1>
          <p style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>Manage the full-width hero banner shown at the top of the homepage.</p>
        </div>
        <Button size="md" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          Save Hero
        </Button>
      </div>

      {/* Text content */}
      <Section title="Text Content">
        <div>
          <label style={lbl}>Eyebrow / Badge Text</label>
          <input style={inp} value={form.eyebrow} onChange={f('eyebrow')} placeholder="Spring '26 · Making childhood more joyful" />
        </div>
        <div>
          <label style={lbl}>Headline *</label>
          <textarea
            style={{ ...inp, minHeight: 72, resize: 'vertical', lineHeight: 1.5 }}
            value={form.title}
            onChange={f('title')}
            placeholder="Big smiles, handpicked toys."
          />
        </div>
        <div>
          <label style={lbl}>Subheading</label>
          <textarea
            style={{ ...inp, minHeight: 60, resize: 'vertical', lineHeight: 1.5 }}
            value={form.subtitle}
            onChange={f('subtitle')}
            placeholder="Bangladesh's friendliest toy house…"
          />
        </div>
      </Section>

      {/* CTA buttons */}
      <Section title="CTA Buttons">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Primary Button Text" value={form.cta} onChange={f('cta')} placeholder="Shop new arrivals" />
          <Input label="Primary Button Link" value={form.ctaLink} onChange={f('ctaLink')} placeholder="/products" />
          <Input label="Secondary Button Text" value={form.secondaryCta} onChange={f('secondaryCta')} placeholder="Read the journal" />
          <Input label="Secondary Button Link" value={form.secondaryCtaLink} onChange={f('secondaryCtaLink')} placeholder="/blog" />
        </div>
      </Section>

      {/* Stats */}
      <Section title="Stats Bar" subtitle="Three numbers shown below the CTA buttons">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {form.stats.map((s: { num: string; label: string }, i: number) => (
            <div key={i} className="adm-grid-2" style={{ alignItems: 'center' }}>
              <div>
                <label style={lbl}>Stat {i + 1} — Number</label>
                <input style={inp} value={s.num} onChange={(e) => setStat(i, 'num', e.target.value)} placeholder="64+" />
              </div>
              <div>
                <label style={lbl}>Stat {i + 1} — Label</label>
                <input style={inp} value={s.label} onChange={(e) => setStat(i, 'label', e.target.value)} placeholder="Trusted Brands" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Collage images + live preview side-by-side */}
      <Section
        title="Collage Images"
        subtitle="4 photos displayed as a stacked card collage on the right side of the hero. Drag the ⋮⋮ handle to reorder — the preview updates instantly."
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-20 items-start">
          {/* Left — image slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageReorder}>
              <SortableContext
                items={form.heroImages.map((_: string, i: number) => `slot-${i}`)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-4 gap-3">
                  {form.heroImages.map((url: string, i: number) => (
                    <SortableImageSlot
                      key={`slot-${i}`}
                      id={`slot-${i}`}
                      index={i}
                      url={url}
                      onUpload={(u) => setImage(i, u)}
                      onRemove={() => setImage(i, '')}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <p style={{ fontSize: 11, color: '#A89E92', margin: 0 }}>
              Recommended: square images, at least 600×600px. Rotations and positions are automatic.
            </p>
          </div>

          {/* Right — live preview (centered in its column) */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifySelf: 'center', width: '100%' }}>
            <div style={{ ...lbl, marginBottom: 8, width: '100%', maxWidth: 320, textAlign: 'center' }}>Live preview</div>
            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 320,
              aspectRatio: '5 / 4',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #FFE0EC 0%, #FFE9D6 35%, #E5F1FB 75%, #E5DEFA 100%)',
              padding: 6,
              overflow: 'hidden',
              border: '1px solid #E8DFD2',
            }}>
              {HERO_CARD_PREVIEW.map((card, i) => {
                const url = form.heroImages[i] || '';
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    top: card.top, left: card.left, right: card.right, bottom: card.bottom,
                    width: '54%', aspectRatio: '1',
                    transform: `rotate(${card.rot})`,
                    background: card.tint,
                    border: '4px solid #FFFFFF',
                    borderRadius: 18,
                    boxShadow: '0 16px 32px -12px rgba(31,47,74,.25)',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {url ? (
                      <Image src={imgUrl(url)} alt="" fill style={{ objectFit: 'cover' }} sizes="220px" />
                    ) : (
                      <span style={{ fontSize: 11, color: '#7A8299', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                        Image {i + 1}
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Center sale badge mirror */}
              <div style={{
                position: 'absolute',
                top: '42%', left: '42%',
                transform: 'translate(-50%, -50%) rotate(-12deg)',
                width: 64, height: 64, borderRadius: '50%',
                background: '#FFFBF2',
                border: '2px dashed rgba(255,111,177,.45)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                boxShadow: '0 8px 18px -8px rgba(0,0,0,0.25)',
                zIndex: 5,
              }}>
                <span style={{ fontSize: 6, fontWeight: 700, letterSpacing: '.12em', color: '#7A8299', textTransform: 'uppercase' }}>{form.badgeTopLine || 'Up to'}</span>
                <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1, color: '#EC5D4A' }}>{form.badgeValue || '40%'}</span>
                <span style={{ fontSize: 7, color: '#1F2F4A', fontWeight: 700, letterSpacing: '.04em' }}>{form.badgeBottomLine || 'off sale'}</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Sale badge */}
      <Section title="Sale Badge" subtitle="The circular sticker overlaid on the collage">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 200 }}>
            <div>
              <label style={lbl}>Top Line</label>
              <input style={inp} value={form.badgeTopLine} onChange={f('badgeTopLine')} placeholder="Up to" />
            </div>
            <div>
              <label style={lbl}>Main Value</label>
              <input style={inp} value={form.badgeValue} onChange={f('badgeValue')} placeholder="40%" />
            </div>
            <div>
              <label style={lbl}>Bottom Line</label>
              <input style={inp} value={form.badgeBottomLine} onChange={f('badgeBottomLine')} placeholder="off sale" />
            </div>
          </div>

          {/* Live preview */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: '#FFFBF2', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              boxShadow: '0 8px 20px -4px rgba(0,0,0,.2)',
              border: '3px dashed rgba(236,93,74,.2)',
              transform: 'rotate(-12deg)',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.15em', color: '#1F2F4A', textTransform: 'uppercase', fontFamily: 'monospace' }}>{form.badgeTopLine || 'Up to'}</span>
              <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: '#EC5D4A' }}>{form.badgeValue || '40%'}</span>
              <span style={{ fontSize: 10, color: '#344463', fontWeight: 600 }}>{form.badgeBottomLine || 'off sale'}</span>
            </div>
          </div>
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="md" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          Save Hero
        </Button>
      </div>
    </div>
  );
}
