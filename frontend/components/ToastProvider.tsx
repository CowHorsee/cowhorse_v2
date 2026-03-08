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
  success:
    'border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/70 text-slate-900',
  error:
    'border-brand-red/35 bg-gradient-to-br from-white to-rose-50/70 text-slate-900',
  info: 'border-brand-blue/25 bg-gradient-to-br from-white to-slate-100 text-slate-900',
};

const toastAccentStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  error: 'bg-brand-red',
  info: 'bg-brand-blue',
};

const toastBadgeStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-brand-red',
  info: 'bg-brand-blue/10 text-brand-blue',
};

const toastIconWrapStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-brand-red/30 bg-rose-50 text-brand-red',
  info: 'border-brand-blue/25 bg-brand-blue/5 text-brand-blue',
};

const toastIcons: Record<ToastVariant, string> = {
  success: 'OK',
  error: '!!',
  info: 'i',
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
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(25rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto overflow-hidden rounded-[22px] border shadow-[0_20px_55px_rgba(15,23,42,0.14)] backdrop-blur ${
              toastStyles[toast.variant]
            }`}
          >
            <div
              className={`h-1.5 w-full ${toastAccentStyles[toast.variant]}`}
            />
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black uppercase ${
                  toastIconWrapStyles[toast.variant]
                }`}
                aria-hidden="true"
              >
                {toastIcons[toast.variant]}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${
                    toastBadgeStyles[toast.variant]
                  }`}
                >
                  {toast.variant}
                </p>
                <p className="mt-2 text-[15px] font-bold text-slate-900">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full border border-slate-300 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500 transition hover:border-brand-blue hover:text-brand-blue"
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
