'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';

/* ── Fixed pages ──────────────────────────────────────────────────────────── */
const FIXED_PAGES = [
  { slug: 'shipping-info',    title: 'Shipping Info',      icon: '🚚', desc: 'Delivery zones, timelines & charges' },
  { slug: 'faq',              title: 'FAQ',                icon: '💬', desc: 'Frequently asked questions' },
  { slug: 'privacy-policy',   title: 'Privacy Policy',     icon: '🔒', desc: 'Data collection & usage policy' },
  { slug: 'terms',            title: 'Terms & Conditions', icon: '📄', desc: 'Rules governing use of the store' },
  { slug: 'about',            title: 'About SK Toy',       icon: '🏪', desc: 'Story, mission & team' },
] as const;

const inp: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  outline: 'none', fontFamily: 'inherit', width: '100%',
};
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#8B8176',
  textTransform: 'uppercase', letterSpacing: '.07em',
  marginBottom: 4, display: 'block',
};

const BLOCK_TYPES = [
  { type: 'heading',   label: 'Heading',   color: '#6FB8D9' },
  { type: 'paragraph', label: 'Paragraph', color: '#4FA36A' },
  { type: 'qa',        label: 'Q & A',     color: '#F5C443' },
  { type: 'list',      label: 'List',      color: '#F39436' },
  { type: 'divider',   label: 'Divider',   color: '#D8CFBF' },
];

