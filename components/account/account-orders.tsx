import { Link } from '@/i18n/navigation';
import { ArrowUpRight, ClipboardList, FileText } from 'lucide-react';
import type { Order } from '@/types';
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

export function AccountOrders({
  orders,
  isHydrated,
}: {
  orders: Order[];
  isHydrated: boolean;
}) {
  return (
    <section id="order-archive" aria-labelledby="order-archive-heading" className="scroll-mt-28 space-y-5 sm:space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <TechnicalCode>Ledger // 02</TechnicalCode>
          <h2 id="order-archive-heading" className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Order Archive
          </h2>
          <p className="mt-2 max-w-2xl text-small leading-relaxed text-foreground-muted">
            Only order records stored by this browser&apos;s existing commerce session are shown. No mock customer records or unscoped server orders are exposed here.
          </p>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">
          {isHydrated ? `${String(orders.length).padStart(2, '0')} RECORDS` : 'SYNCING'}
        </span>
      </div>

      {!isHydrated ? (
        <div role="status" aria-label="Loading order archive" aria-busy="true" className="space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="border border-border bg-surface p-4 sm:p-6">
              <div className="h-4 w-48 animate-pulse bg-surface-muted" />
              <div className="mt-4 h-20 w-full animate-pulse bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <ol className="space-y-3">
          {orders.map((order) => {
            const totals = orderTotals(order);
            const destination = orderDestinationSummary(order);
            return (
              <li key={order.id}>
                <article className="min-w-0 border border-border bg-surface p-4 transition-colors hover:border-foreground/40 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <TechnicalCode>{`ORDER // ${order.orderNumber}`}</TechnicalCode>
                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-subtle">
                          {formatOrderDate(order.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-2 break-all font-display text-xl text-foreground">
                        {order.orderNumber}
                      </h3>
                      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-subtle">
                        {String(orderUnitCount(order)).padStart(2, '0')} instruments // browser demonstration record
                      </p>

                      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-small text-foreground-muted">
                        {order.items.slice(0, 3).map((item) => (
                          <li key={item.id} className="flex min-w-0 items-center gap-2">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                            <span className="max-w-[220px] break-words">{item.productName}</span>
                            <span className="shrink-0 font-mono text-[9px] text-foreground-subtle">×{item.quantity}</span>
                          </li>
                        ))}
                        {order.items.length > 3 && (
                          <li className="font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-subtle">+{order.items.length - 3} more lines</li>
                        )}
                      </ul>
                    </div>

                    <dl className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-4 border-y border-border py-3 lg:w-[19rem] lg:border-y-0 lg:py-0">
                      <div className="min-w-0">
                        <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">Settlement</dt>
                        <dd aria-label={`Settlement status: ${paymentStatusLabel(order.paymentStatus)}`} className="mt-1 break-words text-small text-foreground">{paymentStatusLabel(order.paymentStatus)}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">Fulfillment</dt>
                        <dd aria-label={`Fulfillment status: ${displayedFulfillmentStatusLabel(order)}`} className="mt-1 break-words text-small text-foreground">{displayedFulfillmentStatusLabel(order)}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">Record status</dt>
                        <dd className="mt-1 break-words text-small text-foreground">{displayedOrderStatusLabel(order)}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">Destination</dt>
                        <dd className="mt-1 break-words text-small text-foreground">{destination ?? 'Not recorded'}</dd>
                      </div>
                      <div className="col-span-2 flex items-end justify-between gap-3 border-t border-border pt-3">
                        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">Total // {order.currency}</span>
                        <PriceDisplay price={totals.total} size="md" />
                      </div>
                    </dl>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="flex min-w-0 items-start gap-2 text-[10px] leading-relaxed text-foreground-subtle">
                      <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>Browser-local record // identity and settlement are not independently verified.</span>
                    </p>
                    <Link
                      href={`/account/orders/${encodeURIComponent(order.id)}`}
                      aria-label={`Inspect order dossier ${order.orderNumber}`}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 border-b border-foreground px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      Inspect dossier <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState
          code="ORDER ARCHIVE // 00"
          title="No allocation records in this browser."
          description="An order dossier will appear here after checkout creates a local demonstration record. The atelier does not access the mock admin order archive or claim a server-verified purchase history."
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
          primaryAction={
            <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 border border-foreground bg-foreground px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-background transition-colors hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
              Browse instruments <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
          secondaryAction={
            <Link href="/cart" className="inline-flex min-h-11 items-center border-b border-border px-1 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-muted transition-colors hover:border-foreground hover:text-foreground">
              Review current bag
            </Link>
          }
          className="p-5 sm:p-8"
        />
      )}
    </section>
  );
}
