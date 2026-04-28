/* Misc pages: wishlist, brands, account */

function WishlistPage() {
  const { wish, navigate } = useStore();
  const items = wish.map(id => window.SK.PRODUCTS.find(p => p.id === id)).filter(Boolean);

  return (
    <main>
      <div className="container">
        <nav className="crumb"><a href="#home">Home</a><span className="sep">/</span><span className="current">Wishlist</span></nav>
      </div>
      <div className="container" style={{ padding: '32px 0 80px' }}>
        <div className="eyebrow">{items.length} items · saved for later</div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 72, margin: '8px 0 40px', fontWeight: 700, letterSpacing: '-0.02em' }}>Your <em>wishlist.</em></h1>
        {items.length === 0 ? (
          <div className="empty">
            <div className="ico">♡</div>
            <h2>Nothing saved yet</h2>
            <p>Tap the heart on anything you like and it'll land here.</p>
            <button className="btn btn-dark" onClick={() => navigate('home')}>Start browsing</button>
          </div>
        ) : (
          <div className="grid-products">
            {items.map(p => <SKUI.ProductCard key={p.id} product={p} onOpen={(p) => navigate(`p/${p.slug}`)} />)}
          </div>
        )}
      </div>
    </main>
  );
}

function BrandsPage() {
  const { navigate } = useStore();
  return (
    <main>
      <div className="container">
        <nav className="crumb"><a href="#home">Home</a><span className="sep">/</span><span className="current">Brands</span></nav>
      </div>
      <section className="blog-hero">
        <div className="container">
          <div className="eyebrow">The shelf</div>
          <h1>Sixty-four <em>brands,</em> carefully chosen.</h1>
          <p>We don't carry everything. Instead, we carry the brands our buyers — all of them parents themselves — want on their own shelves at home.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {window.SK.BRANDS.concat(window.SK.BRANDS).map((b, i) => (
              <div key={i} style={{ aspectRatio: '3/2', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, cursor: 'pointer', transition: 'all .15s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
                onClick={() => navigate(`cat/toys`)}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 44, lineHeight: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {b.em.slice(0, 1)}<em>{b.em.slice(1).toLowerCase() || '.'}</em>
                </div>
                <div style={{ marginTop: 8, fontSize: 14, color: 'var(--ink-soft)' }}>{b.name}</div>
                <div style={{ position: 'absolute', bottom: 16, right: 16, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', color: 'var(--ink-mute)' }}>
                  {(12 + (i * 17) % 80)} products →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function AccountPage() {
  const { navigate, wish, cart } = useStore();
  return (
    <main>
      <div className="container">
        <nav className="crumb"><a href="#home">Home</a><span className="sep">/</span><span className="current">Account</span></nav>
      </div>
      <div className="container" style={{ padding: '40px 0 80px', maxWidth: 820 }}>
        <div className="eyebrow">Welcome back</div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 64, fontWeight: 700, margin: '6px 0 40px', letterSpacing: '-0.02em' }}>Hello, <em>Nazia.</em></h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { k: 'Open orders', v: '2', l: 'track →', go: 'track' },
            { k: 'Wishlist', v: wish.length, l: 'view →', go: 'wishlist' },
            { k: 'In bag', v: cart.count, l: 'checkout →', go: 'cart' },
          ].map(s => (
            <div key={s.k} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
              <div className="eyebrow">{s.k}</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 56, lineHeight: 1, margin: '6px 0 12px' }}>{s.v}</div>
              <a onClick={() => navigate(s.go)} style={{ cursor: 'pointer', fontSize: 13, color: 'var(--coral)', borderBottom: '1px solid var(--coral-soft)' }}>{s.l}</a>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 700, margin: '0 0 20px' }}>Recent orders</h2>
          {[
            { id: 'SK-4821', date: '14 Apr 2026', status: 'Out for delivery', sc: 'coral', total: '৳2,780', items: 3 },
            { id: 'SK-4712', date: '28 Mar 2026', status: 'Delivered', sc: 'forest', total: '৳1,190', items: 1 },
            { id: 'SK-4609', date: '04 Mar 2026', status: 'Delivered', sc: 'forest', total: '৳5,640', items: 4 },
          ].map(o => (
            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '14px 0', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>#{o.id}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>{o.date.toUpperCase()} · {o.items} ITEM{o.items > 1 ? 'S' : ''}</div>
              </div>
              <span className={`pill-tag ${o.sc}`}>{o.status}</span>
              <span style={{ fontWeight: 500, minWidth: 80, textAlign: 'right' }}>{o.total}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

window.WishlistPage = WishlistPage;
window.BrandsPage = BrandsPage;
window.AccountPage = AccountPage;
