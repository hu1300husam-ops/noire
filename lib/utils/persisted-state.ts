import type {
  Address,
  CartItem,
  Discount,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethodType,
  PaymentProvider,
  PaymentSummary,
  ShippingMethod,
} from '@/types';

const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;
const DISCOUNT_TYPES: Discount['type'][] = [
  'percentage',
  'fixed_amount',
  'free_shipping',
];
const DISCOUNT_STATUSES: Discount['status'][] = [
  'active',
  'scheduled',
  'expired',
  'disabled',
  'archived',
];
const PAYMENT_PROVIDERS: PaymentProvider[] = [
  'demo',
  'stripe_elements',
  'apple_pay',
  'studio_wire',
];
const PAYMENT_METHODS: PaymentMethodType[] = ['card', 'apple_pay', 'wire_transfer'];
const MAX_MONEY = 10_000_000;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function boundedText(
  value: unknown,
  fallback = '',
  maxLength = 256
): string {
  if (typeof value !== 'string') return fallback;
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, maxLength);
}

function identifier(value: unknown): string | null {
  return typeof value === 'string' && IDENTIFIER.test(value) ? value : null;
}

function finiteNumber(
  value: unknown,
  minimum = 0,
  maximum = MAX_MONEY
): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function safeInteger(value: unknown, minimum: number, maximum: number): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function cents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 64) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

export function isSafeImageSource(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048 || value.includes('\\')) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'images.unsplash.com' &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function sanitizeColor(value: unknown): CartItem['selectedColor'] | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const name = boundedText(value.name, '', 80);
  const hex = typeof value.hex === 'string' && HEX_COLOR.test(value.hex) ? value.hex : null;
  return id && name && hex ? { id, name, hex } : null;
}

function sanitizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const productId = identifier(value.productId);
  const slug = typeof value.slug === 'string' && SLUG.test(value.slug) ? value.slug : null;
  const name = boundedText(value.name, '', 180);
  const modelNumber = boundedText(value.modelNumber, '', 80);
  const categoryName = boundedText(value.categoryName, '', 100);
  const price = finiteNumber(value.price);
  const compareAtPrice = value.compareAtPrice === undefined
    ? undefined
    : finiteNumber(value.compareAtPrice);
  const image = isSafeImageSource(value.image) ? value.image : null;
  const selectedColor = sanitizeColor(value.selectedColor);
  const quantity = safeInteger(value.quantity, 1, 10);
  const maxQuantity = safeInteger(value.maxQuantity, 1, 10);
  const shippingEstimate = boundedText(value.shippingEstimate, '', 240);

  if (
    !id || !productId || !slug || !name || !modelNumber || !categoryName ||
    price === null || compareAtPrice === null || !image || !selectedColor ||
    quantity === null || maxQuantity === null || quantity > maxQuantity || !shippingEstimate
  ) return null;

  let selectedOption: CartItem['selectedOption'];
  if (value.selectedOption !== undefined && value.selectedOption !== null) {
    if (!isRecord(value.selectedOption)) return null;
    const optionId = identifier(value.selectedOption.id);
    const label = boundedText(value.selectedOption.label, '', 140);
    const priceDelta = finiteNumber(value.selectedOption.priceDelta, -MAX_MONEY, MAX_MONEY);
    if (!optionId || !label || priceDelta === null) return null;
    selectedOption = { id: optionId, label, priceDelta };
  }

  return {
    id,
    productId,
    slug,
    name,
    modelNumber,
    categoryName,
    price,
    ...(compareAtPrice === undefined ? {} : { compareAtPrice }),
    image,
    selectedColor,
    ...(selectedOption ? { selectedOption } : {}),
    quantity,
    maxQuantity,
    shippingEstimate,
  };
}

export function sanitizeCartState(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const items: CartItem[] = [];
  const seen = new Set<string>();
  for (const entry of value.slice(0, 100)) {
    const item = sanitizeCartItem(entry);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
  }
  return items;
}

