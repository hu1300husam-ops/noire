'use client';

import React, { useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NOIRE_MOTION_TOKENS } from '@/lib/design-system/tokens';
import { useOverlayBehavior } from '@/lib/hooks/use-overlay-behavior';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  code?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  code,
  size = 'md',
  children,
  footer,
  className,
}: ModalProps) {
  const t = useTranslations('common');
  const prefersReducedMotion = Boolean(useReducedMotion());
  const containerRef = useOverlayBehavior<HTMLDivElement>({ isOpen, onClose });
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const codeId = `${dialogId}-code`;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[94vw] min-h-[85vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion
                ? 0
                : NOIRE_MOTION_TOKENS.duration.fast,
            }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={code ? codeId : undefined}
            tabIndex={-1}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.97, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.98, y: 8 }
            }
            transition={{
              duration: prefersReducedMotion
                ? 0.05
                : NOIRE_MOTION_TOKENS.duration.normal,
              ease: NOIRE_MOTION_TOKENS.easing.outExpo,
            }}
            className={cn(
              'relative z-10 flex max-h-[92vh] w-full flex-col border border-border bg-background text-foreground shadow-modal focus:outline-none',
              sizeMap[size],
              className
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6 sm:py-4.5">
              <div className="min-w-0">
                {code && (
                  <p
                    id={codeId}
                    className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle"
                  >
                    {code}
                  </p>
                )}
                <h2
                  id={titleId}
                  className="truncate font-display text-lg font-medium tracking-tight text-foreground"
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('close')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-transparent text-foreground-muted transition-colors hover:border-border hover:bg-surface hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>

            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-surface px-5 py-4 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
