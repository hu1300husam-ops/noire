'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Section } from '@/components/layout';
import { ErrorState } from '@/components/ui';

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background pt-24 text-foreground">
      <Section spacing="lg">
        <Container size="narrow">
          <ErrorState
            code="ERR // MANIFEST-SYNC-500"
            title="Unable to Synchronize Allocation Manifest"
            description={
              error.message ||
              'A temporary service interruption prevented the allocation bag from loading. Please retry or return to the instrument archive.'
            }
            onRetry={reset}
            retryLabel="Retry Manifest Sync"
            secondaryAction={
              <Link
                href="/shop"
                className="inline-flex h-9 items-center justify-center border border-border bg-surface px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground"
              >
                Return to Archive
              </Link>
            }
          />
        </Container>
      </Section>
    </div>
  );
}
