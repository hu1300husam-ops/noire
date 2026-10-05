'use client';

import React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { ErrorState } from '@/components/ui';

export default function CheckoutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="bg-background py-12 text-foreground sm:py-16">
      <Container size="wide">
        <ErrorState
          code="ERR // SETTLEMENT-DOSSIER"
          title="The settlement dossier could not be synchronized."
          description="Your allocation bag and safe checkout draft remain available. Retry the dossier or return to the bag; no payment has been attempted."
          onRetry={reset}
          retryLabel="Retry checkout"
          secondaryAction={
            <Link
              href="/cart"
              className="inline-flex min-h-11 items-center border-b border-foreground font-mono text-[10px] uppercase tracking-[0.12em]"
            >
              Return to allocation bag
            </Link>
          }
          className="min-h-[320px]"
        />
      </Container>
    </main>
  );
}
