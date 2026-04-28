'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminIcon from '@/components/admin/AdminIcon';
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
  brands:     { label: 'Brands',      icon: 'brand' },
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
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [collapsed, setCollapsed]         = useState(false);
  const [searchQ, setSearchQ]             = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const { adminUser } = useAuthStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (pathname === '/admin/login') return <>{children}</>;

  const segment = pathname.split('/')[2] || 'dashboard';
  const meta = PAGE_META[segment] || { label: segment.charAt(0).toUpperCase() + segment.slice(1), icon: 'dashboard' };
  const sidebarW = collapsed ? 60 : 232;

  return (
    <AdminGuard>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${sidebarW}px 1fr`,
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          background: '#FAF6EF',
          color: '#2A2420',
          fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
          fontSize: 13,
          transition: 'grid-template-columns .2s',
        }}
      >
        <AdminSidebar
          open={sidebarOpen}
          collapsed={collapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, height: '100vh' }}>

          {/* Topbar */}
          <header style={{
            background: '#FFFBF2',
            borderBottom: '1px solid #E8DFD2',
            padding: '0 24px',
            height: 58,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, color: '#5A5048' }}
            >
              <AdminIcon name="menu" size={18} />
            </button>

            {/* Current page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#2A2420' }}>
              <AdminIcon name={meta.icon} size={16} color="#EC5D4A" />
              <span>{meta.label}</span>
            </div>

            {/* Search */}
            <div style={{ marginLeft: 24, flex: 1, maxWidth: 460 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#FAF6EF', border: '1px solid #E8DFD2', borderRadius: 8,
                padding: '7px 12px', cursor: 'text', color: '#8B8176', fontSize: 13,
              }}>
                <AdminIcon name="search" size={14} color="#8B8176" />
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search products, orders, customers…"
                  style={{
                    flex: 1, border: 0, outline: 0, background: 'transparent',
                    fontSize: 13, fontFamily: 'inherit', color: '#2A2420',
                  }}
                />
                <span style={{
                  fontSize: 11, color: '#A89E92', background: '#FFF',
                  border: '1px solid #E8DFD2', borderRadius: 4, padding: '1px 6px',
                  fontFamily: 'var(--font-mono-var, monospace)',
                }}>⌘K</span>
              </label>
            </div>

            {/* Right: storefront link + notifications + user */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link
                href="/"
                target="_blank"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  border: '1px solid #D8CFBF', borderRadius: 8, padding: '5px 10px',
                  fontSize: 12, fontWeight: 500, color: '#5A5048', textDecoration: 'none',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F2EEE6'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <AdminIcon name="external" size={13} />
                Storefront
              </Link>

              <button style={{
                position: 'relative', border: 0, background: 'transparent',
                cursor: 'pointer', padding: 8, color: '#5A5048',
              }}>
                <AdminIcon name="bell" size={16} />
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, borderRadius: '50%', background: '#EC5D4A',
                }} />
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 9,
                paddingLeft: 12, borderLeft: '1px solid #E8DFD2',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', background: '#F5C443',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#1F2F4A', flexShrink: 0,
                }}>
                  {adminUser?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
                </div>
                <div>
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
              </div>
            </div>
          </header>

          {/* Scrollable content */}
          <main style={{
            flex: 1, overflowY: 'auto',
            padding: '24px 28px 60px',
            background: '#FAF6EF',
          }}>
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
