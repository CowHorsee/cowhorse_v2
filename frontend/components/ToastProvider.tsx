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

const toastCardStyles: Record<ToastVariant, string> = {
  success: 'border-l-[6px] border-l-blue-500',
  error: 'border-l-[6px] border-l-red-500',
  info: 'border-l-[6px] border-l-slate-400',
};

const toastIconWrapStyles: Record<ToastVariant, string> = {
  success: 'bg-blue-100 text-blue-600',
  error: 'bg-red-100 text-red-600',
  info: 'bg-slate-100 text-slate-600',
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === 'error') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 7v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (variant === 'success') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 12.5l2.5 2.5L16 9.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M9.5 18h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 21h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.2 14.2A5.4 5.4 0 016.6 10a5.4 5.4 0 0110.8 0 5.4 5.4 0 01-1.6 4.2L14.8 15a2 2 0 00-.6 1.4v.6h-4.4v-.6A2 2 0 009.2 15l-1-0.8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(25rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.16)] ${
              toastCardStyles[toast.variant]
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  toastIconWrapStyles[toast.variant]
                }`}
              >
                <ToastIcon variant={toast.variant} />
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-sm font-bold text-slate-800">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close toast"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
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
