'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Percent, Plus, ShieldAlert } from 'lucide-react';
import { Badge, Button, EmptyState, ErrorState, Input, Modal, Select, TechnicalCode, useToast } from '@/components/ui';
import { AdminLocalNotice, AdminLoadingState, AdminPageHeader } from '@/components/admin/admin-primitives';
import { browserDemoDiscountService } from '@/lib/admin/browser-discount-service';
import type { Discount, DiscountStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

const DISCOUNT_STATUSES: DiscountStatus[] = ['active', 'scheduled', 'expired', 'disabled', 'archived'];
type DiscountType = Discount['type'];

function readDiscountStatus(value: string): DiscountStatus {
  return DISCOUNT_STATUSES.find((status) => status === value) ?? 'disabled';
}
function readDiscountType(value: string): DiscountType {
  return value === 'fixed_amount' || value === 'free_shipping' ? value : 'percentage';
}
function localDateTimeValue(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function newDiscountDraft(): Discount {
  return {
    id: '__new__', code: '', description: '', type: 'percentage', value: 10,
    usageCount: 0, status: 'disabled', startsAt: new Date().toISOString(),
  };
}

export function AdminDiscountsWorkspace() {
  const { addToast } = useToast();
  const [discounts, setDiscounts] = useState<Discount[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ discount: Discount; status: DiscountStatus } | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true); setLoadError(null);
    try { setDiscounts(await browserDemoDiscountService.getDiscounts()); }
    catch (error) { setLoadError(error instanceof Error ? error.message : 'Demo discount rules could not be loaded.'); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const visibleDiscounts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...(discounts ?? [])]
      .filter((discount) => !normalized || `${discount.code} ${discount.description}`.toLowerCase().includes(normalized))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [discounts, query]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    if (!editing.code.trim() || !editing.description.trim()) { setSaveError('Code and description are required.'); return; }
    const startsAt = new Date(editing.startsAt);
    if (!Number.isFinite(startsAt.getTime())) { setSaveError('Enter a valid start date.'); return; }
    setIsSaving(true); setSaveError(null);
    try {
      const saved = await browserDemoDiscountService.saveDiscount({ ...editing, code: editing.code.trim().toUpperCase() });
      setDiscounts((current) => {
        const existing = current ?? [];
        return existing.some((discount) => discount.id === saved.id)
          ? existing.map((discount) => discount.id === saved.id ? saved : discount)
          : [saved, ...existing];
      });
      setEditing(null);
      addToast({ type: 'success', title: 'Discount saved in browser demo store', description: 'The existing storefront validator reads this same module-local store until the page is reloaded; this is not server-authoritative.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The demo discount service rejected this change.';
      setSaveError(message);
      addToast({ type: 'error', title: 'Discount save failed', description: message });
    } finally { setIsSaving(false); }
  };

  const commitStatus = async () => {
    if (!pendingStatus) return;
    setIsSaving(true);
    try {
      const updated = await browserDemoDiscountService.setDiscountStatus(pendingStatus.discount.id, pendingStatus.status);
      setDiscounts((current) => current?.map((discount) => discount.id === updated.id ? updated : discount) ?? [updated]);
      addToast({ type: 'success', title: `Code ${updated.status}`, description: 'The local demo discount store was updated.' });
      setPendingStatus(null);
    } catch (error) {
      addToast({ type: 'error', title: 'Discount status change failed', description: error instanceof Error ? error.message : 'The demo code could not be updated.' });
    } finally { setIsSaving(false); }
  };

  if (isLoading) return <AdminLoadingState label="Loading demo discount register" rows={5} />;
  if (loadError || !discounts) return <><AdminPageHeader eyebrow="OPERATIONS // 05" title="Discounts" description="Review codes handled by the existing storefront validation service." /><AdminLocalNotice /><ErrorState code="ERR // DISCOUNT SERVICE" title="Discount register unavailable." description={loadError ?? 'The local discount service returned no data.'} onRetry={() => void load()} retryLabel="Retry discount read" /></>;

  const statusVariant = (status: DiscountStatus) => status === 'active' ? 'success' as const : status === 'scheduled' ? 'warning' as const : status === 'expired' ? 'danger' as const : 'default' as const;

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader eyebrow="OPERATIONS // 05 · CODE REGISTER" title="Discount management" description="Manage the Discount model read by existing storefront validation. There is no production promotion backend or authoritative usage ledger." actions={<Button type="button" variant="outline" leftIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />} onClick={() => { setSaveError(null); setEditing(newDiscountDraft()); }}>Create code</Button>} />
      <AdminLocalNotice>
        This browser-memory demo store is the same module store read by existing storefront validation, so edits can exercise checkout during this page session; a full reload resets demo edits. Browser validation is not a security boundary. Usage counters are seeded preview values and are not incremented by checkout. Production must replace this adapter with server-side validation and durable usage accounting.
      </AdminLocalNotice>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><Input label="Search codes" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Code or description…" /><TechnicalCode>Demo code store // {discounts.length} records</TechnicalCode></div>

      {visibleDiscounts.length === 0 ? (
        <EmptyState code="DISCOUNT REGISTER // EMPTY" title={discounts.length ? 'No codes match this search.' : 'No discount codes in the local service.'} description={discounts.length ? 'Try another code or description.' : 'Create a local demo code to exercise the existing storefront validation path.'} icon={<Percent className="h-5 w-5" aria-hidden="true" />} primaryAction={!discounts.length ? <Button type="button" variant="outline" onClick={() => setEditing(newDiscountDraft())}>Create demo code</Button> : undefined} />
      ) : (
        <div className="space-y-3">
          {visibleDiscounts.map((discount) => (
            <article key={discount.id} className="border border-border bg-surface p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><TechnicalCode>{discount.id}</TechnicalCode><Badge variant={statusVariant(discount.status)}>{discount.status}</Badge><Badge variant="outline">{discount.type.replace('_', ' ')}</Badge></div>
                  <h2 className="mt-2 break-words font-mono text-lg font-medium tracking-[0.08em] text-foreground">{discount.code}</h2>
                  <p className="mt-1 max-w-2xl text-small text-foreground-muted">{discount.description}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-3 sm:grid-cols-4">
                    <Summary label="Value" value={discount.type === 'percentage' ? `${discount.value}%` : discount.type === 'fixed_amount' ? formatPrice(discount.value) : 'Complimentary shipping'} />
                    <Summary label="Minimum" value={discount.minOrderAmount ? formatPrice(discount.minOrderAmount) : 'None recorded'} />
                    <Summary label="Usage" value={`${discount.usageCount}${discount.usageLimit ? ` / ${discount.usageLimit}` : ' · limit not recorded'}`} />
                    <Summary label="Validity" value={`${new Date(discount.startsAt).toLocaleDateString('en-GB')} — ${discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString('en-GB') : 'No end date'}`} />
                  </dl>
                  <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Usage // demo value only · no authoritative redemption count</p>
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => { setSaveError(null); setEditing({ ...discount }); }}>Edit</Button>
                  {discount.status === 'archived' ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPendingStatus({ discount, status: 'disabled' })}>Restore disabled</Button>
                  ) : (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPendingStatus({ discount, status: discount.status === 'active' ? 'disabled' : 'active' })}>{discount.status === 'active' ? 'Disable' : 'Enable'}</Button>
                  )}
                  {discount.status !== 'archived' && <Button type="button" variant="ghost" size="sm" onClick={() => setPendingStatus({ discount, status: 'archived' })}>Archive</Button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(editing)} onClose={() => !isSaving && setEditing(null)} title={editing?.id === '__new__' ? 'Create demo code' : 'Edit demo code'} code="DISCOUNT EDITOR // LOCAL SERVICE" size="lg" footer={<><Button type="button" variant="ghost" disabled={isSaving} onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="admin-discount-form" variant="primary" isLoading={isSaving}>Save in demo service</Button></>}>
        {editing && (
          <form id="admin-discount-form" onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input label="Code" value={editing.code} onChange={(event) => setEditing({ ...editing, code: event.target.value.toUpperCase() })} required /><Input label="Description" value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} required /><Select label="Discount type" value={editing.type} onChange={(event) => { const type = readDiscountType(event.target.value); setEditing({ ...editing, type, value: type === 'free_shipping' ? 0 : editing.value }); }} options={[{ label: 'Percentage', value: 'percentage' }, { label: 'Fixed amount', value: 'fixed_amount' }, { label: 'Free shipping', value: 'free_shipping' }]} /><Input label={editing.type === 'percentage' ? 'Percentage value' : editing.type === 'free_shipping' ? 'Value not used' : 'Amount value (USD)'} type="number" min="0" max={editing.type === 'percentage' ? 100 : undefined} step="0.01" disabled={editing.type === 'free_shipping'} value={editing.value} onChange={(event) => setEditing({ ...editing, value: Number(event.target.value) })} /><Input label="Minimum order (USD)" type="number" min="0" step="0.01" value={editing.minOrderAmount ?? ''} onChange={(event) => setEditing({ ...editing, minOrderAmount: event.target.value === '' ? undefined : Number(event.target.value) })} /><Input label="Usage limit" type="number" min="1" step="1" value={editing.usageLimit ?? ''} onChange={(event) => setEditing({ ...editing, usageLimit: event.target.value === '' ? undefined : Math.floor(Number(event.target.value)) })} /><Input label="Starts at" type="datetime-local" value={localDateTimeValue(editing.startsAt)} onChange={(event) => setEditing({ ...editing, startsAt: event.target.value ? new Date(event.target.value).toISOString() : '' })} required /><Input label="Expires at" type="datetime-local" value={editing.expiresAt ? localDateTimeValue(editing.expiresAt) : ''} onChange={(event) => setEditing({ ...editing, expiresAt: event.target.value ? new Date(event.target.value).toISOString() : undefined })} /><Select label="Status" value={editing.status} onChange={(event) => setEditing({ ...editing, status: readDiscountStatus(event.target.value) })} options={DISCOUNT_STATUSES.map((value) => ({ label: value, value }))} /><div className="flex min-h-11 items-end border-b border-border pb-3"><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-subtle">Usage count // {editing.usageCount} · read-only demo value</span></div></div>
            {saveError && <p role="alert" className="border border-danger/30 bg-danger-surface px-3 py-2 text-small text-danger">{saveError}</p>}
            <p className="flex gap-2 border border-warning/30 bg-warning-surface/50 p-3 text-[10px] leading-relaxed text-foreground-muted"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />The existing checkout validator is a demo check only. It does not enforce usage limits or provide server-side security.</p>
          </form>
        )}
      </Modal>

      <Modal isOpen={Boolean(pendingStatus)} onClose={() => !isSaving && setPendingStatus(null)} title="Confirm discount state" code="PROMOTION STATE CHANGE // LOCAL" size="sm" footer={<><Button type="button" variant="ghost" disabled={isSaving} onClick={() => setPendingStatus(null)}>Cancel</Button><Button type="button" variant={pendingStatus?.status === 'archived' ? 'danger' : 'primary'} isLoading={isSaving} onClick={() => void commitStatus()}>Confirm {pendingStatus?.status}</Button></>}>
        <p className="text-small leading-relaxed text-foreground-muted">Set <strong className="font-mono text-foreground">{pendingStatus?.discount.code}</strong> to <strong className="text-foreground">{pendingStatus?.status}</strong> in the local demo store. This is not a durable promotion or production eligibility decision.</p>
      </Modal>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{label}</dt><dd className="mt-1 break-words text-[10px] text-foreground">{value}</dd></div>;
}
