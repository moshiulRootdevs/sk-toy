'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { fmtTk, fmtDate } from '@/lib/utils';
import Pill, { statusColor } from '@/components/ui/Pill';
import Spinner from '@/components/ui/Spinner';
import AdminIcon from '@/components/admin/AdminIcon';

function Kpi({ label, value, sub, accent, icon }: { label: string; value: string | number; sub: string; accent: string; icon: string }) {
  return (
    <div style={{
      background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2',
      boxShadow: '0 1px 3px rgba(0,0,0,.04)', padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#8B8176', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AdminIcon name={icon} size={15} color={accent} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#2A2420', letterSpacing: '-.02em', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8B8176', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function MiniBarChart({ data, accent }: { data: { date: string; revenue: number }[]; accent: string }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, paddingTop: 4 }}>
      {data.map((d, i) => (
        <div key={`${d.date}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div
            style={{
              width: '100%',
              height: `${Math.max((d.revenue / max) * 100, 3)}%`,
              background: accent,
              borderRadius: '3px 3px 0 0',
              opacity: 0.8,
              transition: 'height .3s',
            }}
            title={`${fmtTk(d.revenue)}`}
          />
          <span style={{ fontSize: 9, color: '#A89E92', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {d.date?.slice(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <Spinner size="lg" />
    </div>
  );

  const kpis           = data?.kpis || {};
  const chart          = data?.revenueByDay || [];
  const lowStock       = data?.lowStock || [];
  const newOrders      = data?.newOrders || [];
  const recentCustomers = data?.recentCustomers || [];

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#8B8176', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#2A2420' }}>
            {greeting}, {data?.adminName?.split(' ')[0] || 'Admin'}.
          </h1>
          <p style={{ fontSize: 13, color: '#8B8176', marginTop: 6 }}>
            {kpis.pendingOrders || 0} new orders · {lowStock.length} items low on stock
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/products/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#FFF', border: '1px solid #D8CFBF', borderRadius: 8,
              padding: '7px 12px', fontSize: 12, fontWeight: 500, color: '#5A5048',
              textDecoration: 'none',
            }}>
            <AdminIcon name="plus" size={13} /> Add product
          </Link>
          <Link href="/admin/orders"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#EC5D4A', border: '1px solid #EC5D4A', borderRadius: 8,
              padding: '7px 12px', fontSize: 12, fontWeight: 500, color: '#FFF',
              textDecoration: 'none',
            }}>
            <AdminIcon name="orders" size={13} color="#FFF" /> View orders
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <Kpi label="Revenue (today)"   value={fmtTk(kpis.todayRevenue || 0)}   sub={`${kpis.todayOrders || 0} orders today`}      accent="#EC5D4A"  icon="report" />
        <Kpi label="Revenue (month)"   value={fmtTk(kpis.monthRevenue || 0)}   sub={`${kpis.monthOrders || 0} orders this month`}  accent="#4FA36A"  icon="payment" />
        <Kpi label="Total customers"   value={(kpis.totalCustomers || 0).toLocaleString()} sub={`${kpis.newCustomers || 0} new this month`} accent="#6FB8D9" icon="customer" />
        <Kpi label="Pending orders"    value={kpis.pendingOrders || 0}          sub="Needs attention"                               accent="#F5C443"  icon="orders" />
      </div>

      {/* Revenue chart + low stock */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Revenue</div>
              <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>Last 14 days</div>
            </div>
            {chart.length > 0 && (
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <div><span style={{ color: '#8B8176' }}>Peak</span> <span style={{ fontWeight: 600 }}>{fmtTk(Math.max(...chart.map((d: any) => d.revenue)))}</span></div>
                <div><span style={{ color: '#8B8176' }}>Avg</span> <span style={{ fontWeight: 600 }}>{fmtTk(Math.round(chart.reduce((s: number, d: any) => s + d.revenue, 0) / (chart.length || 1)))}</span></div>
              </div>
            )}
          </div>
          {chart.length === 0
            ? <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D8CFBF', fontSize: 13 }}>No data yet</div>
            : <MiniBarChart data={chart} accent="#EC5D4A" />
          }
        </div>

        <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: '1px solid #F4EEE3' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Low stock</div>
              <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{lowStock.length} SKUs below threshold</div>
            </div>
            <Link href="/admin/inventory" style={{ fontSize: 12, color: '#EC5D4A', textDecoration: 'none', fontWeight: 500 }}>Inventory →</Link>
          </div>
          {lowStock.length === 0
            ? <div style={{ padding: '20px 18px', color: '#8B8176', fontSize: 13 }}>All stocked up!</div>
            : lowStock.slice(0, 7).map((p: any) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid #F4EEE3' }}>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#2A2420' }}>{p.name}</div>
                <Pill label={p.stock === 0 ? 'OOS' : `${p.stock} left`} color={p.stock === 0 ? 'red' : 'yellow'} size="xs" />
              </div>
            ))
          }
        </div>
      </div>

      {/* New orders + recent customers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: '1px solid #F4EEE3' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Orders needing attention</div>
              <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{newOrders.length} new orders</div>
            </div>
            <Link href="/admin/orders" style={{ fontSize: 12, color: '#EC5D4A', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          {newOrders.length === 0
            ? <div style={{ padding: '20px 18px', color: '#8B8176', fontSize: 13 }}>No new orders</div>
            : newOrders.slice(0, 8).map((order: any) => (
              <Link
                key={order._id}
                href={`/admin/orders?id=${order._id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 18px', borderBottom: '1px solid #F4EEE3', textDecoration: 'none', color: 'inherit' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF7F5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#F5C443', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>#{order.orderNo}</div>
                  <div style={{ fontSize: 11, color: '#8B8176', marginTop: 1 }}>{fmtDate(order.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtTk(order.total)}</span>
                  <Pill label={order.status} color={statusColor(order.status)} size="xs" />
                </div>
              </Link>
            ))
          }
        </div>

        <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 12px', borderBottom: '1px solid #F4EEE3' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Recent customers</div>
              <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{kpis.totalCustomers || 0} total</div>
            </div>
            <Link href="/admin/customers" style={{ fontSize: 12, color: '#EC5D4A', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          {recentCustomers.length === 0
            ? <div style={{ padding: '20px 18px', color: '#8B8176', fontSize: 13 }}>No customers yet</div>
            : recentCustomers.slice(0, 8).map((c: any) => (
              <div
                key={c._id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid #F4EEE3', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF7F5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: `hsl(${(c.name?.charCodeAt(0) * 13 || 0) % 360} 50% 78%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#1F2F4A',
                }}>
                  {c.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#8B8176', marginTop: 1 }}>{c.email}</div>
                </div>
                <Pill
                  label={c.tier || 'Bronze'}
                  color={c.tier === 'VIP' ? 'purple' : c.tier === 'Gold' ? 'yellow' : c.tier === 'Silver' ? 'gray' : 'orange'}
                  size="xs"
                />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
