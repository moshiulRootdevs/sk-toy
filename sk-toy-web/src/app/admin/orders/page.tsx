'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Order } from '@/types';
import { fmtTk, fmtDateTime } from '@/lib/utils';
import Pill, { statusColor } from '@/components/ui/Pill';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import SelectUI from '@/components/ui/Select';
import Image from 'next/image';
import { imgUrl } from '@/lib/utils';

const ORDER_STATUSES = ['new','confirmed','packed','shipped','delivered','cancelled','returned'].map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A5048' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

const filterInput: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8,
  padding: '7px 36px 7px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  backgroundImage: CHEVRON, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  appearance: 'none' as React.CSSProperties['appearance'],
  outline: 'none', fontFamily: 'inherit',
};

export default function OrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNo, setTrackingNo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, status, search }],
    queryFn: () => api.get('/orders/admin/all', { params: { page, limit: 20, status, q: search } }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, trackingNo, courier }: any) =>
      api.patch(`/orders/admin/${id}/status`, { status, trackingNo, courier }),
    onSuccess: () => {
      toast.success('Order updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      if (selected) {
        api.get(`/orders/admin/${selected._id}`).then((r) => setSelected(r.data));
      }
    },
    onError: () => toast.error('Failed to update'),
  });

  const orders: Order[] = data?.orders || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Orders</h1>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <input
          type="text"
          placeholder="Search order no, customer..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...filterInput, width: 224 }}
        />
        <SelectUI
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[{ value: '', label: 'All Status' }, ...ORDER_STATUSES]}
          style={{ width: 160 }}
        />
      </div>

      <Table
        columns={[
          { key: 'orderNo', header: 'Order No', render: (o: any) => (
            <span style={{ fontWeight: 700, color: '#2A2420' }}>#{o.orderNo}</span>
          )},
          { key: 'customer', header: 'Customer', render: (o: any) => (
            <div>
              <div style={{ fontWeight: 500, color: '#2A2420' }}>{o.customerName || '—'}</div>
              <div style={{ fontSize: 11, color: '#A89E92' }}>{o.phone || ''}</div>
            </div>
          )},
          { key: 'total', header: 'Total', render: (o: any) => (
            <span style={{ fontWeight: 700 }}>{fmtTk(o.total)}</span>
          )},
          { key: 'paymentMethod', header: 'Payment', render: (o: any) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>{o.paymentMethod}</span>
              <Pill label={o.paymentStatus} color={statusColor(o.paymentStatus)} size="xs" />
            </div>
          )},
          { key: 'status', header: 'Status', render: (o: any) => <Pill label={o.status} color={statusColor(o.status)} /> },
          { key: 'createdAt', header: 'Date', render: (o: any) => (
            <span style={{ fontSize: 11, color: '#8B8176' }}>{fmtDateTime(o.createdAt)}</span>
          )},
        ]}
        data={orders as any[]}
        loading={isLoading}
        onRowClick={(o: any) => { setSelected(o); setNewStatus(''); setTrackingNo(''); }}
        emptyText="No orders found"
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
      </div>

      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order #${selected.orderNo}`} size="xl">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3 }}>Customer</div>
                <div style={{ fontWeight: 500, color: '#2A2420' }}>{selected.customerName || 'Guest'}</div>
                <div style={{ fontSize: 11, color: '#A89E92' }}>{selected.phone}{selected.customerEmail ? ` · ${selected.customerEmail}` : ''}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3 }}>Shipping address</div>
                <div style={{ fontWeight: 500, color: '#2A2420' }}>{selected.address}</div>
                <div style={{ fontSize: 11, color: '#A89E92' }}>{[selected.area, selected.district].filter(Boolean).join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3 }}>Payment</div>
                <div style={{ fontWeight: 500, color: '#2A2420', textTransform: 'capitalize', marginBottom: 4 }}>{selected.paymentMethod}</div>
                <Pill label={selected.paymentStatus} color={statusColor(selected.paymentStatus)} size="xs" />
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#2A2420', fontSize: 13, marginBottom: 10 }}>Items</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.lines.map((line, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {line.image && (
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#F4EEE3', position: 'relative', flexShrink: 0 }}>
                        <Image src={imgUrl(line.image)} alt={line.name} fill className="object-cover" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: '#2A2420', fontSize: 13 }}>{line.name}</div>
                      {line.variant && <div style={{ fontSize: 11, color: '#A89E92' }}>{line.variant}</div>}
                    </div>
                    <span style={{ fontSize: 12, color: '#8B8176' }}>×{line.qty}</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{fmtTk(line.price * line.qty)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #F4EEE3', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#8B8176' }}>Subtotal</span><span>{fmtTk(selected.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#8B8176' }}>Shipping</span><span>{fmtTk(selected.shipping)}</span>
                </div>
                {selected.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4FA36A' }}>
                    <span>Discount</span><span>-{fmtTk(selected.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, borderTop: '1px solid #F4EEE3', paddingTop: 8 }}>
                  <span>Total</span><span>{fmtTk(selected.total)}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F4EEE3', paddingTop: 16 }}>
              <div style={{ fontWeight: 600, color: '#2A2420', fontSize: 13, marginBottom: 10 }}>Update Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <SelectUI
                  value={newStatus || selected.status}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={ORDER_STATUSES}
                  style={{ width: 180 }}
                />
                <input
                  type="text"
                  placeholder="Tracking number (optional)"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                  style={{ ...filterInput, flex: 1, minWidth: 180 }}
                />
                <Button
                  size="sm"
                  onClick={() => updateStatus.mutate({ id: selected._id, status: newStatus || selected.status, trackingNo })}
                  loading={updateStatus.isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
