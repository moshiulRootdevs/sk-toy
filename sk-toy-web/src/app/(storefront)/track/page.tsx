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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Track Your Order</h1>
        <p className="text-gray-500 mt-2 text-sm">Enter your order number and phone to see the status</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Order Number</label>
            <input
              type="text"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value.toUpperCase())}
              placeholder="SK00001"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC5D4A]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC5D4A]"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <Button fullWidth onClick={track} loading={loading}>Track Order</Button>
      </div>

      {order && (
        <div className="space-y-5">
          {/* Status */}
          {order.status !== 'cancelled' && order.status !== 'returned' ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-5">Order Progress</h3>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-1 w-1/5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        i <= currentStep ? 'bg-[#EC5D4A] text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {i < currentStep ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : i + 1}
                      </div>
                      <span className={`text-xs text-center ${i <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 -z-0">
                  <div
                    className="h-full bg-[#EC5D4A] transition-all"
                    style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <Pill label={order.status} color={statusColor(order.status)} />
              <p className="text-sm text-red-600 mt-2">This order has been {order.status}.</p>
            </div>
          )}

          {/* Details */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">#{order.orderNo}</h3>
              <span className="text-xs text-gray-400">{fmtDateTime(order.createdAt)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <p className="text-gray-500 text-xs">Payment</p>
                <p className="font-medium capitalize">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Payment Status</p>
                <Pill label={order.paymentStatus} color={statusColor(order.paymentStatus)} size="xs" />
              </div>
              {order.trackingNo && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Tracking Number</p>
                  <p className="font-medium">{order.trackingNo}</p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {order.lines.map((line, i) => (
                <div key={i} className="flex items-center gap-3">
                  {line.image && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
                      <Image src={imgUrl(line.image)} alt={line.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{line.name}</p>
                    <p className="text-xs text-gray-400">Qty {line.qty}</p>
                  </div>
                  <span className="text-xs font-bold">{fmtTk(line.price * line.qty)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span>{fmtTk(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
