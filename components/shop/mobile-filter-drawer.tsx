'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useShopFilterLabels } from './use-shop-filter-labels';
import { RotateCcw, Check, X } from 'lucide-react';
import { Drawer, Button, Checkbox } from '@/components/ui';
import { cn, formatPrice } from '@/lib/utils';
import {
  PRICE_PRESETS,
  FINISH_FAMILIES,
  STOCK_STATUS_OPTIONS,
  DEFAULT_SHOP_FILTERS,
  filterAndSortProducts,
  countActiveFilters,
  type ShopFilterState,
  type ShopCategoryFilter,
} from './shop-filter-utils';
import type { Category, Collection, Product, StockStatus } from '@/types';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: ShopFilterState;
  onApplyFilters: (nextFilters: ShopFilterState) => void;
  categories: Category[];
  collections: Collection[];
  allProducts: Product[];
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  currentFilters,
  onApplyFilters,
  categories,
  collections,
  allProducts,
}: MobileFilterDrawerProps) {
  const t = useTranslations('shop.sidebar');
  const { priceTierLabel, stockLabel, colorFamilyLabel } = useShopFilterLabels();
  // Staged state initialized from currentFilters whenever the drawer opens
  const [staged, setStaged] = useState<ShopFilterState>(currentFilters);
  const [minPriceText, setMinPriceText] = useState<string>(
    currentFilters.minPrice !== null ? String(currentFilters.minPrice) : ''
  );
  const [maxPriceText, setMaxPriceText] = useState<string>(
    currentFilters.maxPrice !== null ? String(currentFilters.maxPrice) : ''
  );

  // Start each open session from applied filters; dismissed staged changes are discarded.
  useEffect(() => {
    if (!isOpen) return;

    setStaged(currentFilters);
    setMinPriceText(
      currentFilters.minPrice !== null ? String(currentFilters.minPrice) : ''
    );
    setMaxPriceText(
      currentFilters.maxPrice !== null ? String(currentFilters.maxPrice) : ''
    );
  }, [currentFilters, isOpen]);

  // Live preview count of matching products for the staged filter selections
  const stagedMatchingCount = useMemo(() => {
    return filterAndSortProducts(allProducts, staged, collections).length;
  }, [allProducts, staged, collections]);

  const stagedActiveCount = countActiveFilters(staged);

  const handleCategorySelect = (category: ShopCategoryFilter) => {
    setStaged((prev) => ({
      ...prev,
      category: prev.category === category ? 'all' : category,
      page: 1,
    }));
  };

  const handlePricePreset = (min: number | null, max: number | null) => {
    setMinPriceText(min !== null ? String(min) : '');
    setMaxPriceText(max !== null ? String(max) : '');
    setStaged((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
      page: 1,
    }));
  };

  const handlePriceInputBlur = () => {
    const parsedMin = minPriceText.trim() !== '' ? Number(minPriceText) : null;
    const parsedMax = maxPriceText.trim() !== '' ? Number(maxPriceText) : null;
    const validMin =
      parsedMin !== null && !Number.isNaN(parsedMin) && parsedMin >= 0
        ? parsedMin
        : null;
    const validMax =
      parsedMax !== null && !Number.isNaN(parsedMax) && parsedMax >= 0
        ? parsedMax
        : null;

    setStaged((prev) => ({
      ...prev,
      minPrice:
        validMin !== null && validMax !== null && validMin > validMax
          ? validMax
          : validMin,
      maxPrice:
        validMin !== null && validMax !== null && validMin > validMax
          ? validMin
          : validMax,
      page: 1,
    }));
  };

  const handleToggleStock = (status: StockStatus) => {
    setStaged((prev) => {
      const exists = prev.stockStatus.includes(status);
      return {
        ...prev,
        stockStatus: exists
          ? prev.stockStatus.filter((s) => s !== status)
          : [...prev.stockStatus, status],
        page: 1,
      };
    });
  };

  const handleToggleColor = (colorId: string) => {
    setStaged((prev) => {
      const exists = prev.colors.includes(colorId);
      return {
        ...prev,
        colors: exists
          ? prev.colors.filter((c) => c !== colorId)
          : [...prev.colors, colorId],
        page: 1,
      };
    });
  };

  const handleResetStaged = () => {
    const resetState: ShopFilterState = {
      ...DEFAULT_SHOP_FILTERS,
      sort: staged.sort,
      view: staged.view,
      limit: staged.limit,
    };
    setStaged(resetState);
    setMinPriceText('');
    setMaxPriceText('');
  };

  const handleApply = () => {
    onApplyFilters({ ...staged, page: 1 });
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="left"
      size="md"
      subtitle={t('drawerSubtitle', { count: stagedActiveCount })}
      title={t('drawerTitle')}
      footer={
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
            <span>{t('matching')}</span>
            <span className="font-medium text-foreground">
              [{String(stagedMatchingCount).padStart(2, '0')} OBJECTS]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={handleResetStaged}
            >
              {t('resetAll')}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleApply}
            >
              {t('apply', { count: stagedMatchingCount })}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-7 pb-4">
        {/* Active Staged Summary Pills */}
        {stagedActiveCount > 0 && (
          <div className="space-y-2.5 border border-border bg-surface-muted/60 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                SELECTED PARAMETERS ({stagedActiveCount})
              </span>
              <button
                type="button"
                onClick={handleResetStaged}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground underline underline-offset-4"
              >
                {t('clearAll')}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {staged.category !== 'all' && (
                <button
                  type="button"
                  onClick={() =>
                    setStaged((p) => ({ ...p, category: 'all' }))
                  }
                  className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase text-foreground"
                >
                  <span>{staged.category}</span>
                  <X className="h-3 w-3 text-accent" />
                </button>
              )}

              {staged.collection && (
                <button
                  type="button"
                  onClick={() =>
                    setStaged((p) => ({ ...p, collection: '' }))
                  }
                  className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase text-foreground"
                >
                  <span>{staged.collection}</span>
                  <X className="h-3 w-3 text-accent" />
                </button>
              )}

              {(staged.minPrice !== null || staged.maxPrice !== null) && (
                <button
                  type="button"
                  onClick={() => handlePricePreset(null, null)}
                  className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase text-foreground"
                >
                  <span>
                    {staged.minPrice ? formatPrice(staged.minPrice) : '$0'}–
                    {staged.maxPrice ? formatPrice(staged.maxPrice) : 'Max'}
                  </span>
                  <X className="h-3 w-3 text-accent" />
                </button>
              )}

              {staged.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleToggleColor(c)}
                  className="inline-flex items-center gap-1 border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase text-foreground"
                >
                  <span>{c}</span>
                  <X className="h-3 w-3 text-accent" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 01. Touch-Optimized Discipline Tiles */}
        <div className="space-y-3 border-b border-border pb-6">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('discipline')}
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={staged.category === 'all'}
              onClick={() =>
                setStaged((p) => ({ ...p, category: 'all', page: 1 }))
              }
              className={cn(
                'flex flex-col justify-between border p-3 text-start transition-colors',
                staged.category === 'all'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-surface text-foreground'
              )}
            >
              <span className="font-mono text-[10px] uppercase opacity-70">
                {t('allCode')}
              </span>
              <span className="mt-1 font-display text-sm font-medium">
                {t('allInstruments')}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = staged.category === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={cn(
                    'flex flex-col justify-between border p-3 text-start transition-colors',
                    isSelected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-surface text-foreground'
                  )}
                >
                  <span className="font-mono text-[10px] uppercase opacity-70">
                    {cat.indexNumber} {'//'} [{cat.productCount}]
                  </span>
                  <span className="mt-1 font-display text-sm font-medium">
                    {cat.shortName}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              aria-pressed={staged.category === 'essentials'}
              onClick={() => handleCategorySelect('essentials')}
              className={cn(
                'flex flex-col justify-between border p-3 text-start transition-colors',
                staged.category === 'essentials'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-surface text-foreground'
              )}
            >
              <span className="font-mono text-[10px] uppercase opacity-70">
                {t('curatedCode')}
              </span>
              <span className="mt-1 font-display text-sm font-medium">
                {t('essentials')}
              </span>
            </button>
          </div>
        </div>

        {/* 02. Price Allocation */}
        <div className="space-y-3 border-b border-border pb-6">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('price')}
          </span>

          <div className="grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset) => {
              const isSelected =
                staged.minPrice === preset.min &&
                staged.maxPrice === preset.max;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handlePricePreset(preset.min, preset.max)}
                  className={cn(
                    'border px-3 py-2.5 text-start font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                    isSelected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-surface text-foreground'
                  )}
                >
                  {priceTierLabel(preset.id)}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div>
              <label
                htmlFor="mobile-min-price"
                className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-subtle"
              >
                {t('min')}
              </label>
              <input
                id="mobile-min-price"
                type="number"
                min={0}
                placeholder="115"
                value={minPriceText}
                onChange={(e) => setMinPriceText(e.target.value)}
                onBlur={handlePriceInputBlur}
                className="h-10 w-full rounded-xs border border-border bg-surface px-3 font-mono text-xs text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="mobile-max-price"
                className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-subtle"
              >
                {t('max')}
              </label>
              <input
                id="mobile-max-price"
                type="number"
                min={0}
                placeholder="1650"
                value={maxPriceText}
                onChange={(e) => setMaxPriceText(e.target.value)}
                onBlur={handlePriceInputBlur}
                className="h-10 w-full rounded-xs border border-border bg-surface px-3 font-mono text-xs text-foreground"
              />
            </div>
          </div>
        </div>

        {/* 03. Finish & Metallurgy */}
        <div className="space-y-3 border-b border-border pb-6">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('finishMobile')}
          </span>

          <div className="grid grid-cols-2 gap-2">
            {FINISH_FAMILIES.map((family) => {
              const isSelected = staged.colors.includes(family.id);
              return (
                <button
                  key={family.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggleColor(family.id)}
                  className={cn(
                    'flex items-center justify-between border p-3 text-start transition-colors',
                    isSelected
                      ? 'border-foreground bg-surface-muted text-foreground'
                      : 'border-border bg-surface text-foreground-muted'
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/20"
                      style={{ backgroundColor: family.hex }}
                    />
                    <span className="truncate text-caption font-medium text-foreground">
                      {colorFamilyLabel(family.id)}
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 04. Availability */}
        <div className="space-y-3 border-b border-border pb-6">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('availabilityMobile')}
          </span>

          <div className="space-y-3">
            {STOCK_STATUS_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.value}
                checked={staged.stockStatus.includes(opt.value)}
                onChange={() => handleToggleStock(opt.value)}
                label={stockLabel(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* 05. Editions */}
        <div className="space-y-3">
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('editions')}
          </span>

          <div className="space-y-2">
            {collections.map((col) => {
              const isSelected = staged.collection === col.slug;
              return (
                <button
                  key={col.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setStaged((p) => ({
                      ...p,
                      collection: isSelected ? '' : col.slug,
                      page: 1,
                    }))
                  }
                  className={cn(
                    'flex w-full items-center justify-between border p-3 text-start transition-colors',
                    isSelected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-surface text-foreground'
                  )}
                >
                  <div>
                    <span className="block font-mono text-[9px] uppercase opacity-70">
                      {col.code}
                    </span>
                    <span className="font-display text-sm font-medium">
                      {col.title}
                    </span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
