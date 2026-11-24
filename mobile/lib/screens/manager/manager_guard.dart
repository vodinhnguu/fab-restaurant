// Chặn màn Quản lý với tài khoản không có quyền Xem "Tổng quan" (docs/28-app-quan-ly.md).
//
// Menu trái đã ẩn mục Quản lý với người không có quyền, nhưng vẫn cần chặn ở đây vì:
//   - gõ / mở thẳng đường dẫn /manager (vd deep link, test)
//   - admin đổi ma trận phân quyền lúc nhân viên đang mở app
//
// Backend vẫn tự kiểm tra lại (403), đây chỉ là để người dùng không thấy màn trắng.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../state/auth_state.dart';
import '../../theme/app_colors.dart';

class ManagerGuard extends ConsumerWidget {
  const ManagerGuard({super.key, required this.child, this.needDrinks = false});

  final Widget child;

  /// true = màn này cần quyền Xem "Bia nước & kiểm kho quầy" (S17), không phải quyền Tổng quan.
  final bool needDrinks;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    // Chưa tải xong /auth/me: chờ, đừng đẩy đi ngay (sẽ nhấp nháy)
    if (user == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final allowed = needDrinks ? user.canSeeDrinks : user.canSeeManager;
    if (!allowed) {
      return Scaffold(
        appBar: AppBar(title: Text(needDrinks ? 'Kiểm bia nước' : 'Quản lý')),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline_rounded, size: 48, color: AppColors.slate500),
              const SizedBox(height: 12),
              Text(
                needDrinks
                    ? 'Tài khoản của bạn không xem được phiếu kiểm bia nước'
                    : 'Tài khoản của bạn không xem được số liệu quản lý',
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900),
              ),
              const SizedBox(height: 6),
              Text(
                needDrinks
                    ? 'Phần này cần quyền Xem "Bia nước & kiểm kho quầy" trong ma trận phân quyền (quản lý, chủ nhà hàng, tổ trưởng, thu ngân).'
                    : 'Phần này cần quyền Xem "Tổng quan" trong ma trận phân quyền (quản lý, chủ nhà hàng, tổ trưởng, thu ngân).',
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.slate500, fontSize: 13),
              ),
              const SizedBox(height: 20),
              FilledButton.icon(
                onPressed: () => context.go(AppRoutes.tables),
                icon: const Icon(Icons.table_restaurant_rounded, size: 20),
                label: const Text('Về sơ đồ bàn'),
              ),
            ],
          ),
        ),
      );
    }
    return child;
  }
}
