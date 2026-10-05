'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Eye,
  ArrowUpRight,
  Volume2,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { Container, Section } from '@/components/layout';
import { Reveal } from '@/components/motion';
import {
  Eyebrow,
  ProductBadge,
  PriceDisplay,
  StockStatusIndicator,
  ColorSwatchGroup,
  Button,
} from '@/components/ui';
import { useCommerce } from '@/lib/context/commerce-context';
import { cn } from '@/lib/utils';
import type { Product, ProductColorVariant } from '@/types';

interface ProductSpotlightSectionProps {
  product: Product;
}

export function ProductSpotlightSection({
  product,
}: ProductSpotlightSectionProps) {
  const { addToCart, setQuickViewProduct } = useCommerce();
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant>(
    product.colors[0]
  );
  const [activePerspective, setActivePerspective] = useState<
    'primary' | 'secondary'
  >('primary');

  const displayImage =
    activePerspective === 'secondary'
      ? selectedColor.secondaryImage || product.secondaryImage
      : selectedColor.image || product.primaryImage;

  return (
    <Section
      id="product-spotlight"
      spacing="lg"
      tone="obsidian"
      borderBottom
      aria-labelledby="spotlight-heading"
      className="relative overflow-hidden"
    >
      {/* Subtle Architectural Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-architectural-grid bg-[size:72px_72px] opacity-[0.03]"
        aria-hidden="true"
      />

      <Container size="wide" className="relative z-10">
        {/* Top Campaign Header */}
        <Reveal className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow index="07" tone="accent">
              FLAGSHIP CAMPAIGN SPOTLIGHT
            </Eyebrow>
            <span className="border border-border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
              {product.modelNumber}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
            <Volume2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>360° ROOM-SENSE ACOUSTIC ARCHITECTURE</span>
          </div>
        </Reveal>

        {/* Main 12-Column Campaign Composition */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left 7 Columns: Oversized Product Imagery & Perspective Controls */}
          <Reveal className="space-y-4 lg:col-span-7">
            <div className="relative overflow-hidden border border-border bg-surface">
              {/* Top Image Telemetry Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted sm:px-6">
                <span>
                  ACOUSTIC MONOLITH // FINISH: {selectedColor.name.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePerspective('primary')}
                    className={cn(
                      'px-2 py-0.5 transition-colors',
                      activePerspective === 'primary'
                        ? 'bg-foreground text-background'
                        : 'text-foreground-muted hover:text-foreground'
                    )}
                  >
                    01 Elevation
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePerspective('secondary')}
                    className={cn(
                      'px-2 py-0.5 transition-colors',
                      activePerspective === 'secondary'
                        ? 'bg-foreground text-background'
                        : 'text-foreground-muted hover:text-foreground'
                    )}
                  >
                    02 Array Detail
                  </button>
                </div>
              </div>

              {/* Oversized Campaign Plate */}
              <div className="relative aspect-[16/12] w-full overflow-hidden bg-surface-muted">
                <img
                  src={displayImage}
                  alt={`${product.name} in ${selectedColor.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-noire-out hover:scale-105"
                />

                <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-6">
                  <ProductBadge
                    type={product.badge}
                    label={product.badgeLabel}
                  />
                </div>

                {/* Bottom Acoustic Callout Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 sm:p-8">
                  <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-4 sm:grid-cols-3">
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                        AMPLIFICATION
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-foreground">
                        550W Hypex NCore Class-D
                      </span>
                    </div>
                    <div>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                        TRANSDUCER ARRAY
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-foreground">
                        7 Custom Beryllium Drivers
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                        FREQUENCY FLOOR
                      </span>
                      <span className="mt-0.5 block font-mono text-xs text-foreground">
                        28 Hz – 40,000 Hz (±1.5dB)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Engineering Callout Bar */}
            <div className="grid grid-cols-1 gap-4 border border-border bg-surface p-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                    ROOM-SENSE ACOUSTIC DSP
                  </span>
                  <p className="mt-1 text-caption text-foreground-muted">
                    Continuously maps wall reflections at 192kHz to eliminate
                    standing bass waves in any architectural volume.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-border pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                    PACKAGING CONCEPT // DEMO ONLY
                  </span>
                  <p className="mt-1 text-caption text-foreground-muted">
                    Illustrative flight-case concept only; no shipment, courier
                    booking, or white-glove fulfillment service is connected.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right 5 Columns: Product Title, Technical Specifications, Price & CTAs */}
          <Reveal
            delay={0.1}
            className="flex flex-col justify-between space-y-8 lg:col-span-5"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  OMNIDIRECTIONAL ACOUSTIC SCULPTURE
                </span>
                <h2
                  id="spotlight-heading"
                  className="font-display text-h1 tracking-tighter text-foreground"
                >
                  {product.name}
                </h2>
                <p className="text-body leading-relaxed text-foreground-muted">
                  {product.editorialDescription}
                </p>
              </div>

              {/* Price & Stock Ledger */}
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-y border-border py-5">
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                    INSTRUMENT ALLOCATION PRICE
                  </span>
                  <PriceDisplay
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    size="xl"
                    className="mt-1"
                  />
                </div>
                <StockStatusIndicator
                  status={product.stockStatus}
                  inventoryCount={product.inventoryCount}
                />
              </div>

              {/* Finish Selector */}
              <div className="space-y-3">
                <ColorSwatchGroup
                  colors={product.colors}
                  selectedColorId={selectedColor.id}
                  onSelect={setSelectedColor}
                  size="md"
                  showLabel
                />
              </div>

              {/* Technical Specifications Table */}
              <div className="space-y-2 border-t border-border pt-5">
                <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
                  TECHNICAL DOSSIER // {product.sku}
                </span>
                <dl className="divide-y divide-border border-y border-border font-mono text-xs">
                  {product.specifications.slice(0, 5).map((spec) => (
                    <div key={spec.label} className="grid grid-cols-12 py-2.5">
                      <dt className="col-span-5 text-[11px] uppercase text-foreground-muted">
                        {spec.label}
                      </dt>
                      <dd className="col-span-7 text-right text-foreground">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* CTAs & Secondary Info */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<ShoppingBag className="h-4 w-4" />}
                  onClick={() =>
                    addToCart({
                      product,
                      color: selectedColor,
                      quantity: 1,
                    })
                  }
                >
                  Allocate {product.name}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Eye className="h-4 w-4" />}
                  onClick={() => setQuickViewProduct(product)}
                  className="shrink-0"
                >
                  Inspect
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                <span>
                  {product.warrantyYears}-Year Acoustic &amp; Structural
                  Warranty
                </span>
                <Link
                  href={`/product/${product.slug}`}
                  className="inline-flex items-center gap-1.5 text-foreground underline underline-offset-4 transition-colors hover:text-accent"
                >
                  <span>Open Complete Acoustic Dossier</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
