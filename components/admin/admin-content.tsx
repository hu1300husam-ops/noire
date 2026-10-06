'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, Compass, Image as ImageIcon, Megaphone, RotateCcw, Sparkles } from 'lucide-react';
import { Badge, Button, Checkbox, ErrorState, TechnicalCode, Textarea, useToast } from '@/components/ui';
import { AdminLocalNotice, AdminLoadingState, AdminPageHeader, AdminSurface } from '@/components/admin/admin-primitives';
import { loadAdminCollections, loadAdminJournalArticles, loadAdminProducts } from '@/lib/admin/actions';
import { clearLocalContentDraft, readLocalContentDraft, writeLocalContentDraft } from '@/lib/admin/local-content-store';
import { EMPTY_LOCAL_CONTENT_DRAFT, type LocalContentDraft } from '@/lib/admin/contracts';
import type { Collection, JournalArticle, Product } from '@/types';

function contentBaseline(collections: Collection[], products: Product[], articles: JournalArticle[]): LocalContentDraft {
  return {
    featuredCollectionId: collections.find((collection) => collection.featured)?.id ?? null,
    featuredProductIds: products.filter((product) => product.featured).map((product) => product.id).slice(0, 6),
    journalArticleIds: articles.filter((article) => article.featured).map((article) => article.id),
    navigationCollectionIds: collections.filter((collection) => collection.featured).map((collection) => collection.id),
    announcementText: '',
    savedAt: null,
  };
}

