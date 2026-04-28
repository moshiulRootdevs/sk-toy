/* Admin shared primitives: icons, buttons, tables, pills, modals, charts */

const AdminUI = {};

/* ---------- icons (stroke, 20px viewbox, 1.6 stroke) ---------- */
const AdminIcon = ({ name, size = 18, color = 'currentColor' }) => {
  const paths = {
    dashboard: 'M4 4h6v6H4zM4 13h6v7H4zM13 4h7v7h-7zM13 14h7v6h-7z',
    orders: 'M4 7h16v12H4zM8 7V5a4 4 0 0 1 8 0v2',
    products: 'M4 8l8-4 8 4M4 8v9l8 4 8-4V8M4 8l8 4 8-4M12 12v10',
    category: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    brand: 'M4 6a2 2 0 0 1 2-2h8l6 6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM14 4v4a2 2 0 0 0 2 2h4',
    inventory: 'M3 7l9-4 9 4-9 4zM3 7v10l9 4M21 7v10l-9 4M7 9v5l5 2',
    customer: 'M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
    review: 'M3 20l2-5h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z',
    coupon: 'M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4zM10 7v2M10 11v2M10 15v2',
    shipping: 'M1 8h14v9H1zM15 12h5l3 3v2h-8M4 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
    payment: 'M2 6h20v12H2zM2 10h20M6 14h4',
    cms: 'M5 4h11l3 3v13H5zM15 4v5h4',
    nav: 'M4 6h16M4 12h16M4 18h16',
    media: 'M4 4h16v14H4zM4 14l4-4 5 5 3-3 4 4M9 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12a7 7 0 0 0-.1-1.2l2.1-1.6-2-3.5-2.5.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.4a7 7 0 0 0-2 1.2l-2.5-.9-2 3.5L5.1 10.8 5 12a7 7 0 0 0 .1 1.2l-2.1 1.6 2 3.5 2.5-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.4a7 7 0 0 0 2-1.2l2.5.9 2-3.5-2.1-1.6c0-.4.1-.8.1-1.2',
    report: 'M4 20V4M4 20h16M7 16v-5M11 16v-9M15 16v-7M19 16v-3',
    audit: 'M4 4h11l5 5v11H4zM15 4v5h5M8 13h8M8 17h5',
    search: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.35-4.35',
    plus: 'M12 5v14M5 12h14',
    edit: 'M4 20l4-1 11-11-3-3L5 16zM14 7l3 3',
    trash: 'M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    filter: 'M4 6h16M7 12h10M10 18h4',
    sort: 'M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3',
    check: 'M5 12l5 5L20 7',
    x: 'M6 6l12 12M18 6L6 18',
    chevL: 'M15 6l-6 6 6 6',
    chevR: 'M9 6l6 6-6 6',
    chevD: 'M6 9l6 6 6-6',
    chevU: 'M18 15l-6-6-6 6',
    dots: 'M12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M12 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
    external: 'M14 5h5v5M19 5l-9 9M13 7H6v11h11v-7',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
    bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9M10 21a2 2 0 1 0 4 0',
    menu: 'M4 6h16M4 12h16M4 18h16',
    home: 'M4 10l8-7 8 7v10h-5v-6h-6v6H4z',
    logout: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3',
    calendar: 'M3 6h18v15H3zM3 10h18M8 3v4M16 3v4',
    image: 'M4 4h16v14H4zM4 14l4-4 5 5 3-3 4 4M9 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
    upload: 'M12 15V3M8 7l4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    download: 'M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    tag: 'M20 12l-8 8-9-9V3h8zM7 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
    grip: 'M9 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M9 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2M9 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M15 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2M15 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    flag: 'M5 3v18M5 5l12-1-2 5 2 5-12 1',
    star: 'M12 3l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L3 10l6-1z',
  };
  const d = paths[name] || paths.dashboard;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: '0 0 auto' }}>
      <path d={d} />
    </svg>
  );
};
AdminUI.Icon = AdminIcon;

