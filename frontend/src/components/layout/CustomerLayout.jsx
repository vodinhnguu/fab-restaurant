import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CartDrawer from './CartDrawer';
import FloatingContact from './FloatingContact';
import Footer from './Footer';
import Header from './Header';
import TopBar from './TopBar';

export default function CustomerLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0); // Chuyển trang thì cuộn lên đầu (dùng {} để không return giá trị của scrollTo)
  }, [pathname]);

  return (
    // pb-16: chừa chỗ cho thanh "Gọi ngay | Đặt bàn" ở đáy màn hình điện thoại (FloatingContact)
    <div className="flex min-h-screen flex-col pb-16 sm:pb-0">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingContact />
    </div>
  );
}
