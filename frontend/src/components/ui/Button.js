"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
const lucide_react_1 = require("lucide-react");
const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white active:bg-primary-800',
    secondary: 'bg-surface-100 hover:bg-surface-200 text-gray-700 border border-surface-200',
    ghost: 'hover:bg-surface-100 text-gray-600',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white',
};
const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3.5 text-base',
};
function Button({ children, variant = 'primary', size = 'md', loading, fullWidth, disabled, className = '', ...props }) {
    return (<button disabled={disabled || loading} className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-150 select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `} {...props}>
      {loading && <lucide_react_1.Loader2 size={16} className="animate-spin"/>}
      {children}
    </button>);
}
//# sourceMappingURL=Button.js.map