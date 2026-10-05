'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import {
  ProductBadge,
  StockStatusIndicator,
  PriceDisplay,
  ColorSwatchGroup,
  Button,
  TechnicalCode,
} from '@/components/ui';
import { useCommerce } from '@/lib/context/commerce-context';
import { cn } from '@/lib/utils';
import type { Product, ProductColorVariant } from '@/types';

export interface ProductCardProps {
  product: Product;
  indexLabel?: string;
  variant?: 'default' | 'large-split' | 'minimal';
  aspect?: 'portrait' | 'square' | 'landscape';
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  indexLabel,
  variant = 'default',
  aspect = 'portrait',
  priority = false,
  className,
}: ProductCardProps) {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
  } = useCommerce();

  const [selectedColor, setSelectedColor] = useState<ProductColorVariant>(
    product.colors[0]
  );
  const [isHovered, setIsHovered] = useState(false);

  const saved = isInWishlist(product.id);

  const activePrimaryImage = selectedColor?.image || product.primaryImage;
  const activeSecondaryImage =
    selectedColor?.secondaryImage ||
    product.secondaryImage ||
    activePrimaryImage;

  const aspectClasses = {
    portrait: 'aspect-[4/5]',
    square: 'aspect-square',
    landscape: 'aspect-[16/10]',
  };

  // 1. LARGE EDITORIAL SPLIT VARIANT (Used for Hero Showcase Positions 01 & 04)
  if (variant === 'large-split') {
    return (
      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'group grid grid-cols-1 border border-border bg-surface lg:grid-cols-12',
          className
        )}
      >
        {/* Left 7 Columns: Large Image Stage with Hover Swap */}
        <div className="relative overflow-hidden border-b border-border bg-surface-muted lg:col-span-7 lg:border-b-0 lg:border-r">
          <Link
            href={`/product/${product.slug}`}
            aria-label={`View ${product.name}`}
            className="block aspect-[16/11] h-full w-full overflow-hidden"
          >
            <img
              src={activePrimaryImage}
              alt={`${product.name} in ${selectedColor.name}`}
              loading={priority ? 'eager' : 'lazy'}
              className={cn(
                'h-full w-full object-cover transition-all duration-700 ease-noire-out',
                isHovered && activeSecondaryImage !== activePrimaryImage
                  ? 'scale-105 opacity-0'
                  : 'scale-100 opacity-100'
              )}
            />
            {activeSecondaryImage !== activePrimaryImage && (
              <img
                src={activeSecondaryImage}
                alt={`${product.name} alternate view`}
                loading="lazy"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-noire-out',
                  isHovered ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                )}
              />
            )}
          </Link>

          {/* Top Overlay Metadata & Badges */}
          <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-start justify-between gap-2 sm:left-6 sm:right-6 sm:top-6">
            <div className="flex flex-wrap items-center gap-2">
              {indexLabel && (
                <span className="border border-border bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                  {indexLabel}
                </span>
              )}
              <ProductBadge
                type={product.badge}
                label={product.badgeLabel}
              />
            </div>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={
                saved
                  ? `Remove ${product.name} from wishlist`
                  : `Save ${product.name} to wishlist`
              }
              className={cn(
                'pointer-events-auto flex h-9 w-9 items-center justify-center border transition-colors duration-250',
                saved
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background/90 text-foreground hover:border-foreground'
              )}
            >
              <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
            </button>
          </div>
        </div>

        {/* Right 5 Columns: Architectural Dossier */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 lg:p-10">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <TechnicalCode>{product.modelNumber}</TechnicalCode>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                {product.categoryName}
              </span>
              <Link
                href={`/product/${product.slug}`}
                className="block font-display text-h3 tracking-tight text-foreground transition-colors hover:text-accent"
              >
                {product.name}
              </Link>
              <p className="text-small text-foreground-muted">
                {product.shortDescription}
              </p>
            </div>

            {/* Highlights List */}
            {product.highlights.length > 0 && (
              <ul className="space-y-1.5 border-t border-border pt-4 font-mono text-[11px] text-foreground-muted">
                {product.highlights.slice(0, 3).map((hl) => (
                  <li key={hl} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-accent" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Color Finish Selector */}
            <div className="pt-2">
              <ColorSwatchGroup
                colors={product.colors}
                selectedColorId={selectedColor.id}
                onSelect={setSelectedColor}
                size="sm"
                showLabel
              />
            </div>
          </div>

          {/* Bottom Pricing & Actions */}
          <div className="mt-8 space-y-4 border-t border-border pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <PriceDisplay
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                size="lg"
                showDiscountBadge
              />
              <StockStatusIndicator
                status={product.stockStatus}
                inventoryCount={product.inventoryCount}
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
                disabled={product.stockStatus === 'out_of_stock'}
                onClick={() =>
                  addToCart({
                    product,
                    color: selectedColor,
                    quantity: 1,
                  })
                }
              >
                {product.stockStatus === 'pre_order'
                  ? 'Reserve Batch'
                  : 'Allocate to Bag'}
              </Button>

              <Button
                variant="outline"
                size="md"
                leftIcon={<Eye className="h-3.5 w-3.5" />}
                onClick={() => setQuickViewProduct(product)}
              >
                Quick Inspect
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. STANDARD ARCHITECTURAL PRODUCT CARD (No generic bubbly corners; sharp hairline framing)
  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex flex-col justify-between border border-border bg-surface transition-colors duration-300 hover:border-foreground/50',
        className
      )}
    >
      {/* Top Image Stage */}
      <div>
        <div
          className={cn(
            'relative w-full overflow-hidden border-b border-border bg-surface-muted',
            aspectClasses[aspect]
          )}
        >
          <Link
            href={`/product/${product.slug}`}
            aria-label={`View ${product.name}`}
            className="block h-full w-full"
          >
            <img
              src={activePrimaryImage}
              alt={`${product.name} in ${selectedColor.name}`}
              loading={priority ? 'eager' : 'lazy'}
              className={cn(
                'h-full w-full object-cover transition-all duration-700 ease-noire-out',
                isHovered && activeSecondaryImage !== activePrimaryImage
                  ? 'scale-105 opacity-0'
                  : 'scale-100 opacity-100'
              )}
            />
            {activeSecondaryImage !== activePrimaryImage && (
              <img
                src={activeSecondaryImage}
                alt={`${product.name} secondary perspective`}
                loading="lazy"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-noire-out',
                  isHovered ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                )}
              />
            )}
          </Link>

          {/* Top Bar: Index + Badge + Wishlist */}
          <div className="pointer-events-none absolute left-3.5 right-3.5 top-3.5 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {indexLabel && (
                <span className="border border-border bg-background/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm">
                  {indexLabel}
                </span>
              )}
              <ProductBadge
                type={product.badge}
                label={product.badgeLabel}
              />
            </div>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={
                saved
                  ? `Remove ${product.name} from wishlist`
                  : `Save ${product.name} to wishlist`
              }
              className={cn(
                'pointer-events-auto flex h-8 w-8 items-center justify-center border transition-colors duration-250',
                saved
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background/90 text-foreground hover:border-foreground'
              )}
            >
              <Heart className={cn('h-3.5 w-3.5', saved && 'fill-current')} />
            </button>
          </div>

          {/* Hover Quick Action Bar (Desktop hover + keyboard focusable) */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 flex items-center gap-1.5 border-t border-border bg-background/95 p-2.5 backdrop-blur-md transition-all duration-300 ease-noire-out',
              'translate-y-0 opacity-100 lg:translate-y-full lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-within:translate-y-0 lg:focus-within:opacity-100'
            )}
          >
            <button
              type="button"
              disabled={product.stockStatus === 'out_of_stock'}
              onClick={() =>
                addToCart({
                  product,
                  color: selectedColor,
                  quantity: 1,
                })
              }
              className="flex h-9 flex-1 items-center justify-center gap-2 border border-foreground bg-foreground px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ShoppingBag className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>
                {product.stockStatus === 'pre_order'
                  ? 'Reserve'
                  : '+ Allocate'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQuickViewProduct(product)}
              aria-label={`Quick inspect ${product.name}`}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-surface text-foreground transition-colors hover:border-foreground"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Product Metadata Body */}
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <TechnicalCode>{product.modelNumber}</TechnicalCode>
          </div>

          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/product/${product.slug}`}
                className="font-display text-base font-medium tracking-tight text-foreground transition-colors group-hover:text-accent sm:text-lg"
              >
                {product.name}
              </Link>
              <ArrowUpRight
                className="mt-1 h-4 w-4 shrink-0 text-foreground-subtle transition-transform duration-250 ease-noire-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="line-clamp-1 text-caption text-foreground-muted">
              {product.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Swatches, Stock Status & Price */}
      <div className="space-y-3 border-t border-border px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <ColorSwatchGroup
            colors={product.colors}
            selectedColorId={selectedColor.id}
            onSelect={setSelectedColor}
            size="sm"
          />
          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="md"
            showDiscountBadge
          />
        </div>

        {variant !== 'minimal' && (
          <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
            <StockStatusIndicator
              status={product.stockStatus}
              inventoryCount={product.inventoryCount}
            />
            <span className="font-mono text-[10px] uppercase text-foreground-subtle">
              {selectedColor.name}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
