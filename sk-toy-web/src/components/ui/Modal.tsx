'use client';

import { useEffect, useRef } from 'react';
import { cls } from '@/lib/utils';
import AdminIcon from '@/components/admin/AdminIcon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideClose?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export default function Modal({ open, onClose, title, children, size = 'md', hideClose }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(31,47,74,.55)' }} onClick={onClose} />
      <div
        ref={dialogRef}
        className={cls('relative w-full max-h-[90vh] flex flex-col', sizes[size])}
        style={{ background: '#FFF', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.18)', border: '1px solid #E8DFD2' }}
        role="dialog"
        aria-modal="true"
      >
        {(title || !hideClose) && (
          <div
            className="flex items-center justify-between shrink-0"
            style={{ padding: '14px 20px 12px', borderBottom: '1px solid #F4EEE3' }}
          >
            {title && (
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2A2420', margin: 0 }}>{title}</h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto"
                style={{
                  border: 0, background: 'none', cursor: 'pointer', padding: 6,
                  color: '#A89E92', borderRadius: 6, lineHeight: 1,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F4EEE3'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                aria-label="Close"
              >
                <AdminIcon name="x" size={16} />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto flex-1" style={{ padding: '18px 20px' }}>{children}</div>
      </div>
    </div>
  );
}
