import type { Metadata } from 'next';
import type { Product } from '@/types';
import {
  getCategories,
  getCollections,
  getFeaturedProducts,
  getProducts,
  getSpotlightProduct,
} from '@/lib/services';
import { GlobalFooter, GlobalHeader } from '@/components/navigation';
import { WishlistExperience } from '@/components/wishlist/wishlist-experience';

export const metadata: Metadata = {
  title: 'Saved Archive — Private Instrument Ledger',
  description:
    'A private ledger of saved NOIRÉ instruments, exact finishes, and active allocations.',
  robots: {
    index: false,
    follow: false,
  },
};

async function getCanonicalCatalog(): Promise<Product[]> {
  const firstPage = await getProducts(
    { limit: 50, page: 1, sort: 'featured' },
    0
  );
  if (firstPage.totalPages <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getProducts(
        { limit: firstPage.limit, page: index + 2, sort: 'featured' },
        0
      )
    )
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.items);
}

export default async function NoireWishlistPage() {
  const [categories, collections, featuredProducts, spotlightProduct, catalog] =
    await Promise.all([
      getCategories(0),
      getCollections(0),
      getFeaturedProducts(4, 0),
      getSpotlightProduct(0),
      getCanonicalCatalog(),
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

      <main id="main-content">
        <WishlistExperience allProducts={catalog} collections={collections} />
      </main>

      <GlobalFooter categories={categories} collections={collections} />
    </div>
  );
}
