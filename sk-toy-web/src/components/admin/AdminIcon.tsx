const PATHS: Record<string, string> = {
  dashboard: 'M4 4h6v6H4zM4 13h6v7H4zM13 4h7v7h-7zM13 14h7v6h-7z',
  orders:    'M4 7h16v12H4zM8 7V5a4 4 0 0 1 8 0v2',
  products:  'M4 8l8-4 8 4M4 8v9l8 4 8-4V8M4 8l8 4 8-4M12 12v10',
  category:  'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  brand:     'M4 6a2 2 0 0 1 2-2h8l6 6v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM14 4v4a2 2 0 0 0 2 2h4',
  inventory: 'M3 7l9-4 9 4-9 4zM3 7v10l9 4M21 7v10l-9 4M7 9v5l5 2',
  customer:  'M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  review:    'M3 20l2-5h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z',
  coupon:    'M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4zM10 7v2M10 11v2M10 15v2',
  shipping:  'M1 8h14v9H1zM15 12h5l3 3v2h-8M4 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  payment:   'M2 6h20v12H2zM2 10h20M6 14h4',
  cms:       'M5 4h11l3 3v13H5zM15 4v5h4',
  nav:       'M4 6h16M4 12h16M4 18h16',
  media:     'M4 4h16v14H4zM4 14l4-4 5 5 3-3 4 4M9 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  settings:  'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12a7 7 0 0 0-.1-1.2l2.1-1.6-2-3.5-2.5.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.4a7 7 0 0 0-2 1.2l-2.5-.9-2 3.5L5.1 10.8 5 12a7 7 0 0 0 .1 1.2l-2.1 1.6 2 3.5 2.5-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.4a7 7 0 0 0 2-1.2l2.5.9 2-3.5-2.1-1.6c0-.4.1-.8.1-1.2',
  report:    'M4 20V4M4 20h16M7 16v-5M11 16v-9M15 16v-7M19 16v-3',
  audit:     'M4 4h11l5 5v11H4zM15 4v5h5M8 13h8M8 17h5',
  search:    'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4.35-4.35',
  plus:      'M12 5v14M5 12h14',
  edit:      'M4 20l4-1 11-11-3-3L5 16zM14 7l3 3',
  trash:     'M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check:     'M5 12l5 5L20 7',
  x:         'M6 6l12 12M18 6L6 18',
  chevL:     'M15 6l-6 6 6 6',
  chevR:     'M9 6l6 6-6 6',
  chevD:     'M6 9l6 6 6-6',
  chevU:     'M18 15l-6-6-6 6',
  external:  'M14 5h5v5M19 5l-9 9M13 7H6v11h11v-7',
  bell:      'M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9M10 21a2 2 0 1 0 4 0',
  home:      'M4 10l8-7 8 7v10h-5v-6h-6v6H4z',
  logout:    'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3',
  flag:      'M5 3v18M5 5l12-1-2 5 2 5-12 1',
  menu:      'M4 6h16M4 12h16M4 18h16',
  download:  'M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  upload:    'M12 15V3M8 7l4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  grip:      'M9 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M9 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2M15 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M15 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M15 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
};

interface AdminIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export default function AdminIcon({ name, size = 16, color = 'currentColor', className }: AdminIconProps) {
  const d = PATHS[name] || PATHS.dashboard;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path d={d} />
    </svg>
  );
}
