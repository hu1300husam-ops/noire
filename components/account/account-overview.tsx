import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Archive, FileText, Layers3 } from 'lucide-react';
import type { CustomerSession, Order, Product } from '@/types';
import { EmptyState, PriceDisplay, TechnicalCode } from '@/components/ui';
import {
  displayedFulfillmentStatusLabel,
  displayedOrderStatusLabel,
  formatOrderDate,
  orderDestinationSummary,
  orderTotals,
  orderUnitCount,
  paymentStatusLabel,
} from '@/lib/account/order-utils';

interface AccountOverviewProps {
  session: CustomerSession;
  isHydrated: boolean;
  activeAllocationCount: number;
  savedProducts: Product[];
  orders: Order[];
  orderedInstrumentCount: number;
}

export function AccountOverview({
  session,
  isHydrated,
  activeAllocationCount,
  savedProducts,
  orders,
  orderedInstrumentCount,
}: AccountOverviewProps) {
  const latestActiveOrder = orders.find((order) =>
    order.status === 'pending_settlement' ||
    order.status === 'processing' ||
    order.status === 'Craft & Calibration' ||
    order.status === 'shipped'
  );
  const latestOrder = latestActiveOrder ?? orders[0];
  const clientCode =
    session.status === 'authenticated'
      ? session.customer.clientCode || 'NOT ASSIGNED'
      : 'NOT ASSIGNED';
  const memberSince =
    session.status === 'authenticated'
      ? session.customer.memberSince || 'NOT RECORDED'
      : 'NOT RECORDED';

  const metrics = [
    { label: 'Client code', value: clientCode, detail: session.status === 'guest' ? 'Guest session' : 'Provider record' },
    { label: 'Member since', value: memberSince, detail: session.status === 'guest' ? 'Not verified' : 'Provider record' },
    { label: 'Active allocations', value: isHydrated ? String(activeAllocationCount).padStart(2, '0') : '—', detail: 'Units in current bag' },
    { label: 'Saved archive', value: isHydrated ? String(savedProducts.length).padStart(2, '0') : '—', detail: 'Resolved instruments', href: '/wishlist' },
    { label: 'Ordered instruments', value: isHydrated ? String(orderedInstrumentCount).padStart(2, '0') : '—', detail: 'Browser order records' },
  ];

  return (
    <section id="overview" aria-labelledby="account-overview-heading" className="scroll-mt-28 space-y-7 sm:space-y-9">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <TechnicalCode>Client telemetry // 01</TechnicalCode>
          <h2 id="account-overview-heading" className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Client dossier
          </h2>
        </div>
        <span className="border border-accent/35 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-accent">
          {session.status === 'guest' ? 'Preview // Unverified' : 'Provider identity'}
        </span>
      </div>

      <dl aria-live="polite" aria-atomic="false" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0 border border-border bg-surface p-3 sm:p-4">
            <dt className="min-h-8 font-mono text-[9px] uppercase leading-relaxed tracking-[0.11em] text-foreground-subtle">
              {metric.label}
            </dt>
            <dd className="mt-2 min-h-6 break-words font-mono text-sm tabular-nums text-foreground sm:text-base">
              {metric.href ? (
                <Link href={metric.href} className="underline decoration-border underline-offset-4 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
                  {metric.value}
                </Link>
              ) : metric.value}
            </dd>
            <p className="mt-2 break-words text-[10px] leading-relaxed text-foreground-subtle">{metric.detail}</p>
          </div>
        ))}
      </dl>

      {session.status === 'guest' && (
        <p className="border-l border-border-strong/50 pl-4 text-[11px] leading-relaxed text-foreground-muted">
          Identity and membership telemetry are intentionally unassigned in this preview. Counts below come only from this browser&apos;s shared commerce context.
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12 xl:gap-5">
        <section aria-labelledby="latest-allocation-heading" className="min-w-0 border border-border bg-surface p-4 sm:p-6 xl:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <TechnicalCode>Latest allocation // order archive</TechnicalCode>
              <h3 id="latest-allocation-heading" className="mt-2 font-display text-xl text-foreground">{latestActiveOrder ? 'Latest active allocation' : 'Most recent order record'}</h3>
            </div>
            <FileText className="h-4 w-4 text-foreground-subtle" aria-hidden="true" />
          </div>

          {!isHydrated ? (
            <div aria-label="Loading latest allocation" aria-busy="true" className="mt-5 space-y-3">
              <div className="h-5 w-2/3 animate-pulse bg-surface-muted" />
              <div className="h-4 w-full animate-pulse bg-surface-muted" />
              <div className="h-10 w-full animate-pulse bg-surface-muted" />
            </div>
          ) : latestOrder ? (
            <div className="pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">{`${formatOrderDate(latestOrder.createdAt)} // Browser record`}</p>
                  <p className="mt-1.5 break-all font-mono text-base tabular-nums text-foreground">{latestOrder.orderNumber}</p>
                </div>
                <span aria-label={`Order status: ${displayedOrderStatusLabel(latestOrder)}`} className="border border-border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-muted">
                  {displayedOrderStatusLabel(latestOrder)}
                </span>
              </div>

              <ul className="mt-4 space-y-2 border-y border-border py-4">
                {latestOrder.items.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex min-w-0 items-baseline justify-between gap-3 text-small">
                    <Link href={`/product/${item.productSlug}`} className="min-w-0 break-words text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
                      {item.productName}
                    </Link>
                    <span className="shrink-0 font-mono text-[10px] text-foreground-subtle">× {item.quantity}</span>
                  </li>
                ))}
                {latestOrder.items.length > 3 && (
                  <li className="font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-subtle">+ {latestOrder.items.length - 3} more line{latestOrder.items.length - 3 === 1 ? '' : 's'}</li>
                )}
              </ul>

              <dl className="grid grid-cols-2 gap-3 py-4">
                <div className="min-w-0">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">Settlement</dt>
                  <dd className="mt-1 break-words text-small text-foreground">{paymentStatusLabel(latestOrder.paymentStatus)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">Fulfillment</dt>
                  <dd className="mt-1 break-words text-small text-foreground">{displayedFulfillmentStatusLabel(latestOrder)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">Instruments</dt>
                  <dd className="mt-1 text-small text-foreground">{String(orderUnitCount(latestOrder)).padStart(2, '0')} units</dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">Destination</dt>
                  <dd className="mt-1 break-words text-small text-foreground">{orderDestinationSummary(latestOrder) ?? 'Not recorded'}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <PriceDisplay price={orderTotals(latestOrder).total} size="md" />
                <Link
                  href={`/account/orders/${encodeURIComponent(latestOrder.id)}`}
                  className="inline-flex min-h-11 items-center gap-2 border-b border-foreground px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  View order dossier <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              {latestOrder.status === 'pending_settlement' && (
                <p className="mt-4 border border-accent/25 bg-accent/5 p-3 text-[10px] leading-relaxed text-foreground-muted">
                  Pending settlement // This demonstration record does not indicate payment authorization, stock reservation, or initiated fulfillment.
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              code="ORDER ARCHIVE // EMPTY"
              title="No local order record."
              description="Orders appear here only after they are created in this browser. No account-wide or server order lookup is available in preview."
              icon={<Layers3 className="h-5 w-5" aria-hidden="true" />}
              primaryAction={
                <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 border border-foreground bg-foreground px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-background transition-colors hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
                  Explore instruments <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              }
              className="mt-5 p-5 sm:p-6"
            />
          )}
        </section>

        <section aria-labelledby="saved-preview-heading" className="min-w-0 border border-border bg-surface p-4 sm:p-6 xl:col-span-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <TechnicalCode>Saved archive // 03</TechnicalCode>
              <h3 id="saved-preview-heading" className="mt-2 font-display text-xl text-foreground">Instruments held</h3>
            </div>
            <Archive className="h-4 w-4 text-foreground-subtle" aria-hidden="true" />
          </div>

          {!isHydrated ? (
            <div aria-label="Loading saved instruments" aria-busy="true" className="mt-5 grid grid-cols-2 gap-2">
              {[0, 1].map((item) => <div key={item} className="aspect-square animate-pulse bg-surface-muted" />)}
            </div>
          ) : savedProducts.length > 0 ? (
            <>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {savedProducts.slice(0, 4).map((product, index) => (
                  <li key={product.id} className="min-w-0">
                    <Link href={`/product/${product.slug}`} aria-label={`Open ${product.name} product dossier`} className="group block min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
                      <span className="relative block aspect-square overflow-hidden border border-border bg-surface-muted">
                        <Image src={product.primaryImage} alt="" fill sizes="(min-width: 1280px) 15vw, (min-width: 640px) 25vw, 40vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" />
                        <span className="absolute left-2 top-2 bg-background/90 px-1.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-foreground">{String(index + 1).padStart(2, '0')}</span>
                      </span>
                      <span className="mt-2 block break-words font-display text-sm leading-snug text-foreground transition-colors group-hover:text-accent">{product.name}</span>
                      <span className="mt-1 block break-words font-mono text-[8px] uppercase tracking-[0.08em] text-foreground-subtle">{product.modelNumber}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/wishlist" className="mt-5 inline-flex min-h-11 w-full items-center justify-between gap-3 border-t border-border pt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
                Open saved archive <span className="flex items-center gap-1.5"><span>{String(savedProducts.length).padStart(2, '0')} records</span><ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
              </Link>
            </>
          ) : (
            <EmptyState
              code="SAVED ARCHIVE // EMPTY"
              title="No instruments held."
              description="Save products from the shop to keep them in your canonical wishlist. This atelier does not create a second saved-items list."
              icon={<Archive className="h-5 w-5" aria-hidden="true" />}
              primaryAction={<Link href="/wishlist" className="inline-flex min-h-11 items-center border-b border-foreground px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground hover:text-accent">Open saved archive</Link>}
              className="mt-5 p-5 sm:p-6"
            />
          )}
        </section>
      </div>
    </section>
  );
}
