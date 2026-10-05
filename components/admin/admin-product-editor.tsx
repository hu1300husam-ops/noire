'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, EmptyState, ErrorState, TechnicalCode, useToast } from '@/components/ui';
import { AdminLocalNotice, AdminLoadingState, AdminPageHeader } from '@/components/admin/admin-primitives';
import { AdminProductEditorFields } from '@/components/admin/admin-product-editor-fields';
import { loadAdminCategories, loadAdminProduct, saveAdminProduct } from '@/app/admin/actions';
import type { Category, Product } from '@/types';

function newProductDraft(category?: Category): Product {
  return {
    id: '__new__',
    slug: '',
    sku: '',
    modelNumber: '',
    name: '',
    subtitle: '',
    shortDescription: '',
    editorialDescription: '',
    category: category?.slug ?? 'audio',
    categoryName: category?.name ?? '',
    collectionIds: [],
    price: 0,
    currency: 'USD',
    stockStatus: 'out_of_stock',
    inventoryCount: 0,
    featured: false,
    isSpotlight: false,
    isNewArrival: false,
    releaseYear: 2026,
    designedIn: '',
    primaryImage: '',
    secondaryImage: '',
    gallery: [],
    colors: [],
    options: [],
    materials: [],
    highlights: [],
    specifications: [],
    storyBlocks: [],
    faqs: [],
    shippingEstimate: '',
    warrantyYears: 0,
    relatedProductIds: [],
    status: 'draft',
    createdAt: '',
    updatedAt: '',
  };
}

export function AdminProductEditor({ productId }: { productId: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const isNewRoute = productId === 'new';
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const nextCategories = await loadAdminCategories();
      setCategories(nextCategories);
      if (isNewRoute) {
        setProduct(newProductDraft(nextCategories[0]));
      } else {
        setProduct(await loadAdminProduct(productId));
      }
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'The local product record could not be read.');
    } finally {
      setIsLoading(false);
    }
  }, [isNewRoute, productId]);

  useEffect(() => { void loadData(); }, [loadData]);

  const updateProduct = <Key extends keyof Product>(key: Key, value: Product[Key]) => {
    setProduct((current) => current ? { ...current, [key]: value } : current);
    setSaveError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    const normalizedSlug = product.slug.trim().toLowerCase();
    if (!product.name.trim() || !product.sku.trim() || !product.modelNumber.trim() || !normalizedSlug) {
      setSaveError('Name, slug, SKU, and model number are required.');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setSaveError('Use lowercase letters, numbers, and hyphens for the product slug.');
      return;
    }
    if (!Number.isFinite(product.price) || product.price < 0 || !Number.isSafeInteger(product.inventoryCount) || product.inventoryCount < 0) {
      setSaveError('Price and catalog quantity must be valid non-negative numbers.');
      return;
    }
    if (product.status === 'active' && product.price <= 0) {
      setSaveError('An active catalog entry needs a price greater than zero. Keep it as a draft until pricing is set.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = await saveAdminProduct({ ...product, slug: normalizedSlug });
      setProduct(saved);
      addToast({ type: 'success', title: isNewRoute ? 'Draft product created locally' : 'Product changes saved locally', description: 'The existing in-memory demo catalog was updated; this did not publish a production page.' });
      if (isNewRoute) router.replace(`/admin/products/${encodeURIComponent(saved.id)}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The local product service could not save this dossier.';
      setSaveError(message);
      addToast({ type: 'error', title: 'Product save failed', description: message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AdminLoadingState label="Loading product dossier" rows={7} />;
  if (loadError) {
    return <><AdminPageHeader eyebrow="OPERATIONS // 02 · PRODUCT DOSSIER" title="Product editor" description="Load a product from the existing catalog service." /><AdminLocalNotice /><ErrorState code="ERR // PRODUCT DOSSIER" title="Product data unavailable." description={loadError} onRetry={() => void loadData()} retryLabel="Retry dossier read" /></>;
  }
  if (!product) {
    return <><AdminPageHeader eyebrow="OPERATIONS // 02 · PRODUCT DOSSIER" title="Product not found" description="No matching product exists in the current local catalog." /><EmptyState code="CATALOG // NOT FOUND" title="No product record found." description="The requested identifier is not present in the existing process-memory catalog. It may have been archived, removed, or reset." primaryAction={<Link href="/admin/products" className="inline-flex min-h-11 items-center border border-foreground bg-foreground px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-background">Return to product command</Link>} /></>;
  }

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader
        eyebrow={`OPERATIONS // 02 · ${product.id === '__new__' ? 'NEW PRODUCT' : product.modelNumber}`}
        title={product.id === '__new__' ? 'New product dossier' : 'Product dossier'}
        description="A structured editor for the shared Product contract. Saves update the local demo service only; publication and durable persistence are not connected."
        actions={<Link href="/admin/products" className="inline-flex min-h-11 items-center gap-2 border border-border bg-surface px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-muted hover:border-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Product command</Link>}
      />
      <AdminLocalNotice>
        This editor writes to the existing mock catalog’s in-memory Product store. It is not a CMS, does not modify payment/checkout behavior, and resets when the server process restarts.
      </AdminLocalNotice>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3 font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">
        <span>Record // {product.id === '__new__' ? 'Not yet assigned' : product.id}</span>
        <span>Modified // {product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-GB') : 'Not yet saved'}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AdminProductEditorFields product={product} categories={categories} onUpdate={updateProduct} />
        {saveError && <p role="alert" className="border border-danger/30 bg-danger-surface px-4 py-3 text-small text-danger">{saveError}</p>}
        <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <span className="hidden items-center gap-2 sm:inline-flex"><TechnicalCode>Save target // local catalog only</TechnicalCode></span>
          <div className="flex w-full justify-end gap-2 sm:w-auto"><Link href="/admin/products" className="inline-flex min-h-11 items-center border border-border px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-foreground-muted hover:border-foreground">Cancel</Link><Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<Save className="h-3.5 w-3.5" aria-hidden="true" />}>{product.id === '__new__' ? 'Create local draft' : 'Save changes locally'}</Button></div>
        </div>
      </form>
    </main>
  );
}
