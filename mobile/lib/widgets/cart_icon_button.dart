// Nút phiếu gọi món có số món (chấm cam). Dùng ở thanh trên S05, nút nổi trên ảnh ở S06.
// Bấm → S08 Phiếu gọi món của bàn đang ghi.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../app/routes.dart';
import '../state/cart_state.dart';
import '../theme/app_colors.dart';

class CartIconButton extends ConsumerWidget {
  const CartIconButton({super.key, required this.tableId, this.color = AppColors.ocean900});

  final int tableId;
  final Color color;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartCountProvider);
    return IconButton(
      tooltip: 'Phiếu gọi món',
      onPressed: () => context.push(AppRoutes.ticket(tableId)),
      icon: Badge(
        isLabelVisible: count > 0,
        backgroundColor: AppColors.coral500,
        label: Text(count > 99 ? '99+' : '$count'),
        child: Icon(Icons.edit_note_rounded, color: color),
      ),
    );
  }
}
