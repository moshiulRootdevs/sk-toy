'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import AdminIcon from './AdminIcon';
import toast from 'react-hot-toast';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { href: '/admin/reports',   icon: 'report',    label: 'Reports' },
    ],
  },
  {
    label: 'Sell',
    items: [
      { href: '/admin/orders',    icon: 'orders',    label: 'Orders' },
      { href: '/admin/products',  icon: 'products',  label: 'Products' },
      { href: '/admin/inventory', icon: 'inventory', label: 'Inventory' },
      { href: '/admin/customers', icon: 'customer',  label: 'Customers' },
      { href: '/admin/reviews',   icon: 'review',    label: 'Reviews & Q&A' },
      { href: '/admin/coupons',   icon: 'coupon',    label: 'Coupons' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/categories', icon: 'category', label: 'Categories' },
    ],
  },
  {
    label: 'Storefront',
    items: [
      { href: '/admin/hero',       icon: 'flag',    label: 'Hero Section' },
      { href: '/admin/homepage',   icon: 'home',    label: 'Homepage' },
      { href: '/admin/catalogue',  icon: 'category', label: 'Catalogue' },

      { href: '/admin/navigation', icon: 'nav',     label: 'Navigation' },
      { href: '/admin/blog',       icon: 'cms',     label: 'Journal' },
      { href: '/admin/media',      icon: 'media',   label: 'Media' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/audit',     icon: 'audit',    label: 'Audit Log' },
      { href: '/admin/settings',  icon: 'settings', label: 'Settings' },
    ],
  },
];

interface Props {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ open, collapsed, onClose, onToggleCollapse }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const { adminUser, logoutAdmin } = useAuthStore();

  function logout() {
    logoutAdmin();
    toast.success('Logged out');
    router.push('/admin/login');
  }

  const w = collapsed ? 60 : 232;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className="fixed top-0 left-0 z-30 flex flex-col transition-all duration-200 lg:relative lg:translate-x-0"
        style={{
          width: w,
          height: '100vh',
          overflow: 'hidden',
          background: '#1F2F4A',
          color: '#F5F1EA',
          borderRight: '1px solid #1A2640',
          transform: open ? 'translateX(0)' : undefined,
        }}
      >
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
          padding: collapsed ? '20px 0' : '20px 18px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          minHeight: 64, flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, background: '#EC5D4A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#FFF', flexShrink: 0,
            letterSpacing: '-.01em',
          }}>SK</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.01em' }}>SK Toy Admin</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                {adminUser?.role?.replace('_', ' ') || 'Super Admin'}
              </div>
            </div>
          )}
          {open && (
            <button onClick={onClose} className="ml-auto lg:hidden text-white/40 hover:text-white">
              <AdminIcon name="x" size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}
             className="scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 14 }}>
              {!collapsed && (
                <div style={{
                  padding: '6px 22px 4px',
                  fontSize: 10, color: 'rgba(255,255,255,.35)',
                  textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600,
                }}>
                  {group.label}
                </div>
              )}
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : 11,
                      padding: collapsed ? '9px 0' : '8px 22px',
                      paddingLeft: collapsed ? 0 : (active ? 19 : 22),
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: active ? '#FFF' : 'rgba(245,241,234,.65)',
                      background: active ? 'rgba(236,93,74,.12)' : 'transparent',
                      borderLeft: collapsed ? 'none' : (active ? '3px solid #EC5D4A' : '3px solid transparent'),
                      fontSize: 13, fontWeight: active ? 500 : 400,
                      textDecoration: 'none', transition: 'background .1s, color .1s',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <AdminIcon
                      name={item.icon}
                      size={16}
                      color={active ? '#EC5D4A' : 'rgba(245,241,234,.65)'}
                    />
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: collapsed ? '12px 0' : '12px 18px', borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
          {!collapsed && adminUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: '#F5C443',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#1F2F4A', flexShrink: 0,
              }}>
                {adminUser.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser.name}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  {adminUser.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
          )}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: 'rgba(245,241,234,.55)', fontSize: 12, textDecoration: 'none',
              padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            title="View storefront"
          >
            <AdminIcon name="external" size={14} />
            {!collapsed && <span>View storefront</span>}
          </a>

          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: 'rgba(245,241,234,.45)', fontSize: 12,
              padding: '6px 0', background: 'none', border: 0, cursor: 'pointer',
              width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EC5D4A'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,241,234,.45)'; }}
          >
            <AdminIcon name="logout" size={14} />
            {!collapsed && <span>Logout</span>}
          </button>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex"
            style={{
              alignItems: 'center', gap: 10,
              color: 'rgba(245,241,234,.35)', fontSize: 12,
              padding: '6px 0', background: 'none', border: 0, cursor: 'pointer',
              width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
              fontFamily: 'inherit', marginTop: 2,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,241,234,.7)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(245,241,234,.35)'; }}
          >
            <AdminIcon name={collapsed ? 'chevR' : 'chevL'} size={14} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
