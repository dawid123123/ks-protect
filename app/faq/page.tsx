import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';
import { pageSeo } from '../../lib/seo';

export const metadata: Metadata = pageSeo.faq;

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="faq-page">
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
