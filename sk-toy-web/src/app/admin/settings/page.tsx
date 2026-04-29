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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '@/lib/api';
import { Settings } from '@/types';
import { imgUrl } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Tooltip from '@/components/ui/Tooltip';

/* ── shared styles ─────────────────────────────────────────────────────── */
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

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #F4EEE3' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  );
}

/* ── Pages / CMS ────────────────────────────────────────────────────────── */
const FIXED_PAGES = [
  { slug: 'shipping-info',  title: 'Shipping Info',      icon: '🚚', desc: 'Delivery zones, timelines & charges' },
  { slug: 'faq',            title: 'FAQ',                icon: '💬', desc: 'Frequently asked questions' },
  { slug: 'privacy-policy', title: 'Privacy Policy',     icon: '🔒', desc: 'Data collection & usage policy' },
  { slug: 'terms',          title: 'Terms & Conditions', icon: '📄', desc: 'Rules governing use of the store' },
  { slug: 'about',          title: 'About SK Toy',       icon: '🏪', desc: 'Story, mission & team' },
] as const;

const BLOCK_TYPES = [
  { type: 'heading',   label: 'Heading',   color: '#6FB8D9' },
  { type: 'paragraph', label: 'Paragraph', color: '#4FA36A' },
  { type: 'qa',        label: 'Q & A',     color: '#F5C443' },
  { type: 'list',      label: 'List',      color: '#F39436' },
  { type: 'divider',   label: 'Divider',   color: '#D8CFBF' },
];

function BlockEditor({ blocks, onChange }: { blocks: any[]; onChange: (b: any[]) => void }) {
  function add(type: string) { onChange([...blocks, { type, text: '', q: '', a: '', items: [] }]); }
  function remove(i: number) { onChange(blocks.filter((_, j) => j !== i)); }
  function up(i: number) { if (i === 0) return; const b = [...blocks]; [b[i-1], b[i]] = [b[i], b[i-1]]; onChange(b); }
  function down(i: number) { if (i === blocks.length-1) return; const b = [...blocks]; [b[i], b[i+1]] = [b[i+1], b[i]]; onChange(b); }
  function update(i: number, k: string, v: any) { const b = [...blocks]; b[i] = { ...b[i], [k]: v }; onChange(b); }

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
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#A89E92', fontSize: 13, background: '#FAF6EF', borderRadius: 10, border: '2px dashed #E8DFD2' }}>
          No content yet — add a block above
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
                <button onClick={() => up(i)} disabled={i === 0} style={{ border: 0, background: 'none', cursor: 'pointer', color: '#A89E92', fontSize: 14, padding: '2px 7px', borderRadius: 5, opacity: i === 0 ? 0.25 : 1 }}>↑</button>
                <button onClick={() => down(i)} disabled={i === blocks.length-1} style={{ border: 0, background: 'none', cursor: 'pointer', color: '#A89E92', fontSize: 14, padding: '2px 7px', borderRadius: 5, opacity: i === blocks.length-1 ? 0.25 : 1 }}>↓</button>
                <button onClick={() => remove(i)} style={{ border: 0, background: 'none', cursor: 'pointer', color: '#A89E92', fontSize: 18, padding: '2px 7px', borderRadius: 5, lineHeight: 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B2914'; (e.currentTarget as HTMLElement).style.background = '#FBDED8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#A89E92'; (e.currentTarget as HTMLElement).style.background = 'none'; }}>×</button>
              </div>
            </div>
            <div style={{ padding: '16px 18px' }}>
              {block.type === 'divider' && <div style={{ height: 2, background: '#E8DFD2', borderRadius: 2, margin: '4px 0' }} />}
              {block.type === 'heading' && <input value={block.text||''} onChange={e => update(i,'text',e.target.value)} placeholder="Section heading…" style={{ ...inp, fontSize: 16, fontWeight: 600 }} />}
              {block.type === 'paragraph' && <textarea value={block.text||''} onChange={e => update(i,'text',e.target.value)} placeholder="Write your paragraph here…" rows={6} style={{ ...inp, resize: 'vertical', lineHeight: 1.75 }} />}
              {block.type === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(block.items||[]).map((item: string, j: number) => (
                    <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: '#F39436', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>•</span>
                      <input value={item} onChange={e => { const it=[...(block.items||[])]; it[j]=e.target.value; update(i,'items',it); }} placeholder="List item…" style={inp} />
                      <button onClick={() => update(i,'items',(block.items||[]).filter((_:any,k:number)=>k!==j))} style={{ border:0, background:'none', cursor:'pointer', color:'#A89E92', fontSize:18, lineHeight:1, padding:'2px 5px', borderRadius:4 }}>×</button>
                    </div>
                  ))}
                  <button onClick={() => update(i,'items',[...(block.items||[]),''])} style={{ alignSelf:'flex-start', padding:'5px 14px', borderRadius:20, border:'1px solid #E8DFD2', background:'#FAF6EF', color:'#5A5048', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>+ Add item</button>
                </div>
              )}
              {block.type === 'qa' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><label style={lbl}>Question</label><input value={block.q||''} onChange={e => update(i,'q',e.target.value)} placeholder="What is your return policy?" style={{ ...inp, fontWeight: 500 }} /></div>
                  <div><label style={lbl}>Answer</label><textarea value={block.a||''} onChange={e => update(i,'a',e.target.value)} placeholder="We accept returns within 7 days…" rows={4} style={{ ...inp, resize:'vertical', lineHeight:1.7 }} /></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Tabs ───────────────────────────────────────────────────────────────── */
const TABS = [
  { key: 'store', label: 'Store', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>) },
  { key: 'seo', label: 'SEO', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>) },
  { key: 'social', label: 'Social', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>) },
  { key: 'policies', label: 'Policies', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>) },
  { key: 'shipping', label: 'Shipping', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 4v4h-7"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>) },
  { key: 'storefront', label: 'Storefront', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>) },
  { key: 'payments', label: 'Payments', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>) },
  { key: 'pages', label: 'Pages', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>) },
  { key: 'benefits', label: 'Benefits', icon: (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>) },
] as const;

