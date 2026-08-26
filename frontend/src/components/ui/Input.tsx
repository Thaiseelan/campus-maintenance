import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-display font-medium text-ink-navy">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2.5 bg-white border rounded-md text-sm text-ink-navy placeholder:text-stamp-gray transition-all duration-150 focus-ring ${
            error ? 'border-rust' : 'border-slate/25 focus:border-ink-navy'
          } ${className}`}
          {...rest}
        />
        {error ? (
          <p className="text-xs text-rust font-medium">{error}</p>
        ) : hint ? (
          <p className="text-xs text-stamp-gray">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-display font-medium text-ink-navy">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full px-3.5 py-2.5 bg-white border rounded-md text-sm text-ink-navy placeholder:text-stamp-gray transition-all duration-150 focus-ring resize-y min-h-[100px] ${
            error ? 'border-rust' : 'border-slate/25 focus:border-ink-navy'
          } ${className}`}
          {...rest}
        />
        {error ? (
          <p className="text-xs text-rust font-medium">{error}</p>
        ) : hint ? (
          <p className="text-xs text-stamp-gray">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
