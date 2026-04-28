'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, setAdmin } = useAuthStore();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  /* Restore session from token on mount (runs once) */
  useEffect(() => {
    if (adminUser) { setReady(true); return; }

    const token = localStorage.getItem('sk_admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    api.get('/auth/admin/me')
      .then((res) => setAdmin(res.data.user, token))
      .catch(() => {
        localStorage.removeItem('sk_admin_token');
        router.replace('/admin/login');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Mark ready once adminUser is populated (either from above or already set) */
  useEffect(() => {
    if (adminUser) setReady(true);
  }, [adminUser]);

  if (!ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#FAF6EF',
      }}>
        <svg
          style={{ width: 28, height: 28, color: '#EC5D4A' }}
          className="animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" opacity=".75" />
        </svg>
      </div>
    );
  }

  return <>{children}</>;
}
