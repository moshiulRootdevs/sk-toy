'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AdminIcon from '@/components/admin/AdminIcon';
import SelectUI from '@/components/ui/Select';

const EMPTY_FORM = { name: '', tag: '', icon: '', parent: '', hidden: false, order: 0 };

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A5048' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

const filterInput: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8,
  padding: '8px 36px 8px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  backgroundImage: CHEVRON, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  appearance: 'none' as React.CSSProperties['appearance'],
  outline: 'none', fontFamily: 'inherit', width: '100%',
};

function CategoryTree({ cats, allCats, level = 0, onEdit, onDelete }: {
  cats: Category[];
  allCats: Category[];
  level?: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  return (
    <div style={{ marginLeft: level > 0 ? 20 : 0, borderLeft: level > 0 ? '1px solid #F4EEE3' : 'none' }}>
      {cats.map((cat) => (
        <div key={cat._id}>
          <div
            className="group"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, marginLeft: level > 0 ? 8 : 0 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAF6EF'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            {cat.icon && <span style={{ fontSize: 18 }}>{cat.icon}</span>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 500, color: '#2A2420', fontSize: level === 0 ? 13 : 12 }}>{cat.name}</span>
              {cat.tag && <span style={{ fontSize: 11, color: '#A89E92', marginLeft: 8 }}>{cat.tag}</span>}
              {cat.hidden && <span style={{ fontSize: 11, color: '#9B2914', marginLeft: 8 }}>(hidden)</span>}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: 'flex', gap: 2 }}>
              <button
                onClick={() => onEdit(cat)}
                style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#8B8176' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; (e.currentTarget as HTMLElement).style.color = '#2A2420'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#8B8176'; }}
              >
                <AdminIcon name="edit" size={14} />
              </button>
              <button
                onClick={() => onDelete(cat)}
                style={{ border: 0, background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#A89E92' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FBDED8'; (e.currentTarget as HTMLElement).style.color = '#9B2914'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
              >
                <AdminIcon name="trash" size={14} />
              </button>
            </div>
          </div>
          {cat.children && cat.children.length > 0 && (
            <CategoryTree cats={cat.children} allCats={allCats} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  const { data: tree = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories-admin-tree'],
    queryFn: () => api.get('/categories/admin/tree').then((r) => r.data),
  });

  const { data: flat = [] } = useQuery<Category[]>({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories/flat').then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/categories', data) : api.put(`/categories/${editCat?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Category created!' : 'Category updated!');
      qc.invalidateQueries({ queryKey: ['categories-admin-tree'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      setEditCat(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      qc.invalidateQueries({ queryKey: ['categories-admin-tree'] });
      qc.invalidateQueries({ queryKey: ['categories-flat'] });
      setDeleteCat(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openNew() {
    setForm(EMPTY_FORM);
    setIsNew(true);
    setEditCat({} as Category);
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name, tag: cat.tag || '', icon: cat.icon || '',
      parent: typeof cat.parent === 'object' ? (cat.parent as any)?._id || '' : cat.parent || '',
      hidden: cat.hidden, order: cat.order,
    });
    setIsNew(false);
    setEditCat(cat);
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Categories</h1>
          <p style={{ fontSize: 13, color: '#8B8176', marginTop: 4 }}>Supports unlimited subcategory depth</p>
        </div>
        <Button onClick={openNew} size="sm">
          <AdminIcon name="plus" size={13} color="#FFF" /> Add Category
        </Button>
      </div>

      <div style={{ background: '#FFF', border: '1px solid #E8DFD2', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 40, background: '#F4EEE3', borderRadius: 8, animation: 'pulse 2s infinite' }} />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#A89E92', fontSize: 13 }}>No categories yet</div>
        ) : (
          <div style={{ padding: 12 }}>
            <CategoryTree cats={tree} allCats={flat} onEdit={openEdit} onDelete={setDeleteCat} />
          </div>
        )}
      </div>

      <Modal open={editCat !== null} onClose={() => setEditCat(null)} title={isNew ? 'Add Category' : 'Edit Category'} size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Category Name *" value={form.name} onChange={set('name')} />
          <Input label="Tag / Description" value={form.tag} onChange={set('tag')} placeholder="e.g. For budding artists" />
          <Input label="Icon (Emoji)" value={form.icon} onChange={set('icon')} placeholder="🎨" />
          <SelectUI
            label="Parent Category"
            value={form.parent}
            onChange={set('parent')}
            options={[
              { value: '', label: 'None (Top Level)' },
              ...flat.filter((c) => c._id !== editCat?._id).map((c) => ({ value: c._id, label: c.name })),
            ]}
          />
          <Input label="Order" type="number" value={form.order} onChange={set('order')} />
          <Toggle checked={form.hidden} onChange={(v) => setForm((f: any) => ({ ...f, hidden: v }))} label="Hide from storefront" />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" size="sm" onClick={() => setEditCat(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ ...form, order: Number(form.order) })} loading={saveMutation.isPending}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteCat}
        onClose={() => setDeleteCat(null)}
        onConfirm={() => deleteCat && deleteMutation.mutate(deleteCat._id)}
        loading={deleteMutation.isPending}
        title="Delete Category"
        message={`Delete "${deleteCat?.name}"? Children will be moved to the parent category.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
