// Bản đồ chuyển màn: đường đi nào mở màn hình nào (mục 1.3 docs/16).
//
// - 5 màn trong StatefulShellRoute là 5 tab dưới, luôn thấy thanh tab.
// - Các màn còn lại mở toàn màn hình, che thanh tab, có nút quay lại.
// - Bottom sheet (S07, S10, S14) không có đường đi, mở bằng hàm showXxxSheet().
//
// Thêm màn mới: 1) thêm tên đường ở routes.dart  2) thêm GoRoute ở đây.

import 'package:go_router/go_router.dart';

import '../screens/account/s22_account_screen.dart';
import '../screens/account/s23_edit_profile_screen.dart';
import '../screens/account/s24_change_password_screen.dart';
import '../screens/account/s25_restaurant_info_screen.dart';
import '../screens/activity/activity_screen.dart';
import '../screens/auth/s02_login_screen.dart';
import '../screens/auth/s03_register_screen.dart';
import '../screens/cart/s08_cart_screen.dart';
import '../screens/checkout/s09_checkout_screen.dart';
import '../screens/checkout/s11_vnpay_screen.dart';
import '../screens/checkout/s12_payment_result_screen.dart';
import '../screens/home/s04_home_screen.dart';
import '../screens/lookup/s16_lookup_screen.dart';
import '../screens/menu/s05_menu_screen.dart';
import '../screens/menu/s06_dish_detail_screen.dart';
import '../screens/orders/s13_order_detail_screen.dart';
import '../screens/reservation/s17_reservation_screen.dart';
import '../screens/reservation/s18_table_picker_screen.dart';
import '../screens/reservation/s19_reservation_success_screen.dart';
import '../screens/reservation/s21_reservation_detail_screen.dart';
import '../screens/s01_splash_screen.dart';
import 'main_shell.dart';
import 'routes.dart';

final appRouter = GoRouter(
  initialLocation: AppRoutes.splash,
  routes: [
    // S01
    GoRoute(path: AppRoutes.splash, builder: (_, _) => const SplashScreen()),

    // ---------- 5 tab dưới ----------
    StatefulShellRoute.indexedStack(
      builder: (_, _, navigationShell) => MainShell(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(path: AppRoutes.home, builder: (_, _) => const HomeScreen()), // S04
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/menu', // S05
            builder: (_, state) => MenuScreen(category: state.uri.queryParameters['category']),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: AppRoutes.reservation, builder: (_, _) => const ReservationScreen()), // S17
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/activity', // S15 + S20
            builder: (_, state) => ActivityScreen(
              showReservations: state.uri.queryParameters['tab'] == 'reservations',
            ),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(path: AppRoutes.account, builder: (_, _) => const AccountScreen()), // S22
        ]),
      ],
    ),

    // ---------- Mở toàn màn hình ----------
    GoRoute(path: AppRoutes.login, builder: (_, _) => const LoginScreen()), // S02
    GoRoute(path: AppRoutes.register, builder: (_, _) => const RegisterScreen()), // S03
    GoRoute(
      path: '/dish/:slug', // S06
      builder: (_, state) => DishDetailScreen(slug: state.pathParameters['slug']!),
    ),
    GoRoute(path: AppRoutes.cart, builder: (_, _) => const CartScreen()), // S08
    GoRoute(path: AppRoutes.checkout, builder: (_, _) => const CheckoutScreen()), // S09
    GoRoute(
      path: '/vnpay/:code', // S11
      builder: (_, state) => VnpayScreen(orderCode: state.pathParameters['code']!),
    ),
    GoRoute(
      path: AppRoutes.paymentResult, // S12
      builder: (_, state) => PaymentResultScreen(vnpParams: state.uri.queryParameters),
    ),
    GoRoute(
      path: '/order/:code', // S13
      builder: (_, state) => OrderDetailScreen(
        code: state.pathParameters['code']!,
        phone: state.uri.queryParameters['phone'],
        justPlaced: state.uri.queryParameters['justPlaced'] == '1',
      ),
    ),
    GoRoute(
      path: '/lookup', // S16
      builder: (_, state) => LookupScreen(reservation: state.uri.queryParameters['type'] == 'reservation'),
    ),
    GoRoute(path: AppRoutes.tablePicker, builder: (_, _) => const TablePickerScreen()), // S18
    GoRoute(
      path: '/reservation-success/:code', // S19
      builder: (_, state) => ReservationSuccessScreen(code: state.pathParameters['code']!),
    ),
    GoRoute(
      path: '/reservation-detail/:code', // S21
      builder: (_, state) => ReservationDetailScreen(
        code: state.pathParameters['code']!,
        phone: state.uri.queryParameters['phone'],
      ),
    ),
    GoRoute(path: AppRoutes.editProfile, builder: (_, _) => const EditProfileScreen()), // S23
    GoRoute(path: AppRoutes.changePassword, builder: (_, _) => const ChangePasswordScreen()), // S24
    GoRoute(path: AppRoutes.restaurantInfo, builder: (_, _) => const RestaurantInfoScreen()), // S25
  ],
);
