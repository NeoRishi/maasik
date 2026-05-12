import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter_Tight, JetBrains_Mono, Noto_Serif_Devanagari } from 'next/font/google';
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

export const metadata: Metadata = {
  metadataBase: new URL('https://maasik.neorishi.io'),
  title: 'MAASIK — Personalized Monthly Vedic Nutrition Blueprints | NeoRishi',
  description:
    'A premium monthly nutrition guide aligned to the Vedic calendar. Personalized to your Ayurvedic constitution, city, and goals. ₹99 first month.',
  openGraph: {
    title: 'MAASIK — Your Nutrition, Aligned with the Moon',
    description:
      'Premium monthly Vedic nutrition blueprints. Calibrated to your Prakriti, your city, your goals.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAASIK — Your Nutrition, Aligned with the Moon',
    description:
      'Premium monthly Vedic nutrition blueprints. Calibrated to your Prakriti, your city, your goals.',
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
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} ${notoDevanagari.variable}`}
    >
      <body className="bg-cream text-ink font-body antialiased">
        <PostHogProvider />
        <ScrollDepthTracker />
        {children}
      </body>
    </html>
  );
}
