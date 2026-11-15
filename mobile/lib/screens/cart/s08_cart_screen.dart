// S08. Giỏ hàng: xem docs/16-dac-ta-app-mobile-stitch.md mục S08
// Không có API giỏ hàng: giỏ lưu trên máy (state/cart_state.dart, làm ở Bước 1).
// Thiết kế: design/S08.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';
import 's07_note_sheet.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 3): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S08',
      title: 'Giỏ hàng của bạn',
      links: [
        PlaceholderLink('Thêm ghi chú khẩu vị → S07', (c) => showNoteSheet(c, dishName: Demo.dishName)),
        PlaceholderLink('Tên món → S06', (c) => c.push(AppRoutes.dish(Demo.dishSlug))),
        PlaceholderLink('Tiến hành đặt món → S09', (c) => c.push(AppRoutes.checkout)),
        PlaceholderLink('Giỏ trống: Xem thực đơn → S05', (c) => c.go(AppRoutes.menu())),
      ],
    );
  }
}
