/* Inventory, Shipping/Couriers, Payments, Reports, Audit log, Media, Settings */

function AdminInventory() {
  const { state, actions, pushToast } = useAdmin();
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const filtered = state.products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase()))
    .filter(p => filter === 'all' || (filter === 'low' && p.stock < 8 && p.stock > 0) || (filter === 'out' && p.stock === 0));

  const totalUnits = state.products.reduce((s, p) => s + p.stock, 0);
  const totalValue = state.products.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <div>
      <AdminPageHeader title="Inventory" subtitle={`${totalUnits.toLocaleString()} units · ${AdminUI.fmtBDT(totalValue)} on-hand value`}
        actions={<>
          <AdminUI.Button size="sm" icon="upload" onClick={() => pushToast('Stock adjustment CSV uploaded')}>Import counts</AdminUI.Button>
          <AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => pushToast('Stock transfer created')}>New transfer</AdminUI.Button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <AdminUI.Kpi label="Total SKUs" value={state.products.length} />
        <AdminUI.Kpi label="Units on hand" value={totalUnits.toLocaleString()} />
        <AdminUI.Kpi label="Low stock" value={state.products.filter(p => p.stock < 8 && p.stock > 0).length} accent="#F5C443" />
        <AdminUI.Kpi label="Out of stock" value={state.products.filter(p => p.stock === 0).length} accent="#EC5D4A" />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <AdminUI.Input icon="search" placeholder="Search SKU or name…" value={search} onChange={setSearch} style={{ flex: 1 }} />
        <AdminUI.Select value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }]} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <AdminUI.Card padding={0}>
          <AdminUI.Table
            columns={[
              { label: 'Product', render: (p) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AdminUI.ProductSwatch product={p} size={32} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{p.sku}</div>
                  </div>
                </div>
              ) },
              { label: 'Category', key: 'cat', width: 100 },
              { label: 'On hand', render: (p) => (
                <AdminUI.Input type="number" value={p.stock} onChange={(v) => actions.updateProduct(p.id, { stock: +v })} style={{ width: 80, textAlign: 'center' }} />
              ), width: 100, align: 'center' },
              { label: 'Value', render: (p) => AdminUI.fmtBDT(p.stock * p.price), width: 110, align: 'right' },
              { label: 'Status', render: (p) => <AdminUI.Pill kind={p.stock === 0 ? 'danger' : p.stock < 8 ? 'warn' : 'ok'} size="sm">{p.stock === 0 ? 'Out' : p.stock < 8 ? 'Low' : 'OK'}</AdminUI.Pill>, width: 90 },
              { label: '', render: (p) => <AdminUI.Button size="sm" kind="ghost" onClick={() => { actions.updateProduct(p.id, { stock: p.stock + 10 }); pushToast(`+10 units to ${p.sku}`); }}>Restock</AdminUI.Button>, width: 90 },
            ]}
            rows={filtered}
          />
        </AdminUI.Card>

        <AdminUI.Card title="Stock transfers" padding={0}>
          {state.stockTransfers.map(t => (
            <div key={t.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{t.id.toUpperCase()}</div>
                <AdminUI.Pill kind={t.status === 'completed' || t.status === 'received' ? 'ok' : t.status === 'in_transit' ? 'info' : 'muted'} size="sm">{t.status.replace('_', ' ')}</AdminUI.Pill>
              </div>
              <div style={{ fontSize: 12, color: '#3D342A', marginBottom: 2 }}>{t.from} → {t.to}</div>
              <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{t.items} items · {t.units} units · {t.date}</div>
            </div>
          ))}
        </AdminUI.Card>
      </div>
    </div>
  );
}