export function AdminContentWorkspace() {
  const { addToast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [draft, setDraft] = useState<LocalContentDraft>(EMPTY_LOCAL_CONTENT_DRAFT);
  const [baseline, setBaseline] = useState<LocalContentDraft>(EMPTY_LOCAL_CONTENT_DRAFT);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true); setLoadError(null);
    try {
      const [nextCollections, nextProducts, nextArticles] = await Promise.all([
        loadAdminCollections(), loadAdminProducts(), loadAdminJournalArticles(),
      ]);
      setCollections(nextCollections); setProducts(nextProducts); setArticles(nextArticles);
      const source = contentBaseline(nextCollections, nextProducts, nextArticles);
      setBaseline(source);
      const stored = readLocalContentDraft();
      setDraft(stored.savedAt ? stored : source);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Existing editorial sources could not be loaded.');
    } finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const toggleId = (key: 'featuredProductIds' | 'journalArticleIds' | 'navigationCollectionIds', id: string, checked: boolean) => {
    setDraft((current) => ({ ...current, [key]: checked ? Array.from(new Set([...current[key], id])) : current[key].filter((candidate) => candidate !== id) }));
  };

  const saveDraft = () => {
    setSaveError(null);
    try {
      const saved = writeLocalContentDraft({
        featuredCollectionId: draft.featuredCollectionId,
        featuredProductIds: draft.featuredProductIds,
        journalArticleIds: draft.journalArticleIds,
        navigationCollectionIds: draft.navigationCollectionIds,
        announcementText: draft.announcementText,
      });
      setDraft(saved);
      addToast({ type: 'success', title: 'Local content draft saved', description: 'The storefront and live CMS were not changed.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Browser-local content storage is unavailable.';
      setSaveError(message);
      addToast({ type: 'error', title: 'Draft could not be saved', description: message });
    }
  };

  const resetDraft = () => {
    try {
      clearLocalContentDraft();
      setDraft(baseline);
      setSaveError(null);
      addToast({ type: 'info', title: 'Draft reset to source flags', description: 'Existing Product / Collection / JournalArticle flags remain unchanged.' });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'The local draft could not be cleared.');
    }
  };

  if (isLoading) return <AdminLoadingState label="Loading existing editorial content sources" rows={6} />;
  if (loadError) return <><AdminPageHeader eyebrow="OPERATIONS // 06" title="Content control" description="A compact control surface for current catalog and editorial references." /><AdminLocalNotice /><ErrorState code="ERR // CONTENT SOURCES" title="Content sources unavailable." description={loadError} onRetry={() => void load()} retryLabel="Retry source read" /></>;

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader eyebrow="OPERATIONS // 06 · EDITORIAL CONTROL" title="Content control" description="A lightweight content working copy built from existing Collection, Product, and JournalArticle records—not a new CMS." actions={<><Button type="button" variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />} onClick={resetDraft}>Reset to source flags</Button><Button type="button" variant="primary" size="md" leftIcon={<Check className="h-3.5 w-3.5" aria-hidden="true" />} onClick={saveDraft}>Save local draft</Button></>} />
      <AdminLocalNotice>
        This page stores a small working copy in this browser only. It does not update the public homepage, navigation, Private Dispatch form, or a CMS. “Save” means local draft saved—not published.
      </AdminLocalNotice>
      {draft.savedAt && <p role="status" className="mb-4 border-s-2 border-accent bg-surface px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted">Local working copy saved // {new Date(draft.savedAt).toLocaleString('en-GB')} · not published</p>}
      {saveError && <p role="alert" className="mb-4 border border-danger/30 bg-danger-surface px-3 py-2 text-small text-danger">{saveError}</p>}

      <div className="space-y-4">
        <AdminSurface className="p-4 sm:p-5">
          <SectionHeading icon={<Sparkles className="h-4 w-4" aria-hidden="true" />} code="01 // HOMEPAGE COLLECTION" title="Featured collection" description="Source records use Collection.featured; the selection below is a local override draft only." />
          <fieldset className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <legend className="sr-only">Choose local featured collection preview</legend>
            {collections.map((collection) => (
              <label key={collection.id} className="flex min-h-14 cursor-pointer items-start gap-3 border border-border bg-background p-3 hover:bg-surface-muted/40">
                <input type="radio" name="featured-collection" value={collection.id} checked={draft.featuredCollectionId === collection.id} onChange={() => setDraft((current) => ({ ...current, featuredCollectionId: collection.id }))} className="mt-1 h-4 w-4 accent-foreground focus-visible:ring-2 focus-visible:ring-foreground" />
                <span className="min-w-0"><span className="block break-words text-small text-foreground">{collection.title}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{collection.code} {collection.featured && '· source flagged'}</span></span>
              </label>
            ))}
          </fieldset>
          {collections.length === 0 && <p className="mt-3 text-small text-foreground-muted">No Collection records are available.</p>}
        </AdminSurface>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AdminSurface className="p-4 sm:p-5">
            <SectionHeading icon={<ImageIcon className="h-4 w-4" aria-hidden="true" />} code="02 // FEATURED PRODUCTS" title="Product references" description="Choose from the existing Product catalog; no duplicate product list is created." />
            <div className="mt-4 max-h-[420px] divide-y divide-border overflow-y-auto border-y border-border">
              {products.map((product) => <Checkbox key={product.id} className="min-h-14 items-center px-2 py-3" checked={draft.featuredProductIds.includes(product.id)} onChange={(checked) => toggleId('featuredProductIds', product.id, checked)} label={<span className="min-w-0"><span className="block break-words text-[11px] text-foreground">{product.name}</span><span className="mt-1 block font-mono text-[8px] uppercase text-foreground-subtle">{product.modelNumber} · {product.status}</span></span>} />)}
              {products.length === 0 && <p className="px-3 py-4 text-small text-foreground-muted">No products loaded from the existing catalog.</p>}
            </div>
            <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{draft.featuredProductIds.length} selected in local preview</p>
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <SectionHeading icon={<BookOpen className="h-4 w-4" aria-hidden="true" />} code="03 // JOURNAL REFERENCES" title="Editorial references" description="Use the existing JournalArticle records and source featured flags." />
            <div className="mt-4 divide-y divide-border border-y border-border">
              {articles.map((article) => <Checkbox key={article.id} className="min-h-14 items-center px-2 py-3" checked={draft.journalArticleIds.includes(article.id)} onChange={(checked) => toggleId('journalArticleIds', article.id, checked)} label={<span className="min-w-0"><span className="block break-words text-[11px] text-foreground">{article.title}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{article.issueNumber} · {article.featured ? 'source flagged' : 'not source flagged'}</span></span>} />)}
              {articles.length === 0 && <p className="px-3 py-4 text-small text-foreground-muted">No JournalArticle records are available.</p>}
            </div>
          </AdminSurface>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AdminSurface className="p-4 sm:p-5">
            <SectionHeading icon={<Compass className="h-4 w-4" aria-hidden="true" />} code="04 // NAVIGATION HIGHLIGHTS" title="Collection highlights" description="A local draft selection; the global navigation remains unchanged." />
            <div className="mt-4 divide-y divide-border border-y border-border">
              {collections.map((collection) => <Checkbox key={collection.id} className="min-h-14 items-center px-2 py-3" checked={draft.navigationCollectionIds.includes(collection.id)} onChange={(checked) => toggleId('navigationCollectionIds', collection.id, checked)} label={<span><span className="block text-[11px] text-foreground">{collection.title}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{collection.code}</span></span>} />)}
            </div>
          </AdminSurface>

          <AdminSurface className="p-4 sm:p-5">
            <SectionHeading icon={<Megaphone className="h-4 w-4" aria-hidden="true" />} code="05 // ANNOUNCEMENT / PRIVATE DISPATCH" title="Announcement working copy" description="The existing Dispatch form is a frontend preview; this text is not connected to it." />
            <div className="mt-4"><Textarea label="Local announcement copy" value={draft.announcementText} onChange={(event) => setDraft((current) => ({ ...current, announcementText: event.target.value }))} rows={6} placeholder="No local announcement draft. Enter preview copy only; it will not be published." hint="Stored only in this browser’s admin content draft." /></div>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3"><Badge variant="warning">NOT PUBLISHED</Badge><span className="text-[10px] text-foreground-subtle">Existing homepage copy remains unchanged.</span></div>
          </AdminSurface>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="ghost" leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />} onClick={resetDraft}>Reset draft</Button><Button type="button" variant="primary" onClick={saveDraft}>Save local draft</Button></div>
    </main>
  );
}

function SectionHeading({ icon, code, title, description }: { icon: React.ReactNode; code: string; title: string; description: string }) {
  return <div className="flex items-start gap-3 border-b border-border pb-4"><span className="mt-0.5 text-accent">{icon}</span><div><TechnicalCode>{code}</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">{title}</h2><p className="mt-1 text-[10px] leading-relaxed text-foreground-muted">{description}</p></div></div>;
}
