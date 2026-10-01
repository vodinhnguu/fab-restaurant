import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import Header from './Header';

export default function CustomerLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0); // Chuyển trang thì cuộn lên đầu (dùng {} để không return giá trị của scrollTo)
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
