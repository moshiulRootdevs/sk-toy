'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminIcon from '@/components/admin/AdminIcon';
import ConfirmHost from '@/components/ui/ConfirmHost';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

const PAGE_META: Record<string, { label: string; icon: string }> = {
  dashboard:  { label: 'Dashboard',   icon: 'dashboard' },
  reports:    { label: 'Reports',     icon: 'report' },
  orders:     { label: 'Orders',      icon: 'orders' },
  products:   { label: 'Products',    icon: 'products' },
  inventory:  { label: 'Inventory',   icon: 'inventory' },
  customers:  { label: 'Customers',   icon: 'customer' },
  reviews:    { label: 'Reviews & Q&A', icon: 'review' },
  coupons:    { label: 'Coupons',     icon: 'coupon' },
  categories: { label: 'Categories',  icon: 'category' },
  cms:        { label: 'Pages',       icon: 'cms' },
  hero:       { label: 'Hero Section', icon: 'flag' },
  homepage:   { label: 'Homepage',    icon: 'home' },
  catalogue:  { label: 'Catalogue',   icon: 'category' },
  banners:    { label: 'Banners',     icon: 'flag' },
  navigation: { label: 'Navigation',  icon: 'nav' },
  blog:       { label: 'Journal',     icon: 'cms' },
  media:      { label: 'Media',       icon: 'media' },
  shipping:   { label: 'Shipping',    icon: 'shipping' },
  audit:      { label: 'Audit Log',   icon: 'audit' },
  settings:   { label: 'Settings',    icon: 'settings' },
  profile:    { label: 'My Profile',  icon: 'customer' },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('sk_sidebar_collapsed') === '1';
    return false;
  });
  const toggleCollapsed = () => setCollapsed((c) => { const next = !c; localStorage.setItem('sk_sidebar_collapsed', next ? '1' : '0'); return next; });
  const { adminUser } = useAuthStore();

  if (pathname === '/admin/login') return <>{children}</>;

  const segment = pathname.split('/')[2] || 'dashboard';
  const meta = PAGE_META[segment] || { label: segment.charAt(0).toUpperCase() + segment.slice(1), icon: 'dashboard' };
  const sidebarW = collapsed ? 64 : 244;

  return (
    <AdminGuard>
      <div
        className="adm-shell"
        style={{
          background: '#FAF6EF',
          color: '#2A2420',
          fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
          fontSize: 14,
          ['--sk-sidebar-w' as any]: `${sidebarW}px`,
        }}
      >
        <AdminSidebar
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={toggleCollapsed}
        />

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, height: '100dvh' }}>

          {/* Topbar */}
          <header
            className="px-4 sm:px-6 gap-3 sm:gap-4"
            style={{
              background: '#FFFBF2',
              borderBottom: '1px solid #E8DFD2',
              minHeight: 56,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex items-center justify-center"
              onClick={() => setSidebarOpen(true)}
              style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, color: '#5A5048' }}
              aria-label="Open menu"
            >
              <AdminIcon name="menu" size={20} />
            </button>

            {/* Current page */}
            <div className="flex items-center gap-2 min-w-0" style={{ fontSize: 14, fontWeight: 600, color: '#2A2420' }}>
              <AdminIcon name={meta.icon} size={16} color="#EC5D4A" />
              <span className="truncate">{meta.label}</span>
            </div>

            <div style={{ flex: 1 }} />

            {/* Right cluster — adapts on small screens */}
            <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
              {/* Storefront link — icon only on mobile */}
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CFBF] hover:bg-[#F2EEE6] transition-colors"
                style={{
                  padding: '6px 10px',
                  fontSize: 12, fontWeight: 500, color: '#5A5048', textDecoration: 'none',
                }}
              >
                <AdminIcon name="external" size={13} />
                <span className="hidden sm:inline">Storefront</span>
              </Link>

              <button
                className="relative hidden sm:inline-flex"
                style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 8, color: '#5A5048' }}
                aria-label="Notifications"
              >
                <AdminIcon name="bell" size={16} />
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, borderRadius: '50%', background: '#EC5D4A',
                }} />
              </button>

              <Link
                href="/admin/profile"
                className="flex items-center gap-2.5 sm:gap-2.5 sm:pl-3 sm:border-l sm:border-[#E8DFD2] hover:opacity-70 transition-opacity"
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: '#F5C443',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#1F2F4A', flexShrink: 0,
                }}>
                  {adminUser?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
                </div>
                <div className="hidden sm:block">
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                    {adminUser?.name?.split(' ')[0] || 'Admin'}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#8B8176', letterSpacing: '.05em', textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono-var, monospace)',
                  }}>
                    {adminUser?.role?.replace('_', ' ') || 'Owner'}
                  </div>
                </div>
              </Link>
            </div>
          </header>

          {/* Scrollable content */}
          <main
            className="px-4 sm:px-6 lg:px-7 py-5 sm:py-6 pb-16"
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#FAF6EF',
              minWidth: 0,
            }}
          >
            {children}
          </main>
        </div>
      </div>
      <ConfirmHost />
    </AdminGuard>
  );
}
