import type { Metadata } from 'next';
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
  getSpotlightProduct,
} from '@/lib/services';
import { GlobalFooter, GlobalHeader } from '@/components/navigation';
import { QuickViewModal } from '@/components/product';
import { AccountOrderDetail } from '@/components/account';

export const metadata: Metadata = {
  title: 'Order Dossier',
  description: 'Inspect a browser-local NOIRÉ demonstration order record.',
  robots: {
    index: false,
    follow: false,
  },
};

interface AccountOrderPageProps {
  params: { orderId: string };
}

export default async function AccountOrderPage({ params }: AccountOrderPageProps) {
  const [categories, collections, featuredProducts, spotlightProduct] =
    await Promise.all([
      getCategories(0),
      getCollections(0),
      getFeaturedProducts(4, 0),
      getSpotlightProduct(0),
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

      <AccountOrderDetail orderId={params.orderId} />

      <GlobalFooter categories={categories} collections={collections} />
      <QuickViewModal />
    </div>
  );
}
