// S04. Trang chủ: xem docs/16-dac-ta-app-mobile-stitch.md mục S04
// API: GET /info, GET /categories, GET /dishes?featured=true&limit=8&sort=popular, GET /coupons/public
// Thiết kế: design/S04.png
//
// Màn này dài (9 khối). Khi làm thật nên tách từng khối ra thư mục home/parts/,
// vd home/parts/hero_banner.dart, home/parts/coupon_section.dart.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 3): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S04',
      title: 'Trang chủ',
      isTabRoot: true,
      links: [
        PlaceholderLink('Đặt món ngay → S05', (c) => c.go(AppRoutes.menu())),
        PlaceholderLink('Danh mục "Tôm" → S05 đã lọc', (c) => c.go(AppRoutes.menu(category: Demo.categorySlug))),
        PlaceholderLink('Thẻ món → S06', (c) => c.push(AppRoutes.dish(Demo.dishSlug))),
        PlaceholderLink('Đặt bàn → S17', (c) => c.go(AppRoutes.reservation)),
        PlaceholderLink('Icon giỏ hàng → S08', (c) => c.push(AppRoutes.cart)),
        PlaceholderLink('Liên hệ → S25', (c) => c.push(AppRoutes.restaurantInfo)),
      ],
    );
  }
}
