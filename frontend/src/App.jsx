import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/layout/CustomerLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Spinner } from './components/ui/Feedback';
import Home from './pages/Home';

// Lazy load: chỉ tải code của trang khi người dùng vào trang đó -> trang chủ load nhanh hơn
const Menu = lazy(() => import('./pages/Menu'));
const DishDetail = lazy(() => import('./pages/DishDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Reservation = lazy(() => import('./pages/Reservation'));
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

export default function App() {
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
          <Route path="reservation" element={<Reservation />} />
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

        {/* ===== Trang quản trị (chỉ ADMIN) ===== */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="dishes" element={<AdminDishes />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
