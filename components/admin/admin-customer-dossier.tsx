'use client';

import React, { useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowUpRight, UserRound } from 'lucide-react';
import { Badge, EmptyState, TechnicalCode } from '@/components/ui';
import { AdminLocalNotice, AdminPageHeader, AdminLoadingState, AdminSurface } from '@/components/admin/admin-primitives';
import { useCommerce } from '@/lib/context/commerce-context';
import { resolveGuestClient } from '@/lib/admin/derive';
import type { GuestClientLedgerEntry } from '@/lib/admin/contracts';
import { formatOrderDate, orderStatusLabel, orderTotals, orderUnitCount } from '@/lib/account/order-utils';
import { formatPrice } from '@/lib/utils';

export function AdminCustomerDossier({ customerId }: { customerId: string }) {
  const { placedOrders, isCartHydrated } = useCommerce();
  const client = useMemo(() => resolveGuestClient(placedOrders, customerId), [customerId, placedOrders]);

  if (!isCartHydrated) return <AdminLoadingState label="Loading local guest contact dossier" rows={5} />;
  if (!Array.isArray(placedOrders)) return <EmptyState code="ERR // GUEST DOSSIER" title="Local contact data could not be read." description="No mock customer data is used as a fallback." />;
  if (!client) {
    return <><AdminPageHeader eyebrow="OPERATIONS // 03 · CONTACT DOSSIER" title="Guest contact unavailable" description="This dossier resolves only from the current browser-local order archive." /><EmptyState code="GUEST CONTACT // NOT FOUND" title="No matching local order contact." description="The reference may be stale, or the order may not be present in this browser’s CommerceContext." icon={<UserRound className="h-5 w-5" aria-hidden="true" />} primaryAction={<Link href="/admin/customers" className="inline-flex min-h-11 items-center border border-foreground bg-foreground px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-background">Return to guest ledger</Link>} /></>;
  }

  const addresses = uniqueAddresses(client.orders);
  const completedEvents = client.orders.flatMap((order) => order.timeline
    .filter((event) => event.completed)
    .map((event) => ({ ...event, orderNumber: order.orderNumber, orderId: order.id }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader eyebrow="OPERATIONS // 03 · GUEST CONTACT DOSSIER" title={client.name} description="A local checkout-contact projection grouped from existing browser-local orders. This is not a registered or authenticated NOIRÉ client profile." actions={<Link href="/admin/customers" className="inline-flex min-h-11 items-center gap-2 border border-border bg-surface px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-muted hover:border-foreground"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Guest ledger</Link>} />
      <AdminLocalNotice>Identity type // GUEST. Contact fields are derived from the order records shown below. No seeded customer archive or authentication record is queried.</AdminLocalNotice>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-4">
          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-3"><UserRound className="h-4 w-4 text-accent" aria-hidden="true" /><div><TechnicalCode>01 // IDENTITY FIELDS</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Guest contact</h2></div></div>
            <dl className="space-y-3">
              <IdentityRow label="Name" value={client.name} />
              <IdentityRow label="Email" value={client.email || 'Not recorded'} />
              <IdentityRow label="Phone" value={client.phone || 'Not recorded'} />
              <IdentityRow label="Identity state" value="GUEST // no authenticated identity provider" />
              <IdentityRow label="Source reference" value={client.anchorOrderId} />
            </dl>
          </AdminSurface>
          <AdminSurface className="p-4 sm:p-5">
            <TechnicalCode>02 // LOCAL VALUE SUMMARY</TechnicalCode>
            <dl className="mt-3 divide-y divide-border border-y border-border">
              <IdentityRow label="Orders" value={String(client.orderCount)} />
              <IdentityRow label="Sum of recorded order totals" value={formatPrice(client.totalValue)} />
              <IdentityRow label="Most recent order" value={formatOrderDate(client.lastOrderAt)} />
            </dl>
            <p className="mt-3 text-[9px] leading-relaxed text-foreground-subtle">Totals may include payment-pending amounts and are not recognized revenue.</p>
          </AdminSurface>
        </div>

        <div className="min-w-0 space-y-4 xl:col-span-8">
          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3"><div><TechnicalCode>03 // ORDER HISTORY</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Browser-local orders</h2></div><Badge variant="outline">{client.orderCount} records</Badge></div>
            <ul className="divide-y divide-border border-y border-border">
              {client.orders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="min-w-0"><Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="font-mono text-[10px] text-foreground underline decoration-border underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">{order.orderNumber}</Link><span className="mt-1 block text-[9px] text-foreground-subtle">{formatOrderDate(order.createdAt)} · {orderUnitCount(order)} units · {orderStatusLabel(order.status)}</span></span>
                  <span className="flex items-center gap-3"><span className="font-mono text-[10px] tabular-nums text-foreground">{formatPrice(orderTotals(order).total)}</span><Link href={`/admin/orders/${encodeURIComponent(order.id)}`} aria-label={`Open ${order.orderNumber} dossier`} className="inline-flex h-9 w-9 items-center justify-center border border-border hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"><ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></span>
                </li>
              ))}
            </ul>
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3"><TechnicalCode>04 // RECENT ACTIVITY</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Recorded order events</h2><p className="mt-1 text-[10px] text-foreground-muted">Only completed entries present in the order records are listed.</p></div>
            {completedEvents.length ? (
              <ol className="space-y-0 border-s border-border ps-4">
                {completedEvents.map((event) => <li key={`${event.orderNumber}-${event.id}`} className="relative pb-4 last:pb-0"><span className="absolute -start-[1.32rem] top-1 h-2 w-2 rounded-full border border-accent bg-accent" aria-hidden="true" /><p className="break-words font-mono text-[9px] uppercase tracking-[0.1em] text-foreground">{event.status}</p><p className="mt-1 text-[10px] leading-relaxed text-foreground-muted">{event.description}</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[0.08em] text-foreground-subtle"><Link href={`/admin/orders/${encodeURIComponent(event.orderId)}`} className="underline decoration-border underline-offset-2">{event.orderNumber}</Link> · {formatOrderDate(event.timestamp)}</p></li>)}
              </ol>
            ) : <p className="text-small text-foreground-muted">No completed timeline events are present in these local records.</p>}
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3"><TechnicalCode>05 // DELIVERY DESTINATIONS</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Addresses on order</h2><p className="mt-1 text-[10px] text-foreground-muted">Historical delivery fields only; not an address book or saved customer profile.</p></div>
            {addresses.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{addresses.map((address, index) => <address key={`${address.id}-${index}`} className="min-w-0 border border-border p-3 not-italic"><span className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Destination {String(index + 1).padStart(2, '0')}</span><span className="mt-2 block text-small text-foreground">{address.firstName} {address.lastName}</span>{address.company && <span className="block text-[10px] text-foreground-muted">{address.company}</span>}<span className="mt-1 block break-words text-[10px] leading-relaxed text-foreground-muted">{address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />{[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}<br />{address.country}</span><span className="mt-1 block break-words font-mono text-[8px] text-foreground-subtle">Order ref // {address.orderNumber}</span></address>)}</div> : <p className="text-small text-foreground-muted">No delivery destination fields are available.</p>}
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <TechnicalCode>06 // SAVED ITEMS</TechnicalCode>
            <h2 className="mt-1 font-display text-lg text-foreground">Not attributable</h2>
            <p className="mt-2 text-small leading-relaxed text-foreground-muted">The existing wishlist is a single browser-local CommerceContext collection and is not linked to this guest contact. No saved-item history is exposed or inferred.</p>
          </AdminSurface>
        </div>
      </div>
    </main>
  );
}

function IdentityRow({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-1 border-b border-border py-2 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3"><dt className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{label}</dt><dd className="break-words text-[10px] text-foreground sm:text-end">{value}</dd></div>;
}

function uniqueAddresses(orders: GuestClientLedgerEntry['orders']) {
  const seen = new Set<string>();
  return orders.flatMap((order) => {
    const address = order.shippingAddress;
    const identity = [address.line1, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join('|').toLowerCase();
    if (!identity || seen.has(identity)) return [];
    seen.add(identity);
    return [{ ...address, orderNumber: order.orderNumber }];
  });
}
