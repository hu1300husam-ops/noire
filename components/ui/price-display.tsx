'use client';

import React from 'react';
import {
  cn,
  formatPrice,
  calculateDiscountPercentage,
} from '@/lib/utils';

export interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscountBadge?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  size = 'md',
  showDiscountBadge = false,
  className,
}: PriceDisplayProps) {
  const discount = calculateDiscountPercentage(price, compareAtPrice);

  const sizeMap = {
    sm: 'text-xs',
    md: 'text-price',
    lg: 'text-lg font-medium',
    xl: 'text-2xl font-medium tracking-tight',
  };

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-baseline gap-2.5 font-mono tabular-nums',
        className
      )}
    >
      <span className={cn('text-foreground', sizeMap[size])}>
        {formatPrice(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-xs text-foreground-subtle line-through">
          {formatPrice(compareAtPrice)}
        </span>
      )}
      {showDiscountBadge && discount && (
        <span className="rounded-xs border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-accent">
          -{discount}%
        </span>
      )}
    </div>
  );
}
