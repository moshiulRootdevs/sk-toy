/* Hand-drawn SVG squiggle icons + per-category colors */

const CAT_COLORS = {
  toys: '#EC5D4A',         // coral
  diecast: '#EC5D4A',
  plush: '#F28BA8',        // pink
  building: '#F5C443',     // yellow
  rc: '#6FB8D9',           // blue
  figures: '#9C7BC9',      // purple
  learning: '#4FA36A',     // green
  stem: '#4FA36A',
  school: '#F39436',       // orange
  puzzle: '#9C7BC9',
  books: '#4FA36A',
  baby: '#F28BA8',
  montessori: '#F39436',
  outdoor: '#6FB8D9',
  'new-arrivals': '#EC5D4A',
  sale: '#EC5D4A',
  brands: '#1F2F4A',
  journal: '#1F2F4A',
  gifting: '#F28BA8',
};

const catColor = (slugOrId) => {
  if (!slugOrId) return '#EC5D4A';
  const key = slugOrId.split('/')[0];
  return CAT_COLORS[key] || CAT_COLORS[slugOrId] || '#EC5D4A';
};

const ICONS = {
  diecast: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 36 L14 26 Q16 22 20 22 L44 22 Q48 22 50 26 L54 36 Z" />
      <circle cx="20" cy="40" r="5" fill="currentColor" />
      <circle cx="44" cy="40" r="5" fill="currentColor" />
      <path d="M18 22 L22 16 L42 16 L46 22" />
    </g>
  ),
  plush: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="16" r="5" />
      <circle cx="44" cy="16" r="5" />
      <circle cx="32" cy="36" r="16" />
      <circle cx="27" cy="33" r="1.5" fill="currentColor" />
      <circle cx="37" cy="33" r="1.5" fill="currentColor" />
      <path d="M28 40 Q32 43 36 40" />
    </g>
  ),
  building: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="30" width="20" height="14" rx="2" />
      <rect x="34" y="30" width="20" height="14" rx="2" />
      <rect x="22" y="14" width="20" height="14" rx="2" />
      <circle cx="16" cy="30" r="1.5" fill="currentColor" />
      <circle cx="24" cy="30" r="1.5" fill="currentColor" />
      <circle cx="40" cy="30" r="1.5" fill="currentColor" />
      <circle cx="48" cy="30" r="1.5" fill="currentColor" />
    </g>
  ),
  rc: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="6" />
      <circle cx="32" cy="32" r="18" strokeDasharray="4 4" />
      <path d="M32 8 L32 14 M32 50 L32 56 M8 32 L14 32 M50 32 L56 32" />
    </g>
  ),
  figures: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="16" r="6" />
      <path d="M22 48 L22 34 Q22 26 32 26 Q42 26 42 34 L42 48" />
      <path d="M16 38 L22 34 M42 34 L48 38" />
      <path d="M26 48 L26 54 M38 48 L38 54" />
    </g>
  ),
  learning: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 20 L32 12 L54 20 L32 28 Z" />
      <path d="M18 24 L18 38 Q25 42 32 42 Q39 42 46 38 L46 24" />
      <path d="M54 20 L54 32" />
      <circle cx="54" cy="34" r="2" fill="currentColor" />
    </g>
  ),
  school: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18 Q16 14 20 14 L44 14 Q48 14 48 18 L48 50 Q48 52 46 52 L18 52 Q16 52 16 50 Z" />
      <path d="M24 14 L24 8 L40 8 L40 14" />
      <path d="M22 28 L42 28" />
      <path d="M22 36 L42 36" />
    </g>
  ),
  puzzle: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14 L24 14 Q24 8 28 8 Q32 8 32 14 L44 14 Q46 14 46 16 L46 26 Q52 26 52 30 Q52 34 46 34 L46 48 Q46 50 44 50 L30 50 Q30 44 26 44 Q22 44 22 50 L12 50 Q10 50 10 48 Z" />
    </g>
  ),
  baby: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="30" r="14" />
      <circle cx="27" cy="28" r="1.8" fill="currentColor" />
      <circle cx="37" cy="28" r="1.8" fill="currentColor" />
      <path d="M26 36 Q32 40 38 36" />
      <path d="M20 20 Q24 14 32 14 Q40 14 44 20" />
      <circle cx="18" cy="22" r="2" fill="currentColor" />
      <circle cx="46" cy="22" r="2" fill="currentColor" />
    </g>
  ),
  outdoor: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="32" cy="32" r="14" />
      <path d="M18 32 L46 32" />
      <path d="M32 18 Q24 25 24 32 Q24 39 32 46 Q40 39 40 32 Q40 25 32 18" />
    </g>
  ),
  stem: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 12 L24 26 L14 46 Q13 50 17 50 L47 50 Q51 50 50 46 L40 26 L40 12" />
      <path d="M20 12 L44 12" />
      <circle cx="26" cy="38" r="1.5" fill="currentColor" />
      <circle cx="36" cy="42" r="1.5" fill="currentColor" />
      <circle cx="32" cy="36" r="1.5" fill="currentColor" />
    </g>
  ),
  montessori: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="42" r="8" />
      <rect x="26" y="34" width="16" height="16" rx="2" />
      <path d="M44 50 L56 38 L50 34 L44 42 Z" />
      <path d="M26 20 L38 20 L32 10 Z" />
    </g>
  ),
  gifting: (
    <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="24" width="44" height="28" rx="2" />
      <path d="M10 34 L54 34" />
      <path d="M32 24 L32 52" />
      <path d="M24 24 Q20 16 26 14 Q32 14 32 24 Q32 14 38 14 Q44 16 40 24" />
    </g>
  ),
};

function CatIcon({ name, size = 44, color, ...rest }) {
  const g = ICONS[name] || ICONS.toys || ICONS.building;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ color: color || 'currentColor' }} {...rest}>
      {g}
    </svg>
  );
}

window.SK_CATS = { CAT_COLORS, catColor, CatIcon };
