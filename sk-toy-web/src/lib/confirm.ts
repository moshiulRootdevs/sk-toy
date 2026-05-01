import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve?: (value: boolean) => void;
  show: (opts: ConfirmOptions) => Promise<boolean>;
  resolveAndClose: (value: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  options: {},
  resolve: undefined,
  show: (opts) => new Promise<boolean>((resolve) => {
    // If a previous dialog is still open, dismiss it as cancelled before opening the new one.
    const prev = get().resolve;
    if (prev) prev(false);
    set({ open: true, options: opts, resolve });
  }),
  resolveAndClose: (value) => {
    const { resolve } = get();
    if (resolve) resolve(value);
    set({ open: false, resolve: undefined });
  },
}));

/**
 * Promise-based confirmation prompt. Renders the global ConfirmHost dialog and
 * resolves true if the user confirms, false if they cancel.
 *
 *   if (await confirm({ title: 'Delete?', message: 'This cannot be undone.', danger: true })) { ... }
 */
export function confirm(opts: ConfirmOptions = {}): Promise<boolean> {
  return useConfirmStore.getState().show(opts);
}
