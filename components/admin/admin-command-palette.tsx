'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { ArrowUpRight, Search } from 'lucide-react';
import { Modal, Input, Badge, Skeleton, ErrorState, EmptyState } from '@/components/ui';
import { loadAdminProducts } from '@/lib/admin/actions';
import { browserDemoDiscountService } from '@/lib/admin/browser-discount-service';
import { useCommerce } from '@/lib/context/commerce-context';
import { deriveGuestClientLedger } from '@/lib/admin/derive';
import type { Discount, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { orderStatusLabel } from '@/lib/account/order-utils';

interface CommandHit {
  id: string;
  label: string;
  detail: string;
  kind: 'Order' | 'Product' | 'Guest contact' | 'Discount';
  href: string;
}

export function AdminCommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { placedOrders, isCartHydrated } = useCommerce();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadSearchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [nextProducts, nextDiscounts] = await Promise.all([
        loadAdminProducts(),
        browserDemoDiscountService.getDiscounts(),
      ]);
      setProducts(nextProducts);
      setDiscounts(nextDiscounts);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Local search data could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    void loadSearchData();
  }, [isOpen, loadSearchData]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus({ preventScroll: true });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const hits = useMemo<CommandHit[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    const matches = (value: string) => value.toLowerCase().includes(trimmed);
    const orderHits: CommandHit[] = placedOrders
      .filter((order) => [order.orderNumber, order.id, order.customerName, order.customerEmail]
        .some((value) => matches(value || '')))
      .map((order) => ({
        id: `order-${order.id}`,
        label: order.orderNumber,
        detail: `${order.customerName || 'Guest contact'} · ${formatPrice(order.total)} · ${orderStatusLabel(order.status)}`, 
        kind: 'Order',
        href: `/admin/orders/${encodeURIComponent(order.id)}`,
      }));
    const productHits: CommandHit[] = products
      .filter((product) => [product.name, product.sku, product.modelNumber, product.slug]
        .some((value) => matches(value || '')))
      .map((product) => ({
        id: `product-${product.id}`,
        label: product.name,
        detail: `${product.modelNumber} · ${product.status} · ${formatPrice(product.price)}`,
        kind: 'Product',
        href: `/admin/products/${encodeURIComponent(product.id)}`,
      }));
    const customerHits: CommandHit[] = deriveGuestClientLedger(placedOrders)
      .filter((entry) => [entry.name, entry.email ?? '', entry.id]
        .some((value) => matches(value)))
      .map((entry) => ({
        id: `guest-${entry.id}`,
        label: entry.name,
        detail: `${entry.email || 'Email not recorded'} · GUEST // ${entry.orderCount} local order${entry.orderCount === 1 ? '' : 's'}`,
        kind: 'Guest contact',
        href: `/admin/customers/${encodeURIComponent(entry.id)}`,
      }));
    const discountHits: CommandHit[] = discounts
      .filter((discount) => [discount.code, discount.description]
        .some((value) => matches(value || '')))
      .map((discount) => ({
        id: `discount-${discount.id}`,
        label: discount.code,
        detail: `${discount.type.replace('_', ' ')} · ${discount.status} · DEMO CODE`,
        kind: 'Discount',
        href: '/admin/discounts',
      }));
    return [...orderHits, ...productHits, ...customerHits, ...discountHits].slice(0, 30);
  }, [discounts, placedOrders, products, query]);

  const openHit = useCallback((hit: CommandHit) => {
    onClose();
    router.push(hit.href);
  }, [onClose, router]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && hits.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % hits.length);
    } else if (event.key === 'ArrowUp' && hits.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? hits.length - 1 : index - 1));
    } else if (event.key === 'Enter' && hits[activeIndex]) {
      event.preventDefault();
      openHit(hits[activeIndex]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Command Search"
      code="⌘K / CTRL+K // LOCAL RECORDS ONLY"
      size="lg"
      className="max-h-[88vh]"
    >
      <div className="space-y-4">
        <Input
          ref={searchInputRef}
          type="search"
          label="Search command records"
          placeholder="Order number, product, guest contact, discount code…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          leftElement={<Search className="h-4 w-4" aria-hidden="true" />}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={query.trim().length > 0}
          aria-controls="admin-command-results"
          aria-activedescendant={hits[activeIndex] ? `command-result-${activeIndex}` : undefined}
          autoComplete="off"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">
          <span>Orders // browser-local CommerceContext</span>
          <span>Catalog // server demo · codes // browser memory</span>
        </div>

        {isLoading && (
          <div role="status" aria-live="polite" className="space-y-3 border-y border-border py-4">
            <span className="sr-only">Loading command search index</span>
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        )}
        {!isLoading && loadError && (
          <ErrorState
            code="ERR // LOCAL SEARCH INDEX"
            title="Search records unavailable"
            description={loadError}
            onRetry={() => void loadSearchData()}
            retryLabel="Retry index"
            className="p-4 sm:p-5"
          />
        )}
        {!isLoading && !loadError && query.trim().length === 0 && (
          <div className="border-y border-border py-8 text-center">
            <p className="font-display text-lg text-foreground">Find an operational record.</p>
            <p className="mt-2 text-small text-foreground-muted">Orders are read only from this browser. No seeded customer or order archive is searched.</p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-subtle">↑ ↓ Navigate · Enter Open · Esc Close</p>
          </div>
        )}
        {!isLoading && !loadError && query.trim().length > 0 && hits.length === 0 && (
          <EmptyState
            code="SEARCH // 00 MATCHES"
            title="No local records found."
            description={isCartHydrated ? 'Try another order number, product identifier, guest contact, or discount code.' : 'The browser-local order archive is still loading. Try again in a moment.'}
            className="p-5"
          />
        )}
        {!isLoading && !loadError && hits.length > 0 && (
          <div id="admin-command-results" role="listbox" aria-label="Command search results" className="max-h-[45vh] overflow-y-auto border-y border-border">
            {hits.map((hit, index) => (
              <button
                key={hit.id}
                id={`command-result-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => openHit(hit)}
                className={`flex min-h-14 w-full items-center justify-between gap-3 border-b border-border px-3 py-3 text-start last:border-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-foreground ${index === activeIndex ? 'bg-surface-muted' : 'bg-background hover:bg-surface-muted/60'}`}
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="break-words font-display text-sm text-foreground">{hit.label}</span>
                    <Badge variant="outline">{hit.kind}</Badge>
                  </span>
                  <span className="mt-1 block break-words text-[10px] text-foreground-muted">{hit.detail}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-foreground-subtle" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
