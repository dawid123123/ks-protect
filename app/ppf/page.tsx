import Navbar from '../../components/Navbar';
import PPF from '../../components/PPF';
import Footer from '../../components/Footer';

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
