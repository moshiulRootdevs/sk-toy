/* Header, mega nav, footer, cart drawer, toasts */

function Logo({ small = false }) {
  const fontSize = small ? 22 : 32;
  return (
    <a className="logo logo-wordmark" href="#home" aria-label="SK Toy — home" style={{ fontSize }}>
      <div className="logo-wm">
        <span className="lg-letter" style={{ color: '#EC5D4A', '--d': '0s' }}>S</span>
        <span className="lg-letter" style={{ color: '#F5C443', '--d': '.08s' }}>K</span>
        <span className="logo-dot" aria-hidden="true"></span>
        <span className="lg-letter" style={{ color: '#F39436', '--d': '.24s' }}>T</span>
        <span className="lg-letter" style={{ color: '#4FA36A', '--d': '.32s' }}>O</span>
        <span className="lg-letter" style={{ color: '#6FB8D9', '--d': '.40s' }}>Y</span>
      </div>
    </a>
  );
}

function Header() {
  const { cart, wish, setDrawer, navigate } = useStore();
  const [openMega, setOpenMega] = React.useState(null);
  const [searchFocus, setSearchFocus] = React.useState(false);

  const topCats = window.SK.CATEGORIES;

  return (
    <>
      <div className="topstrip">
        <div className="container topstrip-inner">
          <div>
            <span>Free shipping over ৳2,500</span>
            <span className="dot"></span>
            <span>COD available across Bangladesh</span>
            <span className="dot"></span>
            <span>7-day easy returns</span>
          </div>
          <div>
            <span>৳ BDT</span>
            <span className="dot"></span>
            <span>EN · বাংলা</span>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="container header-main">
          <div className="search-bar" style={searchFocus ? {} : undefined}>
            <SKUI.Icon name="search" size={16} />
            <input
              placeholder="Search dinosaurs, diecast, drones…"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
            <span className="kbd">/</span>
          </div>
          <Logo />
          <div className="header-tools">
            <a className="icon-btn" onClick={() => navigate('track')} title="Track order"><SKUI.Icon name="truck" /></a>
            <a className="icon-btn" onClick={() => navigate('account')} title="Account"><SKUI.Icon name="user" /></a>
            <a className="icon-btn" onClick={() => navigate('wishlist')} title="Wishlist">
              <SKUI.Icon name="heart" />
              {wish.length > 0 && <span className="badge">{wish.length}</span>}
            </a>
            <a className="icon-btn" onClick={() => setDrawer(true)} title="Bag">
              <SKUI.Icon name="bag" />
              {cart.count > 0 && <span className="badge">{cart.count}</span>}
            </a>
          </div>
        </div>

        <nav className="mainnav" onMouseLeave={() => setOpenMega(null)}>
          <div className="container">
            <div className="mainnav-inner">
              {topCats.map(c => (
                <div key={c.id}
                  className={`nav-item ${openMega === c.id ? 'active' : ''}`}
                  onMouseEnter={() => setOpenMega(c.children && c.children.length ? c.id : null)}
                  onClick={() => {
                    setOpenMega(null);
                    navigate(c.slug === 'journal' ? 'blog' : c.slug === 'brands' ? 'brands' : c.slug === 'sale' ? 'sale' : c.slug === 'clearance' ? 'clearance' : c.slug === 'damaged' ? 'damaged' : `cat/${c.slug}`);
                  }}>
                  {c.name}
                  {c.tag && <span className={`tag ${c.tag === 'SALE' ? 'sale' : ''}`}>{c.tag}</span>}
                  {c.children && c.children.length > 0 && <span className="caret">▾</span>}
                </div>
              ))}
              {openMega && <MegaMenu cat={window.SK.CAT_BY_ID[openMega]} close={() => setOpenMega(null)} />}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

function MegaMenu({ cat, close }) {
  const { navigate } = useStore();
  if (!cat || !cat.children || cat.children.length === 0) return null;
  // Split: first column is a feature card, remaining are L2 with L3 under
  const cols = cat.children.slice(0, 3);
  return (
    <div className="mega" onClick={(e) => e.stopPropagation()}>
      <div className="container mega-grid">
        <div className="mega-feature">
          <div className="feature-art"></div>
          <div className="feature-content">
            <span className="eyebrow">Editor's pick</span>
            <h3>The {cat.name}<br/>essentials.</h3>
            <p>A shortlist we'd gift our own kids — curated from across the shop.</p>
            <button className="btn btn-dark btn-sm" onClick={() => { close(); navigate(`cat/${cat.slug}`); }}>
              See the edit <SKUI.Icon name="arrowRight" size={12} />
            </button>
          </div>
        </div>
        {cols.map(sub => (
          <div className="mega-col" key={sub.id}>
            <h4>{sub.name}</h4>
            <ul>
              {(sub.children || [{ id: sub.id + '-all', name: 'Shop all ' + sub.name.toLowerCase(), slug: sub.slug }]).map(s3 => (
                <li key={s3.id}>
                  <a onClick={() => { close(); navigate(`cat/${s3.slug}`); }}>
                    {s3.name}
                    <span className="arrow">→</span>
                  </a>
                </li>
              ))}
              {!sub.children && (
                <li><a onClick={() => { close(); navigate(`cat/${sub.slug}`); }}>Shop all <span className="arrow">→</span></a></li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="brand-blurb">
              A quieter kind of toy<br/>shop<span className="dot">.</span>
            </div>
            <p style={{ color: 'rgba(251,248,242,.65)', fontSize: 14, maxWidth: 280, margin: 0 }}>
              Hand-picked toys for Bangladesh's families. Delivered from our warehouse in Gulshan, Dhaka.
            </p>
            <div className="footer-socials" style={{ marginTop: 20 }}>
              <a><SKUI.Icon name="facebook" size={14} /></a>
              <a><SKUI.Icon name="instagram" size={14} /></a>
              <a><SKUI.Icon name="mail" size={14} /></a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="#cat/new-arrivals">New arrivals</a></li>
              <li><a href="#cat/toys">All toys</a></li>
              <li><a href="#cat/by-age">By age</a></li>
              <li><a href="#sale">Sale</a></li>
              <li><a href="#damaged">Damaged & returned</a></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><a href="#track">Track your order</a></li>
              <li><a>Shipping & returns</a></li>
              <li><a>Contact us</a></li>
              <li><a>FAQ</a></li>
              <li><a>Gift cards</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a>About SK Toy</a></li>
              <li><a href="#blog">Journal</a></li>
              <li><a>Stores</a></li>
              <li><a>Careers</a></li>
              <li><a>Press</a></li>
            </ul>
          </div>
          <div>
            <h4>Letters from SK Toy</h4>
            <p style={{ color: 'rgba(251,248,242,.7)', fontSize: 13, margin: '0 0 16px' }}>
              A slow newsletter — two a month, no spam, no urgency.
            </p>
            <div className="footer-sub">
              <input placeholder="Your email" />
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="pill-tag" style={{ background: 'rgba(251,248,242,.08)', color: 'rgba(251,248,242,.8)' }}>bKash</span>
              <span className="pill-tag" style={{ background: 'rgba(251,248,242,.08)', color: 'rgba(251,248,242,.8)' }}>Nagad</span>
              <span className="pill-tag" style={{ background: 'rgba(251,248,242,.08)', color: 'rgba(251,248,242,.8)' }}>Card</span>
              <span className="pill-tag" style={{ background: 'rgba(251,248,242,.08)', color: 'rgba(251,248,242,.8)' }}>COD</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SK Toy Bangladesh · 63/B Gulshan Avenue, Dhaka</span>
          <span>
            Privacy · Terms · Accessibility ·{' '}
            <a
              href="#admin/dashboard"
              onClick={(e) => { e.preventDefault(); window.location.hash = 'admin/dashboard'; }}
              style={{ color: 'inherit', opacity: 0.7, textDecoration: 'underline dotted', textUnderlineOffset: 3, cursor: 'pointer' }}
              title="Staff login (⌘⇧A)"
            >Staff</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function CartDrawer() {
  const { drawer, setDrawer, cart, navigate } = useStore();
  const items = cart.items.map(i => ({ ...i, p: window.SK.PRODUCTS.find(x => x.id === i.id) })).filter(i => i.p);
  return (
    <>
      <div className={`drawer-bg ${drawer ? 'open' : ''}`} onClick={() => setDrawer(false)}></div>
      <aside className={`drawer ${drawer ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>Your bag <span className="mono" style={{ fontSize: 14, color: 'var(--ink-mute)' }}>({cart.count})</span></h3>
          <button className="icon-btn" onClick={() => setDrawer(false)}><SKUI.Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty" style={{ padding: '48px 0' }}>
              <div className="ico">∅</div>
              <h2 style={{ fontSize: 32 }}>Your bag is empty</h2>
              <p>Let's find something worth carrying home.</p>
              <button className="btn btn-dark" onClick={() => { setDrawer(false); navigate('home'); }}>Start shopping</button>
            </div>
          ) : (
            items.map(({ p, qty, key }) => (
              <div className="cart-item" key={key} style={{ gridTemplateColumns: '72px 1fr auto' }}>
                <div className="cart-item-img"><SKUI.Placeholder variant={p.img} /></div>
                <div>
                  <div className="cart-item-meta">{p.brand}</div>
                  <div className="cart-item-name" style={{ fontSize: 14 }}>{p.name}</div>
                  <div className="qty-stepper" style={{ marginTop: 6 }}>
                    <button onClick={() => cart.updateQty(key, qty - 1)}>−</button>
                    <input value={qty} readOnly />
                    <button onClick={() => cart.updateQty(key, qty + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <div className="cart-item-price">{fmtTk(p.price * qty)}</div>
                  <button style={{ fontSize: 11, color: 'var(--ink-mute)' }} onClick={() => cart.remove(key)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="row-between" style={{ marginBottom: 14 }}>
              <span className="eyebrow">Subtotal</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 24 }}>{fmtTk(cart.subtotal)}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <button className="btn btn-dark btn-block btn-lg" onClick={() => { setDrawer(false); navigate('checkout'); }}>
                Checkout <SKUI.Icon name="arrowRight" size={14} />
              </button>
              <button className="btn btn-ghost btn-block" onClick={() => { setDrawer(false); navigate('cart'); }}>
                View full bag
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>
              Shipping calculated at checkout
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <span className="tdot"></span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

window.Header = Header;
window.Footer = Footer;
window.CartDrawer = CartDrawer;
window.Toasts = Toasts;