/* ── Block editor component ───────────────────────────────────────────────── */
function BlockEditor({ blocks, onChange }: { blocks: any[]; onChange: (b: any[]) => void }) {
  function add(type: string) {
    onChange([...blocks, { type, text: '', q: '', a: '', items: [] }]);
  }
  function remove(i: number) { onChange(blocks.filter((_, j) => j !== i)); }
  function up(i: number) {
    if (i === 0) return;
    const b = [...blocks]; [b[i - 1], b[i]] = [b[i], b[i - 1]]; onChange(b);
  }
  function down(i: number) {
    if (i === blocks.length - 1) return;
    const b = [...blocks]; [b[i], b[i + 1]] = [b[i + 1], b[i]]; onChange(b);
  }
  function update(i: number, k: string, v: any) {
    const b = [...blocks]; b[i] = { ...b[i], [k]: v }; onChange(b);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {BLOCK_TYPES.map(({ type, label, color }) => (
          <button key={type} onClick={() => add(type)} style={{
            padding: '5px 14px', borderRadius: 20, border: `1px solid ${color}55`,
            background: color + '18', color: '#2A2420', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>+ {label}</button>
        ))}
      </div>

      {blocks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#A89E92', fontSize: 13, background: '#FAF6EF', borderRadius: 10, border: '2px dashed #E8DFD2' }}>
          No content yet — add a block above to get started
        </div>
      )}

      {blocks.map((block, i) => {
        const meta = BLOCK_TYPES.find(b => b.type === block.type) || BLOCK_TYPES[0];
        return (
          <div key={i} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#FAF6EF', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em' }}>{meta.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {(['↑', '↓'] as const).map((dir, di) => (
                  <button key={dir} onClick={() => di === 0 ? up(i) : down(i)}
                    disabled={di === 0 ? i === 0 : i === blocks.length - 1}
                    style={{ border: 0, background: 'none', cursor: 'pointer', color: '#A89E92', fontSize: 14, padding: '2px 7px', borderRadius: 5, opacity: (di === 0 ? i === 0 : i === blocks.length - 1) ? 0.25 : 1 }}>
                    {dir}
                  </button>
                ))}
                <button onClick={() => remove(i)}
                  style={{ border: 0, background: 'none', cursor: 'pointer', color: '#A89E92', fontSize: 18, padding: '2px 7px', borderRadius: 5, lineHeight: 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B2914'; (e.currentTarget as HTMLElement).style.background = '#FBDED8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#A89E92'; (e.currentTarget as HTMLElement).style.background = 'none'; }}>×</button>
              </div>
            </div>

            <div style={{ padding: '16px 18px' }}>
              {block.type === 'divider' && (
                <div style={{ height: 2, background: '#E8DFD2', borderRadius: 2, margin: '4px 0' }} />
              )}
              {block.type === 'heading' && (
                <input value={block.text || ''} onChange={e => update(i, 'text', e.target.value)}
                  placeholder="Section heading…" style={{ ...inp, fontSize: 16, fontWeight: 600 }} />
              )}
              {block.type === 'paragraph' && (
                <textarea value={block.text || ''} onChange={e => update(i, 'text', e.target.value)}
                  placeholder="Write your paragraph here…" rows={6}
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.75 }} />
              )}
              {block.type === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(block.items || []).map((item: string, j: number) => (
                    <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#F39436', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>•</span>
                      <input value={item}
                        onChange={e => { const it = [...(block.items || [])]; it[j] = e.target.value; update(i, 'items', it); }}
                        placeholder="List item…" style={inp} />
                      <button onClick={() => update(i, 'items', (block.items || []).filter((_: any, k: number) => k !== j))}
                        style={{ border: 0, background: 'none', cursor: 'pointer', color: '#A89E92', fontSize: 18, lineHeight: 1, padding: '2px 5px', borderRadius: 4 }}>×</button>
                    </div>
                  ))}
                  <button onClick={() => update(i, 'items', [...(block.items || []), ''])}
                    style={{ alignSelf: 'flex-start', padding: '5px 14px', borderRadius: 20, border: '1px solid #E8DFD2', background: '#FAF6EF', color: '#5A5048', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    + Add item
                  </button>
                </div>
              )}
              {block.type === 'qa' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={lbl}>Question</label>
                    <input value={block.q || ''} onChange={e => update(i, 'q', e.target.value)}
                      placeholder="What is your return policy?" style={{ ...inp, fontWeight: 500 }} />
                  </div>
                  <div>
                    <label style={lbl}>Answer</label>
                    <textarea value={block.a || ''} onChange={e => update(i, 'a', e.target.value)}
                      placeholder="We accept returns within 7 days of delivery…" rows={4}
                      style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function CmsPagesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);

  const { data: pages = [] } = useQuery<any[]>({
    queryKey: ['cms-pages-admin'],
    queryFn: () => api.get('/cms/admin/all').then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      const existing = pages.find((p: any) => p.slug === editing);
      return existing
        ? api.put(`/cms/${existing._id}`, data)
        : api.post('/cms', data);
    },
    onSuccess: () => {
      toast.success('Page saved!');
      qc.invalidateQueries({ queryKey: ['cms-pages-admin'] });
      setEditing(null);
      setForm(null);
    },
    onError: () => toast.error('Save failed'),
  });

  function openPage(slug: string, title: string) {
    const existing = pages.find((p: any) => p.slug === slug);
    setForm(existing
      ? { title: existing.title, slug: existing.slug, status: existing.status, blocks: existing.blocks || [] }
      : { title, slug, status: 'published', blocks: [] }
    );
    setEditing(slug);
  }

  /* ── Card grid ── */
  if (!editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Pages</h1>
          <p style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>Manage content for storefront information pages.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {FIXED_PAGES.map(({ slug, title, icon, desc }) => {
            const existing = pages.find((p: any) => p.slug === slug);
            const published = existing?.status === 'published';
            const blockCount = existing?.blocks?.length || 0;

            return (
              <div key={slug} style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#2A2420' }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0,
                    background: !existing ? '#F4EEE3' : published ? '#D8EBDC' : '#FBE7A8',
                    color: !existing ? '#8B8176' : published ? '#2D7A4A' : '#7A5A00',
                    textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>
                    {!existing ? 'Empty' : published ? 'Live' : 'Draft'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F4EEE3' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'monospace' }}>/pages/{slug}</div>
                    {blockCount > 0 && <div style={{ fontSize: 11, color: '#A89E92', marginTop: 2 }}>{blockCount} block{blockCount !== 1 ? 's' : ''}</div>}
                  </div>
                  <Button size="sm" onClick={() => openPage(slug, title)}>Edit Page</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Editor ── */
  const pageMeta = FIXED_PAGES.find(p => p.slug === editing);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { setEditing(null); setForm(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Back
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2A2420' }}>{pageMeta?.icon} {pageMeta?.title}</div>
            <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'monospace', marginTop: 2 }}>/pages/{editing}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#5A5048' }}>Published</span>
            <Toggle checked={form.status === 'published'} onChange={v => setForm((f: any) => ({ ...f, status: v ? 'published' : 'draft' }))} />
          </div>
          <Button size="md" onClick={() => saveMutation.mutate(form)} loading={saveMutation.isPending}>Save Page</Button>
        </div>
      </div>

      <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '20px 24px' }}>
        <label style={lbl}>Page Title</label>
        <input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))}
          style={{ ...inp, fontSize: 15, fontWeight: 600 }} placeholder="Page title" />
      </div>

      <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #F4EEE3' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Content</div>
          <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>
            {editing === 'faq'
              ? 'Use Q & A blocks for each question. Add Heading blocks to group related questions.'
              : 'Use Heading to create sections, Paragraph for body text, and List for bullet points.'}
          </div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <BlockEditor blocks={form.blocks} onChange={blocks => setForm((f: any) => ({ ...f, blocks }))} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="md" onClick={() => saveMutation.mutate(form)} loading={saveMutation.isPending}>Save Page</Button>
      </div>
    </div>
  );
}
