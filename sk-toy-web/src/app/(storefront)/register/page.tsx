'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { setCustomer } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      setCustomer(res.data.customer, res.data.token);
      toast.success('Account created successfully!');
      router.push('/account');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join SK Toy for a better experience</p>
        </div>
        <form onSubmit={register} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-4">
          <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your name" required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
          <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
          <Button type="submit" fullWidth size="lg" loading={loading}>Create Account</Button>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#EC5D4A] font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
