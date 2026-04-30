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
          <p className="text-[#7A8299] mt-1.5 text-sm font-medium">Create your SK Toy account</p>
        </div>
        <form onSubmit={register} className="bg-white border-2 border-[#FFE0EC] rounded-[28px] p-8 shadow-soft space-y-4">
          <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your name" required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
          <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="01XXXXXXXXX" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
          <Button type="submit" fullWidth size="lg" loading={loading} variant="success">Create Account 🎉</Button>
          <p className="text-center text-sm text-[#7A8299] font-medium">
            Already a member?{' '}
            <Link href="/login" className="text-[#FF6FB1] font-extrabold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
