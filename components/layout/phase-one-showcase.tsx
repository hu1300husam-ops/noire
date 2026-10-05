'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import {
  NOIRE_COLOR_TOKENS,
  NOIRE_TYPOGRAPHY_SCALE,
  NOIRE_MOTION_TOKENS,
} from '@/lib/design-system/tokens';
import {
  Container,
  Section,
  ArchitecturalGrid,
  EditorialSplit,
  AspectMedia,
  SectionHeader,
} from '@/components/layout';
import {
  Button,
  Input,
  Select,
  Badge,
  ProductBadge,
  StockStatusIndicator,
  Heading,
  Text,
  TechnicalCode,
  PriceDisplay,
  QuantitySelector,
  ColorSwatchGroup,
  Divider,
  Skeleton,
  EmptyState,
  ErrorState,
  Checkbox,
  Switch,
  Drawer,
  Modal,
  Accordion,
  Tabs,
  useToast,
} from '@/components/ui';
import {
  FadeIn,
  SlideUp,
  StaggerContainer,
  StaggerItem,
  ImageReveal,
  RevealText,
} from '@/components/motion';
import type { Product, Category, Collection, DashboardStats } from '@/types';

interface PhaseOneShowcaseProps {
  sampleProducts: Product[];
  categories: Category[];
  collections: Collection[];
  dashboardStats: DashboardStats;
}

