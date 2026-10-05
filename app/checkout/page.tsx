import React from 'react';
import type { Metadata } from 'next';
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
  getSpotlightProduct,
  getShippingMethods,
} from '@/lib/services';
import { GlobalHeader, GlobalFooter } from '@/components/navigation';
import { QuickViewModal } from '@/components/product';
import { CheckoutExperience } from '@/components/checkout';

export const metadata: Metadata = {
  title: 'Demo Checkout | NOIRÉ',
  description:
    'Browser-local checkout demonstration. No payment provider is connected; no funds are authorized or captured.',
  robots: { index: false, follow: false },
};

export default async function NoireCheckoutPage() {
  const [categories, collections, featuredProducts, spotlightProduct, shippingMethods] =
    await Promise.all([
      getCategories(0),
      getCollections(0),
      getFeaturedProducts(4, 0),
      getSpotlightProduct(0),
      getShippingMethods(undefined, 0),
    ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalHeader
        categories={categories}
        collections={collections}
        featuredProducts={featuredProducts}
        spotlightProduct={spotlightProduct}
        allowTransparentTop={false}
      />
      <CheckoutExperience initialShippingMethods={shippingMethods} />
      <GlobalFooter categories={categories} collections={collections} />
      <QuickViewModal />
    </div>
  );
}
