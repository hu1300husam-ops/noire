import React from 'react';
import type { Metadata } from 'next';
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
  getSpotlightProduct,
  getOrderById,
} from '@/lib/services';
import { GlobalHeader, GlobalFooter } from '@/components/navigation';
import { QuickViewModal } from '@/components/product';
import { OrderConfirmationExperience } from '@/components/checkout';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Allocation Record | NOIRÉ',
  description:
    'A browser-local NOIRÉ demonstration order record with pending settlement and no fulfillment event.',
  robots: { index: false, follow: false },
};

interface OrderConfirmationPageProps {
  params: { orderId: string };
}

export default async function NoireOrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const [categories, collections, featuredProducts, spotlightProduct, initialOrder] =
    await Promise.all([
      getCategories(0),
      getCollections(0),
      getFeaturedProducts(4, 0),
      getSpotlightProduct(0),
      getOrderById(params.orderId, 0),
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
      <OrderConfirmationExperience
        orderId={params.orderId}
        initialOrder={initialOrder as Order | null}
      />
      <GlobalFooter categories={categories} collections={collections} />
      <QuickViewModal />
    </div>
  );
}
