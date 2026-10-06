/**
 * NOIRÉ — Locale-aware catalog reads for Server Components.
 *
 * Mirrors the `@/lib/services` surface but returns category / collection / product
 * copy translated for the active request locale. Mutations and non-catalog reads are
 * re-exported untouched.
 */
import * as base from '@/lib/mock-api';
import { getCatalogLocalizer } from '@/lib/i18n/catalog';

export * from '@/lib/mock-api';

export async function getProducts(
  ...args: Parameters<typeof base.getProducts>
): ReturnType<typeof base.getProducts> {
  const [response, localize] = await Promise.all([
    base.getProducts(...args),
    getCatalogLocalizer(),
  ]);
  return { ...response, items: localize.products(response.items) };
}

export async function getProductBySlug(
  ...args: Parameters<typeof base.getProductBySlug>
): ReturnType<typeof base.getProductBySlug> {
  const [product, localize] = await Promise.all([
    base.getProductBySlug(...args),
    getCatalogLocalizer(),
  ]);
  return product ? localize.product(product) : product;
}

export async function getFeaturedProducts(
  ...args: Parameters<typeof base.getFeaturedProducts>
): ReturnType<typeof base.getFeaturedProducts> {
  const [items, localize] = await Promise.all([
    base.getFeaturedProducts(...args),
    getCatalogLocalizer(),
  ]);
  return localize.products(items);
}

export async function getSpotlightProduct(
  ...args: Parameters<typeof base.getSpotlightProduct>
): ReturnType<typeof base.getSpotlightProduct> {
  const [product, localize] = await Promise.all([
    base.getSpotlightProduct(...args),
    getCatalogLocalizer(),
  ]);
  return localize.product(product);
}

export async function getRelatedProducts(
  ...args: Parameters<typeof base.getRelatedProducts>
): ReturnType<typeof base.getRelatedProducts> {
  const [items, localize] = await Promise.all([
    base.getRelatedProducts(...args),
    getCatalogLocalizer(),
  ]);
  return localize.products(items);
}

export async function getCategories(
  ...args: Parameters<typeof base.getCategories>
): ReturnType<typeof base.getCategories> {
  const [items, localize] = await Promise.all([
    base.getCategories(...args),
    getCatalogLocalizer(),
  ]);
  return localize.categories(items);
}

export async function getCollections(
  ...args: Parameters<typeof base.getCollections>
): ReturnType<typeof base.getCollections> {
  const [items, localize] = await Promise.all([
    base.getCollections(...args),
    getCatalogLocalizer(),
  ]);
  return localize.collections(items);
}

export async function getCollectionBySlug(
  ...args: Parameters<typeof base.getCollectionBySlug>
): ReturnType<typeof base.getCollectionBySlug> {
  const [collection, localize] = await Promise.all([
    base.getCollectionBySlug(...args),
    getCatalogLocalizer(),
  ]);
  return collection
    ? {
        ...collection,
        collection: localize.collection(collection.collection),
        products: localize.products(collection.products),
      }
    : collection;
}
