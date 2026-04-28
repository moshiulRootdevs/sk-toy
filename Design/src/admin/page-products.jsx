/* Products: list, create/edit, variants, inventory */

function AdminProducts() {
  const { state, actions, navigateAdmin, route, pushToast } = useAdmin();
  const parts = route.split('/');
  const subId = parts[1];

  if (subId === 'new') return <ProductEditor product={null} />;
  if (subId) {
    const p = state.products.find(x => x.id === subId);
    if (!p) return <AdminUI.Empty title="Product not found" icon="products" action={<AdminUI.Button onClick={() => navigateAdmin('products')}>Back</AdminUI.Button>} />;
    return <ProductEditor product={p} />;
  }

  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [stockFilter, setStockFilter] = React.useState('all');
  const [selected, setSelected] = React.useState([]);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const cats = ['all', ...new Set(state.products.map(p => p.cat))];

  const filtered = state.products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    .filter(p => cat === 'all' || p.cat === cat)
    .filter(p => stockFilter === 'all' || (stockFilter === 'low' && p.stock < 8) || (stockFilter === 'out' && p.stock === 0) || (stockFilter === 'ok' && p.stock >= 8));

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle={`${state.products.length} products · ${state.products.filter(p => p.stock < 8).length} low stock`}
        actions={<>
          <AdminUI.Button size="sm" icon="upload" onClick={() => pushToast('Import from CSV (demo)')}>Import</AdminUI.Button>
          <AdminUI.Button size="sm" icon="download" onClick={() => pushToast('Products exported')}>Export</AdminUI.Button>
          <AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => navigateAdmin('products/new')}>Add product</AdminUI.Button>
        </>}
      />

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <AdminUI.Input icon="search" placeholder="Search name or SKU…" value={search} onChange={setSearch} style={{ flex: 1, minWidth: 260 }} />
        <AdminUI.Select value={cat} onChange={setCat} options={cats.map(c => ({ value: c, label: c === 'all' ? 'All categories' : c }))} />
        <AdminUI.Select value={stockFilter} onChange={setStockFilter} options={[{ value: 'all', label: 'All stock' }, { value: 'ok', label: 'In stock' }, { value: 'low', label: 'Low stock' }, { value: 'out', label: 'Out of stock' }]} />
        {selected.length > 0 && (
          <>
            <span style={{ fontSize: 12, color: '#8B8176' }}>{selected.length} selected</span>
            <AdminUI.Button size="sm" onClick={() => setBulkOpen(true)}>Bulk edit</AdminUI.Button>
            <AdminUI.Button size="sm" kind="danger" onClick={() => { if (confirm(`Delete ${selected.length} products?`)) { actions.deleteProducts(selected); setSelected([]); pushToast(`${selected.length} products deleted`); } }}>Delete</AdminUI.Button>
          </>
        )}
      </div>

      <AdminUI.Card padding={0}>
        <AdminUI.Table
          selected={selected}
          onSelect={setSelected}
          onRow={(r) => navigateAdmin('products/' + r.id)}
          empty="No products match your filters."
          columns={[
            { label: 'Product', render: (r) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AdminUI.ProductSwatch product={r} size={36} />
                <div>
                  <div style={{ fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{r.sku}</div>
                </div>
              </div>
            ) },
            { label: 'Brand', key: 'brand', width: 100 },
            { label: 'Category', render: (r) => <AdminUI.Pill kind="muted" size="sm">{r.cat}</AdminUI.Pill>, width: 110 },
            { label: 'Price', render: (r) => (
              <div>
                <div style={{ fontWeight: 600 }}>{AdminUI.fmtBDT(r.price)}</div>
                {r.was && <div style={{ fontSize: 11, color: '#8B8176', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>{AdminUI.fmtBDT(r.was)}</div>}
              </div>
            ), width: 110, align: 'right' },
            { label: 'Stock', render: (r) => (
              <AdminUI.Pill kind={r.stock === 0 ? 'danger' : r.stock < 8 ? 'warn' : 'ok'} size="sm">{r.stock}</AdminUI.Pill>
            ), width: 90, align: 'center' },
            { label: 'Rating', render: (r) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>★ {r.rating.toFixed(1)} <span style={{ color: '#A89E92' }}>({r.reviews})</span></span>
            ), width: 110 },
            { label: 'Status', render: (r) => <AdminUI.Pill kind={r.active ? 'ok' : 'muted'} size="sm">{r.active ? 'Active' : 'Draft'}</AdminUI.Pill>, width: 90 },
          ]}
          rows={filtered}
        />
      </AdminUI.Card>

      <AdminUI.Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title={`Bulk edit ${selected.length} products`}
        actions={<>
          <AdminUI.Button kind="ghost" onClick={() => setBulkOpen(false)}>Cancel</AdminUI.Button>
          <AdminUI.Button kind="primary" onClick={() => { pushToast(`${selected.length} products updated`); setBulkOpen(false); setSelected([]); }}>Apply</AdminUI.Button>
        </>}
      >
        <AdminUI.Field label="Price adjustment">
          <AdminUI.Select value="none" options={[{ value: 'none', label: 'No change' }, { value: 'pct-up', label: 'Increase by %' }, { value: 'pct-down', label: 'Decrease by %' }, { value: 'set', label: 'Set fixed price' }]} full />
        </AdminUI.Field>
        <AdminUI.Field label="Stock adjustment">
          <AdminUI.Input placeholder="e.g. +20 or -5" full />
        </AdminUI.Field>
        <AdminUI.Field label="Status">
          <AdminUI.Select value="" options={[{ value: '', label: 'No change' }, { value: 'active', label: 'Activate' }, { value: 'inactive', label: 'Deactivate' }]} full />
        </AdminUI.Field>
      </AdminUI.Modal>
    </div>
  );
}

