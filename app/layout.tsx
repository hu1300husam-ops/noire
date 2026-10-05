import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { NoireProviders } from '@/components/layout/providers';

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const fontSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NOIRÉ — Precision Technology & Architectural Lifestyle Objects',
    template: '%s — NOIRÉ',
  },
  description:
    'Curated acoustic instruments, architectural lighting, tactile mechanical input, and nomadic power systems designed in Zurich and Tokyo.',
  keywords: [
    'NOIRÉ',
    'industrial design',
    'planar headphones',
    'architectural lighting',
    'mechanical keyboard',
    'desk architecture',
    'premium technology',
  ],
  openGraph: {
    title: 'NOIRÉ — Precision Technology & Architectural Lifestyle Objects',
    description:
      'Curated acoustic instruments, architectural lighting, tactile mechanical input, and nomadic power systems.',
    siteName: 'NOIRÉ',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-foreground selection:text-background">
        <NoireProviders>{children}</NoireProviders>
      </body>
    </html>
  );
}
