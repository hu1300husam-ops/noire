'use client';

import React, { useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { NOIRE_MOTION_TOKENS } from '@/lib/design-system/tokens';
import { useOverlayBehavior } from '@/lib/hooks/use-overlay-behavior';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  side?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  side = 'right',
  size = 'md',
  children,
  footer,
  className,
}: DrawerProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const containerRef = useOverlayBehavior<HTMLDivElement>({ isOpen, onClose });
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const subtitleId = `${dialogId}-subtitle`;

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  };

  const slideOffset = side === 'right' ? '100%' : '-100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-drawer flex">
          {/* Backdrop */}
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
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Dialog Panel */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={subtitle ? subtitleId : undefined}
            tabIndex={-1}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { x: slideOffset }
            }
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: slideOffset }}
            transition={{
              duration: prefersReducedMotion
                ? 0.05
                : NOIRE_MOTION_TOKENS.duration.normal,
              ease: NOIRE_MOTION_TOKENS.easing.outExpo,
            }}
            className={cn(
              'relative z-10 flex h-full w-full flex-col bg-background text-foreground shadow-modal focus:outline-none',
              side === 'right'
                ? 'ml-auto border-l border-border'
                : 'mr-auto border-r border-border',
              sizeMap[size],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                {subtitle && (
                  <p
                    id={subtitleId}
                    className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle"
                  >
                    {subtitle}
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
                aria-label="Close drawer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border border-transparent text-foreground-muted transition-colors hover:border-border hover:bg-surface hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="border-t border-border bg-surface px-5 py-4 sm:px-6 sm:py-5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
