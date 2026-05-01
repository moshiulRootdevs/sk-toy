'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { Order } from '@/types';
import { fmtTk, fmtDate } from '@/lib/utils';
import Pill, { statusColor } from '@/components/ui/Pill';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirm } from '@/lib/confirm';
import { ALL_DISTRICTS } from '@/lib/districts';
import type { Address } from '@/types';

// Friendly explanations for the status pills shown on each order card.
const ORDER_STATUS_TIP: Record<string, string> = {
  new:       'Pending — your order has been placed and is awaiting confirmation.',
  confirmed: 'Confirmed — we have your order and are getting it ready.',
  packed:    'Packed — your items are boxed and ready to ship.',
  shipped:   'Shipped — your parcel is on the way.',
  delivered: 'Delivered — the parcel reached you. Enjoy!',
  cancelled: 'Cancelled — this order will not be processed.',
  returned:  'Returned — items were sent back.',
};

const PAYMENT_STATUS_TIP: Record<string, string> = {
  pending:   'Payment pending — collected on delivery (COD) or awaiting your transfer.',
  paid:      'Paid — payment received.',
  collected: 'Collected — cash collected by the courier.',
  refunded:  'Refunded — payment returned to you.',
  failed:    'Failed — payment did not go through.',
};

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, logoutCustomer, setCustomer } = useAuthStore();
  type Tab = 'orders' | 'profile' | 'addresses';
  const validTab = (t: string | null): Tab => (t === 'profile' || t === 'addresses' ? t : 'orders');
  const [activeTab, setActiveTab] = useState<Tab>(validTab(searchParams.get('tab')));

  // Sync tab when the URL changes (e.g. via the header dropdown)
  useEffect(() => {
    setActiveTab(validTab(searchParams.get('tab')));
  }, [searchParams]);
  const [editName, setEditName] = useState(customer?.name || '');
  const [editEmail, setEditEmail] = useState(customer?.email || '');
  const [saving, setSaving] = useState(false);

  // Auth store rehydrates after mount (skipHydration: true), so the initial
  // useState above may capture empty values. Sync once when the customer lands,
  // but only into still-empty fields so we don't overwrite the user's edits.
  useEffect(() => {
    if (!customer) return;
    setEditName((v) => v || customer.name || '');
    setEditEmail((v) => v || customer.email || '');
  }, [customer]);
  // Change-password fields
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const { data: ordersData } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then((r) => r.data),
    enabled: !!customer,
  });

  if (!customer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold text-[#1F2F4A] mb-4">Please sign in 👋</h1>
        <Link href="/login"><Button size="lg">Sign In</Button></Link>
      </div>
    );
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await api.put('/customers/me', { name: editName, email: editEmail || undefined });
      setCustomer(res.data, localStorage.getItem('sk_customer_token') || '');
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!pwCurrent || !pwNew) { toast.error('Fill in both password fields'); return; }
    if (pwNew.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwNew !== pwConfirm) { toast.error('Passwords do not match'); return; }
    if (pwNew === pwCurrent) { toast.error('New password must be different from the current one'); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/password', { currentPassword: pwCurrent, newPassword: pwNew });
      toast.success('Password updated!');
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  }

  function logout() {
    logoutCustomer();
    router.push('/');
    toast.success('Logged out');
  }

  // The /orders/my endpoint returns the array directly (not wrapped in `{ orders }`)
  const orders: Order[] = Array.isArray(ordersData) ? ordersData : (ordersData?.orders || []);

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-6 mb-6 shadow-soft" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F8 100%)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6FB1] to-[#FF5B6E] flex items-center justify-center text-white font-display font-bold text-2xl shadow-soft-pink">
              {customer.name?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div>
              <p className="eyebrow mb-0.5">👋 Welcome back</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1F2F4A]">{customer.name}</h1>
              <p className="text-sm text-[#7A8299] font-medium font-mono">{customer.phone || customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['orders', 'addresses', 'profile'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-bold rounded-full transition-all capitalize ${
              activeTab === tab
                ? 'text-white shadow-soft-pink'
                : 'bg-white border-2 border-[#FFE0EC] text-[#1F2F4A] hover:border-[#FFD4E6]'
            }`}
            style={activeTab === tab ? { background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)' } : undefined}
          >
            {tab === 'orders' ? `🛍 Orders (${orders.length})` : tab === 'addresses' ? '📍 Addresses' : '👤 Profile'}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-[#FFE0EC] rounded-[24px]">
              <div className="inline-flex w-16 h-16 rounded-full bg-[#FFE0EC] items-center justify-center mb-3 border-4 border-dashed border-[#FF6FB1]">
                <span className="text-2xl">📦</span>
              </div>
              <p className="font-bold text-[#1F2F4A]">No orders yet</p>
              <Link href="/products" className="text-[#FF6FB1] text-sm hover:underline mt-2 block font-extrabold">Start Shopping →</Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white border-2 border-[#FFE0EC] rounded-[20px] p-5 hover:shadow-soft transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <span className="font-display font-extrabold text-[#1F2F4A]">#{order.orderNo}</span>
                    <span className="text-xs text-[#7A8299] ml-2 font-semibold">{fmtDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip label={`Order status: ${ORDER_STATUS_TIP[order.status] || order.status}`} position="top">
                      <span><Pill label={order.status} color={statusColor(order.status)} /></span>
                    </Tooltip>
                    <Tooltip label={`Payment: ${PAYMENT_STATUS_TIP[order.paymentStatus] || order.paymentStatus}`} position="top">
                      <span><Pill label={order.paymentStatus} color={statusColor(order.paymentStatus)} size="xs" /></span>
                    </Tooltip>
                  </div>
                </div>
                <div className="text-sm text-[#5A5048] font-medium">
                  <p>{order.lines.length} item{order.lines.length > 1 ? 's' : ''} · Total: <span className="font-extrabold text-[#FF5B6E]">{fmtTk(order.total)}</span></p>
                  <p className="text-xs mt-0.5 capitalize text-[#7A8299] font-semibold">Payment: {order.paymentMethod}</p>
                </div>
                <Link href={`/order/${order.orderNo}`} className="inline-block mt-3 text-xs text-[#FF6FB1] font-extrabold hover:underline">
                  View Details →
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'addresses' && <AddressesPanel />}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Edit Profile */}
          <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 shadow-soft">
            <h3 className="font-display font-bold text-[#1F2F4A] mb-4 text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> Edit Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#1F2F4A]">Phone</label>
                <input value={customer.phone || ''} disabled className="w-full border-2 border-[#FFE0EC] rounded-2xl px-4 py-3 text-sm bg-[#FFF5F8] text-[#7A8299] font-mono font-medium" />
                <p className="text-[11px] text-[#7A8299]">Phone is verified and cannot be changed here.</p>
              </div>
              <Input label="Email (optional)" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="you@email.com" className="sm:col-span-2" />
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={saveProfile} loading={saving} size="lg">Save Changes ✨</Button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 shadow-soft">
            <h3 className="font-display font-bold text-[#1F2F4A] mb-1 text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6BC8E6]" /> Change Password
            </h3>
            <p className="text-[12px] text-[#7A8299] mb-4 font-medium">
              Forgot your current password?{' '}
              <Link href="/forgot-password" className="text-[#FF6FB1] font-extrabold hover:underline">Reset via OTP</Link>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="sm:col-span-2"
              />
              <Input
                label="New Password"
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={changePassword} loading={pwSaving} size="lg">Update Password 🔑</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Addresses panel ─────────────────────────────────────────────────── */
const EMPTY_ADDR: Address = { label: 'Home', line1: '', line2: '', area: '', district: '', zip: '', isDefault: false };

function AddressesPanel() {
  const qc = useQueryClient();
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ['my-addresses'],
    queryFn: () => api.get('/customers/me/addresses').then((r) => r.data),
  });
  const [editing, setEditing] = useState<Address | null>(null); // null = closed; {} or address = open
  const [form, setForm] = useState<Address>(EMPTY_ADDR);

  function openNew() { setForm({ ...EMPTY_ADDR, isDefault: addresses.length === 0 }); setEditing({} as Address); }
  function openEdit(a: Address) { setForm({ ...EMPTY_ADDR, ...a }); setEditing(a); }
  function close() { setEditing(null); }

  const saveMutation = useMutation({
    mutationFn: () => editing && (editing as any)._id
      ? api.put(`/customers/me/addresses/${(editing as any)._id}`, form)
      : api.post('/customers/me/addresses', form),
    onSuccess: () => {
      toast.success((editing as any)?._id ? 'Address updated' : 'Address added');
      qc.invalidateQueries({ queryKey: ['my-addresses'] });
      close();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Could not save address'),
  });
  const removeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/me/addresses/${id}`),
    onSuccess: () => { toast.success('Address removed'); qc.invalidateQueries({ queryKey: ['my-addresses'] }); },
  });
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => api.post(`/customers/me/addresses/${id}/default`),
    onSuccess: () => { toast.success('Default address updated'); qc.invalidateQueries({ queryKey: ['my-addresses'] }); },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.line1?.trim()) { toast.error('Address line is required'); return; }
    if (!form.area?.trim()) { toast.error('City / Thana is required'); return; }
    if (!form.district?.trim()) { toast.error('District is required'); return; }
    saveMutation.mutate();
  }

  return (
    <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-display font-bold text-[#1F2F4A] text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4FC081]" /> Saved Addresses
        </h3>
        <Button onClick={openNew} size="sm">+ Add Address</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-[#7A8299] text-sm font-medium">Loading…</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#FFE0EC] rounded-2xl">
          <div className="text-3xl mb-2">📍</div>
          <p className="font-bold text-[#1F2F4A]">No saved addresses yet</p>
          <p className="text-xs text-[#7A8299] mt-1">Save addresses here so checkout fills in automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((a) => (
            <div key={a._id} className={`relative border-2 rounded-2xl p-4 ${a.isDefault ? 'border-[#FF6FB1] bg-[#FFF5F8]' : 'border-[#FFE0EC] bg-white'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-[#FF6FB1] uppercase tracking-[.12em]">{a.label || 'Address'}</span>
                  {a.isDefault && <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6FB1] text-white">Default</span>}
                </div>
              </div>
              <div className="text-[13px] text-[#1F2F4A] leading-relaxed font-medium">
                {[a.line1, a.line2, a.area].filter(Boolean).join(', ')}
                {a.district && <div>{a.district}{a.zip ? ` — ${a.zip}` : ''}</div>}
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {!a.isDefault && (
                  <button
                    onClick={() => a._id && setDefaultMutation.mutate(a._id)}
                    className="text-[11px] font-bold text-[#3F8FBF] hover:underline"
                  >Set default</button>
                )}
                <button onClick={() => openEdit(a)} className="text-[11px] font-bold text-[#5A5048] hover:text-[#FF6FB1]">Edit</button>
                <button
                  onClick={async () => {
                    if (await confirm({ title: 'Remove this address?', message: 'You can re-add it later.', danger: true, confirmLabel: 'Remove' })) {
                      a._id && removeMutation.mutate(a._id);
                    }
                  }}
                  className="text-[11px] font-bold text-[#9B2914] hover:underline ml-auto"
                >Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form — matches the checkout Shipping Address fields */}
      {editing && (
        <form onSubmit={submit} className="mt-6 pt-6 border-t-2 border-dashed border-[#FFE0EC] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Address Line 1 *"
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            placeholder="House, Road, Area"
            className="sm:col-span-2"
            required
          />
          <Input
            label="City / Thana *"
            value={form.area || ''}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            placeholder="Gulshan"
          />
          <Select
            label="District *"
            value={form.district || ''}
            onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
            options={ALL_DISTRICTS.map((d) => ({ value: d, label: d }))}
            placeholder="Select district"
            storefront
          />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>{(editing as any)._id ? 'Update Address' : 'Save Address'}</Button>
          </div>
        </form>
      )}
    </div>
  );
}
