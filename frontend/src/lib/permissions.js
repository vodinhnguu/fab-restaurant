import { useAuthStore } from '../stores/auth';

// Quyền của tài khoản đang đăng nhập lấy từ user.permissions (backend trả ở /auth/login và /auth/me).
// Đây chỉ để ẨN nút / menu cho gọn; backend mới là nơi chặn thật (requirePermission).

export const can = (user, module, action = 'view') =>
  user?.role === 'ADMIN' || !!user?.permissions?.[module]?.[action];

// Được vào trang quản trị: admin, hoặc nhân viên được xem ít nhất 1 chức năng
export const canAccessAdmin = (user) =>
  user?.role === 'ADMIN' || (user?.role === 'STAFF' && Object.values(user.permissions ?? {}).some((p) => p.view));

// Trong component: const can = useCan(); can('ORDERS', 'edit')
export function useCan() {
  const user = useAuthStore((s) => s.user);
  return (module, action = 'view') => can(user, module, action);
}

export const ROLE_LABEL = { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên', ADMIN: 'Quản trị' };
