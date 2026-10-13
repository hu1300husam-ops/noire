'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useMemo } from 'react';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { Container, Section } from '@/components/layout';
import { Reveal } from '@/components/motion';
import { Eyebrow, TechnicalCode } from '@/components/ui';
import { ProductCard } from '@/components/product';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductShowcaseSectionProps {
  products: Product[];
}

type DisciplineFilter = 'all' | 'audio' | 'desk-architecture' | 'lighting-input';

export function ProductShowcaseSection({
  products,
}: ProductShowcaseSectionProps) {
  const t = useTranslations('home.showcase');
  const [activeFilter, setActiveFilter] = useState<DisciplineFilter>('all');

  const filters: { id: DisciplineFilter; label: string; count: number }[] = [
    { id: 'all', label: t('filters.all'), count: products.length },
    {
      id: 'audio',
      label: t('filters.audio'),
      count: products.filter((p) => p.category === 'audio').length,
    },
    {
      id: 'desk-architecture',
      label: t('filters.desk'),
      count: products.filter(
        (p) =>
          p.category === 'desk-architecture' ||
          p.category === 'smart-instruments'
      ).length,
    },
    {
      id: 'lighting-input',
      label: t('filters.lighting'),
      count: products.filter(
        (p) =>
          p.category === 'lighting' ||
          p.category === 'tactile-input' ||
          p.category === 'travel-carry'
      ).length,
    },
  ];

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return products;
    if (activeFilter === 'audio') {
      return products.filter((p) => p.category === 'audio');
    }
    if (activeFilter === 'desk-architecture') {
      return products.filter(
        (p) =>
          p.category === 'desk-architecture' ||
          p.category === 'smart-instruments'
      );
    }
    return products.filter(
      (p) =>
        p.category === 'lighting' ||
        p.category === 'tactile-input' ||
        p.category === 'travel-carry'
    );
  }, [products, activeFilter]);

  // Extract instruments for our varied visual rhythm:
  // 01 Large Split -> 02 & 03 Asymmetrical Pair -> 04 Large Split -> 05, 06, 07 Architectural Trio
  const firstLarge = filteredProducts[0];
  const pairLeft = filteredProducts[1];
  const pairRight = filteredProducts[2];
  const secondLarge = filteredProducts[3];
  const trioRow = filteredProducts.slice(4, 7);

  return (
    <Section
      id="product-showcase"
      spacing="lg"
      tone="default"
      borderBottom
      aria-labelledby="showcase-heading"
    >
      <Container size="wide">
        {/* Section Header + Discipline Filter Bar */}
        <Reveal className="mb-12 space-y-8 border-b border-border pb-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Eyebrow index="05" tone="accent">
                  {t('eyebrow')}
                </Eyebrow>
                <TechnicalCode>{t('catIndex')}</TechnicalCode>
              </div>
              <h2
                id="showcase-heading"
                className="font-display text-h1 tracking-tighter text-foreground"
              >
                {t.rich('title', {
                  em: (chunks) => (
                    <span className="font-normal italic text-foreground-muted">{chunks}</span>
                  ),
                })}
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 self-start border border-foreground bg-foreground px-6 py-3.5 font-mono text-xs uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 lg:self-auto"
            >
              <span>{t('enterArchive', { count: products.length })}</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Interactive Discipline Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div
              role="tablist"
              aria-label={t('filterAria')}
              className="flex flex-wrap items-center gap-2"
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      'inline-flex items-center gap-2 border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-250',
                      isActive
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-surface text-foreground-muted hover:border-foreground/50 hover:text-foreground'
                    )}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-[10px]',
                        isActive
                          ? 'bg-background/20 text-background'
                          : 'bg-surface-muted text-foreground-subtle'
                      )}
                    >
                      {String(filter.count).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle md:flex">
              <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
              <span>{t('rhythm')}</span>
            </div>
          </div>
        </Reveal>

        {/* Varied Editorial Rhythm Layout */}
        <div className="space-y-12">
          {/* POSITION 01: Large Architectural Split Showcase */}
          {firstLarge && (
            <Reveal>
              <ProductCard
                product={firstLarge}
                indexLabel={t('indexFeatured', { index: '01' })}
                variant="large-split"
              />
            </Reveal>
          )}

          {/* POSITIONS 02 & 03: Asymmetrical 12-Column Offset Pair */}
          {(pairLeft || pairRight) && (
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
              {pairLeft && (
                <Reveal className="lg:col-span-7">
                  <ProductCard
                    product={pairLeft}
                    indexLabel={t('indexArchiveObject', { index: '02' })}
                    aspect="landscape"
                  />
                </Reveal>
              )}

              {pairRight && (
                <Reveal delay={0.1} className="space-y-6 lg:col-span-5 lg:mt-12">
                  {/* Editorial Field Note above the offset card */}
                  <div className="border-s-2 border-accent ps-4">
                    <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                      {t('calibrationTitle')}
                    </span>
                    <p className="mt-1 text-caption leading-relaxed text-foreground-muted">
                      {t('calibrationBody')}
                    </p>
                  </div>

                  <ProductCard
                    product={pairRight}
                    indexLabel={t('indexArchiveObject', { index: '03' })}
                    aspect="portrait"
                  />
                </Reveal>
              )}
            </div>
          )}

          {/* POSITION 04: Second Large Architectural Split Showcase */}
          {secondLarge && (
            <Reveal>
              <ProductCard
                product={secondLarge}
                indexLabel={t('indexFeatured', { index: '04' })}
                variant="large-split"
              />
            </Reveal>
          )}

          {/* POSITIONS 05, 06, 07: Secondary Architectural Trio */}
          {trioRow.length > 0 && (
            <div className="space-y-6 border-t border-border pt-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-foreground">
                  {t('additional')}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-subtle">
                  {t('positions', { last: `0${4 + trioRow.length}` })}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                {trioRow.map((product, idx) => (
                  <Reveal key={product.id} delay={idx * 0.06}>
                    <ProductCard
                      product={product}
                      indexLabel={t('indexArchive', { index: `0${idx + 5}` })}
                      aspect="portrait"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
