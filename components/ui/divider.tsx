import React from 'react';
import { cn } from '@/lib/utils';

export function Divider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <hr className={cn('border-t border-border', className)} />;
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className="shrink-0 font-mono text-label uppercase tracking-[0.14em] text-foreground-subtle">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
