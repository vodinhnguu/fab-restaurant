// S12. Kết quả thanh toán: xem docs/16-dac-ta-app-mobile-stitch.md mục S12
// API: GET /payments/vnpay/return?vnp_... → { paid, message, orderCode, phone, amount, transactionNo, bankCode }
// Thiết kế: design/S12.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class PaymentResultScreen extends StatelessWidget {
  const PaymentResultScreen({super.key, this.vnpParams = const {}});

  /// Phần ?vnp_... lấy từ địa chỉ trả về của VNPay (S11 truyền sang).
  final Map<String, String> vnpParams;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 5): gọi backend kiểm tra, hiện thành công / chưa thành công.
    return PlaceholderScreen(
      code: 'S12',
      title: 'Kết quả thanh toán',
      links: [
        PlaceholderLink(
          'Xem đơn hàng → S13',
          (c) => c.go(AppRoutes.order(Demo.orderCode, phone: Demo.phone)),
        ),
        PlaceholderLink('Tiếp tục đặt món → S05', (c) => c.go(AppRoutes.menu())),
      ],
    );
  }
}
