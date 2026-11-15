// S23. Sửa hồ sơ ("Thông tin cá nhân"): xem docs/16-dac-ta-app-mobile-stitch.md mục S23
// API: PATCH /auth/me { name, phone, address } → user mới
// Thiết kế: design/S23.png

import 'package:flutter/material.dart';

import '../../widgets/placeholder_screen.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 8): thay khung giữ chỗ bằng giao diện thật.
    return const PlaceholderScreen(code: 'S23', title: 'Thông tin cá nhân');
  }
}
