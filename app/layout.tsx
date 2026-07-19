import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PageBackground from '../components/PageBackground';
import PageEffects from '../components/PageEffects';
import Providers from '../components/Providers';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ksprotect.is';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'KS Protect \u00b7 PPF, Tint & Graf\u00edn',
  description:
    'Heimsklassa PPF, gluggatint og graf\u00ednv\u00f6rn \u00ed Reykjav\u00edk \u2014 stilltu verndina \u00fe\u00edna \u00e1 netinu.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="is" suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`.scroll-reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className={inter.className + ' ks-v2'}>
        <Providers>
          <PageBackground />
          <PageEffects />
          <div className="site-shell">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
