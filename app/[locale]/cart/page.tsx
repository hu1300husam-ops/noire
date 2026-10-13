import React from 'react';
import type { Metadata } from 'next';
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
  getSpotlightProduct,
  getProducts,
  getDiscounts,
} from '@/lib/services/localized';
import { GlobalHeader, GlobalFooter } from '@/components/navigation';
import { QuickViewModal } from '@/components/product';
import { CartExperience } from '@/components/cart';

export const metadata: Metadata = {
  title: 'Allocation Dossier (Bag) | NOIRÉ',
  description:
    'Review your browser-local NOIRÉ demonstration bag before continuing to the checkout preview.',
  robots: { index: false, follow: false },
};

export default async function NoireCartPage() {
  const [
    categories,
    collections,
    featuredProducts,
    spotlightProduct,
    allProductsResponse,
    availableDiscounts,
  ] = await Promise.all([
    getCategories(0),
    getCollections(0),
    getFeaturedProducts(4, 0),
    getSpotlightProduct(0),
    getProducts({ limit: 50 }, 0),
    getDiscounts(0),
  ]);

  const activeDiscounts = availableDiscounts.filter(
    (d) => d.status === 'active'
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Global Navigation Header */}
      <GlobalHeader
        categories={categories}
        collections={collections}
        featuredProducts={featuredProducts}
        spotlightProduct={spotlightProduct}
        allowTransparentTop={false}
      />

      {/* Primary Allocation Bag Content */}
      <main id="main-content">
        <CartExperience
          allProducts={allProductsResponse.items}
          availableDiscounts={activeDiscounts}
        />
      </main>

      {/* Global Editorial Footer */}
      <GlobalFooter categories={categories} collections={collections} />

      {/* Global Quick Inspect Modal */}
      <QuickViewModal />
    </div>
  );
}
