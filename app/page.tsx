import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import ConfiguratorHub from '../components/ConfiguratorHub';
import Gallery from '../components/Gallery';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <ConfiguratorHub />
      <Gallery />
      <Contact />
      <Footer />
    </>
  );
}
