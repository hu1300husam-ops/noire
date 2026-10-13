'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ShoppingBag,
  Eye,
  ArrowDown,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Container } from '@/components/layout';
import {
  Button,
  PriceDisplay,
  ColorSwatchGroup,
} from '@/components/ui';
import { useCommerce } from '@/lib/context/commerce-context';
import { useTranslations } from 'next-intl';
import { NOIRE_MOTION_TOKENS } from '@/lib/design-system/tokens';
import { useStableReducedMotion } from '@/lib/hooks/use-stable-reduced-motion';
import type { Product, ProductColorVariant } from '@/types';

interface HeroSectionProps {
  heroProduct: Product;
}

export function HeroSection({ heroProduct }: HeroSectionProps) {
  const t = useTranslations('home.hero');
  const { addToCart, setQuickViewProduct } = useCommerce();
  const prefersReducedMotion = useStableReducedMotion();

  const [selectedColor, setSelectedColor] = useState<ProductColorVariant>(
    heroProduct.colors[0]
  );

  const activeImage = selectedColor?.image || heroProduct.primaryImage;

  return (
    <section
      aria-label={t('aria')}
      className="surface-obsidian relative min-h-[92vh] overflow-hidden bg-background pt-28 text-foreground sm:pt-32 lg:pt-36"
    >
      {/* Subtle Architectural Hairline Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-architectural-grid bg-[size:64px_64px] opacity-[0.04]"
        aria-hidden="true"
      />

      <Container size="wide" className="relative z-10 flex flex-col justify-between pb-12 lg:min-h-[calc(92vh-9rem)] lg:pb-16">
        {/* Top Telemetry Bar */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: NOIRE_MOTION_TOKENS.duration.slow,
            ease: NOIRE_MOTION_TOKENS.easing.outExpo,
          }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 sm:mb-12"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t('editionBadge')}
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted sm:inline">
              {t('designArchive')}
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted">
            <span className="inline-flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-accent" aria-hidden="true" />
              <span>{t('batch')}</span>
            </span>
            <span className="hidden text-foreground-subtle md:inline">
              01 / 10
            </span>
          </div>
        </motion.div>

        {/* Main 12-Column Asymmetrical Hero Composition */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left 7 Columns: Editorial Headline, Philosophy & CTAs */}
          <div className="flex flex-col justify-between space-y-8 lg:col-span-7 lg:pe-6">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: NOIRE_MOTION_TOKENS.duration.cinematic,
                delay: prefersReducedMotion ? 0 : 0.08,
                ease: NOIRE_MOTION_TOKENS.easing.outExpo,
              }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                <span className="text-accent">{heroProduct.modelNumber}</span>
                <span>—</span>
                <span>{t('flagshipLabel')}</span>
              </div>

              <h1 className="font-display text-display tracking-tighter text-foreground">
                {t('title')}
              </h1>

              <p className="max-w-xl text-body-lg leading-relaxed text-foreground-muted">
                {t('body')}
              </p>
            </motion.div>

            {/* Interactive Allocation & Exploration Bar */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: NOIRE_MOTION_TOKENS.duration.slow,
                delay: prefersReducedMotion ? 0 : 0.18,
                ease: NOIRE_MOTION_TOKENS.easing.outExpo,
              }}
              className="space-y-6 border-t border-border pt-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                    {t('allocationLabel')}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <PriceDisplay
                      price={heroProduct.price}
                      compareAtPrice={heroProduct.compareAtPrice}
                      size="lg"
                    />
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">
                      {t('inStock')}
                    </span>
                  </div>
                </div>

                {/* Finish Switcher */}
                <ColorSwatchGroup
                  colors={heroProduct.colors}
                  selectedColorId={selectedColor.id}
                  onSelect={setSelectedColor}
                  size="md"
                  showLabel
                />
              </div>

              {/* Primary and Secondary CTAs */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<ShoppingBag className="h-4 w-4" />}
                  onClick={() =>
                    addToCart({
                      product: heroProduct,
                      color: selectedColor,
                      quantity: 1,
                    })
                  }
                >
                  {t('allocate', { name: heroProduct.name.replace('NOIRÉ ', '') })}
                </Button>

                <Link
                  href={`/product/${heroProduct.slug}`}
                  className="inline-flex h-13 items-center justify-center gap-2.5 border border-border bg-surface px-8 font-mono text-xs uppercase tracking-[0.14em] text-foreground transition-colors duration-250 hover:border-foreground hover:bg-surface-elevated"
                >
                  <span>{t('inspectDossier')}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <button
                  type="button"
                  onClick={() => setQuickViewProduct(heroProduct)}
                  aria-label={t('quickViewAria')}
                  className="inline-flex h-13 items-center justify-center gap-2 border border-border px-5 font-mono text-xs uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:hidden lg:inline">{t('quickView')}</span>
                </button>
              </div>
            </motion.div>

            {/* Technical Spec Ledger Row */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: NOIRE_MOTION_TOKENS.duration.slow,
                delay: prefersReducedMotion ? 0 : 0.26,
                ease: NOIRE_MOTION_TOKENS.easing.outExpo,
              }}
              className="grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4"
            >
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                  {t('specs.transducer')}
                </span>
                <span className="mt-1 block font-mono text-xs text-foreground">
                  {t('specs.transducerValue')}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                  {t('specs.response')}
                </span>
                <span className="mt-1 block font-mono text-xs text-foreground">
                  5 Hz – 55,000 Hz
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                  {t('specs.isolation')}
                </span>
                <span className="mt-1 block font-mono text-xs text-foreground">
                  {t('specs.isolationValue')}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                  {t('specs.chassisMass')}
                </span>
                <span className="mt-1 block font-mono text-xs text-foreground">
                  {t('specs.chassisMassValue')}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right 5 Columns: Framed Architectural Product Plate */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: NOIRE_MOTION_TOKENS.duration.cinematic,
              delay: prefersReducedMotion ? 0 : 0.12,
              ease: NOIRE_MOTION_TOKENS.easing.outExpo,
            }}
            className="lg:col-span-5"
          >
            <div className="relative border border-border bg-surface p-3 sm:p-4">
              {/* Top Plate Coordinates */}
              <div className="mb-3 flex items-center justify-between border-b border-border pb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                <span>FIG 01 // {heroProduct.modelNumber}</span>
                <span className="text-accent">{selectedColor.name}</span>
              </div>

              {/* Hero Image Stage */}
              <div className="group relative aspect-[4/5] w-full overflow-hidden bg-surface-muted">
                <img
                  src={activeImage}
                  alt={`${heroProduct.name} in ${selectedColor.name}`}
                  className="h-full w-full object-cover transition-transform duration-700 ease-noire-out group-hover:scale-105"
                />

                {/* Subtle Bottom Gradient & Caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                        {t('labCertification')}
                      </span>
                      <p className="mt-1 font-display text-base text-foreground">
                        {heroProduct.name}
                      </p>
                    </div>
                    <Link
                      href="#featured-collection"
                      className="border border-border bg-background/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground backdrop-blur-sm transition-colors hover:border-foreground"
                    >
                      {t('editionAnchor')}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Plate Authenticity Note */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>{t('warranty')}</span>
                </span>
                <span>{t('tolerance')}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Scroll Guidance Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-subtle">
          <a
            href="#brand-manifesto"
            className="group inline-flex items-center gap-2.5 text-foreground-muted transition-colors hover:text-foreground"
          >
            <ArrowDown
              className="h-3.5 w-3.5 text-accent transition-transform duration-300 group-hover:translate-y-0.5"
              aria-hidden="true"
            />
            <span>{t('scroll')}</span>
          </a>

          <div className="flex flex-wrap items-center gap-6">
            <span>LAT 47°22&apos;N // LON 08°32&apos;E</span>
            <span className="hidden sm:inline">{t('serializedProduction')}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
