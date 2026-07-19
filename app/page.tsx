import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import ConfiguratorHub from '../components/ConfiguratorHub';
import Gallery from '../components/Gallery';
import Reviews from '../components/Reviews';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <ScrollReveal>
        <Services />
      </ScrollReveal>
      <ScrollReveal delay={80}>
        <ConfiguratorHub />
      </ScrollReveal>
      <ScrollReveal delay={120}>
        <Gallery />
      </ScrollReveal>
      <ScrollReveal delay={80}>
        <Reviews />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <Contact />
      </ScrollReveal>
      <Footer />
    </>
  );
}
