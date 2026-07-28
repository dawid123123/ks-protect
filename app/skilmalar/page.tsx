import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Terms from '../../components/Terms';
import Footer from '../../components/Footer';
import { pageSeo } from '../../lib/seo';

export const metadata: Metadata = pageSeo.terms;

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="terms-page">
        <Terms />
      </main>
      <Footer />
    </>
  );
}
