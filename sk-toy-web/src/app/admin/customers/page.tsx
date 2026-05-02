'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Customer } from '@/types';
import { fmtTk, fmtDateTime } from '@/lib/utils';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Tooltip from '@/components/ui/Tooltip';

const filterInput: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8, padding: '7px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  outline: 'none', fontFamily: 'inherit',
};

export default function CustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', { page, search }],
    queryFn: () => api.get('/customers/admin/all', { params: { page, limit: 20, search } }).then((r) => r.data),
  });

  const customers: Customer[] = data?.customers || [];
  const total: number = data?.total ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>{total.toLocaleString()} {total === 1 ? 'customer' : 'customers'}</p>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by name, email, or phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...filterInput, width: 320 }}
        />
      </div>

      <Table
        columns={[
          { key: 'name', header: 'Name', render: (c: any) => (
            <div>
              <div style={{ fontWeight: 600, color: '#2A2420', display: 'flex', alignItems: 'center', gap: 6 }}>
                {c.name}
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 10,
                  textTransform: 'uppercase', letterSpacing: '.05em',
                  background: c.isGuest ? '#FBE7A8' : '#D8EBDC',
                  color: c.isGuest ? '#7A5A00' : '#1D5E33',
                }}>
                  {c.isGuest ? 'Guest' : 'Registered'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#A89E92' }}>{c.email}</div>
            </div>
          )},
          { key: 'phone', header: 'Phone', render: (c: any) => (
            c.phone
              ? <a href={`tel:${String(c.phone).replace(/[^+\d]/g, '')}`}
                   onClick={(e) => e.stopPropagation()}
                   style={{ fontSize: 13, color: '#3F8FBF', textDecoration: 'none', fontFamily: 'monospace' }}
                   onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline'; }}
                   onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = 'none'; }}>
                  {c.phone}
                </a>
              : <span style={{ color: '#C7BDB0' }}>—</span>
          )},
          { key: 'orderCount', header: 'Orders', render: (c: any) => (
            <span style={{ fontWeight: 500, color: c.orderCount > 0 ? '#2A2420' : '#A89E92' }}>{c.orderCount ?? 0}</span>
          )},
          { key: 'totalSpend', header: 'Total Spend', render: (c: any) => (
            <span style={{ fontWeight: 700, color: (c.totalSpend ?? 0) > 0 ? '#EC5D4A' : '#A89E92' }}>{fmtTk(c.totalSpend ?? 0)}</span>
          )},
          { key: 'lastOrder', header: 'Last Order', render: (c: any) => (
            c.lastOrder
              ? <span style={{ fontSize: 12, color: '#5A5048' }}>{fmtDateTime(c.lastOrder)}</span>
              : <span style={{ fontSize: 11, color: '#C7BDB0' }}>Never</span>
          )},
          { key: 'createdAt', header: 'Joined', render: (c: any) => (
            <span style={{ fontSize: 11, color: '#8B8176' }}>{fmtDateTime(c.createdAt)}</span>
          )},
          { key: 'actions', header: '', render: (c: any) => (
            <Tooltip label="View Details" position="left">
              <button
                onClick={(e) => { e.stopPropagation(); router.push(`/admin/customers/${c._id}`); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B8176" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </button>
            </Tooltip>
          )},
        ]}
        data={customers as any[]}
        loading={isLoading}
        onRowClick={(c: any) => router.push(`/admin/customers/${c._id}`)}
        emptyText="No customers found"
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
      </div>
    </div>
  );
}
