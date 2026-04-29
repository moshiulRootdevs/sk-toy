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
    queryFn: () => api.get('/orders/admin/all', { params: { page, limit: 20, status, search } }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, paymentStatus, trackingNo, staffNote }: any) =>
      api.patch(`/orders/admin/${id}/status`, { status, paymentStatus, trackingNo, staffNote }),
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
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A89E92" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search by order no, customer name, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              border: '1px solid #E8DFD2', borderRadius: 8,
              padding: '9px 36px 9px 36px',
              fontSize: 13, color: '#2A2420', background: '#FAF6EF',
              outline: 'none', fontFamily: 'inherit', width: '100%',
            }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: '#A89E92', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#5A5048'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order #${selected.orderNo}`} size="full">
          <OrderDetail selected={selected} newStatus={newStatus} setNewStatus={setNewStatus} trackingNo={trackingNo} setTrackingNo={setTrackingNo} updateStatus={updateStatus} ORDER_STATUSES={ORDER_STATUSES} onPhoneClick={(phone: string) => { setSelected(null); setSearch(phone); }} />
        </Modal>
      )}
    </div>
  );
}

const PAYMENT_STATUSES = [
  { value: 'pending',   label: 'Pending',   color: '#F5C443' },
  { value: 'paid',      label: 'Paid',      color: '#4FA36A' },
  { value: 'collected', label: 'Collected',  color: '#6FB8D9' },
  { value: 'refunded',  label: 'Refunded',  color: '#9C7BC9' },
  { value: 'failed',    label: 'Failed',    color: '#EC5D4A' },
];

