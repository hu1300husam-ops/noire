'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass } from 'lucide-react';
import { Container, Section } from '@/components/layout';
import { Reveal } from '@/components/motion';
import { Eyebrow, TechnicalCode } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoryDiscoverySectionProps {
  categories: Category[];
}

export function CategoryDiscoverySection({
  categories,
}: CategoryDiscoverySectionProps) {
  const [activeCategory, setActiveCategory] = useState<Category>(
    categories[0]
  );

  if (!categories.length) return null;

  return (
    <Section
      id="category-discovery"
      spacing="lg"
      tone="muted"
      borderBottom
      aria-labelledby="category-discovery-heading"
    >
      <Container size="wide">
        {/* Section Header */}
        <Reveal className="mb-12 flex flex-col justify-between gap-6 border-b border-border pb-8 lg:flex-row lg:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Eyebrow index="06" tone="accent">
                ENGINEERING DISCIPLINES
              </Eyebrow>
              <TechnicalCode>TAXONOMY // 01–06</TechnicalCode>
            </div>
            <h2
              id="category-discovery-heading"
              className="font-display text-h1 tracking-tighter text-foreground"
            >
              Six Systems of{' '}
              <span className="font-normal italic text-foreground-muted">
                Spatial &amp; Acoustic Order.
              </span>
            </h2>
          </div>

          <p className="max-w-md text-small leading-relaxed text-foreground-muted">
            Select a discipline to inspect its material parameters, machining
            tolerances, and active instrument allocations.
          </p>
        </Reveal>

        {/* Asymmetrical 12-Column Interactive Discipline Index + Visual Stage */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left 7 Columns: Architectural Discipline Ledger */}
          <div className="divide-y divide-border border border-border bg-surface lg:col-span-7">
            {categories.map((category) => {
              const isActive = activeCategory.id === category.id;

              return (
                <div
                  key={category.id}
                  onMouseEnter={() => setActiveCategory(category)}
                  onFocus={() => setActiveCategory(category)}
                  className={cn(
                    'group relative transition-colors duration-300',
                    isActive
                      ? 'bg-background'
                      : 'bg-surface hover:bg-background/60'
                  )}
                >
                  {/* Active Left Accent Bar */}
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 top-0 w-1 transition-colors duration-300',
                      isActive ? 'bg-accent' : 'bg-transparent'
                    )}
                    aria-hidden="true"
                  />

                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="block p-5 sm:p-7"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-baseline gap-4 sm:gap-6">
                        <span
                          className={cn(
                            'font-mono text-xs uppercase tracking-[0.16em] transition-colors',
                            isActive ? 'text-accent' : 'text-foreground-subtle'
                          )}
                        >
                          {category.indexNumber}
                        </span>

                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-display text-h3 tracking-tight text-foreground transition-colors group-hover:text-accent">
                              {category.name}
                            </h3>
                            <span className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-subtle">
                              NR-{category.shortName.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1.5 max-w-lg text-small text-foreground-muted">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-foreground">
                            {String(category.productCount).padStart(2, '0')}{' '}
                            OBJECTS
                          </span>
                          <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-subtle">
                            {category.shortName}
                          </span>
                        </div>

                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center border transition-all duration-300',
                            isActive
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-border bg-surface text-foreground group-hover:border-foreground'
                          )}
                        >
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                    </div>

                    {/* Mobile / Tablet Inline Visual Panel when Active */}
                    <div
                      className={cn(
                        'mt-4 overflow-hidden border border-border bg-surface-muted lg:hidden',
                        isActive ? 'block' : 'hidden'
                      )}
                    >
                      <div className="relative aspect-[16/9] w-full">
                        <img
                          src={category.heroImage}
                          alt={category.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#D4B483]">
                            {category.indexNumber} {'//'} {category.editorialStatement}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right 5 Columns: Desktop Sticky Editorial Visual Panel */}
          <div className="hidden lg:col-span-5 lg:sticky lg:top-28 lg:block">
            <div className="border border-border bg-surface p-4">
              {/* Top Coordinate Header */}
              <div className="mb-3 flex items-center justify-between border-b border-border pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-accent" />
                  <span>DISCIPLINE PLATE // {activeCategory.indexNumber}</span>
                </span>
                <span className="text-accent">
                  {String(activeCategory.productCount).padStart(2, '0')} ACTIVE
                  MODELS
                </span>
              </div>

              {/* Large Editorial Image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-surface-muted">
                <img
                  key={activeCategory.id}
                  src={activeCategory.heroImage}
                  alt={activeCategory.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-noire-out hover:scale-105"
                />

                {/* Overlay Dossier Card */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-6 text-[#F4F3EF]">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C8A97E]">
                    {activeCategory.editorialStatement}
                  </span>
                  <h4 className="mt-1.5 font-display text-h3 tracking-tight">
                    {activeCategory.name}
                  </h4>
                  <p className="mt-2 text-caption leading-relaxed text-[#A09E97]">
                    {activeCategory.description}
                  </p>

                  <Link
                    href={`/shop?category=${activeCategory.slug}`}
                    className="mt-5 inline-flex items-center gap-2 border border-[#F4F3EF] bg-[#F4F3EF] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#0C0C0D] transition-opacity hover:opacity-90"
                  >
                    <span>Explore {activeCategory.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
