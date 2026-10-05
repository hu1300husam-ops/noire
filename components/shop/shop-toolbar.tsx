'use client';

import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  Columns,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import {
  SORT_OPTIONS,
  STOCK_STATUS_OPTIONS,
  FINISH_FAMILIES,
  countActiveFilters,
  type ShopFilterState,
  type ShopViewMode,
} from './shop-filter-utils';
import type { Category, Collection, SortOption, StockStatus } from '@/types';

interface ShopToolbarProps {
  filters: ShopFilterState;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onClearSearch: () => void;
  onSortChange: (sort: SortOption) => void;
  onViewChange: (view: ShopViewMode) => void;
  onOpenMobileFilters: () => void;
  isDesktopSidebarOpen: boolean;
  onToggleDesktopSidebar: () => void;
  totalMatching: number;
  visibleStart: number;
  visibleEnd: number;
  categories: Category[];
  collections: Collection[];
  onRemoveCategory: () => void;
  onRemoveCollection: () => void;
  onRemovePriceRange: () => void;
  onRemoveStockStatus: (status: StockStatus) => void;
  onRemoveColor: (colorId: string) => void;
  onClearAllFilters: () => void;
}

export function ShopToolbar({
  filters,
  searchInput,
  onSearchInputChange,
  onClearSearch,
  onSortChange,
  onViewChange,
  onOpenMobileFilters,
  isDesktopSidebarOpen,
  onToggleDesktopSidebar,
  totalMatching,
  visibleStart,
  visibleEnd,
  categories,
  collections,
  onRemoveCategory,
  onRemoveCollection,
  onRemovePriceRange,
  onRemoveStockStatus,
  onRemoveColor,
  onClearAllFilters,
}: ShopToolbarProps) {
  const activeFilterCount = countActiveFilters(filters);

  const activeCategoryName =
    filters.category === 'essentials'
      ? 'Essentials'
      : categories.find((c) => c.slug === filters.category)?.shortName ||
        filters.category;

  const activeCollectionTitle = collections.find(
    (c) => c.slug === filters.collection || c.id === filters.collection
  )?.title;

  return (
    <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md lg:top-20">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-8 md:px-12 lg:px-20">
        {/* Primary Controls Row */}
        <div className="flex flex-col gap-3 py-3.5 md:flex-row md:items-center md:justify-between">
          {/* Left: Filter Toggle + Live Search Input */}
          <div className="flex flex-1 items-center gap-2.5 sm:gap-3">
            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              onClick={onOpenMobileFilters}
              aria-label={`Open filter drawer${
                activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''
              }`}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 border px-3.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors lg:hidden',
                activeFilterCount > 0
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-surface text-foreground hover:border-foreground'
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-background/20 px-1.5 py-0.5 text-[10px] tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Sidebar Collapse/Expand Trigger */}
            <button
              type="button"
              onClick={onToggleDesktopSidebar}
              aria-expanded={isDesktopSidebarOpen}
              className="hidden h-10 shrink-0 items-center gap-2 border border-border bg-surface px-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground lg:inline-flex"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isDesktopSidebarOpen ? 'Hide Filters' : 'Show Filters'}</span>
              {activeFilterCount > 0 && (
                <span className="border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] tabular-nums text-accent">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Search Input */}
            <div className="relative flex-1 md:max-w-md">
              <label htmlFor="shop-catalog-search" className="sr-only">
                Search instruments by name, model code, material, or specification
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground-muted"
                aria-hidden="true"
              />
              <input
                id="shop-catalog-search"
                type="search"
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && searchInput) {
                    e.preventDefault();
                    onClearSearch();
                  }
                }}
                placeholder="Search name, NR-code, alloy, or spec..."
                className="h-10 w-full rounded-xs border border-border bg-surface pl-9 pr-9 font-sans text-small text-foreground placeholder:text-foreground-subtle transition-colors focus:border-foreground focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-foreground-muted transition-colors hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Result Count, View Density Switcher & Sort Select */}
          <div className="flex items-center justify-between gap-2 md:justify-end sm:gap-3">
            {/* Accessible Live Result Count */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted"
            >
              {totalMatching === 0 ? (
                <span>00 OBJECTS</span>
              ) : (
                <span>
                  <span className="hidden sm:inline">DISPLAYING </span>
                  <strong className="font-medium text-foreground">
                    {String(visibleStart).padStart(2, '0')}–
                    {String(visibleEnd).padStart(2, '0')}
                  </strong>{' '}
                  OF {String(totalMatching).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* View Mode Controls (Desktop & Tablet) */}
            <div
              role="group"
              aria-label="Catalog layout view"
              className="hidden items-center border border-border bg-surface sm:inline-flex"
            >
              <button
                type="button"
                aria-pressed={filters.view === 'editorial'}
                onClick={() => onViewChange('editorial')}
                title="Editorial Rhythm View (Featured Split + Grid)"
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 border-r border-border px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                  filters.view === 'editorial'
                    ? 'bg-foreground text-background'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                <span className="hidden xl:inline">Editorial</span>
              </button>

              <button
                type="button"
                aria-pressed={filters.view === 'grid-3'}
                onClick={() => onViewChange('grid-3')}
                title="3-Column Technical Grid"
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 border-r border-border px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                  filters.view === 'grid-3'
                    ? 'bg-foreground text-background'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden xl:inline">3-Col</span>
              </button>

              <button
                type="button"
                aria-pressed={filters.view === 'grid-2'}
                onClick={() => onViewChange('grid-2')}
                title="2-Column Gallery Plates"
                className={cn(
                  'inline-flex h-10 items-center gap-1.5 px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
                  filters.view === 'grid-2'
                    ? 'bg-foreground text-background'
                    : 'text-foreground-muted hover:text-foreground'
                )}
              >
                <Columns className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden xl:inline">2-Col</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="shop-sort-select"
                className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle sm:inline"
              >
                Sort:
              </label>
              <select
                id="shop-sort-select"
                value={filters.sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sort products by"
                className="h-10 max-w-[180px] truncate rounded-xs border border-border bg-surface px-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-foreground transition-colors focus:border-foreground focus:outline-none sm:max-w-none sm:px-3 sm:tracking-[0.12em]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div
            aria-label="Active catalog filters"
            className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 py-2.5"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                ACTIVE PARAMETERS:
              </span>

              {/* Category Chip */}
              {filters.category !== 'all' && (
                <button
                  type="button"
                  onClick={onRemoveCategory}
                  aria-label={`Remove category filter: ${activeCategoryName}`}
                  className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
                >
                  <span className="text-foreground-subtle">Discipline:</span>
                  <span>{activeCategoryName}</span>
                  <X className="h-3 w-3 text-accent" aria-hidden="true" />
                </button>
              )}

              {/* Collection Chip */}
              {filters.collection && (
                <button
                  type="button"
                  onClick={onRemoveCollection}
                  aria-label={`Remove collection filter: ${
                    activeCollectionTitle || filters.collection
                  }`}
                  className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
                >
                  <span className="text-foreground-subtle">Edition:</span>
                  <span>{activeCollectionTitle || filters.collection}</span>
                  <X className="h-3 w-3 text-accent" aria-hidden="true" />
                </button>
              )}

              {/* Search Query Chip */}
              {filters.query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={onClearSearch}
                  aria-label={`Remove search query: ${filters.query}`}
                  className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
                >
                  <span className="text-foreground-subtle">Query:</span>
                  <span>&ldquo;{filters.query}&rdquo;</span>
                  <X className="h-3 w-3 text-accent" aria-hidden="true" />
                </button>
              )}

              {/* Price Range Chip */}
              {(filters.minPrice !== null || filters.maxPrice !== null) && (
                <button
                  type="button"
                  onClick={onRemovePriceRange}
                  aria-label="Remove price filter"
                  className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
                >
                  <span className="text-foreground-subtle">Price:</span>
                  <span>
                    {filters.minPrice !== null
                      ? formatPrice(filters.minPrice)
                      : '$0'}{' '}
                    –{' '}
                    {filters.maxPrice !== null
                      ? formatPrice(filters.maxPrice)
                      : 'Max'}
                  </span>
                  <X className="h-3 w-3 text-accent" aria-hidden="true" />
                </button>
              )}

              {/* Stock Status Chips */}
              {filters.stockStatus.map((status) => {
                const label =
                  STOCK_STATUS_OPTIONS.find((s) => s.value === status)?.label ||
                  status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onRemoveStockStatus(status)}
                    aria-label={`Remove availability filter: ${label}`}
                    className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
                  >
                    <span className="text-foreground-subtle">Status:</span>
                    <span>{label.split(' — ')[0]}</span>
                    <X className="h-3 w-3 text-accent" aria-hidden="true" />
                  </button>
                );
              })}

              {/* Finish / Color Chips */}
              {filters.colors.map((colorId) => {
                const family = FINISH_FAMILIES.find((f) => f.id === colorId);
                return (
                  <button
                    key={colorId}
                    type="button"
                    onClick={() => onRemoveColor(colorId)}
                    aria-label={`Remove finish filter: ${
                      family?.label || colorId
                    }`}
                    className="inline-flex items-center gap-1.5 border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-foreground"
                  >
                    {family && (
                      <span
                        className="h-2 w-2 rounded-full border border-border"
                        style={{ backgroundColor: family.hex }}
                      />
                    )}
                    <span>{family?.label || colorId}</span>
                    <X className="h-3 w-3 text-accent" aria-hidden="true" />
                  </button>
                );
              })}

            </div>

            {/* Clear All Filters Action */}
            <button
              type="button"
              onClick={onClearAllFilters}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground underline underline-offset-4 transition-colors hover:text-accent"
            >
              <RotateCcw className="h-3 w-3 text-accent" aria-hidden="true" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