export function PhaseOneShowcase({
  sampleProducts,
  categories,
  collections,
  dashboardStats,
}: PhaseOneShowcaseProps) {
  const { addToast } = useToast();
  const flagship = sampleProducts[0];

  const [selectedColor, setSelectedColor] = useState(flagship.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motionKey, setMotionKey] = useState(0);
  const [globalDarkPreview, setGlobalDarkPreview] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [ancTelemetry, setAncTelemetry] = useState(true);

  const handleMultiToastTest = () => {
    addToast({
      type: 'cart',
      title: `${flagship.name} allocated`,
      description: `${selectedColor.name} — ${flagship.modelNumber}`,
    });
    window.setTimeout(() => {
      addToast({
        type: 'wishlist',
        title: 'Saved to Private Archive',
        description: sampleProducts[1]?.modelNumber ?? 'NR-02 // MONOLITH',
      });
    }, 120);
    window.setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Calibration Certificate Verified',
        description: 'Zurich Acoustic Lab // Serial #0084',
      });
    }, 240);
  };

  return (
    <div
      className={
        globalDarkPreview
          ? 'surface-obsidian min-h-screen bg-background text-foreground'
          : 'min-h-screen bg-background text-foreground'
      }
    >
      {/* Top Architectural Status Bar — 320px to 1920px responsive */}
      <header className="sticky top-0 z-header border-b border-border bg-background/90 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="shrink-0 font-display text-base font-semibold tracking-[0.22em] text-foreground sm:text-lg">
              NOIRÉ
            </span>
            <span className="hidden h-4 w-px bg-border lg:inline-block" />
            <TechnicalCode className="hidden truncate lg:inline-block">
              {'PHASE 01 // VALIDATED FOUNDATION & DESIGN SYSTEM'}
            </TechnicalCode>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Badge
              variant="success"
              withDot
              className="hidden md:inline-flex"
            >
              FOUNDATION VALIDATED
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setGlobalDarkPreview((prev) => !prev)}
            >
              <span className="sm:hidden">
                {globalDarkPreview ? 'Alabaster' : 'Obsidian'}
              </span>
              <span className="hidden sm:inline">
                {globalDarkPreview
                  ? 'Switch to Alabaster (Light)'
                  : 'Switch to Obsidian (Dark)'}
              </span>
            </Button>
          </div>
        </Container>
      </header>

      {/* 00. Monograph Introduction */}
      <Section spacing="md" borderBottom>
        <Container>
          <FadeIn>
            <div className="mb-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Badge variant="obsidian">PHASE 01 VALIDATED</Badge>
              <Badge variant="outline">COLOR-MIX ALPHA TOKENS</Badge>
              <Badge variant="outline">WCAG AA & FOCUS TRAP</Badge>
            </div>
            <Heading as="h1" size="display" className="max-w-4xl tracking-tight">
              <RevealText text="Precision Hardware." />{' '}
              <span className="text-foreground-muted">
                Editorial Digital Architecture.
              </span>
            </Heading>
            <Text size="body-lg" tone="muted" measure className="mt-6">
              This interactive specification validates the Phase 01 foundation
              for <strong className="font-medium text-foreground">NOIRÉ</strong>:
              semantic color polarity with native alpha-channel support,
              polymorphic typography primitives, single-responsibility UI
              modules, focus-trapped accessible overlays, and a backend-ready
              service layer.
            </Text>
          </FadeIn>

          <StaggerContainer className="mt-10 grid grid-cols-1 gap-5 border-t border-border pt-8 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem className="space-y-1 border-b border-border pb-4 sm:border-b-0 sm:pb-0">
              <TechnicalCode>{'01 // CATALOG MODELS'}</TechnicalCode>
              <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
                {sampleProducts.length} Instruments
              </p>
              <Text size="caption" tone="muted">
                Across {categories.length} dynamically counted categories
              </Text>
            </StaggerItem>
            <StaggerItem className="space-y-1 border-b border-border pb-4 sm:border-b-0 sm:pb-0">
              <TechnicalCode>{'02 // CURATED EDITIONS'}</TechnicalCode>
              <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
                0{collections.length} Collections
              </p>
              <Text size="caption" tone="muted">
                {'Including Edition 04 // Monolith'}
              </Text>
            </StaggerItem>
            <StaggerItem className="space-y-1 border-b border-border pb-4 sm:border-b-0 sm:pb-0">
              <TechnicalCode>{'03 // MODULAR PRIMITIVES'}</TechnicalCode>
              <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
                18 UI Modules
              </p>
              <Text size="caption" tone="muted">
                Single-responsibility + WAI-ARIA keyboard nav
              </Text>
            </StaggerItem>
            <StaggerItem className="space-y-1">
              <TechnicalCode>{'04 // MOCK TELEMETRY'}</TechnicalCode>
              <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
                ${(dashboardStats.totalRevenue / 1000).toFixed(1)}k
              </p>
              <Text size="caption" tone="muted">
                Simulated YTD revenue across {dashboardStats.totalOrders} orders
              </Text>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </Section>

      {/* 01. Semantic Color System */}
      <Section spacing="md" borderBottom>
        <Container>
          <SectionHeader
            index="01"
            eyebrow="SEMANTIC COLOR SYSTEM"
            title="Light Alabaster & Strategic Obsidian Polarity"
            description="Powered by CSS custom properties and color-mix(in srgb, ...) so every token supports native Tailwind alpha modifiers (e.g., bg-foreground/90, border-accent/40)."
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Light Surface Tokens */}
            <div className="border border-border bg-surface p-5 sm:p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <span className="font-mono text-label uppercase text-foreground">
                  {'PALETTE A // WARM ALABASTER (DEFAULT)'}
                </span>
                <TechnicalCode>:root</TechnicalCode>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {[
                  { name: 'background', hex: NOIRE_COLOR_TOKENS.light.background },
                  { name: 'surface', hex: NOIRE_COLOR_TOKENS.light.surface },
                  { name: 'surface-muted', hex: NOIRE_COLOR_TOKENS.light.surfaceMuted },
                  { name: 'foreground', hex: NOIRE_COLOR_TOKENS.light.foreground },
                  { name: 'accent', hex: NOIRE_COLOR_TOKENS.light.accent },
                  { name: 'metal', hex: NOIRE_COLOR_TOKENS.light.metal },
                ].map((swatch) => (
                  <div
                    key={swatch.name}
                    className="min-w-0 space-y-2 border border-border p-2.5 sm:p-3"
                  >
                    <div
                      className="h-10 w-full border border-black/10 sm:h-12"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-medium text-foreground">
                        {swatch.name}
                      </p>
                      <p className="font-mono text-[11px] text-foreground-subtle">
                        {swatch.hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Obsidian Dark Surface Tokens */}
            <div className="surface-obsidian border border-border bg-background p-5 text-foreground sm:p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <span className="font-mono text-label uppercase text-foreground">
                  {'PALETTE B // NOIRÉ OBSIDIAN (DARK SCOPE)'}
                </span>
                <TechnicalCode>.surface-obsidian</TechnicalCode>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {[
                  { name: 'background', hex: NOIRE_COLOR_TOKENS.dark.background },
                  { name: 'surface', hex: NOIRE_COLOR_TOKENS.dark.surface },
                  { name: 'surface-muted', hex: NOIRE_COLOR_TOKENS.dark.surfaceMuted },
                  { name: 'foreground', hex: NOIRE_COLOR_TOKENS.dark.foreground },
                  { name: 'accent', hex: NOIRE_COLOR_TOKENS.dark.accent },
                  { name: 'border', hex: NOIRE_COLOR_TOKENS.dark.border },
                ].map((swatch) => (
                  <div
                    key={swatch.name}
                    className="min-w-0 space-y-2 border border-border p-2.5 sm:p-3"
                  >
                    <div
                      className="h-10 w-full border border-white/15 sm:h-12"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-medium text-foreground">
                        {swatch.name}
                      </p>
                      <p className="font-mono text-[11px] text-foreground-subtle">
                        {swatch.hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 02. Typography Hierarchy */}
      <Section spacing="md" tone="surface" borderBottom>
        <Container>
          <SectionHeader
            index="02"
            eyebrow="TYPOGRAPHIC SCALE"
            title="Optical Hierarchy & Technical Monospace"
            description="Enforced via both utility tokens and polymorphic <Heading>, <Text>, <Eyebrow>, and <TechnicalCode> primitives."
          />

          <div className="divide-y divide-border border-y border-border">
            {NOIRE_TYPOGRAPHY_SCALE.map((spec, idx) => (
              <div
                key={spec.role}
                className="grid grid-cols-1 items-baseline gap-3 py-5 sm:gap-4 sm:py-6 md:grid-cols-12"
              >
                <div className="space-y-1 md:col-span-3">
                  <div className="flex items-center gap-2">
                    <TechnicalCode>
                      {String(idx + 1).padStart(2, '0')}
                    </TechnicalCode>
                    <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-foreground">
                      {spec.role}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-foreground-subtle">
                    {spec.size} · LH {spec.lineHeight} · {spec.tracking}
                  </p>
                </div>

                <div className="min-w-0 break-words md:col-span-6">
                  <p className={spec.className}>
                    {spec.role === 'Price'
                      ? '$1,650.00 // NR-02 MONOLITH'
                      : spec.role === 'Label'
                      ? 'EDITION 04 // ACOUSTIC REFERENCE SERIES'
                      : spec.role === 'Navigation'
                      ? 'SHOP · COLLECTIONS · MONOGRAPH · ARCHIVE'
                      : 'Form follows acoustic truth.'}
                  </p>
                </div>

                <div className="md:col-span-3 md:text-right">
                  <Text as="span" size="caption" tone="muted">
                    {spec.usage}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 03. Core UI Primitives Workbench */}
      <Section spacing="md" borderBottom>
        <Container>
          <SectionHeader
            index="03"
            eyebrow="CORE UI PRIMITIVES"
            title="Modular Controls, Selection Hardware, Overlays & States"
            description="Every primitive lives in its own single-responsibility module under components/ui/ with strict TypeScript interfaces and full keyboard navigation."
          />

          <ArchitecturalGrid gap="default">
            {/* Buttons, Badges, Checkboxes & Switches */}
            <div className="col-span-4 space-y-8 border border-border bg-surface p-5 sm:p-6 md:col-span-4 md:p-8 lg:col-span-6">
              <Divider label="03.A // BUTTON SYSTEM" />
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <Button variant="primary" withArrow="right">
                  Primary Action
                </Button>
                <Button variant="secondary">Secondary Surface</Button>
                <Button variant="outline" withArrow="up-right">
                  Architectural Outline
                </Button>
                <Button variant="accent">Brushed Bronze</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="editorial" withArrow="right">
                  Editorial Link
                </Button>
                <Button variant="primary" isLoading>
                  Calibrating
                </Button>
              </div>

              <Divider label="03.B // BADGES & STOCK TELEMETRY" />
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <ProductBadge type="new_release" />
                  <ProductBadge type="limited_edition" />
                  <ProductBadge type="archival" />
                  <ProductBadge type="award_winner" />
                  <Badge variant="success" withDot>
                    QC PASSED
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <StockStatusIndicator status="in_stock" />
                  <StockStatusIndicator status="low_stock" inventoryCount={5} />
                  <StockStatusIndicator status="pre_order" />
                </div>
              </div>

              <Divider label="03.C // CHECKBOX & SWITCH PRIMITIVES" />
              <div className="space-y-4">
                <Checkbox
                  checked={inStockOnly}
                  onChange={setInStockOnly}
                  label="In-Stock Catalog Status Only"
                  description="Filter the demo catalog availability value; live inventory and dispatch are not verified."
                  count={10}
                />
                <Switch
                  checked={ancTelemetry}
                  onChange={setAncTelemetry}
                  label="Adaptive Chamber ANC Telemetry"
                  description="Real-time 8-microphone acoustic phase calibration."
                />
              </div>

              <Divider label="03.D // OVERLAYS & MULTI-TOAST TRIGGERS" />
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Open Drawer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  Open Modal
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMultiToastTest}
                >
                  Trigger Multi-Toast Burst (3x)
                </Button>
              </div>
            </div>

            {/* Commerce Controls & Inputs */}
            <div className="col-span-4 space-y-8 border border-border bg-surface p-5 sm:p-6 md:col-span-4 md:p-8 lg:col-span-6">
              <Divider label="03.E // COMMERCE HARDWARE CONTROLS" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <TechnicalCode>PRICE DISPLAY & DISCOUNT</TechnicalCode>
                  <div>
                    <PriceDisplay
                      price={flagship.price}
                      compareAtPrice={flagship.compareAtPrice}
                      size="lg"
                      showDiscountBadge
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <TechnicalCode>QUANTITY STEPPER</TechnicalCode>
                  <div>
                    <QuantitySelector
                      value={quantity}
                      onChange={setQuantity}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <ColorSwatchGroup
                  colors={flagship.colors}
                  selectedColorId={selectedColor.id}
                  onSelect={setSelectedColor}
                  showLabel
                />
                <div className="space-y-2">
                  <TechnicalCode>REVIEW DATA</TechnicalCode>
                  <p className="text-small leading-relaxed text-foreground-muted">
                    Verified client review data is not connected in this preview.
                  </p>
                </div>
              </div>

              <Divider label="03.F // ARCHITECTURAL & EDITORIAL INPUTS" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Serial or Model Number"
                  codeLabel="REQ // 01"
                  placeholder="e.g. NR-01 // AETHER"
                />
                <Select
                  label="Dispatch Hub"
                  options={[
                    { label: 'Zurich Bonded Warehouse (CH)', value: 'zurich' },
                    { label: 'Tokyo Atelier (JP)', value: 'tokyo' },
                    { label: 'New York Logistics (US)', value: 'ny' },
                  ]}
                />
              </div>
              <Input
                variant="editorial"
                label="Private Client Dispatch Dossier (Editorial Underline Variant)"
                placeholder="Enter architectural studio email..."
                hint="Press Tab to verify accessible focus indicator."
              />
            </div>
          </ArchitecturalGrid>

          {/* Accordion & Dual Independent Tabs Instances Verification */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="border border-border bg-surface p-5 sm:p-6 md:p-8">
              <Divider
                label="03.G // ACCORDION & SECONDARY TABS INSTANCE"
                className="mb-4"
              />
              <Accordion
                defaultOpenIds={['acc-1']}
                items={[
                  {
                    id: 'acc-1',
                    index: '01',
                    title: 'Acoustic Chamber & Transducer Calibration',
                    content:
                      'Every NR-01 and NR-02 instrument is individually swept in our Zurich anechoic chamber and shipped with its serialized frequency response certificate.',
                  },
                  {
                    id: 'acc-2',
                    index: '02',
                    title: 'Materials & Anodization Longevity',
                    content:
                      'We utilize 45-micron Type III hard anodization over glass-bead blasted 6061-T6 aluminum for permanent resistance to skin oils and surface abrasion.',
                  },
                ]}
              />

              <div className="mt-6 pt-2">
                <TechnicalCode className="mb-2 block">
                  {'TABS INSTANCE #01 (ISOLATED LAYOUT-ID)'}
                </TechnicalCode>
                <Tabs
                  ariaLabel="Workshop locations"
                  items={[
                    {
                      id: 'loc-zurich',
                      label: 'Zurich Lab',
                      content: (
                        <Text size="small" tone="muted">
                          Primary acoustic anechoic chamber and 5-axis CNC billet milling facility.
                        </Text>
                      ),
                    },
                    {
                      id: 'loc-tokyo',
                      label: 'Tokyo Atelier',
                      content: (
                        <Text size="small" tone="muted">
                          Precision mechanical switch engineering, rotary encoders, and solid-state power telemetry.
                        </Text>
                      ),
                    },
                  ]}
                />
              </div>
            </div>

            <div className="border border-border bg-surface p-5 sm:p-6 md:p-8">
              <Divider
                label="03.H // TABS INSTANCE #02 (STATES & SERVICE DATA)"
                className="mb-4"
              />
              <Tabs
                ariaLabel="System state specimens"
                items={[
                  {
                    id: 'tab-specs',
                    label: 'Live Service',
                    count: sampleProducts.length,
                    content: (
                      <div className="space-y-3">
                        {sampleProducts.slice(0, 4).map((prod) => (
                          <div
                            key={prod.id}
                            className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-none"
                          >
                            <div className="min-w-0">
                              <TechnicalCode>{prod.modelNumber}</TechnicalCode>
                              <p className="truncate font-display text-sm font-medium text-foreground">
                                {prod.name}
                              </p>
                            </div>
                            <PriceDisplay price={prod.price} size="sm" />
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  {
                    id: 'tab-empty',
                    label: 'Empty State',
                    content: (
                      <EmptyState
                        code="ARCHIVE // 00"
                        title="No Instruments Match Filter Criteria"
                        description="Every empty, loading, and error state in NOIRÉ is intentionally designed rather than left as plain text."
                        className="p-5 sm:p-6"
                      />
                    ),
                  },
                  {
                    id: 'tab-error',
                    label: 'Error State',
                    content: (
                      <ErrorState
                        code="ERR // TELEMETRY-503"
                        title="Telemetry Sync Interrupted"
                        description="Designed error primitive with diagnostic status code and retry trigger."
                        onRetry={() =>
                          addToast({
                            type: 'success',
                            title: 'Telemetry Reconnected',
                            description: 'Zurich node responded in 18ms.',
                          })
                        }
                        className="p-5 sm:p-6"
                      />
                    ),
                  },
                  {
                    id: 'tab-skeleton',
                    label: 'Shimmer',
                    content: (
                      <div className="space-y-3 pt-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-20 w-full" />
                        <div className="grid grid-cols-3 gap-3">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* 04. Motion & Responsive Layout Primitives */}
      <Section spacing="md" tone="obsidian">
        <Container>
          <SectionHeader
            index="04"
            eyebrow="MOTION & EDITORIAL SPLIT ARCHITECTURE"
            title="Expensive, Restrained & Reduced-Motion Aware"
            description="Powered by shared variant builders in lib/design-system/motion-variants.ts and our asymmetrical EditorialSplit + AspectMedia layout primitives."
            action={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={() => setMotionKey((prev) => prev + 1)}
              >
                Replay Motion Sequence
              </Button>
            }
          />

          <div key={motionKey}>
            <EditorialSplit
              ratio="5-7"
              left={
                <AspectMedia
                  aspect="landscape"
                  figureCode="FIG 01 // IMAGEREVEAL"
                  caption={`1.06x → 1.00x optical lens settle (${NOIRE_MOTION_TOKENS.duration.cinematic}s)`}
                >
                  <ImageReveal className="h-full w-full">
                    <img
                      src={flagship.primaryImage}
                      alt={flagship.name}
                      className="h-full w-full object-cover"
                    />
                  </ImageReveal>
                </AspectMedia>
              }
              right={
                <div className="flex h-full flex-col justify-between space-y-6">
                  <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categories.map((cat) => (
                      <StaggerItem
                        key={cat.id}
                        className="border border-border bg-surface p-5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-label text-accent">
                            {cat.indexNumber} {'//'} {cat.shortName}
                          </span>
                          <TechnicalCode>
                            {cat.productCount}{' '}
                            {cat.productCount === 1 ? 'Model' : 'Models'}
                          </TechnicalCode>
                        </div>
                        <h3 className="mt-2 font-display text-base font-medium text-foreground">
                          {cat.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-small text-foreground-muted">
                          {cat.editorialStatement}
                        </p>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>

                  <SlideUp className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface p-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                      <span className="font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                        PHASE 01 VALIDATION COMPLETE — READY FOR PHASE 02
                      </span>
                    </div>
                    <TechnicalCode>Curve: [0.16, 1, 0.3, 1]</TechnicalCode>
                  </SlideUp>
                </div>
              }
            />
          </div>
        </Container>
      </Section>

      {/* Drawer Demo */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        subtitle="PRIMITIVE // DRAWER"
        title="Allocation Bag Preview"
        footer={
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="uppercase text-foreground-muted">Subtotal</span>
              <span className="text-foreground">$890.00</span>
            </div>
            <Button
              variant="primary"
              fullWidth
              withArrow="right"
              onClick={() => setIsDrawerOpen(false)}
            >
              Close Drawer Specimen
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Text size="body" tone="muted">
            Powered by <code className="font-mono text-xs">useOverlayBehavior</code>:
            supports keyboard focus trapping, scrollbar-width compensation, Escape
            dismissal, and focus restoration upon close.
          </Text>
          <div className="flex gap-4 border border-border bg-surface p-4">
            <img
              src={flagship.primaryImage}
              alt={flagship.name}
              className="h-20 w-20 shrink-0 object-cover"
            />
            <div className="min-w-0 space-y-1">
              <TechnicalCode>{flagship.modelNumber}</TechnicalCode>
              <h4 className="truncate font-display text-sm font-medium text-foreground">
                {flagship.name}
              </h4>
              <p className="text-caption text-foreground-muted">
                Finish: {selectedColor.name}
              </p>
              <PriceDisplay price={flagship.price} size="sm" />
            </div>
          </div>
        </div>
      </Drawer>

      {/* Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        code="PRIMITIVE // MODAL DIALOG"
        title="Acoustic Calibration Certificate"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Confirm Calibration
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Text size="body" tone="muted">
            Shares the unified{' '}
            <code className="font-mono text-xs">useOverlayBehavior</code> hook
            with Drawer—zero duplicated scroll-lock or keyboard listener code.
          </Text>
          <div className="grid grid-cols-1 gap-3 border border-border bg-surface-muted p-4 font-mono sm:grid-cols-3 sm:gap-4">
            <div>
              <span className="text-[10px] uppercase text-foreground-subtle">
                TRANSDUCER
              </span>
              <p className="text-sm font-medium text-foreground">50mm Planar</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-foreground-subtle">
                THD @ 1KHZ
              </span>
              <p className="text-sm font-medium text-foreground">&lt; 0.04%</p>
            </div>
            <div>
              <span className="text-[10px] uppercase text-foreground-subtle">
                HOUSING
              </span>
              <p className="text-sm font-medium text-foreground">
                6061-T6 Billet
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
