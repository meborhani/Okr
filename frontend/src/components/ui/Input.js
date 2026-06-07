"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const react_1 = require("react");
exports.Input = (0, react_1.forwardRef)(({ label, error, hint, className = '', ...props }, ref) => {
    return (<div className="w-full">
        {label && (<label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>)}
        <input ref={ref} className={`
            w-full px-4 py-3 rounded-xl border text-sm bg-white
            placeholder:text-gray-400 outline-none transition-all
            focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            ${error ? 'border-danger-500 bg-danger-50' : 'border-surface-200'}
            ${className}
          `} {...props}/>
        {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      </div>);
});
exports.Input.displayName = 'Input';
//# sourceMappingURL=Input.js.map