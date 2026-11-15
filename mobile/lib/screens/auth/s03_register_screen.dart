// S03. Đăng ký: xem docs/16-dac-ta-app-mobile-stitch.md mục S03
// API: POST /auth/register { name, email, password, phone? } → { user, token }
// Thiết kế: design/S03.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 2): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S03',
      title: 'Tạo tài khoản',
      note: 'Đăng ký xong tự đăng nhập, quay lại màn đang làm dở.',
      links: [
        PlaceholderLink('Đã có tài khoản? Đăng nhập → S02', (c) => c.pushReplacement(AppRoutes.login)),
      ],
    );
  }
}
