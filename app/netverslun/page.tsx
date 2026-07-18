import Navbar from '../../components/Navbar';
import ShopCatalog from '../../components/ShopCatalog';
import Footer from '../../components/Footer';

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
