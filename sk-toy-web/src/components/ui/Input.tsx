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
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-bold text-[#1F2F4A]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6FB1]">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cls(
              'w-full rounded-2xl transition-colors focus:outline-none focus:border-[#FF6FB1] focus:bg-white disabled:opacity-60 font-medium text-[14px]',
              leftIcon ? 'pl-10 pr-4' : 'px-4',
              rightIcon ? 'pr-10' : '',
              className
            )}
            style={{
              border: error ? '2px solid #FF8FA0' : '2px solid #FFE0EC',
              background: '#FFF8FB',
              color: '#1F2F4A',
              padding: '11px 16px',
              paddingLeft: leftIcon ? 40 : undefined,
              paddingRight: rightIcon ? 40 : undefined,
              ...style,
            }}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FF6FB1]">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-[11px] text-[#E5455A] font-bold">{error}</p>}
        {hint && !error && <p className="text-[11px] text-[#7A8299] font-medium">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
