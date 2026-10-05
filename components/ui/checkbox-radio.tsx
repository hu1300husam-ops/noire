'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  count?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  count,
  disabled = false,
  id,
  className,
}: CheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'group flex cursor-pointer items-start justify-between gap-3 select-none',
        disabled && 'cursor-not-allowed opacity-45',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />
          <span
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-none border transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-foreground peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
              checked
                ? 'border-foreground bg-foreground text-background'
                : 'border-border-strong/50 bg-surface group-hover:border-foreground'
            )}
          >
            {checked && <Check className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />}
          </span>
        </span>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="block text-small text-foreground transition-colors group-hover:text-foreground">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-caption text-foreground-subtle">
                {description}
              </span>
            )}
          </div>
        )}
      </div>

      {typeof count === 'number' && (
        <span className="font-mono text-[11px] tabular-nums text-foreground-subtle">
          [{count}]
        </span>
      )}
    </label>
  );
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id ?? generatedId;
  const labelId = `${switchId}-label`;
  const descId = `${switchId}-desc`;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4',
        disabled && 'opacity-50',
        className
      )}
    >
      {(label || description) && (
        <div
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            'space-y-0.5 select-none',
            !disabled && 'cursor-pointer'
          )}
        >
          {label && (
            <p id={labelId} className="text-small font-medium text-foreground">
              {label}
            </p>
          )}
          {description && (
            <p id={descId} className="text-caption text-foreground-muted">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center border transition-colors duration-250 ease-noire-out',
          checked
            ? 'border-foreground bg-foreground'
            : 'border-border bg-surface-muted'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform transition-transform duration-250 ease-noire-out',
            checked
              ? 'translate-x-5 bg-background'
              : 'translate-x-1 bg-foreground-muted'
          )}
        />
      </button>
    </div>
  );
}
