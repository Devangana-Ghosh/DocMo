import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextValue {
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function ToastIcon({ type }: { type: ToastType }) {
  const iconClass = 'h-5 w-5';
  switch (type) {
    case 'success':
      return <CheckCircle2 className={iconClass} />;
    case 'error':
      return <CircleAlert className={iconClass} />;
    case 'warning':
      return <CircleAlert className={iconClass} />;
    default:
      return <Info className={iconClass} />;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => removeToast(id), 4500);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    pushToast,
    success: (title, message) => pushToast({ title, message, type: 'success' }),
    error: (title, message) => pushToast({ title, message, type: 'error' }),
    info: (title, message) => pushToast({ title, message, type: 'info' }),
    warning: (title, message) => pushToast({ title, message, type: 'warning' }),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] space-y-3 max-w-sm w-[calc(100vw-2rem)] sm:w-96">
        {toasts.map((toast) => {
          const styles = {
            success: 'border-green-200 bg-green-50 text-green-800',
            error: 'border-red-200 bg-red-50 text-red-800',
            info: 'border-blue-200 bg-blue-50 text-blue-800',
            warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
          };

          return (
            <div key={toast.id} className={`rounded-xl border-2 p-4 shadow-lg ${styles[toast.type]}`} role="status" aria-live="polite">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <ToastIcon type={toast.type} />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{toast.title}</p>
                  {toast.message && <p className="mt-1 text-sm opacity-90">{toast.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-lg p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