/* ---- Shipping zones + couriers ---- */
function AdminShipping() {
  const { state, actions, pushToast } = useAdmin();

  return (
    <div>
      <AdminPageHeader title="Shipping" subtitle="Zones, rates, and courier integrations" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AdminUI.Card title="Zones & rates" padding={0}>
          {state.shippingZones.map(z => (
            <div key={z.id} style={{ padding: '14px 18px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontWeight: 600 }}>{z.name}{z.default && <AdminUI.Pill kind="muted" size="sm" style={{ marginLeft: 8 }}>default</AdminUI.Pill>}</div>
                <AdminUI.Pill kind="muted" size="sm">{z.areas.length} area{z.areas.length === 1 ? '' : 's'}</AdminUI.Pill>
              </div>
              <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 10, fontFamily: 'var(--font-mono)' }}>{z.areas.join(', ')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <AdminUI.Field label="Flat rate (৳)"><AdminUI.Input full type="number" value={z.flat} onChange={(v) => actions.updateZone(z.id, { flat: +v })} /></AdminUI.Field>
                <AdminUI.Field label="Free over (৳)"><AdminUI.Input full type="number" value={z.freeOver} onChange={(v) => actions.updateZone(z.id, { freeOver: +v })} /></AdminUI.Field>
                <AdminUI.Field label="ETA (days)"><AdminUI.Input full value={z.etaDays} onChange={(v) => actions.updateZone(z.id, { etaDays: v })} /></AdminUI.Field>
              </div>
            </div>
          ))}
          <div style={{ padding: 14 }}>
            <AdminUI.Button size="sm" kind="ghost" icon="plus" onClick={() => pushToast('Zone added (demo)')}>Add zone</AdminUI.Button>
          </div>
        </AdminUI.Card>

        <AdminUI.Card title="Courier integrations" padding={0}>
          {state.couriers.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#1F2F4A', fontSize: 11 }}>{c.name.slice(0, 2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {c.enabled ? 'key ' + (c.apiKey || '—') : 'not connected'} · base ৳{c.baseRate} · zones {c.zones.join(', ')}
                </div>
              </div>
              <AdminUI.Toggle on={c.enabled} onChange={() => actions.updateCourier(c.id, { enabled: !c.enabled })} label={c.enabled ? 'Connected' : 'Connect'} />
              {c.enabled && <AdminUI.Button size="sm" kind="ghost" onClick={() => pushToast('Courier settings (demo)')}>Configure</AdminUI.Button>}
            </div>
          ))}
        </AdminUI.Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <AdminUI.Card title="Label printing & packing">
          <div style={{ fontSize: 13, color: '#3D342A', marginBottom: 14 }}>Default label format, printer, and pack slip template.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <AdminUI.Field label="Label size"><AdminUI.Select full options={['4×6 thermal', 'A4 (4 per sheet)', 'A5 adhesive']} value="4×6 thermal" /></AdminUI.Field>
            <AdminUI.Field label="Printer"><AdminUI.Select full options={['Xprinter XP-420B', 'TSC TE244', 'System default']} value="Xprinter XP-420B" /></AdminUI.Field>
            <AdminUI.Field label="Include pack slip"><AdminUI.Toggle on={true} onChange={() => {}} label="Yes" /></AdminUI.Field>
          </div>
        </AdminUI.Card>
      </div>
    </div>
  );
}

