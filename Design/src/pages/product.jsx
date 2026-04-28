/* Product detail page */

function ProductPage({ slug }) {
  const { cart, navigate, toggleWish, wish } = useStore();
  const product = window.SK.PRODUCTS.find(p => p.slug === slug) || window.SK.PRODUCTS[0];
  const [thumb, setThumb] = React.useState(0);
  const [qty, setQty] = React.useState(1);
  const [color, setColor] = React.useState(0);
  const [tab, setTab] = React.useState('description');
  const off = product.was ? Math.round((1 - product.price / product.was) * 100) : 0;
  const wished = wish.includes(product.id);

  const thumbs = [product.img, ((product.img + 2) % 12) + 1, ((product.img + 5) % 12) + 1, ((product.img + 7) % 12) + 1];
  const colors = ['#EC5D4A', '#4FA36A', '#F5C443', '#6FB8D9'];
  const related = window.SK.PRODUCTS.filter(p => p.id !== product.id && (p.cat === product.cat || p.brand === product.brand)).slice(0, 4);

  return (
    <main>
      <div className="container">
        <nav className="crumb">
          <a href="#home">Home</a><span className="sep">/</span>
          <a href={`#cat/${product.cat}`}>{window.SK.CAT_BY_ID[product.cat]?.name || 'Toys'}</a><span className="sep">/</span>
          <span className="current">{product.name}</span>
        </nav>
      </div>

      <div className="container pdp">
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {thumbs.map((t, i) => (
              <div key={i} className={`pdp-thumb ${i === thumb ? 'active' : ''}`} onClick={() => setThumb(i)}>
                <SKUI.Placeholder variant={t} shape={false} />
              </div>
            ))}
          </div>
          <div className="pdp-main-img">
            <SKUI.Placeholder variant={thumbs[thumb]} label="Product photography" shape={false} />
            {product.was && (
              <div style={{ position: 'absolute', top: 16, left: 16, background: 'var(--coral)', color: 'white', padding: '6px 12px', borderRadius: 3, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', fontWeight: 600 }}>
                −{off}% TODAY
              </div>
            )}
          </div>
        </div>

        <div className="pdp-info">
          <div className="pdp-brand">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--coral)' }}></span>
            {product.brand}
            <span style={{ opacity: .5 }}>·</span>
            Ages {product.age?.replace('age-', '')}
          </div>
          <h1>{product.name.split(' ').slice(0, -1).join(' ')} <em>{product.name.split(' ').slice(-1)}</em></h1>

          <div className="pdp-rating-row">
            <SKUI.Stars value={product.rating} size={16} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{product.rating.toFixed(1)}</span>
            <a onClick={() => setTab('reviews')}>{product.reviews} verified reviews</a>
          </div>

          <div className="pdp-price">
            <span className="now">{fmtTk(product.price)}</span>
            {product.was && <span className="was">{fmtTk(product.was)}</span>}
            {off > 0 && <span className="save">You save ৳{(product.was - product.price).toLocaleString()}</span>}
          </div>

          <div className="pdp-options">
            <div className="pdp-option-group">
              <div className="pdp-option-head">
                <span className="lab">Colour</span>
                <span className="val">{['Coral', 'Forest', 'Tan', 'Charcoal'][color]}</span>
              </div>
              <div className="swatches">
                {colors.map((c, i) => (
                  <div key={i} className={`swatch ${i === color ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(i)}></div>
                ))}
              </div>
            </div>

            <div className="pdp-option-group">
              <div className="pdp-option-head">
                <span className="lab">Bundle</span>
                <span className="val muted">Optional</span>
              </div>
              <div className="size-pills">
                <div className="size-pill active">Single</div>
                <div className="size-pill">Pair · save 10%</div>
                <div className="size-pill">Gift set · save 15%</div>
              </div>
            </div>
          </div>

          <div className="qty-row">
            <div className="qty-stepper">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <input value={qty} readOnly />
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <span className="eyebrow">{product.stock} in stock · Ships from Dhaka in 24h</span>
          </div>

          <div className="pdp-actions">
            <button className="btn btn-dark btn-lg" onClick={() => cart.add(product, qty)}>
              <SKUI.Icon name="bag" size={16} /> Add to bag — {fmtTk(product.price * qty)}
            </button>
            <button className={`btn btn-ghost btn-lg icon-btn`} style={{ width: 56, borderRadius: 999, padding: 0, color: wished ? 'var(--coral)' : 'var(--ink)' }} onClick={() => toggleWish(product.id)}>
              <SKUI.Icon name="heart" size={18} />
            </button>
          </div>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => { cart.add(product, qty); navigate('checkout'); }}>
            Buy it now →
          </button>

          <ul className="pdp-bullets" style={{ marginTop: 32 }}>
            <li><span className="icn">✓</span><span><strong>Safety-tested</strong> to EN 71 & ASTM F963. No BPA, phthalates, or lead in finish.</span></li>
            <li><span className="icn">✓</span><span><strong>Ships from Dhaka</strong> · 1–3 days across Bangladesh. COD available.</span></li>
            <li><span className="icn">✓</span><span><strong>7-day returns</strong> on unused items in original packaging.</span></li>
            <li><span className="icn">✓</span><span><strong>Gift wrap</strong> available at checkout — kraft paper, hand-tied ribbon.</span></li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="container">
        <div className="tabs">
          {['description', 'details', 'shipping', 'reviews'].map(t => (
            <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}{t === 'reviews' && ` (${product.reviews})`}
            </div>
          ))}
        </div>

        {tab === 'description' && (
          <div className="tab-content">
            <p>A quietly excellent {product.name.toLowerCase()} from <strong>{product.brand}</strong>. Built for the daily use of a real child, not a photo shoot: rounded edges, matte finish, and the kind of weight that survives a dropped playdate.</p>
            <p>We stocked this because our own buying team's kids kept asking for it. It's age-graded for {product.age?.replace('age-', '')} years but most families report it stays in rotation well beyond.</p>
            <p><strong>In the box:</strong> One {product.name.toLowerCase()} · Cotton dust-bag · Printed care card · Recyclable kraft box.</p>
          </div>
        )}
        {tab === 'details' && (
          <div className="tab-content">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                ['Material', 'Beechwood, non-toxic water-based finish'],
                ['Dimensions', '22 × 18 × 14 cm'],
                ['Weight', '480 g'],
                ['Age grade', product.age?.replace('age-', '') + ' years'],
                ['Brand', product.brand],
                ['Country of origin', 'Germany'],
                ['SKU', product.id.toUpperCase() + '-' + product.img],
              ].map(([k, v]) => (
                <li key={k} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span className="muted">{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'shipping' && (
          <div className="tab-content">
            <p><strong>Free standard shipping</strong> on orders over ৳2,500 — anywhere in Bangladesh. Orders placed before 2pm ship the same day from our Gulshan warehouse.</p>
            <p><strong>Dhaka</strong> · 1 business day · ৳60<br/>
               <strong>Chittagong / Sylhet / Rajshahi</strong> · 2 business days · ৳120<br/>
               <strong>Elsewhere in Bangladesh</strong> · 2–3 business days · ৳180</p>
            <p><strong>Returns</strong> are easy. You have 7 days from delivery to send unused items back in their original packaging. We'll refund to your original payment method within 3 business days of receiving the return.</p>
          </div>
        )}
        {tab === 'reviews' && (
          <div className="tab-content" style={{ maxWidth: 920 }}>
            <div className="review-summary">
              <div>
                <div><span className="score">{product.rating.toFixed(1)}</span><span className="of">/ 5</span></div>
                <SKUI.Stars value={product.rating} size={20} />
                <div style={{ color: 'var(--ink-mute)', fontSize: 13, marginTop: 8 }}>Based on {product.reviews} verified reviews</div>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>Write a review</button>
              </div>
              <div className="review-bars">
                {[5, 4, 3, 2, 1].map(n => {
                  const w = n === 5 ? 72 : n === 4 ? 20 : n === 3 ? 5 : n === 2 ? 2 : 1;
                  return (
                    <div key={n} className="review-bar">
                      <span>{n} ★</span>
                      <div className="bar"><div className="fill" style={{ width: w + '%' }}></div></div>
                      <span>{w}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="review-list">
              {window.SK.REVIEW_SNIPPETS.map((r, i) => (
                <div className="review-item" key={i}>
                  <div className="review-head">
                    <div>
                      <span className="review-who">{r.who}</span>
                      {r.verified && <span className="review-verified">✓ Verified buyer</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="stars" style={{ color: 'var(--tan)', letterSpacing: 1.5 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                      <span className="review-date">{r.date}</span>
                    </div>
                  </div>
                  <div className="review-body">{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">You might also like</div>
              <h2>Picked <em>with this</em>.</h2>
            </div>
          </div>
          <div className="grid-products">
            {related.map(p => <SKUI.ProductCard key={p.id} product={p} onOpen={(p) => navigate(`p/${p.slug}`)} />)}
          </div>
        </div>
      </section>
    </main>
  );
}

window.ProductPage = ProductPage;
