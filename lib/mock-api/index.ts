/**
 * NOIRÉ — Asynchronous Service & Data Access Layer
 *
 * Architectural contract:
 * UI Components -> Service Layer (`@/lib/services` or `@/lib/mock-api`) -> Data Store / Future REST or GraphQL API.
 *
 * Maintains full referential integrity across Products, Categories, Collections,
 * Customer Wishlists, Orders, and Admin Dashboard Telemetry on all mutations.
 */

import type {
  Product,
  Category,
  Collection,
  JournalArticle,
  Review,
  CartItem,
  Address,
  AddressValidationResult,
  Order,
  OrderItem,
  OrderStatus,
  OrderTotals,
  ShippingMethod,
  PaymentProvider,
  PaymentMethod,
  PaymentProviderContract,
  PaymentIntent,
  PaymentSummary,
  PaymentResult,
  CheckoutCustomerInfo,
  CartValidationIssue,
  CartValidationResult,
  Customer,
  Discount,
  DashboardStats,
  ProductFilterParams,
  PaginatedResponse,
  SearchSuggestionResult,
} from '@/types';
import {
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  MOCK_JOURNAL_ARTICLES,
  MOCK_DISCOUNTS,
} from '@/lib/data';
import {
  boundedText,
  sanitizeOrderState,
  sanitizePaymentSummary,
} from '@/lib/utils/persisted-state';

