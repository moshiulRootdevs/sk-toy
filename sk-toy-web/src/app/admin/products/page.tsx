'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import { fmtTk, imgUrl } from '@/lib/utils';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Pill from '@/components/ui/Pill';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AdminIcon from '@/components/admin/AdminIcon';
import SelectUI from '@/components/ui/Select';

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A5048' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

const filterInput: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8,
  padding: '7px 36px 7px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  backgroundImage: CHEVRON, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  appearance: 'none' as React.CSSProperties['appearance'],
  outline: 'none', fontFamily: 'inherit',
};

export default function AdminProductsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { page, search, catFilter, stockFilter }],
    queryFn: () =>
      api.get('/products/admin/all', {
        params: { page, limit: 20, q: search || undefined, category: catFilter || undefined },
      }).then((r) => r.data),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/flat').then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const products: Product[] = data?.products || [];
  const total: number = data?.total || 0;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 8).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Products</h1>
          <div style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>
            {total} products{lowStockCount > 0 ? ` · ${lowStockCount} low stock` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="outline" size="sm">
            <AdminIcon name="upload" size={13} /> Import
          </Button>
          <Button variant="outline" size="sm">
            <AdminIcon name="download" size={13} /> Export
          </Button>
          <Button size="sm" onClick={() => router.push('/admin/products/new')}>
            <AdminIcon name="plus" size={13} color="#FFF" /> Add product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <AdminIcon name="search" size={14} color="#8B8176" />
          </span>
          <input
            type="text"
            placeholder="Search name or SKU…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...filterInput, width: '100%', paddingLeft: 34 }}
          />
        </div>
        <SelectUI
          value={catFilter}
          onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
          placeholder="All categories"
          options={(categories || []).map((c) => ({ value: c._id, label: c.name }))}
          style={{ width: 180 }}
        />
        <SelectUI
          value={stockFilter}
          onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'All stock' },
            { value: 'in', label: 'In stock' },
            { value: 'low', label: 'Low stock (<8)' },
            { value: 'out', label: 'Out of stock' },
          ]}
          style={{ width: 160 }}
        />
      </div>

      {/* Table */}
      <Table
        columns={[
          {
            key: 'image', header: '',
            render: (p: any) => p.images?.[0] ? (
              <div style={{ width: 40, height: 40, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#F4EEE3', flexShrink: 0 }}>
                <Image src={imgUrl(p.images[0])} alt={p.name} fill className="object-cover" />
              </div>
            ) : (
              <div style={{ width: 40, height: 40, background: '#F4EEE3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AdminIcon name="image" size={16} color="#D0C8BE" />
              </div>
            ),
          },
          {
            key: 'name', header: 'Product',
            render: (p: any) => (
              <div>
                <div style={{ fontWeight: 500, color: '#2A2420' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#A89E92', fontFamily: 'var(--font-mono-var, monospace)' }}>{p.sku}</div>
              </div>
            ),
          },
          {
            key: 'category', header: 'Categories',
            render: (p: any) => {
              const cats = Array.isArray(p.categories) && p.categories.length
                ? p.categories
                : (p.category ? [p.category] : []);
              const names = cats
                .map((c: any) => (typeof c === 'object' ? c?.name : ''))
                .filter(Boolean);
              if (!names.length) return <span style={{ color: '#D0C8BE' }}>—</span>;
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {names.slice(0, 2).map((n: string) => <Pill key={n} label={n} color="gray" />)}
                  {names.length > 2 && (
                    <span style={{ fontSize: 11, color: '#8B8176' }} title={names.slice(2).join(', ')}>
                      +{names.length - 2}
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            key: 'price', header: 'Price',
            render: (p: any) => (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono-var, monospace)', fontSize: 13 }}>{fmtTk(p.price)}</div>
                {p.comparePrice ? <div style={{ fontSize: 11, color: '#A89E92', textDecoration: 'line-through', fontFamily: 'var(--font-mono-var, monospace)' }}>{fmtTk(p.comparePrice)}</div> : null}
              </div>
            ),
          },
          {
            key: 'stock', header: 'Stock',
            render: (p: any) => (
              <Pill
                label={String(p.stock)}
                color={p.stock === 0 ? 'red' : p.stock < 8 ? 'yellow' : 'green'}
              />
            ),
          },
          {
            key: 'rating', header: 'Rating',
            render: (p: any) => (
              <span style={{ fontFamily: 'var(--font-mono-var, monospace)', fontSize: 12, color: '#5A5048', whiteSpace: 'nowrap' }}>
                ★ {(p.rating || 0).toFixed(1)}
                <span style={{ color: '#A89E92' }}> ({p.reviewCount || 0})</span>
              </span>
            ),
          },
          {
            key: 'status', header: 'Status',
            render: (p: any) => <Pill label={p.active ? 'Active' : 'Draft'} color={p.active ? 'green' : 'gray'} />,
          },
          {
            key: 'actions', header: '',
            render: (p: any) => (
              <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => router.push(`/admin/products/${p._id}`)}
                  title="Edit"
                  style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#8B8176' }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = '#F4EEE3'; el.style.color = '#2A2420'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = '#8B8176'; }}
                >
                  <AdminIcon name="edit" size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(p._id)}
                  title="Delete"
                  style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#A89E92' }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = '#FBDED8'; el.style.color = '#9B2914'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = 'none'; el.style.color = '#A89E92'; }}
                >
                  <AdminIcon name="trash" size={14} />
                </button>
              </div>
            ),
          },
        ]}
        data={products as any[]}
        loading={isLoading}
        emptyText="No products found. Add your first product to get started."
        onRowClick={(p: any) => router.push(`/admin/products/${p._id}`)}
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete Product"
        message="This will permanently delete the product and cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
