'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, FileText, ShieldAlert, Truck } from 'lucide-react';
import { Badge, Button, EmptyState, Modal, PriceDisplay, Select, TechnicalCode, useToast } from '@/components/ui';
import { AdminLocalNotice, AdminLoadingState, AdminPageHeader, OrderStatusBadge, PaymentStatusBadge, AdminSurface } from '@/components/admin/admin-primitives';
import { useCommerce } from '@/lib/context/commerce-context';
import { deriveGuestClientLedger } from '@/lib/admin/derive';
import { displayedFulfillmentStatusLabel, displayedOrderStatusLabel, formatOrderDate, hasLocalDemoStatusOverride, orderStatusLabel, orderTotals, orderUnitCount, paymentStatusLabel } from '@/lib/account/order-utils';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

const ORDER_STATUSES: OrderStatus[] = ['pending_settlement', 'processing', 'Craft & Calibration', 'shipped', 'delivered', 'cancelled', 'returned'];
function readOrderStatus(value: string): OrderStatus {
  return ORDER_STATUSES.find((status) => status === value) ?? 'pending_settlement';
}
function paymentMethodState(order: Order): string {
  const type = order.paymentSummary?.methodType;
  if (type === 'card') return 'Card method recorded · safe summary only';
  if (type === 'apple_pay') return 'Apple Pay method recorded · safe summary only';
  if (type === 'wire_transfer') return 'Wire transfer method recorded · safe summary only';
  return 'Method type not represented in the available order summary';
}

