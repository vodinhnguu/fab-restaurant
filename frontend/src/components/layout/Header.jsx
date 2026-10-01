import clsx from 'clsx';
import { CalendarDays, LayoutDashboard, LogOut, Menu, Receipt, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { selectCount, useCartStore } from '../../stores/cart';
import Logo from './Logo';

const NAV = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/menu', label: 'Thực đơn' },
  { to: '/reservation', label: 'Đặt bàn' },
  { to: '/track', label: 'Tra cứu đơn' },
];

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const item = 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50';
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 text-sm font-medium hover:border-ocean-300"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ocean-900 text-xs font-semibold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-28 truncate sm:block">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg" onClick={() => setOpen(false)}>
          {user.role === 'ADMIN' && (
            <Link to="/admin" className={item}>
              <LayoutDashboard className="h-4 w-4" /> Trang quản trị
            </Link>
          )}
          <Link to="/account" className={item}>
            <User className="h-4 w-4" /> Tài khoản
          </Link>
          <Link to="/account/orders" className={item}>
            <Receipt className="h-4 w-4" /> Đơn hàng của tôi
          </Link>
          <Link to="/account/reservations" className={item}>
            <CalendarDays className="h-4 w-4" /> Lịch đặt bàn
          </Link>
          <button onClick={onLogout} className={clsx(item, 'w-full text-red-600 hover:bg-red-50')}>
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const count = useCartStore(selectCount);
  const openCart = useCartStore((s) => s.open);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkCls = ({ isActive }) =>
    clsx('rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'text-coral-600' : 'text-slate-600 hover:text-ocean-900');

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 border-b transition-colors',
        scrolled ? 'border-slate-200/70 bg-white/90 backdrop-blur-md' : 'border-transparent bg-sand-50',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={openCart} className="relative rounded-full p-2 text-ocean-900 hover:bg-ocean-50" aria-label="Giỏ hàng">
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-coral-500 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <Link to="/login" className="hidden rounded-xl bg-ocean-900 px-4 py-2 text-sm font-medium text-white hover:bg-ocean-800 sm:block">
              Đăng nhập
            </Link>
          )}

          <button className="rounded-lg p-2 md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Mở menu">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden" onClick={() => setMobileOpen(false)}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => clsx(linkCls({ isActive }), 'block')}>
              {n.label}
            </NavLink>
          ))}
          {!user && (
            <Link to="/login" className="mt-2 block rounded-xl bg-ocean-900 px-4 py-2.5 text-center text-sm font-medium text-white">
              Đăng nhập
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
