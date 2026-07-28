import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import ShopCatalog from '../../components/ShopCatalog';
import Footer from '../../components/Footer';
import { pageSeo } from '../../lib/seo';

export const metadata: Metadata = pageSeo.shop;

export default function NetverslunPage() {
  return (
    <>
      <Navbar />
      <main className="shop-page-wrap">
        <ShopCatalog />
      </main>
      <Footer />
    </>
  );
}