type TabKey = typeof TABS[number]['key'];

/* ── main page ─────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('store');

  // Settings
  const { data, isLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
  });
  const [form, setForm] = useState<any>({
    store: { name: '', tagline: '', email: '', phone: '', address: '', logoText: '', logo: '' },
    locale: { currency: 'BDT', currencySymbol: '৳' },
    social: { facebook: '', instagram: '', youtube: '', whatsapp: '', tiktok: '' },
    policies: { returnDays: 7, freeShippingOver: '', codChargeBdt: 60, giftWrapCost: 50 },
    topStrip: { enabled: false, messages: [''] },
    seo: { title: '', description: '', keywords: '' },
    paymentMethods: {
      cod:   { enabled: true,  label: 'Cash on Delivery', description: 'Pay when you receive the parcel' },
      bkash: { enabled: true,  label: 'bKash',            description: 'Pay securely via bKash' },
    },
  });
  useEffect(() => { if (data) setForm(data); }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/settings', form),
    onSuccess: () => { toast.success('Settings saved!'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Failed to save'),
  });

  const sn = (section: string, key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f: any) => ({ ...f, [section]: { ...f[section], [key]: e.target.value } }));
  const snNum = (section: string, key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f: any) => ({ ...f, [section]: { ...f[section], [key]: Number(e.target.value) } }));

  const logoRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData(); fd.append('files', file); fd.append('tag', 'logo');
      const [saved] = (await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
      setForm((f: any) => ({ ...f, store: { ...f.store, logo: saved.url } }));
      toast.success('Logo uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setLogoUploading(false); if (logoRef.current) logoRef.current.value = ''; }
  }

  // Pages / CMS
  const { data: cmsPages = [] } = useQuery<any[]>({
    queryKey: ['cms-pages-admin'],
    queryFn: () => api.get('/cms/admin/all').then(r => r.data),
  });
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState<any>(null);

  const savePageMutation = useMutation({
    mutationFn: (data: any) => {
      const existing = cmsPages.find((p: any) => p.slug === editingPage);
      return existing ? api.put(`/cms/${existing._id}`, data) : api.post('/cms', data);
    },
    onSuccess: () => {
      toast.success('Page saved!');
      qc.invalidateQueries({ queryKey: ['cms-pages-admin'] });
      setEditingPage(null); setPageForm(null);
    },
    onError: () => toast.error('Save failed'),
  });

  function openPage(slug: string, title: string) {
    const existing = cmsPages.find((p: any) => p.slug === slug);
    setPageForm(existing
      ? { title: existing.title, slug: existing.slug, status: existing.status, blocks: existing.blocks || [] }
      : { title, slug, status: 'published', blocks: [] }
    );
    setEditingPage(slug);
  }

  // Benefits
  const { data: benefits = [] } = useQuery<any[]>({
    queryKey: ['benefits-admin'],
    queryFn: () => api.get('/benefits/admin/all').then((r) => r.data),
  });
  const { data: catsFlat = [] } = useQuery<any[]>({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/flat').then((r) => r.data),
    enabled: activeTab === 'benefits',
  });
  const [editingBenefit, setEditingBenefit] = useState<boolean>(false);
  const [benefitForm, setBenefitForm] = useState<any>(null);

  const saveBenefitMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        title: data.title,
        items: (data.items || []).filter((i: any) => i.title?.trim()),
        applyToAll: data.applyToAll,
        categories: data.applyToAll ? [] : data.categories,
        status: data.status,
        order: data.order,
      };
      return data._id ? api.put(`/benefits/${data._id}`, payload) : api.post('/benefits', payload);
    },
    onSuccess: () => {
      toast.success('Saved!');
      qc.invalidateQueries({ queryKey: ['benefits-admin'] });
      setEditingBenefit(false); setBenefitForm(null);
    },
    onError: () => toast.error('Save failed'),
  });

  const deleteBenefitMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/benefits/${id}`),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['benefits-admin'] });
    },
    onError: () => toast.error('Delete failed'),
  });

  const reorderBenefitsMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => api.put('/benefits/reorder', { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['benefits-admin'] }),
    onError: () => toast.error('Reorder failed'),
  });

  function openNewBenefit() {
    setBenefitForm({ title: 'Premium Benefits', items: [{ title: '', description: '' }], applyToAll: true, categories: [], status: 'published', order: benefits.length });
    setEditingBenefit(true);
  }
  function openEditBenefit(b: any) {
    setBenefitForm({
      _id: b._id,
      title: b.title || 'Premium Benefits',
      items: (b.items?.length ? b.items : [{ title: '', description: '' }]).map((i: any) => ({ _id: i._id, title: i.title || '', description: i.description || '' })),
      applyToAll: b.applyToAll ?? true,
      categories: (b.categories || []).map((c: any) => (typeof c === 'object' ? c._id : c)),
      status: b.status || 'published',
      order: b.order || 0,
    });
    setEditingBenefit(true);
  }

  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleBenefitsListReorder(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = benefits.findIndex((b: any) => b._id === active.id);
    const newIndex = benefits.findIndex((b: any) => b._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(benefits, oldIndex, newIndex);
    qc.setQueryData(['benefits-admin'], reordered);
    reorderBenefitsMutation.mutate(reordered.map((b: any, i: number) => ({ id: b._id, order: i })));
  }

  function handleItemsReorder(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBenefitForm((f: any) => {
      const ids = f.items.map((_: any, i: number) => `item-${i}`);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex < 0 || newIndex < 0) return f;
      return { ...f, items: arrayMove(f.items, oldIndex, newIndex) };
    });
  }

  if (isLoading) return <div style={{ textAlign: 'center', paddingTop: 80, color: '#A89E92', fontSize: 13 }}>Loading…</div>;

  const isPages = activeTab === 'pages';
  const isBenefits = activeTab === 'benefits';
  const hideTopHeader = editingPage || editingBenefit;
  const hideBottomSave = isPages || isBenefits || editingPage || editingBenefit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Page header */}
      {!hideTopHeader && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Store Settings</h1>
            <p style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>Manage your store configuration and preferences.</p>
          </div>
          {!isPages && !isBenefits && <Button size="md" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Save Changes</Button>}
        </div>
      )}

      {/* Tab bar */}
      {!hideTopHeader && (
        <div style={{ display: 'flex', gap: 2, background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, padding: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 8, border: 0, cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: 'inherit',
                color: active ? '#EC5D4A' : '#5A5048',
                background: active ? '#FEF3F1' : 'transparent',
                transition: 'background .12s, color .12s',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = '#FAF6EF'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Store ── */}
        {activeTab === 'store' && (<>
          <Card title="Store Logo" subtitle="Shown in the storefront header and emails">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 100, height: 100, borderRadius: 14, border: '1px solid #E8DFD2', background: '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {form.store?.logo ? <Image src={imgUrl(form.store.logo)} alt="Logo" width={100} height={100} style={{ objectFit: 'contain', width: '100%', height: '100%' }} /> : <span style={{ fontSize: 36, color: '#D8CFBF' }}>🏪</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadLogo} />
                <Button size="sm" variant="outline" onClick={() => logoRef.current?.click()} loading={logoUploading}>{form.store?.logo ? 'Replace Logo' : 'Upload Logo'}</Button>
                {form.store?.logo && <button onClick={() => setForm((f: any) => ({ ...f, store: { ...f.store, logo: '' } }))} style={{ fontSize: 12, color: '#9B2914', background: 'none', border: 0, cursor: 'pointer', textAlign: 'left', padding: 0 }}>Remove logo</button>}
                <span style={{ fontSize: 11, color: '#A89E92' }}>PNG, JPG, SVG · recommended 200×60 px</span>
              </div>
            </div>
          </Card>
          <Card title="Store Information" subtitle="Basic details about your store">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Store Name" value={form.store?.name || ''} onChange={sn('store', 'name')} />
              <Input label="Tagline" value={form.store?.tagline || ''} onChange={sn('store', 'tagline')} />
              <Input label="Logo Text" value={form.store?.logoText || ''} onChange={sn('store', 'logoText')} hint="Shown if no image logo" />
              <Input label="Email" type="email" value={form.store?.email || ''} onChange={sn('store', 'email')} />
              <Input label="Phone" value={form.store?.phone || ''} onChange={sn('store', 'phone')} />
              <Input label="Timezone" value={form.store?.timezone || ''} onChange={sn('store', 'timezone')} placeholder="Asia/Dhaka" />
              <Input label="Address" value={form.store?.address || ''} onChange={sn('store', 'address')} className="sm:col-span-2 lg:col-span-3" />
            </div>
          </Card>
          <Card title="Currency & Locale" subtitle="Affects how prices are displayed">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Currency Code" value={form.locale?.currency || ''} onChange={sn('locale', 'currency')} placeholder="BDT" />
              <Input label="Currency Symbol" value={form.locale?.currencySymbol || ''} onChange={sn('locale', 'currencySymbol')} placeholder="৳" />
            </div>
          </Card>
        </>)}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (
          <Card title="Search Engine Optimisation" subtitle="Default meta tags used when pages don't have their own SEO settings">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Meta Title" value={form.seo?.title || ''} onChange={sn('seo', 'title')} hint="Recommended: 50–60 characters" />
              <div>
                <label style={lbl}>Meta Description</label>
                <textarea value={form.seo?.description || ''} onChange={sn('seo', 'description')} rows={3} placeholder="A short description of your store shown in search results…" style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
                <div style={{ fontSize: 11, color: '#A89E92', marginTop: 3 }}>Recommended: 150–160 characters</div>
              </div>
              <Input label="Keywords" value={form.seo?.keywords || ''} onChange={sn('seo', 'keywords')} hint="Comma-separated, e.g. toys, kids, dhaka, bangladesh" />
            </div>
            {(form.seo?.title || form.seo?.description) && (
              <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '14px 16px', border: '1px solid #E8DFD2', marginTop: 4 }}>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Search Preview</div>
                <div style={{ fontSize: 14, color: '#1a0dab', fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.seo?.title || 'Page Title'}</div>
                <div style={{ fontSize: 12, color: '#006621', marginBottom: 4 }}>sktoy.com.bd</div>
                <div style={{ fontSize: 13, color: '#545454', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{form.seo?.description || ''}</div>
              </div>
            )}
          </Card>
        )}

        {/* ── Social ── */}
        {activeTab === 'social' && (
          <Card title="Social Media Links" subtitle="Appear in the storefront footer and contact pages">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { key: 'facebook',  label: 'Facebook URL',    placeholder: 'https://facebook.com/sktoy',  color: '#1877F2' },
                { key: 'instagram', label: 'Instagram URL',   placeholder: 'https://instagram.com/sktoy', color: '#E1306C' },
                { key: 'youtube',   label: 'YouTube URL',     placeholder: 'https://youtube.com/@sktoy',  color: '#FF0000' },
                { key: 'tiktok',    label: 'TikTok URL',      placeholder: 'https://tiktok.com/@sktoy',   color: '#010101' },
                { key: 'whatsapp',  label: 'WhatsApp Number', placeholder: '8801XXXXXXXXX',               color: '#25D366' },
              ] as const).map(({ key, label, placeholder, color }) => (
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '8px 0 0 8px', background: color+'18', border: `1px solid ${color}33`, borderRight: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    </div>
                    <input value={(form.social?.[key] as string) || ''} onChange={sn('social', key)} placeholder={placeholder} style={{ ...inp, borderRadius: '0 8px 8px 0', flex: 1, borderLeft: 'none' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Policies ── */}
        {activeTab === 'policies' && (<>
          <Card title="Order Policies" subtitle="These values appear on product pages, checkout, and confirmation emails">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="Return Window (days)" type="number" value={form.policies?.returnDays ?? 7} onChange={snNum('policies', 'returnDays')} hint="e.g. 7 means 7-day returns" />
              <Input label="Free Shipping Over (৳)" type="number" value={form.policies?.freeShippingOver || ''} onChange={snNum('policies', 'freeShippingOver')} hint="Leave blank to disable" />
              <Input label="COD Charge (৳)" type="number" value={form.policies?.codChargeBdt ?? 0} onChange={snNum('policies', 'codChargeBdt')} hint="Extra charge for cash on delivery" />
              <Input label="Gift Wrap Cost (৳)" type="number" value={form.policies?.giftWrapCost ?? 50} onChange={snNum('policies', 'giftWrapCost')} />
            </div>
          </Card>
          <Card title="Tax" subtitle="VAT settings applied to product prices">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gridColumn: '1 / -1' }}>
                <div><div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>Enable VAT</div><div style={{ fontSize: 11, color: '#8B8176' }}>Apply VAT to all taxable products</div></div>
                <Toggle checked={form.tax?.vatEnabled || false} onChange={(v) => setForm((f: any) => ({ ...f, tax: { ...f.tax, vatEnabled: v } }))} />
              </div>
              {form.tax?.vatEnabled && (<>
                <Input label="VAT Rate (%)" type="number" value={form.tax?.vatRate ?? 0} onChange={snNum('tax', 'vatRate')} />
                <Input label="VAT Registration No." value={form.tax?.vatNumber || ''} onChange={sn('tax', 'vatNumber')} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div><div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>VAT Inclusive</div><div style={{ fontSize: 11, color: '#8B8176' }}>Prices already include VAT</div></div>
                  <Toggle checked={form.tax?.vatInclusive || false} onChange={(v) => setForm((f: any) => ({ ...f, tax: { ...f.tax, vatInclusive: v } }))} />
                </div>
              </>)}
            </div>
          </Card>
        </>)}

        {/* ── Shipping ── */}
        {activeTab === 'shipping' && (<>
          <Card title="Delivery Options" subtitle="Both options appear as selectable cards on the checkout page and shipping info page">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {([
                { key: 'insideDhaka', label: 'Inside Dhaka', color: '#4FA36A', defaults: { title: 'Inside Dhaka', desc: 'Delivered within 1–2 business days', amount: 60 } },
                { key: 'outsideDhaka', label: 'Outside Dhaka', color: '#EC5D4A', defaults: { title: 'Outside Dhaka', desc: 'Delivered within 3–5 business days', amount: 120 } },
              ] as const).map(({ key, label, color, defaults }) => (
                <div key={key} style={{ background: '#FAF6EF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2A2420' }}>{label}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Label / Title"
                      value={form.shipping?.[key]?.title || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, shipping: { ...f.shipping, [key]: { ...f.shipping?.[key], title: e.target.value } } }))}
                      placeholder={defaults.title} />
                    <Input label="Short Description"
                      value={form.shipping?.[key]?.description || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, shipping: { ...f.shipping, [key]: { ...f.shipping?.[key], description: e.target.value } } }))}
                      placeholder={defaults.desc} />
                    <Input label="Delivery Fee (৳)" type="number"
                      value={form.shipping?.[key]?.amount ?? defaults.amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, shipping: { ...f.shipping, [key]: { ...f.shipping?.[key], amount: Number(e.target.value) } } }))}
                      placeholder={String(defaults.amount)} />
                    <Input label="Free Delivery Over (৳)" type="number"
                      value={form.shipping?.[key]?.freeOver || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, shipping: { ...f.shipping, [key]: { ...f.shipping?.[key], freeOver: Number(e.target.value) } } }))}
                      hint="Leave 0 or blank to disable" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ── Storefront ── */}
        {activeTab === 'storefront' && (
          <Card title="Top Announcement Strip" subtitle="A slim banner shown at the very top of every storefront page">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>Show announcement strip</div><div style={{ fontSize: 11, color: '#8B8176' }}>Messages rotate automatically when multiple are added</div></div>
              <Toggle checked={form.topStrip?.enabled || false} onChange={(v) => setForm((f: any) => ({ ...f, topStrip: { ...f.topStrip, enabled: v } }))} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={lbl}>Messages</label>
              {(form.topStrip?.messages || ['']).map((msg: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: '#F4EEE3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#8B8176', flexShrink: 0 }}>{i + 1}</div>
                  <input type="text" value={msg} onChange={(e) => { const msgs = [...(form.topStrip?.messages || [])]; msgs[i] = e.target.value; setForm((f: any) => ({ ...f, topStrip: { ...f.topStrip, messages: msgs } })); }} style={{ ...inp, flex: 1 }} placeholder="Free shipping over ৳2,500 · 7-day returns" />
                  <button onClick={() => { const msgs = (form.topStrip?.messages || []).filter((_: any, j: number) => j !== i); setForm((f: any) => ({ ...f, topStrip: { ...f.topStrip, messages: msgs } })); }} style={{ border: 0, background: 'none', cursor: 'pointer', padding: '4px 6px', color: '#A89E92', fontSize: 18, borderRadius: 6, lineHeight: 1 }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#9B2914'; (e.currentTarget as HTMLElement).style.background = '#FBDED8'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#A89E92'; (e.currentTarget as HTMLElement).style.background = 'none'; }}>×</button>
                </div>
              ))}
              <Button variant="outline" size="xs" onClick={() => setForm((f: any) => ({ ...f, topStrip: { ...f.topStrip, messages: [...(f.topStrip?.messages || []), ''] } }))}>+ Add Message</Button>
            </div>
            {form.topStrip?.enabled && (form.topStrip?.messages || []).filter(Boolean).length > 0 && (
              <div><label style={lbl}>Preview</label><div style={{ background: '#1F2F4A', color: '#FFFBF2', padding: '8px 16px', borderRadius: 8, fontSize: 12, textAlign: 'center', fontFamily: 'var(--font-mono-var, monospace)', letterSpacing: '.04em' }}>{form.topStrip.messages.filter(Boolean)[0]}</div></div>
            )}
          </Card>
        )}

        {/* ── Payments ── */}
        {activeTab === 'payments' && (
          <Card title="Payment Methods" subtitle="Enable or disable payment options shown to customers at checkout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['cod', 'bkash'] as const).map((key) => {
                const pm = form.paymentMethods?.[key] || {};
                const setpm = (field: string, val: any) => setForm((f: any) => ({ ...f, paymentMethods: { ...f.paymentMethods, [key]: { ...f.paymentMethods?.[key], [field]: val } } }));
                return (
                  <div key={key} style={{ border: '1px solid #E8DFD2', borderRadius: 12, padding: '16px 18px', background: pm.enabled ? '#FFFBF2' : '#FAF6EF', opacity: pm.enabled ? 1 : 0.6, transition: 'all .15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: pm.enabled ? 14 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: key === 'bkash' ? '#be185d18' : '#F4EEE3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {key === 'bkash' ? <span style={{ fontSize: 9, fontWeight: 900, color: '#be185d', letterSpacing: '-.02em' }}>bKash</span> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5048" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>{pm.label || (key === 'cod' ? 'Cash on Delivery' : 'bKash')}</div>
                          <div style={{ fontSize: 11, color: '#8B8176' }}>{pm.description || (key === 'cod' ? 'Pay on delivery' : 'Mobile banking')}</div>
                        </div>
                      </div>
                      <Toggle checked={pm.enabled ?? true} onChange={(v) => setpm('enabled', v)} label={pm.enabled ? 'Enabled' : 'Disabled'} />
                    </div>
                    {pm.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label style={lbl}>Label shown at checkout</label><input value={pm.label || ''} onChange={(e) => setpm('label', e.target.value)} style={inp} placeholder={key === 'cod' ? 'Cash on Delivery' : 'bKash'} /></div>
                        <div><label style={lbl}>Description shown at checkout</label><input value={pm.description || ''} onChange={(e) => setpm('description', e.target.value)} style={inp} placeholder={key === 'cod' ? 'Pay when you receive the parcel' : 'Pay securely via bKash'} /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── Pages ── */}
        {activeTab === 'pages' && !editingPage && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {FIXED_PAGES.map(({ slug, title, icon, desc }) => {
              const existing = cmsPages.find((p: any) => p.slug === slug);
              const published = existing?.status === 'published';
              const blockCount = existing?.blocks?.length || 0;
              return (
                <div key={slug} style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#2A2420' }}>{title}</div>
                      <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0, background: !existing ? '#F4EEE3' : published ? '#D8EBDC' : '#FBE7A8', color: !existing ? '#8B8176' : published ? '#2D7A4A' : '#7A5A00', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {!existing ? 'Empty' : published ? 'Live' : 'Draft'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #F4EEE3' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'monospace' }}>/pages/{slug}</div>
                      {blockCount > 0 && <div style={{ fontSize: 11, color: '#A89E92', marginTop: 2 }}>{blockCount} block{blockCount !== 1 ? 's' : ''}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Tooltip label="View page">
                        <a href={`/pages/${slug}`} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid #E8DFD2', background: '#FAF6EF', color: '#8B8176', textDecoration: 'none', cursor: 'pointer', transition: 'all .15s' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2A2420'; (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBF'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B8176'; (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD2'; }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      </Tooltip>
                      <Tooltip label="Edit page">
                        <button onClick={() => openPage(slug, title)}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid #E8DFD2', background: '#FAF6EF', color: '#8B8176', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2A2420'; (e.currentTarget as HTMLElement).style.borderColor = '#D8CFBF'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8B8176'; (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD2'; }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Benefits ── */}
        {activeTab === 'benefits' && !editingBenefit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#8B8176' }}>
                Highlight blocks shown at the bottom of product detail pages. Drag to reorder.
              </div>
              <Button size="sm" onClick={openNewBenefit}>+ New Benefit Block</Button>
            </div>

            {benefits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#A89E92', fontSize: 13, background: '#FFF', borderRadius: 12, border: '2px dashed #E8DFD2' }}>
                No benefit blocks yet. Click "New Benefit Block" to create one.
              </div>
            ) : (
              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleBenefitsListReorder}>
                <SortableContext items={benefits.map((b: any) => b._id)} strategy={verticalListSortingStrategy}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {benefits.map((b: any) => (
                      <SortableBenefitCard key={b._id} benefit={b} onEdit={() => openEditBenefit(b)}
                        onDelete={() => { if (confirm('Delete this benefit block?')) deleteBenefitMutation.mutate(b._id); }} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* ── Benefit editor (inline) ── */}
        {activeTab === 'benefits' && editingBenefit && benefitForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => { setEditingBenefit(false); setBenefitForm(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2A2420' }}>
                  {benefitForm._id ? 'Edit' : 'New'} Benefit Block
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#5A5048' }}>Published</span>
                  <Toggle checked={benefitForm.status === 'published'} onChange={(v) => setBenefitForm((f: any) => ({ ...f, status: v ? 'published' : 'draft' }))} />
                </div>
                <Button size="md" onClick={() => saveBenefitMutation.mutate(benefitForm)} loading={saveBenefitMutation.isPending}>Save</Button>
              </div>
            </div>

            <Card title="Heading">
              <Input label="Title" value={benefitForm.title} onChange={(e) => setBenefitForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="e.g. Premium Benefits" />
            </Card>

            <Card title="Where to show" subtitle="Choose which products will display this block.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="radio" checked={benefitForm.applyToAll} onChange={() => setBenefitForm((f: any) => ({ ...f, applyToAll: true }))} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>All products</div>
                    <div style={{ fontSize: 11, color: '#8B8176' }}>Show on every product detail page.</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="radio" checked={!benefitForm.applyToAll} onChange={() => setBenefitForm((f: any) => ({ ...f, applyToAll: false }))} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>Specific categories</div>
                    <div style={{ fontSize: 11, color: '#8B8176' }}>Only show on products in the selected categories.</div>
                  </div>
                </label>
                {!benefitForm.applyToAll && (
                  <div style={{ marginLeft: 26, padding: 12, background: '#FAF6EF', borderRadius: 8, border: '1px solid #F4EEE3' }}>
                    {catsFlat.length === 0 ? (
                      <div style={{ fontSize: 12, color: '#A89E92' }}>No categories available.</div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {catsFlat.map((c: any) => {
                          const active = benefitForm.categories.includes(c._id);
                          return (
                            <button key={c._id} type="button"
                              onClick={() => setBenefitForm((f: any) => ({ ...f, categories: f.categories.includes(c._id) ? f.categories.filter((x: string) => x !== c._id) : [...f.categories, c._id] }))}
                              style={{ padding: '5px 12px', borderRadius: 16, border: `1px solid ${active ? '#EC5D4A' : '#E8DFD2'}`, background: active ? '#EC5D4A' : '#FFF', color: active ? '#FFF' : '#5A5048', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #F4EEE3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Benefit Items</div>
                  <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>Drag the handle to reorder items.</div>
                </div>
                <button type="button" onClick={() => setBenefitForm((f: any) => ({ ...f, items: [...f.items, { title: '', description: '' }] }))}
                  style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #E8DFD2', background: '#FAF6EF', color: '#5A5048', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Item</button>
              </div>
              <div style={{ padding: 20 }}>
                {benefitForm.items.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#A89E92', fontSize: 13 }}>No items yet. Click "Add Item" above.</div>
                ) : (
                  <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleItemsReorder}>
                    <SortableContext items={benefitForm.items.map((_: any, i: number) => `item-${i}`)} strategy={verticalListSortingStrategy}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {benefitForm.items.map((item: any, i: number) => (
                          <SortableBenefitItem key={`item-${i}`} id={`item-${i}`} index={i}
                            item={item}
                            onChange={(k, v) => setBenefitForm((f: any) => { const items = [...f.items]; items[i] = { ...items[i], [k]: v }; return { ...f, items }; })}
                            onRemove={() => setBenefitForm((f: any) => ({ ...f, items: f.items.filter((_: any, j: number) => j !== i) }))}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => { setEditingBenefit(false); setBenefitForm(null); }}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <Button size="md" onClick={() => saveBenefitMutation.mutate(benefitForm)} loading={saveBenefitMutation.isPending}>Save</Button>
            </div>
          </div>
        )}

        {/* ── Page editor (inline) ── */}
        {activeTab === 'pages' && editingPage && pageForm && (() => {
          const pageMeta = FIXED_PAGES.find(p => p.slug === editingPage);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => { setEditingPage(null); setPageForm(null); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#2A2420' }}>{pageMeta?.icon} {pageMeta?.title}</div>
                    <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'monospace', marginTop: 2 }}>/pages/{editingPage}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#5A5048' }}>Published</span>
                    <Toggle checked={pageForm.status === 'published'} onChange={v => setPageForm((f: any) => ({ ...f, status: v ? 'published' : 'draft' }))} />
                  </div>
                  <Button size="md" onClick={() => savePageMutation.mutate(pageForm)} loading={savePageMutation.isPending}>Save Page</Button>
                </div>
              </div>

              <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '20px 24px' }}>
                <label style={lbl}>Page Title</label>
                <input value={pageForm.title} onChange={e => setPageForm((f: any) => ({ ...f, title: e.target.value }))} style={{ ...inp, fontSize: 15, fontWeight: 600 }} placeholder="Page title" />
              </div>

              <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #F4EEE3' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Content</div>
                  <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>
                    {editingPage === 'faq' ? 'Use Q & A blocks for each question. Add Heading blocks to group sections.' : 'Use Heading to create sections, Paragraph for body text, and List for bullet points.'}
                  </div>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <BlockEditor blocks={pageForm.blocks} onChange={blocks => setPageForm((f: any) => ({ ...f, blocks }))} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="md" onClick={() => savePageMutation.mutate(pageForm)} loading={savePageMutation.isPending}>Save Page</Button>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Bottom save bar — only for global-settings tabs */}
      {!hideBottomSave && (
        <div style={{ position: 'sticky', bottom: -60, zIndex: 10, margin: '24px -28px 0', padding: '12px 28px 60px', borderTop: '1px solid #E8DFD2', background: '#FAF6EF', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button size="md" variant="outline" onClick={() => { if (data) setForm(data); }}>Discard Changes</Button>
          <Button size="md" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}

/* ── Sortable Benefit Card (list view) ─────────────────────────────────── */
function DragHandle({ listeners, attributes, color = '#A89E92' }: { listeners?: any; attributes?: any; color?: string }) {
  return (
    <button
      {...attributes}
      {...listeners}
      type="button"
      aria-label="Drag to reorder"
      style={{ cursor: 'grab', touchAction: 'none', border: 0, background: 'transparent', padding: 6, color, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
    </button>
  );
}

function SortableBenefitCard({ benefit, onEdit, onDelete }: { benefit: any; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: benefit._id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  const published = benefit.status === 'published';
  const targetLabel = benefit.applyToAll
    ? 'All products'
    : (benefit.categories?.length ? `${benefit.categories.length} categor${benefit.categories.length === 1 ? 'y' : 'ies'}` : 'No targets');

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
        <DragHandle listeners={listeners} attributes={attributes} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#2A2420' }}>{benefit.title}</div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
              background: published ? '#D8EBDC' : '#FBE7A8',
              color: published ? '#2D7A4A' : '#7A5A00',
              textTransform: 'uppercase', letterSpacing: '.06em',
            }}>{published ? 'Live' : 'Draft'}</span>
          </div>
          <div style={{ fontSize: 11, color: '#8B8176', marginTop: 4 }}>
            {benefit.items?.length || 0} item{(benefit.items?.length || 0) !== 1 ? 's' : ''} • {targetLabel}
          </div>
          {!benefit.applyToAll && benefit.categories?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
              {benefit.categories.slice(0, 5).map((c: any) => (
                <span key={c._id || c} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 12, background: '#FEF7F0', color: '#5A5048', border: '1px solid #F4EEE3' }}>{c.name || c}</span>
              ))}
              {benefit.categories.length > 5 && (
                <span style={{ fontSize: 10, color: '#A89E92' }}>+{benefit.categories.length - 5} more</span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onEdit} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#5A5048', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
          <button onClick={onDelete} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E8DFD2', background: '#FFF', color: '#9B2914', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Sortable Benefit Item (editor) ────────────────────────────────────── */
function SortableBenefitItem({ id, index, item, onChange, onRemove }: { id: string; index: number; item: any; onChange: (k: 'title' | 'description', v: string) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  const inpStyle: React.CSSProperties = {
    border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px',
    fontSize: 13, color: '#2A2420', background: '#FFF',
    outline: 'none', fontFamily: 'inherit', width: '100%',
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ background: '#FAF6EF', border: '1px solid #E8DFD2', borderRadius: 10, padding: 14, display: 'flex', gap: 10 }}>
        <div style={{ paddingTop: 2 }}>
          <DragHandle listeners={listeners} attributes={attributes} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em' }}>Item {index + 1}</span>
            <button type="button" onClick={onRemove}
              style={{ border: 0, background: 'none', cursor: 'pointer', color: '#A89E92', fontSize: 18, padding: '2px 7px', borderRadius: 5, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={item.title} onChange={(e) => onChange('title', e.target.value)} placeholder="Item title (e.g. 100% Original)" style={{ ...inpStyle, fontWeight: 600 }} />
            <textarea value={item.description || ''} onChange={(e) => onChange('description', e.target.value)} placeholder="Short description…" rows={2} style={{ ...inpStyle, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
