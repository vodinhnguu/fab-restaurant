import { Beer, CalendarDays, ChartColumn, ChefHat, ClipboardList, FileClock, Fish, FolderTree, Gauge, HandCoins, History, LayoutDashboard, MapPinned, MessageSquare, Receipt, Refrigerator, Scale, ShieldCheck, Ticket, Users, UtensilsCrossed, Wrench } from 'lucide-react';

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

  // Kỹ thuật: thiết bị & sửa chữa (docs/22-ky-thuat-bao-tri.md). Tổng quan / Phiếu / Lịch sử cho người sửa
  // (quyền Sửa: kỹ thuật, quản lý). Bếp, hồ hải sản, tổ trưởng (chỉ Xem) thấy trang Thiết bị.
  // Báo hỏng không nằm ở menu mà là nút trên thanh tiêu đề (ReportIssueButton) cho ai có quyền Thêm.
  { to: '/admin/maintenance', label: 'Tổng quan', icon: Gauge, end: true, module: 'FACILITY', action: 'edit', group: 'Kỹ thuật' },
  { to: '/admin/maintenance/tickets', label: 'Phiếu sửa chữa', icon: Wrench, module: 'FACILITY', action: 'edit', group: 'Kỹ thuật' },
  { to: '/admin/maintenance/equipment', label: 'Thiết bị & bảo trì', icon: Refrigerator, module: 'FACILITY', group: 'Kỹ thuật' },
  { to: '/admin/maintenance/history', label: 'Lịch sử sửa chữa', icon: FileClock, module: 'FACILITY', action: 'edit', group: 'Kỹ thuật' },

  // Ăn tại quán (docs/23-app-nhan-vien-phuc-vu.md): phục vụ ghi món bằng app, bếp + thu ngân làm trên web.
  // Để cuối danh sách: vai trò chỉ Xem phiếu bếp (vd Kỹ thuật) vẫn vào trang chính của mình trước.
  // badge: tên số đếm trong useDineInAlerts (hiện chấm đỏ trên menu)
  // Cân hải sản: món bán theo kg chờ cân (docs/24). Chỉ hiện cho người cân được (hồ hải sản, bếp, quản lý)
  { to: '/admin/weighing', label: 'Cân hải sản', icon: Scale, module: 'SEAFOOD_TANK', action: 'edit', group: 'Tại quán', badge: 'weighing' },
  // Tồn hồ: nhập hàng, kiểm hồ, hao hụt (docs/27). Quyền Xem để phục vụ / tổ trưởng xem còn bao nhiêu kg mà tư vấn khách
  { to: '/admin/tank', label: 'Tồn hồ hải sản', icon: Fish, module: 'SEAFOOD_TANK', group: 'Tại quán' },
  { to: '/admin/kitchen', label: 'Phiếu bếp', icon: ChefHat, module: 'KITCHEN', group: 'Tại quán', badge: 'kitchen' },
  { to: '/admin/bar', label: 'Quầy bia nước', icon: Beer, module: 'DRINKS', group: 'Tại quán', badge: 'bar' },
  { to: '/admin/cashier', label: 'Thanh toán tại bàn', icon: HandCoins, module: 'PAYMENTS', group: 'Tại quán', badge: 'cashier' },
];

// Các mục menu người này được thấy. can = hàm can(user, module, action) trong lib/permissions.js
export const allowedMenu = (user, can) => ADMIN_MENU.filter((m) => can(user, m.module, m.action));
