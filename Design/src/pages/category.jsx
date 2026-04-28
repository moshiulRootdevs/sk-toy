/* Category / listing page */

function FilterRow({ active, onToggle, label, count }) {
  return (
    <label className={`filter-row ${active ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onToggle(); }}>
      <span>
        <span className="tick"></span>
        <span className="lab">{label}</span>
      </span>
      {count != null && <span className="count">{count}</span>}
    </label>
  );
}

function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={`filter-group ${open ? '' : 'collapsed'}`}>
      <h4 onClick={() => setOpen(o => !o)}>
        {title} <span className="chev">▾</span>
      </h4>
      {children}
    </div>
  );
}

function FilterSidebar({ filters, setFilters, toggle, brandCounts }) {
  const activeCount =
    filters.age.size + filters.brand.size + filters.gender.size +
    (filters.onSale ? 1 : 0) + (filters.inStock ? 1 : 0) +
    (filters.priceMax < 6000 ? 1 : 0);

  const clearAll = () => setFilters({
    age: new Set(), brand: new Set(), gender: new Set(),
    priceMin: 0, priceMax: 6000, onSale: false, inStock: false,
  });

  return (
    <>
      <div className="sidebar-head">
        <span className="lab">Filters{activeCount > 0 && <span style={{ marginLeft: 6, background: 'var(--coral)', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 600 }}>{activeCount}</span>}</span>
        {activeCount > 0 && <button className="clear" onClick={clearAll}>Clear</button>}
      </div>

      <FilterGroup title="Availability">
        <div className="filter-list">
          <FilterRow active={filters.inStock} onToggle={() => setFilters(f => ({ ...f, inStock: !f.inStock }))}
            label="In stock" count={window.SK.PRODUCTS.length} />
          <FilterRow active={filters.onSale} onToggle={() => setFilters(f => ({ ...f, onSale: !f.onSale }))}
            label="On sale" count={window.SK.PRODUCTS.filter(p => p.was).length} />
        </div>
      </FilterGroup>

      <FilterGroup title="Age">
        <div className="filter-list">
          {[
            ['age-0-2', '0–2 yrs'], ['age-3-5', '3–5 yrs'],
            ['age-6-8', '6–8 yrs'], ['age-9-12', '9–12 yrs'], ['age-teen', 'Teens'],
          ].map(([id, lab]) => (
            <FilterRow key={id} active={filters.age.has(id)} onToggle={() => toggle('age', id)}
              label={lab} count={window.SK.PRODUCTS.filter(p => p.age === id).length} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Gender">
        <div className="filter-chip-row">
          {[['boys', 'Boys'], ['girls', 'Girls'], ['neutral', 'Unisex']].map(([g, lab]) => (
            <div key={g} className={`filter-chip ${filters.gender.has(g) ? 'active' : ''}`} onClick={() => toggle('gender', g)}>
              {lab}
            </div>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="filter-range">
          <input type="range" min={0} max={6000} step={100} value={filters.priceMax}
            onChange={e => setFilters(f => ({ ...f, priceMax: +e.target.value }))} />
          <div className="filter-range-meta">
            <span>৳0</span><span>up to {fmtTk(filters.priceMax)}</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="filter-list">
          {window.SK.BRANDS.slice(0, 10).map(b => (
            <FilterRow key={b.name} active={filters.brand.has(b.name)} onToggle={() => toggle('brand', b.name)}
              label={b.name} count={brandCounts[b.name] || 0} />
          ))}
        </div>
      </FilterGroup>
    </>
  );
}

function CategoryPage({ slug }) {
  const { navigate } = useStore();
  const cat = window.SK.CAT_BY_SLUG[slug] || { name: 'All toys', slug: slug };

  const [filters, setFilters] = React.useState({
    age: new Set(), brand: new Set(), gender: new Set(),
    priceMin: 0, priceMax: 6000, onSale: false, inStock: false,
  });
  const [sort, setSort] = React.useState('featured');
  const [view, setView] = React.useState('grid');

  const toggle = (group, val) => {
    setFilters(f => {
      const s = new Set(f[group]);
      s.has(val) ? s.delete(val) : s.add(val);
      return { ...f, [group]: s };
    });
  };

  const results = React.useMemo(() => {
    let items = window.SK.PRODUCTS;
    // category filter
    if (slug && slug !== 'all') {
      const matches = (p) => {
        if (slug.startsWith('age/')) return p.age === 'age-' + slug.split('/')[1];
        if (slug.startsWith('gender/')) return p.gender === slug.split('/')[1];
        if (slug === 'new-arrivals') return p.badge === 'new' || parseInt(p.id.replace('p-', '')) > 16;
        if (slug === 'sale') return !!p.was;
        if (slug === 'clearance' || slug === 'damaged') return !!p.was && p.price < 2500;
        return p.cat === cat.id || p.sub === cat.id || p.subsub === cat.id || (cat.slug && (p.cat === cat.slug.split('/')[0]));
      };
      items = items.filter(matches);
      if (items.length < 4) items = window.SK.PRODUCTS.slice(0, 18); // fallback so the page looks full
    }
    if (filters.age.size) items = items.filter(p => filters.age.has(p.age));
    if (filters.brand.size) items = items.filter(p => filters.brand.has(p.brand));
    if (filters.gender.size) items = items.filter(p => filters.gender.has(p.gender));
    if (filters.onSale) items = items.filter(p => !!p.was);
    items = items.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);

    if (sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
    else if (sort === 'newest') items = [...items].reverse();
    return items;
  }, [slug, filters, sort, cat]);

  const brandCounts = React.useMemo(() => {
    const c = {};
    window.SK.PRODUCTS.forEach(p => { c[p.brand] = (c[p.brand] || 0) + 1; });
    return c;
  }, []);

  const subCats = cat.children || [];

  return (
    <main>
      <div className="container">
        <nav className="crumb">
          <a href="#home">Home</a><span className="sep">/</span>
          <span className="current">{cat.name}</span>
        </nav>
      </div>

      <div className="container cat-head">
        <div className="eyebrow">Category · {results.length} products</div>
        <h1>{cat.name.split(' ').slice(0, -1).join(' ')} <em>{cat.name.split(' ').slice(-1)}</em></h1>
        <p>A curated edit within <strong>{cat.name}</strong>. Use the filters to narrow by age, brand, or price — or let our recommended sort do the work.</p>

        {subCats.length > 0 && (
          <div className="subnav-pills">
            <div className={`subnav-pill active`}>All {cat.name.toLowerCase()}</div>
            {subCats.map(s => (
              <div key={s.id} className="subnav-pill" onClick={() => navigate(`cat/${s.slug}`)}>
                {s.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container cat-layout">
        <aside className="sidebar">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            toggle={toggle}
            brandCounts={brandCounts}
          />
        </aside>

        <div>
          <div className="cat-toolbar">
            <span className="count">{results.length} products</span>
            <div className="tools">
              <div className="view-toggle">
                <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><SKUI.Icon name="grid" size={12} /></button>
                <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><SKUI.Icon name="list" size={12} /></button>
              </div>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <div className="ico">∅</div>
              <h2>Nothing matches</h2>
              <p>Try loosening a filter or two.</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid-products cols-3">
              {results.map(p => <SKUI.ProductCard key={p.id} product={p} onOpen={(p) => navigate(`p/${p.slug}`)} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {results.map(p => <ListRow key={p.id} p={p} onOpen={() => navigate(`p/${p.slug}`)} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ListRow({ p, onOpen }) {
  const { cart } = useStore();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 24, padding: 20, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', alignItems: 'center', cursor: 'pointer' }} onClick={onOpen}>
      <div style={{ aspectRatio: 1, borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
        <SKUI.Placeholder variant={p.img} />
      </div>
      <div>
        <div className="pcard-meta">{p.brand} · {p.age?.replace('age-', '')} yrs</div>
        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, margin: '4px 0 10px', fontWeight: 400 }}>{p.name}</h4>
        <div className="pcard-rating"><SKUI.Stars value={p.rating} /> <span>{p.rating.toFixed(1)} · {p.reviews} reviews</span></div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, lineHeight: 1 }}>{fmtTk(p.price)}</div>
        {p.was && <div style={{ color: 'var(--ink-mute)', textDecoration: 'line-through', fontSize: 13 }}>{fmtTk(p.was)}</div>}
        <button className="btn btn-dark btn-sm" style={{ marginTop: 10 }} onClick={(e) => { e.stopPropagation(); cart.add(p); }}>Add to bag</button>
      </div>
    </div>
  );
}

window.CategoryPage = CategoryPage;
