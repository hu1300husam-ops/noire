'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, Users } from 'lucide-react';
import { Badge, Button, EmptyState, ErrorState, Input, Select } from '@/components/ui';
import { AdminLocalNotice, AdminLoadingState, AdminPageHeader } from '@/components/admin/admin-primitives';
import { useCommerce } from '@/lib/context/commerce-context';
import { deriveGuestClientLedger } from '@/lib/admin/derive';
import { formatOrderDate } from '@/lib/account/order-utils';
import { formatPrice } from '@/lib/utils';

type ClientSort = 'recent' | 'orders' | 'value' | 'name';
function readClientSort(value: string): ClientSort {
  return value === 'orders' || value === 'value' || value === 'name' ? value : 'recent';
}

export function AdminCustomersWorkspace() {
  const { placedOrders, isCartHydrated } = useCommerce();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ClientSort>('recent');
  const ledger = useMemo(() => deriveGuestClientLedger(placedOrders), [placedOrders]);
  const visibleClients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...ledger]
      .filter((client) => !normalized || `${client.name} ${client.email ?? ''} ${client.id}`.toLowerCase().includes(normalized))
      .sort((a, b) => {
        if (sort === 'orders') return b.orderCount - a.orderCount;
        if (sort === 'value') return b.totalValue - a.totalValue;
        if (sort === 'name') return a.name.localeCompare(b.name);
        return new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime();
      });
  }, [ledger, query, sort]);

  if (!isCartHydrated) return <AdminLoadingState label="Loading browser-local guest contact ledger" rows={6} />;
  if (!Array.isArray(placedOrders)) return <ErrorState code="ERR // GUEST CONTACT LEDGER" title="Contact records could not be read." description="The existing CommerceContext did not return an order list. No seeded mock customers are substituted." />;

  return (
    <main id="main-content" className="min-w-0">
      <AdminPageHeader eyebrow="OPERATIONS // 03 · GUEST CONTACTS" title="Customer ledger" description="A privacy-conscious grouping of contact details present in this browser’s placed orders. No seeded customers, registered identities, or invented histories are included." />
      <AdminLocalNotice>
        Authentication and a customer service are not connected. Every record below is classified GUEST because the current checkout context does not establish an authenticated client identity; these are local checkout contacts, not customer accounts.
      </AdminLocalNotice>
      <div className="mb-5 grid grid-cols-1 gap-3 border border-border bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
        <Input label="Find guest contact" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, local reference…" leftElement={<Search className="h-4 w-4" aria-hidden="true" />} />
        <Select label="Sort ledger" value={sort} onChange={(event) => setSort(readClientSort(event.target.value))} options={[{ label: 'Most recent order', value: 'recent' }, { label: 'Most orders', value: 'orders' }, { label: 'Highest local total', value: 'value' }, { label: 'Name A—Z', value: 'name' }]} />
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.11em] text-foreground-subtle"><span>{visibleClients.length} guest contact group{visibleClients.length === 1 ? '' : 's'}</span><span>Registered clients // 0 · identity service not connected</span></div>

      {visibleClients.length === 0 ? (
        ledger.length === 0 ? (
          <EmptyState code="CLIENT LEDGER // EMPTY" title="No guest contact records." description="A contact is available only when it appears in a browser-local placed order. No sample identities or seeded customer histories are loaded." icon={<Users className="h-5 w-5" aria-hidden="true" />} />
        ) : (
          <EmptyState code="CLIENT LEDGER // 00 MATCHES" title="No contacts match this search." description="Try another name, email, or clear the search query." primaryAction={<Button type="button" variant="outline" onClick={() => setQuery('')}>Clear search</Button>} />
        )
      ) : (
        <>
          <div className="hidden overflow-x-auto border-y border-border bg-surface xl:block">
            <table className="w-full min-w-[840px] border-collapse text-left">
              <caption className="sr-only">Guest contact groups derived from browser-local placed orders. These are not authenticated customers.</caption>
              <thead><tr className="border-b border-border bg-surface-muted/50 font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle"><th scope="col" className="px-3 py-3">Guest contact</th><th scope="col" className="px-3 py-3">Email</th><th scope="col" className="px-3 py-3">Type</th><th scope="col" className="px-3 py-3 text-right">Orders</th><th scope="col" className="px-3 py-3 text-right">Recorded total</th><th scope="col" className="px-3 py-3">Last order</th><th scope="col" className="px-3 py-3">Source</th><th scope="col" className="px-3 py-3"><span className="sr-only">Open contact dossier</span></th></tr></thead>
              <tbody>{visibleClients.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-surface-muted/30">
                  <th scope="row" className="px-3 py-4"><Link href={`/admin/customers/${encodeURIComponent(client.id)}`} className="block break-words text-[11px] font-medium text-foreground underline decoration-border underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">{client.name}</Link><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Ref // {client.anchorOrderId}</span></th>
                  <td className="max-w-[220px] truncate px-3 py-4 text-[10px] text-foreground-muted">{client.email || 'Not recorded'}</td><td className="px-3 py-4"><Badge variant="outline">GUEST</Badge></td><td className="px-3 py-4 text-right font-mono text-[10px] tabular-nums text-foreground">{client.orderCount}</td><td className="px-3 py-4 text-right font-mono text-[10px] tabular-nums text-foreground">{formatPrice(client.totalValue)}</td><td className="px-3 py-4 text-[10px] text-foreground-muted">{formatOrderDate(client.lastOrderAt)}</td><td className="px-3 py-4 font-mono text-[8px] uppercase tracking-[0.08em] text-foreground-subtle">BROWSER LOCAL</td><td className="px-3 py-4"><Link href={`/admin/customers/${encodeURIComponent(client.id)}`} aria-label={`Open guest contact dossier for ${client.name}`} className="inline-flex h-10 w-10 items-center justify-center border border-border hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"><ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <ul className="divide-y divide-border border-y border-border bg-surface xl:hidden">
            {visibleClients.map((client) => (
              <li key={client.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3"><span className="min-w-0"><Link href={`/admin/customers/${encodeURIComponent(client.id)}`} className="break-words font-display text-lg text-foreground underline decoration-border underline-offset-4">{client.name}</Link><span className="mt-1 block break-all text-[10px] text-foreground-muted">{client.email || 'Email not recorded'}</span></span><Badge variant="outline">GUEST</Badge></div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3"><div><dt className="font-mono text-[8px] uppercase text-foreground-subtle">Orders</dt><dd className="mt-1 font-mono text-small text-foreground">{client.orderCount}</dd></div><div><dt className="font-mono text-[8px] uppercase text-foreground-subtle">Recorded total</dt><dd className="mt-1 font-mono text-small text-foreground">{formatPrice(client.totalValue)}</dd></div><div><dt className="font-mono text-[8px] uppercase text-foreground-subtle">Last order</dt><dd className="mt-1 text-[10px] text-foreground">{formatOrderDate(client.lastOrderAt)}</dd></div><div><dt className="font-mono text-[8px] uppercase text-foreground-subtle">Source</dt><dd className="mt-1 text-[10px] text-foreground">Browser local</dd></div></dl>
                <Link href={`/admin/customers/${encodeURIComponent(client.id)}`} className="mt-3 inline-flex min-h-11 items-center gap-2 border-b border-border px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-foreground-muted">Open guest dossier <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {placedOrders.length > 0 && <p className="mt-4 max-w-2xl text-[10px] leading-relaxed text-foreground-subtle">Contact grouping uses the checkout email when present, otherwise the underlying order record is kept as a separate local contact. No persistent customer ID is inferred.</p>}
    </main>
  );
}
