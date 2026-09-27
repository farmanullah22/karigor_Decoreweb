import { Outlet } from 'react-router-dom';

import Footer from '../components/public/Footer';
import Navbar from '../components/public/Navbar';
import WhatsAppFloat from '../components/public/WhatsAppFloat';

/** Public site shell: navbar, page content, footer and floating WhatsApp. */
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
