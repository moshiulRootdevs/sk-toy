import { cls } from '@/lib/utils';

interface StarsProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (v: number) => void;
}

export default function Stars({ value, max = 5, size = 'md', interactive, onChange }: StarsProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={cls(
              iconSize,
              'shrink-0',
              interactive && 'cursor-pointer hover:scale-110 transition-transform',
              !interactive && 'pointer-events-none'
            )}
          >
            <svg viewBox="0 0 24 24" className={cls('w-full h-full', filled ? 'text-amber-400' : 'text-gray-200')} fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
