// S10. Đơn hôm nay (mục "Đơn hôm nay" ở menu trái, lib/app/app_drawer.dart): docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: GET /dine-in/orders (đơn tại bàn hôm nay), GET /orders/:id (xem lại 1 đơn đã xong)
//
// Từ trên xuống:
//   khối tổng: đã thu bao nhiêu (bao nhiêu đơn), đang phục vụ bao nhiêu bàn
//   chip lọc: Tất cả / Đang phục vụ / Đã thu tiền / Đã hủy
//   từng đơn: bàn, trạng thái, mã đơn, giờ mở, số món, người mở, tổng tiền
//   bấm đơn đang phục vụ → S04 của bàn; đơn đã xong → sheet xem lại món (+ lý do hủy)

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_drawer.dart';
import '../../app/routes.dart';
import '../../models/order.dart';
import '../../models/status.dart';
import '../../services/dine_in_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';

enum OrderFilter {
  all('Tất cả'),
  open('Đang phục vụ'),
  paid('Đã thu tiền'),
  cancelled('Đã hủy');

  const OrderFilter(this.label);
  final String label;

  bool matches(Order o) => switch (this) {
    all => true,
    open => o.status.isOpen,
    paid => o.status == OrderStatus.completed,
    cancelled => o.status == OrderStatus.cancelled,
  };
}

class TodayOrdersScreen extends ConsumerStatefulWidget {
  const TodayOrdersScreen({super.key});

  @override
  ConsumerState<TodayOrdersScreen> createState() => _TodayOrdersScreenState();
}

class _TodayOrdersScreenState extends ConsumerState<TodayOrdersScreen> {
  OrderFilter _filter = OrderFilter.all;

  Future<void> _refresh() => ref.refresh(todayOrdersProvider.future);

  void _open(Order order) {
    if (order.status.isOpen && order.tableId != null) {
      context.go(AppRoutes.table(order.tableId!));
    } else {
      _showOrderSheet(context, order);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(current: AppSection.orders),
      appBar: AppBar(
        title: const Text('Đơn hôm nay'),
        actions: [IconButton(tooltip: 'Tải lại', onPressed: _refresh, icon: const Icon(Icons.refresh_rounded))],
      ),
      body: AsyncView(
        value: ref.watch(todayOrdersProvider),
        onRetry: () => ref.invalidate(todayOrdersProvider),
        data: (orders) {
          final shown = orders.where(_filter.matches).toList();
          return RefreshIndicator(
            color: AppColors.coral500,
            onRefresh: _refresh,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
              children: [
                _Totals(orders: orders),
                const SizedBox(height: 12),
                // Wrap: máy hẹp thì chip xuống dòng, không bị cắt ở mép phải
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final f in OrderFilter.values)
                      ChoiceChip(
                        label: Text('${f.label} (${orders.where(f.matches).length})'),
                        selected: _filter == f,
                        onSelected: (_) => setState(() => _filter = f),
                      ),
                  ],
                ),
                if (shown.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 40),
                    child: EmptyView(icon: Icons.receipt_long_outlined, title: 'Chưa có đơn nào'),
                  )
                else
                  for (final o in shown)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: _OrderCard(order: o, onTap: () => _open(o)),
                    ),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ---- Phần riêng của S10 ----

/// "Đã thu 3.250.000đ · 8 đơn" + "Đang phục vụ 2 bàn · 1.200.000đ".
class _Totals extends StatelessWidget {
  const _Totals({required this.orders});
  final List<Order> orders;

  @override
  Widget build(BuildContext context) {
    final paid = orders.where((o) => o.status == OrderStatus.completed).toList();
    final open = orders.where((o) => o.status.isOpen).toList();
    int sum(List<Order> list) => list.fold(0, (s, o) => s + o.total);

    Widget block(String label, String value, String sub) => Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: AppColors.white.withValues(alpha: 0.7), fontSize: 12)),
          const SizedBox(height: 2),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: const TextStyle(color: AppColors.white, fontSize: 20, fontWeight: FontWeight.w800),
            ),
          ),
          Text(sub, style: TextStyle(color: AppColors.white.withValues(alpha: 0.7), fontSize: 12)),
        ],
      ),
    );

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.ocean900, borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          block('Đã thu hôm nay', formatMoney(sum(paid)), '${paid.length} đơn'),
          const SizedBox(width: 12),
          block('Đang phục vụ', formatMoney(sum(open)), '${open.length} bàn'),
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order, required this.onTap});
  final Order order;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: order.status.isOpen ? AppColors.ocean900 : AppColors.ocean50,
                child: Text(
                  order.tableCode ?? '?',
                  style: TextStyle(
                    color: order.status.isOpen ? AppColors.white : AppColors.ocean900,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Bàn ${order.tableCode ?? ''}',
                            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900),
                          ),
                        ),
                        if (order.status.isOpen && order.billRequested)
                          const StatusBadge(label: 'Chờ thu tiền', color: AppColors.amber)
                        else
                          StatusBadge.order(order.status),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${order.code} · ${formatTime(order.createdAt)}',
                      style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            ['${order.itemCount} món', if (order.staffName != null) order.staffName!].join(' · '),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                          ),
                        ),
                        Text(
                          formatMoney(order.total),
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            color: order.status == OrderStatus.cancelled ? AppColors.slate500 : AppColors.coral600,
                            decoration: order.status == OrderStatus.cancelled ? TextDecoration.lineThrough : null,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Sheet xem lại 1 đơn đã thu tiền / đã hủy: tải chi tiết (GET /orders/:id) rồi hiện món.
void _showOrderSheet(BuildContext context, Order summary) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useRootNavigator: true, // mở trên navigator gốc, che cả màn
    showDragHandle: true,
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      builder: (context, scroll) => _OrderSheet(summary: summary, scroll: scroll),
    ),
  );
}

