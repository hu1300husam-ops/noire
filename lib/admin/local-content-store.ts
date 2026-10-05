import {
  EMPTY_LOCAL_CONTENT_DRAFT,
  type LocalContentDraft,
} from '@/lib/admin/contracts';

const STORAGE_KEY = 'noire_admin_content_preview_v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** Read the explicitly local-only content working copy. */
export function readLocalContentDraft(): LocalContentDraft {
  if (typeof window === 'undefined') return { ...EMPTY_LOCAL_CONTENT_DRAFT };
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!isRecord(value)) return { ...EMPTY_LOCAL_CONTENT_DRAFT };
    return {
      featuredCollectionId:
        typeof value.featuredCollectionId === 'string' ? value.featuredCollectionId : null,
      featuredProductIds: stringArray(value.featuredProductIds),
      journalArticleIds: stringArray(value.journalArticleIds),
      navigationCollectionIds: stringArray(value.navigationCollectionIds),
      announcementText:
        typeof value.announcementText === 'string' ? value.announcementText : '',
      savedAt: typeof value.savedAt === 'string' ? value.savedAt : null,
    };
  } catch {
    return { ...EMPTY_LOCAL_CONTENT_DRAFT };
  }
}

/** Persist only a local draft; this does not publish or alter storefront content. */
export function clearLocalContentDraft(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function writeLocalContentDraft(
  draft: Omit<LocalContentDraft, 'savedAt'>
): LocalContentDraft {
  if (typeof window === 'undefined') {
    throw new Error('Browser storage is unavailable in this environment.');
  }
  const saved: LocalContentDraft = { ...draft, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}
