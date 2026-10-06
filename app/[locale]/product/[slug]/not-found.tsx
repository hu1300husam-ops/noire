import React from 'react';
import { Link } from '@/i18n/navigation';
import { Compass, ArrowUpRight } from 'lucide-react';
import {
  MOCK_CATEGORIES,
  MOCK_COLLECTIONS,
  MOCK_PRODUCTS,
} from '@/lib/data';
import { Container, Section } from '@/components/layout';
import { EmptyState, Eyebrow } from '@/components/ui';
import { GlobalHeader, GlobalFooter } from '@/components/navigation';
import { ProductCard, QuickViewModal } from '@/components/product';

export default function ProductNotFound() {
  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.featured).slice(0, 3);
  const spotlightProduct =
    MOCK_PRODUCTS.find((p) => p.isSpotlight) ?? MOCK_PRODUCTS[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalHeader
        categories={MOCK_CATEGORIES}
        collections={MOCK_COLLECTIONS}
        featuredProducts={featuredProducts}
        spotlightProduct={spotlightProduct}
        allowTransparentTop={false}
      />

      <main id="main-content" className="pt-20 sm:pt-24">
        <Section spacing="md" borderBottom>
          <Container size="wide">
            <EmptyState
              code="ERR // 404 — SERIAL NUMBER UNRECOGNIZED"
              title="Requested Instrument Dossier Not Found"
              description="The instrument slug or serial reference you entered does not correspond to an active object in the NOIRÉ archive. It may have been retired to the permanent museum collection or mistyped."
              icon={<Compass className="h-5 w-5" />}
              primaryAction={
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center gap-2 border border-foreground bg-foreground px-6 font-mono text-xs uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90"
                >
                  <span>Enter Complete Archive</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
              secondaryAction={
                <Link
                  href="/"
                  className="inline-flex h-11 items-center border border-border bg-surface px-6 font-mono text-xs uppercase tracking-[0.14em] text-foreground transition-colors hover:border-foreground"
                >
                  Return to Flagship Home
                </Link>
              }
            />
          </Container>
        </Section>

        {/* Suggested Active Instruments */}
        <Section spacing="md" tone="muted">
          <Container size="wide">
            <div className="mb-8 space-y-2">
              <Eyebrow index="01" tone="accent">
                ACTIVE ALLOCATIONS
              </Eyebrow>
              <h2 className="font-display text-h2 tracking-tight text-foreground">
                Featured Serialized Instruments
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  indexLabel={`0${idx + 1} // FEATURED`}
                />
              ))}
            </div>
          </Container>
        </Section>
      </main>

      <GlobalFooter
        categories={MOCK_CATEGORIES}
        collections={MOCK_COLLECTIONS}
      />
      <QuickViewModal />
    </div>
  );
}
