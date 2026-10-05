'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuantitySelectorProps {
  value: number;
  onChange: (nextValue: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
  size = 'md',
  disabled = false,
  ariaLabel = 'Quantity selector',
  className,
}: QuantitySelectorProps) {
  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xs border border-border bg-surface select-none',
        size === 'sm' ? 'h-8' : 'h-11',
        className
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={cn(
          'flex h-full items-center justify-center text-foreground transition-colors hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent',
          size === 'sm' ? 'w-8' : 'w-10'
        )}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span
        className={cn(
          'flex items-center justify-center border-x border-border font-mono tabular-nums text-foreground',
          size === 'sm' ? 'w-9 text-xs' : 'w-12 text-small'
        )}
        aria-live="polite"
      >
        {String(value).padStart(2, '0')}
      </span>
      <button
        type="button"
        onClick={() => canIncrement && onChange(value + 1)}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className={cn(
          'flex h-full items-center justify-center text-foreground transition-colors hover:bg-surface-muted disabled:opacity-30 disabled:hover:bg-transparent',
          size === 'sm' ? 'w-8' : 'w-10'
        )}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
