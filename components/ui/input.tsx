'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  codeLabel?: string;
  hint?: string;
  error?: string;
  variant?: 'architectural' | 'editorial';
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      codeLabel,
      hint,
      error,
      variant = 'architectural',
      leftElement,
      rightElement,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full space-y-2">
        {(label || codeLabel) && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {label && (
              <label
                htmlFor={inputId}
                className="block font-mono text-label uppercase tracking-[0.12em] text-foreground"
              >
                {label}
              </label>
            )}
            {codeLabel && (
              <span className="font-mono text-[11px] text-foreground-subtle">
                {codeLabel}
              </span>
            )}
          </div>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-foreground-muted">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              'w-full bg-transparent text-body text-foreground placeholder:text-foreground-subtle transition-colors duration-250 ease-noire-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              variant === 'architectural' &&
                'h-11 rounded-xs border border-border bg-surface px-3.5 focus:border-foreground',
              variant === 'editorial' &&
                'h-11 rounded-none border-b border-border px-0 focus:border-foreground',
              leftElement && variant === 'architectural' && 'pl-10',
              leftElement && variant === 'editorial' && 'pl-7',
              rightElement && variant === 'architectural' && 'pr-10',
              rightElement && variant === 'editorial' && 'pr-7',
              error && 'border-danger focus:border-danger',
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3.5 flex items-center text-foreground-muted">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="font-mono text-caption text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            className="text-caption text-foreground-subtle"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block font-mono text-label uppercase tracking-[0.12em] text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
              ? `${textareaId}-hint`
              : undefined
          }
          className={cn(
            'min-h-[112px] w-full rounded-xs border border-border bg-surface p-3.5 text-body text-foreground placeholder:text-foreground-subtle transition-colors duration-250 focus:border-foreground focus:outline-none disabled:opacity-50',
            error && 'border-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="font-mono text-caption text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${textareaId}-hint`}
            className="text-caption text-foreground-subtle"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ label: string; value: string }>;
  hint?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, hint, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="block font-mono text-label uppercase tracking-[0.12em] text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                ? `${selectId}-hint`
                : undefined
            }
            className={cn(
              'h-11 w-full appearance-none rounded-xs border border-border bg-surface pl-3.5 pr-10 text-small font-medium text-foreground transition-colors duration-250 focus:border-foreground focus:outline-none disabled:opacity-50',
              error && 'border-danger',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="font-mono text-caption text-danger"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${selectId}-hint`}
            className="text-caption text-foreground-subtle"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
