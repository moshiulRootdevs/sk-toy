/* Customers, Reviews, Coupons, Brands, Categories */

function AdminCustomers() {
  const { state, navigateAdmin, route } = useAdmin();
  const subId = route.split('/')[1];

  if (subId) {
    const c = state.customers.find(x => x.id === subId);
    if (!c) return <AdminUI.Empty title="Customer not found" icon="customer" action={<AdminUI.Button onClick={() => navigateAdmin('customers')}>Back</AdminUI.Button>} />;
    return <CustomerDetail customer={c} />;
  }

  const [search, setSearch] = React.useState('');
  const [tier, setTier] = React.useState('all');

  const filtered = state.customers
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search) || c.phone.includes(search))
    .filter(c => tier === 'all' || c.tier === tier);

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        subtitle={`${state.customers.length} total · ${state.customers.filter(c => c.tier === 'VIP').length} VIP`}
        actions={<>
          <AdminUI.Button size="sm" icon="download">Export</AdminUI.Button>
          <AdminUI.Button size="sm" kind="primary" icon="plus">Add customer</AdminUI.Button>
        </>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <AdminUI.Input icon="search" placeholder="Search name, email, phone…" value={search} onChange={setSearch} style={{ flex: 1 }} />
        <AdminUI.Select value={tier} onChange={setTier} options={[{ value: 'all', label: 'All tiers' }, 'Bronze', 'Silver', 'Gold', 'VIP']} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {['Bronze', 'Silver', 'Gold', 'VIP'].map(t => {
          const n = state.customers.filter(c => c.tier === t).length;
          const pct = Math.round(n / state.customers.length * 100);
          return (
            <div key={t} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{t}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{n}</div>
              <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{pct}% of base</div>
            </div>
          );
        })}
      </div>

      <AdminUI.Card padding={0}>
        <AdminUI.Table
          onRow={(r) => navigateAdmin('customers/' + r.id)}
          columns={[
            { label: 'Customer', render: (r) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `hsl(${(r.name.charCodeAt(0) * 13) % 360} 50% 78%)`, color: '#1F2F4A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{r.name.split(' ').map(w => w[0]).join('')}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{r.email}</div>
                </div>
              </div>
            ) },
            { label: 'Area', key: 'area', width: 120 },
            { label: 'Tier', render: (r) => <AdminUI.Pill kind={r.tier === 'VIP' ? 'brand' : r.tier === 'Gold' ? 'warn' : r.tier === 'Silver' ? 'info' : 'muted'}>{r.tier}</AdminUI.Pill>, width: 90 },
            { label: 'Orders', key: 'orders', width: 70, align: 'center' },
            { label: 'Lifetime spend', render: (r) => <span style={{ fontWeight: 600 }}>{AdminUI.fmtBDT(r.spend)}</span>, width: 120, align: 'right' },
            { label: 'Last order', render: (r) => <span style={{ fontSize: 12 }}>{AdminUI.relTime(r.lastOrder)}</span>, width: 110 },
          ]}
          rows={filtered}
        />
      </AdminUI.Card>
    </div>
  );
}