/// Nội dung sheet. Gọi API 1 lần trong initState (sheet kéo lên xuống sẽ vẽ lại nhiều lần).
class _OrderSheet extends ConsumerStatefulWidget {
  const _OrderSheet({required this.summary, required this.scroll});
  final Order summary;
  final ScrollController scroll;

  @override
  ConsumerState<_OrderSheet> createState() => _OrderSheetState();
}

class _OrderSheetState extends ConsumerState<_OrderSheet> {
  late final Future<Order> _future = ref.read(dineInServiceProvider).order(widget.summary.id);

  @override
  Widget build(BuildContext context) {
    final summary = widget.summary;
    final scroll = widget.scroll;
    return FutureBuilder<Order>(
      future: _future,
      builder: (context, snap) {
        if (snap.hasError) return ErrorView(error: snap.error!);
        final order = snap.data;
        if (order == null) return const LoadingView();
        return ListView(
          controller: scroll,
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
          children: [
            Row(
              children: [
                Expanded(
                  child: Text('Bàn ${order.tableCode ?? summary.tableCode ?? ''}', style: AppText.sectionTitle()),
                ),
                StatusBadge.order(order.status),
              ],
            ),
            Text(
              '${order.code} · ${formatDateTime(order.createdAt)}',
              style: const TextStyle(color: AppColors.slate500, fontSize: 13),
            ),
            if (order.cancelReason != null && order.cancelReason!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text('Lý do hủy: ${order.cancelReason}', style: const TextStyle(color: AppColors.danger)),
            ],
            const SizedBox(height: 8),
            for (final item in order.items)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 34,
                      child: Text('${item.quantity}×', style: const TextStyle(fontWeight: FontWeight.w800)),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.name),
                          if (item.note != null && item.note!.isNotEmpty)
                            Text(
                              'Ghi chú: ${item.note}',
                              style: const TextStyle(color: AppColors.ocean700, fontSize: 13),
                            ),
                        ],
                      ),
                    ),
                    Text(formatMoney(item.lineTotal)),
                  ],
                ),
              ),
            const Divider(height: 28),
            Row(
              children: [
                const Expanded(child: Text('Tổng cộng', style: TextStyle(fontSize: 15))),
                Text(
                  formatMoney(order.total),
                  style: const TextStyle(color: AppColors.coral600, fontSize: 20, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}
