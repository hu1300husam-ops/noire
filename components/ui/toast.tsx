'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, Check, AlertCircle, ShoppingBag, Heart, Info } from 'lucide-react';
import { NOIRE_MOTION_TOKENS } from '@/lib/design-system/tokens';
import { cn } from '@/lib/utils';

export type ToastType = 'cart' | 'wishlist' | 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  cart: <ShoppingBag className="h-3.5 w-3.5" />,
  wishlist: <Heart className="h-3.5 w-3.5" />,
  success: <Check className="h-3.5 w-3.5" />,
  error: <AlertCircle className="h-3.5 w-3.5" />,
  info: <Info className="h-3.5 w-3.5" />,
};

const TOAST_LABELS: Record<ToastType, string> = {
  cart: 'BAG // UPDATED',
  wishlist: 'ARCHIVE // SAVED',
  success: 'SYSTEM // CONFIRMED',
  error: 'SYSTEM // NOTICE',
  info: 'NOIRÉ // DISPATCH',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const prefersReducedMotion = useReducedMotion();

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);

      const timer = window.setTimeout(() => {
        timersRef.current.delete(id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);

      timersRef.current.set(id, timer);
    },
    []
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Fixed Bottom-Right Architectural Toast Stack */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-5 right-5 z-toast flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, scale: 0.98 }
              }
              transition={{
                duration: prefersReducedMotion
                  ? 0.05
                  : NOIRE_MOTION_TOKENS.duration.fast,
                ease: NOIRE_MOTION_TOKENS.easing.outExpo,
              }}
              className={cn(
                'pointer-events-auto relative overflow-hidden border bg-surface-inverse text-foreground-inverse shadow-modal',
                toast.type === 'error'
                  ? 'border-danger/60'
                  : 'border-border-inverse'
              )}
            >
              <div className="flex items-start justify-between gap-3.5 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border',
                      toast.type === 'error'
                        ? 'border-danger/50 bg-danger/20 text-danger'
                        : 'border-border-inverse bg-surface-inverse-muted text-accent'
                    )}
                  >
                    {TOAST_ICONS[toast.type]}
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                      {TOAST_LABELS[toast.type]}
                    </p>
                    <p className="font-display text-sm font-medium text-foreground-inverse">
                      {toast.title}
                    </p>
                    {toast.description && (
                      <p className="text-xs text-foreground-subtle">
                        {toast.description}
                      </p>
                    )}
                    {toast.actionLabel && toast.onAction && (
                      <button
                        type="button"
                        onClick={() => {
                          toast.onAction?.();
                          removeToast(toast.id);
                        }}
                        className="mt-2 inline-block border-b border-accent pb-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-80"
                      >
                        {toast.actionLabel}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-foreground-subtle transition-colors hover:text-foreground-inverse"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
