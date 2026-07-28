import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import About from '../../components/About';
import Footer from '../../components/Footer';
import { pageSeo } from '../../lib/seo';

export const metadata: Metadata = pageSeo.about;

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="about-page">
        <About />
      </main>
      <Footer />
    </>
  );
}
