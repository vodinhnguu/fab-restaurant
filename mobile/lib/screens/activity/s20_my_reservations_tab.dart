// S20. Hoạt động: Lịch đặt bàn của tôi (tab con trong activity_screen.dart)
// Xem docs/16-dac-ta-app-mobile-stitch.md mục S20
// API: đã đăng nhập GET /reservations/my; chưa đăng nhập GET /reservations/track/:code?phone= cho từng lịch trên máy
// Thiết kế: design/S20.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class MyReservationsTab extends StatelessWidget {
  const MyReservationsTab({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 7): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderBody(
      code: 'S20',
      title: 'Lịch đặt bàn của tôi',
      links: [
        PlaceholderLink(
          'Thẻ đặt bàn → S21',
          (c) => c.push(AppRoutes.reservationDetail(Demo.reservationCode, phone: Demo.phone)),
        ),
        PlaceholderLink('Bị hủy: Đặt lại ngày/giờ khác → S17', (c) => c.go(AppRoutes.reservation)),
        PlaceholderLink('Tra cứu bằng mã → S16', (c) => c.push(AppRoutes.lookup(reservation: true))),
      ],
    );
  }
}
