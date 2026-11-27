import { Wrench } from 'lucide-react';
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { EmptyState, Spinner } from './components/ui/Feedback';
import Home from './pages/Home';
import { allowedMenu } from './lib/adminMenu';
import { can } from './lib/permissions';
import { authApi } from './services';
import { useAuthStore } from './stores/auth';

// Lazy load: chỉ tải code của trang khi người dùng vào trang đó -> trang chủ load nhanh hơn
const Menu = lazy(() => import('./pages/Menu'));
const DishDetail = lazy(() => import('./pages/DishDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));
const Reservation = lazy(() => import('./pages/Reservation'));
const ReservationDetail = lazy(() => import('./pages/ReservationDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const Profile = lazy(() => import('./pages/account/Profile'));
const MyOrders = lazy(() => import('./pages/account/MyOrders'));
const MyReservations = lazy(() => import('./pages/account/MyReservations'));

const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminReservations = lazy(() => import('./pages/admin/Reservations'));
const AdminDishes = lazy(() => import('./pages/admin/Dishes'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminPermissions = lazy(() => import('./pages/admin/Permissions'));
const CleaningOverview = lazy(() => import('./pages/admin/cleaning/Overview'));
const CleaningTasks = lazy(() => import('./pages/admin/cleaning/Tasks'));
const CleaningAreas = lazy(() => import('./pages/admin/cleaning/Areas'));
const CleaningHistory = lazy(() => import('./pages/admin/cleaning/History'));
const MaintenanceOverview = lazy(() => import('./pages/admin/maintenance/Overview'));
const MaintenanceTickets = lazy(() => import('./pages/admin/maintenance/Tickets'));
const MaintenanceEquipment = lazy(() => import('./pages/admin/maintenance/Equipment'));
const MaintenanceHistory = lazy(() => import('./pages/admin/maintenance/History'));
const Kitchen = lazy(() => import('./pages/admin/dine-in/Kitchen'));
const Bar = lazy(() => import('./pages/admin/dine-in/Bar'));
const Weighing = lazy(() => import('./pages/admin/dine-in/Weighing'));
const Tank = lazy(() => import('./pages/admin/dine-in/Tank'));
const Cashier = lazy(() => import('./pages/admin/dine-in/Cashier'));
const BillPrint = lazy(() => import('./pages/admin/dine-in/BillPrint'));

// /admin: có quyền xem Tổng quan thì vào Dashboard, không thì chuyển tới trang đầu tiên được phép
// (vd Tạp vụ -> /admin/cleaning, Kỹ thuật -> /admin/maintenance)
function AdminHome() {
  const user = useAuthStore((s) => s.user);
  if (can(user, 'DASHBOARD')) return <Dashboard />;
  const first = allowedMenu(user, can)[0];
  if (first) return <Navigate to={first.to} replace />;
  // Vai trò chỉ có quyền ở chức năng chưa có trang web (Hồ hải sản), vd vai trò tự tạo
  // -> báo rõ cho nhân viên thay vì để trang trắng
  return (
    <EmptyState
      icon={Wrench}
      title="Chưa có trang cho công việc của bạn"
      description={`Vai trò ${user?.staffRole?.name ?? 'của bạn'} chỉ có quyền ở các chức năng chưa có trang trên web (vd Hồ hải sản). Cần thêm quyền thì báo admin.`}
    />
  );
}

export default function App() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  // Mỗi lần mở web: lấy lại thông tin tài khoản mới nhất từ server.
  // User lưu trong localStorage có thể đã cũ (admin vừa đổi quyền / khóa tài khoản).
  // Token hết hạn -> API trả 401 -> interceptor trong lib/api.js tự đăng xuất.
  useEffect(() => {
    if (token) authApi.me().then(setUser).catch(() => {});
  }, [token, setUser]);

  return (
    <Suspense fallback={<Spinner className="py-32" />}>
      <Routes>
        {/* ===== Trang khách hàng ===== */}
        <Route element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="menu/:slug" element={<DishDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders/:code" element={<OrderDetail />} />
          <Route path="track" element={<TrackOrder />} />
          <Route path="payment/vnpay-return" element={<PaymentResult />} />
          <Route path="reservation" element={<Reservation />} />
          <Route path="reservations/:code" element={<ReservationDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<Profile />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="reservations" element={<MyReservations />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ===== Trang quản trị: admin + nhân viên, mỗi trang cần quyền Xem chức năng tương ứng ===== */}
        <Route element={<ProtectedRoute admin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route element={<ProtectedRoute module="ORDERS" />}><Route path="orders" element={<AdminOrders />} /></Route>
            <Route element={<ProtectedRoute module="RESERVATIONS" />}><Route path="reservations" element={<AdminReservations />} /></Route>
            <Route element={<ProtectedRoute module="MENU" />}>
              <Route path="dishes" element={<AdminDishes />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>
            <Route element={<ProtectedRoute module="COUPONS" />}><Route path="coupons" element={<AdminCoupons />} /></Route>
            <Route element={<ProtectedRoute module="REVIEWS" />}><Route path="reviews" element={<AdminReviews />} /></Route>
            <Route element={<ProtectedRoute module="STAFF" />}>
              <Route path="users" element={<AdminUsers />} />
              <Route path="permissions" element={<AdminPermissions />} />
            </Route>
            {/* Vệ sinh (docs/20-ve-sinh.md): Khu vực cần dọn chỉ cần Xem, 3 trang còn lại cần Sửa */}
            <Route element={<ProtectedRoute module="CLEANING" />}>
              <Route path="cleaning/areas" element={<CleaningAreas />} />
            </Route>
            <Route element={<ProtectedRoute module="CLEANING" action="edit" />}>
              <Route path="cleaning" element={<CleaningOverview />} />
              <Route path="cleaning/tasks" element={<CleaningTasks />} />
              <Route path="cleaning/history" element={<CleaningHistory />} />
            </Route>
            {/* Kỹ thuật (docs/22-ky-thuat-bao-tri.md): Thiết bị chỉ cần Xem, 3 trang còn lại cần Sửa */}
            <Route element={<ProtectedRoute module="FACILITY" />}>
              <Route path="maintenance/equipment" element={<MaintenanceEquipment />} />
            </Route>
            <Route element={<ProtectedRoute module="FACILITY" action="edit" />}>
              <Route path="maintenance" element={<MaintenanceOverview />} />
              <Route path="maintenance/tickets" element={<MaintenanceTickets />} />
              <Route path="maintenance/history" element={<MaintenanceHistory />} />
            </Route>
            {/* Ăn tại quán (docs/23-app-nhan-vien-phuc-vu.md): phục vụ ghi món bằng app, bếp + thu ngân làm ở đây */}
            <Route element={<ProtectedRoute module="KITCHEN" />}><Route path="kitchen" element={<Kitchen />} /></Route>
            <Route element={<ProtectedRoute module="DRINKS" />}><Route path="bar" element={<Bar />} /></Route>
            <Route element={<ProtectedRoute module="SEAFOOD_TANK" />}><Route path="weighing" element={<Weighing />} /></Route>
            <Route element={<ProtectedRoute module="SEAFOOD_TANK" />}><Route path="tank" element={<Tank />} /></Route>
            <Route element={<ProtectedRoute module="PAYMENTS" />}><Route path="cashier" element={<Cashier />} /></Route>
          </Route>
          {/* Trang in bill: không có sidebar, mở ở tab mới từ trang Thanh toán tại bàn */}
          <Route element={<ProtectedRoute module="PAYMENTS" />}>
            <Route path="admin/bill/:id/print" element={<BillPrint />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
