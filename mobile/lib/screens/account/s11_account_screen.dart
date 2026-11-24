// S11. Tài khoản (mục "Tài khoản" ở menu trái, lib/app/app_drawer.dart): docs/23-app-nhan-vien-phuc-vu.md mục 2
// Không gọi API riêng: lấy người đang đăng nhập (currentUserProvider).
//
// Thẻ nhân viên (avatar chữ cái đầu, tên, email, vai trò) + "Bạn làm được gì trong app"
// (theo quyền "Đơn hàng & gọi món") + Đăng xuất (xóa phiếu gọi món chưa gửi, hàm confirmLogout dùng chung với menu trái).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/app_drawer.dart';
import '../../app/config.dart';
import '../../models/user.dart';
import '../../state/auth_state.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    return Scaffold(
      drawer: const AppDrawer(current: AppSection.account),
      appBar: AppBar(title: const Text('Tài khoản')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          if (user != null) ...[
            _UserCard(user),
            const SizedBox(height: 16),
            _AbilitiesCard(user),
          ],
          const SizedBox(height: 16),
          Card(
            clipBehavior: Clip.antiAlias,
            child: ListTile(
              leading: const Icon(Icons.logout_rounded, color: AppColors.danger),
              title: const Text('Đăng xuất', style: TextStyle(fontWeight: FontWeight.w500, color: AppColors.danger)),
              onTap: () => confirmLogout(context, ref),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Ngưu Quán · Phiên bản ${AppConfig.appVersion}',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.slate500, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

// ---- Phần riêng của S11 ----

/// Avatar chữ cái đầu, tên, email, nhãn vai trò.
class _UserCard extends StatelessWidget {
  const _UserCard(this.user);
  final User user;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: AppColors.ocean900,
              child: Text(
                user.initial,
                style: const TextStyle(color: AppColors.white, fontSize: 22, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.ocean900),
                  ),
                  const SizedBox(height: 2),
                  Text(user.email, style: const TextStyle(color: AppColors.slate500)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(color: AppColors.ocean50, borderRadius: BorderRadius.circular(999)),
                    child: Text(
                      user.roleLabel,
                      style: const TextStyle(color: AppColors.ocean700, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// "Bạn làm được gì trong app": 3 dòng có / không theo quyền "Đơn hàng & gọi món".
class _AbilitiesCard extends StatelessWidget {
  const _AbilitiesCard(this.user);
  final User user;

  @override
  Widget build(BuildContext context) {
    final rows = [
      ('Xem sơ đồ bàn, đơn của bàn, đơn hôm nay', user.canUseApp),
      ('Ghi món, gửi bếp', user.canTakeOrder),
      ('Check món, hủy món, gửi thanh toán', user.canUpdateOrder),
    ];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bạn làm được gì trong app', style: AppText.sectionTitle()),
            const SizedBox(height: 4),
            const Text(
              'Theo quyền "Đơn hàng & gọi món" trong ma trận phân quyền (admin sửa trên web).',
              style: TextStyle(color: AppColors.slate500, fontSize: 12),
            ),
            for (final (label, allowed) in rows)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Row(
                  children: [
                    Icon(
                      allowed ? Icons.check_circle_rounded : Icons.block_rounded,
                      size: 20,
                      color: allowed ? AppColors.success : AppColors.slate300,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(label, style: TextStyle(color: allowed ? AppColors.slate800 : AppColors.slate500)),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
