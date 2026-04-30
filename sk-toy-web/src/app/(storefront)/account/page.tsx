'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AccountPage() {
  const router = useRouter();
  const { customer, logoutCustomer, setCustomer } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [editName, setEditName] = useState(customer?.name || '');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

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
      const res = await api.put('/customers/me', { name: editName, phone: editPhone || undefined });
      setCustomer(res.data, localStorage.getItem('sk_customer_token') || '');
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    logoutCustomer();
    router.push('/');
    toast.success('Logged out');
  }

  const orders: Order[] = ordersData?.orders || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
              <p className="text-sm text-[#7A8299] font-medium">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold bg-[#FFEDB6] text-[#E5A82A] px-3 py-1.5 rounded-full uppercase tracking-wider">{customer.tier}</span>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['orders', 'profile'] as const).map((tab) => (
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
            {tab === 'orders' ? `🛍 Orders (${orders.length})` : '👤 Profile'}
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
                    <Pill label={order.status} color={statusColor(order.status)} />
                    <Pill label={order.paymentStatus} color={statusColor(order.paymentStatus)} size="xs" />
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

      {activeTab === 'profile' && (
        <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 max-w-md shadow-soft">
          <h3 className="font-display font-bold text-[#1F2F4A] mb-4 text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> Edit Profile
          </h3>
          <div className="space-y-4">
            <Input label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="01XXXXXXXXX" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#1F2F4A]">Email</label>
              <input value={customer.email} disabled className="w-full border-2 border-[#FFE0EC] rounded-2xl px-4 py-3 text-sm bg-[#FFF5F8] text-[#7A8299] font-medium" />
            </div>
            <Button onClick={saveProfile} loading={saving} fullWidth>Save Changes ✨</Button>
          </div>
        </div>
      )}
    </div>
  );
}
