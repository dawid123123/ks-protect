import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PageBackground from '../components/PageBackground';
import PageEffects from '../components/PageEffects';
import Providers from '../components/Providers';
import { heroImage } from '../components/siteImages';
import { isDemo } from '../lib/brand';

const inter = Inter({ subsets: ['latin'] });

const siteDescription = isDemo
  ? 'Sýnishorn af sniðmáti — PPF, tint og grafín. Merki og texti verða sérsniðin.'
  : 'Heimsklassa PPF, gluggatint og graf\u00ednv\u00f6rn \u00ed Reykjav\u00edk \u2014 stilltu verndina \u00fe\u00edna \u00e1 netinu.';

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return 'https://' + process.env.VERCEL_URL;
  }

  return 'https://ksprotect.is';
}

const siteUrl = getSiteUrl();
const brandName = isDemo ? 'Sniðmát' : 'KS Protect';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: isDemo
    ? 'Sniðmát · PPF, Tint & Grafín'
    : 'KS Protect \u00b7 PPF, Tint & Graf\u00edn',
  description: siteDescription,
  applicationName: brandName,
  authors: [{ name: brandName }],
  creator: brandName,
  publisher: brandName,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  openGraph: {
    type: 'website',
    locale: 'is_IS',
    alternateLocale: ['en_US'],
    url: siteUrl,
    siteName: 'KS Protect',
    title: 'KS Protect \u00b7 PPF, Tint & Graf\u00edn',
    description: siteDescription,
    images: [
      {
        url: heroImage,
        width: 1200,
        height: 630,
        alt: 'KS Protect \u2014 PPF, tint og graf\u00ednv\u00f6rn \u00ed Reykjav\u00edk',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KS Protect \u00b7 PPF, Tint & Graf\u00edn',
    description: siteDescription,
    images: [heroImage],
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
