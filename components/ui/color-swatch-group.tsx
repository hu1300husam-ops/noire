'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ProductColorVariant } from '@/types';

export interface ColorSwatchGroupProps {
  colors: ProductColorVariant[];
  selectedColorId: string;
  onSelect: (color: ProductColorVariant) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ColorSwatchGroup({
  colors,
  selectedColorId,
  onSelect,
  size = 'md',
  showLabel = false,
  className,
}: ColorSwatchGroupProps) {
  const t = useTranslations('product');
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = colors.findIndex((color) => color.id === selectedColorId);
  const selectedColor = selectedIndex >= 0 ? colors[selectedIndex] : undefined;

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (colors.length <= 1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (index + 1) % colors.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (index - 1 + colors.length) % colors.length;
    }

    if (nextIndex !== null) {
      const nextColor = colors[nextIndex];
      onSelect(nextColor);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={cn('space-y-2.5', className)}>
      {showLabel && selectedColor && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-caption">
          <span className="font-mono text-label uppercase tracking-[0.12em] text-foreground-muted">
            {t('finish')}
          </span>
          <span className="font-medium text-foreground">
            {selectedColor.name}{' '}
            <span className="text-foreground-subtle">
              — {selectedColor.finish}
            </span>
          </span>
        </div>
      )}
      <div
        className="flex flex-wrap items-center gap-3"
        role="radiogroup"
        aria-label={t('finishOptions')}
      >
        {colors.map((color, idx) => {
          const isSelected = color.id === selectedColorId;
          return (
            <button
              key={color.id}
              ref={(el) => {
                buttonRefs.current[idx] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (selectedIndex < 0 && idx === 0) ? 0 : -1}
              aria-label={`${color.name} (${color.finish})${color.inStock ? '' : `, ${t('unavailable')}`}`}
              title={`${color.name} — ${color.finish}`}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(color);
              }}
              className={cn(
                'relative flex items-center justify-center rounded-full transition-transform duration-250 ease-noire-out after:absolute after:-inset-1.5 after:content-[""]',
                size === 'sm'
                  ? 'h-5 w-5 p-0.5'
                  : size === 'lg'
                    ? 'h-11 w-11 p-2'
                    : 'h-7 w-7 p-1',
                isSelected
                  ? 'ring-1 ring-foreground ring-offset-2 ring-offset-background'
                  : 'opacity-80 hover:scale-105 hover:opacity-100',
                !color.inStock && 'opacity-35'
              )}
            >
              <span
                className="h-full w-full rounded-full border border-black/15 dark:border-white/20"
                style={{ backgroundColor: color.hex }}
              />
              {!color.inStock && (
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="h-px w-full rotate-45 bg-foreground" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
