// Nhãn trạng thái dạng viên thuốc nhỏ (mục 2.1 "Màu trạng thái" docs/16).
// Dùng ở S04 (đơn của bàn), S10 (đơn hôm nay).
//
//   StatusBadge.order(OrderStatus.fromCode(order['status']))
//   StatusBadge.payment(PaymentStatus.paid)

import 'package:flutter/material.dart';

import '../models/status.dart';
import '../theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.label, required this.color});

  StatusBadge.order(OrderStatus status, {Key? key})
      : this(key: key, label: status.label, color: _orderColors[status]!);

  StatusBadge.payment(PaymentStatus status, {Key? key})
      : this(key: key, label: status.label, color: _paymentColors[status]!);

  final String label;
  final StatusColor color;

  static const _orderColors = {
    OrderStatus.pending: AppColors.amber,
    OrderStatus.confirmed: AppColors.blue,
    OrderStatus.preparing: AppColors.indigo,
    OrderStatus.delivering: AppColors.cyan, // đơn tại bàn: Đã lên món
    OrderStatus.completed: AppColors.green,
    OrderStatus.cancelled: AppColors.red,
  };

  static const _paymentColors = {
    PaymentStatus.unpaid: AppColors.amber,
    PaymentStatus.paid: AppColors.green,
    PaymentStatus.refunded: AppColors.gray,
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.background, borderRadius: BorderRadius.circular(999)),
      child: Text(
        label,
        style: TextStyle(color: color.foreground, fontSize: 12, fontWeight: FontWeight.w600),
      ),
    );
  }
}
