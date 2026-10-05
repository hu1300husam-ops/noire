'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  code?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  code = 'ERR // TELEMETRY-500',
  title = 'Unable to Synchronize Catalog Telemetry',
  description = 'The request could not be completed due to a temporary connection interruption. Please retry or return to the primary archive.',
  onRetry,
  retryLabel = 'Retry Connection',
  secondaryAction,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start justify-between border border-danger/35 bg-danger-surface/40 p-8 md:p-12',
        className
      )}
    >
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between border-b border-danger/25 pb-4">
          <span className="font-mono text-label uppercase tracking-[0.14em] text-danger">
            {code}
          </span>
          <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />
        </div>
        <div className="max-w-lg space-y-2.5">
          <h3 className="font-display text-h3 text-foreground">{title}</h3>
          <p className="text-body text-foreground-muted">{description}</p>
        </div>
      </div>

      {(onRetry || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center gap-4 pt-2">
          {onRetry && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
