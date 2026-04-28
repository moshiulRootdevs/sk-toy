'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { fmtDateTime } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';

function ActionDot({ action }: { action: string }) {
  const isDelete = action?.startsWith('DELETE');
  const isCreate = action?.startsWith('CREATE');
  const bg = isDelete ? '#FBDED8' : isCreate ? '#DCF0E3' : '#DCECF7';
  const color = isDelete ? '#9B2914' : isCreate ? '#24603C' : '#1F4F72';
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
      {action?.[0] || '?'}
    </div>
  );
}

export default function AuditPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', page],
    queryFn: () => api.get('/audit', { params: { page, limit: 30 } }).then((r) => r.data),
  });

  const logs = data?.logs || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Audit Log</h1>

      <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ height: 40, background: '#F4EEE3', borderRadius: 8 }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#A89E92', fontSize: 13 }}>No audit logs yet</div>
        ) : (
          logs.map((log: any) => (
            <div
              key={log._id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '11px 18px', borderBottom: '1px solid #F4EEE3' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF7F5'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <ActionDot action={log.action} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#2A2420' }}>
                  <span style={{ color: '#8B8176' }}>{log.who}</span>
                  {' '}{log.action?.toLowerCase()}{' '}
                  <span style={{ fontWeight: 600 }}>{log.entity}</span>
                </div>
                {log.detail && (
                  <div style={{ fontSize: 11, color: '#A89E92', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.detail}
                  </div>
                )}
              </div>
              <span style={{ flexShrink: 0, fontSize: 11, color: '#A89E92', marginTop: 2 }}>{fmtDateTime(log.createdAt)}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
      </div>
    </div>
  );
}
