'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer } from '@/types';
import { fmtTk, fmtDate } from '@/lib/utils';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';

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
              ? <span style={{ fontSize: 12, color: '#5A5048' }}>{fmtDate(c.lastOrder)}</span>
              : <span style={{ fontSize: 11, color: '#C7BDB0' }}>Never</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
                textTransform: 'uppercase', letterSpacing: '.06em',
                background: selected.isGuest ? '#FBE7A8' : '#D8EBDC',
                color: selected.isGuest ? '#7A5A00' : '#1D5E33',
              }}>
                {selected.isGuest ? 'Guest' : 'Registered'}
              </span>
              {selected.active === false && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 12, background: '#FBDED8', color: '#9B2914', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  Disabled
                </span>
              )}
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-3">
              <KpiBox label="Orders" value={String(selected.orderCount ?? 0)} accent="#6FB8D9" />
              <KpiBox label="Total Spend" value={fmtTk(selected.totalSpend ?? 0)} accent="#EC5D4A" />
              <KpiBox label="Last Order" value={selected.lastOrder ? fmtDate(selected.lastOrder) : 'Never'} accent="#4FA36A" />
            </div>

            {/* Contact info */}
            <div className="adm-grid-2">
              <Field label="Email">
                <a href={`mailto:${selected.email}`} style={{ color: '#3F8FBF', textDecoration: 'none' }}>{selected.email}</a>
              </Field>
              <Field label="Phone">
                {selected.phone
                  ? <a href={`tel:${String(selected.phone).replace(/[^+\d]/g, '')}`} style={{ color: '#3F8FBF', textDecoration: 'none', fontFamily: 'monospace' }}>{selected.phone}</a>
                  : <span style={{ color: '#A89E92' }}>—</span>}
              </Field>
              <Field label="Joined">
                <span>{fmtDate(selected.createdAt)}</span>
              </Field>
              <Field label="Account">
                <span>{selected.isGuest ? 'Guest checkout' : 'Registered account'}</span>
              </Field>
            </div>

            {/* Addresses */}
            {selected.addresses && selected.addresses.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                  Saved addresses ({selected.addresses.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.addresses.map((addr, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#5A5048', background: '#FAF6EF', borderRadius: 8, padding: '8px 12px', border: '1px solid #E8DFD2' }}>
                      {addr.label && (
                        <div style={{ fontSize: 10, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 2 }}>
                          {addr.label}{addr.isDefault ? ' · Default' : ''}
                        </div>
                      )}
                      <div>{[addr.line1, addr.line2, addr.area, addr.district, addr.zip].filter(Boolean).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#2A2420' }}>{children}</div>
    </div>
  );
}

function KpiBox({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: '#FAF6EF', borderRadius: 10, padding: '12px 14px', textAlign: 'center', border: '1px solid #F4EEE3' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#8B8176', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
