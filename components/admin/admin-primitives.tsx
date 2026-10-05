'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Badge, TechnicalCode, Skeleton } from '@/components/ui';
import type { Order, Product } from '@/types';
import { orderStatusLabel, paymentStatusLabel } from '@/lib/account/order-utils';
import { cn } from '@/lib/utils';

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col items-start justify-between gap-5 border-b border-border pb-6 sm:mb-9 sm:flex-row sm:items-end">
      <div className="min-w-0 max-w-3xl">
        <TechnicalCode>{eyebrow}</TechnicalCode>
        <h1 className="mt-2 break-words font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-small leading-relaxed text-foreground-muted">
          {description}
        </p>
      </div>
      {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">{actions}</div>}
    </header>
  );
}

export function AdminLocalNotice({
  children = 'ADMIN AUTHENTICATION IS NOT IMPLEMENTED. This local demo command center has no production backend or authorization boundary.',
}: {
  children?: React.ReactNode;
}) {
  return (
    <aside role="note" className="mb-6 flex items-start gap-3 border border-warning/30 bg-warning-surface/60 px-4 py-3.5 text-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-warning">Local / demo boundary</p>
        <p className="mt-1 text-[11px] leading-relaxed text-foreground-muted">{children}</p>
      </div>
    </aside>
  );
}

export function AdminMetric({
  label,
  value,
  note,
  index,
}: {
  label: string;
  value: string | number;
  note: string;
  index: string;
}) {
  return (
    <article className="min-w-0 border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <TechnicalCode>{index}</TechnicalCode>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">Local</span>
      </div>
      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-muted">{label}</p>
      <p className="mt-1.5 break-words font-display text-3xl tabular-nums text-foreground">{value}</p>
      <p className="mt-2 text-[10px] leading-relaxed text-foreground-subtle">{note}</p>
    </article>
  );
}

export function AdminLoadingState({
  label = 'Loading local operations data',
  rows = 5,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={label} className="space-y-4">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="mt-7 space-y-2 border-y border-border py-2">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 border-b border-border py-4 last:border-0 sm:grid-cols-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const variant = status === 'pending_settlement'
    ? 'warning'
    : status === 'cancelled' || status === 'returned'
    ? 'danger'
    : status === 'shipped' || status === 'delivered'
    ? 'success'
    : 'default';
  return <Badge variant={variant} withDot>{orderStatusLabel(status)}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: Order['paymentStatus'] }) {
  const variant = status === 'paid'
    ? 'success'
    : status === 'failed' || status === 'refunded'
    ? 'danger'
    : 'warning';
  return <Badge variant={variant} withDot>{paymentStatusLabel(status)}</Badge>;
}

export function ProductStatusBadge({ product }: { product: Product }) {
  const config = product.status === 'active'
    ? { label: 'Active', variant: 'success' as const }
    : product.status === 'draft'
    ? { label: 'Draft', variant: 'warning' as const }
    : { label: 'Archived', variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function AdminSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn('border border-border bg-surface', className)}>{children}</section>;
}
