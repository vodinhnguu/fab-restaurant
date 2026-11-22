// Menu trái kiểu CukCuk (thay cho 3 tab dưới cũ): docs/19-app-mobile.md mục 3
//
// Mở: bấm nút ☰ góc trái thanh tiêu đề, hoặc vuốt từ mép trái màn hình.
// Có ở 3 màn chính S03 Sơ đồ bàn, S10 Đơn hôm nay, S11 Tài khoản: mỗi màn đặt
//   Scaffold(drawer: const AppDrawer(current: AppSection.tables), ...)
// là Flutter tự thêm nút ☰ vào AppBar.
//
// Từ trên xuống:
//   khối xanh đậm: avatar, tên, vai trò + 3 số của ca (bàn có khách, bàn trống, tiền đang phục vụ)
//   3 mục: Sơ đồ bàn · Đơn hôm nay · Tài khoản (mục đang mở tô màu)
//   Đăng xuất (hỏi lại, xóa phiếu chưa gửi) · phiên bản app
//
// Đổi tên / icon / thứ tự mục: sửa enum AppSection bên dưới.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../models/dining_table.dart';
import '../models/user.dart';
import '../services/dine_in_service.dart';
import '../state/auth_state.dart';
import '../state/cart_state.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import '../widgets/app_snackbar.dart';
import '../widgets/confirm_dialog.dart';
import 'config.dart';
import 'routes.dart';

/// 3 mục của menu trái, theo thứ tự hiện.
enum AppSection {
  tables('Sơ đồ bàn', Icons.table_restaurant_rounded, AppRoutes.tables),
  orders('Đơn hôm nay', Icons.receipt_long_rounded, AppRoutes.orders),
  account('Tài khoản', Icons.person_rounded, AppRoutes.account);

  const AppSection(this.label, this.icon, this.route);
  final String label;
  final IconData icon;
  final String route;
}

class AppDrawer extends ConsumerWidget {
  const AppDrawer({super.key, required this.current});

  /// Màn đang mở, để tô màu mục tương ứng.
  final AppSection current;

  void _open(BuildContext context, AppSection section) {
    Scaffold.of(context).closeDrawer();
    if (section != current) context.go(section.route);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    return Drawer(
      child: Column(
        children: [
          _Header(user: user),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                for (final section in AppSection.values)
                  _MenuItem(
                    icon: section.icon,
                    label: section.label,
                    selected: section == current,
                    onTap: () => _open(context, section),
                  ),
                const Divider(height: 24, indent: 16, endIndent: 16),
                _MenuItem(
                  icon: Icons.logout_rounded,
                  label: 'Đăng xuất',
                  color: AppColors.danger,
                  onTap: () => confirmLogout(context, ref),
                ),
              ],
            ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'FAB Phục vụ · Phiên bản ${AppConfig.appVersion}',
                style: const TextStyle(color: AppColors.slate500, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Hỏi lại (nhắc nếu phiếu còn món chưa gửi) → xóa token + phiếu → màn Đăng nhập.
/// Dùng ở menu trái và ở S11 Tài khoản.
Future<void> confirmLogout(BuildContext context, WidgetRef ref) async {
  final pending = ref.read(cartCountProvider);
  final ok = await showConfirmDialog(
    context,
    title: 'Đăng xuất',
    message: pending > 0 ? 'Phiếu gọi món còn $pending món chưa gửi bếp sẽ bị xóa. Vẫn đăng xuất?' : 'Bạn muốn đăng xuất?',
    confirmLabel: 'Đăng xuất',
    danger: true,
  );
  if (!ok) return;
  await ref.read(authProvider.notifier).logout();
  showAppSnack('Đã đăng xuất');
  if (context.mounted) context.go(AppRoutes.login);
}

// ---- Phần riêng của menu trái ----

/// Khối xanh đậm trên cùng: avatar, tên, vai trò, 3 số của ca.
class _Header extends ConsumerWidget {
  const _Header({required this.user});
  final User? user;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final muted = AppColors.white.withValues(alpha: 0.7);
    // Số liệu lấy từ sơ đồ bàn (cùng dữ liệu S03, S03 tự tải lại mỗi 15 giây). Chưa tải xong thì ẩn.
    final areas = ref.watch(floorProvider).valueOrNull;
    return Container(
      width: double.infinity,
      color: AppColors.ocean900,
      padding: EdgeInsets.fromLTRB(16, MediaQuery.paddingOf(context).top + 20, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (user != null) ...[
            CircleAvatar(
              radius: 26,
              backgroundColor: AppColors.coral500,
              child: Text(
                user!.initial,
                style: const TextStyle(color: AppColors.white, fontSize: 22, fontWeight: FontWeight.w700),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              user!.name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.white, fontSize: 17, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 2),
            Text(user!.roleLabel, style: TextStyle(color: muted, fontSize: 13)),
          ],
          if (areas != null) ...[
            const SizedBox(height: 16),
            _ShiftStats(areas: areas),
          ],
        ],
      ),
    );
  }
}

/// 3 số: bàn có khách, bàn trống, tổng tiền các bàn đang mở.
class _ShiftStats extends StatelessWidget {
  const _ShiftStats({required this.areas});
  final List<FloorArea> areas;

  @override
  Widget build(BuildContext context) {
    final tables = areas.expand((a) => a.tables).toList();
    final busy = tables.where((t) => t.isBusy).toList();
    final openTotal = busy.fold(0, (sum, t) => sum + t.order!.total);

    Widget stat(String value, String label) => Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  value,
                  style: const TextStyle(color: AppColors.white, fontSize: 18, fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(height: 2),
              Text(label, style: TextStyle(color: AppColors.white.withValues(alpha: 0.7), fontSize: 11)),
            ],
          ),
        );

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          stat('${busy.length}', 'Bàn có khách'),
          stat('${tables.length - busy.length}', 'Bàn trống'),
          stat(formatMoney(openTotal), 'Đang phục vụ'),
        ],
      ),
    );
  }
}

/// 1 dòng trong menu. Mục đang mở: nền xanh nhạt, chữ đậm.
class _MenuItem extends StatelessWidget {
  const _MenuItem({required this.icon, required this.label, required this.onTap, this.selected = false, this.color});
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool selected;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final fg = color ?? (selected ? AppColors.ocean900 : AppColors.slate800);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: ListTile(
        selected: selected,
        selectedTileColor: AppColors.ocean50,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        leading: Icon(icon, color: selected ? AppColors.coral500 : fg),
        title: Text(
          label,
          style: TextStyle(color: fg, fontWeight: selected ? FontWeight.w700 : FontWeight.w500),
        ),
        onTap: onTap,
      ),
    );
  }
}
