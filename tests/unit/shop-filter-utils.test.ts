import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SHOP_FILTERS,
  countActiveFilters,
  filterAndSortProducts,
  normalizeCategoryParam,
  isEssentialProduct,
  PRICE_PRESETS,
  FINISH_FAMILIES,
  SORT_OPTIONS,
  STOCK_STATUS_OPTIONS,
} from '@/components/shop/shop-filter-utils';
import { MOCK_PRODUCTS } from '@/lib/data';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

const activeProducts = MOCK_PRODUCTS.filter((p) => p.status === 'active');

describe('normalizeCategoryParam', () => {
  it('maps aliases to canonical category slugs', () => {
    expect(normalizeCategoryParam('desk')).toBe('desk-architecture');
    expect(normalizeCategoryParam('TACTILE')).toBe('tactile-input');
    expect(normalizeCategoryParam(' travel ')).toBe('travel-carry');
    expect(normalizeCategoryParam('essentials')).toBe('essentials');
  });

  it('falls back to "all" for unknown input', () => {
    expect(normalizeCategoryParam(undefined)).toBe('all');
    expect(normalizeCategoryParam('unknown')).toBe('all');
  });
});

describe('filterAndSortProducts', () => {
  it('returns every active product with the default filter state', () => {
    const result = filterAndSortProducts(activeProducts, DEFAULT_SHOP_FILTERS);
    expect(result.length).toBe(activeProducts.length);
  });

  it('respects price bounds', () => {
    const result = filterAndSortProducts(activeProducts, {
      ...DEFAULT_SHOP_FILTERS,
      minPrice: 350,
      maxPrice: 700,
    });
    expect(result.length).toBeGreaterThan(0);
    for (const product of result) {
      expect(product.price).toBeGreaterThanOrEqual(350);
      expect(product.price).toBeLessThanOrEqual(700);
    }
  });

  it('sorts ascending and descending by price', () => {
    const asc = filterAndSortProducts(activeProducts, { ...DEFAULT_SHOP_FILTERS, sort: 'price-asc' });
    const desc = filterAndSortProducts(activeProducts, { ...DEFAULT_SHOP_FILTERS, sort: 'price-desc' });
    expect(asc.map((p) => p.price)).toEqual([...asc.map((p) => p.price)].sort((a, b) => a - b));
    expect(desc.map((p) => p.price)).toEqual([...desc.map((p) => p.price)].sort((a, b) => b - a));
  });

  it('filters by free-text query', () => {
    const target = activeProducts[0];
    const result = filterAndSortProducts(activeProducts, {
      ...DEFAULT_SHOP_FILTERS,
      query: target.name.split(' ')[0],
    });
    expect(result.some((p) => p.id === target.id)).toBe(true);
  });

  it('limits the essentials curation to products under $400', () => {
    const result = filterAndSortProducts(activeProducts, { ...DEFAULT_SHOP_FILTERS, category: 'essentials' });
    for (const product of result) {
      expect(isEssentialProduct(product)).toBe(true);
      expect(product.price).toBeLessThan(400);
    }
  });
});

describe('countActiveFilters', () => {
  it('counts zero for defaults and one per active dimension', () => {
    expect(countActiveFilters(DEFAULT_SHOP_FILTERS)).toBe(0);
    expect(
      countActiveFilters({
        ...DEFAULT_SHOP_FILTERS,
        category: 'audio',
        query: 'alloy',
        colors: ['Obsidian'],
      })
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('filter option translations', () => {
  const filters = (ar as { shop: { filters: Record<string, Record<string, string>> } }).shop.filters;

  it('has an Arabic label for every static filter option', () => {
    for (const option of SORT_OPTIONS) expect(filters.sort[option.value]).toBeTruthy();
    for (const option of STOCK_STATUS_OPTIONS) expect(filters.stock[option.value]).toBeTruthy();
    for (const preset of PRICE_PRESETS) expect(filters.priceTiers[preset.id]).toBeTruthy();
    for (const family of FINISH_FAMILIES) expect(filters.colorFamilies[family.id]).toBeTruthy();
  });

  it('keeps en.json filters empty so English falls back to source labels', () => {
    expect((en as { shop: { filters: Record<string, unknown> } }).shop.filters).toEqual({});
  });
});
