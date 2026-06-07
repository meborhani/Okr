import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border text-sm bg-white
            placeholder:text-gray-400 outline-none transition-all
            focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            ${error ? 'border-danger-500 bg-danger-50' : 'border-surface-200'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
