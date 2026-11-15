// S10. Bottom sheet: Chọn mã giảm giá
// Xem docs/16-dac-ta-app-mobile-stitch.md mục S10
// API: GET /coupons/public, POST /coupons/check
// Thiết kế: design/S10.png
//
// Mở từ S09: showCouponSheet(context)

import 'package:flutter/material.dart';

import '../../widgets/placeholder_screen.dart';

Future<void> showCouponSheet(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => const _CouponSheet(),
  );
}

class _CouponSheet extends StatelessWidget {
  const _CouponSheet();

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 4): danh sách vé mã, nút "Dùng mã", vé mờ khi chưa đủ mức tối thiểu.
    return const PlaceholderSheet(code: 'S10', title: 'Ưu đãi đang diễn ra');
  }
}
