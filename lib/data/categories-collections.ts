import type { Category, Collection, JournalArticle } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-audio',
    slug: 'audio',
    name: 'Acoustic Instruments',
    shortName: 'Audio',
    indexNumber: '01',
    description:
      'Reference-grade headphones, planar transducers, and architectural room speakers milled from solid aluminum.',
    editorialStatement:
      'Engineered for uncolored acoustic truth and zero cabinet resonance.',
    heroImage:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=85',
    thumbnailImage:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
    productCount: 3,
    featuredProductSlug: 'aether-01-headphones',
  },
  {
    id: 'cat-desk',
    slug: 'desk-architecture',
    name: 'Desk Architecture',
    shortName: 'Desk',
    indexNumber: '02',
    description:
      'Modular desk risers, CNC-machined organizers, and weighted cable anchors that bring structural calm to workspaces.',
    editorialStatement:
      'Precision-machined objects that elevate the daily ritual of thought.',
    heroImage:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1400&q=85',
    thumbnailImage:
      'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=900&q=85',
    productCount: 2,
    featuredProductSlug: 'plinth-desk-system',
  },
  {
    id: 'cat-lighting',
    slug: 'lighting',
    name: 'Architectural Lighting',
    shortName: 'Lighting',
    indexNumber: '03',
    description:
      'High-CRI optical task luminaires and ambient monoliths with stepless circadian color temperature control.',
    editorialStatement:
      'Sculpted warm illumination with museum-grade CRI 98+ spectral fidelity.',
    heroImage:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1400&q=85',
    thumbnailImage:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
    productCount: 2,
    featuredProductSlug: 'solis-cantilever-lamp',
  },
  {
    id: 'cat-input',
    slug: 'tactile-input',
    name: 'Tactile Input',
    shortName: 'Input',
    indexNumber: '04',
    description:
      'Gasket-mounted mechanical instruments and rotary encoders crafted from brass and bead-blasted titanium.',
    editorialStatement:
      'Every keystroke and rotation calibrated to 0.02mm mechanical tolerance.',
    heroImage:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=85',
    thumbnailImage:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=85',
    productCount: 2,
    featuredProductSlug: 'kinetic-65-field-keyboard',
  },
  {
    id: 'cat-travel',
    slug: 'travel-carry',
    name: 'Travel & Everyday Carry',
    shortName: 'Travel',
    indexNumber: '05',
    description:
      'Solid-state GaN power cells, MagSafe field chargers, and ballistic technical folios for effortless transit.',
    editorialStatement:
      'Autonomous power and protective housing for life between cities.',
    heroImage:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1400&q=85',
    thumbnailImage:
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=85',
    productCount: 2,
    featuredProductSlug: 'nomad-solid-state-power-core',
  },
  {
    id: 'cat-smart',
    slug: 'smart-instruments',
    name: 'Smart Instruments',
    shortName: 'Instruments',
    indexNumber: '06',
    description:
      'E-ink environmental monitors and silent acoustic timepieces that respect human attention.',
    editorialStatement:
      'Calm ambient computing designed without distracting screens.',
    heroImage:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85',
    thumbnailImage:
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=85',
    productCount: 1,
    featuredProductSlug: 'chronos-e-ink-horology',
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col-monolith',
    slug: 'edition-04-monolith',
    code: 'EDITION 04 // AUTUMN-WINTER',
    title: 'The Monolith Series',
    subtitle: 'Architectural acoustics and desk instruments milled from raw 6061-T6 billet.',
    description:
      'An exploration of mass, silence, and permanence. Six interconnected instruments finished in Matte Obsidian and Raw Titanium.',
    editorialEssay:
      'Consumer electronics have long been treated as disposable plastic ephemera. With Edition 04, our Zurich and Tokyo industrial design studios stripped away decorative veneers to reveal the quiet authority of raw anodized aluminum, ceramic-coated steel, and full-grain vegetable-tanned leather.',
    heroImage:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=85',
    season: '2026 // AW',
    productIds: ['prod-01', 'prod-02', 'prod-03', 'prod-04'],
    featured: true,
  },
  {
    id: 'col-acoustic',
    slug: 'acoustic-reference',
    code: 'EDITION 03 // ACOUSTIC LAB',
    title: 'Acoustic Reference',
    subtitle: 'Planar magnetic precision and omnidirectional spatial sound.',
    description:
      'Tuned in our anechoic chamber in Zurich for mastering engineers and discerning listeners.',
    editorialEssay:
      'Sound is an architectural medium. Our acoustic instruments pair custom beryllium and planar transducers with solid aluminum enclosures that eliminate harmonic distortion.',
    heroImage:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85',
    season: 'PERMANENT COLLECTION',
    productIds: ['prod-01', 'prod-02', 'prod-11'],
    featured: true,
  },
  {
    id: 'col-architectural-desk',
    slug: 'the-architectural-desk',
    code: 'EDITION 02 // WORKSPACE',
    title: 'The Architectural Desk',
    subtitle: 'Tactile hardware, optical task lighting, and modular spatial organization.',
    description:
      'A cohesive system of desk instruments engineered to reduce cognitive friction.',
    editorialEssay:
      'A workspace should operate like a precision workshop. Every angle, cable channel, and rotary detent is calibrated for effortless physical memory.',
    heroImage:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1600&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=85',
    season: 'PERMANENT COLLECTION',
    productIds: ['prod-03', 'prod-04', 'prod-05', 'prod-09', 'prod-10'],
    featured: false,
  },
  {
    id: 'col-transit',
    slug: 'transit-and-field',
    code: 'EDITION 01 // NOMADIC',
    title: 'Transit & Field',
    subtitle: 'Autonomous power, weatherproof folios, and compact acoustic companions.',
    description:
      'Built for architects, directors, and engineers moving continuously across time zones.',
    editorialEssay:
      'When objects travel, every gram and millimeter must justify its existence.',
    heroImage:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=85',
    secondaryImage:
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=85',
    season: 'PERMANENT COLLECTION',
    productIds: ['prod-06', 'prod-07', 'prod-08', 'prod-11'],
    featured: false,
  },
];

