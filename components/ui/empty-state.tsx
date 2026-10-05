import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  code?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  code = 'STATE // 00',
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start justify-between border border-border bg-surface p-8 md:p-12',
        className
      )}
    >
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="font-mono text-label uppercase tracking-[0.14em] text-foreground-subtle">
            {code}
          </span>
          {icon && <div className="text-foreground-muted">{icon}</div>}
        </div>
        <div className="max-w-lg space-y-2.5">
          <h3 className="font-display text-h3 text-foreground">{title}</h3>
          <p className="text-body text-foreground-muted">{description}</p>
        </div>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center gap-4 pt-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
