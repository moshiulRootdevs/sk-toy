/* Blog index and article */

function BlogPage() {
  const { navigate } = useStore();
  const posts = window.SK.BLOG_POSTS;
  const [f, ...rest] = posts;

  return (
    <main>
      <section className="blog-hero">
        <div className="container">
          <div className="eyebrow">The journal</div>
          <h1>Stories, <em>slowly told.</em></h1>
          <p>Buying guides, play ideas, and the occasional essay from the shop's owners. No hot takes. No pop-ups. Just things we think are worth reading.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            {['All', 'Buying Guides', 'Editorial', 'Journal', 'Learning', 'Baby', 'Gift Guide'].map((t, i) => (
              <div key={t} className={`subnav-pill ${i === 0 ? 'active' : ''}`}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container blog-featured">
          <div className="bf-main" onClick={() => navigate(`article/${f.id}`)} style={{ cursor: 'pointer' }}>
            <SKUI.Placeholder variant={f.img} label="Featured story" />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 32, color: 'white', background: 'linear-gradient(to top, rgba(45,45,45,.85), transparent)' }}>
              <div className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>{f.category} · {f.read}</div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 48, margin: '8px 0 4px', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>{f.title}</h2>
              <div style={{ fontSize: 13, opacity: .8 }}>By {f.author} · {f.date}</div>
            </div>
          </div>
          <div className="bf-side">
            {posts.slice(1, 4).map(p => (
              <div className="bf-side-item" key={p.id} onClick={() => navigate(`article/${p.id}`)} style={{ cursor: 'pointer' }}>
                <div className="img"><SKUI.Placeholder variant={p.img} /></div>
                <div>
                  <div className="blog-meta" style={{ marginBottom: 4 }}><span className="cat">{p.category}</span></div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 20, lineHeight: 1.15, fontWeight: 400 }}>{p.title}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)', marginTop: 6, letterSpacing: '.08em' }}>{p.date.toUpperCase()} · {p.read.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container blog-grid">
          {rest.map(p => (
            <div className="blog-card" key={p.id} onClick={() => navigate(`article/${p.id}`)}>
              <div className="img"><SKUI.Placeholder variant={p.img} label={p.category} /></div>
              <div className="blog-meta"><span className="cat">{p.category}</span>{p.read} · {p.date}</div>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ArticlePage({ id }) {
  const { navigate } = useStore();
  const post = window.SK.BLOG_POSTS.find(p => p.id === id) || window.SK.BLOG_POSTS[0];
  const body = window.SK.ARTICLE_BODY.split('\n\n');

  return (
    <main>
      <div className="container">
        <nav className="crumb">
          <a href="#home">Home</a><span className="sep">/</span>
          <a href="#blog">Journal</a><span className="sep">/</span>
          <span className="current">{post.title}</span>
        </nav>
      </div>
      <article className="article article-layout container">
        <div className="eyebrow" style={{ color: 'var(--coral)' }}>{post.category.toUpperCase()} · {post.read.toUpperCase()}</div>
        <h1>{post.title}</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>
          <span>By <strong>{post.author}</strong></span><span>·</span><span>{post.date}</span>
        </div>
        <div className="hero-img"><SKUI.Placeholder variant={post.img} label="Hero image" /></div>
        <p className="lead">{post.excerpt}</p>
        {body.map((chunk, i) => {
          if (chunk.startsWith('## ')) return <h2 key={i}>{chunk.slice(3)}</h2>;
          if (chunk.startsWith('> ')) return <blockquote key={i}>{chunk.slice(2)}</blockquote>;
          return <p key={i}>{chunk}</p>;
        })}
        <div style={{ marginTop: 48, padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="eyebrow" style={{ marginRight: 12 }}>Tagged</span>
          {['Diecast', 'Buying guide', 'Age 6–8', 'Collecting'].map(t => <span key={t} className="pill-tag">{t}</span>)}
        </div>
        <div style={{ marginTop: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Keep reading</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {window.SK.BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 3).map(p => (
              <div className="blog-card" key={p.id} onClick={() => navigate(`article/${p.id}`)}>
                <div className="img" style={{ aspectRatio: '4/3' }}><SKUI.Placeholder variant={p.img} /></div>
                <div className="blog-meta"><span className="cat">{p.category}</span></div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 400, lineHeight: 1.15 }}>{p.title}</div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}

window.BlogPage = BlogPage;
window.ArticlePage = ArticlePage;
