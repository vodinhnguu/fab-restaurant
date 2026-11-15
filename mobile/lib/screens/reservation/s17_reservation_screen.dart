// S17. Đặt bàn: xem docs/16-dac-ta-app-mobile-stitch.md mục S17
// API: POST /reservations { name, phone, email?, date, guests, area?, tableId?, note? }
// Thiết kế: design/S17.png
//
// Màn này dài (form + chọn ngày, giờ, khu vực). Khi làm thật nên tách ra thư mục reservation/parts/.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class ReservationScreen extends StatelessWidget {
  const ReservationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 6): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S17',
      title: 'Đặt bàn',
      isTabRoot: true,
      links: [
        PlaceholderLink('Xem sơ đồ & chọn bàn → S18', (c) => c.push(AppRoutes.tablePicker)),
        PlaceholderLink(
          'Xác nhận đặt bàn → S19',
          (c) => c.push(AppRoutes.reservationSuccess(Demo.reservationCode)),
        ),
      ],
    );
  }
}
