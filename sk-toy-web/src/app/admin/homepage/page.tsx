'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
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
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { HomeSection, Product, Category } from '@/types';
import { cls, imgUrl, fmtTk } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Spinner from '@/components/ui/Spinner';

const SECTION_TYPES = [
  { value: 'categories', label: 'Categories Grid' },
  { value: 'products', label: 'Products Section' },
  { value: 'editorial_band', label: 'Editorial Band' },
  { value: 'journal', label: 'Journal / Blog' },
  { value: 'banner', label: 'Promo Banner' },
  { value: 'ages', label: 'Shop by Age' },
];

const FILTER_OPTIONS = [
  { value: 'new', label: 'New Arrivals' },
  { value: 'sale', label: 'On Sale' },
  { value: 'clearance', label: 'Clearance' },
  { value: 'featured', label: 'Featured' },
  { value: 'trending', label: 'Trending' },
  { value: 'showcase', label: 'Manually Curated' },
];

const BAND_STYLES = [
  { value: 'yellow', label: 'Yellow' },
  { value: 'dark', label: 'Dark' },
  { value: 'coral', label: 'Coral' },
];

const DEFAULT_FORM = {
  type: 'products',
  title: '',
  eyebrow: '',
  subtitle: '',
  enabled: true,
  filter: 'new',
  limit: 8,
  ctaLabel: 'View All',
  ctaLink: '/products',
  bandStyle: 'dark',
  bandText: '',
  bandImage: '',
  productRefs: [] as string[],
  categoryRefs: [] as string[],
};

