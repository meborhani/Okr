"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = Modal;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function Modal({ open, onClose, title, children }) {
    (0, react_1.useEffect)(() => {
        if (open)
            document.body.style.overflow = 'hidden';
        else
            document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    if (!open)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>

      
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-surface-100">
          
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-200 sm:hidden"/>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-surface-100 transition-colors">
            <lucide_react_1.X size={18} className="text-gray-500"/>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>);
}
//# sourceMappingURL=Modal.js.map