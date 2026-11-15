// S16. Tra cứu đơn / đặt bàn: xem docs/16-dac-ta-app-mobile-stitch.md mục S16
// Không gọi API trực tiếp: nhập mã + SĐT rồi mở S13 hoặc S21 (màn đó tự gọi API).
// Thiết kế: design/S16.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class LookupScreen extends StatelessWidget {
  const LookupScreen({super.key, this.reservation = false});

  /// true = mở sẵn nút "Đặt bàn", false = "Đơn hàng".
  final bool reservation;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 7): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S16',
      title: reservation ? 'Tra cứu đặt bàn' : 'Tra cứu đơn hàng',
      links: [
        PlaceholderLink(
          'Tra cứu đơn → S13',
          (c) => c.push(AppRoutes.order(Demo.orderCode, phone: Demo.phone)),
        ),
        PlaceholderLink(
          'Tra cứu đặt bàn → S21',
          (c) => c.push(AppRoutes.reservationDetail(Demo.reservationCode, phone: Demo.phone)),
        ),
      ],
    );
  }
}
