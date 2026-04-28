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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">{customer.tier}</span>
          <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['orders', 'profile'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize ${
              activeTab === tab ? 'border-[#EC5D4A] text-[#EC5D4A]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'orders' ? `Orders (${orders.length})` : 'Profile'}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-semibold">No orders yet</p>
              <Link href="/products" className="text-[#EC5D4A] text-sm hover:underline mt-2 block">Start Shopping</Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <span className="font-bold text-gray-900">#{order.orderNo}</span>
                    <span className="text-xs text-gray-400 ml-2">{fmtDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill label={order.status} color={statusColor(order.status)} />
                    <Pill label={order.paymentStatus} color={statusColor(order.paymentStatus)} size="xs" />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{order.lines.length} item{order.lines.length > 1 ? 's' : ''} · Total: <span className="font-bold text-gray-900">{fmtTk(order.total)}</span></p>
                  <p className="text-xs mt-0.5 capitalize">Payment: {order.paymentMethod}</p>
                </div>
                <Link href={`/order/${order.orderNo}`} className="inline-block mt-3 text-xs text-[#EC5D4A] font-semibold hover:underline">
                  View Details →
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-md">
          <h3 className="font-bold text-gray-900 mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <Input label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input label="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder={customer.email} />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input value={customer.email} disabled className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500" />
            </div>
            <Button onClick={saveProfile} loading={saving}>Save Changes</Button>
          </div>
        </div>
      )}
    </div>
  );
}
