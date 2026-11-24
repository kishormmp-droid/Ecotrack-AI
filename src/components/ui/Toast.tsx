import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastItem {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { ...toast, id };
    setToasts(prev => [...prev, item]);

    const duration = toast.durationMs ?? 4500;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle2 className="h-4 w-4 text-eco-600 dark:text-eco-400 shrink-0" />,
            danger: <AlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400 shrink-0" />,
            warning: <AlertTriangle className="h-4 w-4 text-warning-600 dark:text-warning-400 shrink-0" />,
            info: <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs transition-all",
                toast.type === 'danger' && "border-danger-200 dark:border-danger-900/50",
                toast.type === 'warning' && "border-warning-200 dark:border-warning-900/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                {icons[toast.type]}
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {toast.message}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      dismissToast(toast.id);
                    }}
                    className="font-semibold text-eco-600 dark:text-eco-400 hover:underline px-1 py-0.5"
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded"
                  aria-label="Close notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
