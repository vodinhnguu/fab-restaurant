// S15. Hoạt động: Đơn hàng của tôi (tab con trong activity_screen.dart)
// Xem docs/16-dac-ta-app-mobile-stitch.md mục S15
// API: đã đăng nhập GET /orders/my?page=; chưa đăng nhập GET /orders/track/:code?phone= cho từng đơn trên máy
// Thiết kế: design/S15.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class MyOrdersTab extends StatelessWidget {
  const MyOrdersTab({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 7): thay khung giữ chỗ bằng giao diện thật.
    // Đây là tab con nên không có Scaffold / thanh tiêu đề riêng.
    return PlaceholderBody(
      code: 'S15',
      title: 'Đơn hàng của tôi',
      links: [
        PlaceholderLink(
          'Thẻ đơn → S13',
          (c) => c.push(AppRoutes.order(Demo.orderCode, phone: Demo.phone)),
        ),
        PlaceholderLink('Khách: Đăng nhập để xem lịch sử → S02', (c) => c.push(AppRoutes.login)),
        PlaceholderLink('Tra cứu đơn khác bằng mã → S16', (c) => c.push(AppRoutes.lookup())),
        PlaceholderLink('Trống: Đặt món ngay → S05', (c) => c.go(AppRoutes.menu())),
      ],
    );
  }
}
