// Khung chính của app nhân viên: giữ 3 màn chính S03 Sơ đồ bàn · S10 Đơn hôm nay · S11 Tài khoản.
// Chuyển giữa 3 màn bằng menu trái (nút ☰, file app_drawer.dart), giống app CukCuk; không còn thanh tab dưới.
//
// Mỗi màn giữ trạng thái riêng: đang lọc "Đã hủy" ở Đơn hôm nay, sang Sơ đồ bàn rồi quay lại vẫn còn.
// S04, S05, S06, S08 mở trên cùng (che cả màn), xem router.dart.
//
// Nút quay lại của điện thoại: đang ở Đơn hôm nay / Tài khoản thì về Sơ đồ bàn; đang ở Sơ đồ bàn mới thoát app.

import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  /// Nhánh Sơ đồ bàn: nhánh đầu tiên trong router.dart (cùng thứ tự enum AppSection).
  static const tablesBranch = 0;

  @override
  Widget build(BuildContext context) {
    final onTables = navigationShell.currentIndex == tablesBranch;
    return PopScope(
      canPop: onTables,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) navigationShell.goBranch(tablesBranch);
      },
      child: navigationShell,
    );
  }
}
