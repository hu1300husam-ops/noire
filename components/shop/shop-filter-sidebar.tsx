'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useShopFilterLabels } from './use-shop-filter-labels';
import { RotateCcw, Check } from 'lucide-react';
import { Checkbox, TechnicalCode } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  PRICE_PRESETS,
  FINISH_FAMILIES,
  STOCK_STATUS_OPTIONS,
  countActiveFilters,
  isEssentialProduct,
  productMatchesColors,
  type ShopFilterState,
  type ShopCategoryFilter,
} from './shop-filter-utils';
import type { Category, Collection, Product, StockStatus } from '@/types';

interface ShopFilterSidebarProps {
  filters: ShopFilterState;
  categories: Category[];
  collections: Collection[];
  allProducts: Product[];
  onCategoryChange: (category: ShopCategoryFilter) => void;
  onCollectionChange: (collectionSlug: string) => void;
  onPriceRangeChange: (min: number | null, max: number | null) => void;
  onToggleStockStatus: (status: StockStatus) => void;
  onToggleColor: (colorId: string) => void;
  onClearAll: () => void;
}

export function ShopFilterSidebar({
  filters,
  categories,
  collections,
  allProducts,
  onCategoryChange,
  onCollectionChange,
  onPriceRangeChange,
  onToggleStockStatus,
  onToggleColor,
  onClearAll,
}: ShopFilterSidebarProps) {
  const t = useTranslations('shop.sidebar');
  const { priceTierLabel, stockLabel, colorFamilyLabel } = useShopFilterLabels();
  const activeCount = countActiveFilters(filters);

  const [minPriceInput, setMinPriceInput] = useState<string>(
    filters.minPrice !== null ? String(filters.minPrice) : ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    filters.maxPrice !== null ? String(filters.maxPrice) : ''
  );

  useEffect(() => {
    setMinPriceInput(filters.minPrice !== null ? String(filters.minPrice) : '');
    setMaxPriceInput(filters.maxPrice !== null ? String(filters.maxPrice) : '');
  }, [filters.minPrice, filters.maxPrice]);

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMin =
      minPriceInput.trim() !== '' ? Number(minPriceInput) : null;
    const parsedMax =
      maxPriceInput.trim() !== '' ? Number(maxPriceInput) : null;

    const validMin =
      parsedMin !== null && !Number.isNaN(parsedMin) && parsedMin >= 0
        ? parsedMin
        : null;
    const validMax =
      parsedMax !== null && !Number.isNaN(parsedMax) && parsedMax >= 0
        ? parsedMax
        : null;

    if (validMin !== null && validMax !== null && validMin > validMax) {
      onPriceRangeChange(validMax, validMin);
    } else {
      onPriceRangeChange(validMin, validMax);
    }
  };

  // Facet counts computed from active catalog
  const activeCatalog = allProducts.filter((p) => p.status === 'active');
  const essentialsCount = activeCatalog.filter(isEssentialProduct).length;

  return (
    <aside
      aria-label={t('aria')}
      className="space-y-7 border border-border bg-surface p-5 sm:p-6"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <TechnicalCode className="block">{t('archiveParameters')}</TechnicalCode>
          <h2 className="mt-0.5 font-display text-base font-medium tracking-tight text-foreground">
            {t('title')}
          </h2>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-opacity hover:opacity-80"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>{t('reset', { count: activeCount })}</span>
          </button>
        )}
      </div>

      {/* 01. Category / Discipline Filter */}
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('discipline')}
          </span>
          {filters.category !== 'all' && (
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted underline underline-offset-4 hover:text-foreground"
            >
              {t('clear')}
            </button>
          )}
        </div>

        <div className="space-y-1">
          <button
            type="button"
            aria-pressed={filters.category === 'all'}
            onClick={() => onCategoryChange('all')}
            className={cn(
              'flex w-full items-center justify-between px-2.5 py-2 text-start text-small transition-colors',
              filters.category === 'all'
                ? 'bg-foreground font-medium text-background'
                : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground'
            )}
          >
            <span>{t('allDisciplines')}</span>
            <span className="font-mono text-[11px] tabular-nums opacity-75">
              [{String(activeCatalog.length).padStart(2, '0')}]
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  onCategoryChange(isSelected ? 'all' : cat.slug)
                }
                className={cn(
                  'flex w-full items-center justify-between px-2.5 py-2 text-start text-small transition-colors',
                  isSelected
                    ? 'bg-foreground font-medium text-background'
                    : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground'
                )}
              >
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] opacity-60">
                    {cat.indexNumber}
                  </span>
                  <span>{cat.name}</span>
                </span>
                <span className="font-mono text-[11px] tabular-nums opacity-75">
                  [{String(cat.productCount).padStart(2, '0')}]
                </span>
              </button>
            );
          })}

          <button
            type="button"
            aria-pressed={filters.category === 'essentials'}
            onClick={() =>
              onCategoryChange(
                filters.category === 'essentials' ? 'all' : 'essentials'
              )
            }
            className={cn(
              'flex w-full items-center justify-between px-2.5 py-2 text-start text-small transition-colors',
              filters.category === 'essentials'
                ? 'bg-foreground font-medium text-background'
                : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground'
            )}
          >
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] opacity-60">07</span>
              <span>{t('essentials')}</span>
            </span>
            <span className="font-mono text-[11px] tabular-nums opacity-75">
              [{String(essentialsCount).padStart(2, '0')}]
            </span>
          </button>
        </div>
      </div>

      {/* 02. Price Range Filter */}
      <div className="space-y-3.5 border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('price')}
          </span>
          {(filters.minPrice !== null || filters.maxPrice !== null) && (
            <button
              type="button"
              onClick={() => onPriceRangeChange(null, null)}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted underline underline-offset-4 hover:text-foreground"
            >
              {t('clear')}
            </button>
          )}
        </div>

        {/* Preset Price Brackets */}
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_PRESETS.map((preset) => {
            const isSelected =
              filters.minPrice === preset.min &&
              filters.maxPrice === preset.max;
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onPriceRangeChange(preset.min, preset.max)}
                className={cn(
                  'border px-2.5 py-2 text-start font-mono text-[10px] uppercase tracking-[0.1em] transition-colors',
                  isSelected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground-muted hover:border-foreground/50 hover:text-foreground'
                )}
              >
                {priceTierLabel(preset.id)}
              </button>
            );
          })}
        </div>

        {/* Custom Numeric Min / Max Inputs */}
        <form onSubmit={handleApplyCustomPrice} className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="sidebar-min-price"
                className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-subtle"
              >
                {t('min')}
              </label>
              <input
                id="sidebar-min-price"
                type="number"
                min={0}
                max={5000}
                placeholder="115"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="h-9 w-full rounded-xs border border-border bg-background px-2.5 font-mono text-xs text-foreground focus:border-foreground focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="sidebar-max-price"
                className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-foreground-subtle"
              >
                {t('max')}
              </label>
              <input
                id="sidebar-max-price"
                type="number"
                min={0}
                max={5000}
                placeholder="1650"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="h-9 w-full rounded-xs border border-border bg-background px-2.5 font-mono text-xs text-foreground focus:border-foreground focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full border border-border bg-surface-muted py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
          >
            {t('applyPrice')}
          </button>
        </form>
      </div>

      {/* 03. Availability / Stock Status */}
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('availability')}
          </span>
          {filters.stockStatus.length > 0 && (
            <button
              type="button"
              onClick={() =>
                filters.stockStatus.forEach((s) => onToggleStockStatus(s))
              }
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted underline underline-offset-4 hover:text-foreground"
            >
              {t('clear')}
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {STOCK_STATUS_OPTIONS.map((opt) => {
            const count = activeCatalog.filter(
              (p) => p.stockStatus === opt.value
            ).length;
            const isChecked = filters.stockStatus.includes(opt.value);
            return (
              <Checkbox
                key={opt.value}
                checked={isChecked}
                onChange={() => onToggleStockStatus(opt.value)}
                label={stockLabel(opt.value)}
                count={count}
              />
            );
          })}
        </div>
      </div>

      {/* 04. Finish & Metallurgy */}
      <div className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('finish')}
          </span>
          {filters.colors.length > 0 && (
            <button
              type="button"
              onClick={() => filters.colors.forEach((c) => onToggleColor(c))}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted underline underline-offset-4 hover:text-foreground"
            >
              {t('clear')}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {FINISH_FAMILIES.map((family) => {
            const isSelected = filters.colors.includes(family.id);
            const count = activeCatalog.filter((p) =>
              productMatchesColors(p, [family.id])
            ).length;

            return (
              <button
                key={family.id}
                type="button"
                onClick={() => onToggleColor(family.id)}
                aria-pressed={isSelected}
                className={cn(
                  'flex w-full items-center justify-between border px-3 py-2 text-start transition-colors',
                  isSelected
                    ? 'border-foreground bg-background text-foreground'
                    : 'border-border/70 bg-surface text-foreground-muted hover:border-foreground/50 hover:text-foreground'
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/20 dark:border-white/25"
                    style={{ backgroundColor: family.hex }}
                  />
                  <span className="text-small">{colorFamilyLabel(family.id)}</span>
                </span>

                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] tabular-nums text-foreground-subtle">
                    [{count}]
                  </span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 05. Curated Editions / Collections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
            {t('editions')}
          </span>
          {filters.collection && (
            <button
              type="button"
              onClick={() => onCollectionChange('')}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted underline underline-offset-4 hover:text-foreground"
            >
              {t('clear')}
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {collections.map((col) => {
            const isSelected =
              filters.collection === col.slug || filters.collection === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() =>
                  onCollectionChange(isSelected ? '' : col.slug)
                }
                aria-pressed={isSelected}
                className={cn(
                  'flex w-full items-center justify-between border px-3 py-2.5 text-start transition-colors',
                  isSelected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground-muted hover:border-foreground/50 hover:text-foreground'
                )}
              >
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.14em] opacity-70">
                    {col.code}
                  </span>
                  <span className="font-display text-small font-medium">
                    {col.title}
                  </span>
                </div>
                <span className="font-mono text-[11px] tabular-nums opacity-75">
                  [{col.productIds.length}]
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