export function sanitizeIdentifierList(value: unknown, limit = 100): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  const seen = new Set<string>();
  for (const entry of value.slice(0, Math.max(0, limit * 2))) {
    const id = identifier(entry);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length >= limit) break;
  }
  return result;
}

export function sanitizeDiscountState(value: unknown): Discount | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const code = boundedText(value.code, '', 64).trim().toUpperCase();
  const description = boundedText(value.description, '', 240).trim();
  const type = DISCOUNT_TYPES.find((candidate) => candidate === value.type);
  const status = DISCOUNT_STATUSES.find((candidate) => candidate === value.status);
  const discountValue = finiteNumber(value.value, 0, 1_000_000);
  const usageCount = safeInteger(value.usageCount, 0, 1_000_000_000);
  const startsAt = validTimestamp(value.startsAt);
  const minOrderAmount = value.minOrderAmount === undefined
    ? undefined
    : finiteNumber(value.minOrderAmount);
  const usageLimit = value.usageLimit === undefined
    ? undefined
    : safeInteger(value.usageLimit, 1, 1_000_000_000);
  const expiresAt = value.expiresAt === undefined ? undefined : validTimestamp(value.expiresAt);
  if (
    !id || !/^[A-Z0-9_-]{1,64}$/.test(code) || !description || !type || !status ||
    discountValue === null || usageCount === null || !startsAt ||
    minOrderAmount === null || usageLimit === null || expiresAt === null ||
    (type === 'percentage' && discountValue > 100) ||
    (expiresAt && Date.parse(expiresAt) < Date.parse(startsAt))
  ) return null;

  return {
    id,
    code,
    description,
    type,
    value: discountValue,
    ...(minOrderAmount === undefined ? {} : { minOrderAmount }),
    usageCount,
    ...(usageLimit === undefined ? {} : { usageLimit }),
    status,
    startsAt,
    ...(expiresAt ? { expiresAt } : {}),
  };
}

export function sanitizeShippingMethodState(
  value: unknown,
  methods: ShippingMethod[]
): ShippingMethod {
  const fallback = methods[0];
  if (!fallback || !isRecord(value)) return fallback;
  const method = methods.find((candidate) => candidate.id === value.id);
  return method ? { ...method } : { ...fallback };
}

export function sanitizePaymentSummary(value: unknown): PaymentSummary | null {
  if (!isRecord(value)) return null;
  const provider = PAYMENT_PROVIDERS.find((candidate) => candidate === value.provider);
  const methodType = PAYMENT_METHODS.find((candidate) => candidate === value.methodType);
  const brand = boundedText(value.brand, 'Demonstration method', 48).trim();
  const last4 = typeof value.last4 === 'string' && /^\d{4}$/.test(value.last4)
    ? value.last4
    : '—';
  const cardholderName = boundedText(value.cardholderName, '', 120).trim();
  if (!provider || !methodType || !brand || /\d{8,}/.test(brand) || /\d{8,}/.test(cardholderName)) {
    return null;
  }
  return { provider, methodType, brand, last4, cardholderName };
}

function sanitizeAddress(value: unknown): Address | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const label = boundedText(value.label, 'Demonstration address', 80);
  const firstName = boundedText(value.firstName, '', 80);
  const lastName = boundedText(value.lastName, '', 80);
  const company = boundedText(value.company, '', 120);
  const line1 = boundedText(value.line1, '', 160);
  const line2 = boundedText(value.line2, '', 160);
  const city = boundedText(value.city, '', 100);
  const state = boundedText(value.state, '', 100);
  const postalCode = boundedText(value.postalCode, '', 32);
  const country = boundedText(value.country, '', 100);
  const phone = boundedText(value.phone, '', 40);
  if (!id || !firstName.trim() || !lastName.trim() || !line1.trim() || !city.trim() || !state.trim() || !postalCode.trim() || !country.trim() || !phone.trim()) {
    return null;
  }
  return {
    id,
    label,
    firstName,
    lastName,
    ...(company ? { company } : {}),
    line1,
    ...(line2 ? { line2 } : {}),
    city,
    state,
    postalCode,
    country,
    phone,
    isDefaultShipping: value.isDefaultShipping === true,
    isDefaultBilling: value.isDefaultBilling === true,
  };
}

