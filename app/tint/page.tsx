import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Tint from '../../components/Tint';
import Footer from '../../components/Footer';
import { pageSeo } from '../../lib/seo';

export const metadata: Metadata = pageSeo.tint;

export default function TintPage() {
  return (
    <>
      <Navbar />
      <main className="configurator-page">
        <Tint />
      </main>
      <Footer />
    </>
  );
}
