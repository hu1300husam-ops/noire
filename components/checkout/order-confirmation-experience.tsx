'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, CircleCheck, FileText, ShieldAlert, Truck } from 'lucide-react';
import type { Order } from '@/types';
import { useCommerce } from '@/lib/context/commerce-context';
import { Button, EmptyState, PriceDisplay, TechnicalCode } from '@/components/ui';
import { Container } from '@/components/layout';
import { formatPrice } from '@/lib/utils';

interface OrderConfirmationExperienceProps {
  orderId: string;
  initialOrder: Order | null;
}

export function OrderConfirmationSkeleton() {
  return (
    <section className="bg-background py-16">
      <Container size="wide">
        <div aria-busy="true" aria-label="Loading allocation record" className="animate-pulse space-y-8">
          <div className="h-4 w-56 bg-surface-muted" />
          <div className="h-14 w-80 max-w-full bg-surface-muted" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="h-72 border border-border bg-surface lg:col-span-7" />
            <div className="h-72 border border-border bg-surface lg:col-span-5" />
          </div>
        </div>
      </Container>
    </section>
  );
}

function orderTotals(order: Order) {
  return order.totals ?? {
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    shippingCost: order.shippingCost,
    taxAmount: order.taxAmount,
    total: order.total,
    currency: order.currency,
  };
}

