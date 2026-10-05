'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/layout';
import { ErrorState } from '@/components/ui';

export default function OrderConfirmationError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="bg-background py-12 text-foreground sm:py-16">
      <Container size="wide">
        <ErrorState
          code="ERR // ORDER-RECORD-SYNC"
          title="The allocation record could not be loaded."
          description="The record may be temporarily unavailable. Retry, return to the archive, or review your allocation bag; opening this route does not alter payment or inventory."
          onRetry={reset}
          retryLabel="Retry order record"
          secondaryAction={
            <Link href="/shop" className="inline-flex min-h-11 items-center border-b border-foreground font-mono text-[10px] uppercase tracking-[0.12em]">
              Continue shopping
            </Link>
          }
        />
      </Container>
    </main>
  );
}
