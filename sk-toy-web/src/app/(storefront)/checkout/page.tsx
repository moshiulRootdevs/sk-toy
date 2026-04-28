'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useCartStore, useAuthStore } from '@/lib/store';
import { fmtTk, imgUrl } from '@/lib/utils';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

const ALL_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barisal', 'Bhola', 'Bogura',
  'Brahmanbaria', 'Chandpur', 'Chapai Nawabganj', 'Chattogram', 'Chuadanga',
  "Cox's Bazar", 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni',
  'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore',
  'Jhalokathi', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna',
  'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat',
  'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj',
  'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore',
  'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali',
  'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira',
  'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail',
  'Thakurgaon',
];

const DHAKA_DISTRICT = 'Dhaka';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const subtotal = useCartStore((s) => s.items.reduce((a, i) => a + i.price * i.qty, 0));
  const { customer } = useAuthStore();

  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: '',
    line1: '',
    city: '',
    district: '',
    zip: '',
    note: '',
  });
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('outside');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  /* Fetch delivery options + payment methods from settings */
  const { data: shippingOptions } = useQuery<{
    insideDhaka:  { title: string; amount: number; description: string; freeOver: number };
    outsideDhaka: { title: string; amount: number; description: string; freeOver: number };
  }>({
    queryKey: ['shipping-options'],
    queryFn: () => api.get('/shipping/options').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: siteSettings } = useQuery<any>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const insideTitle       = shippingOptions?.insideDhaka?.title        || 'Inside Dhaka';
  const insideBaseAmount  = shippingOptions?.insideDhaka?.amount       ?? 60;
  const insideDescription = shippingOptions?.insideDhaka?.description  || 'Delivered within 1–2 business days';
  const insideFreeOver    = shippingOptions?.insideDhaka?.freeOver     ?? 0;

  const outsideTitle       = shippingOptions?.outsideDhaka?.title       || 'Outside Dhaka';
  const outsideBaseAmount  = shippingOptions?.outsideDhaka?.amount      ?? 120;
  const outsideDescription = shippingOptions?.outsideDhaka?.description || 'Delivered within 3–5 business days';
  const outsideFreeOver    = shippingOptions?.outsideDhaka?.freeOver    ?? 0;

  /* Effective amounts after applying free-delivery threshold */
  const insideAmount  = insideFreeOver  > 0 && subtotal >= insideFreeOver  ? 0 : insideBaseAmount;
  const outsideAmount = outsideFreeOver > 0 && subtotal >= outsideFreeOver ? 0 : outsideBaseAmount;

  const pm = siteSettings?.paymentMethods;
  const availablePaymentMethods = [
    pm?.cod?.enabled   !== false && {
      value: 'cod'   as const,
      label: pm?.cod?.label        || 'Cash on Delivery',
      sub:   pm?.cod?.description  || 'Pay when you receive the parcel',
      badge: 'COD',
    },
    pm?.bkash?.enabled !== false && {
      value: 'bkash' as const,
      label: pm?.bkash?.label       || 'bKash',
      sub:   pm?.bkash?.description || 'Pay securely via bKash',
      badge: 'Instant confirmation',
    },
  ].filter(Boolean) as { value: 'cod' | 'bkash'; label: string; sub: string; badge: string }[];

  /* Auto-select zone when district changes */
  useEffect(() => {
    if (form.district === DHAKA_DISTRICT) {
      setDeliveryZone('inside');
    } else if (form.district) {
      setDeliveryZone('outside');
    }
  }, [form.district]);

  /* Auto-correct payment method if the currently selected one gets disabled */
  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !availablePaymentMethods.find((m) => m.value === paymentMethod)) {
      setPaymentMethod(availablePaymentMethods[0].value);
    }
  }, [availablePaymentMethods.map((m) => m.value).join()]);

  const shippingCost = deliveryZone === 'inside' ? insideAmount : outsideAmount;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, subtotal });
      setCouponDiscount(res.data.discount);
      setCouponApplied(true);
      toast.success(`Coupon applied! Save ${fmtTk(res.data.discount)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  }

  const total = subtotal + shippingCost - couponDiscount;

  async function placeOrder() {
    if (!form.name || !form.phone || !form.line1 || !form.district || !form.city) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (items.length === 0) { toast.error('Cart is empty'); return; }

    setLoading(true);
    try {
      const payload = {
        lines: items.map((i) => ({
          product: i.productId,
          qty: i.qty,
          variant: i.variant,
        })),
        customerName: form.name,
        customerEmail: form.email || undefined,
        phone: form.phone,
        address: form.line1,
        area: form.city,
        district: form.district,
        deliveryZone,
        shippingCost,
        paymentMethod,
        coupon: couponApplied ? couponCode : undefined,
        note: form.note || undefined,
      };

      const res = await api.post('/orders', payload);
      const order = res.data;
      localStorage.setItem('sk_last_order', JSON.stringify(order));

      if (paymentMethod === 'bkash') {
        const bkashRes = await api.post('/payments/bkash/create', {
          orderId: order._id,
          amount: order.total,
        });
        if (bkashRes.data.bkashURL) {
          clearCart();
          window.location.href = bkashRes.data.bkashURL;
          return;
        }
      }

      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order/${order.orderNo}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => router.push('/products')}>Shop Now</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: form */}
        <div className="flex-1 space-y-6">

          {/* Contact */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name *" value={form.name} onChange={set('name')} placeholder="Moshiul Islam" />
              <Input label="Phone *" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" type="tel" />
              <Input label="Email" value={form.email} onChange={set('email')} placeholder="you@email.com" type="email" className="sm:col-span-2" />
            </div>
          </section>

          {/* Shipping address */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Address Line 1 *" value={form.line1} onChange={set('line1')} placeholder="House, Road, Area" className="sm:col-span-2" />
              <Input label="City / Thana *" value={form.city} onChange={set('city')} placeholder="Gulshan" />
              <Select
                label="District *"
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                options={ALL_DISTRICTS.map((d) => ({ value: d, label: d }))}
                placeholder="Select district"
              />
              <Input label="ZIP Code" value={form.zip} onChange={set('zip')} placeholder="1212" />
            </div>
          </section>

          {/* Delivery zone */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-1">Delivery Option</h2>
            {form.district === DHAKA_DISTRICT && (
              <p className="text-xs text-[#4FA36A] mb-3">
                ✓ Inside Dhaka automatically selected based on your district
              </p>
            )}
            {form.district && form.district !== DHAKA_DISTRICT && (
              <p className="text-xs text-gray-400 mb-3">
                Outside Dhaka selected based on your district
              </p>
            )}
            {!form.district && (
              <p className="text-xs text-gray-400 mb-3">
                Select your district above to auto-detect, or choose manually
              </p>
            )}
            <div className="space-y-3">
              {([
                {
                  zone: 'inside' as const,
                  title: insideTitle,
                  description: insideDescription,
                  baseAmount: insideBaseAmount,
                  amount: insideAmount,
                  freeOver: insideFreeOver,
                },
                {
                  zone: 'outside' as const,
                  title: outsideTitle,
                  description: outsideDescription,
                  baseAmount: outsideBaseAmount,
                  amount: outsideAmount,
                  freeOver: outsideFreeOver,
                },
              ]).map(({ zone, title, description, baseAmount, amount, freeOver }) => {
                const isFree = amount === 0 && baseAmount > 0;
                const amountUntilFree = freeOver > 0 ? freeOver - subtotal : 0;
                return (
                  <label
                    key={zone}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      deliveryZone === zone
                        ? 'border-[#EC5D4A] bg-[#EC5D4A]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryZone"
                      value={zone}
                      checked={deliveryZone === zone}
                      onChange={() => setDeliveryZone(zone)}
                      className="accent-[#EC5D4A] mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{title}</div>
                      {description && (
                        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                      )}
                      {/* free-delivery threshold hint */}
                      {freeOver > 0 && !isFree && (
                        <div className="text-xs text-[#4FA36A] font-medium mt-1">
                          Add {fmtTk(amountUntilFree)} more for free delivery
                        </div>
                      )}
                      {isFree && (
                        <div className="text-xs text-[#4FA36A] font-medium mt-1">
                          ✓ Free delivery applied on this order
                        </div>
                      )}
                      {freeOver > 0 && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Free for orders over {fmtTk(freeOver)}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {isFree ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-sm font-bold text-[#4FA36A]">FREE</span>
                          <span className="text-xs text-gray-400 line-through">{fmtTk(baseAmount)}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-[#EC5D4A]">{fmtTk(amount)}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Coupon */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Coupon Code</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={couponApplied}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC5D4A] disabled:bg-gray-50"
              />
              {couponApplied ? (
                <Button variant="outline" size="sm" onClick={() => { setCouponApplied(false); setCouponDiscount(0); setCouponCode(''); }}>
                  Remove
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={applyCoupon} loading={couponLoading}>
                  Apply
                </Button>
              )}
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            {availablePaymentMethods.length === 0 ? (
              <p className="text-sm text-gray-400">No payment methods are currently available. Please contact support.</p>
            ) : (
              <div className="space-y-3">
                {availablePaymentMethods.map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === m.value ? 'border-[#EC5D4A] bg-[#EC5D4A]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)}
                      className="mt-0.5 accent-[#EC5D4A]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{m.label}</span>
                        {m.value === 'bkash' && (
                          <span className="text-xs bg-pink-600 text-white px-1.5 py-0.5 rounded font-bold">bKash</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{m.sub}</p>
                    </div>
                    <span className="text-xs text-gray-400">{m.badge}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Note */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Order Note (Optional)</h2>
            <textarea
              value={form.note}
              onChange={set('note')}
              rows={3}
              placeholder="Any special instructions..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC5D4A] resize-none"
            />
          </section>
        </div>

        {/* Right: order summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId + (item.variant || '')} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                    <Image src={imgUrl(item.image)} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 shrink-0">{fmtTk(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{fmtTk(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery ({deliveryZone === 'inside' ? insideTitle : outsideTitle})
                </span>
                {shippingCost === 0 && (deliveryZone === 'inside' ? insideBaseAmount : outsideBaseAmount) > 0 ? (
                  <span className="text-[#4FA36A] font-semibold">FREE</span>
                ) : (
                  <span>{fmtTk(shippingCost)}</span>
                )}
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({couponCode})</span>
                  <span>-{fmtTk(couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{fmtTk(total)}</span>
              </div>
            </div>

            <Button fullWidth size="lg" className="mt-5" onClick={placeOrder} loading={loading}>
              {paymentMethod === 'bkash' ? 'Pay with bKash' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
