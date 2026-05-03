'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Banner } from '@/types';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import Pill from '@/components/ui/Pill';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const EMPTY = { slot: 'hero', title: '', subtitle: '', cta: '', ctaLink: '', image: '', bgColor: '#1a1a2e', active: true, order: 0 };

export default function BannersPage() {
  const qc = useQueryClient();
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['admin-banners'],
    queryFn: () => api.get('/banners/admin/all').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/banners', data) : api.put(`/banners/${editBanner?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Banner created!' : 'Updated!');
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      setEditBanner(null);
    },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/banners/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-banners'] }); setDeleteId(null); },
    onError: () => toast.error('Failed'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  function openEdit(b: Banner) {
    setForm({ slot: b.slot, title: b.title || '', subtitle: b.subtitle || '', cta: b.cta || '', ctaLink: b.ctaLink || '', image: b.image || '', bgColor: b.bgColor || '#1a1a2e', active: b.active, order: b.order });
    setIsNew(false);
    setEditBanner(b);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2A2420]">Banners</h1>
        <Button onClick={() => { setForm(EMPTY); setIsNew(true); setEditBanner({} as Banner); }} size="sm">+ Add Banner</Button>
      </div>

      <Table
        columns={[
          { key: 'title', header: 'Title', render: (b: any) => <span className="font-medium text-sm">{b.title || '—'}</span> },
          { key: 'slot', header: 'Slot', render: (b: any) => <span className="text-xs capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{b.slot}</span> },
          { key: 'active', header: 'Status', render: (b: any) => <Pill label={b.active ? 'Active' : 'Inactive'} color={b.active ? 'green' : 'gray'} size="xs" /> },
          { key: 'actions', header: '', render: (b: any) => (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => openEdit(b)} className="p-1.5 text-[#A89E92] hover:text-[#5A5048] hover:bg-[#F4EEE3] rounded">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button onClick={() => setDeleteId(b._id)} className="p-1.5 text-[#A89E92] hover:text-[#9B2914] hover:bg-[#FBDED8] rounded">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          )},
        ]}
        data={banners as any[]}
        loading={isLoading}
        emptyText="No banners yet"
      />

      <Modal open={editBanner !== null} onClose={() => setEditBanner(null)} title={isNew ? 'Add Banner' : 'Edit Banner'} size="md">
        <div className="space-y-4">
          <Select label="Slot" value={form.slot} onChange={set('slot')} options={[
            { value: 'hero', label: 'Hero' },
            { value: 'strip', label: 'Strip' },
            { value: 'promo', label: 'Promo' },
          ]} />
          <Input label="Title" value={form.title} onChange={set('title')} />
          <Input label="Subtitle" value={form.subtitle} onChange={set('subtitle')} />
          <Input label="CTA Button Text" value={form.cta} onChange={set('cta')} />
          <Input label="CTA Link" value={form.ctaLink} onChange={set('ctaLink')} placeholder="/products" />
          <Input label="Image URL" value={form.image} onChange={set('image')} placeholder="https://..." />
          <div className="flex items-center gap-4">
            <Input label="Background Color" type="color" value={form.bgColor} onChange={set('bgColor')} className="w-20" />
            <Input label="Order" type="number" value={form.order || ''} onChange={set('order')} placeholder="0" />
          </div>
          <Toggle checked={form.active} onChange={(v) => setForm((f: any) => ({ ...f, active: v }))} label="Active" />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" size="sm" onClick={() => setEditBanner(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ ...form, order: Number(form.order) })} loading={saveMutation.isPending}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Delete Banner" message="Delete this banner?" confirmLabel="Delete" danger />
    </div>
  );
}
