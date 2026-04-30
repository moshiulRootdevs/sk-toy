import { cls } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, rows = 4, style, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} style={{ fontSize: 12, fontWeight: 500, color: '#2A2420' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cls(
            'w-full rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5B6E] focus:border-transparent disabled:opacity-60 resize-y',
            className
          )}
          style={{
            border: error ? '1px solid #F2A89B' : '1px solid #E8DFD2',
            background: '#FAF6EF',
            color: '#2A2420',
            fontSize: 13,
            padding: '8px 12px',
            ...style,
          }}
          {...props}
        />
        {error && <p style={{ fontSize: 11, color: '#9B2914' }}>{error}</p>}
        {hint && !error && <p style={{ fontSize: 11, color: '#8B8176' }}>{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
