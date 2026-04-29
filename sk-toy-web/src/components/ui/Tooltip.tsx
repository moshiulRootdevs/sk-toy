'use client';

import { useState, useRef, useCallback } from 'react';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'right' | 'left';
}

export default function Tooltip({ label, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const wrapRef = useRef<HTMLDivElement>(null);

  const calcPosition = useCallback(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    let top = 0, left = 0;
    switch (position) {
      case 'top':
        top = rect.top - 6;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 6;
        left = rect.left + rect.width / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 6;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 6;
        break;
    }
    setCoords({ top, left });
  }, [position]);

  function show() {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => { calcPosition(); setVisible(true); }, 200);
  }
  function hide() {
    clearTimeout(timeout.current);
    setVisible(false);
  }

  const transformMap: Record<string, string> = {
    top:    'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    right:  'translate(0, -50%)',
    left:   'translate(-100%, -50%)',
  };

  const arrowStyles: Record<string, React.CSSProperties> = {
    top:    { left: '50%', transform: 'translateX(-50%)', top: '100%', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1F2F4A' },
    bottom: { left: '50%', transform: 'translateX(-50%)', bottom: '100%', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '5px solid #1F2F4A' },
    right:  { top: '50%', transform: 'translateY(-50%)', right: '100%', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '5px solid #1F2F4A' },
    left:   { top: '50%', transform: 'translateY(-50%)', left: '100%', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '5px solid #1F2F4A' },
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && label && (
        <div style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          transform: transformMap[position],
          background: '#1F2F4A',
          color: '#FFFBF2',
          fontSize: 11,
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {label}
          <div style={{ position: 'absolute', ...arrowStyles[position], width: 0, height: 0 }} />
        </div>
      )}
    </div>
  );
}
