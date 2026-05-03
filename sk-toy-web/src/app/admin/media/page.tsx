'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Image from 'next/image';
import api from '@/lib/api';
import { imgUrl } from '@/lib/utils';
import { confirm } from '@/lib/confirm';
import Tooltip from '@/components/ui/Tooltip';

const isVideo = (url: string) => /\.(mp4|webm|mov|ogg|avi|mkv)(\?.*)?$/i.test(url);

export default function MediaPage() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: () => api.get('/media/admin/all').then((r) => r.data),
  });
  const media: any[] = data?.files || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-media'] }); },
    onError: () => toast.error('Failed'),
  });

  async function uploadFiles(files: FileList) {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uploaded!');
      qc.invalidateQueries({ queryKey: ['admin-media'] });
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#2A2420]">Media Library</h1>
        <div>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#EC5D4A] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#D14434] transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '+ Upload Files'}
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-[#E8DFD2] rounded-2xl p-8 text-center text-[#A89E92] text-sm mb-6 hover:border-[#EC5D4A]/50 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <svg className="w-10 h-10 mx-auto mb-2 text-[#A89E92]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>Drag & drop images or videos here, or click to browse</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[#F4EEE3] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16 text-[#A89E92] text-sm">No media files yet</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {media.map((m: any) => (
            <div key={m._id} className="group relative aspect-square rounded-lg overflow-hidden bg-[#F4EEE3]">
              {isVideo(m.url) ? (
                <>
                  <video src={`${imgUrl(m.url)}#t=0.5`} preload="metadata" muted playsInline className="absolute inset-0 w-full h-full object-cover bg-black" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                      <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M0 0l10 6-10 6z" /></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">VIDEO</div>
                </>
              ) : (
                <Image src={imgUrl(m.url)} alt={m.name} fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Tooltip label="Copy URL" position="bottom">
                <button
                  onClick={() => { navigator.clipboard.writeText(m.url); toast.success('URL copied!'); }}
                  className="p-1.5 bg-white/90 rounded text-[#5A5048] hover:bg-white"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                </Tooltip>
                <Tooltip label="Delete" position="bottom">
                <button
                  onClick={async () => {
                    if (await confirm({ title: 'Delete file?', message: 'This will permanently remove the file. This action cannot be undone.', confirmLabel: 'Delete', danger: true })) {
                      deleteMutation.mutate(m._id);
                    }
                  }}
                  className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