function CustomerDetail({ customer }) {
  const { state, navigateAdmin, actions, pushToast } = useAdmin();
  const orders = state.orders.filter(o => o.customer === customer.name);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <AdminUI.Button size="sm" kind="ghost" icon="chevL" onClick={() => navigateAdmin('customers')}>Customers</AdminUI.Button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{customer.name}</h1>
          <div style={{ fontSize: 12, color: '#8B8176', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{customer.email} · {customer.phone}</div>
        </div>
        <AdminUI.Pill kind={customer.tier === 'VIP' ? 'brand' : 'muted'}>{customer.tier}</AdminUI.Pill>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <AdminUI.Kpi label="Lifetime orders" value={customer.orders} />
        <AdminUI.Kpi label="Lifetime spend" value={AdminUI.fmtBDT(customer.spend)} />
        <AdminUI.Kpi label="Avg. order" value={AdminUI.fmtBDT(Math.round(customer.spend / customer.orders))} />
        <AdminUI.Kpi label="Member since" value={AdminUI.fmtDate(customer.joined)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <AdminUI.Card title={`Order history (${orders.length})`} padding={0}>
          {orders.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#8B8176', fontSize: 13 }}>No orders on file.</div>}
          {orders.map(o => (
            <div key={o.id} onClick={() => navigateAdmin('orders/' + o.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid #F4EEE3', cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{o.id}</div>
                <div style={{ fontSize: 11, color: '#8B8176' }}>{AdminUI.fmtDate(o.date)} · {o.lines.length} items</div>
              </div>
              <AdminUI.Pill kind={o.status === 'delivered' ? 'ok' : o.status === 'new' ? 'warn' : 'info'} size="sm">{o.status}</AdminUI.Pill>
              <div style={{ fontWeight: 600, minWidth: 90, textAlign: 'right' }}>{AdminUI.fmtBDT(o.total)}</div>
            </div>
          ))}
        </AdminUI.Card>

        <div>
          <AdminUI.Card title="Contact">
            <AdminUI.Field label="Name"><AdminUI.Input full value={customer.name} onChange={(v) => actions.updateCustomer(customer.id, { name: v })} /></AdminUI.Field>
            <AdminUI.Field label="Email"><AdminUI.Input full value={customer.email} onChange={(v) => actions.updateCustomer(customer.id, { email: v })} /></AdminUI.Field>
            <AdminUI.Field label="Phone"><AdminUI.Input full value={customer.phone} onChange={(v) => actions.updateCustomer(customer.id, { phone: v })} /></AdminUI.Field>
            <AdminUI.Field label="Area"><AdminUI.Input full value={customer.area} onChange={(v) => actions.updateCustomer(customer.id, { area: v })} /></AdminUI.Field>
            <AdminUI.Field label="Tier"><AdminUI.Select full value={customer.tier} onChange={(v) => actions.updateCustomer(customer.id, { tier: v })} options={['Bronze', 'Silver', 'Gold', 'VIP']} /></AdminUI.Field>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <AdminUI.Button size="sm" kind="default" full icon="external" onClick={() => pushToast('Password reset sent')}>Send reset link</AdminUI.Button>
            </div>
          </AdminUI.Card>
        </div>
      </div>
    </div>
  );
}

/* ---- Reviews ---- */
function AdminReviews() {
  const { state, actions, pushToast } = useAdmin();
  const [filter, setFilter] = React.useState('pending');
  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'flagged', label: 'Flagged' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'all', label: 'All' },
  ];
  const filtered = filter === 'all' ? state.reviews : state.reviews.filter(r => r.status === filter);

  return (
    <div>
      <AdminPageHeader title="Reviews & Q&A" subtitle={`${state.reviews.length} total · ${state.reviews.filter(r => r.status === 'pending').length} pending approval`} />

      <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid #E8DFD2' }}>
        {tabs.map(t => {
          const n = t.id === 'all' ? state.reviews.length : state.reviews.filter(r => r.status === t.id).length;
          return (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              background: 'transparent', border: 0, padding: '9px 14px', fontSize: 13,
              color: filter === t.id ? '#EC5D4A' : '#6B625A', cursor: 'pointer',
              fontWeight: filter === t.id ? 600 : 400,
              borderBottom: filter === t.id ? '2px solid #EC5D4A' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'inherit',
            }}>{t.label} <span style={{ color: '#A89E92', fontFamily: 'var(--font-mono)', fontSize: 11 }}>({n})</span></button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && <AdminUI.Empty title="No reviews here" icon="review" />}
        {filtered.map(r => {
          const p = state.products.find(x => x.id === r.productId);
          return (
            <AdminUI.Card key={r.id} padding={16}>
              <div style={{ display: 'flex', gap: 14 }}>
                {p && <AdminUI.ProductSwatch product={p} size={50} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{r.who}</span>
                    <span style={{ color: '#F5C443', fontSize: 14 }}>{'★'.repeat(r.stars)}<span style={{ color: '#E8DFD2' }}>{'★'.repeat(5 - r.stars)}</span></span>
                    <span style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{AdminUI.fmtDate(r.date)}</span>
                    <AdminUI.Pill kind={r.status === 'approved' ? 'ok' : r.status === 'pending' ? 'warn' : r.status === 'flagged' ? 'danger' : 'muted'} size="sm">{r.status}</AdminUI.Pill>
                  </div>
                  <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>on "{p?.name || 'deleted product'}"</div>
                  <div style={{ fontSize: 13, color: '#3D342A', lineHeight: 1.55 }}>{r.text}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {r.status !== 'approved' && <AdminUI.Button size="sm" kind="primary" icon="check" onClick={() => { actions.setReviewStatus(r.id, 'approved'); pushToast('Review approved'); }}>Approve</AdminUI.Button>}
                    {r.status !== 'rejected' && <AdminUI.Button size="sm" kind="danger" icon="x" onClick={() => { actions.setReviewStatus(r.id, 'rejected'); pushToast('Review rejected'); }}>Reject</AdminUI.Button>}
                    {r.status !== 'flagged' && <AdminUI.Button size="sm" kind="default" icon="flag" onClick={() => { actions.setReviewStatus(r.id, 'flagged'); pushToast('Review flagged'); }}>Flag</AdminUI.Button>}
                    <AdminUI.Button size="sm" kind="ghost">Reply</AdminUI.Button>
                  </div>
                </div>
              </div>
            </AdminUI.Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Coupons ---- */
function AdminCoupons() {
  const { state, actions, navigateAdmin, route, pushToast } = useAdmin();
  const sub = route.split('/')[1];

  if (sub === 'new' || state.coupons.find(c => c.id === sub)) {
    return <CouponEditor coupon={sub === 'new' ? null : state.coupons.find(c => c.id === sub)} />;
  }

  return (
    <div>
      <AdminPageHeader
        title="Coupons & promotions"
        subtitle={`${state.coupons.filter(c => c.status === 'active').length} active · ${state.coupons.filter(c => c.status === 'scheduled').length} scheduled`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => navigateAdmin('coupons/new')}>Create coupon</AdminUI.Button>}
      />

      <AdminUI.Card padding={0}>
        <AdminUI.Table
          onRow={(r) => navigateAdmin('coupons/' + r.id)}
          columns={[
            { label: 'Code', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, background: '#FEF4D4', color: '#7A5B0A', padding: '2px 8px', borderRadius: 4, letterSpacing: '.05em' }}>{r.code}</span>, width: 130 },
            { label: 'Type', render: (r) => <AdminUI.Pill kind="info" size="sm">{r.type === 'percent' ? `${r.value}% off` : r.type === 'fixed' ? `৳${r.value} off` : 'Free shipping'}</AdminUI.Pill>, width: 130 },
            { label: 'Description', render: (r) => <span style={{ color: '#3D342A' }}>{r.description}</span> },
            { label: 'Uses', render: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.uses}{r.limit ? ' / ' + r.limit : ''}</span>, width: 110 },
            { label: 'Min spend', render: (r) => r.minSpend > 0 ? AdminUI.fmtBDT(r.minSpend) : '—', width: 110 },
            { label: 'Expires', render: (r) => <span style={{ fontSize: 12 }}>{AdminUI.fmtDate(r.endsAt)}</span>, width: 120 },
            { label: 'Status', render: (r) => <AdminUI.Pill kind={r.status === 'active' ? 'ok' : r.status === 'scheduled' ? 'info' : 'muted'} size="sm">{r.status}</AdminUI.Pill>, width: 100 },
          ]}
          rows={state.coupons}
        />
      </AdminUI.Card>
    </div>
  );
}

function CouponEditor({ coupon }) {
  const { actions, navigateAdmin, pushToast } = useAdmin();
  const isNew = !coupon;
  const [c, setC] = React.useState(coupon || {
    code: '', type: 'percent', value: 10, status: 'active',
    startsAt: new Date().toISOString().slice(0, 10), endsAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    minSpend: 0, limit: null, appliesTo: 'all', description: '',
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <AdminUI.Button size="sm" kind="ghost" icon="chevL" onClick={() => navigateAdmin('coupons')}>Coupons</AdminUI.Button>
        <h1 style={{ flex: 1, fontSize: 22, fontWeight: 700, margin: 0 }}>{isNew ? 'New coupon' : c.code}</h1>
        <AdminUI.Button kind="primary" icon="check" onClick={() => { actions.upsertCoupon(c); pushToast('Coupon saved'); navigateAdmin('coupons'); }}>Save</AdminUI.Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <AdminUI.Card title="Coupon details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <AdminUI.Field label="Code"><AdminUI.Input full value={c.code} onChange={(v) => setC({ ...c, code: v.toUpperCase() })} placeholder="e.g. EID25" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '.1em' }} /></AdminUI.Field>
            <AdminUI.Field label="Type"><AdminUI.Select full value={c.type} onChange={(v) => setC({ ...c, type: v })} options={[{ value: 'percent', label: 'Percentage off' }, { value: 'fixed', label: 'Fixed amount off' }, { value: 'shipping', label: 'Free shipping' }]} /></AdminUI.Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {c.type !== 'shipping' && <AdminUI.Field label={c.type === 'percent' ? 'Discount %' : 'Discount amount (BDT)'}><AdminUI.Input full type="number" value={c.value} onChange={(v) => setC({ ...c, value: +v })} suffix={c.type === 'percent' ? '%' : '৳'} /></AdminUI.Field>}
            <AdminUI.Field label="Minimum spend (BDT)"><AdminUI.Input full type="number" value={c.minSpend} onChange={(v) => setC({ ...c, minSpend: +v })} suffix="৳" /></AdminUI.Field>
          </div>
          <AdminUI.Field label="Description" full><AdminUI.Input full value={c.description} onChange={(v) => setC({ ...c, description: v })} placeholder="Shown on storefront" /></AdminUI.Field>
          <AdminUI.Field label="Applies to"><AdminUI.Select full value={c.appliesTo} onChange={(v) => setC({ ...c, appliesTo: v })} options={[{ value: 'all', label: 'All products' }, { value: 'category:toys', label: 'Category: Toys' }, { value: 'category:baby', label: 'Category: Baby' }, { value: 'category:learning', label: 'Category: Learning' }, { value: 'sale', label: 'Sale items only' }]} /></AdminUI.Field>
        </AdminUI.Card>
        <div>
          <AdminUI.Card title="Schedule">
            <AdminUI.Field label="Starts"><AdminUI.Input full type="date" value={c.startsAt} onChange={(v) => setC({ ...c, startsAt: v })} /></AdminUI.Field>
            <AdminUI.Field label="Ends"><AdminUI.Input full type="date" value={c.endsAt} onChange={(v) => setC({ ...c, endsAt: v })} /></AdminUI.Field>
            <AdminUI.Field label="Usage limit"><AdminUI.Input full type="number" value={c.limit || ''} onChange={(v) => setC({ ...c, limit: v ? +v : null })} placeholder="Unlimited" /></AdminUI.Field>
            <AdminUI.Field label="Status"><AdminUI.Select full value={c.status} onChange={(v) => setC({ ...c, status: v })} options={['active', 'scheduled', 'expired']} /></AdminUI.Field>
          </AdminUI.Card>
          {!isNew && (
            <div style={{ marginTop: 16 }}>
              <AdminUI.Button kind="danger" full icon="trash" onClick={() => { if (confirm('Delete this coupon?')) { actions.deleteCoupon(c.id); pushToast('Coupon deleted'); navigateAdmin('coupons'); } }}>Delete coupon</AdminUI.Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Brands ---- */
function AdminBrands() {
  const { state, actions, pushToast } = useAdmin();
  const [adding, setAdding] = React.useState(null);

  const updateBrand = (i, updates) => actions.patch('brands', bs => bs.map((b, idx) => idx === i ? { ...b, ...updates } : b));
  const removeBrand = (i) => { if (confirm('Remove this brand?')) { actions.patch('brands', bs => bs.filter((_, idx) => idx !== i)); pushToast('Brand removed'); } };

  return (
    <div>
      <AdminPageHeader
        title="Brands"
        subtitle={`${state.brands.length} brands on the shelf`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => setAdding({ name: '', em: '' })}>Add brand</AdminUI.Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {state.brands.map((b, i) => (
          <div key={i} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#1F2F4A' }}>{b.em}</div>
              <button onClick={() => removeBrand(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#8B8176', padding: 4 }}><AdminUI.Icon name="trash" size={14} /></button>
            </div>
            <AdminUI.Input full value={b.name} onChange={(v) => updateBrand(i, { name: v })} />
            <div style={{ fontSize: 11, color: '#8B8176', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{state.products.filter(p => p.brand === b.name).length} products</div>
          </div>
        ))}
      </div>

      <AdminUI.Modal open={!!adding} onClose={() => setAdding(null)} title="Add brand"
        actions={<>
          <AdminUI.Button kind="ghost" onClick={() => setAdding(null)}>Cancel</AdminUI.Button>
          <AdminUI.Button kind="primary" onClick={() => { if (adding?.name) { actions.patch('brands', bs => [...bs, adding]); pushToast('Brand added'); setAdding(null); } }}>Add</AdminUI.Button>
        </>}
      >
        {adding && <>
          <AdminUI.Field label="Brand name"><AdminUI.Input full value={adding.name} onChange={(v) => setAdding({ ...adding, name: v, em: v.slice(0, 2) })} /></AdminUI.Field>
          <AdminUI.Field label="Short tag (2 chars)"><AdminUI.Input full value={adding.em} onChange={(v) => setAdding({ ...adding, em: v })} /></AdminUI.Field>
        </>}
      </AdminUI.Modal>
    </div>
  );
}

/* ---- Categories ---- */
function AdminCategories() {
  const { state, actions, pushToast } = useAdmin();

  const rows = [];
  const walk = (nodes, depth = 0) => {
    for (const n of nodes || []) {
      rows.push({ ...n, depth, childCount: n.children?.length || 0 });
      if (n.children) walk(n.children, depth + 1);
    }
  };
  walk(state.categories);

  const toggleVisible = (id) => {
    actions.patch('categories', cats => {
      const walk = (ns) => ns.map(n => n.id === id ? { ...n, hidden: !n.hidden } : { ...n, children: n.children ? walk(n.children) : n.children });
      return walk(cats);
    });
  };

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle={`${rows.length} categories across ${state.categories.length} top-level`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => pushToast('Add category (demo)')}>Add category</AdminUI.Button>}
      />

      <AdminUI.Card padding={0}>
        <div style={{ padding: 0 }}>
          {rows.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 18px', paddingLeft: 18 + r.depth * 22,
              borderBottom: '1px solid #F4EEE3',
            }}>
              <AdminUI.Icon name="grip" size={14} color="#A89E92" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: r.depth === 0 ? 600 : 500 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', marginTop: 2 }}>/cat/{r.slug}{r.childCount > 0 ? ' · ' + r.childCount + ' children' : ''}</div>
              </div>
              {r.tag && <AdminUI.Pill kind="brand" size="sm">{r.tag}</AdminUI.Pill>}
              <span style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{state.products.filter(p => p.cat === r.slug || p.sub === r.id).length} products</span>
              <AdminUI.Toggle on={!r.hidden} onChange={() => toggleVisible(r.id)} />
              <AdminUI.Button size="sm" kind="ghost" icon="edit" onClick={() => pushToast('Edit category (demo)')}></AdminUI.Button>
            </div>
          ))}
        </div>
      </AdminUI.Card>
    </div>
  );
}

window.AdminCustomers = AdminCustomers;
window.AdminReviews = AdminReviews;
window.AdminCoupons = AdminCoupons;
window.AdminBrands = AdminBrands;
window.AdminCategories = AdminCategories;
