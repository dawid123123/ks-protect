import Navbar from './Navbar';
import Hero from './Hero';
import Services from './Services';
import ConfiguratorHub from './ConfiguratorHub';
import Gallery from './Gallery';
import Reviews from './Reviews';
import Contact from './Contact';
import Footer from './Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <ConfiguratorHub />
      <Gallery />
      <Reviews />
      <Contact />
      <Footer />
    </>
  );
}
