'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Step = 'details' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const { setCustomer } = useAuthStore();
  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function requestOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) { toast.error('Enter your name'); return; }
    if (!phone.trim()) { toast.error('Enter your phone number'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/request', { phone, purpose: 'signup' });
      toast.success(res.data?.message || 'OTP sent');
      // Dev convenience while no SMS gateway is wired
      if (res.data?.devCode) toast.success(`Dev OTP: ${res.data.devCode}`, { duration: 8000 });
      setStep('otp');
      setResendIn(30);
      setTimeout(() => otpRef.current?.focus(), 50);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { phone, code, name, password });
      setCustomer(res.data.customer, res.data.token);
      toast.success('Welcome to SK Toy! 🎉');
      router.push('/account');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.accountExists) {
        toast.error(data.message);
        router.push('/login');
        return;
      }
      toast.error(data?.message || 'Could not verify code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-12 -left-10 w-[260px] h-[260px] rounded-full bg-[#FF6FB1] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-[260px] h-[260px] rounded-full bg-[#FFCB47] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[180px] h-[180px] rounded-full bg-[#4FC081] opacity-15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-full bg-white items-center justify-center mb-4 shadow-soft border-4 border-dashed border-[#4FC081]">
            <span className="text-3xl">🎈</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1F2F4A]">Join the Fun!</h1>
          <p className="text-[#7A8299] mt-1.5 text-sm font-medium">
            {step === 'details' ? 'Create your SK Toy account' : `We've sent a code to ${phone}`}
          </p>
        </div>

        {step === 'details' ? (
          <form onSubmit={requestOtp} className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-8 shadow-soft space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required />
            <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" autoComplete="tel" required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" required />
            <Button type="submit" fullWidth size="lg" loading={loading} variant="success">Send OTP 🎉</Button>
            <p className="text-center text-sm text-[#7A8299] font-medium">
              Already a member?{' '}
              <Link href="/login" className="text-[#FF6FB1] font-extrabold hover:underline">Sign In</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-8 shadow-soft space-y-4">
            <Input
              ref={otpRef}
              label="6-digit code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              autoComplete="one-time-code"
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading} variant="success">Verify & Create Account 🎉</Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => { setStep('details'); setCode(''); }} className="text-[#7A8299] font-medium hover:text-[#FF6FB1]">
                ← Edit details
              </button>
              <button
                type="button"
                disabled={resendIn > 0 || loading}
                onClick={() => requestOtp()}
                className="text-[#FF6FB1] font-extrabold hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
