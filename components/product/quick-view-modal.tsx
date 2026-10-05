'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  ArrowUpRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  Modal,
  ProductBadge,
  StockStatusIndicator,
  PriceDisplay,
  ColorSwatchGroup,
  QuantitySelector,
  Button,
  TechnicalCode,
} from '@/components/ui';
import { useCommerce } from '@/lib/context/commerce-context';
import { cn } from '@/lib/utils';
import type { ProductColorVariant, ProductOptionVariant } from '@/types';

export function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useCommerce();

  const [selectedColor, setSelectedColor] =
    useState<ProductColorVariant | null>(null);
  const [selectedOption, setSelectedOption] =
    useState<ProductOptionVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedColor(quickViewProduct.colors[0] || null);
      setSelectedOption(quickViewProduct.options?.[0] || null);
      setActiveImageIndex(0);
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct || !selectedColor) return null;

  const saved = isInWishlist(quickViewProduct.id);
  const activePrice =
    quickViewProduct.price + (selectedOption?.priceDelta || 0);

  const galleryImages = [
    selectedColor.image || quickViewProduct.primaryImage,
    selectedColor.secondaryImage || quickViewProduct.secondaryImage,
    ...quickViewProduct.gallery.map((g) => g.url),
  ].filter(
    (url, idx, self): url is string =>
      Boolean(url) && self.indexOf(url) === idx
  );

  const currentImage = galleryImages[activeImageIndex] || galleryImages[0];

  return (
    <Modal
      isOpen={Boolean(quickViewProduct)}
      onClose={() => setQuickViewProduct(null)}
      title={quickViewProduct.name}
      code={`${quickViewProduct.modelNumber} // TECHNICAL INSPECTION`}
      size="xl"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 6 Columns: Image Stage & Thumbnails */}
        <div className="space-y-3 lg:col-span-6">
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-surface-muted">
            <img
              src={currentImage}
              alt={`${quickViewProduct.name} in ${selectedColor.name}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-3.5 top-3.5">
              <ProductBadge
                type={quickViewProduct.badge}
                label={quickViewProduct.badgeLabel}
              />
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.slice(0, 4).map((imgUrl, idx) => (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View perspective ${idx + 1}`}
                  className={cn(
                    'relative aspect-square overflow-hidden border transition-all',
                    activeImageIndex === idx
                      ? 'border-foreground ring-1 ring-foreground'
                      : 'border-border opacity-70 hover:opacity-100'
                  )}
                >
                  <img
                    src={imgUrl}
                    alt={`${quickViewProduct.name} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 6 Columns: Specifications & Allocation */}
        <div className="flex flex-col justify-between space-y-6 lg:col-span-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <TechnicalCode>{quickViewProduct.modelNumber}</TechnicalCode>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                {quickViewProduct.categoryName}
              </span>
              <h2 className="font-display text-h3 tracking-tight text-foreground">
                {quickViewProduct.name}
              </h2>
              <p className="text-small text-foreground-muted">
                {quickViewProduct.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-4 border-y border-border py-4">
              <PriceDisplay
                price={activePrice}
                compareAtPrice={quickViewProduct.compareAtPrice}
                size="lg"
                showDiscountBadge
              />
              <StockStatusIndicator
                status={quickViewProduct.stockStatus}
                inventoryCount={quickViewProduct.inventoryCount}
              />
            </div>

            {/* Color Selection */}
            <div>
              <ColorSwatchGroup
                colors={quickViewProduct.colors}
                selectedColorId={selectedColor.id}
                onSelect={(color) => {
                  setSelectedColor(color);
                  setActiveImageIndex(0);
                }}
                showLabel
              />
            </div>

            {/* Option Selection (if present) */}
            {quickViewProduct.options &&
              quickViewProduct.options.length > 0 && (
                <div className="space-y-2">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                    {quickViewProduct.optionGroupLabel || 'Configuration'}:
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {quickViewProduct.options.map((option) => {
                      const isSelected = selectedOption?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={!option.inStock}
                          onClick={() => setSelectedOption(option)}
                          className={cn(
                            'flex items-center justify-between border px-3 py-2.5 text-left font-mono text-[11px] transition-colors',
                            isSelected
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-surface text-foreground hover:border-foreground/50',
                            !option.inStock && 'cursor-not-allowed opacity-40'
                          )}
                        >
                          <span className="truncate">{option.label}</span>
                          {option.priceDelta !== 0 && (
                            <span className="ml-2 shrink-0 opacity-80">
                              +${option.priceDelta}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Quick Spec Ledger */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                Key Engineering Highlights
              </span>
              <ul className="space-y-1.5 pt-1">
                {quickViewProduct.highlights.slice(0, 3).map((hl) => (
                  <li
                    key={hl}
                    className="flex items-start gap-2 text-caption text-foreground-muted"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Allocation Controls */}
          <div className="space-y-4 border-t border-border pt-5">
            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={Math.min(quickViewProduct.inventoryCount || 10, 10)}
              />

              <Button
                variant="primary"
                size="md"
                className="flex-1"
                leftIcon={<ShoppingBag className="h-4 w-4" />}
                disabled={quickViewProduct.stockStatus === 'out_of_stock'}
                onClick={() => {
                  addToCart({
                    product: quickViewProduct,
                    color: selectedColor,
                    option: selectedOption || undefined,
                    quantity,
                  });
                  setQuickViewProduct(null);
                }}
              >
                {quickViewProduct.stockStatus === 'pre_order'
                  ? 'Reserve Allocation'
                  : 'Allocate to Bag'}
              </Button>

              <button
                type="button"
                onClick={() => toggleWishlist(quickViewProduct)}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center border transition-colors',
                  saved
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-surface text-foreground hover:border-foreground'
                )}
              >
                <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                <span>
                  {quickViewProduct.warrantyYears}-Year Acoustic &amp; Structural
                  Warranty
                </span>
              </div>

              <Link
                href={`/product/${quickViewProduct.slug}`}
                onClick={() => setQuickViewProduct(null)}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground underline underline-offset-4 transition-colors hover:text-accent"
              >
                <span>Open Full Dossier</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
