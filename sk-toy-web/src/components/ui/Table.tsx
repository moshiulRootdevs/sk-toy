import { cls } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = '_id',
  onRowClick,
  loading,
  emptyText = 'No records found',
  className,
}: TableProps<T>) {
  return (
    <div
      className={cls('overflow-x-auto', className)}
      style={{ borderRadius: 10, border: '1px solid #E8DFD2', background: '#FFF' }}
    >
      <table className="w-full text-sm text-left">
        <thead style={{ background: '#FAF6EF', borderBottom: '1px solid #E8DFD2' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cls('px-4 py-3 whitespace-nowrap', col.className)}
                style={{ fontSize: 11, fontWeight: 600, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F4EEE3' }}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 animate-pulse rounded w-3/4" style={{ background: '#F4EEE3' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center"
                style={{ color: '#A89E92', fontSize: 13 }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                style={{ borderBottom: '1px solid #F4EEE3', background: '#FFF', cursor: onRowClick ? 'pointer' : undefined }}
                onMouseEnter={(e) => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = '#FEF7F5'; }}
                onMouseLeave={(e) => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = '#FFF'; }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cls('px-4 py-3', col.className)} style={{ color: '#2A2420', fontSize: 13 }}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