function ProductEditor({ product }) {
  const { state, actions, navigateAdmin, pushToast } = useAdmin();
  const isNew = !product;
  const [p, setP] = React.useState(product || {
    name: '', brand: state.brands[0]?.name || '', cat: 'toys', sub: '', age: 'age-3-5', gender: 'neutral',
    price: 0, was: null, stock: 0, description: '', active: true, badge: null, img: 1, variants: [],
  });
  const [tab, setTab] = React.useState('details');

  const save = () => {
    if (!p.name) { pushToast('Name is required', 'error'); return; }
    if (isNew) {
      const id = actions.addProduct(p);
      pushToast('Product created');
      navigateAdmin('products/' + id);
    } else {
      actions.updateProduct(p.id, p);
      pushToast('Product saved');
    }
  };

  const updateVariant = (i, updates) => setP(prev => ({ ...prev, variants: prev.variants.map((v, idx) => idx === i ? { ...v, ...updates } : v) }));
  const addVariant = () => setP(prev => ({ ...prev, variants: [...(prev.variants || []), { id: 'v' + Date.now(), name: '', stock: 0, sku: '' }] }));
  const removeVariant = (i) => setP(prev => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <AdminUI.Button size="sm" kind="ghost" icon="chevL" onClick={() => navigateAdmin('products')}>Products</AdminUI.Button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{isNew ? 'New product' : p.name}</h1>
          {!isNew && <div style={{ fontSize: 12, color: '#8B8176', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{p.sku}</div>}
        </div>
        <AdminUI.Toggle on={p.active} onChange={(on) => setP({ ...p, active: on })} label={p.active ? 'Active' : 'Draft'} />
        {!isNew && <AdminUI.Button kind="ghost" icon="external" onClick={() => window.open('#p/' + p.slug, '_blank')}>View on site</AdminUI.Button>}
        <AdminUI.Button kind="primary" icon="check" onClick={save}>Save</AdminUI.Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <AdminUI.Card title="Details">
            <AdminUI.Field label="Product name" full>
              <AdminUI.Input full value={p.name} onChange={(v) => setP({ ...p, name: v })} placeholder="e.g. Wooden Rainbow Stacker" />
            </AdminUI.Field>
            <AdminUI.Field label="Description" full>
              <AdminUI.Textarea value={p.description} onChange={(v) => setP({ ...p, description: v })} rows={5} placeholder="Storefront description…" />
            </AdminUI.Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <AdminUI.Field label="Price (BDT)">
                <AdminUI.Input full type="number" value={p.price} onChange={(v) => setP({ ...p, price: +v })} suffix="৳" />
              </AdminUI.Field>
              <AdminUI.Field label="Compare-at price">
                <AdminUI.Input full type="number" value={p.was || ''} onChange={(v) => setP({ ...p, was: v ? +v : null })} suffix="৳" />
              </AdminUI.Field>
            </div>
          </AdminUI.Card>

          <div style={{ marginTop: 16 }}>
            <AdminUI.Card title="Variants" subtitle="Colors, sizes, styles" actions={<AdminUI.Button size="sm" icon="plus" onClick={addVariant}>Add variant</AdminUI.Button>}>
              {(!p.variants || p.variants.length === 0) && <div style={{ fontSize: 13, color: '#8B8176', padding: '10px 0' }}>No variants. Add one if this product comes in different options.</div>}
              {p.variants && p.variants.map((v, i) => (
                <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 40px', gap: 8, marginBottom: 8 }}>
                  <AdminUI.Input full value={v.name} onChange={(val) => updateVariant(i, { name: val })} placeholder="Variant name" />
                  <AdminUI.Input full value={v.sku} onChange={(val) => updateVariant(i, { sku: val })} placeholder="SKU" />
                  <AdminUI.Input full type="number" value={v.stock} onChange={(val) => updateVariant(i, { stock: +val })} placeholder="Stock" />
                  <AdminUI.Button kind="ghost" icon="trash" onClick={() => removeVariant(i)}></AdminUI.Button>
                </div>
              ))}
            </AdminUI.Card>
          </div>

          <div style={{ marginTop: 16 }}>
            <AdminUI.Card title="Images" padding={20}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: '#F5F1EA', border: '1px solid #E8DFD2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AdminUI.ProductSwatch product={{ ...p, img: (p.img + i) % 12 }} size={60} />
                  </div>
                ))}
                <div style={{ aspectRatio: '1', borderRadius: 8, border: '1px dashed #D8CFBF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8B8176' }}>
                  <AdminUI.Icon name="plus" size={20} />
                </div>
              </div>
            </AdminUI.Card>
          </div>
        </div>

        <div>
          <AdminUI.Card title="Organization">
            <AdminUI.Field label="Category"><AdminUI.Select full value={p.cat} onChange={(v) => setP({ ...p, cat: v })} options={[...new Set(state.products.map(x => x.cat))]} /></AdminUI.Field>
            <AdminUI.Field label="Subcategory"><AdminUI.Input full value={p.sub || ''} onChange={(v) => setP({ ...p, sub: v })} placeholder="e.g. diecast" /></AdminUI.Field>
            <AdminUI.Field label="Brand"><AdminUI.Select full value={p.brand} onChange={(v) => setP({ ...p, brand: v })} options={state.brands.map(b => b.name)} /></AdminUI.Field>
            <AdminUI.Field label="Age range"><AdminUI.Select full value={p.age} onChange={(v) => setP({ ...p, age: v })} options={[{ value: 'age-0-2', label: '0–2 yrs' }, { value: 'age-3-5', label: '3–5 yrs' }, { value: 'age-6-8', label: '6–8 yrs' }, { value: 'age-9-12', label: '9–12 yrs' }, { value: 'age-teen', label: 'Teens' }]} /></AdminUI.Field>
            <AdminUI.Field label="Gender"><AdminUI.Select full value={p.gender} onChange={(v) => setP({ ...p, gender: v })} options={[{ value: 'neutral', label: 'Unisex' }, { value: 'boys', label: 'For Boys' }, { value: 'girls', label: 'For Girls' }]} /></AdminUI.Field>
            <AdminUI.Field label="Badge"><AdminUI.Select full value={p.badge || ''} onChange={(v) => setP({ ...p, badge: v || null })} options={[{ value: '', label: '— none —' }, { value: 'new', label: 'NEW' }, { value: 'sale', label: 'SALE' }, { value: 'clearance', label: 'CLEARANCE' }]} /></AdminUI.Field>
          </AdminUI.Card>

          <div style={{ marginTop: 16 }}>
            <AdminUI.Card title="Inventory">
              <AdminUI.Field label="Stock quantity"><AdminUI.Input full type="number" value={p.stock} onChange={(v) => setP({ ...p, stock: +v })} /></AdminUI.Field>
              <AdminUI.Field label="SKU"><AdminUI.Input full value={p.sku || ''} onChange={(v) => setP({ ...p, sku: v })} /></AdminUI.Field>
              <AdminUI.Field label="Barcode (GTIN)"><AdminUI.Input full placeholder="Optional" /></AdminUI.Field>
              <AdminUI.Toggle on={true} onChange={() => {}} label="Track inventory" />
            </AdminUI.Card>
          </div>

          <div style={{ marginTop: 16 }}>
            <AdminUI.Card title="SEO">
              <AdminUI.Field label="URL slug"><AdminUI.Input full value={p.slug || ''} onChange={(v) => setP({ ...p, slug: v })} /></AdminUI.Field>
              <AdminUI.Field label="Meta title"><AdminUI.Input full placeholder={p.name} /></AdminUI.Field>
              <AdminUI.Field label="Meta description"><AdminUI.Textarea rows={2} placeholder="Short description for search results" /></AdminUI.Field>
            </AdminUI.Card>
          </div>
        </div>
      </div>
    </div>
  );
}

window.AdminProducts = AdminProducts;