export const MOCK_JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'art-01',
    slug: 'the-weight-of-silence-machining-solid-aluminum',
    issueNumber: 'ISSUE 14 // MATERIAL STUDY',
    category: 'Material Study',
    title: 'The Weight of Silence: Why We Machine Speakers from Solid 6061 Billet',
    subtitle:
      'Inside our Zurich metallurgy workshop where a 14-kilogram aluminum block becomes an acoustic monolith.',
    excerpt:
      'Conventional speaker enclosures rely on glued MDF panels or injection-molded polymers that flex under low-frequency pressure. We took a radically different path.',
    coverImage:
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1400&q=85',
    author: {
      name: 'Søren Lindqvist',
      role: 'Head of Industrial Design, Zurich',
    },
    publishedAt: '2026-09-18T09:00:00Z',
    readingTimeMinutes: 6,
    featured: true,
    relatedProductIds: ['prod-02', 'prod-01'],
    content: [
      'True acoustic transparency begins with what you do not hear: the enclosure itself. When a loudspeaker cabinet vibrates, it introduces secondary phase smearing that clouds transient detail.',
      'By 5-axis CNC milling the Monolith One from a single forging of 6061-T6 aerospace aluminum, internal standing waves are dissipated across an integrated sinusoidal rib matrix.',
      'Each chassis undergoes a 90-minute glass-bead blasting cycle before receiving a 45-micron Type III hard-anodized finish that resists oxidation for decades.',
    ],
  },
  {
    id: 'art-02',
    slug: 'circadian-optics-sculpting-natural-light',
    issueNumber: 'ISSUE 13 // ARCHITECTURE',
    category: 'Architecture',
    title: 'Circadian Optics: Sculpting Glare-Free Illumination for Deep Work',
    subtitle:
      'How optical waveguides and CRI 98+ phosphor arrays transform nocturnal architecture studios.',
    excerpt:
      'Artificial light often flattens physical textures and fatigues the optic nerve. In designing Solis, we studied northern skylights.',
    coverImage:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1400&q=85',
    author: {
      name: 'Elena Vance-Kuroda',
      role: 'Principal Optical Engineer',
    },
    publishedAt: '2026-08-29T09:00:00Z',
    readingTimeMinutes: 5,
    featured: true,
    relatedProductIds: ['prod-03', 'prod-09'],
    content: [
      'A luminaire should illuminate the work surface while remaining optically invisible to the eye. Using a micro-prismatic borosilicate diffuser, Solis casts a razor-defined 110cm pool of warm light with zero lateral glare.',
    ],
  },
  {
    id: 'art-03',
    slug: 'tactile-permanence-in-an-era-of-glass-screens',
    issueNumber: 'ISSUE 12 // MONOGRAPH',
    category: 'Monograph',
    title: 'Tactile Permanence in an Era of Capacitive Glass',
    subtitle:
      'Why physical knurling, weighted brass detents, and mechanical switches restore human agency.',
    excerpt:
      'As interfaces retreat behind flat panes of glass, our fingers are starved of mechanical feedback. Here is how we engineer tactile certainty.',
    coverImage:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=85',
    author: {
      name: 'Kenji Takahashi',
      role: 'Lead Mechanical Architect, Tokyo',
    },
    publishedAt: '2026-08-04T09:00:00Z',
    readingTimeMinutes: 7,
    featured: true,
    relatedProductIds: ['prod-04', 'prod-10'],
    content: [
      'When you rotate the brass volume encoder on the Kinetic-65, a custom magnetic Hall-effect indexing ring provides 72 distinct micro-detents per revolution—with zero mechanical wear.',
    ],
  },
  {
    id: 'art-04',
    slug: 'planar-magnetic-physics-two-micron-diaphragm',
    issueNumber: 'ISSUE 11 // ACOUSTIC ENGINEERING',
    category: 'Acoustic Engineering',
    title: 'Planar Magnetic Physics: Suspending a Two-Micron Film in a 1.4-Tesla Field',
    subtitle:
      'How ultra-low-mass voice coils etched onto biaxially oriented film eliminate cone breakup and phase distortion.',
    excerpt:
      'In dynamic headphones, a voice coil drives only the center of a stiff dome. Our planar transducers apply electromagnetic force uniformly across 94% of the radiating surface.',
    coverImage:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=85',
    author: {
      name: 'Dr. Lukas Meyer',
      role: 'Chief Acoustic Physicist, Zurich',
    },
    publishedAt: '2026-07-12T09:00:00Z',
    readingTimeMinutes: 8,
    featured: false,
    relatedProductIds: ['prod-01', 'prod-11'],
    content: [
      'Because electromagnetic force is distributed across the entire surface of our 2-micron diaphragm, transient edges launch as a coherent planar wavefront with less than 0.04% total harmonic distortion.',
    ],
  },
];
