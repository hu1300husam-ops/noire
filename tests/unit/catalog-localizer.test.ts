import { describe, expect, it } from 'vitest';
import { createCatalogLocalizer, type CatalogTranslator } from '@/lib/i18n/catalog-localizer';
import { MOCK_CATEGORIES, MOCK_COLLECTIONS, MOCK_PRODUCTS } from '@/lib/data';

function makeTranslator(dictionary: Record<string, string>): CatalogTranslator {
  const t = ((key: string) => dictionary[key]) as CatalogTranslator;
  t.has = (key: string) => key in dictionary;
  return t;
}

describe('createCatalogLocalizer', () => {
  const category = MOCK_CATEGORIES[0];
  const collection = MOCK_COLLECTIONS[0];
  const product = MOCK_PRODUCTS[0];

  it('falls back to fixture copy when no translation exists', () => {
    const localize = createCatalogLocalizer(makeTranslator({}));
    expect(localize.category(category)).toEqual(category);
    expect(localize.collection(collection)).toEqual(collection);
    expect(localize.product(product).categoryName).toBe(product.categoryName);
  });

  it('applies translations when a key is present', () => {
    const localize = createCatalogLocalizer(
      makeTranslator({
        [`categories.${category.slug}.name`]: 'صوتيات',
        [`collections.${collection.slug}.title`]: 'الإصدار',
        [`categories.${product.category}.name`]: product.category === category.slug ? 'صوتيات' : 'فئة',
      })
    );
    const localizedCategory = localize.category(category);
    expect(localizedCategory.name).toBe('صوتيات');
    // Untranslated siblings keep the English fixture text.
    expect(localizedCategory.description).toBe(category.description);
    expect(localize.collection(collection).title).toBe('الإصدار');
    expect(localize.product(product).categoryName).toBe(
      product.category === category.slug ? 'صوتيات' : 'فئة'
    );
  });

  it('never mutates the original fixtures', () => {
    const snapshot = JSON.stringify(MOCK_CATEGORIES);
    createCatalogLocalizer(makeTranslator({ [`categories.${category.slug}.name`]: 'x' })).categories(
      MOCK_CATEGORIES
    );
    expect(JSON.stringify(MOCK_CATEGORIES)).toBe(snapshot);
  });
});
