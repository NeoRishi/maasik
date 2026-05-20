import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter_Tight, JetBrains_Mono, Newsreader, Noto_Serif_Devanagari } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ScrollDepthTracker } from '@/components/ScrollDepthTracker';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
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
