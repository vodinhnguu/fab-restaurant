// S13. Chi tiết đơn hàng (theo dõi đơn): xem docs/16-dac-ta-app-mobile-stitch.md mục S13
// API: GET /orders/track/:code?phone=, POST /orders/:code/cancel { phone }, POST /payments/vnpay/:code { phone }
// Thiết kế: design/S13.png
//
// Màn này dài (timeline, 2 thẻ, khung hủy). Khi làm thật nên tách ra thư mục orders/parts/.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';
import 's14_review_sheet.dart';

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key, required this.code, this.phone, this.justPlaced = false});

  final String code;

  /// Khách chưa đăng nhập phải có SĐT đi kèm mã.
  final String? phone;

  /// Vừa đặt xong: hiện "Cảm ơn bạn đã đặt món!".
  final bool justPlaced;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 4): thay khung giữ chỗ bằng giao diện thật, tự tải lại mỗi 15 giây.
    return PlaceholderScreen(
      code: 'S13',
      title: justPlaced ? 'Cảm ơn bạn đã đặt món!' : 'Chi tiết đơn hàng',
      note: 'Mã đơn: $code${phone == null ? '' : ' · SĐT $phone'}',
      links: [
        PlaceholderLink('Thanh toán qua VNPay → S11', (c) => c.push(AppRoutes.vnpay(code))),
        PlaceholderLink('Đánh giá (đơn hoàn thành) → S14', (c) => showReviewSheet(c, dishName: Demo.dishName)),
        PlaceholderLink('Không tìm thấy: Tra cứu đơn khác → S16', (c) => c.push(AppRoutes.lookup())),
        PlaceholderLink('Tiếp tục đặt món → S05', (c) => c.go(AppRoutes.menu())),
      ],
    );
  }
}
