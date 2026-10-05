'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type {
  Product,
  ProductColorVariant,
  ProductOptionVariant,
  CartItem,
  Discount,
  ShippingMethod,
  OrderTotals,
  Order,
  OrderStatus,
} from '@/types';
import {
  validateDiscountCode,
  DEFAULT_SHIPPING_METHODS,
} from '@/lib/services';
import { useToast } from '@/components/ui/toast';
import {
  sanitizeCartState,
  sanitizeDiscountState,
  sanitizeIdentifierList,
  sanitizeOrderList,
  sanitizeOrderState,
  sanitizeShippingMethodState,
} from '@/lib/utils/persisted-state';

export const FREE_SHIPPING_THRESHOLD = 500;
export const STANDARD_COURIER_RATE = 35;

interface CommerceContextValue {
  // Cart state
  cart: CartItem[];
  isCartHydrated: boolean;
  cartCount: number;
  cartLineTotals: Record<string, number>;
  cartSubtotal: number;
  discountAmount: number;
  appliedDiscount: Discount | null;
  selectedShippingMethod: ShippingMethod;
  setSelectedShippingMethod: (method: ShippingMethod) => void;
  shippingEstimateCost: number;
  taxAmount: number;
  cartTotal: number;
  orderTotals: OrderTotals;
  freeShippingProgress: number;
  amountUntilFreeShipping: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (params: {
    product: Product;
    color?: ProductColorVariant;
    option?: ProductOptionVariant;
    quantity?: number;
    openDrawer?: boolean;
  }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  syncCartItemFromValidation: (
    cartItemId: string,
    updates: { quantity?: number; price?: number }
  ) => void;
  moveToWishlist: (cartItemId: string) => void;
  clearCart: (silent?: boolean) => void;

  // Discount / Allocation privilege codes
  applyDiscountCode: (
    code: string
  ) => Promise<{ valid: boolean; message: string }>;
  removeDiscountCode: () => void;

  // Placed orders session archive (contains only tokenized paymentSummary, never raw card data)
  placedOrders: Order[];
  recordPlacedOrder: (order: Order) => void;
  updatePlacedOrderStatus: (idOrOrderNumber: string, status: OrderStatus) => Order | null;
  getPlacedOrderById: (idOrOrderNumber: string) => Order | null;

  // Wishlist state
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeWishlistItem: (product: Product) => void;
  clearWishlist: () => void;
  pruneWishlistIds: (validProductIds: string[]) => void;

  // Recently viewed
  recentlyViewedIds: string[];
  recordProductView: (productId: string) => void;

  // Global overlays
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const CommerceContext = createContext<CommerceContextValue | undefined>(
  undefined
);

const STORAGE_KEYS = {
  CART: 'noire_cart_v1',
  WISHLIST: 'noire_wishlist_v1',
  RECENT: 'noire_recent_v1',
  DISCOUNT: 'noire_discount_v1',
  SHIPPING_METHOD: 'noire_shipping_method_v1',
  ORDERS: 'noire_orders_v1',
};
const MAX_PERSISTED_STATE_CHARS = 2 * 1024 * 1024;

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useToast();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethodState] =
    useState<ShippingMethod>(DEFAULT_SHIPPING_METHODS[0]);
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  // Persisted browser state is untrusted: parse each key independently, then whitelist and bound it.
  useEffect(() => {
    const readStoredValue = (key: string): unknown => {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return undefined;
        if (raw.length > MAX_PERSISTED_STATE_CHARS) {
          localStorage.removeItem(key);
          return undefined;
        }
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    };
    const parseEventValue = (raw: string | null): unknown => {
      if (raw === null || raw.length > MAX_PERSISTED_STATE_CHARS) return undefined;
      try {
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    };
    const resetStoredState = () => {
      setCart([]);
      setWishlistIds([]);
      setRecentlyViewedIds([]);
      setAppliedDiscount(null);
      setSelectedShippingMethodState(DEFAULT_SHIPPING_METHODS[0]);
      setPlacedOrders([]);
    };

    setCart(sanitizeCartState(readStoredValue(STORAGE_KEYS.CART)));
    setWishlistIds(sanitizeIdentifierList(readStoredValue(STORAGE_KEYS.WISHLIST)));
    setRecentlyViewedIds(sanitizeIdentifierList(readStoredValue(STORAGE_KEYS.RECENT), 6));
    setAppliedDiscount(sanitizeDiscountState(readStoredValue(STORAGE_KEYS.DISCOUNT)));
    setSelectedShippingMethodState(
      sanitizeShippingMethodState(readStoredValue(STORAGE_KEYS.SHIPPING_METHOD), DEFAULT_SHIPPING_METHODS)
    );
    setPlacedOrders(sanitizeOrderList(readStoredValue(STORAGE_KEYS.ORDERS), DEFAULT_SHIPPING_METHODS));
    setIsHydrated(true);

    const handleStorageSync = (event: StorageEvent) => {
      if (event.key === null) {
        resetStoredState();
        return;
      }
      const value = parseEventValue(event.newValue);
      if (event.key === STORAGE_KEYS.CART) {
        setCart(sanitizeCartState(value));
      } else if (event.key === STORAGE_KEYS.WISHLIST) {
        setWishlistIds(sanitizeIdentifierList(value));
      } else if (event.key === STORAGE_KEYS.RECENT) {
        setRecentlyViewedIds(sanitizeIdentifierList(value, 6));
      } else if (event.key === STORAGE_KEYS.DISCOUNT) {
        setAppliedDiscount(sanitizeDiscountState(value));
      } else if (event.key === STORAGE_KEYS.SHIPPING_METHOD) {
        setSelectedShippingMethodState(sanitizeShippingMethodState(value, DEFAULT_SHIPPING_METHODS));
      } else if (event.key === STORAGE_KEYS.ORDERS) {
        setPlacedOrders(sanitizeOrderList(value, DEFAULT_SHIPPING_METHODS));
      }
    };

    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistIds));
    } catch {
      // Ignore
    }
  }, [wishlistIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.RECENT,
        JSON.stringify(recentlyViewedIds)
      );
    } catch {
      // Ignore
    }
  }, [recentlyViewedIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedDiscount) {
        localStorage.setItem(
          STORAGE_KEYS.DISCOUNT,
          JSON.stringify(appliedDiscount)
        );
      } else {
        localStorage.removeItem(STORAGE_KEYS.DISCOUNT);
      }
    } catch {
      // Ignore
    }
  }, [appliedDiscount, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.SHIPPING_METHOD,
        JSON.stringify(selectedShippingMethod)
      );
    } catch {
      // Ignore
    }
  }, [selectedShippingMethod, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(placedOrders));
    } catch {
      // Ignore
    }
  }, [placedOrders, isHydrated]);

  const setSelectedShippingMethod = useCallback((method: ShippingMethod) => {
    setSelectedShippingMethodState(
      sanitizeShippingMethodState(method, DEFAULT_SHIPPING_METHODS)
    );
  }, []);

  const addToCart = useCallback(
    ({
      product,
      color,
      option,
      quantity = 1,
      openDrawer = false,
    }: {
      product: Product;
      color?: ProductColorVariant;
      option?: ProductOptionVariant;
      quantity?: number;
      openDrawer?: boolean;
    }) => {
      if (!Number.isSafeInteger(quantity) || quantity < 1) return;
      if (
        product.status !== 'active' ||
        product.stockStatus === 'out_of_stock' ||
        (product.stockStatus !== 'pre_order' && product.inventoryCount <= 0)
      ) return;
      const selectedColor = color ?? product.colors[0];
      if (!selectedColor || !Number.isFinite(product.price) || product.price < 0) return;
      const safeQuantity = Math.min(10, quantity);
      const selectedOption = option ?? product.options?.[0];
      const compositeId = `${product.id}__${selectedColor.id}__${
        selectedOption?.id ?? 'default'
      }`;
      const unitPrice = product.price + (selectedOption?.priceDelta ?? 0);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return;

      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === compositeId);
        if (existingIndex > -1) {
          const updated = [...prev];
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            quantity: Math.min(
              existing.maxQuantity,
              existing.quantity + safeQuantity
            ),
          };
          return updated;
        }

        const newItem: CartItem = {
          id: compositeId,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          modelNumber: product.modelNumber,
          categoryName: product.categoryName,
          price: unitPrice,
          compareAtPrice: product.compareAtPrice
            ? product.compareAtPrice + (selectedOption?.priceDelta ?? 0)
            : undefined,
          image: selectedColor.image || product.primaryImage,
          selectedColor: {
            id: selectedColor.id,
            name: selectedColor.name,
            hex: selectedColor.hex,
          },
          selectedOption: selectedOption
            ? {
                id: selectedOption.id,
                label: selectedOption.label,
                priceDelta: selectedOption.priceDelta,
              }
            : undefined,
          quantity: Math.min(
            safeQuantity,
            product.stockStatus === 'pre_order'
              ? 10
              : Math.max(1, Math.min(10, product.inventoryCount))
          ),
          maxQuantity:
            product.stockStatus === 'pre_order'
              ? 10
              : Math.max(1, Math.min(10, product.inventoryCount)),
          shippingEstimate: product.shippingEstimate,
        };
        return [...prev, newItem];
      });

      if (openDrawer) {
        setIsCartDrawerOpen(true);
      } else {
        addToast({
          type: 'cart',
          title: `${product.name} added to bag`,
          description: `${selectedColor.name}${
            selectedOption ? ` — ${selectedOption.label}` : ''
          } × ${safeQuantity}`,
          actionLabel: 'Open Bag',
          onAction: () => setIsCartDrawerOpen(true),
        });
      }
    },
    [addToast]
  );

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      const removed = cart.find((i) => i.id === cartItemId);
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      if (removed) {
        addToast({
          type: 'info',
          title: `${removed.name} removed`,
          description: `${removed.selectedColor.name}${
            removed.selectedOption ? ` · ${removed.selectedOption.label}` : ''
          } removed from allocation bag.`,
          actionLabel: 'Undo',
          onAction: () => {
            setCart((prev) => {
              if (prev.some((i) => i.id === removed.id)) return prev;
              return [...prev, removed];
            });
          },
        });
      }
    },
    [cart, addToast]
  );

  const updateCartQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity)) return;
      if (quantity <= 0) {
        removeFromCart(cartItemId);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: Math.min(item.maxQuantity, quantity) }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const syncCartItemFromValidation = useCallback(
    (cartItemId: string, updates: { quantity?: number; price?: number }) => {
      const quantity = Number.isSafeInteger(updates.quantity) && (updates.quantity ?? 0) > 0
        ? updates.quantity
        : undefined;
      const price = Number.isFinite(updates.price) && (updates.price ?? -1) >= 0
        ? updates.price
        : undefined;
      if (quantity === undefined && price === undefined) return;
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId
            ? {
                ...item,
                ...(quantity === undefined ? {} : { quantity: Math.min(item.maxQuantity, quantity) }),
                ...(price === undefined ? {} : { price }),
              }
            : item
        )
      );
    },
    []
  );

  const moveToWishlist = useCallback(
    (cartItemId: string) => {
      const target = cart.find((i) => i.id === cartItemId);
      if (!target) return;

      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      setWishlistIds((prev) =>
        prev.includes(target.productId) ? prev : [target.productId, ...prev]
      );

      addToast({
        type: 'wishlist',
        title: `${target.name} saved for later`,
        description: 'Moved from active allocation bag to your Wishlist Archive.',
      });
    },
    [cart, addToast]
  );

  const clearCart = useCallback(
    (silent = false) => {
      setCart([]);
      setAppliedDiscount(null);
      if (!silent) {
        addToast({
          type: 'info',
          title: 'Allocation manifest cleared',
          description: 'All instruments have been released from your bag.',
        });
      }
    },
    [addToast]
  );

  const recordPlacedOrder = useCallback(
    (order: Order) => {
      const safeOrder = sanitizeOrderState(order, DEFAULT_SHIPPING_METHODS);
      if (!safeOrder) {
        throw new Error('The demonstration order could not be safely recorded. Your bag remains available.');
      }
      const nextOrders = [
        safeOrder,
        ...placedOrders.filter((candidate) => candidate.id !== safeOrder.id),
      ].slice(0, 100);
      setPlacedOrders(nextOrders);
      try {
        // Whitelisted local demo fields only; payment credentials/tokens and real fulfillment data are omitted.
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));
      } catch {
        // The order remains available in in-memory state if storage is restricted.
      }
    },
    [placedOrders]
  );

  const updatePlacedOrderStatus = useCallback(
    (idOrOrderNumber: string, status: OrderStatus): Order | null => {
      if (!['pending_settlement', 'processing', 'Craft & Calibration', 'shipped', 'delivered', 'cancelled', 'returned'].includes(status)) return null;
      const current = placedOrders.find(
        (order) => order.id === idOrOrderNumber || order.orderNumber === idOrOrderNumber
      );
      if (!current) return null;
      if (current.status === status) return current;

      const timestamp = new Date().toISOString();
      const updated: Order = {
        ...current,
        status,
        updatedAt: timestamp,
        timeline: [
          ...current.timeline,
          {
            id: `local-admin-${Date.now()}`,
            status: `LOCAL DEMO ADMIN ACTION // ${status.toUpperCase()}`,
            description: `A local administrator changed the displayed order status from ${current.status} to ${status}. No payment authorization, capture, inventory reservation, shipping label, courier booking, or physical fulfillment action was performed.`,
            timestamp,
            completed: true,
          },
        ],
      };
      const nextOrders = placedOrders.map((order) =>
        order.id === current.id ? updated : order
      );
      setPlacedOrders(nextOrders);
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));
      } catch {
        // The update remains in memory if browser storage is unavailable.
      }
      return updated;
    },
    [placedOrders]
  );

  const getPlacedOrderById = useCallback(
    (idOrOrderNumber: string): Order | null => {
      return (
        placedOrders.find(
          (o) => o.id === idOrOrderNumber || o.orderNumber === idOrOrderNumber
        ) ?? null
      );
    },
    [placedOrders]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const exists = wishlistIds.includes(product.id);
      setWishlistIds((prev) =>
        exists ? prev.filter((id) => id !== product.id) : [product.id, ...prev]
      );

      addToast({
        type: 'wishlist',
        title: exists
          ? `${product.name} removed from archive`
          : `${product.name} saved to archive`,
        description: product.modelNumber,
      });
    },
    [wishlistIds, addToast]
  );

  const removeWishlistItem = useCallback(
    (product: Product) => {
      if (!wishlistIds.includes(product.id)) return;
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      addToast({
        type: 'wishlist',
        title: `${product.name} removed from your archive`,
        description: 'The instrument has been removed from your private ledger.',
        actionLabel: 'Undo',
        onAction: () => {
          setWishlistIds((prev) =>
            prev.includes(product.id) ? prev : [product.id, ...prev]
          );
        },
      });
    },
    [wishlistIds, addToast]
  );

  const clearWishlist = useCallback(() => {
    if (wishlistIds.length === 0) return;
    const removedIds = [...wishlistIds];
    setWishlistIds([]);
    addToast({
      type: 'info',
      title: 'Saved archive cleared',
      description: `${removedIds.length} saved instrument${removedIds.length === 1 ? '' : 's'} removed from the private ledger.`,
      actionLabel: 'Undo',
      onAction: () => {
        setWishlistIds((prev) => {
          const present = new Set(prev);
          const restored = removedIds.filter((id) => !present.has(id));
          return [...restored, ...prev];
        });
      },
    });
  }, [wishlistIds, addToast]);

  const pruneWishlistIds = useCallback((validProductIds: string[]) => {
    const validIds = new Set(validProductIds);
    setWishlistIds((prev) => {
      const retained = prev.filter((id, index) =>
        validIds.has(id) && prev.indexOf(id) === index
      );
      return retained.length === prev.length ? prev : retained;
    });
  }, []);

  const recordProductView = useCallback((productId: string) => {
    const safeProductId = sanitizeIdentifierList([productId], 1)[0];
    if (!safeProductId) return;
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== safeProductId);
      return [safeProductId, ...filtered].slice(0, 6);
    });
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartLineTotals = useMemo<Record<string, number>>(
    () =>
      Object.fromEntries(
        cart.map((item) => [item.id, item.price * item.quantity])
      ),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => Object.values(cartLineTotals).reduce((sum, lineTotal) => sum + lineTotal, 0),
    [cartLineTotals]
  );

  // Dynamically compute discountAmount against current cartSubtotal
  const discountAmount = useMemo(() => {
    if (!appliedDiscount || cartSubtotal <= 0) return 0;
    if (
      appliedDiscount.minOrderAmount &&
      cartSubtotal < appliedDiscount.minOrderAmount
    ) {
      return 0;
    }
    if (appliedDiscount.type === 'percentage') {
      return Math.round((cartSubtotal * appliedDiscount.value) / 100);
    }
    if (appliedDiscount.type === 'fixed_amount') {
      return Math.min(cartSubtotal, appliedDiscount.value);
    }
    return 0;
  }, [appliedDiscount, cartSubtotal]);

  const applyDiscountCode = useCallback(
    async (code: string): Promise<{ valid: boolean; message: string }> => {
      const result = await validateDiscountCode(code, cartSubtotal);
      const safeDiscount = sanitizeDiscountState(result.discount);
      if (result.valid && safeDiscount) {
        setAppliedDiscount(safeDiscount);
        addToast({
          type: 'success',
          title: `Demo code ${safeDiscount.code} applied`,
          description: safeDiscount.description,
        });
        return { valid: true, message: result.message };
      }
      return { valid: false, message: result.message };
    },
    [cartSubtotal, addToast]
  );

  const removeDiscountCode = useCallback(() => {
    if (!appliedDiscount) return;
    const codeName = appliedDiscount.code;
    setAppliedDiscount(null);
    addToast({
      type: 'info',
      title: `Code ${codeName} removed`,
      description: 'Allocation privilege code has been removed.',
    });
  }, [appliedDiscount, addToast]);

  // Single authoritative source of truth for shipping cost based on selectedShippingMethod
  const shippingEstimateCost = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    if (appliedDiscount?.type === 'free_shipping') return 0;
    if (
      selectedShippingMethod.freeAboveSubtotal &&
      cartSubtotal >= selectedShippingMethod.freeAboveSubtotal
    ) {
      return 0;
    }
    return selectedShippingMethod.baseCost;
  }, [cartSubtotal, appliedDiscount, selectedShippingMethod]);

  // Tax placeholder architecture ready for backend tax engine (0 until external tax calculation is enabled)
  const taxAmount = useMemo(() => 0, []);

  // Single authoritative source of truth for cartTotal
  const cartTotal = useMemo(
    () =>
      Math.max(
        0,
        cartSubtotal - discountAmount + shippingEstimateCost + taxAmount
      ),
    [cartSubtotal, discountAmount, shippingEstimateCost, taxAmount]
  );

  const orderTotals = useMemo<OrderTotals>(
    () => ({
      subtotal: cartSubtotal,
      discountAmount,
      shippingCost: shippingEstimateCost,
      taxAmount,
      total: cartTotal,
      currency: 'USD',
    }),
    [cartSubtotal, discountAmount, shippingEstimateCost, taxAmount, cartTotal]
  );

  const freeShippingProgress = useMemo(
    () =>
      Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)),
    [cartSubtotal]
  );

  const amountUntilFreeShipping = useMemo(
    () => Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal),
    [cartSubtotal]
  );

  const value = useMemo(
    () => ({
      cart,
      isCartHydrated: isHydrated,
      cartCount,
      cartLineTotals,
      cartSubtotal,
      discountAmount,
      appliedDiscount,
      selectedShippingMethod,
      setSelectedShippingMethod,
      shippingEstimateCost,
      taxAmount,
      cartTotal,
      orderTotals,
      freeShippingProgress,
      amountUntilFreeShipping,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      syncCartItemFromValidation,
      moveToWishlist,
      clearCart,
      applyDiscountCode,
      removeDiscountCode,
      placedOrders,
      recordPlacedOrder,
      updatePlacedOrderStatus,
      getPlacedOrderById,
      wishlistIds,
      wishlistCount: wishlistIds.length,
      isInWishlist,
      toggleWishlist,
      removeWishlistItem,
      clearWishlist,
      pruneWishlistIds,
      recentlyViewedIds,
      recordProductView,
      isSearchOpen,
      setIsSearchOpen,
      quickViewProduct,
      setQuickViewProduct,
    }),
    [
      cart,
      isHydrated,
      cartCount,
      cartLineTotals,
      cartSubtotal,
      discountAmount,
      appliedDiscount,
      selectedShippingMethod,
      setSelectedShippingMethod,
      shippingEstimateCost,
      taxAmount,
      cartTotal,
      orderTotals,
      freeShippingProgress,
      amountUntilFreeShipping,
      isCartDrawerOpen,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      syncCartItemFromValidation,
      moveToWishlist,
      clearCart,
      applyDiscountCode,
      removeDiscountCode,
      placedOrders,
      recordPlacedOrder,
      updatePlacedOrderStatus,
      getPlacedOrderById,
      wishlistIds,
      isInWishlist,
      toggleWishlist,
      removeWishlistItem,
      clearWishlist,
      pruneWishlistIds,
      recentlyViewedIds,
      recordProductView,
      isSearchOpen,
      quickViewProduct,
    ]
  );

  return (
    <CommerceContext.Provider value={value}>
      {children}
    </CommerceContext.Provider>
  );
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
}
