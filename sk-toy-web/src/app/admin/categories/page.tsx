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
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EMPTY_FORM = { name: '', tag: '', icon: '', parent: '', hidden: false, order: 0 };

function SortableCatRow({ cat, level, onEdit, onDelete, allChildren }: {
  cat: Category; level: number;
  onEdit: (c: Category) => void; onDelete: (c: Category) => void;
  allChildren: Category[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat._id });
  const style = {
    transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: level > 0 ? 20 : 0,
    borderLeft: level > 0 ? '1px solid #F4EEE3' : 'none',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="group"
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginLeft: level > 0 ? 8 : 0 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAF6EF'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <button {...attributes} {...listeners} style={{ cursor: 'grab', color: '#A89E92', background: 'none', border: 'none', padding: 4, flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
        </button>
        {cat.icon && <span style={{ fontSize: 18 }}>{cat.icon}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 500, color: '#2A2420', fontSize: level === 0 ? 13 : 12 }}>{cat.name}</span>
          {cat.tag && <span style={{ fontSize: 11, color: '#A89E92', marginLeft: 8 }}>{cat.tag}</span>}
          {cat.hidden && <span style={{ fontSize: 11, color: '#9B2914', marginLeft: 8 }}>(hidden)</span>}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: 'flex', gap: 2 }}>
          <button
            onClick={() => onEdit(cat)}
            style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#8B8176' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; (e.currentTarget as HTMLElement).style.color = '#2A2420'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
          >
            <AdminIcon name="edit" size={14} />
          </button>
          <button
            onClick={() => onDelete(cat)}
            style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#A89E92' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FBDED8'; (e.currentTarget as HTMLElement).style.color = '#9B2914'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
          >
            <AdminIcon name="trash" size={14} />
          </button>
        </div>
      </div>
      {/* Render children (not sortable at this level — only siblings are sortable) */}
      {allChildren.length > 0 && (
        <div>
          {allChildren.map((child) => (
            <SortableCatRow
              key={child._id}
              cat={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              allChildren={(child.children || []) as Category[]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [localTree, setLocalTree] = useState<Category[]>([]);

  const { data: tree = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories-admin-tree'],
    queryFn: () => api.get('/categories/admin/tree').then((r) => r.data),
  });

  const { data: flat = [] } = useQuery<Category[]>({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/flat').then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const sorted = localTree.length ? localTree : [...tree].sort((a, b) => a.order - b.order);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const reorderMutation = useMutation({
    mutationFn: (reordered: Category[]) =>
      api.put('/categories/reorder', { items: reordered.map((c, i) => ({ id: c._id, order: i })) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories-admin-tree'] }); qc.invalidateQueries({ queryKey: ['categories-flat'] }); },
    onError: () => toast.error('Reorder failed'),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sorted.findIndex((c) => c._id === active.id);
    const newIdx = sorted.findIndex((c) => c._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(sorted, oldIdx, newIdx);
    setLocalTree(reordered);
    reorderMutation.mutate(reordered);
  }

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/categories', data) : api.put(`/categories/${editCat?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Category created!' : 'Category updated!');
      setLocalTree([]);
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
      setLocalTree([]);
      qc.invalidateQueries({ queryKey: ['categories-admin-tree'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      setDeleteCat(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openNew() {
    setForm(EMPTY_FORM);
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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Categories</h1>
          <p style={{ fontSize: 13, color: '#8B8176', marginTop: 4 }}>Drag to reorder. Supports unlimited subcategory depth.</p>
        </div>
        <Button onClick={openNew} size="sm">
          <AdminIcon name="plus" size={13} color="#FFF" /> Add Category
        </Button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 40, background: '#F4EEE3', borderRadius: 8, animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#A89E92', fontSize: 13 }}>No categories yet</div>
        ) : (
          <div style={{ padding: 12 }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sorted.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                {sorted.map((cat) => (
                  <SortableCatRow
                    key={cat._id}
                    cat={cat}
                    level={0}
                    onEdit={openEdit}
                    onDelete={setDeleteCat}
                    allChildren={(cat.children || []) as Category[]}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

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
          <Input label="Order" type="number" value={form.order || ''} onChange={set('order')} placeholder="0" />
          <Toggle checked={form.hidden} onChange={(v) => setForm((f: any) => ({ ...f, hidden: v }))} label="Hide from storefront" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" size="sm" onClick={() => setEditCat(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ ...form, order: Number(form.order) })} loading={saveMutation.isPending}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </Modal>

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
