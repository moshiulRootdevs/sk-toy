'use client';

import { useConfirmStore } from '@/lib/confirm';
import ConfirmDialog from './ConfirmDialog';

/** Mount once at app root; renders whichever confirm() call is currently open. */
export default function ConfirmHost() {
  const { open, options, resolveAndClose } = useConfirmStore();
  return (
    <ConfirmDialog
      open={open}
      onClose={() => resolveAndClose(false)}
      onConfirm={() => resolveAndClose(true)}
      title={options.title}
      message={options.message}
      confirmLabel={options.confirmLabel}
      danger={options.danger}
    />
  );
}
