import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <textarea
        ref={ref}
        rows={3}
        className={`w-full px-4 py-3 rounded-xl border text-sm bg-white placeholder:text-gray-400
          outline-none transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none
          ${error ? 'border-danger-500 bg-danger-50' : 'border-surface-200'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
