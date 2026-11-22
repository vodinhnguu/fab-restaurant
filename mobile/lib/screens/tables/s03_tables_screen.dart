// S03. Sơ đồ bàn (màn đầu sau đăng nhập, mục "Sơ đồ bàn" ở menu trái): docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: GET /dine-in/tables (tự tải lại mỗi 15 giây, kéo xuống để tải lại)
//
// Luồng: CHỌN KHU → CHỌN BÀN. Nút ☰ góc trái mở menu trái (lib/app/app_drawer.dart): tên nhân viên,
// số bàn có khách / bàn trống / tổng tiền các bàn đang mở, chuyển sang Đơn hôm nay, Tài khoản.
// Từ trên xuống:
//   khung cam "Phiếu bàn B05 chưa gửi bếp" (khi phiếu gọi món còn món) → S08
//   khung "Order đã cất, chưa gửi bếp": mỗi bàn 1 nút "T01 · 3 món" → S04 của bàn đó
//   3 ô khu vực: Trong nhà / Ngoài trời - view biển / Phòng VIP (số bàn có khách, số bàn chờ thanh toán)
//   sơ đồ bàn của khu đang chọn, xếp theo vị trí x, y như sơ đồ trên web:
//     trắng = trống, xanh đậm = có khách (tổng tiền, số món, món chưa ra), cam = đã gửi thanh toán.
//   Bấm ô bàn → S04.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_drawer.dart';
import '../../app/routes.dart';
import '../../models/dining_table.dart';
import '../../services/dine_in_service.dart';
import '../../state/cart_state.dart';
import '../../theme/app_colors.dart';
import '../../utils/format.dart';
import '../../widgets/state_views.dart';

/// Khu đang chọn (giữ khi sang màn khác / mở bàn rồi quay lại). null = khu đầu tiên.
final selectedAreaProvider = StateProvider<String?>((ref) => null);

class TablesScreen extends ConsumerStatefulWidget {
  const TablesScreen({super.key});

  static const refreshEvery = Duration(seconds: 15);

  @override
  ConsumerState<TablesScreen> createState() => _TablesScreenState();
}

