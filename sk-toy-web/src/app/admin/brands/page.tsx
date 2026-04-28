'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Brand } from '@/types';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pill from '@/components/ui/Pill';
import AdminIcon from '@/components/admin/AdminIcon';

const EMPTY = { name: '', em: '', description: '', website: '', active: true, order: 0 };

export default function BrandsPage() {
  const qc = useQueryClient();
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['brands-admin'],
    queryFn: () => api.get('/brands/admin/all').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/brands', data) : api.put(`/brands/${editBrand?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Brand created!' : 'Updated!');
      qc.invalidateQueries({ queryKey: ['brands-admin'] });
      qc.invalidateQueries({ queryKey: ['brands'] });
      setEditBrand(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/brands/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['brands-admin'] }); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f: any) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Brands</h1>
        <Button onClick={() => { setForm(EMPTY); setIsNew(true); setEditBrand({} as Brand); }} size="sm">
          <AdminIcon name="plus" size={13} color="#FFF" /> Add Brand
        </Button>
      </div>

      <Table
        columns={[
          { key: 'name', header: 'Brand', render: (b: any) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4EEE3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#5A5048', flexShrink: 0 }}>
                {b.em || b.name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 500, color: '#2A2420' }}>{b.name}</div>
                {b.website && <div style={{ fontSize: 11, color: '#A89E92', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.website}</div>}
              </div>
            </div>
          )},
          { key: 'active', header: 'Status', render: (b: any) => <Pill label={b.active ? 'Active' : 'Inactive'} color={b.active ? 'green' : 'gray'} size="xs" /> },
          { key: 'order', header: 'Order', render: (b: any) => b.order },
          { key: 'actions', header: '', render: (b: any) => (
            <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => { setForm({ name: b.name, em: b.em || '', description: b.description || '', website: b.website || '', active: b.active, order: b.order }); setIsNew(false); setEditBrand(b); }}
                style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#8B8176' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; (e.currentTarget as HTMLElement).style.color = '#2A2420'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
              >
                <AdminIcon name="edit" size={14} />
              </button>
              <button
                onClick={() => setDeleteId(b._id)}
                style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#A89E92' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FBDED8'; (e.currentTarget as HTMLElement).style.color = '#9B2914'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
              >
                <AdminIcon name="trash" size={14} />
              </button>
            </div>
          )},
        ]}
        data={brands as any[]}
        loading={isLoading}
        emptyText="No brands yet"
      />

      <Modal open={editBrand !== null} onClose={() => setEditBrand(null)} title={isNew ? 'Add Brand' : 'Edit Brand'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Brand Name *" value={form.name} onChange={set('name')} />
          <Input label="Short Code (2 chars)" value={form.em} onChange={set('em')} placeholder="LG" hint="Shown when no logo" />
          <Input label="Website" value={form.website} onChange={set('website')} placeholder="https://..." />
          <Input label="Description" value={form.description} onChange={set('description')} />
          <Input label="Order" type="number" value={form.order} onChange={set('order')} />
          <Toggle checked={form.active} onChange={(v) => setForm((f: any) => ({ ...f, active: v }))} label="Active" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" size="sm" onClick={() => setEditBrand(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ ...form, order: Number(form.order) })} loading={saveMutation.isPending}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete Brand"
        message="Delete this brand?"
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