export function OrderConfirmationExperience({
  orderId,
  initialOrder,
}: OrderConfirmationExperienceProps) {
  const { isCartHydrated, getPlacedOrderById } = useCommerce();
  const order = getPlacedOrderById(orderId) ?? initialOrder;

  if (!isCartHydrated) return <OrderConfirmationSkeleton />;

  if (!order) {
    return (
      <section className="bg-background py-10 sm:py-16">
        <Container size="wide">
          <div className="mb-8 border-b border-border pb-5">
            <TechnicalCode>NOIRÉ // ORDER ARCHIVE</TechnicalCode>
          </div>
          <EmptyState
            code="RECORD // NOT LOCATED"
            title="This allocation record is unavailable."
            description="The reference may have expired from this browser session, or the allocation may not have been recorded. Your bag is not changed by opening this page. Return to the archive or review the current bag to continue."
            icon={<FileText className="h-6 w-6" aria-hidden="true" />}
            primaryAction={<Link href="/shop"><Button withArrow="right">Continue shopping</Button></Link>}
            secondaryAction={<Link href="/cart" className="inline-flex min-h-11 items-center border-b border-foreground font-mono text-[10px] uppercase tracking-[0.13em]">Review allocation bag</Link>}
            className="min-h-[320px]"
          />
        </Container>
      </section>
    );
  }

  const totals = orderTotals(order);
  const paymentIsPending = order.paymentStatus === 'pending';
  const customerName = order.customerName || `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
  const shipping = order.shippingMethod;

  return (
    <main id="main-content" className="bg-background pb-16 text-foreground">
      <section className="surface-obsidian border-b border-border py-14 text-foreground-inverse sm:py-20">
        <Container size="wide">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center border border-foreground-inverse/25" aria-hidden="true">
                  <CircleCheck className="h-4 w-4" />
                </span>
                <p className="font-mono text-label uppercase tracking-[0.16em] text-foreground-inverse/70">NOIRÉ // LOCAL DEMO RECORD · PENDING</p>
              </div>
              <h1 className="max-w-4xl break-words font-display text-h1 leading-[1.04]">Your local demo record is ready<span className="text-accent">.</span></h1>
              <p className="mt-5 max-w-2xl text-small leading-relaxed text-foreground-inverse/70 sm:text-body">
                A browser-local demonstration record has been created for {customerName}. No payment, inventory reservation, courier booking, or fulfillment has occurred.
              </p>
            </div>
            <div className="border-t border-foreground-inverse/20 pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <TechnicalCode className="text-foreground-inverse/55">{order.allocationReference ?? 'ALLOCATION REFERENCE // PENDING'}</TechnicalCode>
              <p className="mt-2 break-words font-mono text-xl tabular-nums text-foreground-inverse">{order.orderNumber}</p>
              <p className="mt-2 break-all text-small text-foreground-inverse/65">{order.customerEmail}</p>
            </div>
          </div>
        </Container>
      </section>

      <Container size="wide" className="py-8 sm:py-12">
        {paymentIsPending && (
          <section role="status" aria-live="polite" className="mb-8 border border-accent/30 bg-accent/5 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <h2 className="font-mono text-label uppercase tracking-[0.15em] text-accent">Settlement pending // demonstration record</h2>
                <p className="mt-2 max-w-4xl text-small leading-relaxed text-foreground">
                  No payment has been authorized or captured. This frontend demonstration created a pending allocation record only; inventory is not reserved and fulfillment has not started. A real payment provider must confirm settlement before the order can be marked paid or dispatched.
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">
            <span>ORDER // {order.orderNumber}</span>
            <span>{`STATUS // ${order.status.replaceAll('_', ' ').toUpperCase()}`}</span>
            <span>SETTLEMENT // {order.paymentStatus}</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="#order-record" className="inline-flex min-h-11 items-center gap-2 border-b border-border-strong/70 font-mono text-[10px] uppercase tracking-[0.13em] text-foreground-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
              View order <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 border-b border-border-strong/70 font-mono text-[10px] uppercase tracking-[0.13em] text-foreground-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
              Continue shopping <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div id="order-record" className="grid scroll-mt-24 grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <section aria-labelledby="commission-heading" className="min-w-0 border border-border bg-surface p-5 sm:p-7 lg:col-span-7 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <TechnicalCode>Commission dossier // 01—{String(order.items.length).padStart(2, '0')}</TechnicalCode>
                <h2 id="commission-heading" className="mt-2 font-display text-h3 text-foreground">Items in this demo record</h2>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-subtle">{order.items.reduce((sum, item) => sum + item.quantity, 0)} units</span>
            </div>

            <ul className="divide-y divide-border">
              {order.items.map((item, index) => (
                <li key={item.id} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-5">
                  <Link href={`/product/${item.productSlug}`} className="relative aspect-[4/5] overflow-hidden bg-surface-muted" aria-label={`View ${item.productName}`}>
                    <Image src={item.image} alt="" fill sizes="92px" className="object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">{`${String(index + 1).padStart(2, '0')} // ${item.modelNumber}`}</p>
                    <Link href={`/product/${item.productSlug}`} className="mt-1.5 block break-words font-display text-base leading-snug text-foreground hover:underline">{item.productName}</Link>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-muted">
                      {item.selectedFinish && <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border border-border-strong/40" style={{ backgroundColor: item.selectedFinish.hex }} />{item.selectedFinish.name}</span>}
                      {!item.selectedFinish && <span>{item.variantName}</span>}
                      {item.selectedOption && <><span aria-hidden="true">/</span><span className="break-words">{item.selectedOption.label}{item.selectedOption.priceDelta !== 0 ? ` (${item.selectedOption.priceDelta > 0 ? '+' : ''}${formatPrice(item.selectedOption.priceDelta)})` : ''}</span></>}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-foreground-subtle">
                      <span>QTY {String(item.quantity).padStart(2, '0')} · UNIT {formatPrice(item.unitPrice)}</span>
                      <span className="text-foreground">LINE {formatPrice(item.totalPrice)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 border-t border-border pt-5">
              <div className="mb-4 flex items-start gap-3">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-foreground-muted" aria-hidden="true" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground">{shipping?.name ?? order.carrier ?? 'Shipping method'}</p>
                  <p className="mt-1 text-small text-foreground-muted">{shipping?.estimatedWindow ?? 'Courier estimate unavailable.'}</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-foreground-subtle">Provisional local estimate only; no courier booking has been made.</p>
                  {order.estimatedDispatch && <p className="mt-1 text-[11px] leading-relaxed text-foreground-subtle">{order.estimatedDispatch}</p>}
                  {order.estimatedDelivery && <p className="mt-1 text-[11px] leading-relaxed text-foreground-subtle">Delivery estimate: {order.estimatedDelivery}</p>}
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">Destination // provisional</p>
                <p className="mt-2 text-small text-foreground">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                <p className="mt-1 break-words text-small text-foreground-muted">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p className="mt-1 text-small text-foreground-muted">{order.shippingAddress.country}</p>
              </div>
            </div>
          </section>

          <aside className="min-w-0 space-y-6 lg:col-span-5">
            <section className="border border-border bg-surface p-5 sm:p-7 lg:p-8" aria-labelledby="settlement-heading">
              <div className="border-b border-border pb-5">
                <TechnicalCode>Financial record // USD</TechnicalCode>
                <h2 id="settlement-heading" className="mt-2 font-display text-h3 text-foreground">Settlement summary</h2>
              </div>
              <dl className="space-y-3 border-b border-border py-5">
                <div className="flex items-center justify-between gap-4 text-small"><dt className="text-foreground-muted">Subtotal</dt><dd className="font-mono tabular-nums">{formatPrice(totals.subtotal)}</dd></div>
                {totals.discountAmount > 0 && <div className="flex items-center justify-between gap-4 text-small"><dt className="text-foreground-muted">Privilege {order.discountCode && <span className="font-mono text-[10px]">{`// ${order.discountCode}`}</span>}</dt><dd className="font-mono tabular-nums text-success">−{formatPrice(totals.discountAmount)}</dd></div>}
                <div className="flex items-center justify-between gap-4 text-small"><dt className="text-foreground-muted">Courier</dt><dd className="font-mono tabular-nums">{totals.shippingCost === 0 ? 'DEMO INCLUDED' : formatPrice(totals.shippingCost)}</dd></div>
                <div className="flex items-center justify-between gap-4 text-small"><dt className="text-foreground-muted">Tax telemetry</dt><dd className="font-mono tabular-nums">{totals.taxAmount === 0 ? 'PENDING' : formatPrice(totals.taxAmount)}</dd></div>
              </dl>
              <div className="flex items-end justify-between gap-4 pt-5">
                <div><p className="font-display text-base text-foreground">Estimated total</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">Payment remains pending</p></div>
                <PriceDisplay price={totals.total} size="xl" />
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">Settlement method</p>
                <p className="mt-1.5 break-words text-small text-foreground">{order.paymentMethod}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-foreground-subtle">Masked metadata only. No card number, CVC, expiry, or provider secret is stored in this order record.</p>
              </div>
            </section>

            <section className="border-l border-foreground px-5 py-2 sm:px-6" aria-labelledby="message-heading">
              <TechnicalCode>Private correspondence // NOIRÉ</TechnicalCode>
              <h2 id="message-heading" className="mt-2 font-display text-xl text-foreground">Demonstration record only.</h2>
              <p className="mt-3 text-small leading-relaxed text-foreground-muted">
                {paymentIsPending
                  ? 'Your instrument selection and destination have been captured as a frontend demonstration record. The studio will not calibrate, dispatch, or reserve stock until a real payment provider and inventory service confirm settlement.'
                  : 'Your order record is available here as a private commissioning document. Dispatch timing remains subject to the selected courier service.'}
              </p>
              <div className="mt-5 border-t border-border pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">Record created</p>
                <p className="mt-1.5 text-small text-foreground">{new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">Order reference // {order.orderNumber}</p>
            <p className="mt-1 text-small text-foreground-muted">This reference exists only in the browser-local demonstration.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop"><Button variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}>Continue shopping</Button></Link>
            <a href="#order-record" className="inline-flex min-h-11 items-center border-b border-foreground font-mono text-[10px] uppercase tracking-[0.13em]">View order record</a>
          </div>
        </div>
      </Container>
    </main>
  );
}
