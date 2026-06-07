import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error';
interface ToastItem { id: number; message: string; type: ToastType; }

let addToastFn: ((msg: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const remove = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), []);

  useEffect(() => {
    addToastFn = (message, type) => {
      const id = Date.now();
      setToasts(t => [...t, { id, message, type }]);
      setTimeout(() => remove(id), 3500);
    };
    return () => { addToastFn = null; };
  }, [remove]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium
            ${t.type === 'success' ? 'bg-success-500 text-white' : 'bg-danger-500 text-white'}`}>
          {t.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)}><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}
