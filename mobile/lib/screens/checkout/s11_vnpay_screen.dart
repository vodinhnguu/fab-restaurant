// S11. Trang VNPay (WebView): xem docs/16-dac-ta-app-mobile-stitch.md mục S11
// API: POST /payments/vnpay/:code { phone } → { paymentUrl }; về VNP_RETURN_URL thì sang S12
// Thiết kế: design/S11.png

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../widgets/placeholder_screen.dart';

class VnpayScreen extends StatelessWidget {
  const VnpayScreen({super.key, required this.orderCode});

  final String orderCode;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 5): WebView mở paymentUrl, theo dõi địa chỉ trả về, hỏi trước khi đóng.
    return PlaceholderScreen(
      code: 'S11',
      title: 'Thanh toán VNPay',
      note: 'Mã đơn $orderCode',
      links: [
        PlaceholderLink('Giả lập: VNPay trả về → S12', (c) => c.go(AppRoutes.paymentResult)),
        PlaceholderLink(
          '× Hủy thanh toán → S13',
          (c) => c.go(AppRoutes.order(orderCode, phone: Demo.phone)),
        ),
      ],
    );
  }
}
