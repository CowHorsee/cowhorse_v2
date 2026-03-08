import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info';

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
  dismissToast: (toastId: string) => void;
};

const toastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  error: 'border-rose-200 bg-rose-50 text-rose-950',
  info: 'border-sky-200 bg-sky-50 text-sky-950',
};

const toastAccentStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  info: 'bg-sky-500',
};

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutIdsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;

    return () => {
      Object.values(timeoutIds).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  function dismissToast(toastId: string) {
    const timeoutId = timeoutIdsRef.current[toastId];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutIdsRef.current[toastId];
    }

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId)
    );
  }

  function showToast({
    title,
    description,
    variant = 'info',
    durationMs = 3600,
  }: ToastInput) {
    const toastId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: toastId,
        title,
        description,
        variant,
        durationMs,
      },
    ]);

    timeoutIdsRef.current[toastId] = window.setTimeout(() => {
      dismissToast(toastId);
    }, durationMs);
  }

  return (
    <toastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto overflow-hidden rounded-[24px] border shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur ${
              toastStyles[toast.variant]
            }`}
          >
            <div
              className={`h-1.5 w-full ${toastAccentStyles[toast.variant]}`}
            />
            <div className="flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold uppercase tracking-[0.14em]">
                  {toast.variant}
                </p>
                <p className="mt-2 text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full border border-current/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] transition hover:bg-white/60"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </toastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(toastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
}
