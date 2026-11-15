// S02. Đăng nhập: xem docs/16-dac-ta-app-mobile-stitch.md mục S02
// API: POST /auth/login { email, password } → { user, token }
// Thiết kế: design/S02.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 2): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S02',
      title: 'Đăng nhập',
      note: 'Đăng nhập xong thì quay lại đúng màn đang làm dở.',
      links: [
        PlaceholderLink('Chưa có tài khoản? Đăng ký → S03', (c) => c.pushReplacement(AppRoutes.register)),
        PlaceholderLink('Tiếp tục không đăng nhập (quay lại)', (c) => c.pop()),
      ],
    );
  }
}
