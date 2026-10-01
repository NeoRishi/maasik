import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ScrollDepthTracker } from '@/components/ScrollDepthTracker';

// Fonts are self-hosted from @fontsource packages (Oct 2026). next/font/google broke the
// Vercel build (Google Fonts response no longer parsed by Next 14.2.15), and self-hosting
// also removes the build-time dependency on fonts.googleapis.com. Same CSS variables as before.

const fraunces = localFont({
  src: [
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-300-italic.woff2', weight: '300', style: 'italic' },
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/fraunces/files/fraunces-latin-600-italic.woff2', weight: '600', style: 'italic' },
  ],
  variable: '--font-fraunces',
  display: 'swap',
  fallback: ['serif'],
});

const interTight = localFont({
  src: [
    { path: '../../node_modules/@fontsource/inter-tight/files/inter-tight-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter-tight/files/inter-tight-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter-tight/files/inter-tight-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter-tight/files/inter-tight-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter-tight',
  display: 'swap',
  fallback: ['sans-serif'],
});

const jetbrainsMono = localFont({
  src: [
    { path: '../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  fallback: ['monospace'],
});

const notoDevanagari = localFont({
  src: [
    { path: '../../node_modules/@fontsource/noto-serif-devanagari/files/noto-serif-devanagari-devanagari-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/noto-serif-devanagari/files/noto-serif-devanagari-devanagari-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-noto-devanagari',
  display: 'swap',
  fallback: ['serif'],
});

const newsreader = localFont({
  src: [
    { path: '../../node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/newsreader/files/newsreader-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff2', weight: '500', style: 'italic' },
  ],
  variable: '--font-newsreader',
  display: 'swap',
  fallback: ['serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://maasik.neorishi.io'),
  title: 'MAASIK | A monthly nutrition blueprint, calibrated to your rhythm',
  description:
    'A personalized 4-page nutrition blueprint, delivered each month and built around the season your body is actually in. From NeoRishi.',
  openGraph: {
    title: "Your body switches seasons. Most diet plans don't.",
    description:
      'MAASIK is a monthly nutrition blueprint, recalibrated to the season your body is actually in. 4 pages. Delivered to your inbox.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Your body switches seasons. Most diet plans don't.",
    description:
      'MAASIK is a monthly nutrition blueprint, recalibrated to the season your body is actually in. 4 pages. Delivered to your inbox.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF3E7',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} ${notoDevanagari.variable} ${newsreader.variable}`}
    >
      <body className="bg-cream text-ink font-body antialiased">
        <PostHogProvider />
        <ScrollDepthTracker />
        {children}
      </body>
    </html>
  );
}
