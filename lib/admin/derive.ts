import type { GuestClientLedgerEntry } from '@/lib/admin/contracts';
import type { Order, Product } from '@/types';
import { orderTotals } from '@/lib/account/order-utils';

function customerEmail(order: Order): string {
  return (order.customer?.email || order.customerEmail || '').trim();
}

function normalizedEmail(order: Order): string {
  return customerEmail(order).toLowerCase();
}

function customerName(order: Order): string {
  const fromCheckout = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return fromCheckout || order.customerName.trim() || 'Guest contact not recorded';
}

function orderTimestamp(order: Order): number {
  const value = new Date(order.createdAt).getTime();
  return Number.isFinite(value) ? value : 0;
}

/** Group only checkout contacts present in the existing browser-local orders. */
export function deriveGuestClientLedger(orders: Order[]): GuestClientLedgerEntry[] {
  const groups = new Map<string, Order[]>();
  for (const order of orders) {
    const email = normalizedEmail(order);
    const key = email ? `email:${email}` : `order:${order.id}`;
    const current = groups.get(key) ?? [];
    current.push(order);
    groups.set(key, current);
  }

  return Array.from(groups.values())
    .map((groupedOrders) => {
      const sorted = [...groupedOrders].sort((a, b) => orderTimestamp(b) - orderTimestamp(a));
      const oldestOrder = [...sorted].sort((a, b) => orderTimestamp(a) - orderTimestamp(b))[0];
      const latestOrder = sorted[0];
      const email = customerEmail(latestOrder);
      const phone = latestOrder.customer?.phone || latestOrder.customerPhone;
      const totalValue = sorted.reduce((total, order) => total + orderTotals(order).total, 0);
      const opaqueOrderRef = oldestOrder?.id || latestOrder.id;

      return {
        id: `guest-${opaqueOrderRef}`,
        anchorOrderId: opaqueOrderRef,
        name: customerName(latestOrder),
        email: email || undefined,
        phone: phone || undefined,
        orderCount: sorted.length,
        totalValue,
        lastOrderAt: latestOrder.createdAt,
        orders: sorted,
      } satisfies GuestClientLedgerEntry;
    })
    .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
}

/** Resolve a route reference to its browser-local guest-contact grouping. */
export function resolveGuestClient(
  orders: Order[],
  customerRouteId: string
): GuestClientLedgerEntry | null {
  const anchor = customerRouteId.startsWith('guest-')
    ? customerRouteId.slice('guest-'.length)
    : customerRouteId;
  const anchorOrder = orders.find((order) => order.id === anchor);
  if (!anchorOrder) return null;

  const email = normalizedEmail(anchorOrder);
  const relatedOrders = email
    ? orders.filter((order) => normalizedEmail(order) === email)
    : [anchorOrder];
  const ledger = deriveGuestClientLedger(relatedOrders);
  return ledger.find((entry) => entry.anchorOrderId === anchor) ?? ledger[0] ?? null;
}

export function inventoryState(product: Product): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'default' | 'accent';
} {
  if (product.status !== 'active') return { label: 'Unavailable', variant: 'default' };
  if (product.stockStatus === 'pre_order') return { label: 'Pre-order', variant: 'accent' };
  if (product.stockStatus === 'out_of_stock' || product.inventoryCount <= 0) {
    return { label: 'Out of stock', variant: 'danger' };
  }
  if (product.stockStatus === 'low_stock' || product.inventoryCount <= 5) {
    return { label: 'Low stock', variant: 'warning' };
  }
  return { label: 'In stock', variant: 'success' };
}
