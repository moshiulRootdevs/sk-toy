'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/src/style.css';
import { format } from 'date-fns';

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(
    from || to
      ? { from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined }
      : undefined
  );
  const [clickCount, setClickCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (!from && !to) setRange(undefined);
  }, [from, to]);

  function handleSelect(newRange: DateRange | undefined) {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 1) {
      // First click — always becomes the "from" date
      const clickedDate = newRange?.from || newRange?.to;
      setRange(clickedDate ? { from: clickedDate, to: undefined } : undefined);
    } else if (newCount >= 2) {
      // Second click — becomes the "to" date
      const fromDate = range?.from;
      const clickedDate = newRange?.to || newRange?.from;
      if (fromDate && clickedDate) {
        // Ensure from <= to
        const finalRange = fromDate <= clickedDate
          ? { from: fromDate, to: clickedDate }
          : { from: clickedDate, to: fromDate };
        setRange(finalRange);
        onChange(format(finalRange.from, 'yyyy-MM-dd'), format(finalRange.to, 'yyyy-MM-dd'));
      }
      setClickCount(0);
      setOpen(false);
    }
  }

  function handleClear() {
    setRange(undefined);
    onChange('', '');
    setOpen(false);
  }

  function applyPreset(days: number) {
    const toDate = new Date();
    const fromDate = new Date();
    if (days === 0) {
      setRange({ from: toDate, to: toDate });
      onChange(format(toDate, 'yyyy-MM-dd'), format(toDate, 'yyyy-MM-dd'));
    } else if (days === -1) {
      const yearStart = new Date(new Date().getFullYear(), 0, 1);
      setRange({ from: yearStart, to: toDate });
      onChange(format(yearStart, 'yyyy-MM-dd'), format(toDate, 'yyyy-MM-dd'));
    } else {
      fromDate.setDate(fromDate.getDate() - days);
      setRange({ from: fromDate, to: toDate });
      onChange(format(fromDate, 'yyyy-MM-dd'), format(toDate, 'yyyy-MM-dd'));
    }
    setOpen(false);
  }

  const displayText = range?.from
    ? range.to
      ? `${format(range.from, 'dd MMM yyyy')} — ${format(range.to, 'dd MMM yyyy')}`
      : `${format(range.from, 'dd MMM yyyy')} — ...`
    : 'Select date range';

  const hasValue = !!(from || to);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => { if (!open) { setClickCount(0); setRange(undefined); } setOpen(!open); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 14px',
          fontSize: 13, color: hasValue ? '#2A2420' : '#A89E92',
          background: '#FAF6EF', cursor: 'pointer', fontFamily: 'inherit',
          fontWeight: hasValue ? 600 : 400, whiteSpace: 'nowrap',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={hasValue ? '#EC5D4A' : '#A89E92'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{displayText}</span>
        {hasValue && (
          <span
            onClick={(e) => { e.stopPropagation(); handleClear(); }}
            style={{ display: 'flex', alignItems: 'center', marginLeft: 4, color: '#A89E92', cursor: 'pointer' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EC5D4A'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#A89E92'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000,
          background: '#FFF', borderRadius: 16, border: '1px solid #E8DFD2',
          boxShadow: '0 16px 48px rgba(0,0,0,.14)', padding: '20px',
          display: 'flex', gap: 20,
        }}>
          {/* Presets sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRight: '1px solid #F4EEE3', paddingRight: 20, minWidth: 130 }}>
            <div style={{ fontSize: 10, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700, marginBottom: 8 }}>Quick Select</div>
            {[
              { label: 'Today', days: 0 },
              { label: 'Last 7 days', days: 7 },
              { label: 'Last 15 days', days: 15 },
              { label: 'Last 30 days', days: 30 },
              { label: 'Last 90 days', days: 90 },
              { label: 'This year', days: -1 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.days)}
                style={{
                  background: 'none', border: 'none', padding: '8px 12px', borderRadius: 8,
                  fontSize: 13, color: '#5A5048', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'background .1s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FAF6EF'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
              >
                {p.label}
              </button>
            ))}
            {hasValue && (
              <>
                <div style={{ borderTop: '1px solid #F4EEE3', margin: '6px 0' }} />
                <button
                  onClick={handleClear}
                  style={{
                    background: 'none', border: 'none', padding: '8px 12px', borderRadius: 8,
                    fontSize: 13, color: '#EC5D4A', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'inherit', fontWeight: 600, transition: 'background .1s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                >
                  Clear filter
                </button>
              </>
            )}
          </div>

          {/* Calendar area */}
          <div className="drp-calendar-wrap">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={1}
              showOutsideDays
              disabled={{ after: new Date() }}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .drp-calendar-wrap .rdp-root {
          --rdp-accent-color: #EC5D4A;
          --rdp-accent-background-color: #FEF2F2;
          --rdp-day-height: 40px;
          --rdp-day-width: 40px;
          --rdp-day_button-height: 36px;
          --rdp-day_button-width: 36px;
          --rdp-day_button-border-radius: 8px;
          --rdp-selected-border: 0;
          --rdp-outside-opacity: 0.4;
          --rdp-range_middle-background-color: #FFF1EE;
          --rdp-range_start-date-background-color: #EC5D4A;
          --rdp-range_end-date-background-color: #EC5D4A;
          --rdp-range_start-background: linear-gradient(to right, transparent 50%, #FFF1EE 50%);
          --rdp-range_end-background: linear-gradient(to left, transparent 50%, #FFF1EE 50%);
          --rdp-range_middle-color: #2A2420;
          font-family: inherit;
          font-size: 14px;
        }
        .drp-calendar-wrap .rdp-months {
          gap: 24px;
        }
        .drp-calendar-wrap .rdp-month_caption {
          font-weight: 700;
          font-size: 15px;
          color: #2A2420;
          padding: 0 8px 14px;
        }
        .drp-calendar-wrap .rdp-weekday {
          font-size: 11px;
          font-weight: 700;
          color: #A89E92;
          text-transform: uppercase;
          padding-bottom: 8px;
        }
        .drp-calendar-wrap .rdp-day {
          border-radius: 0;
        }
        .drp-calendar-wrap .rdp-day_button {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #2A2420;
          cursor: pointer;
          transition: background .1s, color .1s;
        }
        .drp-calendar-wrap .rdp-day_button:hover:not(:disabled) {
          background: #FAF6EF;
        }
        .drp-calendar-wrap .rdp-today:not(.rdp-selected) .rdp-day_button {
          font-weight: 800;
          color: #EC5D4A;
        }
        .drp-calendar-wrap .rdp-selected .rdp-day_button {
          background: #EC5D4A;
          color: #FFF;
          font-weight: 700;
        }
        .drp-calendar-wrap .rdp-selected .rdp-day_button:hover {
          background: #D14434;
        }
        .drp-calendar-wrap .rdp-range_middle .rdp-day_button {
          background: transparent;
          color: #2A2420;
          font-weight: 500;
          border-radius: 0;
        }
        .drp-calendar-wrap .rdp-range_middle .rdp-day_button:hover {
          background: #FFDED8;
        }
        .drp-calendar-wrap .rdp-disabled .rdp-day_button {
          color: #D8CFBF;
          cursor: not-allowed;
        }
        .drp-calendar-wrap .rdp-disabled .rdp-day_button:hover {
          background: transparent;
        }
        .drp-calendar-wrap .rdp-button_previous,
        .drp-calendar-wrap .rdp-button_next {
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background .1s;
        }
        .drp-calendar-wrap .rdp-button_previous:hover,
        .drp-calendar-wrap .rdp-button_next:hover {
          background: #FAF6EF;
        }
        .drp-calendar-wrap .rdp-outside .rdp-day_button {
          color: #D8CFBF;
        }
      `}</style>
    </div>
  );
}
