/* Orders: list + detail + fulfillment */

function AdminOrders() {
  const { state, actions, navigateAdmin, route, pushToast } = useAdmin();
  const parts = route.split('/');
  const subId = parts[1];

  if (subId) {
    const order = state.orders.find(o => o.id === subId);
    if (!order) return <AdminUI.Empty title="Order not found" body="This order may have been deleted." icon="orders" action={<AdminUI.Button onClick={() => navigateAdmin('orders')}>Back</AdminUI.Button>} />;
    return <OrderDetail order={order} />;
  }

  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState([]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'packed', label: 'Packed' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'returned', label: 'Returned' },
  ];

  const filtered = state.orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => !search || o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()) || o.phone.includes(search));

  const statusPill = (s) => {
    const m = { new: 'warn', confirmed: 'info', packed: 'info', shipped: 'info', delivered: 'ok', cancelled: 'muted', returned: 'danger' };
    return <AdminUI.Pill kind={m[s] || 'muted'}>{s}</AdminUI.Pill>;
  };
  const payPill = (o) => {
    const label = o.paymentMethod.toUpperCase();
    const kind = o.paymentStatus === 'paid' || o.paymentStatus === 'collected' ? 'ok' : 'warn';
    return <AdminUI.Pill kind={kind} size="sm">{label} · {o.paymentStatus}</AdminUI.Pill>;
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${state.orders.length} total orders`}
        actions={
          <>
            <AdminUI.Button size="sm" icon="download" onClick={() => pushToast('Orders exported to CSV')}>Export</AdminUI.Button>
            <AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => pushToast('Create manual order (not in demo)')}>Create order</AdminUI.Button>
          </>
        }
      />

      <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid #E8DFD2' }}>
        {tabs.map(t => {
          const n = t.id === 'all' ? state.orders.length : state.orders.filter(o => o.status === t.id).length;
          return (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              background: 'transparent', border: 0, padding: '9px 14px',
              fontSize: 13, color: filter === t.id ? '#EC5D4A' : '#6B625A', cursor: 'pointer',
              fontWeight: filter === t.id ? 600 : 400,
              borderBottom: filter === t.id ? '2px solid #EC5D4A' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'inherit',
            }}>{t.label} <span style={{ color: '#A89E92', fontFamily: 'var(--font-mono)', marginLeft: 3, fontSize: 11 }}>({n})</span></button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <AdminUI.Input full icon="search" placeholder="Search order ID, customer name, phone…" value={search} onChange={setSearch} />
        {selected.length > 0 && (
          <>
            <span style={{ fontSize: 12, color: '#8B8176' }}>{selected.length} selected</span>
            <AdminUI.Button size="sm" onClick={() => { pushToast(`${selected.length} orders marked packed`); setSelected([]); }}>Mark packed</AdminUI.Button>
            <AdminUI.Button size="sm" onClick={() => { pushToast(`${selected.length} labels printed`); setSelected([]); }}>Print labels</AdminUI.Button>
          </>
        )}
      </div>

      <AdminUI.Card padding={0}>
        <AdminUI.Table
          selected={selected}
          onSelect={setSelected}
          onRow={(r) => navigateAdmin('orders/' + r.id)}
          empty="No orders match your filters."
          columns={[
            { label: 'Order', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.id}</span>, width: 100 },
            { label: 'Customer', render: (r) => (
              <div>
                <div style={{ fontWeight: 500 }}>{r.customer}</div>
                <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{r.phone}</div>
              </div>
            ) },
            { label: 'Date', render: (r) => (
              <div style={{ fontSize: 12 }}>
                <div>{AdminUI.fmtDate(r.date)}</div>
                <div style={{ fontSize: 10, color: '#8B8176' }}>{AdminUI.relTime(r.date)}</div>
              </div>
            ), width: 110 },
            { label: 'Items', render: (r) => r.lines.reduce((s, l) => s + l.qty, 0), width: 70, align: 'center' },
            { label: 'Total', render: (r) => <span style={{ fontWeight: 600 }}>{AdminUI.fmtBDT(r.total)}</span>, width: 110, align: 'right' },
            { label: 'Payment', render: (r) => payPill(r), width: 180 },
            { label: 'Status', render: (r) => statusPill(r.status), width: 120 },
            { label: '', render: (r) => <AdminUI.Icon name="chevR" size={14} color="#A89E92" />, width: 30, align: 'center' },
          ]}
          rows={filtered}
        />
      </AdminUI.Card>
    </div>
  );
}

function OrderDetail({ order }) {
  const { state, actions, navigateAdmin, pushToast } = useAdmin();
  const [tab, setTab] = React.useState('items');
  const [refundOpen, setRefundOpen] = React.useState(false);

  const product = (id) => state.products.find(p => p.id === id);

  const steps = ['new', 'confirmed', 'packed', 'shipped', 'delivered'];
  const idx = steps.indexOf(order.status);

  const advance = () => {
    if (idx < steps.length - 1) {
      actions.advanceOrder(order.id, steps[idx + 1]);
      pushToast(`Order advanced to ${steps[idx + 1]}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <AdminUI.Button size="sm" kind="ghost" icon="chevL" onClick={() => navigateAdmin('orders')}>Orders</AdminUI.Button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Order <span style={{ fontFamily: 'var(--font-mono)' }}>{order.id}</span></h1>
          <div style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>Placed {AdminUI.fmtDateTime(order.date)}</div>
        </div>
        <AdminUI.Pill kind={order.status === 'new' ? 'warn' : order.status === 'delivered' ? 'ok' : 'info'}>{order.status}</AdminUI.Pill>
      </div>

      {/* Progress tracker */}
      <AdminUI.Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {steps.map((s, i) => {
            const done = i <= idx;
            return (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: i === 0 || i === steps.length - 1 ? '0 0 auto' : 1 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: done ? '#EC5D4A' : '#F5F1EA',
                    color: done ? '#FFF' : '#A89E92',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    border: done ? 'none' : '1px solid #E8DFD2',
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 11, color: done ? '#2A2420' : '#8B8176', fontWeight: done ? 600 : 400, textTransform: 'capitalize' }}>{s}</div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < idx ? '#EC5D4A' : '#E8DFD2', margin: '0 8px', marginBottom: 20 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #F1EBE0', display: 'flex', gap: 8 }}>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <AdminUI.Button kind="primary" icon="arrow" onClick={advance}>
              Advance to {steps[idx + 1]}
            </AdminUI.Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <AdminUI.Button kind="danger" onClick={() => { if (confirm('Cancel this order?')) { actions.advanceOrder(order.id, 'cancelled'); pushToast('Order cancelled'); } }}>Cancel</AdminUI.Button>
          )}
          <AdminUI.Button kind="default" onClick={() => setRefundOpen(true)}>Refund / Return</AdminUI.Button>
          <AdminUI.Button kind="ghost" icon="download" onClick={() => pushToast('Invoice downloaded')}>Invoice</AdminUI.Button>
          <AdminUI.Button kind="ghost" icon="external" onClick={() => pushToast('Shipping label printed')}>Shipping label</AdminUI.Button>
        </div>
      </AdminUI.Card>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <AdminUI.Card title="Items" padding={0}>
            {order.lines.map((l, i) => {
              const p = product(l.id);
              if (!p) return null;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid #F4EEE3' }}>
                  <AdminUI.ProductSwatch product={p} size={46} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{p.sku} · {p.brand}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B625A' }}>× {l.qty}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, minWidth: 90, textAlign: 'right' }}>{AdminUI.fmtBDT(p.price * l.qty)}</div>
                </div>
              );
            })}
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span style={{ color: '#8B8176' }}>Subtotal</span><span>{AdminUI.fmtBDT(order.subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span style={{ color: '#8B8176' }}>Shipping</span><span>{order.shipping === 0 ? 'Free' : AdminUI.fmtBDT(order.shipping)}</span></div>
              {order.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}><span style={{ color: '#8B8176' }}>Discount</span><span style={{ color: '#24603C' }}>−{AdminUI.fmtBDT(order.discount)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1EBE0' }}><span>Total</span><span>{AdminUI.fmtBDT(order.total)}</span></div>
            </div>
          </AdminUI.Card>

          <div style={{ marginTop: 16 }}>
            <AdminUI.Card title="Internal notes">
              <AdminUI.Textarea value={order.note} onChange={(v) => actions.updateOrder(order.id, { note: v })} rows={3} placeholder="Add an internal note visible only to staff…" />
            </AdminUI.Card>
          </div>
        </div>

        <div>
          <AdminUI.Card title="Customer">
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{order.customer}</div>
            <div style={{ fontSize: 12, color: '#6B625A', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>{order.phone}</div>
            <div style={{ fontSize: 12, color: '#6B625A', fontFamily: 'var(--font-mono)' }}>{order.email}</div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1EBE0', fontSize: 12, color: '#3D342A' }}>{order.address}</div>
          </AdminUI.Card>

          <div style={{ marginTop: 16 }}>
            <AdminUI.Card title="Payment">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#8B8176' }}>Method</span>
                <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8B8176' }}>Status</span>
                <AdminUI.Pill kind={order.paymentStatus === 'paid' || order.paymentStatus === 'collected' ? 'ok' : 'warn'}>{order.paymentStatus}</AdminUI.Pill>
              </div>
              {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                <AdminUI.Button full style={{ marginTop: 12 }} icon="check" onClick={() => { actions.updateOrder(order.id, { paymentStatus: 'collected' }); pushToast('COD marked collected'); }}>Mark COD collected</AdminUI.Button>
              )}
            </AdminUI.Card>
          </div>

          <div style={{ marginTop: 16 }}>
            <AdminUI.Card title="Fulfillment">
              <AdminUI.Field label="Courier">
                <AdminUI.Select full value={order.courier || ''} options={[{ value: '', label: '— none —' }, ...state.couriers.map(c => ({ value: c.name, label: c.name }))]} onChange={(v) => actions.updateOrder(order.id, { courier: v || null })} />
              </AdminUI.Field>
              <AdminUI.Field label="Tracking number">
                <AdminUI.Input full value={order.trackingNo || ''} onChange={(v) => actions.updateOrder(order.id, { trackingNo: v })} placeholder="Enter AWB / tracking #" />
              </AdminUI.Field>
              <AdminUI.Field label="Delivery area">
                <AdminUI.Input full value={order.area} onChange={(v) => actions.updateOrder(order.id, { area: v })} />
              </AdminUI.Field>
            </AdminUI.Card>
          </div>
        </div>
      </div>

      <AdminUI.Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Issue refund"
        actions={<>
          <AdminUI.Button kind="ghost" onClick={() => setRefundOpen(false)}>Cancel</AdminUI.Button>
          <AdminUI.Button kind="primary" onClick={() => { actions.advanceOrder(order.id, 'returned'); pushToast(`${AdminUI.fmtBDT(order.total)} refunded via ${order.paymentMethod.toUpperCase()}`); setRefundOpen(false); }}>Refund {AdminUI.fmtBDT(order.total)}</AdminUI.Button>
        </>}
      >
        <AdminUI.Field label="Refund amount"><AdminUI.Input full value={order.total} suffix="BDT" /></AdminUI.Field>
        <AdminUI.Field label="Refund to"><AdminUI.Select full value={order.paymentMethod} options={['bkash', 'nagad', 'card', 'bank_transfer']} /></AdminUI.Field>
        <AdminUI.Field label="Reason"><AdminUI.Select full value="damaged" options={[{ value: 'damaged', label: 'Damaged in transit' }, { value: 'wrong', label: 'Wrong item received' }, { value: 'quality', label: 'Quality issue' }, { value: 'cust', label: 'Customer request' }]} /></AdminUI.Field>
        <AdminUI.Field label="Notes to customer"><AdminUI.Textarea placeholder="An optional message to the customer…" /></AdminUI.Field>
      </AdminUI.Modal>
    </div>
  );
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: '#8B8176', marginTop: 4 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  );
}

window.AdminOrders = AdminOrders;
window.AdminPageHeader = PageHeader;