/* ---------- helpers ---------- */
const fmtBDT = (n) => '৳' + Math.round(n).toLocaleString('en-IN');
const fmtDate = (d) => {
  const dt = typeof d === 'string' ? new Date(d) : (typeof d === 'number' ? new Date(d) : d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtDateTime = (d) => {
  const dt = typeof d === 'string' ? new Date(d) : (typeof d === 'number' ? new Date(d) : d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' + dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};
const relTime = (d) => {
  const dt = typeof d === 'string' ? new Date(d) : (typeof d === 'number' ? new Date(d) : d);
  const diff = (Date.now() - dt.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + 'd ago';
  return fmtDate(dt);
};
AdminUI.fmtBDT = fmtBDT;
AdminUI.fmtDate = fmtDate;
AdminUI.fmtDateTime = fmtDateTime;
AdminUI.relTime = relTime;

/* ---------- pill / badge ---------- */
const Pill = ({ kind = 'default', children, size = 'md' }) => {
  const colors = {
    default: { bg: '#F5F1EA', fg: '#2A2420', bd: '#E8DFD2' },
    brand:   { bg: '#FEE8E4', fg: '#B8432E', bd: '#FCC9BF' },
    warn:    { bg: '#FEF4D4', fg: '#7A5B0A', bd: '#F5E1A0' },
    ok:      { bg: '#DCF0E3', fg: '#24603C', bd: '#B2DBBF' },
    info:    { bg: '#DCECF7', fg: '#1F4F72', bd: '#B2D4EC' },
    danger:  { bg: '#FBDED8', fg: '#9B2914', bd: '#F2A89B' },
    muted:   { bg: '#EEEAE3', fg: '#6B625A', bd: 'transparent' },
    new:     { bg: '#EC5D4A', fg: '#FFF', bd: '#EC5D4A' },
  };
  const c = colors[kind] || colors.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '1px 7px' : '3px 9px',
      fontSize: size === 'sm' ? 10 : 11,
      fontFamily: 'var(--font-mono)',
      background: c.bg, color: c.fg, border: '1px solid ' + c.bd,
      borderRadius: 999, letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
};
AdminUI.Pill = Pill;

/* ---------- button ---------- */
const Button = ({ children, kind = 'default', size = 'md', icon, onClick, disabled, style, type = 'button', title, full }) => {
  const kinds = {
    primary: { bg: '#EC5D4A', fg: '#FFF', bd: '#EC5D4A', hoverBg: '#D74A38' },
    default: { bg: '#FFF', fg: '#2A2420', bd: '#D8CFBF', hoverBg: '#F5F1EA' },
    ghost:   { bg: 'transparent', fg: '#5A5048', bd: 'transparent', hoverBg: '#F2EEE6' },
    danger:  { bg: '#FFF', fg: '#9B2914', bd: '#F2A89B', hoverBg: '#FBDED8' },
    dark:    { bg: '#1F2F4A', fg: '#FFF', bd: '#1F2F4A', hoverBg: '#2E4068' },
  };
  const c = kinds[kind] || kinds.default;
  const sizes = { sm: { px: 10, py: 5, fs: 12 }, md: { px: 14, py: 8, fs: 13 }, lg: { px: 18, py: 11, fs: 14 } };
  const s = sizes[size];
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: c.bg, color: c.fg, border: '1px solid ' + c.bd,
        padding: `${s.py}px ${s.px}px`, fontSize: s.fs, fontWeight: 500,
        borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all .12s',
        fontFamily: 'inherit',
        width: full ? '100%' : 'auto',
        justifyContent: full ? 'center' : undefined,
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = c.hoverBg; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = c.bg; }}
    >
      {icon && <AdminIcon name={icon} size={size === 'sm' ? 13 : 14} />}
      {children}
    </button>
  );
};
AdminUI.Button = Button;

/* ---------- input ---------- */
const Input = ({ value, onChange, placeholder, type = 'text', icon, suffix, style, full, ...rest }) => (
  <label style={{
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: '#FFF', border: '1px solid #D8CFBF', borderRadius: 8,
    padding: '7px 11px', transition: 'border-color .15s',
    width: full ? '100%' : undefined,
    ...style,
  }}>
    {icon && <AdminIcon name={icon} size={14} color="#8B8176" />}
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: '#2A2420', flex: 1, minWidth: 0 }}
      {...rest}
    />
    {suffix && <span style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{suffix}</span>}
  </label>
);
AdminUI.Input = Input;

const Textarea = ({ value, onChange, placeholder, rows = 4, style }) => (
  <textarea
    value={value ?? ''}
    onChange={e => onChange && onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: '100%', background: '#FFF', border: '1px solid #D8CFBF', borderRadius: 8,
      padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', color: '#2A2420',
      outline: 0, resize: 'vertical', lineHeight: 1.5,
      ...style,
    }}
  />
);
AdminUI.Textarea = Textarea;

