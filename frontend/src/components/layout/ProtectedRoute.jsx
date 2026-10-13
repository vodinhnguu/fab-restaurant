import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { can, canAccessAdmin } from '../../lib/permissions';
import { useAuthStore } from '../../stores/auth';

// Bọc các route cần đăng nhập.
// - admin: chỉ admin / nhân viên có quyền mới vào được trang quản trị
// - module: cần quyền Xem chức năng đó (theo ma trận phân quyền), vd module="ORDERS"
export default function ProtectedRoute({ admin, module }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && !canAccessAdmin(user)) return <Navigate to="/" replace />;
  if (module && !can(user, module)) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
