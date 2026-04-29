'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { NavigationItem } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EMPTY = { label: '', link: '/', badge: '', order: 0 };

function SortableRow({ item, onEdit, onDelete }: { item: NavigationItem; onEdit: (i: NavigationItem) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={{ ...style, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid #F4EEE3' }} className="group">
      <button {...attributes} {...listeners} style={{ cursor: 'grab', color: '#A89E92', background: 'none', border: 'none', padding: 4, flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="font-medium text-sm">{item.label}</span>
        {item.badge && <span className="ml-2 text-xs bg-[#EC5D4A] text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>}
        <div className="text-xs text-blue-600 font-mono mt-0.5">{item.link}</div>
        {item.children && item.children.length > 0 && (
          <div className="text-xs text-[#A89E92] mt-0.5">{item.children.length} sub-items</div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onEdit(item)} className="p-1.5 text-[#A89E92] hover:text-[#5A5048] hover:bg-[#F4EEE3] rounded">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button onClick={() => onDelete(item._id)} className="p-1.5 text-[#A89E92] hover:text-[#9B2914] hover:bg-[#FBDED8] rounded">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function NavigationPage() {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<NavigationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [items, setItems] = useState<NavigationItem[]>([]);

  const { data: navItems = [], isLoading } = useQuery<NavigationItem[]>({
    queryKey: ['navigation-admin'],
    queryFn: () => api.get('/navigation').then((r) => r.data),
  });

  // Sync query data to local state for DnD
  const sorted = items.length ? items : [...navItems].sort((a, b) => a.order - b.order);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const reorderMutation = useMutation({
    mutationFn: (reordered: NavigationItem[]) =>
      api.put('/navigation/reorder', { items: reordered.map((n, i) => ({ id: n._id, order: i })) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['navigation-admin'] }); qc.invalidateQueries({ queryKey: ['navigation'] }); },
    onError: () => toast.error('Reorder failed'),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sorted.findIndex((s) => s._id === active.id);
    const newIdx = sorted.findIndex((s) => s._id === over.id);
    const reordered = arrayMove(sorted, oldIdx, newIdx);
    setItems(reordered);
    reorderMutation.mutate(reordered);
  }

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/navigation', data) : api.put(`/navigation/${editItem?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Added!' : 'Updated!');
      setItems([]);
      qc.invalidateQueries({ queryKey: ['navigation-admin'] });
      qc.invalidateQueries({ queryKey: ['navigation'] });
      setEditItem(null);
    },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/navigation/${id}`),
    onSuccess: () => { toast.success('Deleted'); setItems([]); qc.invalidateQueries({ queryKey: ['navigation-admin'] }); qc.invalidateQueries({ queryKey: ['navigation'] }); setDeleteId(null); },
    onError: () => toast.error('Failed'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, [k]: e.target.value }));

  function openEdit(item: NavigationItem) {
    setForm({ label: item.label, link: item.link, badge: item.badge || '', order: item.order });
    setIsNew(false);
    setEditItem(item);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2A2420]">Navigation</h1>
        <Button onClick={() => { setForm(EMPTY); setIsNew(true); setEditItem({} as NavigationItem); }} size="sm">+ Add Item</Button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 48, background: '#F4EEE3', borderRadius: 8, marginBottom: 6, animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#A89E92', fontSize: 13 }}>No navigation items</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sorted.map((s) => s._id)} strategy={verticalListSortingStrategy}>
              {sorted.map((item) => (
                <SortableRow key={item._id} item={item} onEdit={openEdit} onDelete={setDeleteId} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
      <p style={{ fontSize: 11, color: '#A89E92', marginTop: 8 }}>Drag rows to reorder. Changes save automatically.</p>

      <Modal open={editItem !== null} onClose={() => setEditItem(null)} title={isNew ? 'Add Nav Item' : 'Edit Nav Item'} size="sm">
        <div className="space-y-4">
          <Input label="Label *" value={form.label} onChange={set('label')} placeholder="Products" />
          <Input label="Link *" value={form.link} onChange={set('link')} placeholder="/products" />
          <Input label="Badge (optional)" value={form.badge} onChange={set('badge')} placeholder="New" />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" size="sm" onClick={() => setEditItem(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ ...form, order: Number(form.order) })} loading={saveMutation.isPending}>
            {isNew ? 'Add' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Delete Item" message="Delete this navigation item?" confirmLabel="Delete" danger />
    </div>
  );
}
