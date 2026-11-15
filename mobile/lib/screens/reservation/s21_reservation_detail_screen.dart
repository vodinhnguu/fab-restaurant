// S21. Chi tiết đặt bàn: xem docs/16-dac-ta-app-mobile-stitch.md mục S21
// API: GET /reservations/track/:code?phone=, POST /reservations/:code/cancel { phone? }
// Thiết kế: design/S21.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class ReservationDetailScreen extends StatelessWidget {
  const ReservationDetailScreen({super.key, required this.code, this.phone});

  final String code;

  /// Khách chưa đăng nhập phải có SĐT đi kèm mã.
  final String? phone;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 6): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S21',
      title: 'Chi tiết đặt bàn',
      note: 'Mã đặt bàn: $code${phone == null ? '' : ' · SĐT $phone'}',
      links: [
        PlaceholderLink('Xem thực đơn → S05', (c) => c.go(AppRoutes.menu())),
        PlaceholderLink('Bị hủy: Đặt lại ngày/giờ khác → S17', (c) => c.go(AppRoutes.reservation)),
        PlaceholderLink('Không tìm thấy: Tra cứu lại → S16', (c) => c.push(AppRoutes.lookup(reservation: true))),
      ],
    );
  }
}
