'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  FINISH_FAMILIES,
  PRICE_PRESETS,
  SORT_OPTIONS,
  STOCK_STATUS_OPTIONS,
} from './shop-filter-utils';

/**
 * Localized labels for the static filter option tables in `shop-filter-utils`.
 * Falls back to the English fixture label whenever a translation key is missing.
 */
export function useShopFilterLabels() {
  const t = useTranslations('shop.filters');
  const pick = useCallback(
    (key: string, fallback: string) => (t.has(key) ? t(key) : fallback),
    [t]
  );

  return {
    sortLabel: (value: string) =>
      pick(`sort.${value}`, SORT_OPTIONS.find((o) => o.value === value)?.label ?? value),
    stockLabel: (value: string) =>
      pick(
        `stock.${value}`,
        STOCK_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
      ),
    priceTierLabel: (id: string) =>
      pick(`priceTiers.${id}`, PRICE_PRESETS.find((o) => o.id === id)?.label ?? id),
    colorFamilyLabel: (id: string) =>
      pick(`colorFamilies.${id}`, FINISH_FAMILIES.find((o) => o.id === id)?.label ?? id),
  };
}
