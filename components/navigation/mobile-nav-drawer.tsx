'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  X,
  Search,
  Plus,
  Minus,
  ArrowUpRight,
  User,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { NOIRE_MOTION_TOKENS } from '@/lib/design-system/tokens';
import { useOverlayBehavior } from '@/lib/hooks';
import { useCommerce } from '@/lib/context/commerce-context';
import { TechnicalCode } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Category, Collection } from '@/types';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  collections: Collection[];
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  categories,
  collections,
}: MobileNavDrawerProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const containerRef = useOverlayBehavior<HTMLDivElement>({ isOpen, onClose });
  const dialogId = useId();
  const titleId = `${dialogId}-title`;

  const {
    cartCount,
    wishlistCount,
    setIsSearchOpen,
    setIsCartDrawerOpen,
  } = useCommerce();

  const [expandedSection, setExpandedSection] = useState<
    'shop' | 'collections' | null
  >('shop');

  const toggleSection = (sec: 'shop' | 'collections') => {
    setExpandedSection((prev) => (prev === sec ? null : sec));
  };

  const handleOpenSearch = () => {
    onClose();
    window.setTimeout(() => {
      setIsSearchOpen(true);
    }, 60);
  };

  const handleOpenBag = () => {
    onClose();
    window.setTimeout(() => {
      setIsCartDrawerOpen(true);
    }, 60);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-drawer flex lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion
                ? 0
                : NOIRE_MOTION_TOKENS.duration.fast,
            }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Mobile Drawer Panel */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={
              prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }
            }
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={{
              duration: prefersReducedMotion
                ? 0.05
                : NOIRE_MOTION_TOKENS.duration.normal,
              ease: NOIRE_MOTION_TOKENS.easing.outExpo,
            }}
            className="relative z-10 flex h-full w-full max-w-[400px] flex-col border-r border-border bg-background text-foreground shadow-modal focus:outline-none"
          >
            {/* 1. Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-3">
                <Link
                  id={titleId}
                  href="/"
                  onClick={onClose}
                  className="font-display text-lg font-semibold tracking-[0.22em] text-foreground"
                >
                  NOIRÉ
                </Link>
                <span className="h-3.5 w-px bg-border" />
                <TechnicalCode>INDEX</TechnicalCode>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-xs border border-transparent text-foreground-muted transition-colors hover:border-border hover:bg-surface hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* 2. Prominent Mobile Search Entry */}
            <div className="border-b border-border bg-surface p-4 sm:px-5">
              <button
                type="button"
                onClick={handleOpenSearch}
                className="flex h-11 w-full items-center justify-between rounded-xs border border-border bg-background px-3.5 text-left transition-colors hover:border-foreground"
              >
                <span className="inline-flex items-center gap-2.5 text-small text-foreground-subtle">
                  <Search className="h-4 w-4 text-foreground-muted" />
                  <span>Search instruments, NR-01...</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground-subtle">
                  SEARCH
                </span>
              </button>
            </div>

            {/* 3. Scrollable Hierarchical Navigation */}
            <nav
              aria-label="Mobile Primary Navigation"
              className="flex-1 overflow-y-auto px-5 py-4"
            >
              <ul className="divide-y divide-border">
                {/* 01. Expandable Shop by Department */}
                <li className="py-2">
                  <button
                    type="button"
                    aria-expanded={expandedSection === 'shop'}
                    onClick={() => toggleSection('shop')}
                    className="flex min-h-[48px] w-full items-center justify-between py-2 text-left"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] text-accent">
                        01
                      </span>
                      <span className="font-display text-lg font-medium tracking-tight text-foreground">
                        Shop Instruments
                      </span>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center text-foreground-muted">
                      {expandedSection === 'shop' ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedSection === 'shop' && (
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? { opacity: 1, height: 'auto' }
                            : { opacity: 0, height: 0 }
                        }
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: prefersReducedMotion
                            ? 0
                            : NOIRE_MOTION_TOKENS.duration.fast,
                          ease: NOIRE_MOTION_TOKENS.easing.outExpo,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2 pb-4 pt-1">
                          <Link
                            href="/shop"
                            onClick={onClose}
                            className="flex items-center justify-between border border-foreground bg-foreground px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-background"
                          >
                            <span>View Complete Archive</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>

                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/shop?category=${cat.slug}`}
                                onClick={onClose}
                                className="flex items-center gap-3.5 border border-border bg-surface p-2.5 transition-colors hover:border-foreground"
                              >
                                <img
                                  src={cat.thumbnailImage}
                                  alt={cat.name}
                                  className="h-12 w-12 shrink-0 object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] text-accent">
                                      {cat.indexNumber} {'//'} {cat.shortName}
                                    </span>
                                    <span className="font-mono text-[10px] text-foreground-subtle">
                                      [{cat.productCount}]
                                    </span>
                                  </div>
                                  <p className="truncate font-display text-sm font-medium text-foreground">
                                    {cat.name}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>

                {/* 02. Expandable Collections */}
                <li className="py-2">
                  <button
                    type="button"
                    aria-expanded={expandedSection === 'collections'}
                    onClick={() => toggleSection('collections')}
                    className="flex min-h-[48px] w-full items-center justify-between py-2 text-left"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] text-accent">
                        02
                      </span>
                      <span className="font-display text-lg font-medium tracking-tight text-foreground">
                        Collections
                      </span>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center text-foreground-muted">
                      {expandedSection === 'collections' ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedSection === 'collections' && (
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? { opacity: 1, height: 'auto' }
                            : { opacity: 0, height: 0 }
                        }
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          duration: prefersReducedMotion
                            ? 0
                            : NOIRE_MOTION_TOKENS.duration.fast,
                          ease: NOIRE_MOTION_TOKENS.easing.outExpo,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-2.5 pb-4 pt-1">
                          {collections.map((col) => (
                            <Link
                              key={col.id}
                              href={`/shop?collection=${col.slug}`}
                              onClick={onClose}
                              className="block border border-border bg-surface p-3 transition-colors hover:border-foreground"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] text-accent">
                                  {col.code}
                                </span>
                                <ArrowUpRight className="h-3.5 w-3.5 text-foreground-subtle" />
                              </div>
                              <p className="mt-1 font-display text-sm font-medium text-foreground">
                                {col.title}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-caption text-foreground-muted">
                                {col.subtitle}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>


              </ul>

              {/* Editorial Highlight Plate */}
              <div className="mt-6 border border-border bg-surface-muted p-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                  {'EDITION 04 // MONOLITH'}
                </span>
                <p className="mt-1 font-display text-sm font-medium text-foreground">
                  Milled from solid 6061-T6 aerospace aluminum billet.
                </p>
                <Link
                  href="/product/aether-01-headphones"
                  onClick={onClose}
                  className="mt-3 inline-flex items-center gap-1.5 border-b border-foreground pb-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground"
                >
                  <span>Inspect NR-01 // Aether</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </nav>

            {/* 4. Sticky Client Utility Dock (Comfortable 48px+ Touch Targets) */}
            <div className="border-t border-border bg-surface p-4 sm:px-5">
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex min-h-[48px] flex-col items-center justify-center gap-1 border border-border bg-background px-2 py-2 text-center transition-colors hover:border-foreground"
                >
                  <User className="h-4 w-4 text-foreground" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground">
                    Account
                  </span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex min-h-[48px] flex-col items-center justify-center gap-1 border border-border bg-background px-2 py-2 text-center transition-colors hover:border-foreground"
                >
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-foreground" />
                    <span className="font-mono text-[10px] tabular-nums text-accent">
                      [{String(wishlistCount).padStart(2, '0')}]
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground">
                    Wishlist
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleOpenBag}
                  className={cn(
                    'flex min-h-[48px] flex-col items-center justify-center gap-1 border px-2 py-2 text-center transition-colors',
                    cartCount > 0
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:border-foreground'
                  )}
                >
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="font-mono text-[10px] tabular-nums">
                      [{String(cartCount).padStart(2, '0')}]
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                    Bag
                  </span>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-foreground-subtle">
                <span>ZURICH · TOKYO</span>
                <span>47.3769° N, 8.5417° E</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
