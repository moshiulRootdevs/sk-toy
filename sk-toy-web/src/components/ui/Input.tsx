import { cls } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, style, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 12, fontWeight: 500, color: '#2A2420' }}>
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#A89E92' }}>{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cls(
              'w-full rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#EC5D4A] focus:border-transparent disabled:opacity-60',
              leftIcon ? 'pl-9 pr-3' : 'px-3',
              rightIcon ? 'pr-9' : '',
              className
            )}
            style={{
              border: error ? '1px solid #F2A89B' : '1px solid #E8DFD2',
              background: '#FAF6EF',
              color: '#2A2420',
              fontSize: 13,
              padding: '8px 12px',
              paddingLeft: leftIcon ? 36 : undefined,
              paddingRight: rightIcon ? 36 : undefined,
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#A89E92' }}>{rightIcon}</span>
          )}
        </div>
        {error && <p style={{ fontSize: 11, color: '#9B2914' }}>{error}</p>}
        {hint && !error && <p style={{ fontSize: 11, color: '#8B8176' }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
