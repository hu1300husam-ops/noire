import { getTranslations } from 'next-intl/server';
import { createCatalogLocalizer, type CatalogLocalizer } from './catalog-localizer';

export type { CatalogLocalizer } from './catalog-localizer';

/** Server-side helper: resolves the request locale and returns a catalog localizer. */
export async function getCatalogLocalizer(): Promise<CatalogLocalizer> {
  const t = await getTranslations('catalog');
  return createCatalogLocalizer(t as unknown as Parameters<typeof createCatalogLocalizer>[0]);
}
