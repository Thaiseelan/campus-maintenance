import { type SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className = '', id, children, placeholder, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-display font-medium text-ink-navy">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={`w-full appearance-none px-3.5 py-2.5 pr-10 bg-white border rounded-md text-sm text-ink-navy transition-all duration-150 focus-ring ${
              error ? 'border-rust' : 'border-slate/25 focus:border-ink-navy'
            } ${className}`}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stamp-gray pointer-events-none" />
        </div>
        {error ? (
          <p className="text-xs text-rust font-medium">{error}</p>
        ) : hint ? (
          <p className="text-xs text-stamp-gray">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = 'Select';
