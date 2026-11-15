// S24. Đổi mật khẩu: xem docs/16-dac-ta-app-mobile-stitch.md mục S24
// API: POST /auth/change-password { currentPassword, newPassword }
// Thiết kế: design/S24.png

import 'package:flutter/material.dart';

import '../../widgets/placeholder_screen.dart';

class ChangePasswordScreen extends StatelessWidget {
  const ChangePasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 8): thay khung giữ chỗ bằng giao diện thật.
    return const PlaceholderScreen(code: 'S24', title: 'Đổi mật khẩu');
  }
}
