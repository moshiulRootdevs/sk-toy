import { cls } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'storefront' | 'admin';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({
  children, className, padding = 'md',
  title, subtitle, actions, variant = 'admin',
}: CardProps) {
  const isAdmin = variant === 'admin';

  return (
    <div
      className={cls(paddings[padding] === '' ? '' : '', className)}
      style={{
        background: isAdmin ? '#FFF' : '#FFFBF2',
        borderRadius: isAdmin ? 12 : 18,
        border: isAdmin ? '1px solid #E8DFD2' : '1px solid #E6D9BD',
        boxShadow: isAdmin ? '0 1px 3px rgba(0,0,0,.04)' : '0 1px 2px rgba(45,45,45,.06)',
        overflow: 'hidden',
      }}
    >
      {(title || actions) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, padding: '14px 18px 12px',
          borderBottom: '1px solid #F4EEE3',
        }}>
          <div>
            {title && (
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>{title}</div>
            )}
            {subtitle && (
              <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{subtitle}</div>
            )}
          </div>
          {actions && <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{actions}</div>}
        </div>
      )}
      <div className={padding !== 'none' ? paddings[padding] : ''}>
        {children}
      </div>
    </div>
  );
}
