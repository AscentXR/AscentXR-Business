import { createContext, useState, useCallback, useContext, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const noopToast: ToastContextType = { showToast: () => {} };

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || noopToast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: any, type: ToastType = 'info') => {
    const id = Date.now();
    const msg = typeof message === 'string' ? message : message?.message || 'An error occurred';
    setToasts((prev) => [...prev, { id, message: msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white animate-slide-in max-w-sm ${
              toast.type === 'success' ? 'bg-emerald-600' :
              toast.type === 'error' ? 'bg-red-600' :
              toast.type === 'warning' ? 'bg-amber-600' :
              'bg-blue-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{toast.type === 'success' ? '\u2713' : toast.type === 'error' ? '\u2715' : toast.type === 'warning' ? '\u26A0' : '\u2139'}</span>
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-auto text-white/70 hover:text-white"
              >
                \u00D7
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
