'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { BlogPost } from '@/types';
import { fmtDate } from '@/lib/utils';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Pill, { statusColor } from '@/components/ui/Pill';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const EMPTY = { title: '', excerpt: '', body: '', category: '', author: '', coverImage: '', readTime: '', status: 'draft' };

export default function BlogPage() {
  const qc = useQueryClient();
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => api.get('/blog/admin/all').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => isNew ? api.post('/blog', data) : api.put(`/blog/${editPost?._id}`, data),
    onSuccess: () => {
      toast.success(isNew ? 'Post created!' : 'Updated!');
      qc.invalidateQueries({ queryKey: ['admin-blog'] });
      setEditPost(null);
    },
    onError: () => toast.error('Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blog/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-blog'] }); setDeleteId(null); },
    onError: () => toast.error('Failed'),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f: any) => ({ ...f, [k]: e.target.value }));

  function openEdit(p: BlogPost) {
    setForm({ title: p.title, excerpt: p.excerpt || '', body: p.body || '', category: p.category || '', author: p.author || '', coverImage: p.coverImage || '', readTime: p.readTime || '', status: p.status });
    setIsNew(false);
    setEditPost(p);
  }

  const posts: BlogPost[] = data?.posts || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2A2420]">Blog Posts</h1>
        <Button onClick={() => { setForm(EMPTY); setIsNew(true); setEditPost({} as BlogPost); }} size="sm">+ New Post</Button>
      </div>

      <Table
        columns={[
          { key: 'title', header: 'Title', render: (p: any) => <span className="font-medium text-sm">{p.title}</span> },
          { key: 'category', header: 'Category', render: (p: any) => p.category || '—' },
          { key: 'author', header: 'Author', render: (p: any) => p.author || '—' },
          { key: 'status', header: 'Status', render: (p: any) => <Pill label={p.status} color={statusColor(p.status)} size="xs" /> },
          { key: 'publishedAt', header: 'Published', render: (p: any) => p.publishedAt ? <span className="text-xs text-[#A89E92]">{fmtDate(p.publishedAt)}</span> : '—' },
          { key: 'actions', header: '', render: (p: any) => (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => openEdit(p)} className="p-1.5 text-[#A89E92] hover:text-[#5A5048] hover:bg-[#F4EEE3] rounded">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button onClick={() => setDeleteId(p._id)} className="p-1.5 text-[#A89E92] hover:text-[#9B2914] hover:bg-[#FBDED8] rounded">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          )},
        ]}
        data={posts as any[]}
        loading={isLoading}
        emptyText="No blog posts"
      />

      <Modal open={editPost !== null} onClose={() => setEditPost(null)} title={isNew ? 'New Post' : 'Edit Post'} size="xl">
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={set('title')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={form.category} onChange={set('category')} />
            <Input label="Author" value={form.author} onChange={set('author')} />
            <Input label="Read Time (min)" type="number" value={form.readTime} onChange={set('readTime')} />
            <Select label="Status" value={form.status} onChange={set('status')} options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
          </div>
          <Input label="Cover Image URL" value={form.coverImage} onChange={set('coverImage')} />
          <Textarea label="Excerpt" value={form.excerpt} onChange={set('excerpt')} rows={2} />
          <Textarea label="Body (Markdown)" value={form.body} onChange={set('body')} rows={10} />
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="outline" size="sm" onClick={() => setEditPost(null)}>Cancel</Button>
          <Button size="sm" onClick={() => saveMutation.mutate({ ...form, readTime: form.readTime ? Number(form.readTime) : undefined })} loading={saveMutation.isPending}>
            {isNew ? 'Publish' : 'Save'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Delete Post" message="Delete this post?" confirmLabel="Delete" danger />
    </div>
  );
}
