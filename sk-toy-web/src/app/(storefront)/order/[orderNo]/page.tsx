'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Order } from '@/types';
import { fmtTk, imgUrl } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const STEPS = [
  { key: 'new',       label: 'Received' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed',    label: 'Packed' },
  { key: 'shipped',   label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function fmtDate(s?: string) {
  if (!s) return '';
  return new Date(s).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PAYMENT_LABEL: Record<string, string> = {
  cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad', card: 'Card',
};

export default function OrderConfirmPage() {
  const { orderNo } = useParams();

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', orderNo],
    queryFn: async () => {
      try {
        const cached = localStorage.getItem('sk_last_order');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.orderNo === orderNo) {
            localStorage.removeItem('sk_last_order');
            return parsed;
          }
        }
      } catch {}
      return api.get(`/orders/confirm/${orderNo}`).then((r) => r.data);
    },
    retry: false,
  });

  if (isLoading) return (
    <div className="flex justify-center py-40"><Spinner size="lg" /></div>
  );

  if (!order) return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-5xl mb-4">∅</p>
      <h1 className="text-xl font-bold text-[#1F2F4A] mb-2">Order not found</h1>
      <Link href="/track" className="text-[#EC5D4A] text-sm hover:underline">Track your order →</Link>
    </div>
  );

  const stepIdx = STEPS.findIndex(s => s.key === order.status);
  const isFinal = order.status === 'cancelled' || order.status === 'returned';

  return (
    <div style={{ background: '#F5EFE4', minHeight: '100vh', padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Thank-you hero */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D6F0DE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2D8A4E" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-inter, system-ui, sans-serif)', fontSize: 32, fontWeight: 700, color: '#1F2F4A', margin: '0 0 8px' }}>
            Thank you, {order.customerName?.split(' ')[0]}!
          </h1>
          <p style={{ color: '#5A5048', fontSize: 15, margin: '0 0 12px' }}>
            Your order has been placed and is being processed.
            {order.customerEmail && <> A confirmation has been sent to <strong>{order.customerEmail}</strong>.</>}
          </p>
          <div style={{ display: 'inline-block', background: '#FFFBF2', border: '2px solid #F5C443', borderRadius: 10, padding: '8px 24px' }}>
            <span style={{ fontFamily: 'var(--font-mono-var, monospace)', fontSize: 20, fontWeight: 700, color: '#EC5D4A', letterSpacing: '0.04em' }}>
              #{order.orderNo}
            </span>
          </div>
        </div>

        {/* Order status tracker */}
        {!isFinal && (
          <div style={{ background: '#FFFBF2', border: '1px solid #E6D9BD', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-mono-var, monospace)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A8299', margin: '0 0 16px' }}>Order Status</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEPS.map((step, i) => (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i <= stepIdx ? '#EC5D4A' : '#F0E8D8',
                      color: i <= stepIdx ? '#fff' : '#A89E92',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {i < stepIdx
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                        : i + 1}
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono-var, monospace)', color: i <= stepIdx ? '#1F2F4A' : '#A89E92', whiteSpace: 'nowrap' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < stepIdx ? '#EC5D4A' : '#E6D9BD', margin: '0 4px', marginBottom: 22 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-col info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* Order details */}
          <div style={{ background: '#FFFBF2', border: '1px solid #E6D9BD', borderRadius: 16, padding: '20px 20px' }}>
            <p style={{ fontFamily: 'var(--font-mono-var, monospace)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A8299', margin: '0 0 12px' }}>Order Details</p>
            <Row label="Order No" value={`#${order.orderNo}`} />
            <Row label="Date" value={fmtDate(order.createdAt)} />
            <Row label="Payment" value={PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod} />
            <Row label="Status" value={order.status} accent />
          </div>

          {/* Delivery */}
          <div style={{ background: '#FFFBF2', border: '1px solid #E6D9BD', borderRadius: 16, padding: '20px 20px' }}>
            <p style={{ fontFamily: 'var(--font-mono-var, monospace)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A8299', margin: '0 0 12px' }}>Delivery Address</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1F2F4A', margin: '0 0 4px' }}>{order.customerName}</p>
            <p style={{ fontSize: 13, color: '#5A5048', margin: '0 0 2px' }}>{order.address}</p>
            {(order.area || order.district) && (
              <p style={{ fontSize: 13, color: '#5A5048', margin: 0 }}>{[order.area, order.district].filter(Boolean).join(', ')}</p>
            )}
            <p style={{ fontSize: 13, color: '#7A8299', marginTop: 8 }}>{order.phone}</p>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: '#FFFBF2', border: '1px solid #E6D9BD', borderRadius: 16, padding: '20px 20px', marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--font-mono-var, monospace)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A8299', margin: '0 0 16px' }}>
            Items Ordered ({order.lines?.length})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {order.lines?.map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {line.image && (
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', background: '#F5E9D2', flexShrink: 0, position: 'relative' }}>
                    <Image src={imgUrl(line.image)} alt={line.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1F2F4A', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line.name}</p>
                  {line.variant && <p style={{ fontSize: 12, color: '#7A8299', margin: 0 }}>{line.variant}</p>}
                  <p style={{ fontSize: 12, color: '#A89E92', margin: 0 }}>Qty {line.qty} × {fmtTk(line.price)}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1F2F4A', flexShrink: 0 }}>{fmtTk(line.price * line.qty)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid #E6D9BD', marginTop: 16, paddingTop: 16 }}>
            <TotalRow label="Subtotal" value={fmtTk(order.subtotal)} />
            <TotalRow label="Shipping" value={order.shipping === 0 ? 'Free' : fmtTk(order.shipping)} green={order.shipping === 0} />
            {order.discount > 0 && <TotalRow label="Discount" value={`-${fmtTk(order.discount)}`} green />}
            {(order.giftWrapCost ?? 0) > 0 && <TotalRow label="Gift Wrap" value={fmtTk(order.giftWrapCost!)} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #E6D9BD', marginTop: 10, paddingTop: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1F2F4A' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#EC5D4A' }}>{fmtTk(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/products" style={{ flex: 1 }}>
            <button style={{ width: '100%', padding: '14px', border: '1.5px solid #E6D9BD', borderRadius: 12, background: '#FFFBF2', fontSize: 14, fontWeight: 600, color: '#1F2F4A', cursor: 'pointer', fontFamily: 'inherit' }}>
              Continue Shopping
            </button>
          </Link>
          <Link href="/track" style={{ flex: 1 }}>
            <button style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: '#EC5D4A', fontSize: 14, fontWeight: 600, color: '#FFFBF2', cursor: 'pointer', fontFamily: 'inherit' }}>
              Track Order
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F0E8D8' }}>
      <span style={{ fontSize: 12, color: '#7A8299' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: accent ? '#EC5D4A' : '#1F2F4A', textTransform: accent ? 'capitalize' : undefined }}>{value}</span>
    </div>
  );
}

function TotalRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ fontSize: 13, color: '#7A8299' }}>{label}</span>
      <span style={{ fontSize: 13, color: green ? '#2D8A4E' : '#1F2F4A' }}>{value}</span>
    </div>
  );
}
