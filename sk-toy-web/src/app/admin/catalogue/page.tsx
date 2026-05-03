'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { cls } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Toggle from '@/components/ui/Toggle';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface CatalogueTile {
  _id: string;
  title: string;
  description?: string;
  icon?: string;
  bgColor?: string;
  link: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_FORM = {
  title: '',
  description: '',
  icon: '',
  bgColor: '',
  link: '',
  enabled: true,
};

const PRESET_COLORS = [
  '#FBDDD7', '#FBE7A8', '#D8EBDC', '#CFE5EF',
  '#F5E9D2', '#E8DEFF', '#FFE4F0', '#D6F0DE',
];

export default function CataloguePage() {
  const qc = useQueryClient();
  const [editTile, setEditTile] = useState<CatalogueTile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: tiles = [], isLoading } = useQuery<CatalogueTile[]>({
    queryKey: ['catalogue-admin'],
    queryFn: () => api.get('/catalogue/admin/all').then((r) => r.data),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => api.put('/catalogue/reorder', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogue-admin'] }),
    onError: () => toast.error('Failed to reorder'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      api.put(`/catalogue/${id}`, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['catalogue-admin'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      isNew ? api.post('/catalogue', data) : api.put(`/catalogue/${editTile?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Tile created!' : 'Tile updated!');
      qc.invalidateQueries({ queryKey: ['catalogue-admin'] });
      setEditTile(null);
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/catalogue/${id}`),
    onSuccess: () => {
      toast.success('Tile deleted');
      qc.invalidateQueries({ queryKey: ['catalogue-admin'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tiles.findIndex((t) => t._id === active.id);
    const newIndex = tiles.findIndex((t) => t._id === over.id);
    const reordered = arrayMove(tiles, oldIndex, newIndex);
    qc.setQueryData(['catalogue-admin'], reordered);
    reorderMutation.mutate(reordered.map((t) => t._id));
  }

  function openNew() {
    setForm(DEFAULT_FORM);
    setIsNew(true);
    setEditTile({} as CatalogueTile);
  }

  function openEdit(tile: CatalogueTile) {
    setForm({
      title: tile.title,
      description: tile.description || '',
      icon: tile.icon || '',
      bgColor: tile.bgColor || '',
      link: tile.link,
      enabled: tile.enabled,
    });
    setIsNew(false);
    setEditTile(tile);
  }

  const setField = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f: any) => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2A2420]">Catalogue Tiles</h1>
          <p className="text-sm text-[#8B8176]">
            Drag to reorder. These tiles appear in the "Categories" homepage section.
            {tiles.length === 0 && ' When empty, the section auto-shows top-level categories.'}
          </p>
        </div>
        <Button onClick={openNew} size="sm">+ Add Tile</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#F4EEE3] animate-pulse rounded-xl" />
          ))}
        </div>
      ) : tiles.length === 0 ? (
        <div className="border-2 border-dashed border-[#E8DFD2] rounded-2xl py-16 text-center">
          <p className="text-3xl mb-3">🗂️</p>
          <p className="text-sm font-semibold text-[#5A5048] mb-1">No catalogue tiles yet</p>
          <p className="text-xs text-[#A89E92] mb-4">The section will auto-display top-level categories until you add tiles.</p>
          <Button size="sm" onClick={openNew}>+ Add First Tile</Button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tiles.map((t) => t._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tiles.map((tile, i) => (
                <SortableRow
                  key={tile._id}
                  tile={tile}
                  index={i}
                  onEdit={() => openEdit(tile)}
                  onDelete={() => setDeleteId(tile._id)}
                  onToggle={(v) => toggleMutation.mutate({ id: tile._id, enabled: v })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit / Create Modal */}
      <Modal
        open={editTile !== null}
        onClose={() => setEditTile(null)}
        title={isNew ? 'Add Catalogue Tile' : 'Edit Catalogue Tile'}
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Icon preview */}
          <div className="sm:col-span-2 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0 border border-[#E8DFD2]"
              style={{ background: form.bgColor || '#F4EEE3' }}
            >
              {form.icon || '🧸'}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-xs font-medium text-[#2A2420] block mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={setField('icon')}
                  placeholder="🧸"
                  className="w-full border border-[#E8DFD2] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EC5D4A] bg-[#FAF6EF]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#2A2420] block mb-1">Background colour</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f: any) => ({ ...f, bgColor: c }))}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        background: c,
                        borderColor: form.bgColor === c ? '#EC5D4A' : 'transparent',
                      }}
                    />
                  ))}
                  <input
                    type="text"
                    value={form.bgColor}
                    onChange={setField('bgColor')}
                    placeholder="#F4EEE3"
                    className="w-24 border border-[#E8DFD2] rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#EC5D4A] bg-[#FAF6EF]"
                  />
                </div>
              </div>
            </div>
          </div>

          <Input
            label="Title"
            value={form.title}
            onChange={setField('title')}
            placeholder="New Arrivals"
            className="sm:col-span-2"
          />

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-[#2A2420] block mb-1">Short Description</label>
            <input
              type="text"
              value={form.description}
              onChange={setField('description')}
              placeholder="0–2 yrs, 3–5 yrs, 6–8 yrs"
              className="w-full border border-[#E8DFD2] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EC5D4A] bg-[#FAF6EF]"
            />
          </div>

          <Input
            label="Redirect Path"
            value={form.link}
            onChange={setField('link')}
            placeholder="/products?badge=new"
            className="sm:col-span-2"
          />

          <div className="sm:col-span-2">
            <Toggle
              checked={form.enabled}
              onChange={(v) => setForm((f: any) => ({ ...f, enabled: v }))}
              label="Enabled on storefront"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" size="sm" onClick={() => setEditTile(null)}>Cancel</Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate(form)}
            loading={saveMutation.isPending}
            disabled={!form.title || !form.link}
          >
            {isNew ? 'Create Tile' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete Tile"
        message="Are you sure you want to delete this catalogue tile? This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function SortableRow({
  tile,
  index,
  onEdit,
  onDelete,
  onToggle,
}: {
  tile: CatalogueTile;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tile._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={cls(
        'flex items-center gap-3 bg-white border rounded-xl px-4 py-3',
        isDragging ? 'border-[#EC5D4A] shadow-lg' : 'border-[#E8DFD2]',
        !tile.enabled && 'opacity-60',
      )}
    >
      {/* Position */}
      <span className="text-xs text-[#D8CFBF] w-5 text-center flex-shrink-0 select-none font-mono">{index + 1}</span>

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-[#D8CFBF] hover:text-[#8B8176] cursor-grab active:cursor-grabbing p-1 flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="5" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>

      {/* Icon preview */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: tile.bgColor || '#F4EEE3' }}
      >
        {tile.icon || '🧸'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#2A2420] truncate">{tile.title}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {tile.description && (
            <span className="text-xs text-[#A89E92] truncate">{tile.description}</span>
          )}
          <span className="text-[10px] text-[#C8BFB0] flex-shrink-0 font-mono">{tile.link}</span>
        </div>
      </div>

      <Toggle checked={tile.enabled} onChange={onToggle} size="sm" />

      <button onClick={onEdit} className="p-1.5 text-[#A89E92] hover:text-[#5A5048] hover:bg-[#F4EEE3] rounded-lg">
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      <button onClick={onDelete} className="p-1.5 text-[#A89E92] hover:text-[#9B2914] hover:bg-[#FBDED8] rounded-lg">
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </div>
  );
}
