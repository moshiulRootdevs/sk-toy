'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import AdminIcon from './AdminIcon';
import toast from 'react-hot-toast';
import Tooltip from '@/components/ui/Tooltip';

const NAV_GROUPS = [
  {
    label: 'Main',
    color: '#F5C443',
    items: [
      { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard',  accent: '#F5C443' },
      { href: '/admin/orders',    icon: 'orders',    label: 'Orders',     accent: '#EC5D4A' },
      { href: '/admin/products',  icon: 'products',  label: 'Products',   accent: '#6FB8D9' },
      { href: '/admin/customers', icon: 'customer',  label: 'Customers',  accent: '#4FA36A' },
    ],
  },
  {
    label: 'Catalog',
    color: '#6FB8D9',
    items: [
      { href: '/admin/categories', icon: 'category',  label: 'Categories', accent: '#9C7BC9' },
      { href: '/admin/inventory',  icon: 'inventory', label: 'Inventory',  accent: '#F39436' },
      { href: '/admin/coupons',    icon: 'coupon',    label: 'Coupons',    accent: '#F28BA8' },
      { href: '/admin/reviews',    icon: 'review',    label: 'Reviews',    accent: '#6FB8D9' },
    ],
  },
  {
    label: 'Storefront',
    color: '#4FA36A',
    items: [
      { href: '/admin/homepage',   icon: 'home',     label: 'Homepage',     accent: '#4FA36A' },
      { href: '/admin/hero',       icon: 'flag',     label: 'Hero Section', accent: '#EC5D4A' },
      { href: '/admin/catalogue',  icon: 'category', label: 'Catalogue',    accent: '#F5C443' },
      { href: '/admin/navigation', icon: 'nav',      label: 'Navigation',   accent: '#6FB8D9' },
      { href: '/admin/blog',       icon: 'cms',      label: 'Journal',      accent: '#9C7BC9' },
      { href: '/admin/media',      icon: 'media',    label: 'Media',        accent: '#F39436' },
    ],
  },
  {
    label: 'System',
    color: '#EC5D4A',
    items: [
      { href: '/admin/settings',  icon: 'settings', label: 'Settings',   accent: '#EC5D4A' },
      { href: '/admin/reports',   icon: 'report',   label: 'Reports',    accent: '#F5C443' },
      { href: '/admin/audit',     icon: 'audit',    label: 'Audit Log',  accent: '#9C7BC9' },
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

  const w = collapsed ? 64 : 244;

  const NavLink = ({ href, icon, label: text, accent }: { href: string; icon: string; label: string; accent: string }) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    const link = (
      <Link
        href={href}
        onClick={(e) => {
          onClose();
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          el.style.setProperty('--ripple-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
          el.style.setProperty('--ripple-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        }}
        className={`sidebar-nav-link ${active ? 'sidebar-active-bg' : ''}`}
        style={{
          '--accent-glow': `${accent}18`,
          '--bar-color': accent,
          display: 'flex', alignItems: 'center',
          gap: 10,
          padding: collapsed ? '6px 0' : '5px 12px',
          margin: collapsed ? '1px auto' : '0 8px',
          width: collapsed ? 44 : undefined,
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: active ? '#FFF' : 'rgba(255,255,255,.55)',
          background: active ? `${accent}22` : 'transparent',
          borderRadius: 10,
          fontSize: 13, fontWeight: active ? 600 : 400,
          textDecoration: 'none', transition: 'all .2s',
          position: 'relative',
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = `${accent}12`;
            e.currentTarget.style.color = accent;
            e.currentTarget.style.transform = 'translateX(2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,.55)';
            e.currentTarget.style.transform = '';
          }
        }}
      >
        {/* Active left accent bar */}
        {active && !collapsed && (
          <span className="sidebar-active-bar" style={{
            position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3,
            background: accent, borderRadius: '0 3px 3px 0',
            boxShadow: `0 0 8px ${accent}`,
          }} />
        )}
        <span
          className={active ? 'sidebar-active-icon' : ''}
          style={{
            width: 28, height: 28, borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: active ? `${accent}30` : 'transparent',
            transition: 'background .2s',
            flexShrink: 0,
          }}>
          <AdminIcon name={icon} size={16} color={active ? accent : 'currentColor'} />
        </span>
        {!collapsed && <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{text}</span>}
        {active && !collapsed && (
          <span
            className="sidebar-active-dot"
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: accent, flexShrink: 0,
              '--dot-color': accent,
            } as React.CSSProperties}
          />
        )}
      </Link>
    );
    if (collapsed) return <Tooltip label={text} position="right">{link}</Tooltip>;
    return link;
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}

      <aside
        className="fixed top-0 left-0 z-30 flex flex-col transition-all duration-200 lg:relative lg:translate-x-0"
        style={{
          width: w, height: '100vh',
          background: '#0F1B2D',
          color: '#F5F1EA',
          transform: open ? 'translateX(0)' : undefined,
        }}
      >
        {/* Logo + Collapse/Expand */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 12,
          padding: collapsed ? '12px 0' : '14px 12px 14px 18px',
          borderBottom: '1px solid rgba(255,255,255,.06)',
          flexShrink: 0,
          justifyContent: collapsed ? 'center' : 'flex-start',
          flexDirection: collapsed ? 'column' : 'row',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #EC5D4A 0%, #F39436 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#FFF', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(236,93,74,.35)',
          }}>SK</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}>SK Toy</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.08em' }}>Admin Panel</div>
            </div>
          )}
          <Tooltip label={open ? 'Close' : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')} position={collapsed ? 'right' : 'bottom'}>
            <button onClick={open ? onClose : onToggleCollapse}
              className={open ? '' : 'hidden lg:flex'}
              style={{
                alignItems: 'center', justifyContent: 'center',
                width: collapsed ? 36 : 26, height: collapsed ? 28 : 26, borderRadius: 8,
                background: collapsed ? 'rgba(111,184,217,.1)' : 'rgba(255,255,255,.06)',
                border: 0, cursor: 'pointer',
                color: collapsed ? '#6FB8D9' : 'rgba(255,255,255,.35)',
                transition: 'all .15s',
                flexShrink: 0, display: 'flex',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = collapsed ? 'rgba(111,184,217,.2)' : 'rgba(255,255,255,.12)'; (e.currentTarget as HTMLElement).style.color = collapsed ? '#6FB8D9' : 'rgba(255,255,255,.7)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = collapsed ? 'rgba(111,184,217,.1)' : 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLElement).style.color = collapsed ? '#6FB8D9' : 'rgba(255,255,255,.35)'; }}
            >
              <AdminIcon name={open ? 'x' : (collapsed ? 'chevR' : 'chevL')} size={14} />
            </button>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }} className="scrollbar-none">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: 2 }}>
              {collapsed ? (
                gi > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '6px 14px' }} />
              ) : (
                <div style={{
                  padding: '6px 22px 2px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  overflow: 'hidden', whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 10, color: group.color,
                    textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700,
                    opacity: 0.8,
                  }}>
                    {group.label}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {group.items.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0, padding: collapsed ? '8px 0' : '8px 10px' }}>
          {adminUser && collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tooltip label={`${adminUser.name} · ${adminUser.role?.replace('_', ' ')}`} position="right">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #F5C443 0%, #F39436 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#1F2F4A',
                  boxShadow: '0 2px 6px rgba(245,196,67,.3)',
                }}>
                  {adminUser.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </Tooltip>
              <Tooltip label="Logout" position="right">
                <button onClick={logout}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 32, borderRadius: 8, background: 'rgba(236,93,74,.1)', color: '#EC5D4A', border: 0, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(236,93,74,.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(236,93,74,.1)'; }}>
                  <AdminIcon name="logout" size={15} />
                </button>
              </Tooltip>
            </div>
          ) : adminUser && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              background: 'linear-gradient(135deg, rgba(245,196,67,.08) 0%, rgba(236,93,74,.06) 100%)',
              borderRadius: 10, border: '1px solid rgba(245,196,67,.1)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #F5C443 0%, #F39436 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#1F2F4A', flexShrink: 0,
                boxShadow: '0 2px 6px rgba(245,196,67,.3)',
              }}>
                {adminUser.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser.name}
                </div>
                <div style={{ fontSize: 10, color: '#F5C443', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  {adminUser.role?.replace('_', ' ')}
                </div>
              </div>
              <Tooltip label="Logout" position="top">
                <button onClick={logout}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(236,93,74,.1)', color: '#EC5D4A', border: 0, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', flexShrink: 0 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(236,93,74,.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(236,93,74,.1)'; }}>
                  <AdminIcon name="logout" size={14} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
