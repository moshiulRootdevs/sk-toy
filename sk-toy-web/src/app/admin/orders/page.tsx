'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Order } from '@/types';
import { fmtTk, fmtDateTime } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import Pill, { statusColor } from '@/components/ui/Pill';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import SelectUI from '@/components/ui/Select';
import DateRangePicker from '@/components/ui/DateRangePicker';
import Image from 'next/image';
import { imgUrl } from '@/lib/utils';

// Internal status keys mapped to admin-facing labels. The first state on the
// API side is `new`, but staff find "Pending" clearer for an unprocessed order.
const ORDER_STATUS_LABEL: Record<string, string> = {
  new: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};
const ORDER_STATUSES = Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }));

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const adminUser = useAuthStore((s) => s.adminUser);
  const isSuperAdmin = adminUser?.role === 'super_admin';
  const [editItemsOpen, setEditItemsOpen] = useState(false);
  type DraftLine = { product: string; name: string; sku?: string; image?: string; price: number; qty: number; variant?: string };
  const [draftLines, setDraftLines] = useState<DraftLine[]>([]);
  const [draftShipping, setDraftShipping] = useState('');
  const [draftDiscount, setDraftDiscount] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [editAddressOpen, setEditAddressOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    customerName: '', phone: '', altPhone: '', address: '', area: '', district: '', note: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { page, status, search, dateFrom, dateTo }],
    queryFn: () => api.get('/orders/admin/all', { params: { page, limit: 20, status, search, from: dateFrom || undefined, to: dateTo || undefined } }).then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-orders-stats', { dateFrom, dateTo }],
    queryFn: () => api.get('/orders/admin/stats', { params: { from: dateFrom || undefined, to: dateTo || undefined } }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, paymentStatus, trackingNo, staffNote }: any) =>
      api.patch(`/orders/admin/${id}/status`, { status, paymentStatus, trackingNo, staffNote }),
    onSuccess: () => {
      toast.success('Order updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-orders-stats'] });
      if (selected) {
        api.get(`/orders/admin/${selected._id}`).then((r) => setSelected(r.data));
      }
    },
    onError: () => toast.error('Failed to update'),
  });

  const editLines = useMutation({
    mutationFn: ({ id, lines, shipping, discount, note }: { id: string; lines: DraftLine[]; shipping?: number; discount?: number; note: string }) =>
      api.patch(`/orders/admin/${id}/lines`, {
        note,
        shipping,
        discount,
        lines: lines.map((l) => ({ product: l.product, qty: l.qty, variant: l.variant })),
      }).then((r) => r.data),
    onSuccess: (updated: Order) => {
      toast.success('Order items updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-orders-stats'] });
      setSelected(detailOpen ? updated : null);
      setEditItemsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update items'),
  });

  function openEditItems() {
    if (!selected) return;
    setDraftLines(
      selected.lines.map((l: any) => ({
        product: typeof l.product === 'object' ? l.product._id : l.product,
        name: l.name,
        sku: l.sku,
        image: l.image,
        price: l.price,
        qty: l.qty,
        variant: l.variant,
      })),
    );
    setDraftShipping(String(selected.shipping ?? 0));
    setDraftDiscount(String(selected.discount ?? 0));
    setDraftNote('');
    setProductSearch('');
    setProductSearchOpen(false);
    setEditItemsOpen(true);
  }

  const editAddress = useMutation({
    mutationFn: ({ id, ...payload }: any) =>
      api.patch(`/orders/admin/${id}/address`, payload).then((r) => r.data),
    onSuccess: (updated: Order) => {
      toast.success('Address updated');
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelected(updated);
      setEditAddressOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update address'),
  });

  function openEditAddress() {
    if (!selected) return;
    setAddressForm({
      customerName: selected.customerName || '',
      phone:        selected.phone        || '',
      altPhone:     selected.altPhone     || '',
      address:      selected.address      || '',
      area:         selected.area         || '',
      district:     selected.district     || '',
      note: '',
    });
    setEditAddressOpen(true);
  }

  function submitEditAddress() {
    if (!selected) return;
    if (!addressForm.note.trim()) { toast.error('Please add a note explaining the change'); return; }
    if (!addressForm.customerName.trim() || !addressForm.phone.trim() || !addressForm.address.trim()) {
      toast.error('Name, phone, and address are required');
      return;
    }
    editAddress.mutate({
      id: selected._id,
      customerName: addressForm.customerName.trim(),
      phone:        addressForm.phone.trim(),
      altPhone:     addressForm.altPhone.trim(),
      address:      addressForm.address.trim(),
      area:         addressForm.area.trim(),
      district:     addressForm.district.trim(),
      note:         addressForm.note.trim(),
    });
  }

  function submitEditItems() {
    if (!selected) return;
    if (!draftNote.trim()) { toast.error('Please add a note explaining the change'); return; }
    if (draftLines.length === 0) { toast.error('Order must have at least one item'); return; }
    if (draftLines.some((l) => l.qty < 1)) { toast.error('Each line must have qty ≥ 1'); return; }
    const shippingVal = draftShipping === '' ? undefined : Number(draftShipping);
    const discountVal = draftDiscount === '' ? undefined : Number(draftDiscount);
    if (shippingVal !== undefined && (!Number.isFinite(shippingVal) || shippingVal < 0)) { toast.error('Shipping must be ≥ 0'); return; }
    if (discountVal !== undefined && (!Number.isFinite(discountVal) || discountVal < 0)) { toast.error('Discount must be ≥ 0'); return; }
    editLines.mutate({
      id: selected._id,
      lines: draftLines,
      shipping: shippingVal,
      discount: discountVal,
      note: draftNote.trim(),
    });
  }

  const orders: Order[] = data?.orders || [];

  const fmtNum = (n: number) => n?.toLocaleString('en-BD', { maximumFractionDigits: 0 }) || '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Orders</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Orders" value={fmtNum(stats?.totalOrders || 0)} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6FB8D9" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        } accent="#6FB8D9" />
        <RevenueCard stats={stats} fmtNum={fmtNum} />
        <StatCard label="Avg Order (BDT)" value={fmtNum(Math.round(stats?.avgOrderValue || 0))} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        } accent="#8B5CF6" />
        <StatCard label="Discount (BDT)" value={fmtNum(stats?.totalDiscount || 0)} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><line x1="5" y1="19" x2="19" y2="5"/></svg>
        } accent="#F59E0B" />
        <StatCard label="Shipping (BDT)" value={fmtNum(stats?.totalShipping || 0)} icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC5D4A" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        } accent="#EC5D4A" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
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
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1); }}
          />
        </div>
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
          { key: 'total', header: 'Total (BDT)', render: (o: any) => (
            <span style={{ fontWeight: 700 }}>{o.total?.toLocaleString('en-BD', { maximumFractionDigits: 0 })}</span>
          )},
          { key: 'paymentMethod', header: 'Payment', render: (o: any) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>{o.paymentMethod}</span>
              <Pill label={o.paymentStatus} color={statusColor(o.paymentStatus)} size="xs" />
            </div>
          )},
          { key: 'status', header: 'Status', render: (o: any) => <Pill label={o.status} color={statusColor(o.status)} /> },
          { key: 'createdAt', header: 'Date & Time', render: (o: any) => (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>{new Date(o.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div style={{ fontSize: 11, color: '#8B8176' }}>{new Date(o.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
            </div>
          )},
          ...(isSuperAdmin ? [{
            key: 'actions',
            header: '',
            render: (o: any) => (
              <Tooltip label="Edit items">
                <button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelected(o);
                    setNewStatus('');
                    setTrackingNo('');
                    setDraftLines((o.lines || []).map((l: any) => ({
                      product: typeof l.product === 'object' ? l.product._id : l.product,
                      name: l.name, sku: l.sku, image: l.image,
                      price: l.price, qty: l.qty, variant: l.variant,
                    })));
                    setDraftShipping(String(o.shipping ?? 0));
                    setDraftDiscount(String(o.discount ?? 0));
                    setDraftNote('');
                    setProductSearch('');
                    setProductSearchOpen(false);
                    setEditItemsOpen(true);
                  }}
                  style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#9B2914', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FBDED8'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  aria-label="Edit items"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </Tooltip>
            ),
          }] : []),
        ]}
        data={orders as any[]}
        loading={isLoading}
        onRowClick={(o: any) => { setSelected(o); setDetailOpen(true); setNewStatus(''); setTrackingNo(''); }}
        emptyText="No orders found"
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#8B8176' }}>
          {data?.total ? `Showing ${((page - 1) * 20) + 1}–${Math.min(page * 20, data.total)} of ${data.total} orders` : ''}
        </span>
        <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
      </div>

      {selected && detailOpen && (
        <Modal open={detailOpen} onClose={() => { setDetailOpen(false); setSelected(null); }} title={`Order #${selected.orderNo}`} size="full">
          <OrderDetail
            selected={selected}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            trackingNo={trackingNo}
            setTrackingNo={setTrackingNo}
            updateStatus={updateStatus}
            ORDER_STATUSES={ORDER_STATUSES}
            onPhoneClick={(phone: string) => { setDetailOpen(false); setSelected(null); setSearch(phone); }}
            isSuperAdmin={isSuperAdmin}
            onEditItems={openEditItems}
            onEditAddress={openEditAddress}
          />
        </Modal>
      )}

      {selected && editItemsOpen && (
        <Modal open={editItemsOpen} onClose={() => { setEditItemsOpen(false); if (!detailOpen) setSelected(null); }} title={`Edit items — Order #${selected.orderNo}`} size="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {draftLines.map((l, i) => (
                <div key={`${l.product}-${l.variant || ''}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, border: '1px solid #F4EEE3', borderRadius: 10, background: '#FDFAF6' }}>
                  {l.image && (
                    <Image src={imgUrl(l.image)} alt={l.name} width={44} height={44} style={{ borderRadius: 6, objectFit: 'cover' }} unoptimized />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                    <div style={{ fontSize: 11.5, color: '#8B8176' }}>
                      {l.variant ? `${l.variant} · ` : ''}{fmtTk(l.price)} each
                    </div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => setDraftLines((dl) => dl.map((x, xi) => xi === i ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}
                      style={{ width: 26, height: 26, border: '1px solid #E8DFD2', borderRadius: 6, background: '#FFF', cursor: 'pointer', fontSize: 14, color: '#5A5048', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
                    >−</button>
                    <input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={(e) => {
                        const q = Math.max(1, Number(e.target.value) || 1);
                        setDraftLines((dl) => dl.map((x, xi) => xi === i ? { ...x, qty: q } : x));
                      }}
                      style={{ width: 50, textAlign: 'center', padding: '4px 6px', border: '1px solid #E8DFD2', borderRadius: 6, fontSize: 13, background: '#FAF6EF', outline: 'none', fontFamily: 'inherit', color: '#2A2420' }}
                    />
                    <button
                      onClick={() => setDraftLines((dl) => dl.map((x, xi) => xi === i ? { ...x, qty: x.qty + 1 } : x))}
                      style={{ width: 26, height: 26, border: '1px solid #E8DFD2', borderRadius: 6, background: '#FFF', cursor: 'pointer', fontSize: 14, color: '#5A5048', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
                    >+</button>
                  </div>
                  <div style={{ width: 80, textAlign: 'right', fontWeight: 600, fontSize: 13, color: '#2A2420' }}>{fmtTk(l.price * l.qty)}</div>
                  <button
                    onClick={() => setDraftLines((dl) => dl.filter((_, xi) => xi !== i))}
                    title="Remove"
                    style={{ border: 0, background: 'none', cursor: 'pointer', color: '#EC5D4A', padding: 4, display: 'inline-flex', borderRadius: 6, fontFamily: 'inherit' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {draftLines.length === 0 && (
                <div style={{ padding: 16, border: '1px dashed #FFD4E6', borderRadius: 8, color: '#9B2914', fontSize: 12, textAlign: 'center' }}>
                  Order has no items. Add at least one product below to save.
                </div>
              )}
            </div>

            <ProductSearchAdder
              search={productSearch}
              setSearch={setProductSearch}
              open={productSearchOpen}
              setOpen={setProductSearchOpen}
              onPick={(p: any, variant?: string) => {
                const variantPrice = variant ? p.variants?.find((v: any) => v.name === variant)?.price : undefined;
                const variantSku = variant ? p.variants?.find((v: any) => v.name === variant)?.sku : undefined;
                const variantImage = variant ? p.variants?.find((v: any) => v.name === variant)?.image : undefined;
                setDraftLines((dl) => {
                  const existingIdx = dl.findIndex((l) => l.product === p._id && (l.variant || '') === (variant || ''));
                  if (existingIdx >= 0) {
                    return dl.map((x, i) => i === existingIdx ? { ...x, qty: x.qty + 1 } : x);
                  }
                  return [...dl, {
                    product: p._id,
                    name: p.name,
                    sku: variantSku || p.sku,
                    image: variantImage || p.images?.[0],
                    price: variantPrice || p.price,
                    qty: 1,
                    variant: variant || '',
                  }];
                });
                setProductSearch('');
                setProductSearchOpen(false);
              }}
            />

            <div style={{ borderTop: '1px solid #F4EEE3', paddingTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AmountInput label="Shipping" value={draftShipping} onChange={setDraftShipping} />
              <AmountInput label="Discount" value={draftDiscount} onChange={setDraftDiscount} />
            </div>
            {(() => {
              const sub = draftLines.reduce((a, l) => a + l.price * l.qty, 0);
              const ship = Number(draftShipping || 0);
              const disc = Number(draftDiscount || 0);
              const gw   = Number((selected as any)?.giftWrapCost || 0);
              const tot  = sub + ship + gw - disc;
              return (
                <div style={{ background: '#FFF8FB', border: '1px solid #FFE0EC', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B8176' }}><span>Subtotal</span><span>{fmtTk(sub)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B8176' }}><span>Shipping</span><span>{fmtTk(ship)}</span></div>
                  {gw > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B8176' }}><span>Gift wrap</span><span>{fmtTk(gw)}</span></div>
                  )}
                  {disc > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4FA36A' }}><span>Discount</span><span>−{fmtTk(disc)}</span></div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14, color: '#2A2420', borderTop: '1px solid #FFE0EC', paddingTop: 6, marginTop: 4 }}>
                    <span>New total</span><span>{fmtTk(tot)}</span>
                  </div>
                </div>
              );
            })()}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2A2420', marginBottom: 4 }}>
                Reason / Note <span style={{ color: '#EC5D4A' }}>*</span>
              </label>
              <textarea
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Why are you editing the items? (e.g. customer called to remove a product, item out of stock, swap to a different variant…)"
                rows={3}
                style={{
                  width: '100%', padding: '9px 12px', border: '1px solid #E8DFD2', borderRadius: 8,
                  background: '#FAF6EF', fontSize: 13, color: '#2A2420', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => { setEditItemsOpen(false); if (!detailOpen) setSelected(null); }} variant="ghost">Cancel</Button>
              <Button onClick={submitEditItems} loading={editLines.isPending} disabled={!draftNote.trim() || draftLines.length === 0}>
                Save changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {selected && editAddressOpen && (
        <Modal open={editAddressOpen} onClose={() => setEditAddressOpen(false)} title={`Edit address — Order #${selected.orderNo}`} size="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TextInput label="Customer name *" value={addressForm.customerName} onChange={(v) => setAddressForm((f) => ({ ...f, customerName: v }))} />
              <TextInput label="Phone *"         value={addressForm.phone}        onChange={(v) => setAddressForm((f) => ({ ...f, phone: v }))} />
              <TextInput label="Alternate phone" value={addressForm.altPhone}     onChange={(v) => setAddressForm((f) => ({ ...f, altPhone: v }))} />
              <TextInput label="District"        value={addressForm.district}     onChange={(v) => setAddressForm((f) => ({ ...f, district: v }))} />
              <TextInput label="Area / Thana"    value={addressForm.area}         onChange={(v) => setAddressForm((f) => ({ ...f, area: v }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2A2420', marginBottom: 4 }}>Address (line 1) <span style={{ color: '#EC5D4A' }}>*</span></label>
              <textarea
                value={addressForm.address}
                onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E8DFD2', borderRadius: 8, background: '#FAF6EF', fontSize: 13, color: '#2A2420', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div style={{ background: '#FFF8FB', border: '1px solid #FFE0EC', borderRadius: 8, padding: 10, fontSize: 12, color: '#5A5048' }}>
              Changing district does <strong>not</strong> auto-update shipping cost. If the new district falls in a different shipping zone, use <strong>Edit Items</strong> to adjust shipping.
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2A2420', marginBottom: 4 }}>
                Reason / Note <span style={{ color: '#EC5D4A' }}>*</span>
              </label>
              <textarea
                value={addressForm.note}
                onChange={(e) => setAddressForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Why are you updating the address? (e.g. customer requested delivery to a different address, typo in original entry…)"
                rows={3}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #E8DFD2', borderRadius: 8, background: '#FAF6EF', fontSize: 13, color: '#2A2420', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setEditAddressOpen(false)} variant="ghost">Cancel</Button>
              <Button onClick={submitEditAddress} loading={editAddress.isPending} disabled={!addressForm.note.trim()}>
                Save changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

function ProductSearchAdder({ search, setSearch, open, setOpen, onPick }: {
  search: string; setSearch: (v: string) => void;
  open: boolean; setOpen: (v: boolean) => void;
  onPick: (product: any, variant?: string) => void;
}) {
  const { data, isFetching } = useQuery({
    queryKey: ['order-edit-product-search', search],
    queryFn: () => api.get('/products/admin/all', { params: { search: search.trim(), limit: 10 } }).then((r) => r.data),
    enabled: open && search.trim().length >= 2,
    staleTime: 30_000,
  });
  const products: any[] = data?.products || [];

  return (
    <div style={{ borderTop: '1px solid #F4EEE3', paddingTop: 10, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A89E92" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search products to add (name or SKU, min 2 chars)"
            style={{
              width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #E8DFD2', borderRadius: 8,
              background: '#FAF6EF', fontSize: 13, color: '#2A2420', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
      {open && search.trim().length >= 2 && (
        <div style={{ marginTop: 6, border: '1px solid #F4EEE3', borderRadius: 8, background: '#FFF', maxHeight: 240, overflowY: 'auto' }}>
          {isFetching && <div style={{ padding: 10, fontSize: 12, color: '#8B8176' }}>Searching…</div>}
          {!isFetching && products.length === 0 && <div style={{ padding: 10, fontSize: 12, color: '#8B8176' }}>No matches</div>}
          {!isFetching && products.map((p: any) => (
            <div key={p._id} style={{ borderBottom: '1px solid #F4EEE3' }}>
              {(p.variants?.length ? p.variants : [null]).map((v: any) => {
                const variantName = v?.name || '';
                const price = v?.price || p.price;
                const stock = v ? v.stock : p.stock;
                return (
                  <button
                    key={`${p._id}-${variantName}`}
                    type="button"
                    onClick={() => onPick(p, variantName)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
                      border: 0, background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFF8FB'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {p.images?.[0] && (
                      <Image src={imgUrl(v?.image || p.images[0])} alt={p.name} width={32} height={32} style={{ borderRadius: 4, objectFit: 'cover' }} unoptimized />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#2A2420', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}{variantName ? ` — ${variantName}` : ''}
                      </div>
                      <div style={{ fontSize: 11, color: '#8B8176' }}>{fmtTk(price)} · stock {stock}</div>
                    </div>
                    <span style={{ fontSize: 11, color: '#9B2914', fontWeight: 600 }}>+ Add</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2A2420', marginBottom: 4 }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', border: '1px solid #E8DFD2', borderRadius: 8,
          background: '#FAF6EF', fontSize: 13, color: '#2A2420', outline: 'none', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function AmountInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#2A2420', marginBottom: 4 }}>{label}</label>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', border: '1px solid #E8DFD2', borderRadius: 8,
          background: '#FAF6EF', fontSize: 13, color: '#2A2420', outline: 'none', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div style={{ background: '#FFF', border: '1px solid #F4EEE3', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#2A2420', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, color: '#8B8176', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: '#4FA36A',
  collected: '#6FB8D9',
  pending: '#F5C443',
  refunded: '#9C7BC9',
  failed: '#EC5D4A',
};

function RevenueCard({ stats, fmtNum }: { stats: any; fmtNum: (n: number) => string }) {
  const revenue = stats?.paymentStatusRevenue || {};
  const entries = Object.entries(revenue) as [string, { count: number; total: number }][];
  // Sort: paid first, then collected, pending, refunded, failed
  const order = ['paid', 'collected', 'pending', 'refunded', 'failed'];
  entries.sort((a, b) => (order.indexOf(a[0]) - order.indexOf(b[0])));

  return (
    <div style={{ background: '#FFF', border: '1px solid #F4EEE3', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#4FA36A15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4FA36A" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#2A2420', lineHeight: 1.1 }}>{fmtNum(stats?.totalRevenue || 0)}</div>
          <div style={{ fontSize: 10, color: '#8B8176', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Revenue (BDT)</div>
        </div>
      </div>
      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, borderTop: '1px solid #F4EEE3', paddingTop: 8 }}>
          {entries.map(([status, data]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: PAYMENT_STATUS_COLORS[status] || '#8B8176', flexShrink: 0 }} />
                <span style={{ color: '#5A5048', textTransform: 'capitalize', fontWeight: 500 }}>{status}</span>
              </div>
              <span style={{ fontWeight: 700, color: '#2A2420', fontFamily: 'monospace', fontSize: 11 }}>{fmtNum(data.total)}</span>
            </div>
          ))}
        </div>
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

function OrderDetail({ selected, newStatus, setNewStatus, trackingNo, setTrackingNo, updateStatus, ORDER_STATUSES, onPhoneClick, isSuperAdmin, onEditItems, onEditAddress }: any) {
  const [paymentStatus, setPaymentStatus] = useState(selected.paymentStatus || 'pending');
  const [staffNote, setStaffNote] = useState(selected.staffNote || '');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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
            <div className="adm-grid-4">
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
                {selected.altPhone && (
                  <div style={{ fontSize: 11, color: '#A89E92', marginTop: 2 }}>
                    <span style={{ color: '#8B8176' }}>Alt: </span>
                    <button onClick={() => onPhoneClick(selected.altPhone)}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#6FB8D9', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >{selected.altPhone}</button>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Shipping address</span>
                  {isSuperAdmin && (
                    <button
                      onClick={onEditAddress}
                      style={{ border: 0, background: 'none', padding: 0, color: '#9B2914', cursor: 'pointer', fontSize: 10.5, fontWeight: 600, fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      Edit
                    </button>
                  )}
                </div>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontWeight: 600, color: '#2A2420', fontSize: 13 }}>Items</div>
                {isSuperAdmin && (
                  <button
                    onClick={onEditItems}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 11px', borderRadius: 8, border: '1px solid #FFD4E6', background: '#FFF5F8',
                      color: '#9B2914', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Items
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.lines.map((line: any, i: number) => {
                  const productId = typeof line.product === 'object' ? (line.product as any)?._id : line.product;
                  const hasLink = !!productId;
                  const isExpanded = expandedIdx === i;
                  return (
                    <div key={i} style={{ border: '1px solid #F4EEE3', borderRadius: 10, background: '#FDFAF6', overflow: 'hidden', transition: 'border-color .15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 0' }}>
                        <button
                          type="button"
                          onClick={() => hasLink && setExpandedIdx(isExpanded ? null : i)}
                          disabled={!hasLink}
                          style={{
                            flex: 1, minWidth: 0,
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '8px 10px', border: 0, background: 'none',
                            color: 'inherit', textAlign: 'left', fontFamily: 'inherit',
                            cursor: hasLink ? 'pointer' : 'default',
                            borderRadius: 8,
                            transition: 'background .15s',
                          }}
                          onMouseEnter={(e) => { if (hasLink && !isExpanded) (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          {line.image && (
                            <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#F4EEE3', position: 'relative', flexShrink: 0 }}>
                              <Image src={imgUrl(line.image)} alt={line.name} fill className="object-cover" />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, color: hasLink ? '#1F2F4A' : '#2A2420', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{line.name}</span>
                              {hasLink && (
                                <svg style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
                                     width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B8176" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              )}
                            </div>
                            {line.sku && <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'monospace' }}>{line.sku}</div>}
                            {line.variant && <div style={{ fontSize: 11, color: '#A89E92' }}>{line.variant}</div>}
                          </div>
                          <span style={{ fontSize: 12, color: '#8B8176', flexShrink: 0 }}>×{line.qty}</span>
                          <span style={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{fmtTk(line.price * line.qty)}</span>
                        </button>
                        {hasLink && (
                          <Tooltip label="View full product details" position="left">
                            <a
                              href={`/admin/products/${productId}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="View full product details"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 22, height: 22, borderRadius: 6,
                                background: '#1F2F4A', color: '#FFF',
                                textDecoration: 'none', flexShrink: 0,
                                transition: 'background .15s',
                              }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#2A3F5F'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#1F2F4A'; }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                          </Tooltip>
                        )}
                      </div>
                      {isExpanded && hasLink && (
                        <ProductExpandedPanel productId={productId} />
                      )}
                    </div>
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
                {selected.adjustments && selected.adjustments.length > 0 && (
                  <div style={{ marginTop: 10, padding: 10, background: '#FFF8FB', border: '1px solid #FFE0EC', borderRadius: 8, fontSize: 11.5 }}>
                    <div style={{ fontWeight: 700, color: '#9B2914', marginBottom: 6 }}>Adjustment history</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selected.adjustments.slice().reverse().map((a: any, i: number) => (
                        <div key={i} style={{ borderLeft: '2px solid #FF6FB1', paddingLeft: 8, color: '#5A5048' }}>
                          <div><strong style={{ color: '#1F2F4A', textTransform: 'capitalize' }}>{a.field}</strong>: {fmtTk(a.oldValue)} → {fmtTk(a.newValue)}</div>
                          <div style={{ fontStyle: 'italic', marginTop: 2 }}>"{a.note}"</div>
                          <div style={{ fontSize: 10.5, color: '#A89E92', marginTop: 2 }}>{a.byName || 'admin'} · {fmtDateTime(a.at)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    {allStatuses.map(({ value, label }: { value: string; label: string }, i: number) => {
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

              {/* Customer's note (read-only — set by the buyer at checkout) */}
              {selected.note && (
                <div style={{
                  marginBottom: 18,
                  background: '#FFFBF2',
                  border: '1px solid #FBE7A8',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}>
                  {/* Speech-bubble icon */}
                  <div style={{
                    flexShrink: 0,
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: '#FBE7A8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#7A5A00',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#7A5A00', textTransform: 'uppercase', letterSpacing: '.07em' }}>Customer Note</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#FFFFFF', color: '#7A5A00', border: '1px solid #FBE7A8', textTransform: 'uppercase', letterSpacing: '.06em' }}>From buyer</span>
                    </div>
                    <div style={{
                      fontSize: 13.5, color: '#2A2420', lineHeight: 1.65,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      fontStyle: 'italic',
                    }}>
                      “{selected.note}”
                    </div>
                  </div>
                </div>
              )}

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

/* ── Inline product summary shown when an order line is expanded ── */
function ProductExpandedPanel({ productId }: { productId: string }) {
  const { data: product, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-product', productId],
    queryFn: () => api.get(`/products/admin/${productId}`).then((r) => r.data),
  });

  const wrap: React.CSSProperties = {
    borderTop: '1px solid #F4EEE3',
    background: '#FFFBF2',
    padding: '12px 14px',
  };

  if (isLoading) {
    return <div style={{ ...wrap, fontSize: 12, color: '#A89E92' }}>Loading product details…</div>;
  }
  if (isError || !product) {
    return <div style={{ ...wrap, fontSize: 12, color: '#A89E92' }}>Could not load product details.</div>;
  }

  const stockColor = product.stock === 0 ? '#EC5D4A' : product.stock < 8 ? '#F39436' : '#4FA36A';
  const stockLabel = product.stock === 0 ? 'Out of stock' : product.stock < 8 ? 'Low' : 'In stock';
  const cats: any[] = Array.isArray(product.categories) && product.categories.length
    ? product.categories
    : product.category ? [product.category] : [];
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div style={wrap}>
      {/* Quick facts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <Fact label="Price" value={
          <span>
            <strong style={{ color: '#EC5D4A' }}>{fmtTk(product.price)}</strong>
            {discount > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, color: '#A89E92', textDecoration: 'line-through' }}>{fmtTk(product.comparePrice)}</span>
            )}
            {discount > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, color: '#4FA36A', fontWeight: 600 }}>−{discount}%</span>
            )}
          </span>
        } />
        <Fact label="Stock" value={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: stockColor, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: stockColor }} />
            {product.stock} <span style={{ fontWeight: 500, fontSize: 11 }}>({stockLabel})</span>
          </span>
        } />
        <Fact label="Status" value={
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: product.active ? '#D8EBDC' : '#F4EEE3', color: product.active ? '#1D5E33' : '#8B8176', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            {product.active ? 'Active' : 'Inactive'}
          </span>
        } />
        {cats.length > 0 && (
          <Fact label="Category" value={
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {cats.slice(0, 3).map((c: any, idx: number) => (
                <span key={idx} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: '#E8F1FA', color: '#3F8FBF', fontWeight: 600 }}>
                  {typeof c === 'object' ? c.name : c}
                </span>
              ))}
              {cats.length > 3 && (
                <span style={{ fontSize: 10, color: '#8B8176' }}>+{cats.length - 3}</span>
              )}
            </div>
          } />
        )}
        {product.ageGroup && <Fact label="Age" value={<span style={{ fontSize: 12, color: '#2A2420' }}>{product.ageGroup.replace('age-', '')}</span>} />}
        {product.gender && <Fact label="Gender" value={<span style={{ fontSize: 12, color: '#2A2420', textTransform: 'capitalize' }}>{product.gender}</span>} />}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 10, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
