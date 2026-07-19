import Navbar from './Navbar';
import Hero from './Hero';
import Services from './Services';
import ConfiguratorHub from './ConfiguratorHub';
import Gallery from './Gallery';
import Reviews from './Reviews';
import Contact from './Contact';
import Footer from './Footer';
import ScrollReveal from './ScrollReveal';

export default function HomePage() {
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
