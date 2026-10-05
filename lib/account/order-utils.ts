import type { Order, OrderStatus, OrderTotals, PaymentStatus } from '@/types';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_settlement: 'Pending settlement',
  processing: 'Processing',
  'Craft & Calibration': 'Craft & calibration',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
  failed: 'Failed',
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}

export function paymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status];
}

/** A display of the actual order status; no courier state is inferred. */
export function fulfillmentStatusLabel(status: OrderStatus): string {
  if (status === 'pending_settlement') return 'Not initiated';
  return ORDER_STATUS_LABELS[status];
}

export function hasLocalDemoStatusOverride(order: Pick<Order, 'timeline'>): boolean {
  return order.timeline.some((event) =>
    event.status.startsWith('LOCAL DEMO ADMIN ACTION //')
  );
}

export function displayedOrderStatusLabel(
  order: Pick<Order, 'status' | 'timeline'>
): string {
  const statusLabel = orderStatusLabel(order.status);
  return hasLocalDemoStatusOverride(order)
    ? `Local demo override · ${statusLabel}`
    : statusLabel;
}

export function displayedFulfillmentStatusLabel(
  order: Pick<Order, 'status' | 'timeline'>
): string {
  return hasLocalDemoStatusOverride(order)
    ? `Unverified local demo state · ${orderStatusLabel(order.status)}`
    : fulfillmentStatusLabel(order.status);
}

export function orderUnitCount(order: Order): number {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

export function orderTotals(order: Order): OrderTotals {
  return (
    order.totals ?? {
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      total: order.total,
      currency: order.currency,
    }
  );
}

export function formatOrderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date not recorded';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function orderDestinationSummary(order: Order): string | null {
  const parts = [order.shippingAddress.city, order.shippingAddress.country]
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}
