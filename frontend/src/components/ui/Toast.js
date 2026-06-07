"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toast = toast;
exports.ToastContainer = ToastContainer;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
let addToastFn = null;
function toast(message, type = 'success') {
    addToastFn?.(message, type);
}
function ToastContainer() {
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const remove = (0, react_1.useCallback)((id) => setToasts(t => t.filter(x => x.id !== id)), []);
    (0, react_1.useEffect)(() => {
        addToastFn = (message, type) => {
            const id = Date.now();
            setToasts(t => [...t, { id, message, type }]);
            setTimeout(() => remove(id), 3500);
        };
        return () => { addToastFn = null; };
    }, [remove]);
    return (<div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map(t => (<div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium
            ${t.type === 'success' ? 'bg-success-500 text-white' : 'bg-danger-500 text-white'}`}>
          {t.type === 'success' ? <lucide_react_1.CheckCircle2 size={18}/> : <lucide_react_1.XCircle size={18}/>}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)}><lucide_react_1.X size={16}/></button>
        </div>))}
    </div>);
}
//# sourceMappingURL=Toast.js.map