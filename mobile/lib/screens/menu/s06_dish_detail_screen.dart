// S06. Chi tiết món: xem docs/16-dac-ta-app-mobile-stitch.md mục S06
// API: GET /dishes/:slug → món + category + reviews[] + related[]
// Thiết kế: design/S06.png
//
// Màn này mở toàn màn hình (che thanh tab dưới) vì đã có thanh "Thêm vào giỏ" cố định ở dưới.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';
import '../orders/s14_review_sheet.dart';

class DishDetailScreen extends StatelessWidget {
  const DishDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 3): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S06',
      title: 'Chi tiết món',
      note: 'Món: $slug',
      links: [
        PlaceholderLink('Thêm vào giỏ · Xem giỏ → S08', (c) => c.push(AppRoutes.cart)),
        PlaceholderLink('Viết đánh giá → S14', (c) => showReviewSheet(c, dishName: Demo.dishName)),
        PlaceholderLink('Đăng nhập để đánh giá → S02', (c) => c.push(AppRoutes.login)),
        PlaceholderLink('Có thể bạn cũng thích → S06 món khác', (c) => c.push(AppRoutes.dish('tom-su-nuong-muoi-ot'))),
      ],
    );
  }
}