export function AdminOrderDossier({ orderId }: { orderId: string }) {
  const { placedOrders, isCartHydrated, updatePlacedOrderStatus } = useCommerce();
  const { addToast } = useToast();
  const order = useMemo(() => placedOrders.find((candidate) => candidate.id === orderId || candidate.orderNumber === orderId) ?? null, [orderId, placedOrders]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<OrderStatus>('pending_settlement');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (order) setNextStatus(order.status); }, [order]);

  const clientReference = useMemo(() => {
    if (!order) return null;
    return deriveGuestClientLedger(placedOrders).find((entry) => entry.orders.some((candidate) => candidate.id === order.id)) ?? null;
  }, [order, placedOrders]);

  if (!isCartHydrated) return <AdminLoadingState label="Loading browser-local order dossier" rows={7} />;
  if (!Array.isArray(placedOrders)) return <EmptyState code="ERR // ORDER DOSSIER" title="Order records could not be read." description="The existing CommerceContext did not return an order array. No mock admin orders are substituted." />;
  if (!order) {
    return <><AdminPageHeader eyebrow="OPERATIONS // 01 · ORDER DOSSIER" title="Order not found" description="The admin dossier searches only browser-local CommerceContext orders." /><EmptyState code="ORDER RECORD // NOT FOUND" title="No matching local order record." description="This identifier is not present in the browser-local placedOrders archive. The seeded mock order store is intentionally not queried." icon={<FileText className="h-5 w-5" aria-hidden="true" />} primaryAction={<Link href="/admin/orders" className="inline-flex min-h-11 items-center border border-foreground bg-foreground px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-background">Return to order ledger</Link>} /></>;
  }

  const totals = orderTotals(order);
  const isPendingSettlement = order.status === 'pending_settlement';
  const hasLocalStatusOverride = hasLocalDemoStatusOverride(order);
  const shipmentStatusRecorded = !hasLocalStatusOverride && (order.status === 'shipped' || order.status === 'delivered');
  const completedTimeline = order.timeline.filter((event) => event.completed);
  const confirmStatusChange = () => {
    if (nextStatus === order.status) { setIsStatusOpen(false); return; }
    setIsSaving(true);
    const updated = updatePlacedOrderStatus(order.id, nextStatus);
    if (updated) {
      addToast({ type: 'success', title: 'Local order status updated', description: `Local demo status now reads ${orderStatusLabel(updated.status)}. Payment state remains ${paymentStatusLabel(updated.paymentStatus)}.` });
      setIsStatusOpen(false);
    } else {
      addToast({ type: 'error', title: 'Local order update failed', description: 'The order no longer exists in this browser’s placedOrders archive.' });
    }
    setIsSaving(false);
  };

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader eyebrow={`OPERATIONS // 01 · ${order.id}`} title={order.orderNumber} description="Operational dossier from this browser’s local order record. Every action below is a demo-only status edit; no payment or real-world fulfillment operation is connected." actions={<Link href="/admin/orders" className="inline-flex min-h-11 items-center gap-2 border border-border bg-surface px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-muted hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Order ledger</Link>} />
      <AdminLocalNotice>
        Order source // CommerceContext. Client type // GUEST. Payment state is read-only. A local order-status override does not authorize payment, reserve inventory, book a courier, move a parcel, or update any remote system.
      </AdminLocalNotice>

      {isPendingSettlement && <div role="status" aria-live="polite" className="mb-5 border border-warning/30 bg-warning-surface/50 p-4"><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-warning">Pending settlement // payment state preserved</p><p className="mt-2 text-small leading-relaxed text-foreground-muted">This order’s payment status is {paymentStatusLabel(order.paymentStatus)}. Changing the displayed order status does not authorize, capture, refund, or otherwise change payment.</p></div>}
      {hasLocalStatusOverride && <div role="status" className="mb-5 border border-accent/30 bg-accent/5 p-4"><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent">Local demo status override present</p><p className="mt-2 text-small leading-relaxed text-foreground-muted">Any status override shown here is only a browser-local administrative record. It is not evidence of payment or physical fulfillment.</p></div>}

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <OrderMeta label="Created" value={formatOrderDate(order.createdAt)} />
        <OrderMeta label={hasLocalStatusOverride ? 'Displayed order state' : 'Order state'} value={displayedOrderStatusLabel(order)} />
        <OrderMeta label="Payment state" value={paymentStatusLabel(order.paymentStatus)} />
        <OrderMeta label="Fulfillment" value={displayedFulfillmentStatusLabel(order)} />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 space-y-4 xl:col-span-8">
          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3"><div><TechnicalCode>01 // ORDER IDENTITY</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Order source &amp; client</h2></div><Badge variant="outline">BROWSER-LOCAL GUEST</Badge></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoBlock label="Order number" value={order.orderNumber} /><InfoBlock label="Internal record ID" value={order.id} /><InfoBlock label="Channel" value="Browser-local checkout" /><InfoBlock label="Client state" value="GUEST // no authenticated client identity" />
              <InfoBlock label="Contact name" value={[order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') || order.customerName || 'Not recorded'} />
              <InfoBlock label="Email" value={order.customer?.email || order.customerEmail || 'Not recorded'} />
              <InfoBlock label="Phone" value={order.customer?.phone || order.customerPhone || 'Not recorded'} />
              {clientReference && <div className="sm:col-span-2"><Link href={`/admin/customers/${encodeURIComponent(clientReference.id)}`} className="inline-flex min-h-11 items-center gap-2 border-b border-border px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted hover:text-foreground">Open derived guest-contact dossier <ArrowLeft className="h-3 w-3 rotate-180" aria-hidden="true" /></Link></div>}
            </div>
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3"><div><TechnicalCode>02 // ALLOCATION</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Order items</h2></div><span className="font-mono text-[9px] uppercase text-foreground-subtle">{orderUnitCount(order)} units</span></div>
            {order.items.length ? <ul className="divide-y divide-border">{order.items.map((item) => (
              <li key={item.id} className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <Link href={`/admin/products/${encodeURIComponent(item.productId)}`} aria-label={`Inspect catalog record for ${item.productName}`} className="relative aspect-[4/5] overflow-hidden border border-border bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">{item.image && <Image src={item.image} alt="" fill sizes="84px" className="object-cover" />}</Link>
                <div className="min-w-0"><TechnicalCode>{item.modelNumber} · {item.sku}</TechnicalCode><Link href={`/admin/products/${encodeURIComponent(item.productId)}`} className="mt-1 block break-words font-display text-base text-foreground underline decoration-border underline-offset-4">{item.productName}</Link><p className="mt-1 break-words text-[10px] text-foreground-muted">Variant / finish // {item.variantName}{item.selectedFinish ? ` · ${item.selectedFinish.name}` : ''}{item.selectedOption ? ` · ${item.selectedOption.label}` : ''}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-foreground-subtle">Quantity // {item.quantity} · Unit // {formatPrice(item.unitPrice)}</p></div>
                <p className="col-start-2 font-mono text-[11px] tabular-nums text-foreground sm:col-start-auto sm:text-end">{formatPrice(item.totalPrice)}</p>
              </li>
            ))}</ul> : <EmptyState code="ALLOCATION // EMPTY" title="No order items recorded." description="The local order has no line items to display." />}
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3"><TechnicalCode>03 // FULFILLMENT RECORD</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Delivery &amp; courier state</h2></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex items-start gap-3"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-foreground-subtle" aria-hidden="true" /><div className="min-w-0"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Selected shipping method</p><p className="mt-1 break-words text-small text-foreground">{order.shippingMethod?.name || (shipmentStatusRecorded ? order.carrier : null) || 'Not recorded'}</p>{order.shippingMethod?.estimatedWindow && <p className="mt-1 text-[10px] text-foreground-muted">{isPendingSettlement || hasLocalStatusOverride ? 'Quoted window // provisional' : 'Estimated window //'} {order.shippingMethod.estimatedWindow}</p>}</div></div>
              <div><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Tracking reference</p>{shipmentStatusRecorded && order.trackingNumber ? <p className="mt-1 break-all font-mono text-small text-foreground">{order.trackingNumber}</p> : <p className="mt-1 text-small text-foreground-muted">{isPendingSettlement ? 'No tracking reference recorded; dispatch not initiated.' : hasLocalStatusOverride ? 'Local status override; actual dispatch and tracking are not confirmed.' : 'No tracking reference recorded.'}</p>}{shipmentStatusRecorded && order.carrier && <p className="mt-1 text-[10px] text-foreground-subtle">Carrier on record // {order.carrier}</p>}</div>
              <div className="sm:col-span-2"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Destination // order record</p><address className="mt-2 not-italic text-[10px] leading-relaxed text-foreground-muted"><span className="block">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span>{order.shippingAddress.company && <span className="block">{order.shippingAddress.company}</span>}<span className="block break-words">{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}</span><span className="block">{[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode].filter(Boolean).join(', ')}</span><span className="block">{order.shippingAddress.country}</span></address></div>
            </div>
            {isPendingSettlement && <p className="mt-4 flex gap-2 border-t border-border pt-3 text-[10px] leading-relaxed text-foreground-subtle"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />No shipment event or dispatch estimate is treated as executed while the recorded order state is pending settlement.</p>}
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3"><TechnicalCode>04 // TIMELINE</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Completed events on record</h2><p className="mt-1 text-[10px] text-foreground-muted">Uncompleted planned entries are omitted; no historical fulfillment events are inferred.</p></div>
            {completedTimeline.length ? <ol className="space-y-0 border-s border-border ps-4">{completedTimeline.map((event) => <li key={event.id} className="relative pb-5 last:pb-0"><span className="absolute -start-[1.32rem] top-1 h-2 w-2 rounded-full border border-accent bg-accent" aria-hidden="true" /><p className="break-words font-mono text-[9px] uppercase tracking-[0.1em] text-foreground">{event.status}</p><p className="mt-1 text-[10px] leading-relaxed text-foreground-muted">{event.description}</p><time dateTime={event.timestamp} className="mt-1 block font-mono text-[8px] uppercase tracking-[0.08em] text-foreground-subtle">{formatOrderDate(event.timestamp)}</time></li>)}</ol> : <p className="text-small text-foreground-muted">No completed timeline events are recorded.</p>}
          </AdminSurface>
        </div>

        <aside className="min-w-0 space-y-4 xl:col-span-4">
          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3"><TechnicalCode>05 // PAYMENT STATE</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Settlement record</h2></div>
            <div className="flex flex-wrap gap-2"><PaymentStatusBadge status={order.paymentStatus} /><Badge variant="outline">{paymentMethodState(order)}</Badge></div>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              <InfoRow label="Payment state" value={paymentStatusLabel(order.paymentStatus)} />
              <InfoRow label="Method state" value={paymentMethodState(order)} />
              <InfoRow label="Transaction reference" value="Not represented in the current Order contract." />
            </dl>
            <p className="mt-3 text-[9px] leading-relaxed text-foreground-subtle">No payment action is available. Payment status is displayed exactly as recorded, and remains unchanged by order-status controls.</p>
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3"><TechnicalCode>06 // TOTALS</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Order value</h2></div>
            <dl className="space-y-3 border-y border-border py-4"><MoneyRow label="Subtotal" value={formatPrice(totals.subtotal)} />{totals.discountAmount > 0 && <MoneyRow label={`Discount${order.discountCode ? ` // ${order.discountCode}` : ''}`} value={`−${formatPrice(totals.discountAmount)}`} />}<MoneyRow label="Shipping" value={totals.shippingCost === 0 ? 'COMPLIMENTARY' : formatPrice(totals.shippingCost)} /><MoneyRow label="Tax" value={totals.taxAmount === 0 ? 'Not represented / zero in record' : formatPrice(totals.taxAmount)} /></dl>
            <div className="flex items-end justify-between gap-3 pt-4"><div><p className="font-display text-base text-foreground">Total</p><p className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{`${paymentStatusLabel(order.paymentStatus)} // ${order.currency}`}</p></div><PriceDisplay price={totals.total} size="xl" /></div>
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3"><TechnicalCode>07 // STATUS CONTROL</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">Local order state</h2></div>
            <div className="flex flex-wrap items-center gap-2">{hasLocalStatusOverride ? <Badge variant="warning" aria-label={`Local demo status override: ${orderStatusLabel(order.status)}; not evidence of shipment or delivery`}>DEMO OVERRIDE // {orderStatusLabel(order.status)}</Badge> : <OrderStatusBadge status={order.status} />}</div>
            <p className="mt-3 text-[10px] leading-relaxed text-foreground-muted">Only the existing OrderStatus values are available. Status edits append a clearly labelled local audit event; they do not update payment state.</p>
            <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => { setNextStatus(order.status); setIsStatusOpen(true); }}>Change displayed status</Button>
          </AdminSurface>
        </aside>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><span className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Order record // {order.id}</span><Link href="/admin/orders" className="inline-flex min-h-11 items-center gap-2 border-b border-border px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted"><ArrowLeft className="h-3 w-3" aria-hidden="true" /> Return to ledger</Link></div>

      <Modal isOpen={isStatusOpen} onClose={() => !isSaving && setIsStatusOpen(false)} title="Confirm local status change" code="ORDER CONTROL // DEMO ONLY" size="md" footer={<><Button type="button" variant="ghost" disabled={isSaving} onClick={() => setIsStatusOpen(false)}>Cancel</Button><Button type="button" variant="primary" isLoading={isSaving} disabled={nextStatus === order.status} onClick={confirmStatusChange}>Confirm local state</Button></>}>
        <div className="space-y-4">
          <p className="text-small leading-relaxed text-foreground-muted">Change the displayed state for <strong className="font-mono text-foreground">{order.orderNumber}</strong>. This edit changes the browser-local Order record and appears in its audit timeline only.</p>
          <Select label="Next order status" value={nextStatus} onChange={(event) => setNextStatus(readOrderStatus(event.target.value))} options={ORDER_STATUSES.map((status) => ({ label: status === 'pending_settlement' ? 'pending settlement' : status, value: status }))} />
          <div role="note" className="border border-warning/30 bg-warning-surface/50 p-3"><p className="font-mono text-[8px] uppercase tracking-[0.12em] text-warning">Explicit operational boundary</p><p className="mt-2 text-[10px] leading-relaxed text-foreground-muted">No payment authorization or capture, inventory reservation, dispatch, courier booking, tracking scan, or customer notification will occur. Existing payment status “{paymentStatusLabel(order.paymentStatus)}” remains unchanged.</p></div>
        </div>
      </Modal>
    </main>
  );
}

function OrderMeta({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border border-border bg-surface p-3"><dt className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{label}</dt><dd className="mt-1.5 break-words text-small text-foreground">{value}</dd></div>;
}
function InfoBlock({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-t border-border pt-2"><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{label}</p><p className="mt-1 break-words text-small text-foreground">{value}</p></div>;
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] sm:gap-3"><dt className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{label}</dt><dd className="break-words text-[10px] text-foreground">{value}</dd></div>;
}
function MoneyRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-3 text-[10px]"><dt className="min-w-0 break-words text-foreground-muted">{label}</dt><dd className="shrink-0 font-mono tabular-nums text-foreground">{value}</dd></div>;
}