export type NoireErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export class NoireServiceError extends Error {
  public readonly code: NoireErrorCode;
  public readonly statusCode: number;

  constructor(
    message: string,
    code: NoireErrorCode = 'INTERNAL_ERROR',
    statusCode = 500
  ) {
    super(message);
    this.name = 'NoireServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Deep-clone helper to ensure canonical seed data is never mutated in-place
function cloneSeed<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

let productsStore: Product[] = cloneSeed(MOCK_PRODUCTS);
let collectionsStore: Collection[] = cloneSeed(MOCK_COLLECTIONS);
let ordersStore: Order[] = [];
let customersStore: Customer[] = [];
let discountsStore: Discount[] = cloneSeed(MOCK_DISCOUNTS);

const DEFAULT_SIMULATED_DELAY_MS = 110;

async function simulateNetworkLatency(
  ms = DEFAULT_SIMULATED_DELAY_MS
): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resets the session-mutable stores back to canonical seed state.
 */
export function resetDataStore(): void {
  productsStore = cloneSeed(MOCK_PRODUCTS);
  collectionsStore = cloneSeed(MOCK_COLLECTIONS);
  ordersStore = [];
  customersStore = [];
  discountsStore = cloneSeed(MOCK_DISCOUNTS);
}

/**
 * 01. Fetch filtered, sorted, and paginated storefront products.
 */
export async function getProducts(
  params: ProductFilterParams = {},
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<PaginatedResponse<Product>> {
  await simulateNetworkLatency(delayMs);

  const {
    query,
    category,
    collection,
    minPrice,
    maxPrice,
    stockStatus,
    colors,
    sort = 'featured',
    page = 1,
    limit = 12,
  } = params;

  let filtered = productsStore.filter((p) => p.status === 'active');

  if (query && query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.modelNumber.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.editorialDescription.toLowerCase().includes(q) ||
        p.materials.some((m) => m.toLowerCase().includes(q)) ||
        p.highlights.some((h) => h.toLowerCase().includes(q)) ||
        p.specifications.some(
          (s) =>
            s.label.toLowerCase().includes(q) ||
            s.value.toLowerCase().includes(q)
        )
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (collection) {
    const targetCol = collectionsStore.find(
      (c) => c.slug === collection || c.id === collection
    );
    if (targetCol) {
      filtered = filtered.filter(
        (p) =>
          p.collectionIds.includes(targetCol.id) ||
          targetCol.productIds.includes(p.id)
      );
    }
  }

  if (typeof minPrice === 'number') {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }

  if (typeof maxPrice === 'number') {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  if (stockStatus && stockStatus.length > 0) {
    filtered = filtered.filter((p) => stockStatus.includes(p.stockStatus));
  }

  if (colors && colors.length > 0) {
    const normalizedColors = colors.map((c) => c.toLowerCase());
    filtered = filtered.filter((p) =>
      p.colors.some((c) =>
        normalizedColors.some((nc) => c.name.toLowerCase().includes(nc))
      )
    );
  }

  filtered.sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'newest':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'featured':
      default:
        return Number(b.featured) - Number(a.featured);
    }
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page: safePage,
    limit,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

/**
 * 02. Fetch single product by slug or ID.
 */
export async function getProductBySlug(
  slugOrId: string,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Product | null> {
  await simulateNetworkLatency(delayMs);
  const normalized = slugOrId.toLowerCase().trim();
  return (
    productsStore.find(
      (p) =>
        p.status === 'active' &&
        (p.slug.toLowerCase() === normalized || p.id.toLowerCase() === normalized)
    ) ?? null
  );
}

/**
 * 03. Fetch curated featured products.
 */
export async function getFeaturedProducts(
  limit = 4,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Product[]> {
  await simulateNetworkLatency(delayMs);
  return productsStore
    .filter((p) => p.status === 'active' && p.featured)
    .slice(0, limit);
}

/**
 * 04. Fetch flagship spotlight product.
 */
export async function getSpotlightProduct(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Product> {
  await simulateNetworkLatency(delayMs);
  return (
    productsStore.find((p) => p.status === 'active' && p.isSpotlight) ??
    productsStore.find((p) => p.status === 'active') ??
    MOCK_PRODUCTS[0]
  );
}

/**
 * 05. Fetch related products for a given product.
 */
export async function getRelatedProducts(
  productId: string,
  limit = 3,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Product[]> {
  await simulateNetworkLatency(delayMs);
  const current = productsStore.find((p) => p.id === productId);
  if (!current) {
    return productsStore.filter((p) => p.status === 'active').slice(0, limit);
  }

  const explicitRelated = current.relatedProductIds
    .map((id) =>
      productsStore.find((p) => p.id === id && p.status === 'active')
    )
    .filter((p): p is Product => Boolean(p));

  if (explicitRelated.length >= limit) {
    return explicitRelated.slice(0, limit);
  }

  const fallback = productsStore.filter(
    (p) =>
      p.status === 'active' &&
      p.id !== productId &&
      !explicitRelated.some((er) => er.id === p.id)
  );

  return [...explicitRelated, ...fallback].slice(0, limit);
}

/**
 * 06. Fetch all categories with dynamically synchronized product counts and valid featuredProductSlug.
 */
export async function getCategories(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Category[]> {
  await simulateNetworkLatency(delayMs);
  return MOCK_CATEGORIES.map((cat) => {
    const activeInCategory = productsStore.filter(
      (p) => p.status === 'active' && p.category === cat.slug
    );
    const featuredStillValid = activeInCategory.some(
      (p) => p.slug === cat.featuredProductSlug
    );
    return {
      ...cat,
      productCount: activeInCategory.length,
      featuredProductSlug: featuredStillValid
        ? cat.featuredProductSlug
        : activeInCategory[0]?.slug ?? cat.featuredProductSlug,
    };
  });
}

/**
 * 07. Fetch collections and single collection by slug.
 */
export async function getCollections(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Collection[]> {
  await simulateNetworkLatency(delayMs);
  return [...collectionsStore];
}

export async function getCollectionBySlug(
  slugOrId: string,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<{ collection: Collection; products: Product[] } | null> {
  await simulateNetworkLatency(delayMs);
  const collection = collectionsStore.find(
    (c) => c.slug === slugOrId || c.id === slugOrId
  );
  if (!collection) return null;

  const products = productsStore.filter(
    (p) =>
      p.status === 'active' &&
      (collection.productIds.includes(p.id) ||
        p.collectionIds.includes(collection.id))
  );

  return { collection, products };
}

/**
 * 08. Fetch editorial journal articles.
 */
export async function getJournalArticles(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<JournalArticle[]> {
  await simulateNetworkLatency(delayMs);
  return MOCK_JOURNAL_ARTICLES;
}

export async function getJournalArticleBySlug(
  slug: string,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<JournalArticle | null> {
  await simulateNetworkLatency(delayMs);
  return MOCK_JOURNAL_ARTICLES.find((a) => a.slug === slug) ?? null;
}

/**
 * 09. Fetch product reviews.
 */
export async function getReviewsByProductId(
  productId: string,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Review[]> {
  await simulateNetworkLatency(delayMs);
  // No review archive is connected; do not present seeded or fabricated reports.
  void productId;
  return [];
}

/**
 * 10. Search across catalog, categories, collections, and journal.
 */
export async function searchCatalog(
  query: string,
  delayMs = 140
): Promise<SearchSuggestionResult> {
  await simulateNetworkLatency(delayMs);
  const q = query.toLowerCase().trim();

  if (!q) {
    return {
      query: '',
      products: productsStore
        .filter((p) => p.status === 'active' && p.featured)
        .slice(0, 4),
      categories: (await getCategories(0)).slice(0, 4),
      collections: collectionsStore.slice(0, 2),
      articles: MOCK_JOURNAL_ARTICLES.slice(0, 2),
      totalMatches: 0,
    };
  }

  const products = productsStore.filter(
    (p) =>
      p.status === 'active' &&
      (p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.modelNumber.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.materials.some((m) => m.toLowerCase().includes(q)))
  );

  const allCategories = await getCategories(0);
  const categories = allCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  );

  const collections = collectionsStore.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q)
  );

  const articles = MOCK_JOURNAL_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
  );

  return {
    query,
    products,
    categories,
    collections,
    articles,
    totalMatches:
      products.length +
      categories.length +
      collections.length +
      articles.length,
  };
}

/**
 * 11. Admin & Account Orders service (Read & Write).
 */
export async function getOrders(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Order[]> {
  await simulateNetworkLatency(delayMs);
  return [...ordersStore];
}

export async function getOrderById(
  idOrOrderNumber: string,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Order | null> {
  await simulateNetworkLatency(delayMs);
  return (
    ordersStore.find(
      (o) => o.id === idOrOrderNumber || o.orderNumber === idOrOrderNumber
    ) ?? null
  );
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  delayMs = 160
): Promise<Order> {
  await simulateNetworkLatency(delayMs);
  const index = ordersStore.findIndex(
    (o) => o.id === orderId || o.orderNumber === orderId
  );
  if (index === -1) {
    throw new NoireServiceError(
      `Order ${orderId} not found`,
      'NOT_FOUND',
      404
    );
  }

  const allowedStatuses: OrderStatus[] = [
    'pending_settlement',
    'processing',
    'Craft & Calibration',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];
  if (!allowedStatuses.includes(nextStatus)) {
    throw new NoireServiceError('The requested local demo status is invalid.', 'VALIDATION_ERROR', 422);
  }

  const timestamp = new Date().toISOString();
  const updated: Order = {
    ...ordersStore[index],
    status: nextStatus,
    updatedAt: timestamp,
    timeline: [
      ...ordersStore[index].timeline.slice(-49),
      {
        id: `local-demo-status-${Date.now()}`,
        status: `LOCAL DEMO STATUS UPDATE // ${nextStatus.toUpperCase()}`,
        description: `The displayed order status changed locally to ${nextStatus}. No payment, inventory reservation, shipping booking, tracking, or fulfillment event occurred.`,
        timestamp,
        completed: true,
      },
    ],
  };

  ordersStore = ordersStore.map((item, idx) =>
    idx === index ? updated : item
  );
  return updated;
}

/**
 * 12. Admin Products CRUD mutations with full referential integrity.
 */
export async function getAllProductsForAdmin(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Product[]> {
  await simulateNetworkLatency(delayMs);
  return [...productsStore];
}

export async function upsertProduct(
  product: Product,
  delayMs = 180
): Promise<Product> {
  await simulateNetworkLatency(delayMs);

  const normalizedSlug = product.slug.toLowerCase().trim();
  const slugConflict = productsStore.find(
    (p) => p.slug.toLowerCase() === normalizedSlug && p.id !== product.id
  );
  if (slugConflict) {
    throw new NoireServiceError(
      `Product slug "${normalizedSlug}" is already assigned to ${slugConflict.id}`,
      'CONFLICT',
      409
    );
  }

  const now = new Date().toISOString();
  const existingIndex = productsStore.findIndex((p) => p.id === product.id);
  const sanitizedProduct: Product = {
    ...product,
    slug: normalizedSlug,
    updatedAt: now,
    createdAt: existingIndex > -1 ? productsStore[existingIndex].createdAt : now,
  };

  if (existingIndex > -1) {
    productsStore = productsStore.map((item, idx) =>
      idx === existingIndex ? sanitizedProduct : item
    );
  } else {
    productsStore = [sanitizedProduct, ...productsStore];
  }

  // Synchronize collection memberships
  collectionsStore = collectionsStore.map((col) => {
    const shouldInclude = sanitizedProduct.collectionIds.includes(col.id);
    const currentlyIncludes = col.productIds.includes(sanitizedProduct.id);

    if (shouldInclude && !currentlyIncludes) {
      return {
        ...col,
        productIds: [...col.productIds, sanitizedProduct.id],
      };
    }
    if (!shouldInclude && currentlyIncludes) {
      return {
        ...col,
        productIds: col.productIds.filter((id) => id !== sanitizedProduct.id),
      };
    }
    return col;
  });

  return sanitizedProduct;
}

export async function deleteProductsByIds(
  ids: string[],
  delayMs = 160
): Promise<void> {
  await simulateNetworkLatency(delayMs);
  const idSet = new Set(ids);

  // 1. Remove products and prune dangling relatedProductIds on remaining products
  productsStore = productsStore
    .filter((p) => !idSet.has(p.id))
    .map((p) => ({
      ...p,
      relatedProductIds: p.relatedProductIds.filter((relId) => !idSet.has(relId)),
    }));

  // 2. Prune deleted product IDs from collections
  collectionsStore = collectionsStore.map((col) => ({
    ...col,
    productIds: col.productIds.filter((pid) => !idSet.has(pid)),
  }));

  // 3. Prune deleted product IDs from customer wishlists
  customersStore = customersStore.map((cust) => ({
    ...cust,
    wishlistProductIds: cust.wishlistProductIds.filter(
      (pid) => !idSet.has(pid)
    ),
  }));
}

/**
 * 13. Admin & Account Customers service.
 */
export async function getCustomers(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Customer[]> {
  await simulateNetworkLatency(delayMs);
  return [...customersStore];
}

export async function getCustomerById(
  id: string,
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Customer | null> {
  await simulateNetworkLatency(delayMs);
  return customersStore.find((c) => c.id === id) ?? null;
}

/**
 * 14. Demo dashboard projection. Figures are derived only from this process's
 * local order store; no growth, conversion, customer, or inventory telemetry is fabricated.
 */
export async function getDashboardStats(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<DashboardStats> {
  await simulateNetworkLatency(delayMs);

  const paidOrders = ordersStore.filter((order) => order.paymentStatus === 'paid');
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + (order.totals?.total ?? order.total),
    0
  );
  const productSales = new Map<string, { unitsSold: number; revenue: number }>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const current = productSales.get(item.productId) ?? { unitsSold: 0, revenue: 0 };
      current.unitsSold += item.quantity;
      current.revenue += item.totalPrice;
      productSales.set(item.productId, current);
    }
  }
  const topProducts = [...productSales.entries()]
    .map(([productId, sales]) => ({
      product: productsStore.find((product) => product.id === productId),
      ...sales,
    }))
    .filter((entry): entry is { product: Product; unitsSold: number; revenue: number } => Boolean(entry.product))
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    revenueChangePercentage: 0,
    totalOrders: ordersStore.length,
    ordersChangePercentage: 0,
    totalCustomers: customersStore.length,
    customersChangePercentage: 0,
    conversionRate: 0,
    conversionChangePercentage: 0,
    averageOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
    aovChangePercentage: 0,
    revenueSeries: [],
    categoryPerformance: [],
    topProducts,
    recentOrders: ordersStore.slice(0, 5),
    inventoryAlerts: [],
    activityFeed: [],
  };
}

/**
 * 15. Discounts & Promo Code validation service.
 */
export async function getDiscounts(
  delayMs = DEFAULT_SIMULATED_DELAY_MS
): Promise<Discount[]> {
  await simulateNetworkLatency(delayMs);
  return [...discountsStore];
}

/**
 * Demo-only discount mutation used by the admin adapter. The same in-memory
 * catalog is read by `validateDiscountCode`; only active, date-valid codes can
 * pass the existing storefront check. A production adapter must validate on the server.
 */
export async function upsertDiscount(
  discount: Discount,
  delayMs = 160
): Promise<Discount> {
  await simulateNetworkLatency(delayMs);

  const code = discount.code.trim().toUpperCase();
  if (!code) {
    throw new NoireServiceError('A discount code is required.', 'VALIDATION_ERROR', 422);
  }
  if (!discount.description.trim()) {
    throw new NoireServiceError('A discount description is required.', 'VALIDATION_ERROR', 422);
  }
  if (discount.minOrderAmount !== undefined && (!Number.isFinite(discount.minOrderAmount) || discount.minOrderAmount < 0)) {
    throw new NoireServiceError('Minimum order value must be non-negative.', 'VALIDATION_ERROR', 422);
  }
  if (discount.usageLimit !== undefined && (!Number.isSafeInteger(discount.usageLimit) || discount.usageLimit < 1)) {
    throw new NoireServiceError('Usage limit must be a positive whole number.', 'VALIDATION_ERROR', 422);
  }
  if (!Number.isFinite(discount.value) || discount.value < 0) {
    throw new NoireServiceError('Discount value must be a non-negative number.', 'VALIDATION_ERROR', 422);
  }
  if (discount.type === 'percentage' && discount.value > 100) {
    throw new NoireServiceError('Percentage discounts cannot exceed 100%.', 'VALIDATION_ERROR', 422);
  }
  const start = new Date(discount.startsAt).getTime();
  const end = discount.expiresAt ? new Date(discount.expiresAt).getTime() : undefined;
  if (!Number.isFinite(start) || (end !== undefined && (!Number.isFinite(end) || end < start))) {
    throw new NoireServiceError('Discount validity dates are invalid.', 'VALIDATION_ERROR', 422);
  }

  const codeConflict = discountsStore.find(
    (candidate) => candidate.code.toUpperCase() === code && candidate.id !== discount.id
  );
  if (codeConflict) {
    throw new NoireServiceError(`Discount code ${code} is already in use.`, 'CONFLICT', 409);
  }

  const existingIndex = discountsStore.findIndex((candidate) => candidate.id === discount.id);
  const saved: Discount = {
    ...discount,
    code,
    description: discount.description.trim(),
    usageCount: existingIndex >= 0 ? discountsStore[existingIndex].usageCount : 0,
  };

  discountsStore = existingIndex >= 0
    ? discountsStore.map((candidate, index) => index === existingIndex ? saved : candidate)
    : [saved, ...discountsStore];

  return saved;
}

export async function validateDiscountCode(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  discount?: Discount;
  discountAmount: number;
  message: string;
}> {
  await simulateNetworkLatency(160);
  const normalized = code.trim().toUpperCase();
  const now = Date.now();
  const discount = discountsStore.find(
    (d) =>
      d.code.toUpperCase() === normalized &&
      d.status === 'active' &&
      new Date(d.startsAt).getTime() <= now &&
      (!d.expiresAt || new Date(d.expiresAt).getTime() >= now)
  );

  if (!discount) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'Allocation code not recognized or expired.',
    };
  }

  if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order value of $${discount.minOrderAmount} required for ${discount.code}.`,
    };
  }

  const discountAmount =
    discount.type === 'percentage'
      ? Math.round((subtotal * discount.value) / 100)
      : discount.type === 'fixed_amount'
      ? discount.value
      : 0;

  return {
    valid: true,
    discount,
    discountAmount,
    message: `${discount.code} applied — ${discount.description}`,
  };
}

/**
 * 16. Replaceable Shipping Methods Service Contract
 */
export const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'ship-demo-air',
    code: 'DEMO-COUR-AIR',
    name: 'Demo Air Courier Estimate',
    carrier: 'NOT CONNECTED // DEMONSTRATION ONLY',
    estimatedWindow: 'Illustrative only: 2–4 business days; not booked',
    estimatedDispatch: 'No dispatch booking or fulfillment event is connected.',
    baseCost: 35,
    freeAboveSubtotal: 500,
    description:
      'Static demonstration estimate only; no courier quote, insurance policy, booking, tracking, or delivery service is connected.',
  },
  {
    id: 'ship-white-glove',
    code: 'NR-COUR-WG',
    name: 'Demo Studio Delivery Estimate',
    carrier: 'NOT CONNECTED // DEMONSTRATION ONLY',
    estimatedWindow: 'Illustrative only: 1–3 business days; not booked',
    estimatedDispatch: 'No dispatch booking or fulfillment event is connected.',
    baseCost: 85,
    description:
      'Static demonstration estimate only; no handling, insurance, booking, tracking, or delivery service is connected.',
  },
  {
    id: 'ship-standard-intl',
    code: 'NR-COUR-STD',
    name: 'Demo International Courier Estimate',
    carrier: 'NOT CONNECTED // DEMONSTRATION ONLY',
    estimatedWindow: 'Illustrative only: 5–10 business days; not booked',
    estimatedDispatch: 'No dispatch booking or fulfillment event is connected.',
    baseCost: 25,
    freeAboveSubtotal: 500,
    description:
      'Static demonstration estimate only; no customs, courier, tracking, or fulfillment service is connected.',
  },
];

export async function getShippingMethods(
  _country?: string,
  delayMs = 90,
  subtotal = 0,
  freeShippingPrivilege = false
): Promise<ShippingMethod[]> {
  await simulateNetworkLatency(delayMs);
  return DEFAULT_SHIPPING_METHODS.map((method) => ({
    ...method,
    quotedCost:
      freeShippingPrivilege ||
      (method.freeAboveSubtotal !== undefined &&
        subtotal >= method.freeAboveSubtotal)
        ? 0
        : method.baseCost,
  }));
}

export async function validateDeliveryAddress(
  address: Address,
  delayMs = 80
): Promise<AddressValidationResult> {
  await simulateNetworkLatency(delayMs);

  const requiredFields: Array<keyof Address> = [
    'firstName',
    'lastName',
    'line1',
    'city',
    'state',
    'postalCode',
    'country',
    'phone',
  ];
  const fieldErrors: AddressValidationResult['fieldErrors'] = {};
  for (const field of requiredFields) {
    if (!String(address[field] ?? '').trim()) {
      fieldErrors[field] = 'This address detail is required for courier validation.';
    }
  }

  if (
    address.country.toLowerCase() === 'united states' &&
    !/^\d{5}(?:-\d{4})?$/.test(address.postalCode.trim())
  ) {
    fieldErrors.postalCode = 'Enter a valid five-digit US ZIP code (or ZIP+4).';
  }

  const phoneDigits = address.phone.replace(/\D/g, '');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    fieldErrors.phone = 'Enter an international phone number with 7–15 digits.';
  }

  const valid = Object.keys(fieldErrors).length === 0;
  return {
    valid,
    message: valid
      ? 'Delivery address passed the mock courier validation contract.'
      : 'Some address details require attention before dispatch can be quoted.',
    fieldErrors: valid ? undefined : fieldErrors,
  };
}

/**
 * 17. Cart & Inventory Validation Service Contract
 * Validates that cart items exist, finishes/options are valid, inventory constraints hold, and prices are current.
 */
export async function validateCartForCheckout(
  items: CartItem[],
  delayMs = 110
): Promise<CartValidationResult> {
  await simulateNetworkLatency(delayMs);

  if (!items || items.length === 0) {
    return {
      valid: false,
      issues: [
        {
          itemId: 'empty',
          productId: '',
          productName: 'Allocation Manifest',
          type: 'product_unavailable',
          message: 'Your allocation bag is empty.',
        },
      ],
    };
  }

  const issues: CartValidationIssue[] = [];

  for (const item of items) {
    const product = productsStore.find(
      (p) => p.id === item.productId && p.status === 'active'
    );

    if (!product) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        productName: item.name,
        type: 'product_unavailable',
        message: `${item.name} is no longer available in the active catalog.`,
      });
      continue;
    }

    if (
      product.stockStatus === 'out_of_stock' ||
      (product.stockStatus !== 'pre_order' && product.inventoryCount <= 0)
    ) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        productName: item.name,
        type: 'out_of_stock',
        message: `${item.name} is currently out of stock for immediate allocation.`,
      });
      continue;
    }

    const colorVariant = product.colors.find(
      (c) => c.id === item.selectedColor.id
    );
    if (!colorVariant || !colorVariant.inStock) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        productName: item.name,
        type: 'color_unavailable',
        message: `Selected finish (${item.selectedColor.name}) for ${item.name} is currently unavailable.`,
      });
    }

    let expectedOptionDelta = 0;
    if (item.selectedOption) {
      const optionVariant = product.options?.find(
        (o) => o.id === item.selectedOption?.id
      );
      if (!optionVariant || !optionVariant.inStock) {
        issues.push({
          itemId: item.id,
          productId: item.productId,
          productName: item.name,
          type: 'option_unavailable',
          message: `Selected configuration (${item.selectedOption.label}) for ${item.name} is no longer offered.`,
        });
      } else {
        expectedOptionDelta = optionVariant.priceDelta;
      }
    }

    const availableUnits =
      product.stockStatus === 'pre_order' ? 10 : product.inventoryCount;
    const maxAllowed = Math.max(1, Math.min(10, availableUnits));
    if (item.quantity > maxAllowed || item.quantity <= 0) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        productName: item.name,
        type: 'quantity_adjusted',
        message: `Requested quantity (${item.quantity}) for ${item.name} exceeds available studio allocation (${maxAllowed}).`,
        suggestedQuantity: maxAllowed,
      });
    }

    const expectedUnitPrice = product.price + expectedOptionDelta;
    if (item.price !== expectedUnitPrice) {
      issues.push({
        itemId: item.id,
        productId: item.productId,
        productName: item.name,
        type: 'price_updated',
        message: `Unit valuation for ${item.name} has been updated to $${expectedUnitPrice}.`,
        updatedPrice: expectedUnitPrice,
      });
    }
  }

  const itemsByProduct = new Map<string, CartItem[]>();
  for (const item of items) {
    const group = itemsByProduct.get(item.productId) ?? [];
    group.push(item);
    itemsByProduct.set(item.productId, group);
  }

  for (const [productId, productItems] of itemsByProduct) {
    const product = productsStore.find((candidate) => candidate.id === productId);
    if (!product || product.stockStatus === 'pre_order') continue;

    const requestedUnits = productItems.reduce(
      (sum, item) => sum + Math.max(0, item.quantity),
      0
    );
    if (requestedUnits > product.inventoryCount) {
      const representative = productItems[0];
      issues.push({
        itemId: representative.id,
        productId,
        productName: representative.name,
        type: 'quantity_adjusted',
        message: `Across all selected finishes, ${product.inventoryCount} unit(s) of ${representative.name} remain. Reduce or remove units in your bag before continuing.`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * 18. Payment Provider Service Contract (PaymentIntent / ConfirmPayment)
 * Strictly isolated from raw PAN/CVC storage; accepts only tokenized or masked metadata.
 */
export async function createPaymentIntent(
  params: {
    amount: number;
    currency?: 'USD';
    provider: PaymentProvider;
  },
  delayMs = 140
): Promise<PaymentIntent> {
  await simulateNetworkLatency(delayMs);

  if (!Number.isFinite(params.amount) || params.amount <= 0 || params.amount > 10_000_000) {
    throw new NoireServiceError(
      'Payment intent requires a positive settlement amount.',
      'VALIDATION_ERROR',
      400
    );
  }

  return {
    provider: params.provider,
    amount: params.amount,
    currency: params.currency ?? 'USD',
    status: 'requires_confirmation',
    simulated: true,
    createdAt: new Date().toISOString(),
  };
}

export async function confirmPayment(
  params: {
    intent: PaymentIntent;
    method: PaymentMethod;
    simulateFailure?: boolean;
  },
  delayMs = 220
): Promise<PaymentResult> {
  await simulateNetworkLatency(delayMs);

  // This local adapter never contacts an issuer or captures funds. The terminal
  // 0002 test sequence is a deterministic decline path for error-state testing.
  if (params.simulateFailure || params.method.last4 === '0002') {
    return {
      status: 'declined',
      simulated: true,
      errorCode: 'DEMO_DECLINE',
      errorMessage:
        'Demonstration decline (ERR // AUTH-0002). No funds were authorized or captured. Use another sandbox value or retry.',
    };
  }

  const summary = sanitizePaymentSummary({
    provider: params.method.provider,
    methodType: params.method.type,
    brand: params.method.brand ?? 'Payment method',
    last4: params.method.last4 ?? '—',
    cardholderName: params.method.cardholderName ?? 'NOIRÉ Client',
  });

  if (!summary) {
    return {
      status: 'provider_required',
      simulated: true,
      message: 'Masked payment metadata was invalid. No payment provider was contacted and no funds were authorized or captured.',
    };
  }

  return {
    status: 'provider_required',
    simulated: true,
    paymentSummary: summary,
    message:
      'No payment provider is connected. Only a pending allocation record can be created; no live authorization or funds transfer occurred.',
  };
}

/** Adapter seam for replacing the demo payment flow with a provider SDK/service. */
export function getPaymentProviderAdapter(
  provider: PaymentProvider
): PaymentProviderContract {
  return {
    provider,
    createPaymentIntent: (amount) =>
      createPaymentIntent({ amount, currency: 'USD', provider }),
    confirmPayment: (intent, method) => confirmPayment({ intent, method }),
  };
}

/**
 * Local demo consistency check only. A future server adapter must independently
 * price products, discounts, tax, and shipping from trusted catalog/provider data.
 */
function cartSubtotalInCents(items: CartItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
}

export function validateOrderTotals(totals: OrderTotals): {
  valid: boolean;
  message: string;
} {
  const values = [
    totals.subtotal,
    totals.discountAmount,
    totals.shippingCost,
    totals.taxAmount,
    totals.total,
  ];
  if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 10_000_000)) {
    return { valid: false, message: 'One or more settlement values are invalid or out of range.' };
  }
  if (totals.currency !== 'USD') {
    return { valid: false, message: 'Only the preview USD currency is supported.' };
  }
  if (Math.abs(totals.taxAmount) > 0.01) {
    return { valid: false, message: 'Tax is not calculated by this demo; tax must remain pending.' };
  }

  const expectedTotal = Math.max(
    0,
    Math.round(
      (totals.subtotal - totals.discountAmount + totals.shippingCost + totals.taxAmount) *
        100
    ) / 100
  );
  if (Math.abs(expectedTotal - totals.total) > 0.01) {
    return {
      valid: false,
      message: 'The allocation totals have changed. Review the updated summary before placing the order.',
    };
  }

  if (totals.discountAmount > totals.subtotal) {
    return {
      valid: false,
      message: 'Allocation privilege cannot exceed the order subtotal.',
    };
  }

  return { valid: true, message: 'Settlement values are internally consistent.' };
}

/**
 * 19. Order Creation & Finalization Service Contract
 */
export interface CreateOrderInput {
  customer: CheckoutCustomerInfo;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentSummary: PaymentSummary;
  items: CartItem[];
  totals: OrderTotals;
  discountCode?: string;
  notes?: string;
}

export type FinalizeOrderInput = Omit<CreateOrderInput, 'paymentSummary'> & {
  paymentMethod: PaymentMethod;
};

export async function createOrder(
  input: CreateOrderInput,
  delayMs = 180
): Promise<Order> {
  await simulateNetworkLatency(delayMs);

  const totalsValidation = validateOrderTotals(input.totals);
  if (!totalsValidation.valid) {
    throw new NoireServiceError(totalsValidation.message, 'VALIDATION_ERROR', 422);
  }

  const validation = await validateCartForCheckout(input.items, 0);
  if (!validation.valid) {
    throw new NoireServiceError(
      validation.issues[0]?.message || 'Cart validation failed prior to order creation.',
      'VALIDATION_ERROR',
      422
    );
  }
  if (Math.abs(cartSubtotalInCents(input.items) - input.totals.subtotal) > 0.01) {
    throw new NoireServiceError(
      'The displayed subtotal does not match the selected catalog items.',
      'VALIDATION_ERROR',
      422
    );
  }

  const shippingMethod = DEFAULT_SHIPPING_METHODS.find(
    (method) => method.id === input.shippingMethod.id
  );
  const paymentSummary = sanitizePaymentSummary(input.paymentSummary);
  if (!shippingMethod || !paymentSummary) {
    throw new NoireServiceError(
      'The demonstration shipping or masked payment metadata was invalid.',
      'VALIDATION_ERROR',
      422
    );
  }

  const now = new Date();
  const numericSuffix = String(Math.floor(10000 + Math.random() * 89999));
  const orderNumber = `NR-${numericSuffix}`;
  const allocationReference = `ALLOC-${now.getFullYear()}-${numericSuffix.slice(0, 4)}`;

  const orderItems: OrderItem[] = input.items.map((item, idx) => {
    const product = productsStore.find((candidate) => candidate.id === item.productId);
    const colorSuffix = product?.colors.find((color) => color.id === item.selectedColor.id)?.skuSuffix ?? 'STD';
    const sku = `${product?.sku ?? 'NR-00'}-${colorSuffix}`;
    const variantName = item.selectedOption
      ? `${item.selectedColor.name} // ${item.selectedOption.label}`
      : item.selectedColor.name;

    return {
      id: `oi-${Date.now()}-${idx + 1}`,
      productId: item.productId,
      productSlug: item.slug,
      productName: item.name,
      modelNumber: item.modelNumber,
      sku,
      variantName,
      selectedFinish: item.selectedColor,
      selectedOption: item.selectedOption,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    };
  });

  // This order is a browser-local demonstration record only. It does not reserve
  // stock, authorize funds, or create a courier/fulfillment event.
  const paymentMethodLabel = paymentSummary.methodType === 'apple_pay'
    ? `Apple Pay •••• ${paymentSummary.last4}`
    : paymentSummary.methodType === 'wire_transfer'
      ? 'Studio wire transfer'
      : `${paymentSummary.brand} •••• ${paymentSummary.last4}`;

  const newOrder: Order = {
    id: `ord-${numericSuffix}`,
    orderNumber,
    allocationReference,
    customerId: 'guest-local',
    customer: {
      firstName: boundedText(input.customer.firstName, '', 80),
      lastName: boundedText(input.customer.lastName, '', 80),
      email: boundedText(input.customer.email, '', 254),
      phone: boundedText(input.customer.phone, '', 40),
    },
    customerName: `${input.customer.firstName} ${input.customer.lastName}`.trim(),
    customerEmail: boundedText(input.customer.email, '', 254),
    customerPhone: boundedText(input.customer.phone, '', 40),
    status: 'pending_settlement',
    paymentStatus: 'pending',
    paymentMethod: `${paymentMethodLabel} // DEMONSTRATION ONLY`,
    paymentSummary,
    shippingMethod,
    totals: input.totals,
    items: orderItems,
    subtotal: input.totals.subtotal,
    shippingCost: input.totals.shippingCost,
    taxAmount: 0,
    discountAmount: input.totals.discountAmount,
    discountCode: input.discountCode,
    total: input.totals.total,
    currency: 'USD',
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    timeline: [
      {
        id: `tl-${numericSuffix}-1`,
        status: 'LOCAL DEMO RECORD CREATED // PENDING SETTLEMENT',
        description: 'This browser-local demonstration record has no payment authorization, inventory reservation, dispatch booking, tracking, or fulfillment event.',
        timestamp: now.toISOString(),
        completed: true,
      },
    ],
    notes: boundedText(input.notes, '', 500) || undefined,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const safeOrder = sanitizeOrderState(newOrder, DEFAULT_SHIPPING_METHODS);
  if (!safeOrder) {
    throw new NoireServiceError(
      'The demonstration order could not be safely recorded.',
      'VALIDATION_ERROR',
      422
    );
  }
  ordersStore = [safeOrder, ...ordersStore].slice(0, 100);
  return safeOrder;
}

export async function finalizeOrder(input: FinalizeOrderInput): Promise<{
  order?: Order;
  paymentResult: PaymentResult;
}> {
  const totalsValidation = validateOrderTotals(input.totals);
  if (!totalsValidation.valid) {
    throw new NoireServiceError(
      totalsValidation.message,
      'VALIDATION_ERROR',
      422
    );
  }

  const shippingMethod = DEFAULT_SHIPPING_METHODS.find(
    (method) => method.id === input.shippingMethod.id
  );
  if (!shippingMethod) {
    throw new NoireServiceError(
      'The selected shipping service is no longer available. Choose another method.',
      'VALIDATION_ERROR',
      422
    );
  }

  const discountResult = input.discountCode
    ? await validateDiscountCode(input.discountCode, input.totals.subtotal)
    : null;
  if (discountResult && !discountResult.valid) {
    throw new NoireServiceError(
      discountResult.message,
      'VALIDATION_ERROR',
      422
    );
  }
  const expectedDiscount = discountResult?.discountAmount ?? 0;
  const freeShipping = discountResult?.discount?.type === 'free_shipping';
  const expectedShipping =
    freeShipping ||
    (shippingMethod.freeAboveSubtotal !== undefined &&
      input.totals.subtotal >= shippingMethod.freeAboveSubtotal)
      ? 0
      : shippingMethod.baseCost;

  if (
    Math.abs(input.totals.discountAmount - expectedDiscount) > 0.01 ||
    Math.abs(input.totals.shippingCost - expectedShipping) > 0.01
  ) {
    throw new NoireServiceError(
      'Discount or courier pricing has changed. Refresh the allocation summary before continuing.',
      'VALIDATION_ERROR',
      422
    );
  }

  const cartValidation = await validateCartForCheckout(input.items, 0);
  if (!cartValidation.valid) {
    throw new NoireServiceError(
      cartValidation.issues[0]?.message ?? 'The cart could not be validated.',
      'VALIDATION_ERROR',
      422
    );
  }
  if (Math.abs(cartSubtotalInCents(input.items) - input.totals.subtotal) > 0.01) {
    throw new NoireServiceError(
      'The displayed subtotal does not match the selected catalog items.',
      'VALIDATION_ERROR',
      422
    );
  }

  const paymentProvider = getPaymentProviderAdapter(input.paymentMethod.provider);
  const paymentIntent = await paymentProvider.createPaymentIntent(input.totals.total);

  const paymentResult = await paymentProvider.confirmPayment(
    paymentIntent,
    input.paymentMethod
  );

  if (
    paymentResult.status === 'declined' ||
    !paymentResult.paymentSummary
  ) {
    return { paymentResult };
  }

  const orderInput: CreateOrderInput = {
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    shippingMethod,
    paymentSummary: paymentResult.paymentSummary,
    items: input.items,
    totals: input.totals,
    discountCode: input.discountCode,
    notes: input.notes,
  };
  const order = await createOrder(orderInput);

  // This intent remains requires_confirmation in the demo adapter. A real provider
  // must confirm authorization/capture before fulfillment or an order is marked paid.
  return { order, paymentResult };
}

