// Bản đồ chuyển màn: đường đi nào mở màn hình nào (docs/23-app-nhan-vien-phuc-vu.md mục 2).
//
// - 3 màn trong StatefulShellRoute là 3 mục của menu trái (app_drawer.dart), chuyển bằng nút ☰.
//   Thứ tự nhánh phải khớp enum AppSection: Sơ đồ bàn · Đơn hôm nay · Quản lý · Tài khoản.
// - S04, S05, S06, S08 là "con" của Sơ đồ bàn nhưng mở trên navigator gốc (che cả màn, có nút ←):
//   /tables/5 → /tables/5/menu → /tables/5/menu/dish/tom-hum, nút quay lại đi ngược từng bước.
//   Gửi bếp xong: context.go(AppRoutes.table(5)) là về thẳng S04 (bỏ S05, S08 phía trên).
// - Bottom sheet (S07, S09) không có đường đi, mở bằng hàm showXxxSheet().
//
// Thêm màn mới: 1) thêm tên đường ở routes.dart  2) thêm GoRoute ở đây.

import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

import '../screens/account/s11_account_screen.dart';
import '../screens/auth/s02_login_screen.dart';
import '../screens/cart/s08_cart_screen.dart';
import '../screens/menu/s05_menu_screen.dart';
import '../screens/menu/s06_dish_detail_screen.dart';
import '../screens/manager/manager_guard.dart';
import '../screens/manager/s15_manager_screen.dart';
import '../screens/manager/s16_cancelled_screen.dart';
import '../screens/manager/s17_drink_check_screen.dart';
import '../screens/orders/s10_today_orders_screen.dart';
import '../screens/s01_splash_screen.dart';
import '../screens/tables/s03_tables_screen.dart';
import '../screens/tables/s04_table_order_screen.dart';
import 'main_shell.dart';
import 'routes.dart';

int _tableId(GoRouterState state) => int.tryParse(state.pathParameters['id'] ?? '') ?? 0;

/// Tạo bộ chuyển màn. App thật mở từ Splash; test có thể mở thẳng màn khác,
/// vd createAppRouter(initialLocation: AppRoutes.tables).
GoRouter createAppRouter({String initialLocation = AppRoutes.splash}) {
  // Navigator gốc: S04, S05, S06, S08 mở trên nó để che cả màn chính. Tạo mới mỗi lần tạo router
  // (mỗi lần mở app / mỗi test) để không dùng chung 1 GlobalKey giữa các cây widget.
  final rootKey = GlobalKey<NavigatorState>();
  return GoRouter(
    navigatorKey: rootKey,
    initialLocation: initialLocation,
    routes: [
      GoRoute(path: AppRoutes.splash, builder: (_, _) => const SplashScreen()), // S01
      GoRoute(path: AppRoutes.login, builder: (_, _) => const LoginScreen()), // S02
      // ---------- 3 màn chính (3 mục menu trái) ----------
      StatefulShellRoute.indexedStack(
        builder: (_, _, navigationShell) => MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.tables, // S03
                builder: (_, _) => const TablesScreen(),
                routes: [
                  GoRoute(
                    path: ':id', // S04
                    parentNavigatorKey: rootKey,
                    builder: (_, state) => TableOrderScreen(tableId: _tableId(state)),
                    routes: [
                      GoRoute(
                        path: 'menu', // S05
                        parentNavigatorKey: rootKey,
                        builder: (_, state) => MenuScreen(tableId: _tableId(state)),
                        routes: [
                          GoRoute(
                            path: 'dish/:slug', // S06
                            parentNavigatorKey: rootKey,
                            builder: (_, state) =>
                                DishDetailScreen(tableId: _tableId(state), slug: state.pathParameters['slug']!),
                          ),
                        ],
                      ),
                      GoRoute(
                        path: 'ticket', // S08
                        parentNavigatorKey: rootKey,
                        builder: (_, state) => CartScreen(tableId: _tableId(state)),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: AppRoutes.orders, builder: (_, _) => const TodayOrdersScreen()), // S10
            ],
          ),
          // Nhóm Quản lý (docs/28-app-quan-ly.md): chỉ tài khoản có quyền Xem "Tổng quan" vào được.
          // Vào bằng đường dẫn khi không có quyền -> màn tự đẩy về Sơ đồ bàn (ManagerGuard).
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: AppRoutes.manager, // S15
                builder: (_, _) => const ManagerGuard(child: ManagerScreen()),
                routes: [
                  GoRoute(
                    path: 'cancelled', // S16
                    parentNavigatorKey: rootKey,
                    builder: (_, _) => const ManagerGuard(child: CancelledScreen()),
                  ),
                  GoRoute(
                    path: 'drinks', // S17
                    parentNavigatorKey: rootKey,
                    builder: (_, _) => const ManagerGuard(needDrinks: true, child: DrinkCheckScreen()),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(path: AppRoutes.account, builder: (_, _) => const AccountScreen()), // S11
            ],
          ),
        ],
      ),
    ],
  );
}
