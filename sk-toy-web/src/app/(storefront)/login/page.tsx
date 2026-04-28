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
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/customer/login', form);
      setCustomer(res.data.customer, res.data.token);
      toast.success(`Welcome back, ${res.data.customer.name}!`);
      router.push('/account');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={login} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          <Button type="submit" fullWidth size="lg" loading={loading}>Sign In</Button>
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#EC5D4A] font-semibold hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
