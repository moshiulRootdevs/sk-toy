'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer } from '@/types';
import { fmtTk, fmtDate } from '@/lib/utils';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Pill from '@/components/ui/Pill';

const filterInput: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8, padding: '7px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  outline: 'none', fontFamily: 'inherit',
};

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', { page, search }],
    queryFn: () => api.get('/customers/admin/all', { params: { page, limit: 20, q: search } }).then((r) => r.data),
  });

  const customers: Customer[] = data?.customers || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Customers</h1>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ ...filterInput, width: 256 }}
        />
      </div>

      <Table
        columns={[
          { key: 'name', header: 'Name', render: (c: any) => (
            <div>
              <div style={{ fontWeight: 500, color: '#2A2420' }}>{c.name}</div>
              <div style={{ fontSize: 11, color: '#A89E92' }}>{c.email}</div>
            </div>
          )},
          { key: 'tier', header: 'Tier', render: (c: any) => (
            <Pill
              label={c.tier || 'Bronze'}
              color={c.tier === 'VIP' ? 'purple' : c.tier === 'Gold' ? 'yellow' : c.tier === 'Silver' ? 'gray' : 'orange'}
              size="xs"
            />
          )},
          { key: 'totalOrders', header: 'Orders', render: (c: any) => (
            <span style={{ fontWeight: 500 }}>{c.totalOrders}</span>
          )},
          { key: 'totalSpend', header: 'Total Spend', render: (c: any) => (
            <span style={{ fontWeight: 700 }}>{fmtTk(c.totalSpend)}</span>
          )},
          { key: 'createdAt', header: 'Joined', render: (c: any) => (
            <span style={{ fontSize: 11, color: '#8B8176' }}>{fmtDate(c.createdAt)}</span>
          )},
        ]}
        data={customers as any[]}
        loading={isLoading}
        onRowClick={(c: any) => setSelected(c)}
        emptyText="No customers found"
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
      </div>

      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected.name} size="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 2 }}>Email</div>
                <div style={{ fontSize: 13, color: '#2A2420' }}>{selected.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 2 }}>Tier</div>
                <Pill label={selected.tier || 'Bronze'} color={selected.tier === 'VIP' ? 'purple' : selected.tier === 'Gold' ? 'yellow' : selected.tier === 'Silver' ? 'gray' : 'orange'} size="xs" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 2 }}>Total Orders</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>{selected.totalOrders}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 2 }}>Total Spend</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2A2420' }}>{fmtTk(selected.totalSpend)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 2 }}>Joined</div>
                <div style={{ fontSize: 13, color: '#2A2420' }}>{fmtDate(selected.createdAt)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 2 }}>Account type</div>
                <div style={{ fontSize: 13, color: '#2A2420' }}>{selected.isGuest ? 'Guest' : 'Registered'}</div>
              </div>
            </div>
            {selected.addresses.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 6 }}>Addresses</div>
                {selected.addresses.map((addr, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#5A5048', background: '#FAF6EF', borderRadius: 8, padding: '8px 12px', marginBottom: 6, border: '1px solid #E8DFD2' }}>
                    {addr.line1}, {addr.city}, {addr.district}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
