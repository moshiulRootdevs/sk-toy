import { cls } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const variants = {
  primary:   'text-white hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-[#1F2F4A] text-white hover:bg-[#142035]',
  outline:   'bg-white border-2 border-[#FFD4E6] text-[#1F2F4A] hover:border-[#FF6FB1] hover:text-[#FF6FB1]',
  ghost:     'text-[#1F2F4A] hover:bg-[#FFE0EC]',
  danger:    'bg-[#FF5B6E] text-white hover:bg-[#E5455A]',
  success:   'text-white',
};

const sizes = {
  xs: 'px-3 py-1 text-xs',
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_BG: Partial<Record<keyof typeof variants, string>> = {
  primary: 'linear-gradient(135deg, #FF5B6E 0%, #FF6FB1 100%)',
  success: 'linear-gradient(135deg, #4FC081 0%, #3FA46A 100%)',
};

const VARIANT_SHADOW: Partial<Record<keyof typeof variants, string>> = {
  primary: '0 12px 24px -12px rgba(255,91,110,.55)',
  success: '0 12px 24px -12px rgba(79,192,129,.55)',
  danger:  '0 12px 24px -12px rgba(255,91,110,.45)',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, style, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cls(
        'inline-flex items-center justify-center gap-2 font-extrabold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6FB1] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      style={{
        ...(VARIANT_BG[variant] ? { background: VARIANT_BG[variant] } : null),
        ...(VARIANT_SHADOW[variant] ? { boxShadow: VARIANT_SHADOW[variant] } : null),
        ...style,
      }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
export default Button;
