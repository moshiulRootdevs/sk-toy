'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import { imgUrl } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Select from '@/components/ui/Select';
import AdminIcon from '@/components/admin/AdminIcon';
import RichTextEditor from '@/components/admin/RichTextEditor';

/* ── helpers ── */
const AGE_GROUPS = [
  { value: '', label: '— Select —' },
  { value: 'age-0-2', label: '0–2 yrs' },
  { value: 'age-3-5', label: '3–5 yrs' },
  { value: 'age-6-8', label: '6–8 yrs' },
  { value: 'age-9-12', label: '9–12 yrs' },
  { value: 'age-teen', label: 'Teens' },
];
const GENDERS = [
  { value: '', label: '— Not specified —' },
  { value: 'neutral', label: 'Unisex / Neutral' },
  { value: 'boys', label: 'For Boys' },
  { value: 'girls', label: 'For Girls' },
];

// Valid enum values matching the Mongoose schema exactly
const VALID_GENDERS = new Set(['boys', 'girls', 'neutral', '']);
const VALID_AGE_GROUPS = new Set(['age-0-2', 'age-3-5', 'age-6-8', 'age-9-12', 'age-teen', '']);

const sanitizeGender = (v?: string) => VALID_GENDERS.has(v ?? '') ? (v ?? '') : '';
const sanitizeAgeGroup = (v?: string) => VALID_AGE_GROUPS.has(v ?? '') ? (v ?? '') : '';
const BADGES = [
  { value: '', label: '— none —' },
  { value: 'new', label: 'NEW' },
  { value: 'sale', label: 'SALE' },
  { value: 'featured', label: 'FEATURED' },
  { value: 'hot', label: 'HOT' },
  { value: 'clearance', label: 'CLEARANCE' },
];

const field: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 5,
};
const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#8B8176',
  textTransform: 'uppercase', letterSpacing: '.07em',
};
const input: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8, padding: '9px 12px',
  fontSize: 13, color: '#2A2420', background: '#FFF',
  outline: 'none', fontFamily: 'inherit', width: '100%',
};
const textarea: React.CSSProperties = {
  ...input, resize: 'vertical', lineHeight: 1.55,
};
const select: React.CSSProperties = {
  ...input, cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B8176' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  paddingRight: 28,
};

function Field({ label: lbl, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ ...field, gridColumn: half ? undefined : undefined }}>
      <label style={label}>{lbl}</label>
      {children}
    </div>
  );
}

/* ── helpers ── */
const isVideo = (url: string) => /\.(mp4|webm|mov|ogg|avi|mkv)(\?.*)?$/i.test(url);

/* ── shared upload helper ── */
async function doUpload(
  files: File[],
  setUploading: (v: boolean) => void,
  onUploaded: (urls: string[]) => void,
) {
  if (!files.length) return;
  setUploading(true);
  try {
    const fd = new FormData();
    // Do NOT set Content-Type manually — axios sets multipart/form-data with the
    // correct boundary automatically when the body is a FormData instance.
    files.forEach((f) => fd.append('files', f));
    const res = await api.post('/media/upload', fd);
    // API returns the saved Media docs directly as an array: [{ url, name, ... }]
    const saved: any[] = Array.isArray(res.data) ? res.data : (res.data?.files ?? []);
    const urls = saved.map((f: any) => f.url).filter(Boolean);
    if (urls.length) onUploaded(urls);
    else toast.error('Upload succeeded but no image URLs were returned');
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Upload failed';
    toast.error(msg);
  } finally {
    setUploading(false);
  }
}

