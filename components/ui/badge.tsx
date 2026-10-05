import React from 'react';
import { cn } from '@/lib/utils';
import type { StockStatus, ProductBadgeType } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'obsidian'
    | 'accent'
    | 'outline'
    | 'success'
    | 'warning'
    | 'danger';
  withDot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  withDot = false,
  className,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-surface-muted text-foreground border-border',
    obsidian: 'bg-foreground text-background border-foreground',
    accent: 'bg-accent text-accent-foreground border-accent',
    outline: 'bg-transparent text-foreground border-border-strong/60',
    success: 'bg-success-surface text-success border-success/25',
    warning: 'bg-warning-surface text-warning border-warning/25',
    danger: 'bg-danger-surface text-danger border-danger/25',
  };

  const dotColors = {
    default: 'bg-foreground-muted',
    obsidian: 'bg-background',
    accent: 'bg-accent-foreground',
    outline: 'bg-foreground',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] leading-none',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export function ProductBadge({
  type,
  label,
  className,
}: {
  type?: ProductBadgeType;
  label?: string;
  className?: string;
}) {
  if (!type && !label) return null;

  const config: Record<
    ProductBadgeType,
    { text: string; variant: BadgeProps['variant'] }
  > = {
    new_release: { text: 'New Release', variant: 'obsidian' },
    limited_edition: { text: 'Limited Edition', variant: 'accent' },
    archival: { text: 'Archival Series', variant: 'outline' },
    bestseller: { text: 'Signature', variant: 'default' },
    award_winner: { text: 'Red Dot // Best', variant: 'default' },
  };

  const resolved = type ? config[type] : { text: label ?? '', variant: 'default' as const };

  return (
    <Badge variant={resolved.variant} className={className}>
      {label ?? resolved.text}
    </Badge>
  );
}

export function StockStatusIndicator({
  status,
  inventoryCount,
  className,
}: {
  status: StockStatus;
  inventoryCount?: number;
  className?: string;
}) {
  const statusMap: Record<
    StockStatus,
    { label: string; dotClass: string; textClass: string }
  > = {
    in_stock: {
      label: 'In Stock — Demo Catalog',
      dotClass: 'bg-success',
      textClass: 'text-foreground-muted',
    },
    low_stock: {
      label: inventoryCount
        ? `Limited Allocation (${inventoryCount} Remaining)`
        : 'Limited Allocation Remaining',
      dotClass: 'bg-warning animate-pulse-subtle',
      textClass: 'text-warning',
    },
    pre_order: {
      label: 'Next Batch Allocation — Pre-Order',
      dotClass: 'bg-accent',
      textClass: 'text-accent',
    },
    out_of_stock: {
      label: 'Currently Exhausted',
      dotClass: 'bg-danger',
      textClass: 'text-danger',
    },
  };

  const config = statusMap[status];

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
      <span
        className={cn(
          'font-mono text-[11px] uppercase tracking-[0.1em]',
          config.textClass
        )}
      >
        {config.label}
      </span>
    </div>
  );
}
