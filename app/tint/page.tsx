import Navbar from '../../components/Navbar';
import Tint from '../../components/Tint';
import Footer from '../../components/Footer';

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
