import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PageBackground from '../components/PageBackground';
import PageEffects from '../components/PageEffects';
import Providers from '../components/Providers';
import {
  brandName,
  localBusinessJsonLd,
  pageSeo,
  seoKeywords,
  siteUrl,
} from '../lib/seo';
import { heroImage } from '../components/siteImages';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...pageSeo.home,
  applicationName: brandName,
  authors: [{ name: brandName }],
  creator: brandName,
  publisher: brandName,
  keywords: seoKeywords,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    ...pageSeo.home.openGraph,
    images: [
      {
        url: heroImage,
        width: 1200,
        height: 630,
        alt: 'KS Protect — PPF, tint, grafín og keramik húðun',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = localBusinessJsonLd();

  return (
    <html lang="is" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
