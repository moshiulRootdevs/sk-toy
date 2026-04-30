'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { fmtTk } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Pill from '@/components/ui/Pill';

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
      <div style={{ fontSize: 11, color: '#8B8176', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent || '#2A2420' }}>{value}</div>
    </div>
  );
}

export default function InventoryPage() {
  const qc = useQueryClient();
  const [stockTarget, setStockTarget] = useState<any>(null);
  const [newStock, setNewStock] = useState('');

  const { data: summary, isLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => api.get('/inventory/summary').then((r) => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: () => api.get('/products/admin/all', { params: { limit: 50, sort: 'stock_asc' } }).then((r) =>
      r.data.products?.filter((p: any) => p.stock <= 10)
    ),
    staleTime: 60_000,
  });

  const updateStock = useMutation({
    mutationFn: ({ id, stock }: any) => api.patch(`/inventory/products/${id}/stock`, { stock }),
    onSuccess: () => {
      toast.success('Stock updated');
      qc.invalidateQueries({ queryKey: ['inventory-summary'] });
      qc.invalidateQueries({ queryKey: ['low-stock-products'] });
      setStockTarget(null);
    },
    onError: () => toast.error('Failed to update stock'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Inventory</h1>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="adm-grid-4">
            <KpiCard label="Total Products" value={summary?.totalProducts || 0} />
            <KpiCard label="Total Units" value={(summary?.totalUnits || 0).toLocaleString()} />
            <KpiCard label="Inventory Value" value={fmtTk(summary?.totalValue || 0)} />
            <KpiCard label="Out of Stock" value={summary?.outOfStock || 0} accent="#9B2914" />
          </div>

          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #F4EEE3' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Low Stock / Out of Stock</div>
            </div>
            {!lowStock || lowStock.length === 0 ? (
              <div style={{ padding: '20px 18px', color: '#8B8176', fontSize: 13 }}>All products are well stocked!</div>
            ) : (
              lowStock.map((p: any) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid #F4EEE3' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#A89E92' }}>{p.sku}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Pill label={p.stock === 0 ? 'Out of Stock' : `${p.stock} left`} color={p.stock === 0 ? 'red' : 'yellow'} size="xs" />
                    <button
                      onClick={() => { setStockTarget(p); setNewStock(String(p.stock)); }}
                      style={{ fontSize: 12, color: '#EC5D4A', background: 'none', border: 0, cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <Modal open={!!stockTarget} onClose={() => setStockTarget(null)} title="Update Stock" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#2A2420' }}>{stockTarget?.name}</div>
          <Input
            label="New Stock Quantity"
            type="number"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            min={0}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="outline" size="sm" onClick={() => setStockTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={() => updateStock.mutate({ id: stockTarget._id, stock: Number(newStock) })} loading={updateStock.isPending}>
              Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
