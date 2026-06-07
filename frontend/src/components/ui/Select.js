"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = void 0;
const react_1 = require("react");
exports.Select = (0, react_1.forwardRef)(({ label, error, options, placeholder, className = '', ...props }, ref) => (<div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select ref={ref} className={`w-full px-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all
          focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer
          ${error ? 'border-danger-500' : 'border-surface-200'} ${className}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
    </div>));
exports.Select.displayName = 'Select';
//# sourceMappingURL=Select.js.map