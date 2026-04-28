import { cls } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}

export default function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  const range: (number | '...')[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
      range.push(i);
    } else if (range[range.length - 1] !== '...') {
      range.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <PageBtn disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</PageBtn>
      {range.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2" style={{ color: '#A89E92' }}>…</span>
        ) : (
          <PageBtn key={p} active={p === page} onClick={() => onChange(p as number)}>
            {p}
          </PageBtn>
        )
      )}
      <PageBtn disabled={page >= pages} onClick={() => onChange(page + 1)}>›</PageBtn>
    </div>
  );
}

function PageBtn({ children, onClick, active, disabled }: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, borderRadius: 8, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? '#EC5D4A' : 'transparent',
        color: active ? '#FFF' : '#5A5048',
        fontWeight: active ? 600 : 400,
        border: 0, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'background .15s',
      }}
      onMouseEnter={(e) => { if (!active && !disabled) (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}
