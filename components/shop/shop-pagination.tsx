'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  visibleStart: number;
  visibleEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ShopPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  visibleStart,
  visibleEnd,
  onPageChange,
  onPageSizeChange,
}: ShopPaginationProps) {
  if (totalItems === 0) return null;

  const progressPercentage = Math.min(
    100,
    Math.round((visibleEnd / totalItems) * 100)
  );

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <nav
      aria-label="Catalog pagination"
      className="mt-12 border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left: Progress Telemetry & Page Size Selector */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
            <span>
              ARCHIVE PAGE {String(currentPage).padStart(2, '0')} OF{' '}
              {String(totalPages).padStart(2, '0')}
            </span>
            <span className="text-foreground-subtle">•</span>
            <span className="text-foreground-muted">
              OBJECTS {String(visibleStart).padStart(2, '0')}–
              {String(visibleEnd).padStart(2, '0')} OF{' '}
              {String(totalItems).padStart(2, '0')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full max-w-xs overflow-hidden bg-surface-muted">
            <div
              className="h-full bg-foreground transition-all duration-300 ease-noire-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Center/Right: Page Size Toggle + Page Number Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
          {/* Page Density Selector */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
            <span className="text-foreground-subtle">Per Page:</span>
            {[8, 12].map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={pageSize === size}
                onClick={() => onPageSizeChange(size)}
                className={cn(
                  'border px-2.5 py-1.5 tabular-nums transition-colors',
                  pageSize === size
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-foreground-muted hover:border-foreground'
                )}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Page Navigation Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Previous page"
                className="inline-flex h-10 items-center gap-1.5 border border-border bg-background px-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {pages.map((page) => {
                const isCurrent = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    aria-current={isCurrent ? 'page' : undefined}
                    aria-label={`Page ${page}`}
                    onClick={() => onPageChange(page)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center border font-mono text-xs tabular-nums transition-colors',
                      isCurrent
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground-muted hover:border-foreground hover:text-foreground'
                    )}
                  >
                    {String(page).padStart(2, '0')}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Next page"
                className="inline-flex h-10 items-center gap-1.5 border border-border bg-background px-3.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
