'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, PencilLine } from 'lucide-react';
import type { Order } from '@/types';
import type { CheckoutAddressDraft } from '@/lib/context/checkout-context';
import { Button, EmptyState, Input, Modal, TechnicalCode } from '@/components/ui';
import { useCheckout } from '@/lib/context/checkout-context';
import { useToast } from '@/components/ui/toast';

const EMPTY_ADDRESS: CheckoutAddressDraft = {
  firstName: '',
  lastName: '',
  country: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  phone: '',
  company: '',
};

function addressHasContent(address: CheckoutAddressDraft): boolean {
  return [
    address.firstName,
    address.lastName,
    address.company,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.phone,
  ].some((value) => value.trim().length > 0);
}

function printValue(value: string | undefined): string {
  return value?.trim() ? value : 'NOT PROVIDED';
}

export function AccountAddresses({ orders }: { orders: Order[] }) {
  const {
    billingSameAsShipping,
    customer,
    setBillingAddress,
    setShippingAddress,
    shippingAddress,
  } = useCheckout();
  const { addToast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState<CheckoutAddressDraft>(EMPTY_ADDRESS);
  const hasDraftAddress = addressHasContent(shippingAddress);

  const historicalDestinations = useMemo(() => {
    const seen = new Set<string>();
    return orders.flatMap((order) => {
      const address = order.shippingAddress;
      if (!address.line1.trim() && !address.city.trim() && !address.country.trim()) return [];
      const key = [address.line1, address.city, address.postalCode, address.country]
        .map((value) => value.trim().toLowerCase())
        .join('|');
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ order, address }];
    }).slice(0, 4);
  }, [orders]);

  const beginEditing = () => {
    if (hasDraftAddress) {
      setDraft({ ...shippingAddress });
    } else {
      setDraft({
        ...EMPTY_ADDRESS,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextAddress = {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      company: draft.company.trim(),
      country: draft.country.trim(),
      line1: draft.line1.trim(),
      line2: draft.line2.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      postalCode: draft.postalCode.trim(),
      phone: draft.phone.trim(),
    };
    setShippingAddress(nextAddress);
    if (billingSameAsShipping) setBillingAddress(nextAddress);
    setIsEditorOpen(false);
    addToast({
      type: 'info',
      title: 'Delivery draft updated',
      description: 'Applied to the existing checkout session only; no saved customer address was created.',
    });
  };

  return (
    <section id="delivery-register" aria-labelledby="delivery-register-heading" className="scroll-mt-28 space-y-5 sm:space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <TechnicalCode>Destination ledger // 04</TechnicalCode>
          <h2 id="delivery-register-heading" className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Delivery Register
          </h2>
          <p className="mt-2 max-w-2xl text-small leading-relaxed text-foreground-muted">
            One active delivery draft from checkout, plus destinations found on this browser&apos;s order records. Neither is an authoritative saved-address book.
          </p>
        </div>
        <Button type="button" variant="outline" size="md" leftIcon={<PencilLine className="h-3.5 w-3.5" aria-hidden="true" />} onClick={beginEditing}>
          {hasDraftAddress ? 'Edit checkout draft' : 'Add checkout draft'}
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12 xl:gap-5">
        <section aria-labelledby="current-destination-heading" className="min-w-0 border border-border bg-surface p-4 sm:p-6 xl:col-span-7">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
            <div>
              <TechnicalCode>01 // Current checkout draft</TechnicalCode>
              <h3 id="current-destination-heading" className="mt-2 font-display text-xl text-foreground">Delivery destination</h3>
            </div>
            <MapPin className="h-4 w-4 text-foreground-subtle" aria-hidden="true" />
          </div>

          {hasDraftAddress ? (
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <AddressField label="Recipient" value={`${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() || 'NOT PROVIDED'} />
              <AddressField label="Company" value={printValue(shippingAddress.company)} />
              <AddressField label="Street" value={printValue(shippingAddress.line1)} />
              <AddressField label="Address line 2" value={printValue(shippingAddress.line2)} />
              <AddressField label="City / region" value={[shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ') || 'NOT PROVIDED'} />
              <AddressField label="Postal code" value={printValue(shippingAddress.postalCode)} />
              <AddressField label="Country / region" value={printValue(shippingAddress.country)} />
              <AddressField label="Phone" value={printValue(shippingAddress.phone || customer.phone)} />
            </dl>
          ) : (
            <EmptyState
              code="DELIVERY REGISTER // EMPTY"
              title="No delivery draft is present."
              description="Add a destination to the current checkout session. It will remain a browser draft—not a permanently saved or verified customer address."
              icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
              primaryAction={<Button type="button" variant="secondary" size="md" onClick={beginEditing}>Add checkout draft</Button>}
              className="mt-5 p-5 sm:p-6"
            />
          )}

          <p className="mt-5 border-t border-border pt-4 font-mono text-[8px] uppercase leading-relaxed tracking-[0.1em] text-foreground-subtle">
            Browser session draft // used to prefill this browser&apos;s checkout delivery step
          </p>
        </section>

        <section aria-labelledby="historical-destinations-heading" className="min-w-0 border border-border bg-surface p-4 sm:p-6 xl:col-span-5">
          <div className="border-b border-border pb-4">
            <TechnicalCode>02 // Order record destinations</TechnicalCode>
            <h3 id="historical-destinations-heading" className="mt-2 font-display text-xl text-foreground">Previous consignments</h3>
          </div>
          {historicalDestinations.length > 0 ? (
            <ol className="divide-y divide-border">
              {historicalDestinations.map(({ order, address }) => (
                <li key={`${order.id}-${address.id}`} className="py-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">Historical destination // {order.orderNumber}</p>
                  <p className="mt-2 break-words text-small text-foreground">{address.firstName} {address.lastName}</p>
                  {address.company && <p className="mt-1 break-words text-small text-foreground-muted">{address.company}</p>}
                  <p className="mt-1 break-words text-small text-foreground-muted">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                  <p className="mt-1 break-words text-small text-foreground-muted">{[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}</p>
                  <p className="mt-1 break-words text-small text-foreground-muted">{address.country}</p>
                  <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-foreground-subtle">Historical record // not editable</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 border border-border bg-background p-4 text-small leading-relaxed text-foreground-muted">
              No previous destinations are present in the local order archive.
            </p>
          )}
        </section>
      </div>

      <p className="border-s border-border-strong/50 ps-4 text-[10px] leading-relaxed text-foreground-muted">
        Address changes use the project&apos;s existing checkout draft in browser session storage. No card data is stored, and no address is sent to a customer backend in this preview.
      </p>

      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="Edit delivery draft"
        code="DELIVERY REGISTER // CHECKOUT SESSION"
        size="lg"
        footer={
          <>
            <Button type="button" variant="secondary" size="md" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button type="submit" form="account-delivery-draft" variant="primary" size="md">Apply to checkout</Button>
          </>
        }
      >
        <form id="account-delivery-draft" onSubmit={handleSave} className="space-y-5">
          <p className="text-small leading-relaxed text-foreground-muted">
            This updates the existing checkout draft only. The address is not verified, permanently saved, or sent to a server from the atelier.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" autoComplete="given-name" value={draft.firstName} onChange={(event) => setDraft((current) => ({ ...current, firstName: event.target.value }))} />
            <Input label="Last name" autoComplete="family-name" value={draft.lastName} onChange={(event) => setDraft((current) => ({ ...current, lastName: event.target.value }))} />
            <Input label="Company / studio" autoComplete="organization" value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} />
            <Input label="Phone" type="tel" autoComplete="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} />
            <Input label="Street address" autoComplete="address-line1" value={draft.line1} onChange={(event) => setDraft((current) => ({ ...current, line1: event.target.value }))} />
            <Input label="Address line 2" autoComplete="address-line2" value={draft.line2} onChange={(event) => setDraft((current) => ({ ...current, line2: event.target.value }))} />
            <Input label="City" autoComplete="address-level2" value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} />
            <Input label="State / province / region" autoComplete="address-level1" value={draft.state} onChange={(event) => setDraft((current) => ({ ...current, state: event.target.value }))} />
            <Input label="Postal code" autoComplete="postal-code" value={draft.postalCode} onChange={(event) => setDraft((current) => ({ ...current, postalCode: event.target.value }))} />
            <Input label="Country / region" autoComplete="country-name" value={draft.country} onChange={(event) => setDraft((current) => ({ ...current, country: event.target.value }))} />
          </div>
        </form>
      </Modal>
    </section>
  );
}

function AddressField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-border-subtle pb-3">
      <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">{label}</dt>
      <dd className="mt-1.5 break-words text-small text-foreground">{value}</dd>
    </div>
  );
}