/* ── image gallery with drag-to-reorder + whole-area file drop ── */
function ImageGallery({
  images, onReorder, onRemove, onUploaded, uploading, setUploading,
}: {
  images: string[];
  onReorder: (imgs: string[]) => void;
  onRemove: (i: number) => void;
  onUploaded: (urls: string[]) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [fileDropOver, setFileDropOver] = useState(false);

  // Distinguish OS-file drags from internal tile drags
  const isFileDrag = (e: React.DragEvent) =>
    Array.from(e.dataTransfer.types).includes('Files');

  /* ── tile reorder handlers ── */
  function onTileDragStart(e: React.DragEvent, i: number) {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = 'move';
  }
  function onTileDragOver(e: React.DragEvent, i: number) {
    // Always prevent default so the browser doesn't navigate on drop
    e.preventDefault();
    if (isFileDrag(e)) {
      // File drag over a tile — let the area handler light up, no reorder highlight
      e.dataTransfer.dropEffect = 'copy';
      return;
    }
    e.dataTransfer.dropEffect = 'move';
    if (dragIdx !== null && dragIdx !== i) setOverIdx(i);
  }
  function onTileDrop(e: React.DragEvent, i: number) {
    e.preventDefault();
    e.stopPropagation(); // don't bubble to the area handler
    if (isFileDrag(e)) {
      // File dropped on a tile — upload it
      doUpload(Array.from(e.dataTransfer.files), setUploading, onUploaded);
      resetDrag();
      return;
    }
    if (dragIdx === null || dragIdx === i) { resetDrag(); return; }
    const next = [...images];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    onReorder(next);
    resetDrag();
  }
  function onTileDragEnd() { resetDrag(); }
  function resetDrag() { setDragIdx(null); setOverIdx(null); }

  /* ── whole-area file drop (catches drops that land outside tiles) ── */
  function onAreaDragOver(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setFileDropOver(true);
  }
  function onAreaDragLeave(e: React.DragEvent) {
    // Only clear when leaving the area entirely (not entering a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setFileDropOver(false);
    }
  }
  function onAreaDrop(e: React.DragEvent) {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    setFileDropOver(false);
    doUpload(Array.from(e.dataTransfer.files), setUploading, onUploaded);
  }

  return (
    <div
      onDragOver={onAreaDragOver}
      onDragLeave={onAreaDragLeave}
      onDrop={onAreaDrop}
      style={{
        borderRadius: 10,
        border: fileDropOver ? '2px dashed #EC5D4A' : '2px dashed transparent',
        background: fileDropOver ? '#FEF7F5' : 'transparent',
        transition: 'border-color .15s, background .15s',
        padding: fileDropOver ? 6 : 0,
        margin: fileDropOver ? -8 : 0,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {images.map((url, i) => (
          <div
            key={`img-${i}`}
            draggable
            onDragStart={(e) => onTileDragStart(e, i)}
            onDragOver={(e) => onTileDragOver(e, i)}
            onDrop={(e) => onTileDrop(e, i)}
            onDragEnd={onTileDragEnd}
            style={{
              position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
              background: '#F5F1EA',
              border: overIdx === i ? '2px solid #EC5D4A' : '1px solid #E8DFD2',
              cursor: dragIdx !== null && !isFileDrag({ dataTransfer: { types: [] } } as any) ? 'grabbing' : 'grab',
              opacity: dragIdx === i ? 0.4 : 1,
              transition: 'opacity .15s, border-color .1s',
            }}
          >
            {isVideo(url) ? (
              <>
                <video
                  src={`${imgUrl(url)}#t=0.5`}
                  preload="metadata"
                  muted
                  playsInline
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                  draggable={false}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="#FFF"><path d="M0 0l10 6-10 6z" /></svg>
                  </div>
                </div>
              </>
            ) : (
              <Image src={imgUrl(url)} alt="" fill sizes="140px" className="object-cover" draggable={false} />
            )}

            {i === 0 && (
              <span style={{
                position: 'absolute', bottom: 5, left: 5,
                fontSize: 9, fontWeight: 700, color: '#FFF', letterSpacing: '.07em', textTransform: 'uppercase',
                background: 'rgba(0,0,0,.52)', padding: '2px 6px', borderRadius: 4,
                fontFamily: 'var(--font-mono-var, monospace)',
              }}>{isVideo(url) ? 'Video' : 'Cover'}</span>
            )}

            <div style={{ position: 'absolute', top: 5, left: 5, pointerEvents: 'none' }}>
              <AdminIcon name="grip" size={13} color="rgba(255,255,255,.75)" />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              style={{
                position: 'absolute', top: 4, right: 4,
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(0,0,0,.55)', border: 0,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AdminIcon name="x" size={11} color="#FFF" />
            </button>
          </div>
        ))}

        {/* upload tile */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            aspectRatio: '1', borderRadius: 8,
            border: '1.5px dashed #D8CFBF',
            background: '#FAF6EF',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
            cursor: uploading ? 'wait' : 'pointer',
          }}
        >
          {uploading ? (
            <svg className="animate-spin" style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#8B8176" strokeWidth="3" opacity=".25" />
              <path fill="#8B8176" d="M4 12a8 8 0 018-8v8H4z" opacity=".75" />
            </svg>
          ) : (
            <>
              <AdminIcon name="upload" size={18} color="#8B8176" />
              <span style={{ fontSize: 10, color: '#A89E92', textAlign: 'center', lineHeight: 1.3 }}>
                Image or<br />video
              </span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.length) doUpload(Array.from(e.target.files), setUploading, onUploaded);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {fileDropOver && (
        <p style={{ textAlign: 'center', fontSize: 12, color: '#EC5D4A', marginTop: 10, fontWeight: 500 }}>
          Drop to upload
        </p>
      )}
    </div>
  );
}

const toSlug = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toSku = (name: string, rand: number) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  const initials = words.slice(0, 4).map((w) => w[0].toUpperCase()).join('');
  return `${initials}-${rand}`;
};

/* ── main editor ── */
interface ProductEditorProps {
  productId?: string;
}

const EMPTY: any = {
  name: '', sku: '', description: '', price: '', comparePrice: '', stock: '',
  ageGroup: '', gender: '', badge: '', active: true, trackInventory: true,
  categories: [], images: [], variants: [],
  metaTitle: '', metaDescription: '', slug: '',
};

export default function ProductEditor({ productId }: ProductEditorProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const isNew = !productId;

  const [form, setForm] = useState<any>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const [skuManual, setSkuManual] = useState(false);
  const [skuStatus, setSkuStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [seoLoading, setSeoLoading] = useState(false);
  const [skuBase, setSkuBase] = useState('');
  const skuRand = useRef(Math.floor(1000 + Math.random() * 9000));

  /* fetch existing product */
  const { data: existingProduct } = useQuery<Product>({
    queryKey: ['admin-product', productId],
    queryFn: () => api.get(`/products/admin/${productId}`).then((r) => r.data),
    enabled: !!productId,
  });

  useEffect(() => {
    if (!existingProduct || loaded) return;
    const p = existingProduct;
    setForm({
      name: p.name, sku: p.sku || '', description: p.description || '',
      price: p.price, comparePrice: p.comparePrice || '',
      stock: p.stock, ageGroup: sanitizeAgeGroup(p.ageGroup),
      gender: sanitizeGender(p.gender), badge: p.badge || '', active: p.active, trackInventory: p.trackInventory,
      categories: (() => {
        const arr = Array.isArray(p.categories) && p.categories.length
          ? p.categories
          : (p.category ? [p.category] : []);
        return arr.map((c: any) => (typeof c === 'object' ? c?._id : c)).filter(Boolean);
      })(),
      images: p.images || [],
      variants: p.variants || [],
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
      slug: p.slug || '',
    });
    setLoaded(true);
    setSlugManual(true);
    if (p.sku) setSkuManual(true);
  }, [existingProduct, loaded]);

  useEffect(() => {
    if (skuManual || !skuBase) { setSkuStatus('idle'); return; }
    setSkuStatus('checking');
    const t = setTimeout(async () => {
      try {
        let candidate = skuBase;
        for (let i = 2; i <= 30; i++) {
          const { data } = await api.get('/products/sku/check', {
            params: { sku: candidate, ...(productId ? { excludeId: productId } : {}) },
          });
          if (data.available) break;
          candidate = `${skuBase}-${i}`;
        }
        setForm((f: any) => ({ ...f, sku: candidate }));
        setSkuStatus('ok');
      } catch {
        setSkuStatus('idle');
      }
    }, 500);
    return () => clearTimeout(t);
  }, [skuBase, skuManual, productId]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/flat').then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      isNew ? api.post('/products', data) : api.put(`/products/${productId}`, data),
    onSuccess: (res) => {
      toast.success(isNew ? 'Product created!' : 'Changes saved');
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      if (isNew) router.push(`/admin/products/${res.data._id || res.data.product?._id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  const setVal = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price) { toast.error('Price is required'); return; }
    saveMutation.mutate({
      ...form,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      stock: Number(form.stock) || 0,
      variants: form.variants.map((v: any) => ({ ...v, stock: Number(v.stock) || 0 })),
    });
  }

  /* variant helpers */
  function addVariant() {
    const n = form.variants.length + 1;
    const variantSku = form.sku ? `${form.sku}-V${n}` : '';
    setVal('variants', [...form.variants, { name: '', sku: variantSku, stock: 0, price: '' }]);
  }
  function updateVariant(i: number, k: string, v: any) {
    setVal('variants', form.variants.map((vt: any, idx: number) => idx === i ? { ...vt, [k]: v } : vt));
  }
  function removeVariant(i: number) {
    setVal('variants', form.variants.filter((_: any, idx: number) => idx !== i));
  }

  const productName = isNew ? 'New product' : (form.name || 'Product');

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/admin/products')}
          style={{ border: '1px solid #E8DFD2', background: '#FFF', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#5A5048' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFF'; }}
        >
          <AdminIcon name="chevL" size={14} /> Products
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#2A2420' }}>{productName}</h1>
          {!isNew && form.sku && (
            <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2, fontFamily: 'var(--font-mono-var, monospace)' }}>
              SKU: {form.sku}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Toggle
            checked={form.active}
            onChange={(v) => setVal('active', v)}
            label={form.active ? 'Active' : 'Draft'}
          />
          {!isNew && form.slug && (
            <Link
              href={`/products/${form.slug}`}
              target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #E8DFD2', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: '#5A5048', textDecoration: 'none', background: '#FFF' }}
            >
              <AdminIcon name="external" size={13} /> View on site
            </Link>
          )}
          <Button size="sm" onClick={handleSave} loading={saveMutation.isPending}>
            <AdminIcon name="check" size={13} color="#FFF" />
            {isNew ? 'Create product' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Details */}
          <Card title="Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Product name *">
                <input
                  style={input}
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const base = toSku(name, skuRand.current);
                    if (!skuManual) setSkuBase(base);
                    setForm((f: any) => ({
                      ...f,
                      name,
                      slug: slugManual ? f.slug : toSlug(name),
                      sku: skuManual ? f.sku : base,
                    }));
                  }}
                  placeholder="e.g. Wooden Rainbow Stacker"
                />
              </Field>
              <Field label="Description">
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setVal('description', html)}
                  placeholder="Storefront description…"
                  minHeight={160}
                />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Price (৳) *">
                  <input style={input} type="number" min="0" value={form.price} onChange={set('price')} placeholder="0" />
                </Field>
                <Field label="Compare-at price (৳)">
                  <input style={input} type="number" min="0" value={form.comparePrice} onChange={set('comparePrice')} placeholder="Optional" />
                </Field>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card title="Images & Videos" subtitle="Drag tiles to reorder · First image is the cover">
            <ImageGallery
              images={form.images}
              onReorder={(imgs) => setVal('images', imgs)}
              onRemove={(i) => setVal('images', form.images.filter((_: string, idx: number) => idx !== i))}
              onUploaded={(urls) => setVal('images', [...form.images, ...urls])}
              uploading={uploading}
              setUploading={setUploading}
            />
            {form.images.length === 0 && (
              <p style={{ fontSize: 12, color: '#A89E92', margin: '10px 0 0' }}>
                No images yet. Click the upload tile or drag image files into it.
              </p>
            )}
          </Card>

          {/* Variants */}
          <Card
            title="Variants"
            subtitle="Colors, sizes, styles — leave empty if this product has no variants"
            actions={
              <button
                onClick={addVariant}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid #E8DFD2', borderRadius: 7, padding: '4px 10px', fontSize: 12, color: '#5A5048', background: '#FFF', cursor: 'pointer' }}
              >
                <AdminIcon name="plus" size={12} /> Add variant
              </button>
            }
          >
            {form.variants.length === 0 ? (
              <p style={{ fontSize: 13, color: '#A89E92', padding: '4px 0' }}>
                No variants. Add one if this product comes in different options.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 36px', gap: 8 }}>
                  {['Variant name', 'SKU', 'Price (৳)', 'Stock', ''].map((h) => (
                    <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em' }}>{h}</span>
                  ))}
                </div>
                {form.variants.map((v: any, i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 36px', gap: 8, alignItems: 'center' }}>
                    <input style={input} value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} placeholder="e.g. Red / Large" />
                    <input style={input} value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} placeholder="SKU" />
                    <input style={input} type="number" value={v.price || ''} onChange={(e) => updateVariant(i, 'price', e.target.value)} placeholder="Same" />
                    <input style={input} type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} placeholder="0" />
                    <button
                      onClick={() => removeVariant(i)}
                      style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E8DFD2', borderRadius: 7, background: '#FFF', cursor: 'pointer', color: '#A89E92', flexShrink: 0 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FBDED8'; (e.currentTarget as HTMLElement).style.color = '#9B2914'; (e.currentTarget as HTMLElement).style.borderColor = '#F2A89B'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFF'; (e.currentTarget as HTMLElement).style.color = '#A89E92'; (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD2'; }}
                    >
                      <AdminIcon name="trash" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

        {/* ── Right column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Organization */}
          <Card title="Organization">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Categories">
                <CategoryMultiSelect
                  value={form.categories || []}
                  onChange={(v) => setVal('categories', v)}
                  options={(categories || []).map((c) => ({ value: c._id, label: c.name }))}
                />
              </Field>
              <Field label="Age range">
                <Select value={form.ageGroup} onChange={set('ageGroup')} options={AGE_GROUPS} />
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onChange={set('gender')} options={GENDERS} />
              </Field>
              <Field label="Badge">
                <Select value={form.badge} onChange={set('badge')} options={BADGES} />
              </Field>
            </div>
          </Card>

          {/* Inventory */}
          <Card title="Inventory">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Stock quantity">
                <input style={input} type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" />
              </Field>
              <Field label="SKU">
                <div style={{ position: 'relative' }}>
                  <input
                    style={input}
                    value={form.sku}
                    onChange={(e) => { setSkuManual(true); setSkuStatus('idle'); set('sku')(e); }}
                    placeholder="Auto-generated from name"
                  />
                  {skuStatus === 'checking' && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#8B8176' }}>checking…</span>
                  )}
                  {skuStatus === 'ok' && (
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: '#3b8a4e', fontWeight: 600 }}>✓ unique</span>
                  )}
                </div>
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                <span style={{ fontSize: 13, color: '#2A2420' }}>Track inventory</span>
                <Toggle checked={form.trackInventory} onChange={(v) => setVal('trackInventory', v)} size="sm" />
              </div>
            </div>
          </Card>

          {/* SEO */}
          <Card
            title="SEO"
            actions={
              <button
                disabled={!form.name || seoLoading}
                onClick={async () => {
                  if (!form.name) { toast.error('Enter a product name first'); return; }
                  setSeoLoading(true);
                  try {
                    const catObjs = (form.categories || [])
                      .map((id: string) => (categories || []).find((c) => c._id === id))
                      .filter(Boolean) as Category[];
                    const { data } = await api.post('/ai/seo', {
                      name: form.name,
                      description: form.description,
                      category: catObjs.map((c) => c.name).join(', '),
                      ageGroup: form.ageGroup,
                      gender: form.gender,
                    });
                    setSlugManual(true);
                    setForm((f: any) => ({
                      ...f,
                      slug: data.slug || f.slug,
                      metaTitle: data.metaTitle || f.metaTitle,
                      metaDescription: data.metaDescription || f.metaDescription,
                    }));
                    toast.success('SEO fields generated!');
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message || 'AI generation failed');
                  } finally {
                    setSeoLoading(false);
                  }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  border: '1px solid #E8DFD2', borderRadius: 7, padding: '4px 10px',
                  fontSize: 12, color: seoLoading ? '#A89E92' : '#5A5048',
                  background: '#FFF', cursor: seoLoading || !form.name ? 'not-allowed' : 'pointer',
                  opacity: !form.name ? 0.5 : 1,
                }}
              >
                {seoLoading ? (
                  <>
                    <svg className="animate-spin" style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#8B8176" strokeWidth="3" opacity=".25" />
                      <path fill="#8B8176" d="M4 12a8 8 0 018-8v8H4z" opacity=".75" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>✦ Generate with AI</>
                )}
              </button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="URL slug">
                <input
                  style={input}
                  value={form.slug}
                  onChange={(e) => { setSlugManual(true); set('slug')(e); }}
                  placeholder="e.g. wooden-rainbow-stacker"
                />
              </Field>
              <Field label="Meta title">
                <input style={input} value={form.metaTitle} onChange={set('metaTitle')} placeholder={form.name || 'Product name'} />
              </Field>
              <Field label="Meta description">
                <textarea style={{ ...textarea, minHeight: 70 }} value={form.metaDescription} onChange={set('metaDescription')} placeholder="Short description for search results" rows={3} />
              </Field>
            </div>
          </Card>


        </div>
      </div>
    </div>
  );
}

/* ── Category multi-select ──────────────────────────────────────────────── */
function CategoryMultiSelect({
  value, onChange, options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selectedLabels = options.filter((o) => value.includes(o.value));
  const filtered = options.filter((o) =>
    !value.includes(o.value) && (!filter.trim() || o.label.toLowerCase().includes(filter.toLowerCase())),
  );

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          minHeight: 38, padding: '6px 10px', borderRadius: 8, border: '1px solid #E8DFD2',
          background: '#FAF6EF', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: 5,
          alignItems: 'center',
        }}
      >
        {selectedLabels.length === 0 && (
          <span style={{ color: '#A89E92', fontSize: 13 }}>— Select one or more —</span>
        )}
        {selectedLabels.map((o) => (
          <span
            key={o.value}
            onClick={(e) => { e.stopPropagation(); toggle(o.value); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 4px 3px 9px', borderRadius: 14, background: '#EC5D4A',
              color: '#FFF', fontSize: 12, fontWeight: 500,
            }}
          >
            {o.label}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,.25)',
              fontSize: 11, lineHeight: 1,
            }}>×</span>
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: '#A89E92', fontSize: 11 }}>
          {open ? '▴' : '▾'}
        </span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 8,
          boxShadow: '0 8px 24px -8px rgba(0,0,0,.18)', zIndex: 30, padding: 8,
          maxHeight: 280, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <input
            autoFocus
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search categories…"
            style={{
              border: '1px solid #E8DFD2', borderRadius: 6, padding: '6px 10px',
              fontSize: 12, outline: 'none', background: '#FAF6EF',
            }}
          />
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.length === 0 && (
              <div style={{ padding: '8px 10px', fontSize: 12, color: '#A89E92', textAlign: 'center' }}>
                {value.length === options.length ? 'All categories selected' : 'No matches'}
              </div>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { toggle(o.value); setFilter(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  border: 0, background: 'none', padding: '6px 10px', borderRadius: 6,
                  fontSize: 13, color: '#2A2420', cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF7F0'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: 3, border: '1.5px solid #D8CFBF',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }} />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
