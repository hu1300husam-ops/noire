'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CircleAlert, Package, ShoppingBag, Users } from 'lucide-react';
import { Badge, EmptyState, ErrorState, TechnicalCode } from '@/components/ui';
import { AdminLocalNotice, AdminMetric, AdminPageHeader, AdminLoadingState, OrderStatusBadge } from '@/components/admin/admin-primitives';
import { loadAdminProducts } from '@/app/admin/actions';
import { useCommerce } from '@/lib/context/commerce-context';
import { deriveGuestClientLedger, inventoryState } from '@/lib/admin/derive';
import { formatOrderDate, orderTotals } from '@/lib/account/order-utils';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export function AdminOverview() {
  const { placedOrders, isCartHydrated } = useCommerce();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setProducts(await loadAdminProducts());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'The local catalog service is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const recentOrders = useMemo(
    () => [...placedOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [placedOrders]
  );
  const guestContacts = useMemo(() => deriveGuestClientLedger(placedOrders), [placedOrders]);

  if (isLoading || !isCartHydrated) return <AdminLoadingState label="Loading local command center records" rows={4} />;
  if (loadError || !products) {
    return (
      <>
        <AdminPageHeader eyebrow="OPERATIONS // 00" title="Command Center" description="An operational reading of local orders and the existing catalog service." />
        <AdminLocalNotice />
        <ErrorState
          code="ERR // COMMAND CENTER DATA"
          title="Overview data could not be read."
          description={loadError ?? 'The local catalog source returned no data.'}
          onRetry={() => void loadProducts()}
          retryLabel="Retry local read"
        />
      </>
    );
  }

  const orderValue = placedOrders.reduce((total, order) => total + orderTotals(order).total, 0);
  const averageOrderValue = placedOrders.length > 0 ? orderValue / placedOrders.length : 0;
  const lowStockProducts = products.filter((product) =>
    product.status === 'active' && (product.stockStatus === 'low_stock' || product.inventoryCount <= 5)
  );
  const activeProducts = products.filter((product) => product.status === 'active').length;
  const archivedProducts = products.filter((product) => product.status === 'archived').length;
  const pendingSettlement = placedOrders.filter((order) => order.status === 'pending_settlement').length;
  const paidOrders = placedOrders.filter((order) => order.paymentStatus === 'paid').length;
  const fulfilledOrders = placedOrders.filter((order) => order.status === 'delivered').length;
  const cancelledOrders = placedOrders.filter((order) => order.status === 'cancelled').length;
  const processingOrders = placedOrders.filter((order) =>
    order.status === 'processing' || order.status === 'Craft & Calibration'
  ).length;

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader
        eyebrow="OPERATIONS // 00 · LOCAL COMMAND"
        title="Command Center"
        description="A concise operational view derived from this browser’s CommerceContext and NOIRÉ’s existing catalog service. No seeded admin customer or order records are queried."
        actions={<Link href="/admin/orders" className="inline-flex min-h-11 items-center gap-2 border border-foreground bg-foreground px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-background transition-colors hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">Open order ledger <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
      />
      <AdminLocalNotice>
        Orders and guest contacts are read only from browser-local placed orders. Catalog counts come from the existing demo service’s in-memory catalog. Figures are not production analytics, recognized revenue, or authenticated customer records.
      </AdminLocalNotice>

      <section aria-labelledby="order-metrics-heading" className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <TechnicalCode>01 // ORDER REGISTER · BROWSER LOCAL</TechnicalCode>
            <h2 id="order-metrics-heading" className="mt-1 font-display text-xl text-foreground">Order state</h2>
          </div>
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground-muted underline decoration-border underline-offset-4 hover:text-foreground">Inspect ledger <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-5">
          <AdminMetric index="ORD // 01" label="Total local orders" value={placedOrders.length} note="Existing placedOrders array only." />
          <AdminMetric index="ORD // 02" label="Pending settlement" value={pendingSettlement} note="Payment remains pending; no collection action exists." />
          <AdminMetric index="ORD // 03" label="Payment marked paid" value={paidOrders} note="Source status only; not independently verified." />
          <AdminMetric index="ORD // 04" label="Delivered status" value={fulfilledOrders} note="Recorded status, not a new shipment assertion." />
          <AdminMetric index="ORD // 05" label="Cancelled" value={cancelledOrders} note="Local order status as recorded." />
        </div>
      </section>

      <section aria-labelledby="value-metrics-heading" className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TechnicalCode>02 // ORDER VALUE · NOT REVENUE</TechnicalCode>
          <h2 id="value-metrics-heading" className="mt-1 font-display text-xl text-foreground">Recorded order value</h2>
          <p className="mt-2 max-w-xl text-small leading-relaxed text-foreground-muted">Local order totals include records whose settlement is still pending. This is not a revenue ledger or accounting figure.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:col-span-7">
          <AdminMetric index="VAL // 01" label="Gross recorded value" value={formatPrice(orderValue)} note="Sum of existing order totals; pending amounts included." />
          <AdminMetric index="VAL // 02" label="Average order value" value={placedOrders.length ? formatPrice(averageOrderValue) : '—'} note="Local total divided by local order count." />
        </div>
      </section>

      <section aria-labelledby="catalog-metrics-heading" className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <TechnicalCode>03 // CATALOG · EXISTING DEMO SERVICE</TechnicalCode>
            <h2 id="catalog-metrics-heading" className="mt-1 font-display text-xl text-foreground">Catalog &amp; availability</h2>
          </div>
          <Link href="/admin/products" className="inline-flex min-h-11 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground-muted underline decoration-border underline-offset-4 hover:text-foreground">Open product command <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
          <AdminMetric index="CAT // 01" label="Total products" value={products.length} note="Loaded from existing product catalog service." />
          <AdminMetric index="CAT // 02" label="Active products" value={activeProducts} note="Product.status = active." />
          <AdminMetric index="CAT // 03" label="Low catalog stock" value={lowStockProducts.length} note="Active entries marked low stock or at ≤ 5 units." />
          <AdminMetric index="CAT // 04" label="Archived products" value={archivedProducts} note="Still present in the shared catalog model." />
        </div>
      </section>

      <section aria-labelledby="client-metrics-heading" className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TechnicalCode>04 // CLIENT IDENTITY · AUTH NOT CONNECTED</TechnicalCode>
          <h2 id="client-metrics-heading" className="mt-1 font-display text-xl text-foreground">Guest contacts, not client accounts</h2>
          <p className="mt-2 max-w-xl text-small leading-relaxed text-foreground-muted">The account/session abstraction still resolves to guest. Unique contacts are derived from order details only; no registered customer service is available.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:col-span-7">
          <AdminMetric index="CLI // 01" label="Guest contact groups" value={guestContacts.length} note="Grouped from local order contact fields." />
          <AdminMetric index="CLI // 02" label="Verified client identities" value="0" note="No authentication provider or customer service connected." />
        </div>
      </section>

      <section aria-labelledby="fulfillment-metrics-heading" className="mb-8">
        <div className="mb-3">
          <TechnicalCode>05 // FULFILLMENT · ORDER STATUS ONLY</TechnicalCode>
          <h2 id="fulfillment-metrics-heading" className="mt-1 font-display text-xl text-foreground">Operational queue</h2>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <QueueMetric label="Awaiting settlement" value={pendingSettlement} note="No payment action is available in demo mode." icon={<CircleAlert className="h-4 w-4" aria-hidden="true" />} href="/admin/orders?status=pending_settlement" />
          <QueueMetric label="Processing / calibration" value={processingOrders} note="Derived from order.status; no task system exists." icon={<Package className="h-4 w-4" aria-hidden="true" />} href="/admin/orders" />
          <QueueMetric label="Low stock attention" value={lowStockProducts.length} note="Catalog count only; reservations are not modeled." icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />} href="/admin/inventory" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <TechnicalCode>06 // RECENT LOCAL RECORDS</TechnicalCode>
              <h2 className="mt-1 font-display text-xl text-foreground">Order ledger</h2>
            </div>
            <Link href="/admin/orders" className="min-h-11 border-b border-border px-1 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted hover:text-foreground">All orders</Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="border-y border-border bg-surface">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${encodeURIComponent(order.id)}`} className="grid min-h-16 grid-cols-1 gap-2 border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-surface-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-foreground sm:grid-cols-[1fr_1.3fr_auto_auto] sm:items-center sm:gap-4">
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] font-medium text-foreground">{order.orderNumber}</span>
                    <span className="mt-1 block text-[10px] text-foreground-subtle">{formatOrderDate(order.createdAt)}</span>
                  </span>
                  <span className="min-w-0 truncate text-[11px] text-foreground-muted">{order.customerName || 'Guest contact not recorded'}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-right font-mono text-[11px] tabular-nums text-foreground">{formatPrice(orderTotals(order).total)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState code="ORDER LEDGER // EMPTY" title="No browser-local orders." description="Orders appear here only after this browser records a checkout through CommerceContext. The unrelated seeded admin order archive is intentionally not queried." icon={<ShoppingBag className="h-5 w-5" aria-hidden="true" />} className="p-5 sm:p-7" />
          )}
        </div>

        <aside className="min-w-0 xl:col-span-4">
          <div className="mb-3">
            <TechnicalCode>07 // CATALOG ATTENTION</TechnicalCode>
            <h2 className="mt-1 font-display text-xl text-foreground">Stock register</h2>
          </div>
          <div className="border-y border-border bg-surface">
            {lowStockProducts.slice(0, 5).map((product) => {
              const stock = inventoryState(product);
              return (
                <Link key={product.id} href="/admin/inventory" className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-surface-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-foreground">
                  <span className="min-w-0">
                    <span className="block truncate text-[11px] text-foreground">{product.name}</span>
                    <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{product.sku}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <Badge variant={stock.variant}>{stock.label}</Badge>
                    <span className="mt-1 block font-mono text-[9px] tabular-nums text-foreground-subtle">{product.inventoryCount} catalog units</span>
                  </span>
                </Link>
              );
            })}
            {lowStockProducts.length === 0 && <p className="px-4 py-5 text-small text-foreground-muted">No active catalog items meet the local low-stock threshold.</p>}
          </div>
        </aside>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-3">
        <BoundaryNote icon={<Users className="h-4 w-4" aria-hidden="true" />} title="Identity" text="Customer records are not seeded into this interface. Only guest checkout contact fields from this browser are displayed." />
        <BoundaryNote icon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />} title="Settlement" text="Order payment state is read-only here. No authorization, capture, refund, or card credential action is available." />
        <BoundaryNote icon={<Package className="h-4 w-4" aria-hidden="true" />} title="Fulfillment" text="A demo status override is an internal browser record only; it does not reserve, ship, or track goods." />
      </section>
    </main>
  );
}

function QueueMetric({
  label,
  value,
  note,
  icon,
  href,
}: {
  label: string;
  value: number;
  note: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href} className="flex min-h-24 items-start gap-3 border border-border bg-surface p-4 transition-colors hover:bg-surface-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
      <span className="mt-0.5 text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">{label}</span>
        <span className="mt-1 block font-display text-2xl tabular-nums text-foreground">{value}</span>
        <span className="mt-1 block text-[10px] leading-relaxed text-foreground-muted">{note}</span>
      </span>
      <ArrowUpRight className="h-3 w-3 shrink-0 text-foreground-subtle" aria-hidden="true" />
    </Link>
  );
}

function BoundaryNote({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 border-t border-border px-1 pt-3">
      <span className="text-foreground-subtle">{icon}</span>
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground">{title}</p>
        <p className="mt-1 text-[10px] leading-relaxed text-foreground-muted">{text}</p>
      </div>
    </div>
  );
}
