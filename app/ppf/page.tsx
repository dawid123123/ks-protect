import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import PPF from '../../components/PPF';
import Footer from '../../components/Footer';
import { pageSeo } from '../../lib/seo';

export const metadata: Metadata = pageSeo.ppf;

export default function PPFPage() {
  return (
    <>
      <Navbar />
      <main className="configurator-page">
        <PPF />
      </main>
      <Footer />
    </>
  );
}
