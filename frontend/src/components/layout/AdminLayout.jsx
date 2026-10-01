import clsx from 'clsx';
import {
  CalendarDays,
  ChartColumn,
  ExternalLink,
  FolderTree,
  LogOut,
  Menu,
  MessageSquare,
  Receipt,
  Ticket,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import Logo from './Logo';

const MENU = [
  { to: '/admin', label: 'Tổng quan', icon: ChartColumn, end: true },
  { to: '/admin/orders', label: 'Đơn hàng', icon: Receipt },
  { to: '/admin/reservations', label: 'Đặt bàn', icon: CalendarDays },
  { to: '/admin/dishes', label: 'Món ăn', icon: UtensilsCrossed },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { to: '/admin/coupons', label: 'Mã giảm giá', icon: Ticket },
  { to: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo light to="/admin" />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {MENU.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-white/10 text-white' : 'text-ocean-200 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="h-5 w-5" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ocean-200 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-5 w-5" /> Xem trang khách
        </Link>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ocean-200 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ocean-950 lg:block">{sidebar}</aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ocean-950" onClick={(e) => e.target.closest("a") && setOpen(false)}>
            <button className="absolute top-4 right-3 text-white" onClick={() => setOpen(false)} aria-label="Đóng">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-coral-500 font-semibold text-white">
              {user?.name?.charAt(0)}
            </span>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
