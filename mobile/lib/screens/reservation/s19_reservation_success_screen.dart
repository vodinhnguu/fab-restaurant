// S19. Đặt bàn thành công: xem docs/16-dac-ta-app-mobile-stitch.md mục S19
// Không gọi API: dùng kết quả POST /reservations do S17 truyền sang.
// Thiết kế: design/S19.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class ReservationSuccessScreen extends StatelessWidget {
  const ReservationSuccessScreen({super.key, required this.code});

  final String code;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 6): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S19',
      title: 'Đặt bàn thành công!',
      note: 'Mã đặt bàn: $code',
      links: [
        PlaceholderLink(
          'Xem chi tiết → S21',
          (c) => c.pushReplacement(AppRoutes.reservationDetail(code, phone: Demo.phone)),
        ),
        PlaceholderLink('Đặt thêm → S17', (c) => c.pop()),
      ],
    );
  }
}
