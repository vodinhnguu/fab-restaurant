import { useAuthStore } from '../stores/auth';

// Quyền của tài khoản đang đăng nhập lấy từ user.permissions (backend trả ở /auth/login và /auth/me).
// Đây chỉ để ẨN nút / menu cho gọn; backend mới là nơi chặn thật (requirePermission).

// Toàn quyền như quản trị viên: tài khoản ADMIN hoặc nhân viên giữ vai trò Chủ nhà hàng.
// Khớp với isFullAdmin ở backend (permissions.service.js): được sửa ma trận, quản lý tài khoản Admin / Chủ.
export const isFullAdmin = (user) => user?.role === 'ADMIN' || (user?.role === 'STAFF' && user?.staffRole?.key === 'OWNER');

export const can = (user, module, action = 'view') =>
  isFullAdmin(user) || !!user?.permissions?.[module]?.[action];

// Được vào trang quản trị: admin / chủ nhà hàng, hoặc nhân viên được xem ít nhất 1 chức năng
export const canAccessAdmin = (user) =>
  isFullAdmin(user) || (user?.role === 'STAFF' && Object.values(user.permissions ?? {}).some((p) => p.view));

// Trong component: const can = useCan(); can('ORDERS', 'edit')
export function useCan() {
  const user = useAuthStore((s) => s.user);
  return (module, action = 'view') => can(user, module, action);
}

export const ROLE_LABEL = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên', ADMIN: 'Quản trị' };
