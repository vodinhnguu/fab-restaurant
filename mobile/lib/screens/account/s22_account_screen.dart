// S22. Tài khoản: xem docs/16-dac-ta-app-mobile-stitch.md mục S22
// Không gọi API riêng: dùng user đã lưu khi đăng nhập (state/auth_state.dart, làm ở Bước 1).
// Thiết kế: design/S22.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/config.dart';
import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 2): thay khung giữ chỗ bằng giao diện thật (2 kiểu: đã / chưa đăng nhập).
    return PlaceholderScreen(
      code: 'S22',
      title: 'Tài khoản',
      isTabRoot: true,
      note: 'Phiên bản ${AppConfig.appVersion}',
      links: [
        PlaceholderLink('Đăng nhập → S02', (c) => c.push(AppRoutes.login)),
        PlaceholderLink('Đăng ký → S03', (c) => c.push(AppRoutes.register)),
        PlaceholderLink('Thông tin cá nhân → S23', (c) => c.push(AppRoutes.editProfile)),
        PlaceholderLink('Đổi mật khẩu → S24', (c) => c.push(AppRoutes.changePassword)),
        PlaceholderLink('Đơn hàng của tôi → S15', (c) => c.go(AppRoutes.activity())),
        PlaceholderLink('Lịch đặt bàn → S20', (c) => c.go(AppRoutes.activity(reservations: true))),
        PlaceholderLink('Tra cứu bằng mã → S16', (c) => c.push(AppRoutes.lookup())),
        PlaceholderLink('Thông tin nhà hàng → S25', (c) => c.push(AppRoutes.restaurantInfo)),
      ],
    );
  }
}