class _TablesScreenState extends ConsumerState<TablesScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    // Bàn khác có thể vừa được đồng nghiệp ghi món / thu ngân thu tiền: tự tải lại cho mới.
    _timer = Timer.periodic(TablesScreen.refreshEvery, (_) => ref.invalidate(floorProvider));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _refresh() => ref.refresh(floorProvider.future);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(current: AppSection.tables),
      appBar: AppBar(
        title: const Text('Sơ đồ bàn'),
        actions: [
          IconButton(tooltip: 'Tải lại', onPressed: _refresh, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: AsyncView(
        value: ref.watch(floorProvider),
        onRetry: () => ref.invalidate(floorProvider),
        data: (areas) {
          if (areas.isEmpty) {
            return const EmptyView(icon: Icons.table_restaurant_outlined, title: 'Chưa có bàn nào');
          }
          final selectedName = ref.watch(selectedAreaProvider);
          final area = areas.firstWhere((a) => a.name == selectedName, orElse: () => areas.first);
          return RefreshIndicator(
            color: AppColors.coral500,
            onRefresh: _refresh,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              children: [
                const _PendingTicketBanner(),
                const _SavedTicketsBanner(),
                const Text(
                  'Chọn khu',
                  style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900, fontSize: 15),
                ),
                const SizedBox(height: 8),
                _AreaPicker(
                  areas: areas,
                  selected: area.name,
                  onSelected: (name) => ref.read(selectedAreaProvider.notifier).state = name,
                ),
                const SizedBox(height: 16),
                const _Legend(),
                const SizedBox(height: 10),
                _AreaMap(area: area),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ---- Phần riêng của S03 ----

/// Phiếu gọi món còn món chưa gửi bếp: nhắc để khỏi quên. Bấm → S08.
class _PendingTicketBanner extends ConsumerWidget {
  const _PendingTicketBanner();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartCountProvider);
    final table = ref.watch(ticketTableProvider);
    if (count == 0 || table == null) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Material(
        color: AppColors.coral50,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () => context.go(AppRoutes.ticket(table.id)),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.coral500),
            ),
            child: Row(
              children: [
                const Icon(Icons.edit_note_rounded, color: AppColors.coral600),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Phiếu bàn ${table.code} chưa gửi bếp: $count món',
                    style: const TextStyle(color: AppColors.coral600, fontWeight: FontWeight.w700),
                  ),
                ),
                const Text('Xem', style: TextStyle(color: AppColors.coral600, fontWeight: FontWeight.w700)),
                const Icon(Icons.chevron_right_rounded, color: AppColors.coral600),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Order đã cất (S08 "Cất order"), chưa gửi bếp: nhắc để khỏi quên. Bấm bàn → S04 (nút "Mở order").
class _SavedTicketsBanner extends ConsumerWidget {
  const _SavedTicketsBanner();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final saved = ref.watch(savedTicketsProvider).values.toList()..sort((a, b) => a.savedAt.compareTo(b.savedAt));
    if (saved.isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.coral50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.coral500),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.bookmark_rounded, color: AppColors.coral600, size: 20),
              SizedBox(width: 6),
              Expanded(
                child: Text('Order đã cất, chưa gửi bếp', style: TextStyle(color: AppColors.coral600, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final t in saved)
                ActionChip(
                  avatar: const Icon(Icons.table_restaurant_rounded, size: 16, color: AppColors.coral600),
                  label: Text('${t.table.code} · ${t.count} món'),
                  onPressed: () => context.go(AppRoutes.table(t.table.id)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// 3 ô khu vực cạnh nhau. Ô đang chọn nền xanh đậm.
class _AreaPicker extends StatelessWidget {
  const _AreaPicker({required this.areas, required this.selected, required this.onSelected});
  final List<FloorArea> areas;
  final String selected;
  final ValueChanged<String> onSelected;

  static IconData _icon(String name) {
    final n = name.toLowerCase();
    if (n.contains('ngoài') || n.contains('biển')) return Icons.beach_access_rounded;
    if (n.contains('vip')) return Icons.workspace_premium_rounded;
    return Icons.chair_rounded;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < areas.length; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          Expanded(child: _areaTile(areas[i])),
        ],
      ],
    );
  }

  Widget _areaTile(FloorArea area) {
    final active = area.name == selected;
    final busy = area.tables.where((t) => t.isBusy).length;
    final billing = area.tables.where((t) => t.order?.billRequested ?? false).length;
    final fg = active ? AppColors.white : AppColors.ocean900;
    final muted = active ? AppColors.white.withValues(alpha: 0.75) : AppColors.slate500;
    return Material(
      color: active ? AppColors.ocean900 : AppColors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => onSelected(area.name),
        child: Container(
          constraints: const BoxConstraints(minHeight: 112),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: active ? AppColors.ocean900 : AppColors.slate200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(_icon(area.name), color: active ? AppColors.coral500 : AppColors.ocean500, size: 22),
              const SizedBox(height: 6),
              Text(
                area.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 13, height: 1.2),
              ),
              const SizedBox(height: 4),
              Text('$busy/${area.tables.length} có khách', style: TextStyle(color: muted, fontSize: 11)),
              if (billing > 0)
                Text(
                  '$billing chờ thanh toán',
                  style: TextStyle(
                    color: active ? const Color(0xFFFFB59C) : AppColors.coral600,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Chú thích màu ô bàn.
class _Legend extends StatelessWidget {
  const _Legend();

  @override
  Widget build(BuildContext context) {
    Widget dot(Color color, String label, {Color? border}) => Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(3),
                border: Border.all(color: border ?? color),
              ),
            ),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
          ],
        );
    return Wrap(
      spacing: 14,
      runSpacing: 6,
      children: [
        dot(AppColors.white, 'Trống', border: AppColors.slate300),
        dot(AppColors.ocean900, 'Có khách'),
        dot(AppColors.coral500, 'Chờ thanh toán'),
      ],
    );
  }
}

/// Sơ đồ 1 khu: bàn đặt đúng hàng / cột (x, y) như sơ đồ trên web, ô trống chừa chỗ.
/// Bàn chưa có vị trí (x hoặc y = 0) thì xếp nối tiếp theo mã bàn.
class _AreaMap extends StatelessWidget {
  const _AreaMap({required this.area});
  final FloorArea area;

  @override
  Widget build(BuildContext context) {
    const gap = 8.0;
    final tables = area.tables;
    final placed = tables.every((t) => t.x > 0 && t.y > 0);
    final cols = placed ? tables.map((t) => t.x).reduce((a, b) => a > b ? a : b) : 4;
    final rows = placed
        ? tables.map((t) => t.y).reduce((a, b) => a > b ? a : b)
        : (tables.length / cols).ceil();

    DiningTable? at(int x, int y) => placed
        ? tables.where((t) => t.x == x && t.y == y).firstOrNull
        : tables.elementAtOrNull((y - 1) * cols + (x - 1));

    return Column(
      children: [
        for (var y = 1; y <= rows; y++) ...[
          if (y > 1) const SizedBox(height: gap),
          Row(
            children: [
              for (var x = 1; x <= cols; x++) ...[
                if (x > 1) const SizedBox(width: gap),
                Expanded(
                  child: switch (at(x, y)) {
                    final t? => _TableTile(table: t),
                    null => const SizedBox(height: _TableTile.height),
                  },
                ),
              ],
            ],
          ),
        ],
      ],
    );
  }
}

/// 1 ô bàn. Trống: viền mảnh, "4 ghế · Trống". Có khách: nền xanh đậm, tổng tiền, số món, món chưa ra.
/// Đã gửi thanh toán: nền cam "Chờ thu tiền". Phiếu gọi món đang ghi cho bàn này: viền cam + icon.
class _TableTile extends ConsumerWidget {
  const _TableTile({required this.table});
  final DiningTable table;

  static const height = 100.0;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = table.order;
    final busy = order != null;
    final billing = order?.billRequested ?? false;
    final ticketTable = ref.watch(ticketTableProvider);
    final hasTicket = ticketTable?.id == table.id && ref.watch(cartCountProvider) > 0;
    final hasSaved = ref.watch(savedTicketsProvider).containsKey(table.id); // có order đã cất

    final bg = billing ? AppColors.coral500 : (busy ? AppColors.ocean900 : AppColors.white);
    final fg = busy ? AppColors.white : AppColors.ocean900;
    final muted = busy ? AppColors.white.withValues(alpha: 0.8) : AppColors.slate500;

    final String statusLine;
    if (!busy) {
      statusLine = 'Trống';
    } else if (billing) {
      statusLine = 'Chờ thu tiền';
    } else if (order.weighingCount > 0) {
      statusLine = '${order.weighingCount} chờ cân';
    } else if (order.waitingCount > 0) {
      statusLine = '${order.waitingCount} chưa ra';
    } else {
      statusLine = 'Đã lên đủ';
    }

    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => context.go(AppRoutes.table(table.id)),
        child: Container(
          height: height,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: hasTicket || hasSaved ? AppColors.coral500 : (busy ? bg : AppColors.slate200),
              width: hasTicket || hasSaved ? 2.5 : 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(table.code, style: TextStyle(color: fg, fontSize: 16, fontWeight: FontWeight.w800)),
                    ),
                  ),
                  if (hasTicket) Icon(Icons.edit_note_rounded, size: 16, color: busy ? AppColors.white : AppColors.coral500),
                  if (hasSaved) Icon(Icons.bookmark_rounded, size: 16, color: busy ? AppColors.white : AppColors.coral500),
                ],
              ),
              const Spacer(),
              if (busy)
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(formatMoney(order.total), style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 13)),
                )
              else
                Text('${table.seats} ghế', maxLines: 1, style: TextStyle(color: muted, fontSize: 11)),
              if (busy)
                Text(
                  '${order.itemCount} món',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: muted, fontSize: 11),
                ),
              Text(
                statusLine,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: !busy ? AppColors.success : (billing ? AppColors.white : (order.waitingCount > 0 ? AppColors.ocean200 : const Color(0xFF7EE2A8))),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
