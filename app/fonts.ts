import localFont from 'next/font/local';

/**
 * Self-hosted typefaces (SIL Open Font License). Hosting them locally removes the
 * build-time dependency on Google Fonts and keeps rendering deterministic offline.
 */
export const fontDisplay = localFont({
  src: './fonts/plus-jakarta-sans-latin-wght-normal.woff2',
  weight: '200 800',
  variable: '--font-display-latin',
  display: 'swap',
});

export const fontSans = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-sans-latin',
  display: 'swap',
});

export const fontMono = localFont({
  src: './fonts/jetbrains-mono-latin-wght-normal.woff2',
  weight: '100 800',
  variable: '--font-mono',
  display: 'swap',
});

/** Arabic companion face — shares IBM Plex metrics so mixed-script lines stay aligned. */
export const fontArabic = localFont({
  src: [
    { path: './fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2', weight: '400' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-500-normal.woff2', weight: '500' },
    { path: './fonts/ibm-plex-sans-arabic-arabic-600-normal.woff2', weight: '600' },
  ],
  variable: '--font-arabic',
  display: 'swap',
});

export const fontClassNames = [
  fontDisplay.variable,
  fontSans.variable,
  fontMono.variable,
  fontArabic.variable,
].join(' ');