function sanitizeOrderItem(value: unknown): OrderItem | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const productId = identifier(value.productId);
  const productSlug = typeof value.productSlug === 'string' && SLUG.test(value.productSlug)
    ? value.productSlug
    : null;
  const productName = boundedText(value.productName, '', 180);
  const modelNumber = boundedText(value.modelNumber, '', 80);
  const sku = boundedText(value.sku, '', 100);
  const variantName = boundedText(value.variantName, '', 160);
  const image = isSafeImageSource(value.image) ? value.image : null;
  const quantity = safeInteger(value.quantity, 1, 100);
  const unitPrice = finiteNumber(value.unitPrice);
  if (!id || !productId || !productSlug || !productName || !modelNumber || !sku || !variantName || !image || quantity === null || unitPrice === null) {
    return null;
  }
  const selectedFinish = sanitizeColor(value.selectedFinish);
  let selectedOption: OrderItem['selectedOption'];
  if (value.selectedOption !== undefined && value.selectedOption !== null && isRecord(value.selectedOption)) {
    const optionId = identifier(value.selectedOption.id);
    const label = boundedText(value.selectedOption.label, '', 140);
    const priceDelta = finiteNumber(value.selectedOption.priceDelta, -MAX_MONEY, MAX_MONEY);
    if (optionId && label && priceDelta !== null) selectedOption = { id: optionId, label, priceDelta };
  }
  const totalPrice = cents(unitPrice * quantity);
  return {
    id,
    productId,
    productSlug,
    productName,
    modelNumber,
    sku,
    variantName,
    ...(selectedFinish ? { selectedFinish } : {}),
    ...(selectedOption ? { selectedOption } : {}),
    image,
    quantity,
    unitPrice,
    totalPrice,
  };
}

function sanitizeTimeline(value: unknown, createdAt: string): Order['timeline'] {
  const events = Array.isArray(value) ? value.slice(-50) : [];
  const safeEvents = events.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const id = identifier(entry.id);
    const status = boundedText(entry.status, '', 100);
    const description = boundedText(entry.description, '', 500);
    const timestamp = validTimestamp(entry.timestamp);
    if (
      !id ||
      status !== 'LOCAL DEMO RECORD CREATED // PENDING SETTLEMENT' ||
      !description ||
      !timestamp
    ) return [];
    return [{ id, status, description, timestamp, completed: entry.completed === true }];
  });
  return safeEvents.length > 0
    ? safeEvents
    : [{
        id: 'local-demo-record',
        status: 'LOCAL DEMO RECORD CREATED // PENDING SETTLEMENT',
        description: 'This browser-local demonstration record has no payment authorization or fulfillment event.',
        timestamp: createdAt,
        completed: true,
      }];
}

