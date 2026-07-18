import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import PageBackground from '../components/PageBackground';
import Providers from '../components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KS Protect \u00b7 PPF, Tint & Graf\u00edn',
  description:
    'Heimsklassa PPF, gluggatint og graf\u00ednv\u00f6rn \u00ed Reykjav\u00edk \u2014 stilltu verndina \u00fe\u00edna \u00e1 netinu.',
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
      <body className={inter.className + ' ks-v2'}>
        <Providers>
          <PageBackground />
          <div className="site-shell">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