const Select = ({ value, onChange, options, style, full }) => (
  <select
    value={value ?? ''}
    onChange={e => onChange && onChange(e.target.value)}
    style={{
      background: '#FFF', border: '1px solid #D8CFBF', borderRadius: 8,
      padding: '7px 11px', fontSize: 13, fontFamily: 'inherit', color: '#2A2420',
      outline: 0, cursor: 'pointer', width: full ? '100%' : undefined,
      ...style,
    }}
  >
    {options.map(o => typeof o === 'string'
      ? <option key={o} value={o}>{o}</option>
      : <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
AdminUI.Select = Select;

/* ---------- toggle ---------- */
const Toggle = ({ on, onChange, label }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
    <span
      onClick={() => onChange(!on)}
      style={{
        width: 36, height: 20, borderRadius: 999,
        background: on ? '#EC5D4A' : '#D8CFBF',
        position: 'relative', transition: 'background .2s', flex: '0 0 auto',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%', background: '#FFF',
        transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.15)',
      }} />
    </span>
    {label && <span style={{ fontSize: 13, color: '#2A2420' }}>{label}</span>}
  </label>
);
AdminUI.Toggle = Toggle;

/* ---------- card ---------- */
const Card = ({ title, subtitle, actions, children, padding = 20, style }) => (
  <div style={{
    background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12,
    overflow: 'hidden', ...style,
  }}>
    {(title || actions) && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F1EBE0' }}>
        <div>
          {title && <div style={{ fontSize: 14, fontWeight: 600, color: '#2A2420' }}>{title}</div>}
          {subtitle && <div style={{ fontSize: 12, color: '#8B8176', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
      </div>
    )}
    <div style={{ padding }}>{children}</div>
  </div>
);
AdminUI.Card = Card;

/* ---------- table ---------- */
const Table = ({ columns, rows, onRow, selected, onSelect, empty = 'No results', stickyHeader }) => {
  const hasSelect = !!onSelect;
  const allSelected = hasSelect && rows.length > 0 && rows.every(r => selected?.includes(r.id));
  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={stickyHeader ? { position: 'sticky', top: 0, background: '#FAF6EF', zIndex: 1 } : {}}>
          <tr style={{ textAlign: 'left', background: '#FAF6EF' }}>
            {hasSelect && (
              <th style={{ padding: '10px 12px', fontWeight: 500, fontSize: 11, color: '#6B625A', textTransform: 'uppercase', letterSpacing: '.06em', width: 28, borderBottom: '1px solid #E8DFD2' }}>
                <input type="checkbox" checked={allSelected} onChange={e => {
                  if (e.target.checked) onSelect(rows.map(r => r.id));
                  else onSelect([]);
                }} />
              </th>
            )}
            {columns.map((c, i) => (
              <th key={i} style={{
                padding: '10px 12px', fontWeight: 500, fontSize: 11, color: '#6B625A',
                textTransform: 'uppercase', letterSpacing: '.06em',
                borderBottom: '1px solid #E8DFD2',
                width: c.width, textAlign: c.align || 'left',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + (hasSelect ? 1 : 0)} style={{ padding: 40, textAlign: 'center', color: '#8B8176' }}>{empty}</td></tr>
          )}
          {rows.map((r, ri) => {
            const isSelected = selected?.includes(r.id);
            return (
              <tr
                key={r.id || ri}
                onClick={() => onRow && onRow(r)}
                style={{
                  cursor: onRow ? 'pointer' : 'default',
                  background: isSelected ? '#FEF7F5' : ri % 2 ? '#FDFBF6' : '#FFF',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (onRow) e.currentTarget.style.background = '#FEF7F5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#FEF7F5' : ri % 2 ? '#FDFBF6' : '#FFF'; }}
              >
                {hasSelect && (
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #F4EEE3' }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={isSelected || false} onChange={e => {
                      const sel = selected || [];
                      onSelect(e.target.checked ? [...sel, r.id] : sel.filter(x => x !== r.id));
                    }} />
                  </td>
                )}
                {columns.map((c, ci) => (
                  <td key={ci} style={{
                    padding: '10px 12px', borderBottom: '1px solid #F4EEE3',
                    color: '#2A2420', verticalAlign: 'middle',
                    textAlign: c.align || 'left',
                  }}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
AdminUI.Table = Table;

/* ---------- kpi ---------- */
const Kpi = ({ label, value, delta, spark, suffix, accent = '#EC5D4A' }) => (
  <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, padding: 18 }}>
    <div style={{ fontSize: 11, color: '#8B8176', fontFamily: 'var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: '#2A2420' }}>{value}</div>
      {suffix && <div style={{ fontSize: 13, color: '#8B8176' }}>{suffix}</div>}
    </div>
    {delta !== undefined && (
      <div style={{ marginTop: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: delta >= 0 ? '#24603C' : '#9B2914', fontWeight: 600 }}>
        {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last period
      </div>
    )}
    {spark && (
      <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" style={{ marginTop: 10, display: 'block' }}>
        <polyline points={spark.map((v, i) => `${i * (100 / (spark.length - 1))},${32 - (v / Math.max(...spark)) * 28 - 2}`).join(' ')}
          fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
);
AdminUI.Kpi = Kpi;

/* ---------- drawer / modal ---------- */
const Drawer = ({ open, onClose, title, children, width = 520, actions }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,20,12,.35)', animation: 'fadeIn .15s ease' }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width,
        background: '#FAF6EF', boxShadow: '-8px 0 30px rgba(0,0,0,.15)',
        display: 'flex', flexDirection: 'column', animation: 'slideInR .2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #E8DFD2', background: '#FFF' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#2A2420' }}>{title}</div>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', padding: 6, cursor: 'pointer', borderRadius: 6, color: '#6B625A' }}>
            <AdminIcon name="x" size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>{children}</div>
        {actions && (
          <div style={{ padding: 16, borderTop: '1px solid #E8DFD2', background: '#FFF', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
AdminUI.Drawer = Drawer;

const Modal = ({ open, onClose, title, children, actions, width = 480 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(30,20,12,.35)' }} />
      <div style={{
        position: 'relative', width, maxWidth: '90vw', maxHeight: '85vh',
        background: '#FFF', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.25)',
        display: 'flex', flexDirection: 'column', animation: 'slideInR .15s ease',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1EBE0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4 }}>
            <AdminIcon name="x" size={16} />
          </button>
        </div>
        <div style={{ padding: 20, flex: 1, overflow: 'auto' }}>{children}</div>
        {actions && (
          <div style={{ padding: 14, borderTop: '1px solid #F1EBE0', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{actions}</div>
        )}
      </div>
    </div>
  );
};
AdminUI.Modal = Modal;

/* ---------- empty state ---------- */
const Empty = ({ title, body, action, icon = 'dashboard' }) => (
  <div style={{ padding: '60px 20px', textAlign: 'center' }}>
    <div style={{
      width: 52, height: 52, margin: '0 auto 14px', borderRadius: 14,
      background: '#FEE8E4', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#EC5D4A',
    }}>
      <AdminIcon name={icon} size={26} color="#EC5D4A" />
    </div>
    <div style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', marginBottom: 6 }}>{title}</div>
    {body && <div style={{ fontSize: 13, color: '#8B8176', marginBottom: 18, maxWidth: 340, margin: '0 auto 18px' }}>{body}</div>}
    {action}
  </div>
);
AdminUI.Empty = Empty;

/* ---------- field row ---------- */
const Field = ({ label, hint, children, full }) => (
  <div style={{ marginBottom: 16, width: full ? '100%' : undefined }}>
    <div style={{ fontSize: 12, fontWeight: 500, color: '#3D342A', marginBottom: 6 }}>{label}</div>
    {children}
    {hint && <div style={{ fontSize: 11, color: '#8B8176', marginTop: 5 }}>{hint}</div>}
  </div>
);
AdminUI.Field = Field;

/* ---------- small line chart ---------- */
const LineChart = ({ data, height = 180, accent = '#EC5D4A', labels }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: 90 - ((v - min) / range) * 80,
  }));
  const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const area = d + ` L${w},100 L0,100 Z`;
  return (
    <div style={{ position: 'relative', height, fontSize: 10, color: '#8B8176' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${w} 100`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="lc-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lc-grad)" />
        <path d={d} fill="none" stroke={accent} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.2" fill={accent} />
        ))}
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '0 2px', fontFamily: 'var(--font-mono)' }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
};
AdminUI.LineChart = LineChart;

/* ---------- bar chart ---------- */
const BarChart = ({ data, height = 160, accent = '#EC5D4A', labels }) => {
  const max = Math.max(...data);
  return (
    <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: 6 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', height: `${(v / max) * 100}%`, background: accent, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
          </div>
          {labels && <div style={{ fontSize: 10, color: '#8B8176', fontFamily: 'var(--font-mono)' }}>{labels[i]}</div>}
        </div>
      ))}
    </div>
  );
};
AdminUI.BarChart = BarChart;

/* ---------- status dot ---------- */
const StatusDot = ({ kind }) => {
  const c = { ok: '#24603C', warn: '#B88A0F', danger: '#9B2914', info: '#1F4F72', muted: '#8B8176' }[kind] || '#8B8176';
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, flex: '0 0 auto' }} />;
};
AdminUI.StatusDot = StatusDot;

/* ---------- product swatch (tiny SVG product image stand-in) ---------- */
const ProductSwatch = ({ product, size = 36 }) => {
  const toyImg = window.SK_TOYS?.illustrations?.[product.img % 12] || null;
  return (
    <div style={{
      width: size, height: size, borderRadius: 8, flex: '0 0 auto',
      background: '#F5F1EA', border: '1px solid #E8DFD2', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 700, color: '#8B8176', fontFamily: 'var(--font-sans)',
    }}>
      {toyImg ? toyImg : (product.name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
    </div>
  );
};
AdminUI.ProductSwatch = ProductSwatch;

window.AdminUI = AdminUI;
