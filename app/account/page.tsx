import type { Metadata } from 'next';
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
  getProducts,
  getSpotlightProduct,
} from '@/lib/services';
import { previewCustomerSessionProvider } from '@/lib/account/customer-session';
import { GlobalFooter, GlobalHeader } from '@/components/navigation';
import { QuickViewModal } from '@/components/product';
import { AccountExperience } from '@/components/account';

export const metadata: Metadata = {
  title: 'Private Client Atelier',
  description:
    'A private workspace for NOIRÉ order records, saved instruments, delivery drafts, and client preferences.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NoireAccountPage() {
  const [categories, collections, featuredProducts, spotlightProduct, catalog, session] =
    await Promise.all([
      getCategories(0),
      getCollections(0),
      getFeaturedProducts(4, 0),
      getSpotlightProduct(0),
      getProducts({ limit: 50, sort: 'featured' }, 0),
      previewCustomerSessionProvider.getSession(),
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

      <AccountExperience session={session} allProducts={catalog.items} />

      <GlobalFooter categories={categories} collections={collections} />
      <QuickViewModal />
    </div>
  );
}
