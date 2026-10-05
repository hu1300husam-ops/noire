/**
 * NOIRÉ — Design System Tokens
 * Single source of truth for colors, typography, spacing, grid, breakpoints, z-index, and motion physics.
 */

export const NOIRE_COLOR_TOKENS = {
  light: {
    background: '#F6F5F2', // Warm Alabaster
    foreground: '#111110', // Deep Carbon
    foregroundMuted: '#5C5A55', // Architectural Pewter
    foregroundSubtle: '#8A8780', // Muted Titanium
    surface: '#FFFFFF', // Pure Architectural Paper
    surfaceMuted: '#ECEAE4', // Warm Limestone
    surfaceElevated: '#FAF9F6', // Soft Chalk
    surfaceInverse: '#0D0D0C', // Noiré Obsidian
    surfaceInverseMuted: '#171715', // Anodized Graphite
    foregroundInverse: '#F5F4F0', // Warm Ivory
    border: '#DFDDD6', // Hairline Stone
    borderStrong: '#111110', // Structural Carbon
    borderSubtle: '#EAE8E1', // Whisper Divider
    borderInverse: '#262623', // Dark Hairline
    accent: '#8C735B', // Brushed Bronze / Warm Titanium
    accentForeground: '#FAF9F6',
    accentMuted: '#EFECE6',
    metal: '#9E9A90', // Raw Anodized Aluminum
    metalLight: '#C7C4BC',
    metalDark: '#6E6B64',
    success: '#23533D', // Botanical Green
    successSurface: '#E8F0EC',
    warning: '#946220', // Warm Amber
    warningSurface: '#F5EFE4',
    danger: '#8A2828', // Oxide Crimson
    dangerSurface: '#F4EAE9',
  },
  dark: {
    background: '#0D0D0C', // Noiré Obsidian
    foreground: '#F5F4F0', // Warm Ivory
    foregroundMuted: '#A3A098', // Brushed Pewter
    foregroundSubtle: '#6E6B64', // Dark Titanium
    surface: '#141413', // Carbon Surface
    surfaceMuted: '#1C1C1A', // Muted Graphite
    surfaceElevated: '#1F1F1D', // Elevated Obsidian
    surfaceInverse: '#F6F5F2', // Warm Alabaster
    surfaceInverseMuted: '#ECEAE4', // Warm Limestone
    foregroundInverse: '#111110', // Deep Carbon
    border: '#262623', // Dark Hairline
    borderStrong: '#F5F4F0', // Ivory Structural Line
    borderSubtle: '#1D1D1B',
    borderInverse: '#DFDDD6',
    accent: '#A88E73', // Warm Brushed Bronze
    accentForeground: '#0D0D0C',
    accentMuted: '#221F1B',
    metal: '#7D7A72',
    metalLight: '#A3A098',
    metalDark: '#4A4843',
    success: '#3E8E69',
    successSurface: '#15261E',
    warning: '#C98A38',
    warningSurface: '#281F13',
    danger: '#C44D4D',
    dangerSurface: '#2A1616',
  },
} as const;

export const NOIRE_TYPOGRAPHY_SCALE = [
  {
    role: 'Display',
    className: 'text-display font-display',
    size: 'clamp(2.5rem, 5.6vw, 5.25rem)',
    lineHeight: '0.96',
    tracking: '-0.035em',
    weight: '500',
    usage: 'Cinematic hero statements & monograph titles',
  },
  {
    role: 'H1',
    className: 'text-h1 font-display',
    size: 'clamp(2rem, 3.8vw, 3.5rem)',
    lineHeight: '1.04',
    tracking: '-0.03em',
    weight: '500',
    usage: 'Primary page headers & editorial feature headlines',
  },
  {
    role: 'H2',
    className: 'text-h2 font-display',
    size: 'clamp(1.5rem, 2.5vw, 2.375rem)',
    lineHeight: '1.12',
    tracking: '-0.025em',
    weight: '500',
    usage: 'Section headers & architectural divisions',
  },
  {
    role: 'H3',
    className: 'text-h3 font-display',
    size: 'clamp(1.1875rem, 1.6vw, 1.5rem)',
    lineHeight: '1.24',
    tracking: '-0.018em',
    weight: '500',
    usage: 'Product titles, story modules & drawer headers',
  },
  {
    role: 'Body Large',
    className: 'text-body-lg font-sans',
    size: 'clamp(1.03125rem, 1.2vw, 1.125rem)',
    lineHeight: '1.65',
    tracking: '-0.006em',
    weight: '400',
    usage: 'Editorial lead paragraphs & brand narratives',
  },
  {
    role: 'Body',
    className: 'text-body font-sans',
    size: '0.9375rem (15px)',
    lineHeight: '1.65',
    tracking: '-0.003em',
    weight: '400',
    usage: 'Primary interface copy & product descriptions',
  },
  {
    role: 'Small',
    className: 'text-small font-sans',
    size: '0.8125rem (13px)',
    lineHeight: '1.55',
    tracking: '0.004em',
    weight: '400',
    usage: 'Secondary specifications, metadata & helper text',
  },
  {
    role: 'Caption',
    className: 'text-caption font-sans',
    size: '0.75rem (12px)',
    lineHeight: '1.45',
    tracking: '0.02em',
    weight: '400',
    usage: 'Image figure captions, footnotes & timestamps',
  },
  {
    role: 'Label',
    className: 'text-label uppercase font-mono',
    size: '0.6875rem (11px)',
    lineHeight: '1.20',
    tracking: '0.14em',
    weight: '500',
    usage: 'Index numbers, model codes, eyebrows & badges',
  },
  {
    role: 'Price',
    className: 'text-price font-mono tabular-nums',
    size: '0.9375rem (15px)',
    lineHeight: '1.20',
    tracking: '-0.015em',
    weight: '500',
    usage: 'Monetary figures, inventory counts & serial metrics',
  },
  {
    role: 'Navigation',
    className: 'text-nav uppercase font-sans',
    size: '0.75rem (12px)',
    lineHeight: '1.20',
    tracking: '0.12em',
    weight: '500',
    usage: 'Global header links, filter triggers & breadcrumbs',
  },
] as const;

export const NOIRE_MOTION_TOKENS = {
  easing: {
    /** Signature high-craft deceleration curve */
    outExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
    /** Smooth symmetrical transition for drawers & modals */
    inOutCubic: [0.65, 0, 0.35, 1] as [number, number, number, number],
    /** Subtle editorial settle */
    editorial: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
  duration: {
    instant: 0.15,
    fast: 0.28,
    normal: 0.45,
    slow: 0.7,
    cinematic: 1.0,
  },
  stagger: {
    tight: 0.05,
    normal: 0.08,
    editorial: 0.12,
  },
} as const;

export const NOIRE_SPACING_TOKENS = {
  containerMaxWidth: '1440px',
  readingMaxWidth: '65ch',
  containerPadding: {
    mobile: '1.25rem (20px)',
    tablet: '3rem (48px)',
    desktop: '4rem (64px)',
  },
  sectionRhythm: {
    sm: 'clamp(3.25rem, 6vw, 5rem)',
    md: 'clamp(4.75rem, 8vw, 7.5rem)',
    lg: 'clamp(6rem, 11vw, 10rem)',
  },
  gridColumns: {
    mobile: 4,
    tablet: 8,
    desktop: 12,
  },
} as const;

export const NOIRE_BREAKPOINT_TOKENS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,
} as const;

export const NOIRE_Z_INDEX_TOKENS = {
  header: 40,
  megaMenu: 45,
  backdrop: 50,
  drawer: 55,
  modal: 60,
  toast: 70,
} as const;
