// S05. Thực đơn: xem docs/16-dac-ta-app-mobile-stitch.md mục S05
// API: GET /categories, GET /dishes?search=&category=<slug>&sort=&page=&limit=12
// Thiết kế: design/S05.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key, this.category});

  /// Slug danh mục đã lọc sẵn (mở từ ô danh mục ở S04). null = "Tất cả".
  final String? category;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 3): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S05',
      title: 'Thực đơn',
      isTabRoot: true,
      note: category == null ? null : 'Đang lọc danh mục: $category',
      links: [
        PlaceholderLink('Thẻ món → S06', (c) => c.push(AppRoutes.dish(Demo.dishSlug))),
        PlaceholderLink('Thanh giỏ nổi → S08', (c) => c.push(AppRoutes.cart)),
      ],
    );
  }
}
