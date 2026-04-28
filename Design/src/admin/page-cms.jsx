/* CMS: Pages, Banners, Navigation, Blog, Homepage sections */

function AdminPages() {
  const { state, actions, navigateAdmin, route, pushToast } = useAdmin();
  const sub = route.split('/')[1];

  if (sub) {
    const page = state.cmsPages.find(p => p.id === sub);
    return <PageEditor page={page} isNew={sub === 'new'} />;
  }

  return (
    <div>
      <AdminPageHeader title="Pages"
        subtitle={`${state.cmsPages.length} pages · FAQ, T&C, Privacy, About, Shipping`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => navigateAdmin('cms/new')}>New page</AdminUI.Button>}
      />
      <AdminUI.Card padding={0}>
        <AdminUI.Table
          onRow={(r) => navigateAdmin('cms/' + r.id)}
          columns={[
            { label: 'Title', render: (r) => (
              <div>
                <div style={{ fontWeight: 500 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>/{r.slug}</div>
              </div>
            ) },
            { label: 'Blocks', render: (r) => <span style={{ fontSize: 12, color: '#6B625A', fontFamily: 'var(--font-mono)' }}>{r.blocks.length}</span>, width: 80 },
            { label: 'Status', render: (r) => <AdminUI.Pill kind={r.status === 'published' ? 'ok' : 'muted'} size="sm">{r.status === 'published' ? 'Published' : 'Draft'}</AdminUI.Pill>, width: 110 },
            { label: 'Updated', render: (r) => <span style={{ fontSize: 12 }}>{AdminUI.relTime(r.updatedAt)}</span>, width: 140 },
          ]}
          rows={state.cmsPages}
        />
      </AdminUI.Card>
    </div>
  );
}

function PageEditor({ page, isNew }) {
  const { actions, navigateAdmin, pushToast } = useAdmin();
  const [p, setP] = React.useState(page || { title: '', slug: '', status: 'draft', blocks: [{ type: 'paragraph', text: '' }] });

  const updateBlock = (i, updates) => setP(x => ({ ...x, blocks: x.blocks.map((b, idx) => idx === i ? { ...b, ...updates } : b) }));
  const removeBlock = (i) => setP(x => ({ ...x, blocks: x.blocks.filter((_, idx) => idx !== i) }));
  const addBlock = (type) => setP(x => ({ ...x, blocks: [...x.blocks, type === 'qa' ? { type: 'qa', q: '', a: '' } : { type, text: '' }] }));

  const save = () => {
    if (isNew) actions.addCmsPage(p);
    else actions.updateCmsPage(p.id, p);
    pushToast('Page saved');
    navigateAdmin('cms');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <AdminUI.Button size="sm" kind="ghost" icon="chevL" onClick={() => navigateAdmin('cms')}>Pages</AdminUI.Button>
        <h1 style={{ flex: 1, fontSize: 22, fontWeight: 700, margin: 0 }}>{isNew ? 'New page' : p.title}</h1>
        <AdminUI.Toggle on={p.status === 'published'} onChange={(on) => setP({ ...p, status: on ? 'published' : 'draft' })} label={p.status === 'published' ? 'Published' : 'Draft'} />
        <AdminUI.Button kind="primary" icon="check" onClick={save}>Save</AdminUI.Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <AdminUI.Card>
            <AdminUI.Field label="Title" full><AdminUI.Input full value={p.title} onChange={(v) => setP({ ...p, title: v, slug: p.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} /></AdminUI.Field>
            <AdminUI.Field label="URL slug" full><AdminUI.Input full value={p.slug} onChange={(v) => setP({ ...p, slug: v })} prefix="/" /></AdminUI.Field>
          </AdminUI.Card>

          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {p.blocks.map((b, i) => (
              <div key={i} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AdminUI.Pill kind="muted" size="sm">{b.type}</AdminUI.Pill>
                  <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'var(--font-mono)', flex: 1 }}>BLOCK {String(i + 1).padStart(2, '0')}</div>
                  <AdminUI.Button size="sm" kind="ghost" icon="trash" onClick={() => removeBlock(i)}></AdminUI.Button>
                </div>
                {b.type === 'qa' ? (
                  <>
                    <AdminUI.Field label="Question"><AdminUI.Input full value={b.q} onChange={(v) => updateBlock(i, { q: v })} /></AdminUI.Field>
                    <AdminUI.Field label="Answer"><AdminUI.Textarea rows={3} value={b.a} onChange={(v) => updateBlock(i, { a: v })} /></AdminUI.Field>
                  </>
                ) : (
                  <AdminUI.Textarea rows={b.type === 'heading' ? 1 : 4} value={b.text} onChange={(v) => updateBlock(i, { text: v })} placeholder={b.type === 'heading' ? 'Section heading' : 'Paragraph text'} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <AdminUI.Button size="sm" kind="ghost" icon="plus" onClick={() => addBlock('heading')}>Heading</AdminUI.Button>
              <AdminUI.Button size="sm" kind="ghost" icon="plus" onClick={() => addBlock('paragraph')}>Paragraph</AdminUI.Button>
              <AdminUI.Button size="sm" kind="ghost" icon="plus" onClick={() => addBlock('qa')}>Q&amp;A</AdminUI.Button>
            </div>
          </div>
        </div>
        <div>
          <AdminUI.Card title="Settings">
            <AdminUI.Field label="Status"><AdminUI.Select full value={p.status} onChange={(v) => setP({ ...p, status: v })} options={['draft', 'published']} /></AdminUI.Field>
            <AdminUI.Field label="Meta description"><AdminUI.Textarea rows={3} placeholder="SEO description" /></AdminUI.Field>
            <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
              {p.blocks.length} block{p.blocks.length === 1 ? '' : 's'}
              {page && <> · Updated {AdminUI.relTime(page.updatedAt)}</>}
            </div>
          </AdminUI.Card>
        </div>
      </div>
    </div>
  );
}

/* ---- Banners ---- */
function AdminBanners() {
  const { state, actions, pushToast } = useAdmin();

  const up = (id, updates) => actions.updateBanner(id, updates);
  const del = (id) => { if (confirm('Delete this banner?')) { actions.patch('banners', bs => bs.filter(b => b.id !== id)); pushToast('Banner removed'); } };
  const add = () => {
    const id = 'ban' + Date.now();
    actions.patch('banners', bs => [...bs, { id, slot: 'hero', title: 'New banner', subtitle: '', cta: 'Shop now', ctaLink: '#', active: true }]);
  };

  const slotPreview = (slot) => {
    if (slot === 'strip') return { bg: '#1F2F4A', fg: '#F5F1EA' };
    if (slot === 'promo') return { bg: '#FEE8E4', fg: '#B8432E' };
    return { bg: '#FEF4D4', fg: '#7A5B0A' };
  };

  return (
    <div>
      <AdminPageHeader
        title="Banners & promotions"
        subtitle={`${state.banners.filter(b => b.active).length} of ${state.banners.length} active across hero, strip, promo`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="plus" onClick={add}>Add banner</AdminUI.Button>}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state.banners.map(b => {
          const pal = slotPreview(b.slot);
          return (
            <div key={b.id} style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 10, padding: 16, display: 'grid', gridTemplateColumns: '320px 1fr auto', gap: 16, alignItems: 'center' }}>
              <div style={{ background: pal.bg, color: pal.fg, padding: 18, borderRadius: 8, minHeight: 110, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>{b.slot}{b.eyebrow ? ' · ' + b.eyebrow : ''}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>{b.title}</div>
                {b.subtitle && <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8, lineHeight: 1.4 }}>{b.subtitle.slice(0, 80)}{b.subtitle.length > 80 ? '…' : ''}</div>}
                {b.cta && <div style={{ display: 'inline-block', background: pal.fg, color: pal.bg, padding: '5px 10px', fontSize: 11, borderRadius: 4, fontWeight: 600, alignSelf: 'flex-start' }}>{b.cta}</div>}
              </div>
              <div>
                <AdminUI.Field label="Title"><AdminUI.Input full value={b.title || ''} onChange={(v) => up(b.id, { title: v })} /></AdminUI.Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <AdminUI.Field label="Subtitle"><AdminUI.Input full value={b.subtitle || ''} onChange={(v) => up(b.id, { subtitle: v })} /></AdminUI.Field>
                  <AdminUI.Field label="Slot"><AdminUI.Select full value={b.slot} onChange={(v) => up(b.id, { slot: v })} options={['hero', 'strip', 'promo']} /></AdminUI.Field>
                  <AdminUI.Field label="CTA label"><AdminUI.Input full value={b.cta || ''} onChange={(v) => up(b.id, { cta: v })} /></AdminUI.Field>
                  <AdminUI.Field label="CTA link"><AdminUI.Input full value={b.ctaLink || ''} onChange={(v) => up(b.id, { ctaLink: v })} /></AdminUI.Field>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
                <AdminUI.Toggle on={b.active} onChange={(on) => up(b.id, { active: on })} label={b.active ? 'Live' : 'Off'} />
                <AdminUI.Button size="sm" kind="ghost" icon="trash" onClick={() => del(b.id)}>Delete</AdminUI.Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Navigation builder ---- */
function AdminNavigation() {
  const { state, actions, pushToast } = useAdmin();

  const up = (id, updates) => actions.updateNav(state.navigation.map(n => n.id === id ? { ...n, ...updates } : n));
  const del = (id) => { if (confirm('Delete this menu item?')) actions.updateNav(state.navigation.filter(n => n.id !== id)); };
  const add = () => {
    const id = 'n' + Date.now();
    actions.updateNav([...state.navigation, { id, label: 'New item', link: '#', children: [] }]);
  };

  return (
    <div>
      <AdminPageHeader
        title="Navigation"
        subtitle={`${state.navigation.length} top-level items · header & mega-menu`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="plus" onClick={add}>Add menu item</AdminUI.Button>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <AdminUI.Card title="Main header menu" padding={0}>
          {state.navigation.map((item) => (
            <div key={item.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AdminUI.Icon name="grip" size={14} color="#A89E92" />
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 90px', gap: 10 }}>
                  <AdminUI.Input value={item.label} onChange={(v) => up(item.id, { label: v })} />
                  <AdminUI.Input value={item.link} onChange={(v) => up(item.id, { link: v })} />
                  <AdminUI.Input value={item.badge || ''} onChange={(v) => up(item.id, { badge: v || undefined })} placeholder="Badge" />
                </div>
                <AdminUI.Button size="sm" kind="ghost" icon="trash" onClick={() => del(item.id)}></AdminUI.Button>
              </div>
              {item.children && item.children.length > 0 && (
                <div style={{ marginLeft: 24, marginTop: 8, borderLeft: '2px solid #F1EBE0', paddingLeft: 12 }}>
                  {item.children.map((c) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0', fontSize: 12 }}>
                      <AdminUI.Icon name="chevR" size={11} color="#A89E92" />
                      <span style={{ fontWeight: 500 }}>{c.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#A89E92', fontSize: 11 }}>{c.link}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </AdminUI.Card>

        <AdminUI.Card title="Footer columns" padding={20}>
          <div style={{ fontSize: 12, color: '#6B625A', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 10, fontWeight: 600, color: '#2A2420' }}>Shop</div>
            <div>New arrivals · By age · By brand · Gift cards · Sale</div>
            <div style={{ marginTop: 14, marginBottom: 10, fontWeight: 600, color: '#2A2420' }}>Help</div>
            <div>FAQ · Shipping · Returns · Contact us · Track your order</div>
            <div style={{ marginTop: 14, marginBottom: 10, fontWeight: 600, color: '#2A2420' }}>Company</div>
            <div>About · Journal · Careers · Press · Wholesale</div>
            <div style={{ marginTop: 14, marginBottom: 10, fontWeight: 600, color: '#2A2420' }}>Legal</div>
            <div>Terms · Privacy · Cookie policy · Accessibility</div>
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>Footer columns are defined in the theme.</div>
        </AdminUI.Card>
      </div>
    </div>
  );
}

/* ---- Blog (Journal) ---- */
function AdminBlog() {
  const { state, actions, navigateAdmin, route, pushToast } = useAdmin();
  const sub = route.split('/')[1];

  if (sub === 'new' || state.blogPosts.find(p => p.id === sub)) {
    return <BlogEditor post={sub === 'new' ? null : state.blogPosts.find(p => p.id === sub)} />;
  }

  return (
    <div>
      <AdminPageHeader title="Journal"
        subtitle={`${state.blogPosts.length} posts · buying guides, editorial, sensory, learning`}
        actions={<AdminUI.Button size="sm" kind="primary" icon="plus" onClick={() => navigateAdmin('blog/new')}>New post</AdminUI.Button>}
      />
      <AdminUI.Card padding={0}>
        <AdminUI.Table
          onRow={(r) => navigateAdmin('blog/' + r.id)}
          columns={[
            { label: 'Post', render: (r) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: '#FEF4D4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#7A5B0A' }}>{(r.title || '??').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#8B8176' }}>{r.excerpt?.slice(0, 80)}…</div>
                </div>
              </div>
            ) },
            { label: 'Category', render: (r) => <AdminUI.Pill kind="muted" size="sm">{r.category}</AdminUI.Pill>, width: 140 },
            { label: 'Author', render: (r) => r.author, width: 120 },
            { label: 'Read', render: (r) => <span style={{ fontSize: 12, color: '#6B625A', fontFamily: 'var(--font-mono)' }}>{r.read}</span>, width: 90 },
            { label: 'Date', render: (r) => <span style={{ fontSize: 12 }}>{r.date}</span>, width: 130 },
          ]}
          rows={state.blogPosts}
        />
      </AdminUI.Card>
    </div>
  );
}

function BlogEditor({ post }) {
  const { actions, navigateAdmin, pushToast } = useAdmin();
  const [p, setP] = React.useState(post || { id: 'post-' + Date.now(), title: '', excerpt: '', category: 'Journal', read: '4 min read', author: 'Nazia A.', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), body: '', img: 3 });

  const save = () => {
    actions.patch('blogPosts', posts => {
      const exists = posts.find(x => x.id === p.id);
      return exists ? posts.map(x => x.id === p.id ? p : x) : [p, ...posts];
    });
    pushToast(post ? 'Post updated' : 'Post published');
    navigateAdmin('blog');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <AdminUI.Button size="sm" kind="ghost" icon="chevL" onClick={() => navigateAdmin('blog')}>Journal</AdminUI.Button>
        <h1 style={{ flex: 1, fontSize: 22, fontWeight: 700, margin: 0 }}>{!post ? 'New post' : p.title}</h1>
        <AdminUI.Button kind="primary" icon="check" onClick={save}>Save</AdminUI.Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <AdminUI.Card>
          <AdminUI.Field label="Title"><AdminUI.Input full value={p.title} onChange={(v) => setP({ ...p, title: v })} /></AdminUI.Field>
          <AdminUI.Field label="Excerpt"><AdminUI.Textarea value={p.excerpt} onChange={(v) => setP({ ...p, excerpt: v })} rows={2} placeholder="Short summary for listings" /></AdminUI.Field>
          <AdminUI.Field label="Body (Markdown)"><AdminUI.Textarea value={p.body || ''} onChange={(v) => setP({ ...p, body: v })} rows={14} /></AdminUI.Field>
        </AdminUI.Card>
        <AdminUI.Card title="Details">
          <AdminUI.Field label="Category"><AdminUI.Select full value={p.category} onChange={(v) => setP({ ...p, category: v })} options={['Journal', 'Buying Guides', 'Editorial', 'Learning', 'Baby', 'Gift Guide']} /></AdminUI.Field>
          <AdminUI.Field label="Author"><AdminUI.Input full value={p.author} onChange={(v) => setP({ ...p, author: v })} /></AdminUI.Field>
          <AdminUI.Field label="Read time"><AdminUI.Input full value={p.read} onChange={(v) => setP({ ...p, read: v })} /></AdminUI.Field>
          <AdminUI.Field label="Publish date"><AdminUI.Input full value={p.date} onChange={(v) => setP({ ...p, date: v })} /></AdminUI.Field>
          <AdminUI.Field label="Cover image #"><AdminUI.Input full type="number" value={p.img} onChange={(v) => setP({ ...p, img: Number(v) || 0 })} /></AdminUI.Field>
        </AdminUI.Card>
      </div>
    </div>
  );
}

/* ---- Homepage sections ---- */
function AdminHomepage() {
  const { state, actions, pushToast } = useAdmin();

  const labels = {
    hero: 'Hero banner',
    categories: 'Category grid',
    products: 'Product carousel',
    editorial: 'Editorial feature',
    brands: 'Brand wall',
    journal: 'Journal teaser',
    newsletter: 'Newsletter signup',
  };

  const move = (idx, dir) => {
    const next = [...state.homepage];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    actions.reorderHomeSections(next);
  };

  return (
    <div>
      <AdminPageHeader title="Homepage"
        subtitle={`${state.homepage.filter(s => s.enabled).length} of ${state.homepage.length} sections live`}
      />
      <AdminUI.Card padding={0}>
        {state.homepage.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #F4EEE3' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{ border: 0, background: 'transparent', cursor: i === 0 ? 'default' : 'pointer', padding: 2, opacity: i === 0 ? 0.3 : 1 }}><AdminUI.Icon name="chevU" size={12} /></button>
              <button onClick={() => move(i, 1)} disabled={i === state.homepage.length - 1} style={{ border: 0, background: 'transparent', cursor: i === state.homepage.length - 1 ? 'default' : 'pointer', padding: 2, opacity: i === state.homepage.length - 1 ? 0.3 : 1 }}><AdminUI.Icon name="chevD" size={12} /></button>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: '#F5F1EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#6B625A' }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{s.title || labels[s.type] || s.type}</div>
              <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>
                {s.type}
                {s.bannerId && ' · banner:' + s.bannerId}
                {s.filter && ' · ' + s.filter}
                {s.limit && ' · limit:' + s.limit}
              </div>
            </div>
            <AdminUI.Toggle on={s.enabled} onChange={(on) => actions.updateHomeSection(s.id, { enabled: on })} label={s.enabled ? 'On' : 'Off'} />
            <AdminUI.Button size="sm" kind="ghost" icon="edit" onClick={() => pushToast('Section editor (demo)')}></AdminUI.Button>
          </div>
        ))}
        <div style={{ padding: 14 }}><AdminUI.Button size="sm" kind="ghost" icon="plus" onClick={() => pushToast('Section added (demo)')}>Add section</AdminUI.Button></div>
      </AdminUI.Card>
    </div>
  );
}

window.AdminPages = AdminPages;
window.AdminBanners = AdminBanners;
window.AdminNavigation = AdminNavigation;
window.AdminBlog = AdminBlog;
window.AdminHomepage = AdminHomepage;
