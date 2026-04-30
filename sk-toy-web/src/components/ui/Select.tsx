'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cls } from '@/lib/utils';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  id?: string;
  /** Pill-shaped trigger for storefront sort controls */
  pill?: boolean;
  /** Show search box — defaults to true when options > 5 */
  searchable?: boolean;
}

export default function Select({
  label, error, hint, options, placeholder, value, onChange,
  className, style, disabled, id, pill, searchable,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const showSearch = searchable ?? options.length > 5;

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  /* Position the portal panel under the trigger on open */
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const panelHeight = showSearch ? 300 : 256;
    const openUp = spaceBelow < panelHeight && rect.top > panelHeight;
    setDropdownStyle({
      position: 'fixed',
      zIndex: 99999,
      width: rect.width,
      left: rect.left,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
    // Auto-focus search input
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 30);
  }, [open, showSearch]);

  /* Reset query + highlight on close */
  useEffect(() => { if (!open) { setQuery(''); setHighlighted(0); } }, [open]);

  /* Reset highlight to 0 when filtered list changes */
  useEffect(() => { setHighlighted(0); }, [query]);

  /* Scroll highlighted item into view */
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-highlighted]') as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  /* Close on outside click or Escape */
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !(e.target as Element)?.closest('[data-select-panel]')
      ) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value ?? ''));
  const hasValue = selected != null;

  function choose(v: string | number) {
    onChange?.({ target: { value: String(v) } } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  const triggerBase: React.CSSProperties = pill ? {
    border: '1px solid #FFE0EC',
    borderRadius: 999,
    padding: '6px 36px 6px 14px',
    background: '#FFFFFF',
    color: hasValue ? '#1F2F4A' : '#8B8176',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    height: 'auto',
  } : {
    border: error ? '1px solid #F2A89B' : '1px solid #E8DFD2',
    borderRadius: 8,
    padding: '9px 36px 9px 12px',
    background: '#FAF6EF',
    color: hasValue ? '#2A2420' : '#A89E92',
    fontSize: 13,
    fontFamily: 'inherit',
    height: 38,
  };

  const panel = open && typeof window !== 'undefined' && createPortal(
    <div
      data-select-panel=""
      role="listbox"
      style={{
        ...dropdownStyle,
        background: '#FFF',
        border: '1px solid #E8DFD2',
        borderRadius: 12,
        boxShadow: '0 8px 24px -4px rgba(31,47,74,.14), 0 2px 8px -2px rgba(31,47,74,.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: showSearch ? 300 : 256,
        animation: 'dropdownOpen .15s cubic-bezier(.16,1,.3,1)',
        transformOrigin: 'top center',
      }}
    >
      {/* Search box */}
      {showSearch && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #F0E8DC', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#A89E92" strokeWidth="2.5"
              style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setHighlighted((h) => Math.max(h - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filtered[highlighted]) choose(filtered[highlighted].value);
                }
              }}
              style={{
                width: '100%', border: '1px solid #E8DFD2', borderRadius: 7,
                padding: '6px 10px 6px 30px', fontSize: 12, fontFamily: 'inherit',
                color: '#2A2420', background: '#FAF6EF', outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Options list */}
      <div ref={listRef} style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.length === 0 ? (
          <p style={{ padding: '12px 14px', fontSize: 12, color: '#A89E92', textAlign: 'center' }}>
            No results
          </p>
        ) : (
          filtered.map((opt, idx) => {
            const active = String(opt.value) === String(value ?? '');
            const isHighlighted = idx === highlighted;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                data-highlighted={isHighlighted || undefined}
                onMouseDown={(e) => { e.preventDefault(); choose(opt.value); }}
                onMouseEnter={() => setHighlighted(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 14px',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FF5B6E' : '#2A2420',
                  background: active ? '#FEF3F1' : isHighlighted ? '#FAF6EF' : 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background .1s',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                {active && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF5B6E" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body,
  );

  return (
    <div className={cls('flex flex-col gap-1', className)} style={style}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-[#2A2420]">
          {label}
        </label>
      )}

      <div ref={wrapRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={selectId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((o) => !o)}
          style={{
            ...triggerBase,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
            outline: 'none',
            opacity: disabled ? 0.6 : 1,
            transition: 'border-color .15s, box-shadow .15s',
            position: 'relative',
          }}
          onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 2px rgba(236,93,74,.25)'; (e.currentTarget as HTMLElement).style.borderColor = '#FF5B6E'; }}
          onBlur={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = error ? '#F2A89B' : pill ? '#FFE0EC' : '#E8DFD2'; }}
        >
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected?.label ?? placeholder ?? '— Select —'}
          </span>
          <svg
            style={{
              position: 'absolute', right: 10, top: '50%',
              transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
              transition: 'transform .2s', flexShrink: 0, pointerEvents: 'none',
            }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {panel}

      {error && <p className="text-[11px] text-[#9B2914] mt-0.5">{error}</p>}
      {hint && !error && <p className="text-[11px] text-[#8B8176] mt-0.5">{hint}</p>}
    </div>
  );
}
