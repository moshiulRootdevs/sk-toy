'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { fmtTk } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports-sales'],
    queryFn: () => api.get('/reports/sales-by-category').then((r) => r.data),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data),
  });

  const chart = dashboard?.revenueByDay || [];
  const maxRevenue = Math.max(...chart.map((d: any) => d.revenue), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Reports</h1>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size="lg" /></div>
      ) : (
        <>
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 16 }}>Revenue — Last 14 Days</div>
            {chart.length === 0 ? (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D8CFBF', fontSize: 13 }}>
                No data yet
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160 }}>
                {chart.map((d: any, i: number) => (
                  <div key={d.date ?? i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%`,
                        background: '#EC5D4A',
                        borderRadius: '3px 3px 0 0',
                        cursor: 'pointer',
                        transition: 'opacity .15s',
                      }}
                      title={`${d.date}: ${fmtTk(d.revenue)} (${d.orders} orders)`}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    />
                    <span style={{ fontSize: 9, color: '#A89E92', whiteSpace: 'nowrap' }}>
                      {d.date?.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420', marginBottom: 16 }}>Sales by Category</div>
            {!data || data.length === 0 ? (
              <div style={{ color: '#A89E92', fontSize: 13 }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(() => {
                  const maxSales = Math.max(...data.map((c: any) => c.revenue), 1);
                  return data.map((cat: any, i: number) => (
                    <div key={cat._id ?? cat.name ?? i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ fontWeight: 500, color: '#2A2420' }}>{cat.name || 'Uncategorized'}</span>
                        <span style={{ fontWeight: 700 }}>{fmtTk(cat.revenue)}</span>
                      </div>
                      <div style={{ height: 6, background: '#F4EEE3', borderRadius: 999, overflow: 'hidden' }}>
                        <div
                          style={{ height: '100%', background: '#EC5D4A', borderRadius: 999, width: `${(cat.revenue / maxSales) * 100}%` }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: '#8B8176', marginTop: 3 }}>
                        {cat.orders} orders · {cat.units} units
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
