/* Tweaks panel */

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "coral": "#EC5D4A",
  "navStyle": "mega",
  "heroVariant": "editorial",
  "cardStyle": "boutique"
}/*EDITMODE-END*/;

function TweaksPanel() {
  const { tweaks, setTweaks, tweaksOpen, setTweaksOpen } = useStore();

  React.useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    // Apply current coral to CSS
    document.documentElement.style.setProperty('--coral', tweaks.coral || '#EC5D4A');
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--coral', tweaks.coral || '#EC5D4A');
  }, [tweaks.coral]);

  if (!tweaksOpen) return null;

  const corals = [
    ['#EC5D4A', 'Logo coral (default)'],
    ['#F39436', 'Orange (T)'],
    ['#F5C443', 'Yellow (K)'],
    ['#4FA36A', 'Green (O)'],
    ['#6FB8D9', 'Blue (Y)'],
    ['#1F2F4A', 'Slate navy'],
  ];

  return (
    <div className="tweaks-panel">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <h3>Tweaks</h3>
        <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={() => setTweaksOpen(false)}><SKUI.Icon name="close" size={14} /></button>
      </div>

      <div className="tweak-row">
        <label>Accent colour</label>
        <div className="tw-swatches">
          {corals.map(([c, n]) => (
            <div key={c} className={`tw-sw ${tweaks.coral === c ? 'active' : ''}`} style={{ background: c }}
              title={n} onClick={() => setTweaks({ coral: c })}></div>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>Hero variant</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['editorial', 'split', 'grid'].map(v => (
            <div key={v} className={`filter-chip ${tweaks.heroVariant === v ? 'active' : ''}`} onClick={() => setTweaks({ heroVariant: v })} style={{ fontSize: 11, padding: '4px 10px' }}>{v}</div>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>Card style</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['boutique', 'compact', 'framed'].map(v => (
            <div key={v} className={`filter-chip ${tweaks.cardStyle === v ? 'active' : ''}`} onClick={() => setTweaks({ cardStyle: v })} style={{ fontSize: 11, padding: '4px 10px' }}>{v}</div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 10, fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>
        Changes persist across sessions.
      </div>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
window.DEFAULTS = DEFAULTS;
