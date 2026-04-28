import { cls } from '@/lib/utils';

const STYLES: Record<string, { bg: string; fg: string; border: string }> = {
  gray:   { bg: '#F5F1EA', fg: '#5A5048', border: '#E8DFD2' },
  green:  { bg: '#DCF0E3', fg: '#24603C', border: '#B2DBBF' },
  red:    { bg: '#FBDED8', fg: '#9B2914', border: '#F2A89B' },
  yellow: { bg: '#FEF4D4', fg: '#7A5B0A', border: '#F5E1A0' },
  blue:   { bg: '#DCECF7', fg: '#1F4F72', border: '#B2D4EC' },
  orange: { bg: '#FEE8E4', fg: '#B8432E', border: '#FCC9BF' },
  purple: { bg: '#EDE8F5', fg: '#5B3E8A', border: '#D1C4E9' },
  teal:   { bg: '#D4F0EC', fg: '#1A5E54', border: '#9FD8D0' },
};

interface PillProps {
  label: string;
  color?: keyof typeof STYLES;
  size?: 'xs' | 'sm';
}

export default function Pill({ label, color = 'gray', size = 'sm' }: PillProps) {
  const s = STYLES[color] || STYLES.gray;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'xs' ? '1px 7px' : '2px 9px',
        fontSize: 10,
        fontFamily: 'var(--font-mono-var, monospace)',
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export function statusColor(status: string): keyof typeof STYLES {
  const map: Record<string, keyof typeof STYLES> = {
    new:       'blue',
    confirmed: 'teal',
    packed:    'purple',
    shipped:   'orange',
    delivered: 'green',
    cancelled: 'red',
    returned:  'yellow',
    pending:   'yellow',
    paid:      'green',
    failed:    'red',
    refunded:  'gray',
    collected: 'green',
    active:    'green',
    inactive:  'gray',
    approved:  'green',
    rejected:  'red',
    flagged:   'orange',
    published: 'green',
    draft:     'gray',
  };
  return map[status] || 'gray';
}
