import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-signal-amber text-ink-navy hover:bg-signal-amber/90 active:scale-[0.98] border border-signal-amber/30',
  secondary: 'bg-ink-navy text-white hover:bg-ink-navy/90 active:scale-[0.98] border border-ink-navy/30',
  outline: 'bg-transparent text-ink-navy border border-slate/30 hover:border-ink-navy hover:bg-ink-navy/5 active:scale-[0.98]',
  ghost: 'bg-transparent text-slate hover:text-ink-navy hover:bg-ink-navy/5',
  danger: 'bg-rust text-white hover:bg-rust/90 active:scale-[0.98] border border-rust/30',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-display font-semibold rounded-md transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
