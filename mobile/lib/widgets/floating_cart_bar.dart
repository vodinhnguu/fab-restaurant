// Thanh phiếu gọi món nổi: "📝 Bàn B05 · 3 món / 850.000đ   Xem phiếu ›" (2 dòng để máy hẹp không cắt chữ).
// Hiện ở dưới cùng S05, S06 khi phiếu có món. Phiếu trống thì ẩn.
// Bấm → S08 Phiếu gọi món.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../app/routes.dart';
import '../state/cart_state.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class FloatingCartBar extends ConsumerWidget {
  const FloatingCartBar({super.key, required this.tableId});

  final int tableId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartCountProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    final table = ref.watch(ticketTableProvider);

    // AnimatedSize: thanh trượt lên / thu lại mượt khi phiếu có món / hết món.
    return AnimatedSize(
      duration: const Duration(milliseconds: 200),
      child: count == 0
          ? const SizedBox(width: double.infinity)
          : SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                child: Material(
                  color: AppColors.ocean950,
                  borderRadius: BorderRadius.circular(14),
                  elevation: 6,
                  shadowColor: AppColors.ocean950.withValues(alpha: 0.4),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () => context.push(AppRoutes.ticket(tableId)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      child: Row(
                        children: [
                          Icon(Icons.edit_note_rounded, color: AppColors.white.withValues(alpha: 0.75), size: 22),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  [if (table != null) 'Bàn ${table.code}', '$count món'].join(' · '),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(color: AppColors.white.withValues(alpha: 0.75), fontSize: 12),
                                ),
                                Text(
                                  formatMoney(subtotal),
                                  maxLines: 1,
                                  style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w800, fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                          const Text(
                            'Xem phiếu',
                            style: TextStyle(color: AppColors.coral500, fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                          const Icon(Icons.chevron_right_rounded, color: AppColors.coral500),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
    );
  }
}
