'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { NOIRE_MOTION_TOKENS } from '@/lib/design-system/tokens';
import { cn } from '@/lib/utils';

export interface AccordionItemData {
  id: string;
  index?: string;
  title: string;
  content: React.ReactNode;
}

export function Accordion({
  items,
  defaultOpenIds = [],
  allowMultiple = false,
  className,
}: {
  items: AccordionItemData[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  className?: string;
}) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);
  const prefersReducedMotion = useReducedMotion();

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const isOpen = prev.includes(id);
      if (allowMultiple) {
        return isOpen ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className={cn('divide-y divide-border border-y border-border', className)}>
      {items.map((item, idx) => {
        const isOpen = openIds.includes(item.id);
        const indexLabel = item.index ?? String(idx + 1).padStart(2, '0');

        return (
          <div key={item.id} className="group">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`accordion-panel-${item.id}`}
                id={`accordion-trigger-${item.id}`}
                onClick={() => toggleItem(item.id)}
                className="flex w-full items-center justify-between gap-4 py-5 text-start transition-colors hover:text-accent"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-label text-foreground-subtle">
                    {indexLabel}
                  </span>
                  <span className="font-display text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-accent">
                    {item.title}
                  </span>
                </div>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground-muted">
                  {isOpen ? (
                    <Minus className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`accordion-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`accordion-trigger-${item.id}`}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 1, height: 'auto' }
                      : { opacity: 0, height: 0 }
                  }
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    duration: prefersReducedMotion
                      ? 0
                      : NOIRE_MOTION_TOKENS.duration.fast,
                    ease: NOIRE_MOTION_TOKENS.easing.outExpo,
                  }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 ps-8 pe-4 text-body text-foreground-muted">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
