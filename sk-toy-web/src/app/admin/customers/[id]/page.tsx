'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Customer, Address, Order } from '@/types';
import { fmtTk, fmtDateTime, imgUrl, cls } from '@/lib/utils';
import { confirm } from '@/lib/confirm';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#2A2420', background: '#FFF', outline: 'none', fontFamily: 'inherit',
};
const btnPrimary: React.CSSProperties = {
  background: '#EC5D4A', color: '#FFF', border: 'none', borderRadius: 8,
  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const btnOutline: React.CSSProperties = {
  background: 'transparent', color: '#5A5048', border: '1px solid #E8DFD2', borderRadius: 8,
  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const btnDanger: React.CSSProperties = {
  background: '#DC2626', color: '#FFF', border: 'none', borderRadius: 8,
  padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  new: { bg: '#FEF3C7', color: '#92400E' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF' },
  packed: { bg: '#E0E7FF', color: '#3730A3' },
  shipped: { bg: '#CFFAFE', color: '#155E75' },
  delivered: { bg: '#D1FAE5', color: '#065F46' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
  returned: { bg: '#FDE68A', color: '#78350F' },
};

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  paid: { bg: '#D1FAE5', color: '#065F46' },
  collected: { bg: '#D1FAE5', color: '#065F46' },
  refunded: { bg: '#E0E7FF', color: '#3730A3' },
  failed: { bg: '#FEE2E2', color: '#991B1B' },
};

type Tab = 'overview' | 'orders' | 'addresses' | 'password';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const qc = useQueryClient();
  const customerId = params.id as string;
  const [tab, setTab] = useState<Tab>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['admin-customer', customerId],
    queryFn: () => api.get(`/customers/admin/${customerId}`).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/customers/admin/${customerId}`),
    onSuccess: () => {
      toast.success('Customer deleted');
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      router.push('/admin/customers');
    },
    onError: () => toast.error('Failed to delete customer'),
  });

  function handleDelete() {
    setShowDeleteConfirm(true);
  }

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#A89E92' }}>Loading customer...</div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#991B1B', fontSize: 14 }}>Customer not found</p>
        <button onClick={() => router.push('/admin/customers')} style={{ ...btnOutline, marginTop: 12 }}>Back to Customers</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/admin/customers')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8176', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Customers
          </button>
          <span style={{ color: '#D8CFBF' }}>/</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>{customer.name}</h1>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
            textTransform: 'uppercase', letterSpacing: '.06em',
            background: customer.isGuest ? '#FBE7A8' : '#D8EBDC',
            color: customer.isGuest ? '#7A5A00' : '#1D5E33',
          }}>
            {customer.isGuest ? 'Guest' : 'Registered'}
          </span>
          {customer.active === false && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: '#FBDED8', color: '#9B2914', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Disabled
            </span>
          )}
        </div>
        <button onClick={handleDelete} style={btnDanger}>Delete Customer</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #F4EEE3' }}>
        {([
          { id: 'overview', label: 'Overview' },
          { id: 'orders', label: 'Orders' },
          { id: 'addresses', label: 'Addresses' },
          { id: 'password', label: 'Change Password' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '12px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? '2px solid #EC5D4A' : '2px solid transparent',
              color: tab === t.id ? '#EC5D4A' : '#8B8176',
              marginBottom: -2, transition: 'all .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab customer={customer} />}
      {tab === 'orders' && <OrdersTab customerId={customerId} />}
      {tab === 'addresses' && <AddressesTab customerId={customerId} initialAddresses={customer.addresses} />}
      {tab === 'password' && <PasswordTab customerId={customerId} />}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setShowDeleteConfirm(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#FFF', borderRadius: 16, padding: '28px 32px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            {/* Warning icon */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', textAlign: 'center', margin: '0 0 8px' }}>
              Delete Customer
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', margin: '0 0 6px', lineHeight: 1.5 }}>
              You are about to permanently delete:
            </p>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', margin: '12px 0 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#991B1B' }}>{customer.name}</div>
              <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 2 }}>{customer.phone || customer.email || 'No contact info'}</div>
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
              This will remove all saved addresses, wishlist items, and account data. Order history will be preserved. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: 600, border: '1px solid #E5E7EB', borderRadius: 10, background: '#FFF', color: '#374151', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
                style={{ flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 10, background: '#DC2626', color: '#FFF', cursor: 'pointer', opacity: deleteMutation.isPending ? 0.6 : 1 }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function OverviewTab({ customer }: { customer: Customer }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiBox label="Total Orders" value={String(customer.orderCount ?? 0)} accent="#6FB8D9" />
        <KpiBox label="Total Spend" value={fmtTk(customer.totalSpend ?? 0)} accent="#EC5D4A" />
        <KpiBox label="Last Order" value={customer.lastOrder ? fmtDateTime(customer.lastOrder) : 'Never'} accent="#4FA36A" />
        <KpiBox label="Member Since" value={fmtDateTime(customer.createdAt)} accent="#8B5CF6" />
      </div>

      {/* Customer Info Card */}
      <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#2A2420', margin: '0 0 16px' }}>Customer Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-12">
          <Field label="Full Name">{customer.name}</Field>
          <Field label="Email">
            {customer.email
              ? <a href={`mailto:${customer.email}`} style={{ color: '#3F8FBF', textDecoration: 'none' }}>{customer.email}</a>
              : <span style={{ color: '#A89E92' }}>Not provided</span>}
          </Field>
          <Field label="Phone">
            {customer.phone
              ? <a href={`tel:${String(customer.phone).replace(/[^+\d]/g, '')}`} style={{ color: '#3F8FBF', textDecoration: 'none', fontFamily: 'monospace' }}>{customer.phone}</a>
              : <span style={{ color: '#A89E92' }}>Not provided</span>}
          </Field>
          <Field label="Account Type">{customer.isGuest ? 'Guest (created at checkout)' : 'Registered (signed up via OTP)'}</Field>
          <Field label="Account Status">
            <span style={{ color: customer.active !== false ? '#065F46' : '#991B1B', fontWeight: 600 }}>
              {customer.active !== false ? 'Active' : 'Disabled'}
            </span>
          </Field>
          <Field label="Joined">{fmtDateTime(customer.createdAt)}</Field>
        </div>
      </div>

      {/* Addresses Summary */}
      {customer.addresses && customer.addresses.length > 0 && (
        <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#2A2420', margin: '0 0 12px' }}>
            Saved Addresses ({customer.addresses.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customer.addresses.map((addr, i) => (
              <div key={i} style={{ fontSize: 12, color: '#5A5048', background: '#FAF6EF', borderRadius: 8, padding: '10px 14px', border: '1px solid #F4EEE3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#5A5048', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {addr.label || 'Address'}
                  </span>
                  {addr.isDefault && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: '#D8EBDC', color: '#1D5E33', textTransform: 'uppercase' }}>
                      Default
                    </span>
                  )}
                </div>
                <div>{[addr.line1, addr.line2, addr.area, addr.district, addr.zip].filter(Boolean).join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ORDERS TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function OrdersTab({ customerId }: { customerId: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customer-orders', customerId],
    queryFn: () => api.get(`/customers/admin/${customerId}/orders`).then((r) => r.data),
  });

  const orders: Order[] = data || [];

  if (isLoading) return <div style={{ padding: 30, textAlign: 'center', color: '#A89E92' }}>Loading orders...</div>;
  if (orders.length === 0) return <div style={{ padding: 30, textAlign: 'center', color: '#A89E92', fontSize: 13 }}>No orders found for this customer.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 12, color: '#8B8176', fontWeight: 600, margin: 0 }}>
        {orders.length} order{orders.length !== 1 ? 's' : ''} total
      </p>

      {orders.map((order: any) => {
        const isExpanded = expandedId === order._id;
        const itemCount = order.lines?.reduce((s: number, l: any) => s + (l.qty || 1), 0) || 0;

        return (
          <div key={order._id} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, overflow: 'hidden' }}>
            {/* Order header — clickable */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : order._id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer', transition: 'background .1s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FDFBF7'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFF'; }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#2A2420' }}>#{order.orderNo}</span>
                  <StatusBadge status={order.status} />
                  <PaymentBadge status={order.paymentStatus} />
                </div>
                <div style={{ fontSize: 11, color: '#8B8176', marginTop: 3 }}>
                  {fmtDateTime(order.createdAt)} · {itemCount} item{itemCount !== 1 ? 's' : ''} · {order.paymentMethod?.toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#EC5D4A' }}>{fmtTk(order.total)}</div>
              </div>
              <svg
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A89E92" strokeWidth="2"
                style={{ transition: 'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div style={{ borderTop: '1px solid #F4EEE3', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Order info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-10">
                  <Field label="Order Number">#{order.orderNo}</Field>
                  <Field label="Order Date">{fmtDateTime(order.createdAt)}</Field>
                  <Field label="Last Updated">{order.updatedAt ? fmtDateTime(order.updatedAt) : '—'}</Field>
                  <Field label="Customer Name">{order.customerName}</Field>
                  <Field label="Phone">
                    <a href={`tel:${order.phone}`} style={{ color: '#3F8FBF', textDecoration: 'none', fontFamily: 'monospace' }}>{order.phone}</a>
                  </Field>
                  {order.altPhone && <Field label="Alt. Phone">{order.altPhone}</Field>}
                  {order.customerEmail && (
                    <Field label="Email">
                      <a href={`mailto:${order.customerEmail}`} style={{ color: '#3F8FBF', textDecoration: 'none' }}>{order.customerEmail}</a>
                    </Field>
                  )}
                  <Field label="Status"><StatusBadge status={order.status} /></Field>
                  <Field label="Payment Method">{order.paymentMethod?.toUpperCase()}</Field>
                  <Field label="Payment Status"><PaymentBadge status={order.paymentStatus} /></Field>
                  {order.bkashTrxId && <Field label="bKash Trx ID"><code style={{ fontSize: 12 }}>{order.bkashTrxId}</code></Field>}
                  {order.bkashPaymentId && <Field label="bKash Payment ID"><code style={{ fontSize: 12 }}>{order.bkashPaymentId}</code></Field>}
                  {order.courier && <Field label="Courier">{order.courier}</Field>}
                  {order.trackingNo && <Field label="Tracking No"><code style={{ fontSize: 12 }}>{order.trackingNo}</code></Field>}
                  {order.coupon && <Field label="Coupon Applied"><code style={{ fontSize: 12 }}>{order.coupon}</code></Field>}
                </div>

                {/* Shipping Address */}
                <div style={{ background: '#FAF6EF', borderRadius: 10, padding: '12px 16px', border: '1px solid #F4EEE3' }}>
                  <div style={{ fontSize: 11, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>Shipping Address</div>
                  <div style={{ fontSize: 13, color: '#2A2420' }}>
                    {[order.address, order.area, order.district].filter(Boolean).join(', ')}
                  </div>
                </div>

                {/* Line items */}
                <div>
                  <div style={{ fontSize: 11, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>
                    Items ({order.lines?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {order.lines?.map((line: any, i: number) => {
                      const productImg = line.image || (line.product?.images?.[0]);
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FDFBF7', borderRadius: 10, padding: '10px 14px', border: '1px solid #F4EEE3' }}>
                          {productImg && (
                            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#E8DFD2' }}>
                              <Image src={imgUrl(productImg)} alt="" fill style={{ objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {line.name || line.product?.name || 'Unknown Product'}
                            </div>
                            <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>
                              {line.sku && <span>SKU: {line.sku}</span>}
                              {line.variant && <span> · Variant: {line.variant}</span>}
                              {' · '}Qty: {line.qty}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#2A2420' }}>{fmtTk(line.price * line.qty)}</div>
                            <div style={{ fontSize: 11, color: '#8B8176' }}>{fmtTk(line.price)} each</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totals */}
                <div style={{ background: '#FAF6EF', borderRadius: 10, padding: 16, border: '1px solid #F4EEE3' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5A5048', marginBottom: 6 }}>
                    <span>Subtotal</span><span>{fmtTk(order.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5A5048', marginBottom: 6 }}>
                    <span>Shipping</span><span>{fmtTk(order.shipping)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16A34A', marginBottom: 6 }}>
                      <span>Discount</span><span>-{fmtTk(order.discount)}</span>
                    </div>
                  )}
                  {order.giftWrap && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5A5048', marginBottom: 6 }}>
                      <span>Gift Wrap</span><span>{fmtTk(order.giftWrapCost || 0)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#EC5D4A', borderTop: '1px solid #E8DFD2', paddingTop: 10, marginTop: 6 }}>
                    <span>Total</span><span>{fmtTk(order.total)}</span>
                  </div>
                </div>

                {/* Customer Note */}
                {order.note && (
                  <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '12px 16px', border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: 11, color: '#92400E', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 4 }}>
                      Customer Note
                    </div>
                    <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>{order.note}</div>
                  </div>
                )}

                {/* Staff / Admin Note */}
                {order.staffNote && (
                  <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '12px 16px', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: 11, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 4 }}>
                      Admin Note
                    </div>
                    <div style={{ fontSize: 13, color: '#1E3A5F', lineHeight: 1.5 }}>{order.staffNote}</div>
                  </div>
                )}

                {/* No notes indicator */}
                {!order.note && !order.staffNote && (
                  <div style={{ fontSize: 12, color: '#A89E92', fontStyle: 'italic' }}>No notes for this order.</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADDRESSES TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function AddressesTab({ customerId, initialAddresses }: { customerId: string; initialAddresses: Address[] }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: fetchedAddresses } = useQuery({
    queryKey: ['admin-customer-addresses', customerId],
    queryFn: () => api.get(`/customers/admin/${customerId}/addresses`).then((r) => r.data),
  });

  const addresses: Address[] = fetchedAddresses || initialAddresses || [];

  const saveMutation = useMutation({
    mutationFn: (data: { addrId?: string; body: any }) =>
      data.addrId
        ? api.put(`/customers/admin/${customerId}/addresses/${data.addrId}`, data.body)
        : api.post(`/customers/admin/${customerId}/addresses`, data.body),
    onSuccess: () => {
      toast.success('Address saved');
      setEditing(null);
      setAdding(false);
      qc.invalidateQueries({ queryKey: ['admin-customer-addresses', customerId] });
      qc.invalidateQueries({ queryKey: ['admin-customer', customerId] });
    },
    onError: () => toast.error('Failed to save address'),
  });

  const deleteMutation = useMutation({
    mutationFn: (addrId: string) => api.delete(`/customers/admin/${customerId}/addresses/${addrId}`),
    onSuccess: () => {
      toast.success('Address deleted');
      qc.invalidateQueries({ queryKey: ['admin-customer-addresses', customerId] });
      qc.invalidateQueries({ queryKey: ['admin-customer', customerId] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  async function handleDeleteAddr(addrId: string) {
    const ok = await confirm({ title: 'Delete Address', message: 'Remove this address permanently?', confirmLabel: 'Delete', danger: true });
    if (ok) deleteMutation.mutate(addrId);
  }

  if (editing || adding) {
    return (
      <AddressForm
        address={editing || undefined}
        onSave={(body) => saveMutation.mutate({ addrId: editing?._id, body })}
        onCancel={() => { setEditing(null); setAdding(false); }}
        saving={saveMutation.isPending}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 12, color: '#8B8176', fontWeight: 600, margin: 0 }}>{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</p>
        <button onClick={() => setAdding(true)} style={{ ...btnPrimary, padding: '7px 14px', fontSize: 12 }}>+ Add Address</button>
      </div>

      {addresses.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#A89E92', fontSize: 13 }}>No saved addresses.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => (
            <div key={addr._id} style={{ background: '#FFF', borderRadius: 12, padding: '14px 18px', border: '1px solid #E8DFD2' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2A2420' }}>{addr.label || 'Address'}</span>
                  {addr.isDefault && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: '#D8EBDC', color: '#1D5E33', textTransform: 'uppercase' }}>
                      Default
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(addr)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#3F8FBF', fontWeight: 600 }}>Edit</button>
                  <button onClick={() => handleDeleteAddr(addr._id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#DC2626', fontWeight: 600 }}>Delete</button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#5A5048', lineHeight: 1.5 }}>
                {addr.line1 && <div>{addr.line1}</div>}
                {addr.line2 && <div>{addr.line2}</div>}
                <div>{[addr.area, addr.district, addr.zip].filter(Boolean).join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressForm({ address, onSave, onCancel, saving }: { address?: Address; onSave: (body: any) => void; onCancel: () => void; saving: boolean }) {
  const [label, setLabel] = useState(address?.label || 'Home');
  const [line1, setLine1] = useState(address?.line1 || '');
  const [line2, setLine2] = useState(address?.line2 || '');
  const [area, setArea] = useState(address?.area || '');
  const [district, setDistrict] = useState(address?.district || '');
  const [zip, setZip] = useState(address?.zip || '');
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!line1.trim()) { toast.error('Address line 1 is required'); return; }
    onSave({ label, line1, line2, area, district, zip, isDefault });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2A2420' }}>{address ? 'Edit Address' : 'Add New Address'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} placeholder="Home, Office..." />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>Zip Code</label>
          <input value={zip} onChange={(e) => setZip(e.target.value)} style={inputStyle} placeholder="1200" />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>Address Line 1 *</label>
        <input value={line1} onChange={(e) => setLine1(e.target.value)} style={inputStyle} placeholder="House/Road/Block" required />
      </div>
      <div>
        <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>Address Line 2</label>
        <input value={line2} onChange={(e) => setLine2(e.target.value)} style={inputStyle} placeholder="Landmark (optional)" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>Area</label>
          <input value={area} onChange={(e) => setArea(e.target.value)} style={inputStyle} placeholder="Dhanmondi" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>District</label>
          <input value={district} onChange={(e) => setDistrict(e.target.value)} style={inputStyle} placeholder="Dhaka" />
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5A5048', cursor: 'pointer' }}>
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} style={{ width: 16, height: 16 }} />
        Set as default address
      </label>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
        </button>
        <button type="button" onClick={onCancel} style={btnOutline}>Cancel</button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PASSWORD TAB
   ═══════════════════════════════════════════════════════════════════════════ */
function PasswordTab({ customerId }: { customerId: string }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put(`/customers/admin/${customerId}/password`, { newPassword });
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <p style={{ fontSize: 13, color: '#5A5048', margin: '0 0 16px', lineHeight: 1.5 }}>
        Set a new password for this customer. They will need to use the new password on their next login.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#8B8176', fontWeight: 600, display: 'block', marginBottom: 4 }}>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
            placeholder="Re-enter new password"
            required
          />
        </div>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: c.bg, color: c.color, textTransform: 'capitalize' }}>
      {status === 'new' ? 'Pending' : status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const c = PAYMENT_STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: c.bg, color: c.color, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#2A2420' }}>{children}</div>
    </div>
  );
}

function KpiBox({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, padding: '16px 18px', textAlign: 'center', border: '1px solid #F4EEE3' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#8B8176', marginTop: 6, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