export function sanitizeOrderState(
  value: unknown,
  methods: ShippingMethod[]
): Order | null {
  if (!isRecord(value)) return null;
  const id = identifier(value.id);
  const orderNumber = boundedText(value.orderNumber, '', 48);
  const customerId = identifier(value.customerId);
  const createdAt = validTimestamp(value.createdAt);
  const updatedAt = validTimestamp(value.updatedAt) ?? createdAt;
  const shippingAddress = sanitizeAddress(value.shippingAddress);
  const billingAddress = sanitizeAddress(value.billingAddress);
  const items = Array.isArray(value.items) && value.items.length > 0 && value.items.length <= 100
    ? value.items.map(sanitizeOrderItem)
    : null;
  if (!id || !orderNumber || !customerId || !createdAt || !updatedAt || !shippingAddress || !billingAddress || !items || items.some((item) => item === null)) {
    return null;
  }
  const safeItems = items.filter((item): item is OrderItem => item !== null);
  const subtotal = cents(safeItems.reduce((sum, item) => sum + item.totalPrice, 0));
  const requestedDiscount = finiteNumber(value.discountAmount) ?? 0;
  const discountAmount = cents(Math.min(subtotal, requestedDiscount));
  const requestedShipping = finiteNumber(value.shippingCost, 0, 100_000) ?? 0;
  const shippingCost = cents(requestedShipping);
  // Tax is always pending in the current preview; no tax engine is connected.
  const taxAmount = 0;
  const total = cents(Math.max(0, subtotal - discountAmount + shippingCost));
  const totals = { subtotal, discountAmount, shippingCost, taxAmount, total, currency: 'USD' as const };
  const shippingMethod = sanitizeShippingMethodState(value.shippingMethod, methods);
  const paymentSummary = sanitizePaymentSummary(value.paymentSummary);
  const customerRecord = isRecord(value.customer) ? value.customer : null;
  const customer = customerRecord
    ? {
        firstName: boundedText(customerRecord.firstName, '', 80),
        lastName: boundedText(customerRecord.lastName, '', 80),
        email: boundedText(customerRecord.email, '', 254),
        phone: boundedText(customerRecord.phone, '', 40),
      }
    : undefined;
  const customerName = boundedText(
    [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || value.customerName,
    'Guest contact not recorded',
    160
  );
  const customerEmail = boundedText(customer?.email || value.customerEmail, '', 254);
  const customerPhone = boundedText(customer?.phone || value.customerPhone, '', 40);
  const paymentMethod = paymentSummary
    ? paymentSummary.methodType === 'apple_pay'
      ? `Apple Pay •••• ${paymentSummary.last4} // DEMONSTRATION ONLY`
      : paymentSummary.methodType === 'wire_transfer'
        ? `Studio wire transfer // DEMONSTRATION ONLY`
        : `${paymentSummary.brand} •••• ${paymentSummary.last4} // DEMONSTRATION ONLY`
    : 'Demonstration payment method // DEMONSTRATION ONLY';
  // Local browser data is not an authoritative fulfillment signal; restore every
  // rehydrated order as settlement-pending regardless of the persisted status.
  const status: OrderStatus = 'pending_settlement';
  const discountCode = typeof value.discountCode === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value.discountCode)
    ? value.discountCode.toUpperCase()
    : undefined;
  const notes = boundedText(value.notes, '', 500).trim();

  return {
    id,
    orderNumber,
    ...(typeof value.allocationReference === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(value.allocationReference)
      ? { allocationReference: value.allocationReference }
      : {}),
    customerId,
    ...(customer ? { customer } : {}),
    customerName,
    customerEmail,
    ...(customerPhone ? { customerPhone } : {}),
    status,
    // Persisted browser state can never assert that settlement occurred.
    paymentStatus: 'pending',
    paymentMethod,
    ...(paymentSummary ? { paymentSummary } : {}),
    shippingMethod,
    totals,
    items: safeItems,
    subtotal,
    shippingCost,
    taxAmount,
    discountAmount,
    ...(discountCode ? { discountCode } : {}),
    total,
    currency: 'USD',
    shippingAddress,
    billingAddress,
    timeline: sanitizeTimeline(value.timeline, createdAt),
    ...(notes ? { notes } : {}),
    createdAt,
    updatedAt,
  };
}

export function sanitizeOrderList(value: unknown, methods: ShippingMethod[]): Order[] {
  if (!Array.isArray(value)) return [];
  const orders: Order[] = [];
  const seen = new Set<string>();
  for (const entry of value.slice(0, 200)) {
    const order = sanitizeOrderState(entry, methods);
    if (!order || seen.has(order.id)) continue;
    seen.add(order.id);
    orders.push(order);
    if (orders.length >= 100) break;
  }
  return orders;
}
