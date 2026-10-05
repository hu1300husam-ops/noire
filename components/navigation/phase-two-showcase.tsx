'use client';

import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import {
  Container,
  Section,
  ArchitecturalGrid,
  SectionHeader,
} from '@/components/layout';
import {
  Button,
  Badge,
  Heading,
  Text,
  TechnicalCode,
  PriceDisplay,
  Divider,
} from '@/components/ui';
import { FadeIn } from '@/components/motion';
import { GlobalHeader } from './global-header';
import { GlobalFooter } from './global-footer';
import { useCommerce } from '@/lib/context/commerce-context';
import type { Product, Category, Collection } from '@/types';

interface PhaseTwoShowcaseProps {
  categories: Category[];
  collections: Collection[];
  featuredProducts: Product[];
  spotlightProduct: Product;
}

export function PhaseTwoShowcase({
  categories,
  collections,
  featuredProducts,
  spotlightProduct,
}: PhaseTwoShowcaseProps) {
  const {
    setIsSearchOpen,
    setIsCartDrawerOpen,
    addToCart,
    toggleWishlist,
    isInWishlist,
    cartCount,
    wishlistCount,
  } = useCommerce();

  const [allowTransparentTop, setAllowTransparentTop] = useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 1. GLOBAL HEADER (Includes Desktop Nav, Visual Mega Menu, Mobile Drawer, Search Overlay & Bag Drawer) */}
      <GlobalHeader
        categories={categories}
        collections={collections}
        featuredProducts={featuredProducts}
        spotlightProduct={spotlightProduct}
        allowTransparentTop={allowTransparentTop}
      />

      {/* 2. CINEMATIC HERO BACKDROP SPECIMEN (Tests Transparent -> Solid Header Scroll Transition) */}
      <section className="surface-obsidian relative flex min-h-[76vh] flex-col justify-end overflow-hidden border-b border-border bg-background pt-28 pb-14 text-foreground md:min-h-[82vh] md:pb-20">
        {/* Subtle Architectural Background Photography */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <img
            src={spotlightProduct.primaryImage}
            alt={spotlightProduct.name}
            className="h-full w-full scale-105 object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0C] via-[#0D0D0C]/75 to-[#0D0D0C]/55" />
        </div>

        <Container className="relative z-10">
          <FadeIn className="max-w-3xl space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="accent">PHASE 02 // BRAND NAVIGATION</Badge>
              <Badge variant="outline">
                {allowTransparentTop
                  ? 'TRANSPARENT HERO INTEGRATION ACTIVE'
                  : 'SOLID HEADER MODE FORCED'}
              </Badge>
            </div>

            <Heading
              as="h1"
              size="display"
              className="tracking-tight text-foreground"
            >
              Brand Navigation &amp; Search Architecture.
            </Heading>

            <Text size="body-lg" tone="muted" measure>
              Inspect the{' '}
              <strong className="font-medium text-foreground">
                Global Header
              </strong>{' '}
              above in its transparent hero state. Hover or focus{' '}
              <strong className="font-medium text-foreground">Shop</strong> or{' '}
              <strong className="font-medium text-foreground">
                Collections
              </strong>{' '}
              on desktop to open the visual Mega Menus, press{' '}
              <kbd className="border border-border bg-surface px-1.5 py-0.5 font-mono text-xs text-foreground">
                ⌘K
              </kbd>{' '}
              to launch the full-screen Search Experience, or scroll down to
              observe the solid header transition and editorial Footer.
            </Text>

            {/* Interactive Verification Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                leftIcon={<Search className="h-3.5 w-3.5" />}
                onClick={() => setIsSearchOpen(true)}
              >
                Launch Search Overlay (⌘K)
              </Button>

              <Button
                variant="outline"
                leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}
                onClick={() => setIsCartDrawerOpen(true)}
              >
                Open Bag Drawer [{String(cartCount).padStart(2, '0')}]
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => setAllowTransparentTop((prev) => !prev)}
              >
                {allowTransparentTop
                  ? 'Force Solid Header at Top'
                  : 'Enable Transparent Hero Header'}
              </Button>
            </div>
          </FadeIn>

          {/* Bottom Telemetry Strip */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-border/80 pt-6 sm:grid-cols-4">
            <div>
              <TechnicalCode>{'01 // HEADER STATE'}</TechnicalCode>
              <p className="mt-1 font-mono text-xs text-foreground">
                Transparent → Solid on Scroll (&gt;24px)
              </p>
            </div>
            <div>
              <TechnicalCode>{'02 // MEGA MENU'}</TechnicalCode>
              <p className="mt-1 font-mono text-xs text-foreground">
                Visual Department &amp; Edition Plates
              </p>
            </div>
            <div>
              <TechnicalCode>{'03 // SEARCH OVERLAY'}</TechnicalCode>
              <p className="mt-1 font-mono text-xs text-foreground">
                Debounced Live Query + Keyboard Nav
              </p>
            </div>
            <div>
              <TechnicalCode>{'04 // MOBILE DRAWER'}</TechnicalCode>
              <p className="mt-1 font-mono text-xs text-foreground">
                Expandable Hierarchy + 48px Dock
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. PHASE 2 INTERACTIVE NAVIGATION WORKBENCH */}
      <main className="flex-1">
        <Section spacing="md" borderBottom>
          <Container>
            <SectionHeader
              index="01"
              eyebrow="NAVIGATION VERIFICATION"
              title="Interactive State & Micro-Interaction Workbench"
              description="Test live commerce state synchronization across the Global Header, Search Experience, Mobile Navigation Drawer, and Allocation Bag Drawer."
            />

            <ArchitecturalGrid gap="default">
              {/* Card 1: Search & Mega Menu Guide */}
              <div className="col-span-4 flex flex-col justify-between space-y-6 border border-border bg-surface p-5 sm:p-6 md:col-span-4 md:p-8 lg:col-span-6">
                <div className="space-y-4">
                  <Divider label="01.A // SEARCH & DISCOVERY STATES" />
                  <Heading as="h3" size="h3">
                    Full-Screen Search Experience
                  </Heading>
                  <Text size="small" tone="muted">
                    The NOIRÉ Search Overlay includes persistent recent queries,
                    trending technical specifications, department shortcuts,
                    live product previews with instant allocation buttons,
                    shimmer loading skeletons, and a designed no-results recovery
                    state.
                  </Text>

                  <div className="space-y-2 border border-border bg-background p-4 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground-subtle">
                        GLOBAL SHORTCUT
                      </span>
                      <span className="text-foreground">⌘K / Ctrl+K</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground-subtle">
                        RESULT CYCLING
                      </span>
                      <span className="text-foreground">
                        ArrowDown / ArrowUp / Enter
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground-subtle">
                        DISMISS &amp; RESTORE FOCUS
                      </span>
                      <span className="text-foreground">Escape Key</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    withArrow="right"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    Open Search Experience
                  </Button>
                </div>
              </div>

              {/* Card 2: Live Header Counter & Bag Drawer Sync */}
              <div className="col-span-4 flex flex-col justify-between space-y-6 border border-border bg-surface p-5 sm:p-6 md:col-span-4 md:p-8 lg:col-span-6">
                <div className="space-y-4">
                  <Divider label="01.B // HEADER STATE SYNCHRONIZATION" />
                  <Heading as="h3" size="h3">
                    Live Bag [{String(cartCount).padStart(2, '0')}] &amp;
                    Wishlist [{String(wishlistCount).padStart(2, '0')}] Telemetry
                  </Heading>
                  <Text size="small" tone="muted">
                    Allocate or archive any reference instrument below to verify
                    real-time tabular counter updates in the Global Header,
                    Mobile Navigation Dock, and Allocation Bag Drawer.
                  </Text>

                  <div className="divide-y divide-border border border-border bg-background">
                    {featuredProducts.slice(0, 3).map((prod) => {
                      const saved = isInWishlist(prod.id);
                      return (
                        <div
                          key={prod.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-3.5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={prod.primaryImage}
                              alt={prod.name}
                              className="h-11 w-11 shrink-0 border border-border object-cover"
                            />
                            <div className="min-w-0">
                              <TechnicalCode>{prod.modelNumber}</TechnicalCode>
                              <p className="truncate font-display text-sm font-medium text-foreground">
                                {prod.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <PriceDisplay price={prod.price} size="sm" />
                            <button
                              type="button"
                              onClick={() => toggleWishlist(prod)}
                              aria-label={
                                saved
                                  ? `Remove ${prod.name} from wishlist`
                                  : `Add ${prod.name} to wishlist`
                              }
                              className="flex h-8 w-8 items-center justify-center border border-border bg-surface text-foreground transition-colors hover:border-foreground"
                            >
                              <Heart
                                className={
                                  saved
                                    ? 'h-3.5 w-3.5 fill-current'
                                    : 'h-3.5 w-3.5'
                                }
                              />
                            </button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                addToCart({ product: prod, quantity: 1 })
                              }
                            >
                              + Bag
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <TechnicalCode>
                    {'DEMO COURIER ESTIMATE THRESHOLD: $500.00'}
                  </TechnicalCode>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCartDrawerOpen(true)}
                  >
                    Inspect Bag Drawer
                  </Button>
                </div>
              </div>
            </ArchitecturalGrid>
          </Container>
        </Section>
      </main>

      {/* 4. GLOBAL EDITORIAL FOOTER */}
      <GlobalFooter categories={categories} collections={collections} />
    </div>
  );
}
