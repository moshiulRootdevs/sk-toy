/* Home page */

function HomePage() {
  const { navigate } = useStore();
  const products = window.SK.PRODUCTS;
  const newArrivals = products.slice(0, 8);
  const sale = products.filter(p => p.was).slice(0, 8);
  const popular = products.slice(4, 12);

  return (
    <main>
      <section className="hero hero-kid">
        <div className="hero-shapes" aria-hidden="true">
          <span className="shape s1"></span>
          <span className="shape s2"></span>
          <span className="shape s3"></span>
          <span className="shape s4"></span>
          <span className="shape s5"></span>
          <span className="shape s6"></span>
          <span className="shape s7"></span>
        </div>
        <div className="container hero-inner">
          <div>
            <div className="hero-pill">
              <span className="dot" style={{ background: '#F5C443' }}></span>
              Spring '26 · Making childhood more joyful
            </div>
            <h1 className="hero-title">
              Big smiles,<br />
              handpicked toys.
            </h1>
            <p>
              Bangladesh's friendliest toy house, right in Dhaka. Thousands of toys from
              64 trusted brands — wooden builds, cuddly plush, drones, dinosaurs and everything between.
            </p>
            <div className="hero-actions">
              <button className="btn btn-coral btn-lg btn-rounded" onClick={() => navigate('cat/new-arrivals')}>
                Shop new arrivals <SKUI.Icon name="arrowRight" size={14} />
              </button>
              <button className="btn btn-white btn-lg btn-rounded" onClick={() => navigate('cat/by-age')}>
                Shop by age
              </button>
            </div>
            <div className="hero-meta">
              <div className="stat"><span className="num">2,400+</span><span className="lab">Toys</span></div>
              <div className="stat"><span className="num">64</span><span className="lab">Brands</span></div>
              <div className="stat"><span className="num">4.8★</span><span className="lab">9,210 reviews</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-card hc-1" style={{ background: '#F5C443' }}>
                <window.SK_TOYS.ToyBlocks size={180} />
              </div>
              <div className="hero-card hc-2" style={{ background: '#4FA36A' }}>
                <window.SK_TOYS.ToyCar size={190} />
              </div>
              <div className="hero-card hc-3" style={{ background: '#6FB8D9' }}>
                <window.SK_TOYS.ToyBear size={180} />
              </div>
              <div className="hero-card hc-4" style={{ background: '#F28BA8' }}>
                <window.SK_TOYS.ToyRocket size={180} />
              </div>
            </div>
            <div className="hero-sticker-kid">
              <span className="lab">SAVE UP TO</span>
              <span className="big">30%</span>
              <span className="sub">sitewide</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category tiles */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">The catalogue</div>
              <h2>Every <span className="accent">aisle,</span> in order.</h2>
            </div>
            <div className="side">Browse twelve main categories and nearly a hundred sub-shelves — or shop by age, gender, or occasion.</div>
          </div>
          <div className="cats">
            {[
              { n: 'Diecast', s: 'toys/diecast', ic: 'diecast', d: 'Model cars & vehicles' },
              { n: 'Plush', s: 'toys/plush', ic: 'plush', d: 'Soft toys & teddies' },
              { n: 'Building', s: 'toys/building', ic: 'building', d: 'Blocks & tiles' },
              { n: 'Remote Control', s: 'toys/rc', ic: 'rc', d: 'RC cars & drones' },
              { n: 'Figures', s: 'toys/figures', ic: 'figures', d: 'Action & play sets' },
              { n: 'School', s: 'learning/school', ic: 'school', d: 'Supplies & backpacks' },
              { n: 'STEM', s: 'learning/stem', ic: 'stem', d: 'Learn-by-making' },
              { n: 'Puzzles', s: 'learning/puzzle', ic: 'puzzle', d: 'Quiet-time classics' },
              { n: 'Baby', s: 'baby', ic: 'baby', d: '0–2 yrs gear' },
              { n: 'Outdoor', s: 'outdoor', ic: 'outdoor', d: 'Pool & sports' },
              { n: 'Montessori', s: 'learning/montessori', ic: 'montessori', d: 'Hands-on learning' },
              { n: 'Gifting', s: 'toys', ic: 'gifting', d: 'Wrapped & ready' },
            ].map(c => {
              const color = window.SK_CATS.catColor(c.s);
              return (
                <div className="cat-tile kid" key={c.n} onClick={() => navigate(`cat/${c.s}`)}
                  style={{ '--tile-color': color }}>
                  <div className="cat-art-kid" style={{ background: color + '22', color: color }}>
                    <window.SK_CATS.CatIcon name={c.ic} size={48} />
                  </div>
                  <div className="cat-name">{c.n}</div>
                  <div className="cat-count">{c.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ages */}
      <section className="section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Shop by age</div>
              <h2>From <span className="accent">first rattle</span> to <span className="accent">first bike.</span></h2>
            </div>
            <div className="side">Every product on SK Toy is age-graded by our in-house team of parents, nursery teachers, and one very opinionated pediatrician.</div>
          </div>
          <div className="ages">
            {[
              { from: '0', to: '2', name: 'Babies', slug: 'age/0-2', bg: '#F28BA8', ink: '#1F2F4A' },
              { from: '3', to: '5', name: 'Preschool', slug: 'age/3-5', bg: '#F5C443', ink: '#1F2F4A' },
              { from: '6', to: '8', name: 'Early school', slug: 'age/6-8', bg: '#4FA36A', ink: '#FBF4E8' },
              { from: '9', to: '12', name: 'Tweens', slug: 'age/9-12', bg: '#6FB8D9', ink: '#1F2F4A' },
              { from: '13', to: '+', name: 'Teens', slug: 'age/teen', bg: '#1F2F4A', ink: '#FBF4E8' },
            ].map(a => (
              <div className="age-tile" key={a.from} onClick={() => navigate(`cat/${a.slug}`)}
                style={{ '--tile-bg': a.bg, '--tile-ink': a.ink }}>
                <div className="age-num">{a.from}<em>–</em>{a.to}</div>
                <div className="age-lab">years</div>
                <div className="age-name">{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals grid */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">This week</div>
              <h2>Just <span className="accent">landed.</span></h2>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate('cat/new-arrivals')}>See all new arrivals →</button>
          </div>
          <div className="grid-products">
            {newArrivals.map(p => <SKUI.ProductCard key={p.id} product={p} onOpen={(p) => navigate(`p/${p.slug}`)} />)}
          </div>
        </div>
      </section>

      {/* Editorial band — gender */}
      <section className="section">
        <div className="container">
          <div className="band yellow">
            <div>
              <div className="eyebrow">Editorial</div>
              <h2>For every<br/>kind of play.</h2>
              <p>Boys, girls, and not-a-category-kids each have a shelf. Filter by interest, not stereotype — our neutral picks are the fastest-growing shelf in the shop.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-dark btn-rounded" onClick={() => navigate('cat/gender/boys')}>For boys</button>
                <button className="btn btn-dark btn-rounded" onClick={() => navigate('cat/gender/girls')}>For girls</button>
                <button className="btn btn-outline btn-rounded" onClick={() => navigate('cat/gender/neutral')}>Unisex →</button>
              </div>
            </div>
            <div className="band-visual">
              <SKUI.Placeholder variant={4} label="Lifestyle photography" shape={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Sale strip */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ color: 'var(--coral)' }}>End-of-season sale · up to 40% off</div>
              <h2>The <span className="accent">mark-down</span> shelf.</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate('sale')}>Shop all sale →</button>
          </div>
          <div className="grid-products">
            {sale.map(p => <SKUI.ProductCard key={p.id} product={p} onOpen={(p) => navigate(`p/${p.slug}`)} />)}
          </div>
        </div>
      </section>

      {/* Damaged & returned band */}
      <section>
        <div className="container">
          <div className="band dark">
            <div>
              <div className="eyebrow">Second chances</div>
              <h2>Slightly<br/>imperfect.<br/>Significantly less.</h2>
              <p>A small corner of the shop for open-box, returned, or gently-dented items. We tag every fault honestly and price them accordingly — up to 65% off.</p>
              <button className="btn" style={{ background: 'var(--coral)', color: 'white' }} onClick={() => navigate('damaged')}>
                Shop damaged & returned <SKUI.Icon name="arrowRight" size={14} />
              </button>
            </div>
            <div className="band-visual" style={{ background: 'linear-gradient(135deg, #8a857c, #2D2D2D)' }}>
              <SKUI.Placeholder variant={11} label="Open-box product" shape={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">The shelf</div>
              <h2>Sixty-four <span className="accent">brands</span>, carefully chosen.</h2>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate('brands')}>See every brand →</button>
          </div>
          <div className="brand-strip">
            {window.SK.BRANDS.map(b => (
              <div className="brand-card" key={b.name} onClick={() => navigate('brands')}>
                <span>{b.em.slice(0, 1)}<em>{b.em.slice(1).toLowerCase() || '.'}</em></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">On the play-table</div>
              <h2>What Dhaka's kids are <em>actually</em> reaching for.</h2>
            </div>
          </div>
          <div className="grid-products">
            {popular.map(p => <SKUI.ProductCard key={p.id} product={p} onOpen={(p) => navigate(`p/${p.slug}`)} />)}
          </div>
        </div>
      </section>

      {/* Journal teaser */}
      <section className="section-tight" style={{ background: 'var(--paper)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">The journal</div>
              <h2>Read, then <em>play.</em></h2>
            </div>
            <button className="btn btn-ghost" onClick={() => navigate('blog')}>All stories →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {window.SK.BLOG_POSTS.slice(0, 3).map(post => (
              <div className="blog-card" key={post.id} onClick={() => navigate(`article/${post.id}`)}>
                <div className="img"><SKUI.Placeholder variant={post.img} label="Editorial" /></div>
                <div className="blog-meta"><span className="cat">{post.category}</span>{post.read}</div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reassurance strip */}
      <section className="section-tight">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { i: 'truck', t: 'Free shipping', d: 'On orders over ৳2,500, across 64 districts.' },
            { i: 'shield', t: '7-day returns', d: 'No questions asked, in original packaging.' },
            { i: 'gift', t: 'Gift wrapping', d: 'Add ৳120 at checkout. Hand-tied ribbon.' },
            { i: 'package', t: 'Cash on delivery', d: 'Pay when your order arrives, everywhere.' },
          ].map(r => (
            <div key={r.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 20, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--paper)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--coral-soft)', color: 'var(--coral-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SKUI.Icon name={r.i} size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{r.t}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.5 }}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

window.HomePage = HomePage;
