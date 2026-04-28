/* Checkout page */

function CheckoutPage() {
  const { cart, navigate, pushToast } = useStore();
  const [payment, setPayment] = React.useState('bkash');
  const [shipping, setShipping] = React.useState('standard');
  const [gift, setGift] = React.useState(false);
  const [giftMsg, setGiftMsg] = React.useState('');
  const [email, setEmail] = React.useState('');

  const items = cart.items.map(i => ({ ...i, p: window.SK.PRODUCTS.find(x => x.id === i.id) })).filter(i => i.p);
  const shippingCost = shipping === 'express' ? 250 : cart.subtotal >= 2500 ? 0 : 120;
  const giftCost = gift ? 120 : 0;
  const total = cart.subtotal + shippingCost + giftCost;

  return (
    <main>
      <div className="container">
        <nav className="crumb">
          <a href="#home">Home</a><span className="sep">/</span>
          <a href="#cart">Bag</a><span className="sep">/</span>
          <span className="current">Checkout</span>
        </nav>
      </div>

      <div className="container checkout-layout">
        <div className="checkout">
          <section style={{ marginBottom: 48 }}>
            <h2><span className="step">01</span>Contact</h2>
            <div className="form-row">
              <div className="field">
                <label>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
              <input type="checkbox" defaultChecked /> Email me letters from SK Toy — no spam, just two a month.
            </label>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2><span className="step">02</span>Delivery</h2>
            <div className="form-row cols-2">
              <div className="field"><label>First name</label><input /></div>
              <div className="field"><label>Last name</label><input /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Street address</label><input placeholder="House / road / building" /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Apartment, floor (optional)</label><input /></div>
            </div>
            <div className="form-row cols-3">
              <div className="field"><label>City</label><input defaultValue="Dhaka" /></div>
              <div className="field"><label>Area / Thana</label>
                <select defaultValue="Gulshan">
                  <option>Gulshan</option><option>Banani</option><option>Dhanmondi</option><option>Uttara</option><option>Mirpur</option>
                </select>
              </div>
              <div className="field"><label>Postal code</label><input /></div>
            </div>
            <div className="form-row">
              <div className="field"><label>Mobile number</label><input placeholder="+880 1XXX XXX XXX" /></div>
            </div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
              <input type="checkbox" /> Save this address for next time
            </label>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2><span className="step">03</span>Shipping method</h2>
            <div className="radio-list">
              <div className={`radio-row ${shipping === 'standard' ? 'active' : ''}`} onClick={() => setShipping('standard')}>
                <div className="rcircle"></div>
                <div className="rlabel">
                  <div className="rname">Standard · Universal Courier</div>
                  <div className="rdesc">2–3 business days across Bangladesh</div>
                </div>
                <div className="rright">{cart.subtotal >= 2500 ? 'Free' : '৳120'}</div>
              </div>
              <div className={`radio-row ${shipping === 'express' ? 'active' : ''}`} onClick={() => setShipping('express')}>
                <div className="rcircle"></div>
                <div className="rlabel">
                  <div className="rname">Express · Same-day Dhaka</div>
                  <div className="rdesc">Order before 2pm · within Dhaka Metro only</div>
                </div>
                <div className="rright">৳250</div>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2><span className="step">04</span>Gift options</h2>
            <div className="gift-box" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={gift} onChange={e => setGift(e.target.checked)} />
                <div className="gift-head" style={{ margin: 0 }}>
                  <span className="ico"><SKUI.Icon name="gift" size={12} /></span>
                  Wrap it · kraft paper + hand-tied ribbon <span style={{ color: 'var(--ink-mute)', marginLeft: 6 }}>(+৳120)</span>
                </div>
              </label>
              {gift && (
                <>
                  <p style={{ marginTop: 10 }}>We'll tuck a hand-written note inside, priced out, and omit the receipt.</p>
                  <textarea placeholder="Gift message, up to 140 characters" value={giftMsg} onChange={e => setGiftMsg(e.target.value)} maxLength={140} />
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{140 - giftMsg.length} characters left</div>
                </>
              )}
            </div>
          </section>

          <section>
            <h2><span className="step">05</span>Payment</h2>
            <div className="radio-list">
              {[
                { v: 'bkash', n: 'bKash', d: 'Instant · 5% off when you pay with bKash', tag: '−5%' },
                { v: 'nagad', n: 'Nagad', d: 'Instant mobile payment' },
                { v: 'card', n: 'Credit / Debit card', d: 'Visa, Mastercard, AmEx — secured by SSLCommerz' },
                { v: 'cod', n: 'Cash on Delivery', d: 'Pay in cash when your order arrives' },
              ].map(p => (
                <div key={p.v} className={`radio-row ${payment === p.v ? 'active' : ''}`} onClick={() => setPayment(p.v)}>
                  <div className="rcircle"></div>
                  <div className="rlabel">
                    <div className="rname">{p.n} {p.tag && <span className="pill-tag coral" style={{ marginLeft: 6 }}>{p.tag}</span>}</div>
                    <div className="rdesc">{p.d}</div>
                  </div>
                  <div className="rright" style={{ display: 'flex', gap: 4 }}>
                    {p.v === 'card' && <><span className="pill-tag">VISA</span><span className="pill-tag">MC</span></>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button className="btn btn-dark btn-lg btn-block" style={{ marginTop: 32 }}
            onClick={() => { pushToast('Order placed! Redirecting…'); setTimeout(() => { cart.clear(); navigate('track'); }, 800); }}>
            Place order — {fmtTk(total)}
          </button>
          <p style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', textAlign: 'center', marginTop: 12, letterSpacing: '.05em' }}>
            Secure checkout · SSL encrypted · Your data stays in Bangladesh
          </p>
        </div>

        <aside className="checkout-summary">
          <div className="row-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, margin: 0, fontWeight: 400 }}>Order · {cart.count} items</h3>
            <a href="#cart" style={{ fontSize: 12, borderBottom: '1px solid var(--border)' }}>edit</a>
          </div>
          <div className="cs-items">
            {items.map(({ p, qty, key }) => (
              <div className="cs-item" key={key}>
                <div className="thumb">
                  <SKUI.Placeholder variant={p.img} shape={false} />
                  <span className="qtyb">{qty}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{p.brand}</div>
                </div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{fmtTk(p.price * qty)}</div>
              </div>
            ))}
          </div>
          <div style={{ paddingTop: 16 }}>
            <div className="summary-row"><span>Subtotal</span><span>{fmtTk(cart.subtotal)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : fmtTk(shippingCost)}</span></div>
            {gift && <div className="summary-row"><span>Gift wrap</span><span>{fmtTk(giftCost)}</span></div>}
            <div className="summary-row total"><span>Total (BDT)</span><span>{fmtTk(total)}</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}

window.CheckoutPage = CheckoutPage;
