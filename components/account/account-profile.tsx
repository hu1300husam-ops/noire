'use client';

import React, { useState } from 'react';
import { ContactRound, PencilLine } from 'lucide-react';
import type { CheckoutCustomerInfo, CustomerSession } from '@/types';
import { Button, Input, Modal, TechnicalCode } from '@/components/ui';
import { useCheckout } from '@/lib/context/checkout-context';
import { useToast } from '@/components/ui/toast';

function displayValue(value: string | undefined): string {
  return value?.trim() ? value : 'NOT PROVIDED';
}

export function AccountProfile({ session }: { session: CustomerSession }) {
  const { customer: checkoutCustomer, setCustomer } = useCheckout();
  const { addToast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState<CheckoutCustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [emailError, setEmailError] = useState('');

  const isGuest = session.status === 'guest';
  const firstName = isGuest ? checkoutCustomer.firstName : session.customer.firstName;
  const lastName = isGuest ? checkoutCustomer.lastName : session.customer.lastName;
  const email = isGuest ? checkoutCustomer.email : session.customer.email;
  const phone = isGuest ? checkoutCustomer.phone : session.customer.phone;
  const clientCode = isGuest ? 'NOT ASSIGNED' : session.customer.clientCode || 'NOT ASSIGNED';
  const memberSince = isGuest ? 'NOT RECORDED' : session.customer.memberSince || 'NOT RECORDED';

  const beginEditing = () => {
    setDraft({ ...checkoutCustomer });
    setEmailError('');
    setIsEditorOpen(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = draft.email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Enter a valid email address or leave this field blank.');
      return;
    }
    setEmailError('');
    setCustomer({
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: trimmedEmail,
      phone: draft.phone.trim(),
    });
    setIsEditorOpen(false);
    addToast({
      type: 'info',
      title: 'Checkout contact draft updated',
      description: 'This browser-session draft is not a verified or server-saved client profile.',
    });
  };

  return (
    <section id="client-profile" aria-labelledby="client-profile-heading" className="scroll-mt-28 space-y-5 sm:space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <TechnicalCode>Identity record // 05</TechnicalCode>
          <h2 id="client-profile-heading" className="mt-2 font-display text-2xl text-foreground sm:text-3xl">
            Client Profile
          </h2>
        </div>
        {isGuest && (
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<PencilLine className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={beginEditing}
          >
            Edit local draft
          </Button>
        )}
      </div>

      <div className="border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-background text-foreground-muted" aria-hidden="true">
              <ContactRound className="h-4 w-4" />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-foreground-subtle">{isGuest ? 'Guest client // local draft only' : 'Provider identity'}</p>
              <p className="mt-1 font-display text-lg text-foreground">
                {isGuest && !firstName && !lastName ? 'No contact name on file' : `${firstName} ${lastName}`.trim()}
              </p>
            </div>
          </div>
          <span className="border border-border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.11em] text-foreground-subtle">
            {isGuest ? 'Unverified' : 'Authenticated provider'}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <ProfileField label="First name" value={displayValue(firstName)} />
          <ProfileField label="Last name" value={displayValue(lastName)} />
          <ProfileField label="Email" value={displayValue(email)} />
          <ProfileField label="Phone" value={displayValue(phone)} />
          <ProfileField label="Client code" value={clientCode} />
          <ProfileField label="Member since" value={memberSince} />
        </dl>
      </div>

      {isGuest ? (
        <p className="border-s border-accent ps-4 text-[10px] leading-relaxed text-foreground-muted">
          Contact fields are sourced from the existing <code>noire_checkout_session_v1</code> form draft. Editing updates that checkout draft only; it does not create an account or verify a customer identity.
        </p>
      ) : (
        <p className="border-s border-border-strong/50 ps-4 text-[10px] leading-relaxed text-foreground-muted">
          Identity is supplied by the future customer provider. Profile updates remain disabled until an authoritative account service is connected.
        </p>
      )}

      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="Edit checkout contact draft"
        code="CLIENT PROFILE // BROWSER SESSION"
        size="md"
        footer={
          <>
            <Button type="button" variant="secondary" size="md" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="account-profile-draft" variant="primary" size="md">
              Apply draft
            </Button>
          </>
        }
      >
        <form id="account-profile-draft" onSubmit={handleSave} className="space-y-4">
          <p className="text-small leading-relaxed text-foreground-muted">
            These safe contact fields are held in the current checkout session draft. No password, payment data, or authentication credential is collected here.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="First name" autoComplete="given-name" value={draft.firstName} onChange={(event) => setDraft((current) => ({ ...current, firstName: event.target.value }))} />
            <Input label="Last name" autoComplete="family-name" value={draft.lastName} onChange={(event) => setDraft((current) => ({ ...current, lastName: event.target.value }))} />
            <Input label="Email" type="email" autoComplete="email" value={draft.email} error={emailError} onChange={(event) => { setDraft((current) => ({ ...current, email: event.target.value })); if (emailError) setEmailError(''); }} />
            <Input label="Phone" type="tel" autoComplete="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} />
          </div>
        </form>
      </Modal>
    </section>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-border-subtle pb-3">
      <dt className="font-mono text-[8px] uppercase tracking-[0.12em] text-foreground-subtle">{label}</dt>
      <dd className="mt-1.5 break-words text-small text-foreground">{value}</dd>
    </div>
  );
}
