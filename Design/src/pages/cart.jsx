/* Cart page */

function CartPage() {
  const { cart, navigate } = useStore();
  const [promo, setPromo] = React.useState('');
  const [promoApplied, setPromoApplied] = React.useState(false);
  const [gift, setGift] = React.useState(false);
  const [giftMsg, setGiftMsg] = React.useState('');

  const items = cart.items.map(i => ({ ...i, p: window.SK.PRODUCTS.find(x => x.id === i.id) })).filter(i => i.p);
  const discount = promoApplied ? Math.round(cart.subtotal * 0.1) : 0;
  const giftCost = gift ? 120 : 0;
  const shipping = cart.subtotal >= 2500 ? 0 : 120;
  const total = cart.subtotal - discount + shipping + giftCost;

  if (items.length === 0) {
    return (
      <main className="container">
        <div className="empty" style={{ padding: '120px 20px' }}>
          <div className="ico">∅</div>
          <h2>Your bag is <em>quiet</em></h2>
          <p>Nothing in here yet. Let's change that.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-dark" onClick={() => navigate('home')}>Start shopping</button>
            <button className="btn btn-ghost" onClick={() => navigate('cat/new-arrivals')}>See what's new</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container">
        <nav className="crumb"><a href="#home">Home</a><span className="sep">/</span><span className="current">Bag</span></nav>
      </div>
      <div className="container cart-layout">
        <div>
          <div className="cart-head">
            <div className="eyebrow">{cart.count} items</div>
            <h1>Your <em>bag.</em></h1>
            <div className="sub">Review below, then checkout. Shipping is free over ৳2,500 — you're <strong>{cart.subtotal >= 2500 ? 'there' : fmtTk(2500 - cart.subtotal) + ' away'}</strong>.</div>
          </div>

          <div className="cart-list">
            {items.map(({ p, qty, key }) => (
              <div className="cart-item" key={key}>
                <div className="cart-item-img"><SKUI.Placeholder variant={p.img} /></div>
                <div>
                  <div className="cart-item-meta">{p.brand} · Ages {p.age?.replace('age-', '')}</div>
                  <div className="cart-item-name">{p.name}</div>
                  <div className="cart-item-variant">Colour: Coral · Single</div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div className="qty-stepper">
                      <button onClick={() => cart.updateQty(key, qty - 1)}>−</button>
                      <input value={qty} readOnly />
                      <button onClick={() => cart.updateQty(key, qty + 1)}>+</button>
                    </div>
                    <div className="cart-item-actions">
                      <button onClick={() => cart.remove(key)}>Remove</button>
                      <button>Save for later</button>
                    </div>
                  </div>
                </div>
                <div className="cart-item-right">
                  <div className="cart-item-price">{fmtTk(p.price * qty)}</div>
                  {p.was && <div style={{ color: 'var(--ink-mute)', textDecoration: 'line-through', fontSize: 12 }}>{fmtTk(p.was * qty)}</div>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: 24, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>You might want</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
              {window.SK.PRODUCTS.slice(12, 16).map(p => <SKUI.ProductCard key={p.id} product={p} onOpen={(p) => navigate(`p/${p.slug}`)} />)}
            </div>
          </div>
        </div>

        <div className="summary">
          <h3>Order summary</h3>
          <div className="gift-box">
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={gift} onChange={e => setGift(e.target.checked)} />
              <div className="gift-head" style={{ margin: 0 }}>
                <span className="ico"><SKUI.Icon name="gift" size={12} /></span>
                Gift wrap this order <span style={{ marginLeft: 6, color: 'var(--ink-mute)' }}>(+৳120)</span>
              </div>
            </label>
            {gift && (
              <>
                <p style={{ marginTop: 10 }}>Kraft paper, hand-tied ribbon, optional note.</p>
                <textarea placeholder="Gift message (optional, up to 140 chars)" value={giftMsg} onChange={e => setGiftMsg(e.target.value)} maxLength={140} />
              </>
            )}
          </div>

          <div className="promo">
            <input placeholder="Promo code" value={promo} onChange={e => setPromo(e.target.value)} />
            <button className="btn btn-dark btn-sm" onClick={() => { if (promo) setPromoApplied(true); }}>Apply</button>
          </div>
          {promoApplied && <div style={{ fontSize: 12, color: 'var(--forest)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>✓ {promo.toUpperCase()} · 10% off applied</div>}

          <div className="summary-row"><span>Subtotal ({cart.count} items)</span><span>{fmtTk(cart.subtotal)}</span></div>
          {discount > 0 && <div className="summary-row"><span>Discount</span><span style={{ color: 'var(--forest)' }}>− {fmtTk(discount)}</span></div>}
          <div className="summary-row">
            <span>Shipping <span className="muted">· Standard</span></span>
            <span>{shipping === 0 ? <strong style={{ color: 'var(--forest)' }}>Free</strong> : fmtTk(shipping)}</span>
          </div>
          {gift && <div className="summary-row"><span>Gift wrap</span><span>{fmtTk(giftCost)}</span></div>}
          <div className="summary-row total"><span>Total</span><span>{fmtTk(total)}</span></div>

          <button className="btn btn-dark btn-block btn-lg" style={{ marginTop: 20 }} onClick={() => navigate('checkout')}>
            Proceed to checkout <SKUI.Icon name="arrowRight" size={14} />
          </button>
          <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'center' }}>
            <span className="pill-tag">bKash</span>
            <span className="pill-tag">Nagad</span>
            <span className="pill-tag">Card</span>
            <span className="pill-tag tan">COD</span>
          </div>
        </div>
      </div>
    </main>
  );
}

window.CartPage = CartPage;
