/* Admin shell: sidebar + topbar + command palette + router */

function AdminShell({ children }) {
  const { state, route, navigateAdmin, actions, toast, cmdOpen, setCmdOpen } = useAdmin();
  const collapsed = state.ui.sidebarCollapsed;

  const groups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'reports', label: 'Reports', icon: 'report' },
      ],
    },
    {
      label: 'Sell',
      items: [
        { id: 'orders', label: 'Orders', icon: 'orders', count: state.orders.filter(o => o.status === 'new').length },
        { id: 'products', label: 'Products', icon: 'products' },
        { id: 'inventory', label: 'Inventory', icon: 'inventory' },
        { id: 'customers', label: 'Customers', icon: 'customer' },
        { id: 'reviews', label: 'Reviews & Q&A', icon: 'review', count: state.reviews.filter(r => r.status === 'pending').length },
        { id: 'coupons', label: 'Coupons', icon: 'coupon' },
      ],
    },
    {
      label: 'Catalog',
      items: [
        { id: 'categories', label: 'Categories', icon: 'category' },
        { id: 'brands', label: 'Brands', icon: 'brand' },
      ],
    },
    {
      label: 'Storefront',
      items: [
        { id: 'cms', label: 'Pages', icon: 'cms' },
        { id: 'homepage', label: 'Homepage', icon: 'home' },
        { id: 'banners', label: 'Banners', icon: 'flag' },
        { id: 'navigation', label: 'Navigation', icon: 'nav' },
        { id: 'blog', label: 'Journal', icon: 'cms' },
        { id: 'media', label: 'Media', icon: 'media' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { id: 'shipping', label: 'Shipping', icon: 'shipping' },
        { id: 'payments', label: 'Payments', icon: 'payment' },
        { id: 'audit', label: 'Audit Log', icon: 'audit' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ],
    },
  ];

  const activeRoute = route.split('/')[0];
  const activeItem = groups.flatMap(g => g.items).find(i => i.id === activeRoute);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: (collapsed ? 60 : 232) + 'px 1fr',
      height: '100vh', width: '100vw', overflow: 'hidden',
      background: '#FAF6EF', color: '#2A2420',
      fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13,
    }}>
      {/* sidebar */}
      <aside style={{
        background: '#1F2F4A', color: '#F5F1EA',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid #1A2640', overflow: 'hidden',
      }}>
        {/* brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '20px 0' : '20px 18px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          minHeight: 64,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7, background: '#EC5D4A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#FFF', flex: '0 0 auto',
          }}>SK</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.01em' }}>SK Toy Admin</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '.08em' }}>SUPER ADMIN</div>
            </div>
          )}
        </div>

        {/* nav groups */}
        <nav style={{ flex: 1, overflow: 'auto', padding: '10px 0' }}>
          {groups.map(g => (
            <div key={g.label} style={{ marginBottom: 14 }}>
              {!collapsed && (
                <div style={{
                  padding: '6px 22px 4px', fontSize: 10, color: 'rgba(255,255,255,.38)',
                  textTransform: 'uppercase', letterSpacing: '.12em', fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}>{g.label}</div>
              )}
              {g.items.map(item => {
                const active = activeRoute === item.id;
                return (
                  <a
                    key={item.id}
                    href={'#admin/' + item.id}
                    onClick={(e) => { e.preventDefault(); navigateAdmin(item.id); }}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: collapsed ? '9px 0' : '8px 22px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: active ? '#FFF' : 'rgba(245,241,234,.72)',
                      background: active ? 'rgba(236,93,74,.15)' : 'transparent',
                      borderLeft: collapsed ? 'none' : (active ? '3px solid #EC5D4A' : '3px solid transparent'),
                      fontSize: 13, fontWeight: active ? 500 : 400,
                      textDecoration: 'none', transition: 'all .1s',
                      paddingLeft: collapsed ? 0 : (active ? 19 : 22),
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <AdminUI.Icon name={item.icon} size={16} />
                    {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                    {!collapsed && item.count > 0 && (
                      <span style={{
                        background: '#EC5D4A', color: '#FFF',
                        fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999,
                        fontFamily: 'var(--font-mono)',
                      }}>{item.count}</span>
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        {/* footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <a
            href="#home"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: 'rgba(245,241,234,.72)', fontSize: 12, textDecoration: 'none',
              padding: '6px 0', justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            title="Back to storefront"
          >
            <AdminUI.Icon name="external" size={14} />
            {!collapsed && <span>View storefront</span>}
          </a>
          <button
            onClick={() => actions.setUi({ sidebarCollapsed: !collapsed })}
            style={{
              background: 'transparent', border: 0, color: 'rgba(245,241,234,.55)',
              cursor: 'pointer', padding: '6px 0', width: '100%',
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontFamily: 'inherit',
            }}
          >
            <AdminUI.Icon name={collapsed ? 'chevR' : 'chevL'} size={14} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* main */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* topbar */}
        <header style={{
          background: '#FFF', borderBottom: '1px solid #E8DFD2',
          padding: '0 24px', height: 58,
          display: 'flex', alignItems: 'center', gap: 16, flex: '0 0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#2A2420', fontWeight: 600 }}>
            <AdminUI.Icon name={activeItem?.icon || 'dashboard'} size={16} color="#EC5D4A" />
            <span>{activeItem?.label || 'Dashboard'}</span>
          </div>

          <div
            onClick={() => setCmdOpen(true)}
            style={{
              marginLeft: 30, flex: 1, maxWidth: 460,
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#FAF6EF', border: '1px solid #E8DFD2', borderRadius: 8,
              padding: '7px 12px', cursor: 'pointer', color: '#8B8176', fontSize: 13,
            }}>
            <AdminUI.Icon name="search" size={14} color="#8B8176" />
            <span style={{ flex: 1 }}>Search products, orders, customers…</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#A89E92', background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 4, padding: '1px 6px' }}>⌘K</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AdminUI.Button size="sm" kind="ghost" icon="external" onClick={() => window.location.hash = 'home'}>Storefront</AdminUI.Button>
            <button style={{
              position: 'relative', border: 0, background: 'transparent', cursor: 'pointer', padding: 8, color: '#5A5048',
            }} title="Notifications">
              <AdminUI.Icon name="bell" size={16} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#EC5D4A' }} />
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 12, borderLeft: '1px solid #E8DFD2',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: '#F5C443',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#1F2F4A',
              }}>NA</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Nazia A.</div>
                <div style={{ fontSize: 10, color: '#8B8176', fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>OWNER</div>
              </div>
            </div>
          </div>
        </header>

        {/* scrollable content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px 28px 60px' }}>
          {children}
        </main>
      </div>

      {/* toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)',
          background: '#1F2F4A', color: '#FFF', padding: '10px 18px',
          borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 300,
          boxShadow: '0 8px 24px rgba(0,0,0,.18)', display: 'flex', alignItems: 'center', gap: 10,
          animation: 'slideInR .18s ease',
        }}>
          <AdminUI.Icon name={toast.kind === 'error' ? 'x' : 'check'} size={14} color={toast.kind === 'error' ? '#EC5D4A' : '#4FA36A'} />
          {toast.msg}
        </div>
      )}

      {/* command palette */}
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}

function CommandPalette({ onClose }) {
  const { state, navigateAdmin } = useAdmin();
  const [q, setQ] = React.useState('');

  const commands = React.useMemo(() => {
    const pages = [
      { kind: 'page', label: 'Dashboard', to: 'dashboard', icon: 'dashboard' },
      { kind: 'page', label: 'Orders', to: 'orders', icon: 'orders' },
      { kind: 'page', label: 'Products', to: 'products', icon: 'products' },
      { kind: 'page', label: 'Customers', to: 'customers', icon: 'customer' },
      { kind: 'page', label: 'Reviews & Q&A', to: 'reviews', icon: 'review' },
      { kind: 'page', label: 'Coupons', to: 'coupons', icon: 'coupon' },
      { kind: 'page', label: 'Categories', to: 'categories', icon: 'category' },
      { kind: 'page', label: 'Brands', to: 'brands', icon: 'brand' },
      { kind: 'page', label: 'Inventory', to: 'inventory', icon: 'inventory' },
      { kind: 'page', label: 'CMS Pages', to: 'cms', icon: 'cms' },
      { kind: 'page', label: 'FAQ', to: 'cms/faq', icon: 'cms' },
      { kind: 'page', label: 'Terms & Conditions', to: 'cms/terms', icon: 'cms' },
      { kind: 'page', label: 'Privacy Policy', to: 'cms/privacy', icon: 'cms' },
      { kind: 'page', label: 'Homepage', to: 'homepage', icon: 'home' },
      { kind: 'page', label: 'Banners', to: 'banners', icon: 'flag' },
      { kind: 'page', label: 'Navigation', to: 'navigation', icon: 'nav' },
      { kind: 'page', label: 'Journal', to: 'blog', icon: 'cms' },
      { kind: 'page', label: 'Media Library', to: 'media', icon: 'media' },
      { kind: 'page', label: 'Shipping & Couriers', to: 'shipping', icon: 'shipping' },
      { kind: 'page', label: 'Payments', to: 'payments', icon: 'payment' },
      { kind: 'page', label: 'Reports', to: 'reports', icon: 'report' },
      { kind: 'page', label: 'Audit Log', to: 'audit', icon: 'audit' },
      { kind: 'page', label: 'Settings', to: 'settings', icon: 'settings' },
    ];
    const actions = [
      { kind: 'action', label: 'Add new product', to: 'products/new', icon: 'plus' },
      { kind: 'action', label: 'Create coupon', to: 'coupons/new', icon: 'plus' },
      { kind: 'action', label: 'Create page', to: 'cms/new', icon: 'plus' },
      { kind: 'action', label: 'View storefront', to: '__storefront', icon: 'external' },
    ];
    const products = state.products.slice(0, 30).map(p => ({ kind: 'product', label: p.name, to: 'products/' + p.id, icon: 'products', meta: p.sku }));
    const orders = state.orders.slice(0, 30).map(o => ({ kind: 'order', label: o.id + ' — ' + o.customer, to: 'orders/' + o.id, icon: 'orders', meta: AdminUI.fmtBDT(o.total) }));
    const customers = state.customers.slice(0, 30).map(c => ({ kind: 'customer', label: c.name, to: 'customers/' + c.id, icon: 'customer', meta: c.email }));
    return [...pages, ...actions, ...products, ...orders, ...customers];
  }, [state]);

  const filtered = q ? commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase()) || (c.meta && c.meta.toLowerCase().includes(q.toLowerCase()))) : commands.slice(0, 30);

  const [sel, setSel] = React.useState(0);
  React.useEffect(() => { setSel(0); }, [q]);

  const go = (c) => {
    if (c.to === '__storefront') { window.location.hash = 'home'; onClose(); return; }
    navigateAdmin(c.to);
    onClose();
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && filtered[sel]) { e.preventDefault(); go(filtered[sel]); }
  };

  const inputRef = React.useRef();
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,20,12,.35)' }} />
      <div style={{
        position: 'relative', width: 600, maxWidth: '92vw',
        background: '#FFF', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1EBE0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AdminUI.Icon name="search" size={16} color="#8B8176" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Jump to a page, product, order, customer…"
            style={{ flex: 1, border: 0, outline: 0, fontSize: 15, fontFamily: 'inherit' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#A89E92', background: '#FAF6EF', padding: '2px 6px', borderRadius: 4 }}>ESC</span>
        </div>
        <div style={{ overflow: 'auto', padding: 8, flex: 1 }}>
          {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#8B8176', fontSize: 13 }}>No matches for "{q}"</div>}
          {filtered.map((c, i) => (
            <div
              key={c.kind + c.to}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(c)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 12px', borderRadius: 8,
                background: sel === i ? '#FEF7F5' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <AdminUI.Icon name={c.icon} size={15} color={sel === i ? '#EC5D4A' : '#8B8176'} />
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</div>
              {c.meta && <span style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{c.meta}</span>}
              <AdminUI.Pill kind="muted" size="sm">{c.kind}</AdminUI.Pill>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid #F1EBE0', fontSize: 11, color: '#8B8176', display: 'flex', gap: 16, fontFamily: 'var(--font-mono)' }}>
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

window.AdminShell = AdminShell;
