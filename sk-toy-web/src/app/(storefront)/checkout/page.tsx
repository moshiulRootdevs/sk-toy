'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useCartStore, useAuthStore } from '@/lib/store';
import { fmtTk, imgUrl } from '@/lib/utils';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tooltip from '@/components/ui/Tooltip';

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
  const { items, clearCart, removeItem } = useCartStore();
  const subtotal = useCartStore((s) => s.items.reduce((a, i) => a + i.price * i.qty, 0));
  const { customer } = useAuthStore();

  // Reset body overflow on mount — fixes glitch where cart drawer's overflow:hidden
  // persists when navigating to checkout on mobile
  useEffect(() => {
    document.body.style.overflow = '';
  }, []);

  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    altPhone: '',
    line1: '',
    city: '',
    district: '',
    note: '',
  });

  // Auth store hydrates after mount, so the initial useState above may miss the
  // customer. Sync name + phone once when the customer becomes available, but
  // only into still-empty fields so we don't overwrite something the user typed.
  useEffect(() => {
    if (!customer) return;
    setForm((f) => ({
      ...f,
      name: f.name || customer.name || '',
      phone: f.phone || customer.phone || '',
    }));
  }, [customer]);
  const [deliveryZone, setDeliveryZone] = useState<'inside' | 'outside'>('outside');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new');

  // Saved addresses (only fetched for logged-in customers)
  const { data: savedAddresses = [] } = useQuery<any[]>({
    queryKey: ['my-addresses'],
    queryFn: () => api.get('/customers/me/addresses').then((r) => r.data),
    enabled: !!customer,
  });

  // When the addresses arrive, default-pick the address marked default
  useEffect(() => {
    if (!savedAddresses.length || selectedAddressId !== 'new') return;
    const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
    if (def) {
      setSelectedAddressId(def._id);
      setForm((f) => ({
        ...f,
        line1: def.line1 || '',
        city: def.area || '',
        district: def.district || '',
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses]);

  function pickAddress(id: string) {
    setSelectedAddressId(id);
    if (id === 'new') {
      setForm((f) => ({ ...f, line1: '', city: '', district: '' }));
      return;
    }
    const a = savedAddresses.find((x) => x._id === id);
    if (a) setForm((f) => ({ ...f, line1: a.line1 || '', city: a.area || '', district: a.district || '' }));
  }

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
        phone: form.phone,
        altPhone: form.altPhone || undefined,
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
        <div className="inline-flex w-20 h-20 rounded-full bg-[#FFE0EC] items-center justify-center mb-4 border-4 border-dashed border-[#FF6FB1]">
          <span className="text-3xl">🛒</span>
        </div>
        <p className="text-[#7A8299] font-semibold mb-4">Your cart is empty.</p>
        <Button className="mt-2" onClick={() => router.push('/products')}>Shop Now</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <p className="eyebrow mb-2">🎁 One last step</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F2F4A]">Checkout</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Left: form */}
        <div className="flex-1 space-y-6">

          {/* Contact */}
          <section className="bg-white border-2 border-[#FFE0EC] rounded-[18px] sm:rounded-[24px] p-4 sm:p-6 shadow-soft">
            <h2 className="font-display font-bold text-[#1F2F4A] mb-4 flex items-center gap-2 text-lg"><span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name *" value={form.name} onChange={set('name')} placeholder="Moshiul Islam" />
              <Input label="Phone *" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" type="tel" />
              <Input label="Alternate Phone" value={form.altPhone} onChange={set('altPhone')} placeholder="01XXXXXXXXX (optional)" type="tel" className="sm:col-span-2" />
            </div>
          </section>

          {/* Shipping address */}
          <section className="bg-white border-2 border-[#FFE0EC] rounded-[18px] sm:rounded-[24px] p-4 sm:p-6 shadow-soft">
            <h2 className="font-display font-bold text-[#1F2F4A] mb-4 flex items-center gap-2 text-lg"><span className="w-2 h-2 rounded-full bg-[#4FC081]" /> Shipping Address</h2>

            {/* Saved address picker — shown only when the customer has saved addresses */}
            {customer && savedAddresses.length > 0 && (
              <div className="mb-5">
                <label className="text-[12px] font-bold text-[#7A8299] uppercase tracking-wider mb-2 block">Choose a saved address</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {savedAddresses.map((a) => {
                    const active = selectedAddressId === a._id;
                    return (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => pickAddress(a._id)}
                        className={`text-left p-3 rounded-2xl border-2 transition-all ${
                          active ? 'border-[#FF6FB1] bg-[#FFF5F8] shadow-[0_4px_14px_-6px_rgba(255,111,177,.5)]' : 'border-[#FFE0EC] bg-white hover:border-[#FFD4E6]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold text-[#FF6FB1] uppercase tracking-[.12em]">{a.label || 'Address'}</span>
                            {a.isDefault && <span className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#FF6FB1] text-white">Default</span>}
                          </div>
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-[#FF6FB1]' : 'border-[#E5D9DC]'}`}>
                            {active && <span className="w-2 h-2 rounded-full bg-[#FF6FB1]" />}
                          </span>
                        </div>
                        <div className="text-[12.5px] text-[#1F2F4A] font-medium leading-snug">
                          {[a.line1, a.area].filter(Boolean).join(', ')}
                          {a.district && <span className="text-[#7A8299]"> · {a.district}{a.zip ? ` · ${a.zip}` : ''}</span>}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => pickAddress('new')}
                    className={`text-left p-3 rounded-2xl border-2 border-dashed transition-all ${
                      selectedAddressId === 'new' ? 'border-[#FF6FB1] bg-[#FFF5F8]' : 'border-[#FFD4E6] bg-white hover:border-[#FF6FB1]'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#FF6FB1]">
                      <span className="w-5 h-5 rounded-full bg-[#FFE0EC] inline-flex items-center justify-center">+</span>
                      Use a new address
                    </div>
                    <div className="text-[11px] text-[#7A8299] mt-0.5">Enter a different shipping address below</div>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Address Line 1 *" value={form.line1} onChange={set('line1')} placeholder="House, Road, Area" className="sm:col-span-2" />
              <Input label="City / Thana *" value={form.city} onChange={set('city')} placeholder="Gulshan" />
              <Select
                label="District *"
                value={form.district}
                onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                options={ALL_DISTRICTS.map((d) => ({ value: d, label: d }))}
                placeholder="Select district"
                storefront
              />
            </div>
            {customer && selectedAddressId === 'new' && (
              <p className="text-[11px] text-[#7A8299] mt-3">
                Tip: save this address to your{' '}
                <Link href="/account?tab=addresses" className="text-[#FF6FB1] font-bold hover:underline">address book</Link>{' '}
                for faster checkout next time.
              </p>
            )}
          </section>

          {/* Delivery zone */}
          <section className="bg-white border-2 border-[#FFE0EC] rounded-[18px] sm:rounded-[24px] p-4 sm:p-6 shadow-soft">
            <h2 className="font-display font-bold text-[#1F2F4A] mb-1 flex items-center gap-2 text-lg"><span className="w-2 h-2 rounded-full bg-[#FF9A4D]" /> Delivery Option</h2>
            {form.district === DHAKA_DISTRICT && (
              <p className="text-xs text-[#4FC081] mb-3 font-bold">
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
                        ? 'border-[#FF6FB1] bg-[#FFF5F8]'
                        : 'border-[#FFE0EC] hover:border-[#FFD4E6]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryZone"
                      value={zone}
                      checked={deliveryZone === zone}
                      onChange={() => setDeliveryZone(zone)}
                      className="accent-[#FF6FB1] mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{title}</div>
                      {description && (
                        <div className="text-xs text-gray-500 mt-0.5">{description}</div>
                      )}
                      {/* free-delivery threshold hint */}
                      {freeOver > 0 && !isFree && (
                        <div className="text-xs text-[#4FC081] font-medium mt-1">
                          Add {fmtTk(amountUntilFree)} more for free delivery
                        </div>
                      )}
                      {isFree && (
                        <div className="text-xs text-[#4FC081] font-medium mt-1">
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
                          <span className="text-sm font-extrabold text-[#4FC081]">FREE</span>
                          <span className="text-xs text-gray-400 line-through">{fmtTk(baseAmount)}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-extrabold text-[#FF5B6E]">{fmtTk(amount)}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Coupon */}
          <section className="bg-white border-2 border-[#FFE0EC] rounded-[18px] sm:rounded-[24px] p-4 sm:p-6 shadow-soft">
            <h2 className="font-display font-bold text-[#1F2F4A] mb-4 flex items-center gap-2 text-lg"><span className="w-2 h-2 rounded-full bg-[#FFCB47]" /> Coupon Code</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={couponApplied}
                className="flex-1 border-2 border-[#FFE0EC] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6FB1] disabled:bg-[#FFF5F8] font-medium"
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
          <section className="bg-white border-2 border-[#FFE0EC] rounded-[18px] sm:rounded-[24px] p-4 sm:p-6 shadow-soft">
            <h2 className="font-display font-bold text-[#1F2F4A] mb-4 flex items-center gap-2 text-lg"><span className="w-2 h-2 rounded-full bg-[#6BC8E6]" /> Payment Method</h2>
            {availablePaymentMethods.length === 0 ? (
              <p className="text-sm text-gray-400">No payment methods are currently available. Please contact support.</p>
            ) : (
              <div className="space-y-3">
                {availablePaymentMethods.map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === m.value ? 'border-[#FF6FB1] bg-[#FFF5F8]' : 'border-[#FFE0EC] hover:border-[#FFD4E6]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)}
                      className="mt-0.5 accent-[#FF6FB1]"
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
          <section className="bg-white border-2 border-[#FFE0EC] rounded-[18px] sm:rounded-[24px] p-4 sm:p-6 shadow-soft">
            <h2 className="font-display font-bold text-[#1F2F4A] mb-4 flex items-center gap-2 text-lg"><span className="w-2 h-2 rounded-full bg-[#B093E8]" /> Order Note (Optional)</h2>
            <textarea
              value={form.note}
              onChange={set('note')}
              rows={3}
              placeholder="Any special instructions..."
              className="w-full border-2 border-[#FFE0EC] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF6FB1] resize-none font-medium"
            />
          </section>
        </div>

        {/* Right: order summary */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border-2 border-[#FFE0EC] rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 lg:sticky lg:top-32 shadow-soft">
            <h2 className="font-display font-bold text-[#1F2F4A] mb-4 text-lg flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#FF6FB1]" /> Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId + (item.variant || '')} className="group flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative">
                    <Image src={imgUrl(item.image)} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 shrink-0">{fmtTk(item.price * item.qty)}</span>
                  <Tooltip label="Remove from cart" position="left">
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.productId, item.variant);
                        toast.success(`Removed "${item.name}"`);
                      }}
                      aria-label={`Remove ${item.name} from cart`}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[#A89E92] hover:bg-[#FBDED8] hover:text-[#9B2914] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </Tooltip>
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
                  <span className="text-[#4FC081] font-semibold">FREE</span>
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
