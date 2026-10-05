import type { Category, Collection, Product } from '@/types';

/** Minimal translator contract shared by `useTranslations` and `getTranslations`. */
export interface CatalogTranslator {
  (key: string): string;
  has: (key: string) => boolean;
}

/**
 * Catalog copy (category / collection names and descriptions) is authored in English
 * inside the fixtures. Translations live under the `catalog` namespace; any key that is
 * missing falls back to the fixture text so partial translations never break rendering.
 */
export function createCatalogLocalizer(t: CatalogTranslator) {
  const pick = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  const category = (c: Category): Category => ({
    ...c,
    name: pick(`categories.${c.slug}.name`, c.name),
    shortName: pick(`categories.${c.slug}.shortName`, c.shortName),
    description: pick(`categories.${c.slug}.description`, c.description),
    editorialStatement: pick(`categories.${c.slug}.editorialStatement`, c.editorialStatement),
  });

  const collection = (c: Collection): Collection => ({
    ...c,
    title: pick(`collections.${c.slug}.title`, c.title),
    subtitle: pick(`collections.${c.slug}.subtitle`, c.subtitle),
    description: pick(`collections.${c.slug}.description`, c.description),
    season: pick(`collections.${c.slug}.season`, c.season),
  });

  const product = (p: Product): Product => ({
    ...p,
    categoryName: pick(`categories.${p.category}.name`, p.categoryName),
  });

  return {
    category,
    collection,
    product,
    categories: (items: Category[]) => items.map(category),
    collections: (items: Collection[]) => items.map(collection),
    products: (items: Product[]) => items.map(product),
  };
}

export type CatalogLocalizer = ReturnType<typeof createCatalogLocalizer>;
