import Navbar from '../../components/Navbar';
import FAQ from '../../components/FAQ';
import Footer from '../../components/Footer';

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
