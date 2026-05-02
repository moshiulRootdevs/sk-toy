'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AdminIcon from '@/components/admin/AdminIcon';
import SelectUI from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EMPTY_FORM = { name: '', tag: '', icon: '', parent: '', hidden: false, order: 0 };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: tree = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories-admin-tree'],
    queryFn: () => api.get('/categories/admin/tree').then((r) => r.data),
  });

  const { data: flat = [] } = useQuery<Category[]>({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/flat').then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const sorted = [...tree].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      api.put('/categories/reorder', { items }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories-admin-tree'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
    },
    onError: () => toast.error('Reorder failed'),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sorted.findIndex((c) => c._id === active.id);
    const newIdx = sorted.findIndex((c) => c._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(sorted, oldIdx, newIdx);
    reorderMutation.mutate(reordered.map((c, i) => ({ id: c._id, order: i })));
  }

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/categories', data) : api.put(`/categories/${editCat?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Category created!' : 'Category updated!');
      qc.invalidateQueries({ queryKey: ['categories-admin-tree'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      setEditCat(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      qc.invalidateQueries({ queryKey: ['categories-admin-tree'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      setDeleteCat(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openNew(parentId?: string) {
    setForm({ ...EMPTY_FORM, parent: parentId || '' });
    setIsNew(true);
    setEditCat({} as Category);
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name, tag: cat.tag || '', icon: cat.icon || '',
      parent: typeof cat.parent === 'object' ? (cat.parent as any)?._id || '' : cat.parent || '',
      hidden: cat.hidden, order: cat.order,
    });
    setIsNew(false);
    setEditCat(cat);
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  const totalCount = flat.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Categories</h1>
          <p style={{ fontSize: 13, color: '#8B8176', marginTop: 4 }}>
            {totalCount} categories · Drag to reorder
          </p>
        </div>
        <Button onClick={() => openNew()} size="sm">
          <AdminIcon name="plus" size={13} color="#FFF" /> Add Category
        </Button>
      </div>

      {/* Category List */}
      <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 48, background: '#F4EEE3', borderRadius: 8, animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#A89E92', fontSize: 13 }}>
            No categories yet. Click &ldquo;Add Category&rdquo; to create one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sorted.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                {sorted.map((cat) => (
                  <SortableCategoryRow
                    key={cat._id}
                    cat={cat}
                    level={0}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    onEdit={openEdit}
                    onDelete={setDeleteCat}
                    onAddChild={(parentId) => openNew(parentId)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Modal open={editCat !== null} onClose={() => setEditCat(null)} title={isNew ? 'Add Category' : 'Edit Category'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Category Name *" value={form.name} onChange={set('name')} />
          <Input label="Tag / Description" value={form.tag} onChange={set('tag')} placeholder="e.g. For budding artists" />
          <Input label="Icon (Emoji)" value={form.icon} onChange={set('icon')} placeholder="🎨" />
          <SelectUI
            label="Parent Category"
            value={form.parent}
            onChange={set('parent')}
            options={[
              { value: '', label: 'None (Top Level)' },
              ...flat.filter((c) => c._id !== editCat?._id).map((c) => ({ value: c._id, label: c.name })),
            ]}
          />
          <Toggle checked={form.hidden} onChange={(v) => setForm((f: any) => ({ ...f, hidden: v }))} label="Hide from storefront" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" size="sm" onClick={() => setEditCat(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ ...form, order: Number(form.order) })} loading={saveMutation.isPending}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteCat}
        onClose={() => setDeleteCat(null)}
        onConfirm={() => deleteCat && deleteMutation.mutate(deleteCat._id)}
        loading={deleteMutation.isPending}
        title="Delete Category"
        message={`Delete "${deleteCat?.name}"? Children will be moved to the parent category.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

/* ─── Sortable Category Row ─────────────────────────────────────────────── */
function SortableCategoryRow({
  cat, level, expandedIds, onToggleExpand, onEdit, onDelete, onAddChild,
}: {
  cat: Category; level: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onAddChild: (parentId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const children = (cat.children || []) as Category[];
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(cat._id);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="group"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: level === 0 ? '12px 16px' : '8px 16px',
          paddingLeft: 16 + level * 28,
          borderBottom: '1px solid #F4EEE3',
          transition: 'background .15s',
        }}
        onMouseEnter={(e) => { if (!isDragging) (e.currentTarget as HTMLElement).style.background = '#FDFAF6'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {/* Drag handle */}
        {level === 0 && (
          <button
            {...attributes}
            {...listeners}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              color: '#A89E92', background: 'none', border: 'none',
              padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center',
              borderRadius: 4, touchAction: 'none',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#5A5048'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="4" r="1.5"/><circle cx="15" cy="4" r="1.5"/>
              <circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/>
              <circle cx="9" cy="16" r="1.5"/><circle cx="15" cy="16" r="1.5"/>
              <circle cx="9" cy="22" r="1.5"/><circle cx="15" cy="22" r="1.5"/>
            </svg>
          </button>
        )}

        {/* Expand/collapse toggle */}
        <button
          onClick={() => hasChildren && onToggleExpand(cat._id)}
          style={{
            width: 22, height: 22, borderRadius: 6, border: 'none',
            background: hasChildren ? '#F4EEE3' : 'transparent',
            color: hasChildren ? '#5A5048' : 'transparent',
            cursor: hasChildren ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all .15s',
          }}
        >
          {hasChildren && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          )}
        </button>

        {/* Icon */}
        {cat.icon && <span style={{ fontSize: 20 }}>{cat.icon}</span>}

        {/* Name & meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: level === 0 ? 600 : 500, color: '#2A2420', fontSize: 14 }}>
              {cat.name}
            </span>
            {cat.hidden && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6, background: '#FBE7A8', color: '#7A5A00', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Hidden
              </span>
            )}
            {hasChildren && (
              <span style={{ fontSize: 11, color: '#A89E92', fontWeight: 500 }}>
                ({children.length} sub)
              </span>
            )}
          </div>
          {cat.tag && (
            <div style={{ fontSize: 12, color: '#8B8176', marginTop: 2 }}>{cat.tag}</div>
          )}
        </div>

        {/* Action buttons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <Tooltip label="Add subcategory">
            <button
              onClick={() => onAddChild(cat._id)}
              style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#8B8176' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#D8EBDC'; (e.currentTarget as HTMLElement).style.color = '#1D5E33'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
            >
              <AdminIcon name="plus" size={14} />
            </button>
          </Tooltip>
          <Tooltip label="Edit">
            <button
              onClick={() => onEdit(cat)}
              style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#8B8176' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; (e.currentTarget as HTMLElement).style.color = '#2A2420'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
            >
              <AdminIcon name="edit" size={14} />
            </button>
          </Tooltip>
          <Tooltip label="Delete">
            <button
              onClick={() => onDelete(cat)}
              style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#A89E92' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FBDED8'; (e.currentTarget as HTMLElement).style.color = '#9B2914'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
            >
              <AdminIcon name="trash" size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Children (not sortable — only top-level is drag-sortable) */}
      {hasChildren && isExpanded && (
        <div style={{ background: '#FDFAF6' }}>
          {[...children].sort((a, b) => a.order - b.order).map((child) => (
            <SortableCategoryRow
              key={child._id}
              cat={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