/* ---- Payments ---- */
function AdminPayments() {
  const { state, actions, pushToast } = useAdmin();

  const codPending = state.orders.filter(o => o.paymentMethod === 'cod' && o.paymentStatus === 'pending');
  const codTotal = codPending.reduce((s, o) => s + o.total, 0);
  const methodColors = { bkash: '#E2136E', nagad: '#F39436', card: '#1F2F4A', cod: '#5A5048' };

  return (
    <div>
      <AdminPageHeader title="Payments" subtitle="Methods, reconciliation, payouts" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <AdminUI.Kpi label="COD outstanding" value={AdminUI.fmtBDT(codTotal)} accent="#EC5D4A" />
        <AdminUI.Kpi label="bKash (30d)" value={AdminUI.fmtBDT(state.orders.filter(o => o.paymentMethod === 'bkash').reduce((s, o) => s + o.total, 0))} accent="#E2136E" />
        <AdminUI.Kpi label="Nagad (30d)" value={AdminUI.fmtBDT(state.orders.filter(o => o.paymentMethod === 'nagad').reduce((s, o) => s + o.total, 0))} accent="#F39436" />
        <AdminUI.Kpi label="Card (30d)" value={AdminUI.fmtBDT(state.orders.filter(o => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0))} accent="#1F2F4A" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <AdminUI.Card title="Payment methods" padding={0}>
          {state.payments.methods.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: methodColors[m.id] || '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 700, fontSize: 11 }}>{m.id.toUpperCase().slice(0, 4)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {m.description} · fee {m.fee} · settles {m.settlement}{m.merchantNo ? ' · ' + m.merchantNo : ''}
                </div>
              </div>
              <AdminUI.Toggle on={m.enabled} onChange={() => actions.updatePaymentMethod(m.id, { enabled: !m.enabled })} />
            </div>
          ))}
        </AdminUI.Card>

        <AdminUI.Card title="COD reconciliation" subtitle={`${codPending.length} pending collection`} padding={0}>
          {codPending.slice(0, 6).map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{o.id}</div>
                <div style={{ fontSize: 11, color: '#8B8176' }}>{o.customer} · {o.area}</div>
              </div>
              <div style={{ fontWeight: 600 }}>{AdminUI.fmtBDT(o.total)}</div>
              <AdminUI.Button size="sm" kind="primary" onClick={() => { actions.updateOrder(o.id, { paymentStatus: 'collected' }); pushToast(`${AdminUI.fmtBDT(o.total)} collected from ${o.customer}`); }}>Mark paid</AdminUI.Button>
            </div>
          ))}
          {codPending.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#8B8176', fontSize: 13 }}>All COD orders reconciled. Nice work.</div>}
        </AdminUI.Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <AdminUI.Card title="Daily reconciliation log" padding={0}>
          <AdminUI.Table
            columns={[
              { label: 'Date', key: 'date', width: 120 },
              { label: 'Method', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{r.method}</span>, width: 100 },
              { label: 'Txns', key: 'txns', width: 70, align: 'center' },
              { label: 'Expected', render: (r) => AdminUI.fmtBDT(r.expected), width: 130, align: 'right' },
              { label: 'Received', render: (r) => AdminUI.fmtBDT(r.received), width: 130, align: 'right' },
              { label: 'Delta', render: (r) => {
                const d = r.received - r.expected;
                return <span style={{ color: d < 0 ? '#9B2914' : '#24603C', fontWeight: 600 }}>{d === 0 ? '—' : (d < 0 ? '' : '+') + AdminUI.fmtBDT(d)}</span>;
              }, width: 120, align: 'right' },
              { label: 'Status', render: (r) => <AdminUI.Pill kind={r.status === 'reconciled' ? 'ok' : 'warn'} size="sm">{r.status}</AdminUI.Pill>, width: 110 },
              { label: 'Note', render: (r) => <span style={{ fontSize: 12, color: '#6B625A' }}>{r.note || ''}</span> },
            ]}
            rows={state.payments.reconciliation}
          />
        </AdminUI.Card>
      </div>
    </div>
  );
}

