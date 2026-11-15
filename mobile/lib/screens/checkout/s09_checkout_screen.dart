// S09. Thanh toán (đặt hàng): xem docs/16-dac-ta-app-mobile-stitch.md mục S09
// API: POST /coupons/check, GET /coupons/public, POST /orders, POST /payments/vnpay/:code
// Thiết kế: design/S09.png
//
// Màn này dài (6 khối). Khi làm thật nên tách khối ra thư mục checkout/parts/.

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';
import '../cart/s07_note_sheet.dart';
import 's10_coupon_sheet.dart';

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 4): thay khung giữ chỗ bằng giao diện thật.
    return PlaceholderScreen(
      code: 'S09',
      title: 'Thanh toán',
      note: 'Đặt xong dùng context.go (thay màn) để khách không quay lại được S09.',
      links: [
        PlaceholderLink('Ghi chú món → S07', (c) => showNoteSheet(c, dishName: Demo.dishName)),
        PlaceholderLink('Xem tất cả ưu đãi → S10', (c) => showCouponSheet(c)),
        PlaceholderLink('Đăng nhập để điền nhanh → S02', (c) => c.push(AppRoutes.login)),
        PlaceholderLink(
          'Đặt hàng (tiền mặt) → S13',
          (c) => c.go(AppRoutes.order(Demo.orderCode, phone: Demo.phone, justPlaced: true)),
        ),
        PlaceholderLink('Đặt hàng & thanh toán VNPay → S11', (c) => c.go(AppRoutes.vnpay(Demo.orderCode))),
      ],
    );
  }
}
