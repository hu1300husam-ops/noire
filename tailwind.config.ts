import type { Config } from 'tailwindcss';

/**
 * Allows CSS custom properties holding hex colors to work natively
 * with Tailwind's opacity modifier syntax (e.g., `bg-foreground/90`).
 */
function withAlpha(cssVar: string): string {
  return `color-mix(in srgb, var(${cssVar}) calc(<alpha-value> * 100%), transparent)`;
}

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: withAlpha('--background'),
        foreground: {
          DEFAULT: withAlpha('--foreground'),
          muted: withAlpha('--foreground-muted'),
          subtle: withAlpha('--foreground-subtle'),
          inverse: withAlpha('--foreground-inverse'),
        },
        surface: {
          DEFAULT: withAlpha('--surface'),
          muted: withAlpha('--surface-muted'),
          elevated: withAlpha('--surface-elevated'),
          inverse: withAlpha('--surface-inverse'),
          'inverse-muted': withAlpha('--surface-inverse-muted'),
        },
        border: {
          DEFAULT: withAlpha('--border'),
          strong: withAlpha('--border-strong'),
          subtle: withAlpha('--border-subtle'),
          inverse: withAlpha('--border-inverse'),
        },
        accent: {
          DEFAULT: withAlpha('--accent'),
          foreground: withAlpha('--accent-foreground'),
          muted: withAlpha('--accent-muted'),
        },
        metal: {
          DEFAULT: withAlpha('--metal'),
          light: withAlpha('--metal-light'),
          dark: withAlpha('--metal-dark'),
        },
        success: {
          DEFAULT: withAlpha('--success'),
          surface: withAlpha('--success-surface'),
        },
        warning: {
          DEFAULT: withAlpha('--warning'),
          surface: withAlpha('--warning-surface'),
        },
        danger: {
          DEFAULT: withAlpha('--danger'),
          surface: withAlpha('--danger-surface'),
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        display: [
          'clamp(2.125rem, 5.5vw, 5.25rem)',
          { lineHeight: '0.98', letterSpacing: '-0.035em', fontWeight: '500' },
        ],
        h1: [
          'clamp(1.75rem, 3.8vw, 3.5rem)',
          { lineHeight: '1.06', letterSpacing: '-0.03em', fontWeight: '500' },
        ],
        h2: [
          'clamp(1.375rem, 2.5vw, 2.375rem)',
          { lineHeight: '1.14', letterSpacing: '-0.025em', fontWeight: '500' },
        ],
        h3: [
          'clamp(1.125rem, 1.6vw, 1.5rem)',
          { lineHeight: '1.25', letterSpacing: '-0.018em', fontWeight: '500' },
        ],
        'body-lg': [
          'clamp(1rem, 1.2vw, 1.125rem)',
          { lineHeight: '1.65', letterSpacing: '-0.006em', fontWeight: '400' },
        ],
        body: [
          '0.9375rem',
          { lineHeight: '1.65', letterSpacing: '-0.003em', fontWeight: '400' },
        ],
        small: [
          '0.8125rem',
          { lineHeight: '1.55', letterSpacing: '0.004em', fontWeight: '400' },
        ],
        caption: [
          '0.75rem',
          { lineHeight: '1.45', letterSpacing: '0.02em', fontWeight: '400' },
        ],
        label: [
          '0.6875rem',
          { lineHeight: '1.25', letterSpacing: '0.14em', fontWeight: '500' },
        ],
        price: [
          '0.9375rem',
          { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '500' },
        ],
        nav: [
          '0.75rem',
          { lineHeight: '1.2', letterSpacing: '0.12em', fontWeight: '500' },
        ],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        'section-sm': 'clamp(3rem, 6vw, 5rem)',
        'section-md': 'clamp(4.25rem, 8vw, 7.5rem)',
        'section-lg': 'clamp(5.5rem, 11vw, 10rem)',
      },
      maxWidth: {
        editorial: '1440px',
        reading: '65ch',
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '3px',
        DEFAULT: '2px',
        md: '4px',
        lg: '6px',
      },
      boxShadow: {
        architectural: '0 1px 0 0 var(--border)',
        elevated: '0 20px 48px -12px rgba(13, 13, 12, 0.14)',
        modal: '0 32px 64px -16px rgba(0, 0, 0, 0.45)',
      },
      zIndex: {
        header: '40',
        mega: '45',
        backdrop: '50',
        drawer: '55',
        modal: '60',
        toast: '70',
      },
      transitionTimingFunction: {
        'noire-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'noire-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'noire-subtle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s infinite linear',
        'pulse-subtle': 'pulse-subtle 2.4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