/* ---- Reports ---- */
function AdminReports() {
  const { state, pushToast } = useAdmin();

  const salesByCategory = Object.entries(state.products.reduce((acc, p) => {
    acc[p.cat] = (acc[p.cat] || 0) + p.price * p.reviews;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...salesByCategory.map(([, v]) => v), 1);

  return (
    <div>
      <AdminPageHeader title="Reports" subtitle="Sales, inventory, customers, marketing"
        actions={<AdminUI.Button size="sm" icon="download" onClick={() => pushToast('Report exported')}>Export all</AdminUI.Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Sales report', desc: 'Revenue, orders, AOV by day' },
          { label: 'Product performance', desc: 'Units, revenue, returns by SKU' },
          { label: 'Customer cohorts', desc: 'Retention & repeat-rate' },
          { label: 'Inventory valuation', desc: 'On-hand × unit cost' },
          { label: 'Coupon usage', desc: 'Redemptions & discount cost' },
          { label: 'Courier performance', desc: 'On-time %, returns by courier' },
        ].map((r, i) => (
          <div key={i} onClick={() => pushToast(`Generating ${r.label}…`)} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 10, padding: 16, cursor: 'pointer' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: '#8B8176' }}>{r.desc}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#EC5D4A', fontWeight: 600 }}>Run report →</div>
          </div>
        ))}
      </div>

      <AdminUI.Card title="Sales by category (proxy: price × reviews)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {salesByCategory.map(([cat, val]) => (
            <div key={cat}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{cat}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#6B625A' }}>{AdminUI.fmtBDT(val)}</span>
              </div>
              <div style={{ height: 8, background: '#F5F1EA', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: (val / max * 100) + '%', height: '100%', background: '#EC5D4A', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </AdminUI.Card>
    </div>
  );
}

/* ---- Audit log ---- */
function AdminAuditLog() {
  const { state } = useAdmin();
  return (
    <div>
      <AdminPageHeader title="Audit log" subtitle={`${state.auditLog.length} events recorded`} />
      <AdminUI.Card padding={0}>
        <div style={{ maxHeight: 640, overflowY: 'auto' }}>
          {state.auditLog.map((e) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 18px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F5F1EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1F2F4A' }}>{e.who.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>
                  <b>{e.who}</b>{' '}
                  <span style={{ color: '#6B625A' }}>{e.action.toLowerCase()}</span>{' — '}
                  <span style={{ color: '#3D342A', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{e.detail}</span>
                </div>
                <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{AdminUI.fmtDateTime ? AdminUI.fmtDateTime(e.at) : new Date(e.at).toLocaleString()} · {AdminUI.relTime(e.at)}</div>
              </div>
            </div>
          ))}
        </div>
      </AdminUI.Card>
    </div>
  );
}

/* ---- Media library ---- */
function AdminMedia() {
  const { state, pushToast } = useAdmin();
  const [tab, setTab] = React.useState('all');
  const filtered = tab === 'all' ? state.media : state.media.filter(m => m.tag === tab);

  return (
    <div>
      <AdminPageHeader title="Media library"
        subtitle={`${state.media.length} files · ${(state.media.reduce((s, m) => s + m.size, 0) / 1048576).toFixed(1)} MB used of 5 GB`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="upload" onClick={() => pushToast('Upload opened (demo)')}>Upload</AdminUI.Button>}
      />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['all', 'product', 'banner'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? '#1F2F4A' : '#FFF', color: tab === t ? '#FFF' : '#3D342A',
            border: '1px solid #E8DFD2', padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
            fontSize: 12, fontWeight: 500, textTransform: 'capitalize', fontFamily: 'inherit',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {filtered.map(m => (
          <div key={m.id} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{ aspectRatio: '1', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,.3)', fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.tag === 'banner' ? 'B' : 'P'}</div>
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#3D342A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
              <div style={{ fontSize: 10, color: '#8B8176', marginTop: 2 }}>{(m.size / 1024).toFixed(0)} KB · {AdminUI.relTime(m.uploaded)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Settings ---- */
function AdminSettings() {
  const { state, actions, pushToast } = useAdmin();
  const [tab, setTab] = React.useState('store');
  const tabs = [
    { id: 'store', label: 'Store info' },
    { id: 'tax', label: 'Taxes & currency' },
    { id: 'social', label: 'Social links' },
    { id: 'seo', label: 'SEO' },
    { id: 'policies', label: 'Policies' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'danger', label: 'Danger zone' },
  ];

  const s = state.settings;

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Store configuration" />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? '#FEE8E4' : 'transparent', border: 0, padding: '9px 12px', borderRadius: 6,
              fontSize: 13, fontWeight: 500, textAlign: 'left', cursor: 'pointer',
              color: tab === t.id ? '#B8432E' : '#3D342A', fontFamily: 'inherit',
            }}>{t.label}</button>
          ))}
        </div>
        <div>
          {tab === 'store' && (
            <AdminUI.Card title="Store information">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <AdminUI.Field label="Store name"><AdminUI.Input full value={s.store.name} onChange={(v) => actions.updateSettings('store.name', v)} /></AdminUI.Field>
                <AdminUI.Field label="Tagline"><AdminUI.Input full value={s.store.tagline} onChange={(v) => actions.updateSettings('store.tagline', v)} /></AdminUI.Field>
                <AdminUI.Field label="Support email"><AdminUI.Input full value={s.store.email} onChange={(v) => actions.updateSettings('store.email', v)} /></AdminUI.Field>
                <AdminUI.Field label="Hotline"><AdminUI.Input full value={s.store.phone} onChange={(v) => actions.updateSettings('store.phone', v)} /></AdminUI.Field>
              </div>
              <AdminUI.Field label="Address" full><AdminUI.Textarea value={s.store.address} onChange={(v) => actions.updateSettings('store.address', v)} rows={2} /></AdminUI.Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <AdminUI.Field label="Logo text"><AdminUI.Input full value={s.store.logoText} onChange={(v) => actions.updateSettings('store.logoText', v)} /></AdminUI.Field>
                <AdminUI.Field label="Timezone"><AdminUI.Input full value={s.store.timezone} onChange={(v) => actions.updateSettings('store.timezone', v)} /></AdminUI.Field>
              </div>
            </AdminUI.Card>
          )}
          {tab === 'tax' && (
            <AdminUI.Card title="Taxes & currency">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <AdminUI.Field label="Currency"><AdminUI.Select full value={s.locale.currency} onChange={(v) => actions.updateSettings('locale.currency', v)} options={['BDT', 'USD', 'INR']} /></AdminUI.Field>
                <AdminUI.Field label="Currency symbol"><AdminUI.Input full value={s.locale.currencySymbol} onChange={(v) => actions.updateSettings('locale.currencySymbol', v)} /></AdminUI.Field>
                <AdminUI.Field label="Default language"><AdminUI.Select full value={s.locale.defaultLanguage} onChange={(v) => actions.updateSettings('locale.defaultLanguage', v)} options={s.locale.languages} /></AdminUI.Field>
                <AdminUI.Field label="Languages enabled"><AdminUI.Input full value={s.locale.languages.join(', ')} /></AdminUI.Field>
                <AdminUI.Field label="VAT rate (%)"><AdminUI.Input full type="number" value={s.tax.vatRate} onChange={(v) => actions.updateSettings('tax.vatRate', +v)} /></AdminUI.Field>
                <AdminUI.Field label="VAT number"><AdminUI.Input full value={s.tax.vatNumber} onChange={(v) => actions.updateSettings('tax.vatNumber', v)} /></AdminUI.Field>
                <AdminUI.Field label="Prices include VAT"><AdminUI.Toggle on={s.tax.vatInclusive} onChange={(on) => actions.updateSettings('tax.vatInclusive', on)} label={s.tax.vatInclusive ? 'Yes' : 'No'} /></AdminUI.Field>
                <AdminUI.Field label="VAT enabled"><AdminUI.Toggle on={s.tax.vatEnabled} onChange={(on) => actions.updateSettings('tax.vatEnabled', on)} label={s.tax.vatEnabled ? 'On' : 'Off'} /></AdminUI.Field>
              </div>
            </AdminUI.Card>
          )}
          {tab === 'social' && (
            <AdminUI.Card title="Social links">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <AdminUI.Field label="Facebook"><AdminUI.Input full value={s.social.facebook} onChange={(v) => actions.updateSettings('social.facebook', v)} /></AdminUI.Field>
                <AdminUI.Field label="Instagram"><AdminUI.Input full value={s.social.instagram} onChange={(v) => actions.updateSettings('social.instagram', v)} /></AdminUI.Field>
                <AdminUI.Field label="YouTube"><AdminUI.Input full value={s.social.youtube} onChange={(v) => actions.updateSettings('social.youtube', v)} /></AdminUI.Field>
                <AdminUI.Field label="TikTok"><AdminUI.Input full value={s.social.tiktok} onChange={(v) => actions.updateSettings('social.tiktok', v)} /></AdminUI.Field>
                <AdminUI.Field label="WhatsApp"><AdminUI.Input full value={s.social.whatsapp} onChange={(v) => actions.updateSettings('social.whatsapp', v)} /></AdminUI.Field>
              </div>
            </AdminUI.Card>
          )}
          {tab === 'seo' && (
            <AdminUI.Card title="SEO">
              <AdminUI.Field label="Meta title" full><AdminUI.Input full value={s.seo.title} onChange={(v) => actions.updateSettings('seo.title', v)} /></AdminUI.Field>
              <AdminUI.Field label="Meta description" full><AdminUI.Textarea rows={2} value={s.seo.description} onChange={(v) => actions.updateSettings('seo.description', v)} /></AdminUI.Field>
              <AdminUI.Field label="Keywords" full><AdminUI.Input full value={s.seo.keywords} onChange={(v) => actions.updateSettings('seo.keywords', v)} /></AdminUI.Field>
            </AdminUI.Card>
          )}
          {tab === 'policies' && (
            <AdminUI.Card title="Policies">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <AdminUI.Field label="Return days"><AdminUI.Input full type="number" value={s.policies.returnDays} onChange={(v) => actions.updateSettings('policies.returnDays', +v)} /></AdminUI.Field>
                <AdminUI.Field label="Free shipping over (৳)"><AdminUI.Input full type="number" value={s.policies.freeShippingOver} onChange={(v) => actions.updateSettings('policies.freeShippingOver', +v)} /></AdminUI.Field>
                <AdminUI.Field label="COD handling (৳)"><AdminUI.Input full type="number" value={s.policies.codChargeBdt} onChange={(v) => actions.updateSettings('policies.codChargeBdt', +v)} /></AdminUI.Field>
              </div>
            </AdminUI.Card>
          )}
          {tab === 'notifications' && (
            <AdminUI.Card title="Notifications">
              {['New order placed', 'Low stock (< 8)', 'Review needs approval', 'COD delivery failed', 'Daily sales summary'].map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1EBE0' }}>
                  <span style={{ fontSize: 13 }}>{n}</span>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8B8176' }}>
                    <label><input type="checkbox" defaultChecked /> Email</label>
                    <label><input type="checkbox" defaultChecked={i < 3} /> Push</label>
                    <label><input type="checkbox" defaultChecked={i === 0 || i === 3} /> SMS</label>
                  </div>
                </div>
              ))}
            </AdminUI.Card>
          )}
          {tab === 'danger' && (
            <AdminUI.Card title="Danger zone">
              <div style={{ padding: 14, background: '#FEE8E4', borderRadius: 8, border: '1px solid #F7C7BE' }}>
                <div style={{ fontWeight: 600, color: '#B8432E', marginBottom: 6 }}>Reset demo data</div>
                <div style={{ fontSize: 12, color: '#6B625A', marginBottom: 10 }}>Clear all edits and restore seeded products, orders, customers, content. Cannot be undone.</div>
                <AdminUI.Button kind="danger" onClick={actions.resetAll}>Reset everything</AdminUI.Button>
              </div>
            </AdminUI.Card>
          )}
        </div>
      </div>
    </div>
  );
}

window.AdminInventory = AdminInventory;
window.AdminShipping = AdminShipping;
window.AdminPayments = AdminPayments;
window.AdminReports = AdminReports;
window.AdminAuditLog = AdminAuditLog;
window.AdminMedia = AdminMedia;
window.AdminSettings = AdminSettings;
