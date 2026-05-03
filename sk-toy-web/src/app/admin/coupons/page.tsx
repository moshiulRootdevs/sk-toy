'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Coupon } from '@/types';
import { fmtDate } from '@/lib/utils';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pill, { statusColor } from '@/components/ui/Pill';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AdminIcon from '@/components/admin/AdminIcon';

const EMPTY = { code: '', type: 'percent', value: '', maxDiscount: '', minSpend: '', limit: '', startsAt: '', endsAt: '', status: 'active' };

export default function CouponsPage() {
  const qc = useQueryClient();
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get('/coupons').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/coupons', data) : api.put(`/coupons/${editCoupon?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Coupon created!' : 'Updated!');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      setEditCoupon(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-coupons'] }); setDeleteId(null); },
    onError: () => toast.error('Failed'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  function openEdit(c: Coupon) {
    setForm({
      code: c.code, type: c.type, value: c.value,
      maxDiscount: c.maxDiscount || '',
      minSpend: c.minSpend || '',
      limit: c.limit || '', startsAt: c.startsAt ? c.startsAt.split('T')[0] : '',
      endsAt: c.endsAt ? c.endsAt.split('T')[0] : '', status: c.status,
    });
    setIsNew(false);
    setEditCoupon(c);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Coupons</h1>
        <Button onClick={() => { setForm(EMPTY); setIsNew(true); setEditCoupon({} as Coupon); }} size="sm">
          <AdminIcon name="plus" size={13} color="#FFF" /> Add Coupon
        </Button>
      </div>

      <Table
        columns={[
          { key: 'code', header: 'Code', render: (c: any) => (
            <span style={{ fontFamily: 'var(--font-mono-var, monospace)', fontWeight: 700, fontSize: 12, background: '#F4EEE3', padding: '2px 8px', borderRadius: 5, color: '#2A2420' }}>
              {c.code}
            </span>
          )},
          { key: 'type', header: 'Type', render: (c: any) => (
            <span style={{ textTransform: 'capitalize', fontSize: 13 }}>{c.type}</span>
          )},
          { key: 'value', header: 'Value', render: (c: any) => (
            <span style={{ fontWeight: 700 }}>{c.type === 'percent' ? `${c.value}%` : `৳${c.value}`}</span>
          )},
          { key: 'uses', header: 'Uses', render: (c: any) => `${c.uses}${c.limit ? `/${c.limit}` : ''}` },
          { key: 'status', header: 'Status', render: (c: any) => <Pill label={c.status} color={statusColor(c.status)} size="xs" /> },
          { key: 'endsAt', header: 'Expires', render: (c: any) => c.endsAt ? (
            <span style={{ fontSize: 11, color: '#8B8176' }}>{fmtDate(c.endsAt)}</span>
          ) : '—' },
          { key: 'actions', header: '', render: (c: any) => (
            <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => openEdit(c)}
                style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#8B8176' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; (e.currentTarget as HTMLElement).style.color = '#2A2420'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
              >
                <AdminIcon name="edit" size={18} />
              </button>
              <button
                onClick={() => setDeleteId(c._id)}
                style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#A89E92' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FBDED8'; (e.currentTarget as HTMLElement).style.color = '#9B2914'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
              >
                <AdminIcon name="trash" size={18} />
              </button>
            </div>
          )},
        ]}
        data={coupons as any[]}
        loading={isLoading}
        emptyText="No coupons"
      />

      <Modal open={editCoupon !== null} onClose={() => setEditCoupon(null)} title={isNew ? 'Add Coupon' : 'Edit Coupon'} size="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Code *" value={form.code} onChange={(e) => setForm((f: any) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" />
          <Select label="Type" value={form.type} onChange={set('type')} storefront options={[
            { value: 'percent', label: 'Percentage' },
            { value: 'fixed',   label: 'Flat' },
          ]} />
          <Input label={form.type === 'percent' ? 'Value (%)' : 'Value (৳)'} type="number" value={form.value} onChange={set('value')} placeholder={form.type === 'percent' ? '20' : '100'} />
          <Input
            label="Max Discount (৳)"
            type="number"
            value={form.maxDiscount}
            onChange={set('maxDiscount')}
            disabled={form.type !== 'percent'}
            hint={form.type === 'percent' ? 'Cap on percent discount (optional)' : 'Only applies to percentage coupons'}
            placeholder="e.g. 500"
          />
          <Input label="Min. Spend (৳)" type="number" value={form.minSpend} onChange={set('minSpend')} />
          <Input label="Usage Limit" type="number" value={form.limit} onChange={set('limit')} hint="Leave blank for unlimited" />
          <Input label="Start Date" type="date" value={form.startsAt} onChange={set('startsAt')} />
          <Input label="End Date" type="date" value={form.endsAt} onChange={set('endsAt')} />
          <div className="sm:col-span-2">
            <Select label="Status" value={form.status} onChange={set('status')} storefront options={[
              { value: 'active',   label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" size="sm" onClick={() => setEditCoupon(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({
            ...form,
            value: Number(form.value),
            maxDiscount: form.type === 'percent' && form.maxDiscount ? Number(form.maxDiscount) : undefined,
            minSpend: form.minSpend ? Number(form.minSpend) : undefined,
            limit: form.limit ? Number(form.limit) : undefined
          })} loading={saveMutation.isPending}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Delete Coupon" message="Delete this coupon?" confirmLabel="Delete" danger />
    </div>
  );
}
