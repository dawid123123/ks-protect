import Navbar from '../../components/Navbar';
import Terms from '../../components/Terms';
import Footer from '../../components/Footer';

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
