'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { setCustomer } = useAuthStore();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone.trim() || !form.password) {
      toast.error('Enter your phone and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      setCustomer(res.data.customer, res.data.token);
      toast.success(`Welcome back, ${res.data.customer.name}!`);
      router.push('/account');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid phone or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-12 -left-10 w-[260px] h-[260px] rounded-full bg-[#FFCB47] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-0 w-[260px] h-[260px] rounded-full bg-[#6BC8E6] opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[180px] h-[180px] rounded-full bg-[#FF6FB1] opacity-15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-full bg-white items-center justify-center mb-4 shadow-soft border-4 border-dashed border-[#FF6FB1]">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#1F2F4A]">Welcome Back!</h1>
          <p className="text-[#7A8299] mt-1.5 text-sm font-medium">Sign in to your toy adventure</p>
        </div>
        <form onSubmit={login} className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-8 shadow-soft space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="01XXXXXXXXX"
            autoComplete="tel"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end -mt-2">
            <Link href="/forgot-password" className="text-xs text-[#FF6FB1] font-bold hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" fullWidth size="lg" loading={loading}>Sign In ✨</Button>
          <p className="text-center text-sm text-[#7A8299] font-medium">
            New to SK Toy?{' '}
            <Link href="/register" className="text-[#FF6FB1] font-extrabold hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
