/* Admin dashboard: KPIs, revenue, tasks, low stock, top products, orders attention, visitors */

function AdminDashboard() {
  const { state, actions, navigateAdmin, pushToast } = useAdmin();
  const { orders, products, customers, tasks } = state;

  const [range, setRange] = React.useState('week');

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const newCustomers = customers.filter(c => Date.now() - new Date(c.joined).getTime() < 30 * 86400000).length;

  const revenueByDay = [
    12400, 15200, 18900, 14500, 22100, 19800, 24500,
    21200, 23800, 17600, 26400, 28100, 29900, 31200,
  ];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const topProducts = [...products]
    .sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating))
    .slice(0, 5);

  const lowStock = products.filter(p => p.stock < 8).slice(0, 6);
  const newOrders = orders.filter(o => o.status === 'new').slice(0, 6);
  const codPending = orders.filter(o => o.paymentMethod === 'cod' && o.paymentStatus === 'pending').slice(0, 5);

  const [visitors, setVisitors] = React.useState(() => {
    const pages = ['/', '/cat/toys', '/cat/by-age', '/p/wooden-rainbow-stacker', '/p/classic-red-sports-diecast-1-24', '/cart', '/brands', '/cat/sale', '/blog'];
    return Array.from({ length: 8 }).map((_, i) => ({
      id: 'v' + i,
      page: pages[i % pages.length],
      device: i % 3 === 0 ? 'desktop' : 'mobile',
      city: ['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi'][i % 5],
      dur: 12 + (i * 27) % 180,
    }));
  });

  // live visitor feed - occasional page change
  React.useEffect(() => {
    const t = setInterval(() => {
      setVisitors(vs => vs.map((v, i) => i === 0 ? { ...v, dur: v.dur + 1 } : v));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: '#8B8176', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            {greeting}, Nazia.
          </h1>
          <div style={{ fontSize: 13, color: '#8B8176', marginTop: 6 }}>
            {orders.filter(o => o.status === 'new').length} new orders, {state.reviews.filter(r => r.status === 'pending').length} reviews pending, {lowStock.length} items low on stock.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <AdminUI.Button size="sm" icon="plus" onClick={() => navigateAdmin('products/new')}>Add product</AdminUI.Button>
          <AdminUI.Button size="sm" icon="coupon" onClick={() => navigateAdmin('coupons/new')}>New coupon</AdminUI.Button>
          <AdminUI.Button size="sm" kind="primary" icon="download" onClick={() => pushToast('Report generated and downloaded')}>Export</AdminUI.Button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <AdminUI.Kpi label="Revenue (30d)" value={AdminUI.fmtBDT(totalRevenue)} delta={12.4} spark={revenueByDay} accent="#EC5D4A" />
        <AdminUI.Kpi label="Orders (30d)" value={totalOrders} delta={8.1} spark={[18,22,19,26,24,31,28,33,29,35,38,36,42,40]} accent="#4FA36A" />
        <AdminUI.Kpi label="Avg. Order Value" value={AdminUI.fmtBDT(avgOrder)} delta={3.2} spark={[1400,1500,1450,1600,1650,1700,1680,1720,1750,1800,1850,1820,1880,1900]} accent="#F5C443" />
        <AdminUI.Kpi label="New Customers" value={newCustomers} delta={-4.5} spark={[5,7,6,9,8,11,10,13,12,14,13,16,15,18]} accent="#6FB8D9" />
      </div>

      {/* Revenue chart + quick actions row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        <AdminUI.Card
          title="Revenue"
          subtitle="Last 14 days"
          actions={['today', 'week', 'month'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              background: range === r ? '#FEE8E4' : 'transparent',
              color: range === r ? '#B8432E' : '#8B8176',
              border: 0, padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              fontWeight: 500, fontFamily: 'inherit', textTransform: 'capitalize',
            }}>{r}</button>
          ))}
        >
          <AdminUI.LineChart data={revenueByDay} labels={dayLabels} height={200} accent="#EC5D4A" />
          <div style={{ display: 'flex', gap: 24, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F1EBE0', fontSize: 12 }}>
            <div><span style={{ color: '#8B8176' }}>Peak</span> <span style={{ fontWeight: 600 }}>{AdminUI.fmtBDT(Math.max(...revenueByDay))}</span></div>
            <div><span style={{ color: '#8B8176' }}>Avg daily</span> <span style={{ fontWeight: 600 }}>{AdminUI.fmtBDT(revenueByDay.reduce((s, v) => s + v, 0) / revenueByDay.length)}</span></div>
            <div><span style={{ color: '#8B8176' }}>Growth</span> <span style={{ fontWeight: 600, color: '#24603C' }}>+12.4%</span></div>
          </div>
        </AdminUI.Card>

        <AdminUI.Card title="Today's tasks" subtitle={`${tasks.filter(t => !t.done).length} open · ${tasks.filter(t => t.done).length} done`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={t.done} onChange={() => actions.toggleTask(t.id)} />
                <span style={{ flex: 1, fontSize: 13, color: t.done ? '#A89E92' : '#2A2420', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                <AdminUI.Pill kind={t.priority === 'high' ? 'danger' : t.priority === 'med' ? 'warn' : 'muted'} size="sm">{t.priority}</AdminUI.Pill>
              </div>
            ))}
            <button onClick={() => {
              const v = prompt('New task');
              if (v) actions.addTask(v);
            }} style={{ marginTop: 4, background: 'transparent', border: '1px dashed #D8CFBF', color: '#8B8176', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              + add task
            </button>
          </div>
        </AdminUI.Card>
      </div>

      {/* Row: orders needing attention + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <AdminUI.Card
          title="Orders needing attention"
          subtitle={`${newOrders.length} new, ${codPending.length} COD to confirm`}
          actions={<AdminUI.Button size="sm" kind="ghost" onClick={() => navigateAdmin('orders')}>View all</AdminUI.Button>}
          padding={0}
        >
          {[...newOrders, ...codPending].slice(0, 6).map(o => (
            <div key={o.id} onClick={() => navigateAdmin('orders/' + o.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px', borderBottom: '1px solid #F4EEE3', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF7F5'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <AdminUI.StatusDot kind={o.status === 'new' ? 'warn' : 'info'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{o.id} · {o.customer}</div>
                <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {o.lines.length} item{o.lines.length > 1 ? 's' : ''} · {o.paymentMethod.toUpperCase()} · {AdminUI.relTime(o.date)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{AdminUI.fmtBDT(o.total)}</div>
                <div style={{ marginTop: 2 }}>
                  <AdminUI.Pill kind={o.status === 'new' ? 'warn' : 'info'} size="sm">{o.status}</AdminUI.Pill>
                </div>
              </div>
            </div>
          ))}
        </AdminUI.Card>

        <AdminUI.Card
          title="Low stock"
          subtitle={`${lowStock.length} SKUs below threshold`}
          actions={<AdminUI.Button size="sm" kind="ghost" onClick={() => navigateAdmin('inventory')}>Inventory</AdminUI.Button>}
          padding={0}
        >
          {lowStock.map(p => (
            <div key={p.id} onClick={() => navigateAdmin('products/' + p.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
              borderBottom: '1px solid #F4EEE3', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF7F5'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <AdminUI.ProductSwatch product={p} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{p.sku} · {p.brand}</div>
              </div>
              <AdminUI.Pill kind={p.stock === 0 ? 'danger' : 'warn'} size="sm">{p.stock} left</AdminUI.Pill>
            </div>
          ))}
        </AdminUI.Card>
      </div>

      {/* Row: top sellers + live visitors + recent customers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 16 }}>
        <AdminUI.Card title="Top sellers" subtitle="By rating × reviews (proxy for units)" padding={0}>
          {topProducts.map((p, i) => (
            <div key={p.id} onClick={() => navigateAdmin('products/' + p.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
              borderBottom: '1px solid #F4EEE3', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF7F5'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#D8CFBF', width: 24, fontFamily: 'var(--font-mono)' }}>0{i + 1}</div>
              <AdminUI.ProductSwatch product={p} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  ★ {p.rating.toFixed(1)} · {p.reviews} reviews
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{AdminUI.fmtBDT(p.price)}</div>
            </div>
          ))}
        </AdminUI.Card>

        <AdminUI.Card title="Live visitors" subtitle={`${visitors.length} on-site now`} padding={0}>
          {visitors.slice(0, 6).map((v, i) => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid #F4EEE3' }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4FA36A', animation: 'pulse 2s infinite', flex: '0 0 auto' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#2A2420', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.page}</div>
                <div style={{ fontSize: 10, color: '#8B8176', marginTop: 2 }}>{v.city} · {v.device}</div>
              </div>
              <div style={{ fontSize: 10, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{v.dur}s</div>
            </div>
          ))}
        </AdminUI.Card>

        <AdminUI.Card
          title="Recent customers"
          subtitle={`${customers.length} total`}
          actions={<AdminUI.Button size="sm" kind="ghost" onClick={() => navigateAdmin('customers')}>All</AdminUI.Button>}
          padding={0}
        >
          {customers.slice(0, 6).map(c => (
            <div key={c.id} onClick={() => navigateAdmin('customers/' + c.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px',
              borderBottom: '1px solid #F4EEE3', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF7F5'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `hsl(${(c.name.charCodeAt(0) * 13) % 360} 50% 78%)`,
                color: '#1F2F4A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flex: '0 0 auto',
              }}>{c.name.split(' ').map(w => w[0]).join('')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: 10, color: '#8B8176', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{c.orders} orders · {AdminUI.fmtBDT(c.spend)}</div>
              </div>
              <AdminUI.Pill kind={c.tier === 'VIP' ? 'brand' : c.tier === 'Gold' ? 'warn' : 'muted'} size="sm">{c.tier}</AdminUI.Pill>
            </div>
          ))}
        </AdminUI.Card>
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
