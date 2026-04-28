'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { NavigationItem } from '@/types';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const EMPTY = { label: '', link: '/', badge: '', order: 0 };

export default function NavigationPage() {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<NavigationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: navItems = [], isLoading } = useQuery<NavigationItem[]>({
    queryKey: ['navigation-admin'],
    queryFn: () => api.get('/navigation').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/navigation', data) : api.put(`/navigation/${editItem?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Added!' : 'Updated!');
      qc.invalidateQueries({ queryKey: ['navigation-admin'] });
      qc.invalidateQueries({ queryKey: ['navigation'] });
      setEditItem(null);
    },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/navigation/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['navigation-admin'] }); qc.invalidateQueries({ queryKey: ['navigation'] }); setDeleteId(null); },
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

      <Table
        columns={[
          { key: 'order', header: '#', render: (i: any) => <span className="text-[#A89E92] text-xs">{i.order}</span> },
          { key: 'label', header: 'Label', render: (i: any) => (
            <div>
              <span className="font-medium text-sm">{i.label}</span>
              {i.badge && <span className="ml-2 text-xs bg-[#EC5D4A] text-white px-1.5 py-0.5 rounded-full">{i.badge}</span>}
            </div>
          )},
          { key: 'link', header: 'Link', render: (i: any) => <span className="text-xs text-blue-600 font-mono">{i.link}</span> },
          { key: 'children', header: 'Sub-items', render: (i: any) => <span className="text-xs text-[#A89E92]">{i.children?.length || 0} items</span> },
          { key: 'actions', header: '', render: (i: any) => (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => openEdit(i)} className="p-1.5 text-[#A89E92] hover:text-[#5A5048] hover:bg-[#F4EEE3] rounded">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button onClick={() => setDeleteId(i._id)} className="p-1.5 text-[#A89E92] hover:text-[#9B2914] hover:bg-[#FBDED8] rounded">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          )},
        ]}
        data={navItems as any[]}
        loading={isLoading}
        emptyText="No navigation items"
      />

      <Modal open={editItem !== null} onClose={() => setEditItem(null)} title={isNew ? 'Add Nav Item' : 'Edit Nav Item'} size="sm">
        <div className="space-y-4">
          <Input label="Label *" value={form.label} onChange={set('label')} placeholder="Products" />
          <Input label="Link *" value={form.link} onChange={set('link')} placeholder="/products" />
          <Input label="Badge (optional)" value={form.badge} onChange={set('badge')} placeholder="New" />
          <Input label="Order" type="number" value={form.order} onChange={set('order')} />
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
