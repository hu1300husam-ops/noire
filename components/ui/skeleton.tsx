import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-xs bg-gradient-to-r from-surface-muted via-surface to-surface-muted bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
  );
}
