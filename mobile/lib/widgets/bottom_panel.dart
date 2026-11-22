// Khung thanh dưới cùng cố định của các màn mở toàn màn hình: nền trắng, viền trên mảnh,
// chừa chỗ thanh điều hướng của điện thoại. Đặt vào Scaffold.bottomNavigationBar.
//
//   S06: [ − ] 1 [ + ]  "Thêm vào giỏ · 250.000đ"
//   S08: "Tạm tính 850.000đ" + "Tiến hành đặt món"
//
//   bottomNavigationBar: BottomPanel(child: FilledButton(...))

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class BottomPanel extends StatelessWidget {
  const BottomPanel({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) => DecoratedBox(
        decoration: const BoxDecoration(
          color: AppColors.white,
          border: Border(top: BorderSide(color: AppColors.slate200)),
        ),
        child: SafeArea(
          top: false,
          child: Padding(padding: const EdgeInsets.fromLTRB(16, 12, 16, 12), child: child),
        ),
      );
}
