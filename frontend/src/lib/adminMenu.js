import { CalendarDays, ChartColumn, ClipboardList, FolderTree, History, LayoutDashboard, MapPinned, MessageSquare, Receipt, ShieldCheck, Ticket, Users, UtensilsCrossed } from 'lucide-react';

// module = chức năng trong ma trận phân quyền; nhân viên không có quyền Xem thì menu tự ẩn.
// action (không bắt buộc, mặc định 'view'): quyền cần có để thấy mục đó.
// group: tên nhóm hiện phía trên các mục cùng nhóm trong sidebar.
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

  // Vệ sinh & dọn dẹp (docs/20-ve-sinh.md). Tổng quan / Nhiệm vụ / Lịch sử dành cho người làm việc vệ sinh
  // (có quyền Sửa: tạp vụ, tổ trưởng, quản lý). Người chỉ được Xem + Thêm (phục vụ, lễ tân, bếp)
  // chỉ thấy Khu vực cần dọn để báo chỗ cần dọn.
  { to: '/admin/cleaning', label: 'Tổng quan', icon: LayoutDashboard, end: true, module: 'CLEANING', action: 'edit', group: 'Vệ sinh' },
  { to: '/admin/cleaning/tasks', label: 'Nhiệm vụ vệ sinh', icon: ClipboardList, module: 'CLEANING', action: 'edit', group: 'Vệ sinh' },
  { to: '/admin/cleaning/areas', label: 'Khu vực cần dọn', icon: MapPinned, module: 'CLEANING', group: 'Vệ sinh' },
  { to: '/admin/cleaning/history', label: 'Lịch sử công việc', icon: History, module: 'CLEANING', action: 'edit', group: 'Vệ sinh' },
];

// Các mục menu người này được thấy. can = hàm can(user, module, action) trong lib/permissions.js
export const allowedMenu = (user, can) => ADMIN_MENU.filter((m) => can(user, m.module, m.action));
