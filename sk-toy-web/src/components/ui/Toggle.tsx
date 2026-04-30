'use client';

import { cls } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function Toggle({ checked, onChange, label, disabled, size = 'md' }: ToggleProps) {
  const isSmall = size === 'sm';

  return (
    <label className={cls('inline-flex items-center gap-2', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cls(
          'relative shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5B6E] focus-visible:ring-offset-2',
          isSmall ? 'w-8 h-4' : 'w-11 h-6',
        )}
        style={{ background: checked ? '#FF5B6E' : '#D8CFBF' }}
      >
        <span
          className={cls(
            'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform',
            isSmall ? 'w-3 h-3' : 'w-5 h-5',
            checked ? (isSmall ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'
          )}
        />
      </button>
      {label && <span style={{ fontSize: 13, color: '#2A2420' }} className="select-none">{label}</span>}
    </label>
  );
}
