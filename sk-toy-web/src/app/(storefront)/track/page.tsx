'use client';

import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { Order } from '@/types';
import { fmtTk, fmtDateTime, imgUrl } from '@/lib/utils';
import Pill, { statusColor } from '@/components/ui/Pill';
import Button from '@/components/ui/Button';

const STATUS_STEPS = ['new', 'confirmed', 'packed', 'shipped', 'delivered'];

export default function TrackPage() {
  const [orderNo, setOrderNo] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function track() {
    if (!orderNo.trim() || !phone.trim()) {
      setError('Please enter both order number and phone');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders/track', { params: { orderNo, phone } });
      setOrder(res.data);
    } catch {
      setError('Order not found. Please check your order number and phone number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex w-16 h-16 rounded-full bg-white items-center justify-center mb-4 shadow-soft border-4 border-dashed border-[#6BC8E6]">
          <span className="text-3xl">📦</span>
        </div>
        <p className="eyebrow mb-2" style={{ color: '#6BC8E6' }}>📍 Live status</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1F2F4A]">Track Your Order</h1>
        <p className="text-[#7A8299] mt-2 text-sm font-medium">Enter your order number and phone to see the status</p>
      </div>

      <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 shadow-soft mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-bold text-[#1F2F4A] block mb-1.5">Order Number</label>
            <input
              type="text"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value.toUpperCase())}
              placeholder="SK00001"
              className="w-full border-2 border-[#FFE0EC] bg-[#FFF8FB] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6FB1] font-medium"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[#1F2F4A] block mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full border-2 border-[#FFE0EC] bg-[#FFF8FB] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6FB1] font-medium"
            />
          </div>
        </div>
        {error && <p className="text-sm text-[#FF5B6E] mb-4 font-bold">⚠ {error}</p>}
        <Button fullWidth onClick={track} loading={loading}>Track Order 📍</Button>
      </div>

      {order && (
        <div className="space-y-5">
          {/* Status */}
          {order.status !== 'cancelled' && order.status !== 'returned' ? (
            <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 shadow-soft">
              <h3 className="font-display font-bold text-[#1F2F4A] mb-6 flex items-center gap-2 text-lg">
                <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> Order Progress
              </h3>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-2 w-1/5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold z-10 border-3 border-white ${
                        i <= currentStep
                          ? 'text-white shadow-soft-pink'
                          : 'bg-[#FFE0EC] text-[#B591A8]'
                      }`}
                           style={i <= currentStep ? { background: 'linear-gradient(135deg,#FF5B6E,#FF6FB1)' } : undefined}>
                        {i < currentStep ? (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : i + 1}
                      </div>
                      <span className={`text-[11px] text-center font-bold ${i <= currentStep ? 'text-[#1F2F4A]' : 'text-[#B591A8]'}`}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-5 left-5 right-5 h-1 bg-[#FFE0EC] -z-0 rounded-full">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`, background: 'linear-gradient(90deg,#FF5B6E,#FF6FB1)' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFE0EC] border-2 border-[#FF6FB1] rounded-[24px] p-6 text-center">
              <Pill label={order.status} color={statusColor(order.status)} />
              <p className="text-sm text-[#FF5B6E] mt-2 font-bold">This order has been {order.status}.</p>
            </div>
          )}

          {/* Details */}
          <div className="bg-white border-2 border-[#FFE0EC] rounded-[24px] p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-extrabold text-[#1F2F4A] text-lg">#{order.orderNo}</h3>
              <span className="text-xs text-[#7A8299] font-semibold">{fmtDateTime(order.createdAt)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-[#7A8299] text-xs font-bold uppercase tracking-wider">Payment</p>
                <p className="font-bold capitalize text-[#1F2F4A]">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[#7A8299] text-xs font-bold uppercase tracking-wider">Payment Status</p>
                <Pill label={order.paymentStatus} color={statusColor(order.paymentStatus)} size="xs" />
              </div>
              {order.trackingNo && (
                <div className="col-span-2">
                  <p className="text-[#7A8299] text-xs font-bold uppercase tracking-wider">Tracking Number</p>
                  <p className="font-bold text-[#1F2F4A]">{order.trackingNo}</p>
                </div>
              )}
            </div>
            <div className="border-t-2 border-dashed border-[#FFD4E6] pt-4 space-y-2.5">
              {order.lines.map((line, i) => (
                <div key={i} className="flex items-center gap-3">
                  {line.image && (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#FFE0EC] relative shrink-0">
                      <Image src={imgUrl(line.image)} alt={line.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1F2F4A] line-clamp-1">{line.name}</p>
                    <p className="text-xs text-[#7A8299] font-semibold">Qty {line.qty}</p>
                  </div>
                  <span className="text-sm font-extrabold text-[#FF5B6E]">{fmtTk(line.price * line.qty)}</span>
                </div>
              ))}
              <div className="border-t-2 border-dashed border-[#FFD4E6] pt-3 flex justify-between font-extrabold text-base">
                <span className="text-[#1F2F4A]">Total</span>
                <span className="text-[#FF5B6E]">{fmtTk(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
