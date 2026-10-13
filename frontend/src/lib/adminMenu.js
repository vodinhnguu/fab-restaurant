import { CalendarDays, ChartColumn, FolderTree, MessageSquare, Receipt, ShieldCheck, Ticket, Users, UtensilsCrossed } from 'lucide-react';

// module = chức năng trong ma trận phân quyền; nhân viên không có quyền Xem thì menu tự ẩn
export const ADMIN_MENU = [
  { to: '/admin', label: 'Tổng quan', icon: ChartColumn, end: true, module: 'DASHBOARD' },
  { to: '/admin/orders', label: 'Đơn hàng', icon: Receipt, module: 'ORDERS' },
  { to: '/admin/reservations', label: 'Đặt bàn', icon: CalendarDays, module: 'RESERVATIONS' },
  { to: '/admin/dishes', label: 'Món ăn', icon: UtensilsCrossed, module: 'MENU' },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderTree, module: 'MENU' },
  { to: '/admin/coupons', label: 'Mã giảm giá', icon: Ticket, module: 'COUPONS' },
  { to: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare, module: 'REVIEWS' },
  { to: '/admin/users', label: 'Người dùng', icon: Users, module: 'STAFF' },
  { to: '/admin/permissions', label: 'Phân quyền', icon: ShieldCheck, module: 'STAFF' },
];
