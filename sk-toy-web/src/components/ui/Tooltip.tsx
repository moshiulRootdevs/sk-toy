'use client';

import { useState, useRef } from 'react';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export default function Tooltip({ label, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  function show() {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setVisible(true), 200);
  }
  function hide() {
    clearTimeout(timeout.current);
    setVisible(false);
  }

  const isTop = position === 'top';

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          ...(isTop ? { bottom: 'calc(100% + 6px)' } : { top: 'calc(100% + 6px)' }),
          background: '#1F2F4A',
          color: '#FFFBF2',
          fontSize: 11,
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {label}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(isTop
              ? { top: '100%', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1F2F4A' }
              : { bottom: '100%', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid #1F2F4A' }
            ),
            width: 0,
            height: 0,
          }} />
        </div>
      )}
    </div>
  );
}
