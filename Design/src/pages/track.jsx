/* Track order page */

function TrackPage() {
  const [mode, setMode] = React.useState('tracking');
  const [val, setVal] = React.useState('');
  const [tracked, setTracked] = React.useState(false);

  return (
    <main>
      <div className="container">
        <nav className="crumb"><a href="#home">Home</a><span className="sep">/</span><span className="current">Track order</span></nav>
      </div>
      <section className="track-hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow">Shipment tracking · powered by Universal Courier</div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 72, margin: '8px 0 16px', fontWeight: 700, letterSpacing: '-0.02em' }}>Where's it <em>at?</em></h1>
          <p style={{ maxWidth: 520, margin: '0 auto', color: 'var(--ink-soft)' }}>Enter your tracking number or order ID and we'll show you exactly where your toy is right now — down to the hour.</p>
        </div>

        <div className="track-form-card">
          <div className="track-tabs">
            <div className={`track-tab ${mode === 'tracking' ? 'active' : ''}`} onClick={() => setMode('tracking')}>Tracking number</div>
            <div className={`track-tab ${mode === 'order' ? 'active' : ''}`} onClick={() => setMode('order')}>Order ID + Email</div>
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>{mode === 'tracking' ? 'Tracking number' : 'Order ID'}</label>
            <input value={val} onChange={e => setVal(e.target.value)} placeholder={mode === 'tracking' ? 'e.g. UC7812345678' : '#SK-4821'} />
          </div>
          {mode === 'order' && (
            <div className="field" style={{ marginBottom: 16 }}><label>Email</label><input placeholder="you@example.com" /></div>
          )}
          <button className="btn btn-dark btn-block btn-lg" onClick={() => setTracked(true)}>Track order →</button>
        </div>
      </section>

      {tracked && (
        <section className="section">
          <div className="container" style={{ maxWidth: 820 }}>
            <div className="row-between" style={{ marginBottom: 24 }}>
              <div>
                <div className="eyebrow">Order #SK-4821 · 3 items</div>
                <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 40, margin: '6px 0', fontWeight: 700 }}>Out for <em>delivery</em></h2>
                <div style={{ color: 'var(--ink-soft)' }}>Expected today between 2pm and 6pm · Gulshan 2, Dhaka</div>
              </div>
              <span className="pill-tag coral">ETA TODAY</span>
            </div>

            <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 32 }}>
              <div className="timeline">
                {[
                  { s: 'done', t: 'Mon 14 Apr · 10:42', title: 'Order placed', d: 'Payment received via bKash' },
                  { s: 'done', t: 'Mon 14 Apr · 14:18', title: 'Packed & labelled', d: 'Dispatched from Gulshan warehouse' },
                  { s: 'done', t: 'Tue 15 Apr · 08:04', title: 'Picked up by courier', d: 'Universal Courier · Hub 04' },
                  { s: 'current', t: 'Tue 15 Apr · 11:21', title: 'Out for delivery', d: 'Rider Karim is 2 stops away' },
                  { s: '', t: 'Expected today', title: 'Delivered', d: 'We\'ll email you the receipt' },
                ].map((st, i) => (
                  <div key={i} className={`tl-step ${st.s}`}>
                    <div className="ttime">{st.t}</div>
                    <div className="ttitle">{st.title}</div>
                    <div className="tdesc">{st.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 20, background: 'var(--cream-deep)', borderRadius: 'var(--radius)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--tan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <SKUI.Icon name="user" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Karim · your delivery rider</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>+880 17XX XXX 421 · you can call or WhatsApp</div>
              </div>
              <button className="btn btn-ghost btn-sm">Call rider</button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

window.TrackPage = TrackPage;
