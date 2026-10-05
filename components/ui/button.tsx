'use client';

import React from 'react';
import { Loader2, ArrowUpRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'accent'
  | 'ghost'
  | 'editorial'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  withArrow?: 'right' | 'up-right';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      withArrow,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-foreground text-background border border-foreground hover:bg-foreground/90 active:scale-[0.99]',
      secondary:
        'bg-surface-muted text-foreground border border-border hover:border-foreground/40 hover:bg-surface active:scale-[0.99]',
      outline:
        'bg-transparent text-foreground border border-border-strong/80 hover:bg-foreground hover:text-background active:scale-[0.99]',
      accent:
        'bg-accent text-accent-foreground border border-accent hover:opacity-95 active:scale-[0.99]',
      ghost:
        'bg-transparent text-foreground hover:bg-surface-muted/70 border border-transparent',
      editorial:
        'bg-transparent text-foreground border-b border-foreground px-0 py-1.5 rounded-none hover:text-accent hover:border-accent',
      danger:
        'bg-danger text-white border border-danger hover:opacity-90 active:scale-[0.99]',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'h-9 px-4 text-[11px] tracking-[0.12em] uppercase font-medium',
      md: 'h-11 px-6 text-xs tracking-[0.12em] uppercase font-medium',
      lg: 'h-13 px-8 py-3.5 text-xs tracking-[0.14em] uppercase font-medium',
      xl: 'h-14 px-10 py-4 text-xs tracking-[0.15em] uppercase font-medium',
      icon: 'h-10 w-10 p-0 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2.5 rounded-xs font-sans transition-all duration-250 ease-noire-out select-none disabled:pointer-events-none disabled:opacity-45',
          variantClasses[variant],
          variant !== 'editorial' && sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden="true" />
        )}
        {!isLoading && leftIcon && (
          <span className="shrink-0 transition-transform duration-250 ease-noire-out">
            {leftIcon}
          </span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 transition-transform duration-250 ease-noire-out group-hover:translate-x-0.5">
            {rightIcon}
          </span>
        )}
        {!isLoading && withArrow === 'right' && (
          <ArrowRight
            className="h-3.5 w-3.5 shrink-0 transition-transform duration-250 ease-noire-out group-hover:translate-x-1"
            aria-hidden="true"
          />
        )}
        {!isLoading && withArrow === 'up-right' && (
          <ArrowUpRight
            className="h-3.5 w-3.5 shrink-0 transition-transform duration-250 ease-noire-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