export default function HomepageSectionsPage() {
  const qc = useQueryClient();
  const [editSection, setEditSection] = useState<HomeSection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sections = [], isLoading } = useQuery<HomeSection[]>({
    queryKey: ['homepage-sections-admin'],
    queryFn: () => api.get('/homepage/admin/all').then((r) => r.data),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => api.put('/homepage/reorder', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] }),
    onError: () => toast.error('Failed to reorder'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.put(`/homepage/${id}`, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      isNew ? api.post('/homepage', data) : api.put(`/homepage/${editSection?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Section created!' : 'Section updated!');
      qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] });
      setEditSection(null);
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/homepage/${id}`),
    onSuccess: () => {
      toast.success('Section deleted');
      qc.invalidateQueries({ queryKey: ['homepage-sections-admin'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s._id === active.id);
    const newIndex = sections.findIndex((s) => s._id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    qc.setQueryData(['homepage-sections-admin'], reordered);
    reorderMutation.mutate(reordered.map((s) => s._id));
  }

  function openNew() {
    setForm(DEFAULT_FORM);
    setIsNew(true);
    setEditSection({} as HomeSection);
  }

  function openEdit(section: HomeSection) {
    setForm({
      type: section.type,
      title: section.title || '',
      eyebrow: section.eyebrow || '',
      subtitle: section.subtitle || '',
      enabled: section.enabled,
      filter: section.filter || 'new',
      limit: section.limit || 8,
      ctaLabel: section.ctaLabel || 'View All',
      ctaLink: section.ctaLink || '',
      bandStyle: section.bandStyle || 'dark',
      bandText: section.bandText || '',
      bandImage: section.bandImage || '',
      productRefs: (section as any).productRefs || [],
      categoryRefs: (section as any).categoryRefs || [],
    });
    setIsNew(false);
    setEditSection(section);
  }

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2A2420]">Homepage Sections</h1>
          <p className="text-sm text-[#8B8176]">Drag to reorder. Toggle to show/hide on storefront.</p>
        </div>
        <Button onClick={openNew} size="sm">+ Add Section</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#F4EEE3] animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableRow
                  key={section._id}
                  section={section}
                  onEdit={() => openEdit(section)}
                  onDelete={() => setDeleteId(section._id)}
                  onToggle={(v) => toggleMutation.mutate({ id: section._id, enabled: v })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Modal */}
      <Modal
        open={editSection !== null}
        onClose={() => setEditSection(null)}
        title={isNew ? 'Add Section' : 'Edit Section'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Section Type"
            value={form.type}
            onChange={setField('type')}
            options={SECTION_TYPES}
            className="sm:col-span-2"
            storefront
          />
          <Input label="Title" value={form.title} onChange={setField('title')} placeholder="Just Landed" />
          <Input label="Eyebrow Text" value={form.eyebrow} onChange={setField('eyebrow')} placeholder="New Arrivals" />
          <Input label="Subtitle" value={form.subtitle} onChange={setField('subtitle')} className="sm:col-span-2" />
          <Input label="CTA Label" value={form.ctaLabel} onChange={setField('ctaLabel')} placeholder="View All" />
          <Input label="CTA Link" value={form.ctaLink} onChange={setField('ctaLink')} placeholder="/products" />

          {form.type === 'products' && (
            <>
              <Select label="Filter" value={form.filter} onChange={setField('filter')} options={FILTER_OPTIONS} storefront />
              {form.filter !== 'showcase' && (
                <Input
                  label="Limit"
                  type="number"
                  value={form.limit || ''}
                  onChange={(e) => setForm((f: any) => ({ ...f, limit: e.target.value === '' ? 0 : Number(e.target.value) }))}
                  min={2}
                  max={20}
                  placeholder="8"
                />
              )}
              {form.filter === 'showcase' && (
                <ShowcaseProductPicker
                  key={editSection?._id || 'new-showcase'}
                  initialIds={form.productRefs || []}
                  onChange={(ids) => setForm((f: any) => ({ ...f, productRefs: ids }))}
                />
              )}
            </>
          )}

          {form.type === 'editorial_band' && (
            <>
              <Select label="Band Style" value={form.bandStyle} onChange={setField('bandStyle')} options={BAND_STYLES} storefront />
              <Input label="Band Text" value={form.bandText} onChange={setField('bandText')} placeholder="Big headline" />
              <Input label="Band Image URL" value={form.bandImage} onChange={setField('bandImage')} placeholder="https://..." className="sm:col-span-2" />
            </>
          )}

          <div className="sm:col-span-2">
            <Toggle
              checked={form.enabled}
              onChange={(v) => setForm((f: any) => ({ ...f, enabled: v }))}
              label="Enabled on storefront"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" size="sm" onClick={() => setEditSection(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate(form)} loading={saveMutation.isPending}>
            {isNew ? 'Create Section' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete Section"
        message="Are you sure you want to delete this section? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

/* ─── Showcase product picker ────────────────────────────────────────────── */

function ShowcaseProductPicker({
  initialIds,
  onChange,
}: {
  initialIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const initialized = useRef(false);

  const pickerSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: initialProducts } = useQuery<Product[]>({
    queryKey: ['showcase-init-products', initialIds.join(',')],
    queryFn: () =>
      api.get(`/products?ids=${initialIds.join(',')}&limit=200`).then((r) => r.data.products),
    enabled: initialIds.length > 0,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (initialProducts && !initialized.current) {
      initialized.current = true;
      const sorted = initialIds
        .map((id) => initialProducts.find((p) => p._id === id))
        .filter(Boolean) as Product[];
      setPicked(sorted);
    }
  }, [initialProducts]);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await api.get(`/products?search=${encodeURIComponent(search.trim())}&limit=10`);
        setSearchResults(r.data.products || []);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = picked.findIndex((p) => p._id === active.id);
    const newIndex = picked.findIndex((p) => p._id === over.id);
    const reordered = arrayMove(picked, oldIndex, newIndex);
    setPicked(reordered);
    onChange(reordered.map((p) => p._id));
  }

  function addProduct(product: Product) {
    if (picked.some((p) => p._id === product._id)) return;
    const next = [...picked, product];
    setPicked(next);
    onChange(next.map((p) => p._id));
    setSearch('');
    setSearchResults([]);
  }

  function removeProduct(id: string) {
    const next = picked.filter((p) => p._id !== id);
    setPicked(next);
    onChange(next.map((p) => p._id));
  }

  return (
    <div className="sm:col-span-2 border border-[#E8DFD2] rounded-xl p-4 space-y-3 bg-[#FDFAF5]">
      <p className="text-xs font-semibold text-[#5A5048] uppercase tracking-wide">
        Showcase Products <span className="text-[#A89E92] font-normal normal-case">({picked.length} added)</span>
      </p>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products to add…"
          className="w-full border border-[#E8DFD2] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EC5D4A] bg-white"
        />
        {searching && (
          <div className="absolute right-2.5 top-2">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="border border-[#E8DFD2] rounded-lg divide-y divide-[#F4EEE3] max-h-48 overflow-y-auto bg-white shadow-sm">
          {searchResults.map((product) => {
            const isAdded = picked.some((p) => p._id === product._id);
            return (
              <div key={product._id} className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 relative bg-[#F4EEE3]">
                  {product.images?.[0] && (
                    <Image src={imgUrl(product.images[0])} alt={product.name} fill className="object-cover" sizes="32px" />
                  )}
                </div>
                <span className="flex-1 text-sm text-[#2A2420] truncate">{product.name}</span>
                <span className="text-xs text-[#A89E92] flex-shrink-0">{fmtTk(product.price)}</span>
                <button
                  type="button"
                  onClick={() => addProduct(product)}
                  disabled={isAdded}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 transition-colors ${
                    isAdded
                      ? 'bg-[#F4EEE3] text-[#A89E92] cursor-default'
                      : 'bg-[#EC5D4A] text-white hover:bg-[#D14434]'
                  }`}
                >
                  {isAdded ? 'Added' : '+ Add'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Picked products (sortable) */}
      {picked.length === 0 ? (
        <p className="text-xs text-[#A89E92] text-center py-6 border border-dashed border-[#E8DFD2] rounded-lg">
          No products added yet — search above to curate.
        </p>
      ) : (
        <DndContext sensors={pickerSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={picked.map((p) => p._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
              {picked.map((product, i) => (
                <SortableProductRow
                  key={product._id}
                  product={product}
                  index={i}
                  onRemove={() => removeProduct(product._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableProductRow({
  product,
  index,
  onRemove,
}: {
  product: Product;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={cls(
        'flex items-center gap-2 bg-white border rounded-lg px-2 py-1.5',
        isDragging ? 'border-[#EC5D4A] shadow-md' : 'border-[#E8DFD2]',
      )}
    >
      <span className="text-[10px] text-[#D8CFBF] w-4 text-center flex-shrink-0 select-none">{index + 1}</span>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-[#D8CFBF] hover:text-[#8B8176] cursor-grab active:cursor-grabbing p-0.5 flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="5" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>
      <div className="w-7 h-7 rounded overflow-hidden flex-shrink-0 relative bg-[#F4EEE3]">
        {product.images?.[0] && (
          <Image src={imgUrl(product.images[0])} alt={product.name} fill className="object-cover" sizes="28px" />
        )}
      </div>
      <span className="flex-1 text-xs font-medium text-[#2A2420] truncate">{product.name}</span>
      <span className="text-xs text-[#A89E92] flex-shrink-0">{fmtTk(product.price)}</span>
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 text-[#D8CFBF] hover:text-[#9B2914] flex-shrink-0 transition-colors"
        aria-label="Remove"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Showcase category picker ───────────────────────────────────────────── */

function ShowcaseCategoryPicker({
  initialIds,
  onChange,
}: {
  initialIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const initialized = useRef(false);

  const pickerSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/flat').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (allCategories.length && !initialized.current) {
      initialized.current = true;
      const sorted = initialIds
        .map((id) => allCategories.find((c) => c._id === id))
        .filter(Boolean) as Category[];
      setPicked(sorted);
    }
  }, [allCategories]);

  const filtered = search.trim()
    ? allCategories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) &&
        !picked.some((p) => p._id === c._id)
      )
    : [];

  function addCategory(cat: Category) {
    const next = [...picked, cat];
    setPicked(next);
    onChange(next.map((c) => c._id));
    setSearch('');
  }

  function removeCategory(id: string) {
    const next = picked.filter((c) => c._id !== id);
    setPicked(next);
    onChange(next.map((c) => c._id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = picked.findIndex((c) => c._id === active.id);
    const newIndex = picked.findIndex((c) => c._id === over.id);
    const reordered = arrayMove(picked, oldIndex, newIndex);
    setPicked(reordered);
    onChange(reordered.map((c) => c._id));
  }

  return (
    <div className="sm:col-span-2 border border-[#E8DFD2] rounded-xl p-4 space-y-3 bg-[#FDFAF5]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#5A5048] uppercase tracking-wide">
          Catalogue Categories <span className="text-[#A89E92] font-normal normal-case">({picked.length} selected)</span>
        </p>
        {picked.length === 0 && (
          <span className="text-xs text-[#A89E92] italic">Leave empty to show all top-level categories</span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories to add…"
          className="w-full border border-[#E8DFD2] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EC5D4A] bg-white"
        />
      </div>

      {/* Search results */}
      {filtered.length > 0 && (
        <div className="border border-[#E8DFD2] rounded-lg divide-y divide-[#F4EEE3] max-h-40 overflow-y-auto bg-white shadow-sm">
          {filtered.slice(0, 12).map((cat) => (
            <div key={cat._id} className="flex items-center gap-2.5 px-3 py-2">
              {cat.icon ? (
                <span className="text-lg flex-shrink-0 w-7 text-center">{cat.icon}</span>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#F4EEE3] flex-shrink-0" />
              )}
              <span className="flex-1 text-sm text-[#2A2420] truncate">{cat.name}</span>
              {cat.parent && (
                <span className="text-[10px] text-[#A89E92] flex-shrink-0 bg-[#F4EEE3] px-1.5 py-0.5 rounded-full">sub</span>
              )}
              <button
                type="button"
                onClick={() => addCategory(cat)}
                className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 bg-[#EC5D4A] text-white hover:bg-[#D14434] transition-colors"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Picked list (sortable) */}
      {picked.length === 0 ? (
        <p className="text-xs text-[#A89E92] text-center py-6 border border-dashed border-[#E8DFD2] rounded-lg">
          No categories selected — search above, or leave empty to auto-show all.
        </p>
      ) : (
        <DndContext sensors={pickerSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={picked.map((c) => c._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
              {picked.map((cat, i) => (
                <SortableCategoryRow
                  key={cat._id}
                  cat={cat}
                  index={i}
                  onRemove={() => removeCategory(cat._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableCategoryRow({
  cat,
  index,
  onRemove,
}: {
  cat: Category;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat._id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={cls(
        'flex items-center gap-2 bg-white border rounded-lg px-2 py-1.5',
        isDragging ? 'border-[#EC5D4A] shadow-md' : 'border-[#E8DFD2]',
      )}
    >
      <span className="text-[10px] text-[#D8CFBF] w-4 text-center flex-shrink-0 select-none">{index + 1}</span>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-[#D8CFBF] hover:text-[#8B8176] cursor-grab active:cursor-grabbing p-0.5 flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="5" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>
      {cat.icon ? (
        <span className="text-base flex-shrink-0 w-6 text-center">{cat.icon}</span>
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#F4EEE3] flex-shrink-0" />
      )}
      <span className="flex-1 text-xs font-medium text-[#2A2420] truncate">{cat.name}</span>
      {cat.parent && (
        <span className="text-[10px] text-[#A89E92] flex-shrink-0">sub-cat</span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 text-[#D8CFBF] hover:text-[#9B2914] flex-shrink-0 transition-colors"
        aria-label="Remove"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Section row (sortable) ─────────────────────────────────────────────── */

function SortableRow({
  section,
  onEdit,
  onDelete,
  onToggle,
}: {
  section: HomeSection;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeLabel = SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type;
  const filterLabel = FILTER_OPTIONS.find((f) => f.value === section.filter)?.label;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cls(
        'flex items-center gap-3 bg-[#FFF] border rounded-xl px-4 py-3',
        isDragging ? 'border-[#EC5D4A] shadow-lg' : 'border-[#E8DFD2]',
        !section.enabled && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-[#D8CFBF] hover:text-[#8B8176] cursor-grab active:cursor-grabbing p-1 shrink-0"
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="5" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#2A2420]">{section.title || typeLabel}</span>
          <span className="text-xs bg-[#F4EEE3] text-[#8B8176] px-2 py-0.5 rounded-full">{typeLabel}</span>
          {section.filter === 'showcase' && (
            <span className="text-xs bg-[#FDE8C0] text-[#A06A00] px-2 py-0.5 rounded-full">
              Curated · {((section as any).productRefs?.length ?? 0)} products
            </span>
          )}
          {section.type === 'categories' && (section as any).categoryRefs?.length > 0 && (
            <span className="text-xs bg-[#E8F0FD] text-[#3B5BA5] px-2 py-0.5 rounded-full">
              {(section as any).categoryRefs.length} categories
            </span>
          )}
          {filterLabel && section.filter !== 'showcase' && (
            <span className="text-xs bg-[#E8F0FD] text-[#3B5BA5] px-2 py-0.5 rounded-full">{filterLabel}</span>
          )}
        </div>
        {section.subtitle && <p className="text-xs text-[#A89E92] truncate">{section.subtitle}</p>}
      </div>

      <Toggle checked={section.enabled} onChange={onToggle} size="sm" />

      <button onClick={onEdit} className="p-1.5 text-[#A89E92] hover:text-[#5A5048] hover:bg-[#F4EEE3] rounded-lg">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      <button onClick={onDelete} className="p-1.5 text-[#A89E92] hover:text-[#9B2914] hover:bg-[#FBDED8] rounded-lg">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </div>
  );
}
