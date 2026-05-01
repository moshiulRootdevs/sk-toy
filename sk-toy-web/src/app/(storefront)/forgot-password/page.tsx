'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Step = 'phone' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { setCustomer } = useAuthStore();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function requestOtp(e?: React.FormEvent) {
    e?.preventDefault();
    if (!phone.trim()) { toast.error('Enter your phone number'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/otp/request', { phone, purpose: 'reset' });
      toast.success(res.data?.message || 'OTP sent');
      if (res.data?.devCode) toast.success(`Dev OTP: ${res.data.devCode}`, { duration: 8000 });
      setStep('reset');
      setResendIn(30);
      setTimeout(() => otpRef.current?.focus(), 50);
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.noAccount) {
        toast.error(data.message);
        router.push(`/register?phone=${encodeURIComponent(phone)}`);
        return;
      }
      toast.error(data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { toast.error('Enter the 6-digit code'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/password/reset', { phone, code, newPassword });
      setCustomer(res.data.customer, res.data.token);
      toast.success(res.data.message || 'Password reset!');
      router.push('/account');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-12 -left-10 w-[260px] h-[260px] rounded-full bg-[#6BC8E6] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-[260px] h-[260px] rounded-full bg-[#FF6FB1] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[180px] h-[180px] rounded-full bg-[#FFCB47] opacity-15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-full bg-white items-center justify-center mb-4 shadow-soft border-4 border-dashed border-[#6BC8E6]">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1F2F4A]">Reset Password</h1>
          <p className="text-[#7A8299] mt-1.5 text-sm font-medium">
            {step === 'phone' ? "We'll text a code to verify it's you" : `Enter the code sent to ${phone}`}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={requestOtp} className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-8 shadow-soft space-y-4">
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              autoComplete="tel"
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>Send OTP ✨</Button>
            <p className="text-center text-sm text-[#7A8299] font-medium">
              Remembered it?{' '}
              <Link href="/login" className="text-[#FF6FB1] font-extrabold hover:underline">Back to login</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-8 shadow-soft space-y-4">
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
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>Reset Password ✨</Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => { setStep('phone'); setCode(''); setNewPassword(''); setConfirmPassword(''); }} className="text-[#7A8299] font-medium hover:text-[#FF6FB1]">
                ← Change number
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
