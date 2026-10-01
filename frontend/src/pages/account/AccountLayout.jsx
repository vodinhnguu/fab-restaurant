import clsx from 'clsx';
import { CalendarDays, Receipt, User } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';

const TABS = [
  { to: '/account', label: 'Hồ sơ', icon: User, end: true },
  { to: '/account/orders', label: 'Đơn hàng', icon: Receipt },
  { to: '/account/reservations', label: 'Đặt bàn', icon: CalendarDays },
];

export default function AccountLayout() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ocean-900 text-xl font-bold text-white">{user.name.charAt(0)}</span>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-4">
        <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx('flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium', isActive ? 'bg-ocean-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50')
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="lg:col-span-3"><Outlet /></div>
      </div>
    </div>
  );
}
