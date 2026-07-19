import type { Metadata } from 'next';
import HomePage from '../../../components/HomePage';

export const metadata: Metadata = {
  title: 'KS Protect \u00b7 Preview',
  description: 'Private preview link for KS Protect.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PreviewPage() {
  return <HomePage />;
}
