'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Review } from '@/types';
import { fmtDate } from '@/lib/utils';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Pill, { statusColor } from '@/components/ui/Pill';
import Stars from '@/components/ui/Stars';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function ReviewsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);
  const [reply, setReply] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', { page, statusFilter }],
    queryFn: () => api.get('/reviews/admin/all', { params: { page, limit: 20, status: statusFilter } }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: any) => api.patch(`/reviews/${id}/status`, { status }),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }); },
    onError: () => toast.error('Failed'),
  });

  const submitReply = useMutation({
    mutationFn: () => api.patch(`/reviews/${replyTarget?._id}/reply`, { reply }),
    onSuccess: () => {
      toast.success('Reply posted');
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      setReplyTarget(null);
    },
    onError: () => toast.error('Failed'),
  });

  const reviews: Review[] = data?.reviews || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Reviews & Q&A</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['', 'pending', 'approved', 'rejected', 'flagged'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: statusFilter === s ? '1px solid #EC5D4A' : '1px solid #E8DFD2',
              background: statusFilter === s ? '#EC5D4A' : 'transparent',
              color: statusFilter === s ? '#FFF' : '#5A5048',
              cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { if (statusFilter !== s) (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; }}
            onMouseLeave={(e) => { if (statusFilter !== s) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <Table
        columns={[
          { key: 'who', header: 'Reviewer', render: (r: any) => (
            <span style={{ fontWeight: 500 }}>{r.who}</span>
          )},
          { key: 'product', header: 'Product', render: (r: any) => (
            <span style={{ fontSize: 12, color: '#8B8176' }}>{r.product?.name || '—'}</span>
          )},
          { key: 'stars', header: 'Rating', render: (r: any) => <Stars value={r.stars} size="sm" /> },
          { key: 'text', header: 'Review', render: (r: any) => (
            <span style={{ fontSize: 12, color: '#5A5048', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {r.text || '—'}
            </span>
          )},
          { key: 'status', header: 'Status', render: (r: any) => <Pill label={r.status} color={statusColor(r.status)} size="xs" /> },
          { key: 'actions', header: '', render: (r: any) => (
            <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
              {r.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateStatus.mutate({ id: r._id, status: 'approved' })}
                    style={{ padding: '3px 8px', fontSize: 11, borderRadius: 6, border: '1px solid #B2DBBF', background: '#DCF0E3', color: '#24603C', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus.mutate({ id: r._id, status: 'rejected' })}
                    style={{ padding: '3px 8px', fontSize: 11, borderRadius: 6, border: '1px solid #F2A89B', background: '#FBDED8', color: '#9B2914', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => { setReplyTarget(r); setReply(r.adminReply || ''); }}
                style={{ padding: '3px 8px', fontSize: 11, borderRadius: 6, border: '1px solid #E8DFD2', background: '#FAF6EF', color: '#5A5048', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reply
              </button>
            </div>
          )},
        ]}
        data={reviews as any[]}
        loading={isLoading}
        emptyText="No reviews"
      />

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
      </div>

      <Modal open={!!replyTarget} onClose={() => setReplyTarget(null)} title="Reply to Review" size="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '12px 14px', background: '#FAF6EF', borderRadius: 8, border: '1px solid #E8DFD2' }}>
            <Stars value={replyTarget?.stars || 0} size="sm" />
            <div style={{ fontSize: 13, color: '#5A5048', marginTop: 6 }}>{replyTarget?.text}</div>
            <div style={{ fontSize: 11, color: '#A89E92', marginTop: 4 }}>— {replyTarget?.who}</div>
          </div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            placeholder="Write your reply..."
            style={{
              width: '100%', border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px',
              fontSize: 13, background: '#FAF6EF', color: '#2A2420', resize: 'none',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="outline" size="sm" onClick={() => setReplyTarget(null)}>Cancel</Button>
            <Button size="sm" onClick={() => submitReply.mutate()} loading={submitReply.isPending}>Post Reply</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
