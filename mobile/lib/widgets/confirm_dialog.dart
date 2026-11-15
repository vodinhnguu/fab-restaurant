// Hộp thoại hỏi xác nhận (mục C01 docs/16): tiêu đề, câu hỏi, nút "Không" và nút chính
// (đỏ nếu là hủy / xóa).
//
//   final ok = await showConfirmDialog(context,
//       title: 'Hủy đơn hàng?', message: 'Bạn chắc chắn muốn hủy đơn này?',
//       confirmLabel: 'Hủy đơn', danger: true);
//   if (ok) { ... }

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

Future<bool> showConfirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  String cancelLabel = 'Không',
  bool danger = false,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      backgroundColor: AppColors.white,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900)),
      content: Text(message, style: const TextStyle(color: AppColors.slate800)),
      actions: [
        TextButton(
          style: TextButton.styleFrom(foregroundColor: AppColors.slate500),
          onPressed: () => Navigator.of(context).pop(false),
          child: Text(cancelLabel),
        ),
        FilledButton(
          style: danger ? FilledButton.styleFrom(backgroundColor: AppColors.danger) : null,
          onPressed: () => Navigator.of(context).pop(true),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return result ?? false; // bấm ra ngoài để đóng = "Không"
}
