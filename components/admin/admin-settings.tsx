'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CircleSlash2, Globe2, Mail, MapPin, ShieldCheck, Store, WalletCards } from 'lucide-react';
import { Badge, ErrorState, TechnicalCode } from '@/components/ui';
import { AdminLocalNotice, AdminLoadingState, AdminPageHeader, AdminSurface } from '@/components/admin/admin-primitives';
import { loadAdminShippingMethods } from '@/lib/admin/actions';
import type { ShippingMethod } from '@/types';

export function AdminSettingsWorkspace() {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true); setLoadError(null);
    try { setShippingMethods(await loadAdminShippingMethods()); }
    catch (error) { setLoadError(error instanceof Error ? error.message : 'Local settings could not be read.'); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  if (isLoading) return <AdminLoadingState label="Loading local system settings" rows={5} />;
  if (loadError || !shippingMethods) return <><AdminPageHeader eyebrow="OPERATIONS // 07" title="Settings" description="Review current system boundaries without exposing credentials." /><AdminLocalNotice /><ErrorState code="ERR // SETTINGS READ" title="Settings could not be read." description={loadError ?? 'The local shipping configuration returned no data.'} onRetry={() => void load()} retryLabel="Retry settings read" /></>;

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader eyebrow="OPERATIONS // 07 · SYSTEM REGISTER" title="Store settings" description="A structured readout of current storefront conventions and integration boundaries. This surface does not expose or edit secrets." />
      <AdminLocalNotice>NOT CONNECTED — no authentication, durable backend, payment processor, live shipping provider, or outbound email service is configured for this preview.</AdminLocalNotice>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SettingsSection icon={<Store className="h-4 w-4" aria-hidden="true" />} code="STORE // IDENTITY" title="Store identity">
          <SettingRow label="Store name" value="NOIRÉ" note="Existing storefront identity." />
          <SettingRow label="Currency" value="USD" note="Current Product and Order model currency." />
          <SettingRow label="Locale" value="en" note="Root document language; regional checkout formatting is not configured." />
        </SettingsSection>

        <SettingsSection icon={<MapPin className="h-4 w-4" aria-hidden="true" />} code="FULFILLMENT // SERVICE" title="Fulfillment configuration">
          <div className="mb-3 flex items-center justify-between gap-3"><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-subtle">Demo shipping methods</span><Badge variant="warning">NOT CONNECTED</Badge></div>
          {shippingMethods.length ? (
            <ul className="divide-y divide-border border-y border-border">
              {shippingMethods.map((method) => <li key={method.id} className="flex flex-wrap items-start justify-between gap-3 py-3"><span className="min-w-0"><span className="block text-small text-foreground">{method.name}</span><span className="mt-1 block text-[10px] text-foreground-muted">{method.description}</span><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{method.carrier} · quote data only</span></span><span className="font-mono text-[10px] tabular-nums text-foreground">${method.baseCost.toFixed(2)}</span></li>)}
            </ul>
          ) : <p className="text-small text-foreground-muted">No shipping method records are available.</p>}
          <p className="mt-3 text-[10px] leading-relaxed text-foreground-subtle">Supported destination regions are not represented in the current shipping contract. No courier booking or tracking connection exists.</p>
        </SettingsSection>

        <SettingsSection icon={<WalletCards className="h-4 w-4" aria-hidden="true" />} code="CHECKOUT // SETTLEMENT" title="Checkout & payment">
          <SettingRow label="Checkout mode" value="Demo / client-side preview" note="Existing flow may record a local pending_settlement order." />
          <SettingRow label="Payment provider" value="NOT CONNECTED" note="No live authorization, capture, refund, or provider credentials." />
          <SettingRow label="Payment credentials" value="Not displayed or configured" note="No API keys, secrets, card numbers, CVC, or expiry values are available here." />
        </SettingsSection>

        <SettingsSection icon={<Mail className="h-4 w-4" aria-hidden="true" />} code="NOTIFICATIONS // DELIVERY" title="Notifications">
          <SettingRow label="Email provider" value="NOT CONNECTED" note="No SMTP or transactional email service is configured." />
          <SettingRow label="Private Dispatch registration" value="Preview interaction only" note="Existing storefront form does not create a durable subscription." />
          <SettingRow label="SMS / courier messages" value="NOT CONNECTED" note="No outbound messaging integration exists." />
        </SettingsSection>

        <SettingsSection icon={<Globe2 className="h-4 w-4" aria-hidden="true" />} code="SYSTEM // DATA MODE" title="Environment & data mode">
          <SettingRow label="Admin access" value="No authentication" note="Routes are unprotected previews. Do not expose this build as production admin." />
          <SettingRow label="Order data" value="Browser-local CommerceContext" note="Only placed orders in the current browser are visible." />
          <SettingRow label="Catalog / discounts" value="Process-memory demo service" note="Mutations reset when the server process restarts." />
          <div className="mt-4 flex items-start gap-3 border border-warning/30 bg-warning-surface/50 p-3"><CircleSlash2 className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" /><p className="text-[10px] leading-relaxed text-foreground-muted">This interface is not a security boundary. Add authentication and server-side authorization before connecting a real store.</p></div>
        </SettingsSection>

        <SettingsSection icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />} code="INTEGRATION // FUTURE" title="Backend connection points">
          <SettingRow label="Admin catalog and discounts" value="demoAdminService" note="Replace with authenticated catalog / promotion repositories." />
          <SettingRow label="Orders and client ledger" value="CommerceContext placedOrders" note="Replace with order and identity repositories; do not reuse seeded mock customer records." />
          <SettingRow label="Payment & fulfillment" value="NOT CONNECTED" note="Connect separately to verified provider state and carrier event feeds." />
        </SettingsSection>
      </div>
    </main>
  );
}

function SettingsSection({ icon, code, title, children }: { icon: React.ReactNode; code: string; title: string; children: React.ReactNode }) {
  return (
    <AdminSurface className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-border pb-3"><span className="text-accent">{icon}</span><div><TechnicalCode>{code}</TechnicalCode><h2 className="mt-1 font-display text-lg text-foreground">{title}</h2></div></div>
      {children}
    </AdminSurface>
  );
}

function SettingRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border py-3 last:border-0 sm:grid-cols-[minmax(120px,0.7fr)_minmax(0,1fr)] sm:gap-4"><dt className="font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">{label}</dt><dd className="min-w-0"><span className="break-words text-small text-foreground">{value}</span><span className="mt-1 block text-[10px] leading-relaxed text-foreground-muted">{note}</span></dd></div>
  );
}