function OrderDetail({ selected, newStatus, setNewStatus, trackingNo, setTrackingNo, updateStatus, ORDER_STATUSES, onPhoneClick }: any) {
  const [paymentStatus, setPaymentStatus] = useState(selected.paymentStatus || 'pending');
  const [staffNote, setStaffNote] = useState(selected.staffNote || '');

  const { data: phoneHistory } = useQuery<{ count: number }>({
    queryKey: ['phone-history', selected.phone],
    queryFn: () => api.get(`/orders/admin/phone-history/${selected.phone}`).then((r) => r.data),
    enabled: !!selected.phone,
  });

  const orderCount = phoneHistory?.count ?? 0;
  // This order itself counts as 1, so if count > 1 it's a returning customer
  const isNewCustomer = orderCount <= 1;

  return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3 }}>Customer</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, color: '#2A2420' }}>{selected.customerName || 'Guest'}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                    textTransform: 'uppercase', letterSpacing: '.04em',
                    background: selected.customer ? '#D8EBDC' : '#FBE7A8',
                    color: selected.customer ? '#1D5E33' : '#7A5A00',
                    border: `1px solid ${selected.customer ? '#4FA36A55' : '#F5C44355'}`,
                  }}>
                    {selected.customer ? 'Registered' : 'Guest'}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                    textTransform: 'uppercase', letterSpacing: '.04em',
                    background: isNewCustomer ? '#E8F4FA' : '#F0EAFA',
                    color: isNewCustomer ? '#2A7A9B' : '#6B4FA0',
                    border: `1px solid ${isNewCustomer ? '#6FB8D955' : '#9C7BC955'}`,
                  }}>
                    {isNewCustomer ? 'New' : `${orderCount} orders`}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#A89E92', marginTop: 2 }}>
                  {selected.phone && (
                    <button onClick={() => onPhoneClick(selected.phone)}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#6FB8D9', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >{selected.phone}</button>
                  )}
                  {selected.customerEmail ? ` · ${selected.customerEmail}` : ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3 }}>Shipping address</div>
                <div style={{ fontWeight: 500, color: '#2A2420' }}>{selected.address}</div>
                <div style={{ fontSize: 11, color: '#A89E92' }}>{[selected.area, selected.district].filter(Boolean).join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3 }}>Payment</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 500, color: '#2A2420', textTransform: 'capitalize' }}>{selected.paymentMethod}</span>
                  <Pill label={selected.paymentStatus} color={statusColor(selected.paymentStatus)} size="xs" />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3 }}>Date & Time</div>
                <div style={{ fontWeight: 500, color: '#2A2420', fontSize: 13 }}>{fmtDateTime(selected.createdAt)}</div>
                {selected.updatedAt && selected.updatedAt !== selected.createdAt && (
                  <div style={{ fontSize: 11, color: '#A89E92', marginTop: 2 }}>Updated: {fmtDateTime(selected.updatedAt)}</div>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: '#2A2420', fontSize: 13, marginBottom: 10 }}>Items</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.lines.map((line, i) => {
                  const productId = typeof line.product === 'object' ? (line.product as any)?._id : line.product;
                  const hasLink = !!productId;
                  return (
                  <a key={i} href={hasLink ? `/admin/products/${productId}/view` : undefined} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit',
                      padding: '8px 10px', borderRadius: 10, cursor: hasLink ? 'pointer' : 'default',
                      transition: 'all .15s', border: '1px solid #F4EEE3', background: '#FDFAF6',
                    }}
                    onMouseEnter={(e) => { if (hasLink) { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD2'; } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FDFAF6'; (e.currentTarget as HTMLElement).style.borderColor = '#F4EEE3'; }}
                  >
                    {line.image && (
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#F4EEE3', position: 'relative', flexShrink: 0 }}>
                        <Image src={imgUrl(line.image)} alt={line.name} fill className="object-cover" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: hasLink ? '#1F2F4A' : '#2A2420', fontSize: 13 }}>
                        {line.name}
                        {hasLink && (
                          <svg style={{ marginLeft: 4, display: 'inline', verticalAlign: 'middle' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6FB8D9" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        )}
                      </div>
                      {line.sku && <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'monospace' }}>{line.sku}</div>}
                      {line.variant && <div style={{ fontSize: 11, color: '#A89E92' }}>{line.variant}</div>}
                    </div>
                    <span style={{ fontSize: 12, color: '#8B8176', flexShrink: 0 }}>×{line.qty}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{fmtTk(line.price * line.qty)}</span>
                  </a>
                  );
                })}
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
              <div style={{ fontWeight: 600, color: '#2A2420', fontSize: 13, marginBottom: 12 }}>Update Status</div>
              {(() => {
                const statusColors: Record<string, string> = {
                  new: '#F5C443', confirmed: '#4FA36A', packed: '#6FB8D9', shipped: '#9C7BC9', delivered: '#2D7A4A', cancelled: '#EC5D4A', returned: '#8B8176',
                };
                const allStatuses = ORDER_STATUSES;
                const currentStatus = selected.status;
                const selectedStatus = newStatus || currentStatus;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14, width: '100%' }}>
                    {allStatuses.map(({ value, label }, i) => {
                      const color = statusColors[value] || '#8B8176';
                      const isSelected = selectedStatus === value;
                      const isCurrent = currentStatus === value;
                      return (
                        <div key={value} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <button onClick={() => setNewStatus(value)}
                            style={{
                              position: 'relative', width: '100%',
                              padding: '8px 4px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                              border: isSelected ? `2px solid ${color}` : isCurrent ? `2px solid ${color}80` : '1.5px solid #E8DFD2',
                              background: isSelected ? color : isCurrent ? `${color}15` : '#FFF',
                              color: isSelected ? '#FFF' : isCurrent ? color : '#5A5048',
                              cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                              boxShadow: isSelected ? `0 2px 10px ${color}40` : 'none',
                              textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden',
                            }}
                          >
                            {isCurrent && !isSelected && <span style={{ marginRight: 2 }}>●</span>}
                            {isSelected && <span style={{ marginRight: 2 }}>✓</span>}
                            {label}
                          </button>
                          {i < allStatuses.length - 1 && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8CFBF" strokeWidth="2" style={{ flexShrink: 0, margin: '0 2px' }}>
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              {/* Payment Status */}
              <div style={{ fontWeight: 600, color: '#2A2420', fontSize: 13, marginBottom: 8, marginTop: 4 }}>Payment Status</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {PAYMENT_STATUSES.map(({ value, label, color }) => {
                  const isActive = paymentStatus === value;
                  const isCurrent = selected.paymentStatus === value;
                  return (
                    <button key={value} onClick={() => setPaymentStatus(value)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        border: isActive ? `2px solid ${color}` : isCurrent ? `1.5px solid ${color}80` : '1.5px solid #E8DFD2',
                        background: isActive ? color : isCurrent ? `${color}15` : '#FFF',
                        color: isActive ? '#FFF' : isCurrent ? color : '#5A5048',
                        cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                        boxShadow: isActive ? `0 2px 8px ${color}40` : 'none',
                      }}
                    >
                      {isCurrent && !isActive && <span style={{ marginRight: 3 }}>●</span>}
                      {isActive && <span style={{ marginRight: 3 }}>✓</span>}
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Staff Note */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.06em' }}>Staff Note</label>
                  <span style={{ fontSize: 10, color: staffNote.length > 250 ? '#EC5D4A' : '#A89E92' }}>{staffNote.length}/300</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={300}
                  placeholder="Internal note (not visible to customer)..."
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  style={{
                    border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px',
                    fontSize: 13, color: '#2A2420', background: '#FAF6EF',
                    outline: 'none', fontFamily: 'inherit', width: '100%',
                    resize: 'none', lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Existing staff note display */}
              {selected.staffNote && !staffNote && (
                <div style={{ fontSize: 12, color: '#8B8176', background: '#FAF6EF', padding: '8px 12px', borderRadius: 8, marginBottom: 14, borderLeft: '3px solid #F5C443' }}>
                  <span style={{ fontWeight: 600, color: '#5A5048' }}>Note: </span>{selected.staffNote}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="md"
                  onClick={() => updateStatus.mutate({
                    id: selected._id,
                    status: newStatus || selected.status,
                    paymentStatus,
                    trackingNo,
                    staffNote,
                  })}
                  loading={updateStatus.isPending}
                >
                  Update Order
                </Button>
              </div>
            </div>
          </div>
  );
}
