'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { createCatalogLocalizer } from './catalog-localizer';

/** Client-side counterpart of `getCatalogLocalizer` for components that load catalog data themselves. */
export function useCatalogCopy() {
  const t = useTranslations('catalog');
  return useMemo(
    () => createCatalogLocalizer(t as unknown as Parameters<typeof createCatalogLocalizer>[0]),
    [t]
  );
}
