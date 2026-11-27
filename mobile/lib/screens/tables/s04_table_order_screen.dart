// S04. Đơn của bàn: docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: GET /dine-in/tables/:id (tự tải lại mỗi 15 giây), DELETE /dine-in/orders/:id/bill-request (rút lại),
//      PATCH /orders/:id/status (hủy cả đơn). Check món / Hủy món / Gửi thanh toán: xem S12, S13, S09.
//
// Từ trên xuống:
//   khung cam "Phiếu chưa gửi bếp" (phiếu gọi món của bàn này còn món) → S08
//   khung cam "Order đã cất: 3 món · lúc 19:05" + "Mở order" (bàn có order đã cất ở S08) → S08
//   bàn trống: "Bàn đang trống" + "Ghi món"
//   bàn có khách:
//     khung cam "Đã gửi thanh toán lúc 20:15" (khi đã gửi; rút lại bằng nút dưới cùng)
//     mã đơn, trạng thái đơn, giờ mở bàn, "5 món · 2 chưa ra bàn"
//     khung xanh "2 món chờ cân" + "Nhập số kg" (món bán theo kg, cân tại hồ cùng khách) → S14
//     món theo từng lần gửi bếp ("Lần 2 · 19:40"): nhãn Chờ bếp / Bếp đang làm / Đã ra bàn, món hủy gạch ngang
//   dưới cùng: 3 nút "Check món" (→ S12), "Hủy món" (→ S13), "Order" (gọi thêm → S05)
//              + "Gửi thanh toán · 820.000đ" (→ S09) hoặc "Rút yêu cầu thanh toán"
//   menu ⋮: "Hủy cả đơn" (bắt buộc lý do)
// Nút hiện theo quyền: Order cần ORDERS Thêm; Check món, Hủy món, Nhập số kg, Gửi thanh toán cần ORDERS Sửa.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../models/dining_table.dart';
import '../../models/order.dart';
import '../../models/status.dart';
import '../../services/api_exception.dart';
import '../../services/dine_in_service.dart';
import '../../state/auth_state.dart';
import '../../state/cart_state.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/app_snackbar.dart';
import '../../widgets/bottom_panel.dart';
import '../../widgets/state_views.dart';
import '../../widgets/status_badge.dart';
import 's04_move_table_sheet.dart';
import 's09_bill_request_sheet.dart';
import 's12_check_items_sheet.dart';
import 's13_cancel_item_sheet.dart';
import 's14_weigh_sheet.dart';

class TableOrderScreen extends ConsumerStatefulWidget {
  const TableOrderScreen({super.key, required this.tableId});

  final int tableId;

  static const refreshEvery = Duration(seconds: 15);

  @override
  ConsumerState<TableOrderScreen> createState() => _TableOrderScreenState();
}

class _TableOrderScreenState extends ConsumerState<TableOrderScreen> {
  Timer? _timer;
  bool _busy = false; // đang gửi "Rút lại" / "Hủy cả đơn"
  bool _hadOrder = false; // bàn có đơn ở lần tải trước (phát hiện thu ngân thu tiền xong)

  @override
  void initState() {
    super.initState();
    // Bếp bấm "Nhận làm" trên web, đồng nghiệp gọi thêm món, thu ngân thu tiền...: tự tải lại cho mới.
    _timer = Timer.periodic(TableOrderScreen.refreshEvery, (_) => _reload());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _reload() {
    ref.invalidate(tableDetailProvider(widget.tableId));
    ref.invalidate(floorProvider);
  }

  Future<void> _showPaidDialog(String tableCode) async {
    _timer?.cancel(); // dừng polling, bàn đã trống
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        icon: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
        title: Text('Bàn $tableCode đã thanh toán'),
        content: const Text('Thu ngân đã thu tiền xong. Bàn trống, sẵn sàng đón khách mới.'),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
    if (!mounted) return;
    ref.invalidate(floorProvider);
    ref.invalidate(todayOrdersProvider);
    context.go(AppRoutes.tables);
  }

  /// "Ghi món" / "Order": gắn phiếu gọi món vào bàn này rồi mở S05 ([toTicket] = true: mở thẳng S08).
  /// Bàn có order đã cất thì món đã cất hiện lại trong phiếu. Phiếu ghi dở của BÀN KHÁC được tự cất lại
  /// (không mất món, không gửi nhầm bàn) và báo cho nhân viên biết.
  void _startOrdering(DiningTable table, {bool toTicket = false}) {
    final stashed = ref.read(savedTicketsProvider.notifier).openFor(TicketTable(id: table.id, code: table.code));
    if (stashed != null) showAppSnack('Đã cất order bàn ${stashed.table.code} (${stashed.count} món)');
    context.go(toTicket ? AppRoutes.ticket(table.id) : AppRoutes.menu(table.id));
  }

  Future<void> _checkItems(Order order, String tableCode) async {
    final changed = await showCheckItemsSheet(context, order: order, tableCode: tableCode);
    if (!changed || !mounted) return;
    showAppSnack('Đã cập nhật món ra bàn');
    _reload();
  }

  Future<void> _cancelItem(Order order, String tableCode) async {
    final cancelled = await showCancelItemSheet(context, order: order, tableCode: tableCode);
    if (cancelled == null || !mounted) return;
    showAppSnack('Đã hủy ${cancelled.quantity} × ${cancelled.name}');
    _reload();
  }

  /// Món bán theo kg: phục vụ cân tại hồ cùng khách rồi nhập số kg thật (S14) -> món xuống bếp.
  Future<void> _weigh(Order order, String tableCode) async {
    final changed = await showWeighSheet(context, order: order, tableCode: tableCode);
    if (!changed || !mounted) return;
    showAppSnack('Đã nhập số kg, món đã xuống bếp');
    ref.invalidate(floorProvider); // ô bàn ở S03 bớt dòng "chờ cân"
    _reload();
  }

  Future<void> _requestBill(Order order, String tableCode) async {
    final sent = await showBillRequestSheet(context, order: order, tableCode: tableCode);
    if (!sent || !mounted) return;
    showAppSnack('Đã gửi thanh toán bàn $tableCode cho thu ngân');
    ref.invalidate(floorProvider);
    ref.invalidate(todayOrdersProvider);
    context.go(AppRoutes.tables); // việc ở bàn này đã xong, về sơ đồ phục vụ bàn khác
  }

  Future<void> _withdrawBill(Order order) async {
    setState(() => _busy = true);
    try {
      await ref.read(dineInServiceProvider).cancelBillRequest(order.id);
      showAppSnack('Đã rút yêu cầu thanh toán');
      _reload();
    } on ApiException catch (e) {
      showAppSnack(e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _cancelOrder(Order order, String tableCode) async {
    final reason = await _askCancelReason(context, tableCode);
    if (reason == null || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(dineInServiceProvider).cancelOrder(order.id, reason);
      showAppSnack('Đã hủy đơn bàn $tableCode');
      ref.invalidate(floorProvider);
      ref.invalidate(todayOrdersProvider);
      if (mounted) context.go(AppRoutes.tables);
    } on ApiException catch (e) {
      showAppSnack(e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _moveTable(DiningTable fromTable) async {
    final result = await showMoveTableSheet(context, ref: ref, fromTable: fromTable);
    if (result == null || !mounted) return;
    setState(() => _busy = true);
    try {
      final detail = await ref.read(dineInServiceProvider).moveTable(
        fromTable.id,
        result.tableId,
        reason: result.reason,
      );
      showAppSnack('Đã chuyển sang bàn ${detail.table.code}');
      ref.invalidate(floorProvider);
      ref.invalidate(todayOrdersProvider);
      if (mounted) context.go(AppRoutes.table(detail.table.id));
    } on ApiException catch (e) {
      showAppSnack(e.message, error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final value = ref.watch(tableDetailProvider(widget.tableId));
    final detail = value.valueOrNull;
    final user = ref.watch(currentUserProvider);
    final order = detail?.order;
    final canUpdate = user?.canUpdateOrder ?? false;
    final canTakeOrder = user?.canTakeOrder ?? false;

    // Thu ngân thu tiền xong → bàn trống: thông báo rồi quay về sơ đồ bàn.
    if (_hadOrder && detail != null && order == null) {
      _hadOrder = false;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        _showPaidDialog(detail.table.code);
      });
    }
    if (order != null) _hadOrder = true;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(detail == null ? 'Bàn' : 'Bàn ${detail.table.code}'),
            if (detail?.table.area != null)
              Text(
                '${detail!.table.area} · ${detail.table.seats} ghế',
                style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w400),
              ),
          ],
        ),
        actions: [
          IconButton(tooltip: 'Tải lại', onPressed: _reload, icon: const Icon(Icons.refresh_rounded)),
          if (order != null && canUpdate)
            PopupMenuButton<String>(
              tooltip: 'Thêm',
              onSelected: (action) {
                if (action == 'move') _moveTable(detail!.table);
                if (action == 'cancel') _cancelOrder(order, detail!.table.code);
              },
              itemBuilder: (_) => const [
                PopupMenuItem(
                  value: 'move',
                  child: Row(
                    children: [
                      Icon(Icons.swap_horiz_rounded, color: AppColors.ocean700),
                      SizedBox(width: 10),
                      Text('Chuyển bàn'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'cancel',
                  child: Row(
                    children: [
                      Icon(Icons.cancel_outlined, color: AppColors.danger),
                      SizedBox(width: 10),
                      Text('Hủy cả đơn', style: TextStyle(color: AppColors.danger)),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
      body: AsyncView(
        value: value,
        onRetry: _reload,
        data: (d) => RefreshIndicator(
          color: AppColors.coral500,
          onRefresh: () async => _reload(),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              _PendingTicket(tableId: d.table.id),
              _SavedTicketBanner(tableId: d.table.id, onOpen: () => _startOrdering(d.table, toTicket: true)),
              if (d.order == null)
                Padding(
                  padding: const EdgeInsets.only(top: 48),
                  child: EmptyView(
                    icon: Icons.table_restaurant_outlined,
                    title: 'Bàn đang trống',
                    message: canTakeOrder
                        ? 'Tới bàn ghi món cùng khách rồi bấm "Gửi bếp".'
                        : 'Tài khoản của bạn chỉ xem, không ghi món được.',
                    actionLabel: canTakeOrder ? 'Ghi món' : null,
                    onAction: () => _startOrdering(d.table),
                  ),
                )
              else ...[
                if (d.order!.billRequested) _BillRequestedBanner(order: d.order!),
                _StatusCard(order: d.order!),
                if (d.order!.weighingCount > 0) ...[
                  const SizedBox(height: 12),
                  _WeighBanner(
                    count: d.order!.weighingCount,
                    canUpdate: canUpdate,
                    onWeigh: () => _weigh(d.order!, d.table.code),
                  ),
                ],
                const SizedBox(height: 12),
                _ItemsCard(order: d.order!),
              ],
            ],
          ),
        ),
      ),
      bottomNavigationBar: order == null
          ? null
          : _ActionBar(
              order: order,
              busy: _busy,
              canTakeOrder: canTakeOrder,
              canUpdate: canUpdate,
              onCheck: () => _checkItems(order, detail!.table.code),
              onCancelItem: () => _cancelItem(order, detail!.table.code),
              onOrderMore: () => _startOrdering(detail!.table),
              onRequestBill: () => _requestBill(order, detail!.table.code),
              onWithdrawBill: () => _withdrawBill(order),
            ),
    );
  }
}

/// Hộp hỏi lý do hủy cả đơn. Trả null nếu bấm "Không".
Future<String?> _askCancelReason(BuildContext context, String tableCode) =>
    showDialog<String>(context: context, builder: (_) => _CancelOrderDialog(tableCode: tableCode));

/// Ô nhập nằm trong State của hộp: chỉ hủy (dispose) khi hộp đã đóng hẳn.
/// (Hủy ngay lúc bấm nút sẽ lỗi "TextEditingController was used after being disposed"
/// vì hộp còn đang chạy hiệu ứng đóng.)
class _CancelOrderDialog extends StatefulWidget {
  const _CancelOrderDialog({required this.tableCode});
  final String tableCode;

  @override
  State<_CancelOrderDialog> createState() => _CancelOrderDialogState();
}

class _CancelOrderDialogState extends State<_CancelOrderDialog> {
  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Hủy cả đơn bàn ${widget.tableCode}?'),
      content: Form(
        key: _formKey,
        child: TextFormField(
          controller: _controller,
          autofocus: true,
          maxLength: 300,
          maxLengthEnforcement: MaxLengthEnforcement.none,
          maxLines: 2,
          decoration: const InputDecoration(labelText: 'Lý do hủy', hintText: 'vd Khách bỏ về, ghi nhầm bàn'),
          validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập lý do hủy' : null,
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Không')),
        TextButton(
          style: TextButton.styleFrom(foregroundColor: AppColors.danger),
          onPressed: () {
            if (_formKey.currentState!.validate()) Navigator.pop(context, _controller.text.trim());
          },
          child: const Text('Hủy cả đơn'),
        ),
      ],
    );
  }
}

// ---- Phần riêng của S04 ----

/// Phiếu gọi món của bàn này còn món chưa gửi: nhắc + nút mở S08.
class _PendingTicket extends ConsumerWidget {
  const _PendingTicket({required this.tableId});
  final int tableId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final table = ref.watch(ticketTableProvider);
    final count = ref.watch(cartCountProvider);
    if (table?.id != tableId || count == 0) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.fromLTRB(14, 6, 6, 6),
      decoration: BoxDecoration(
        color: AppColors.coral50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.coral500),
      ),
      child: Row(
        children: [
          const Icon(Icons.edit_note_rounded, color: AppColors.coral600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Phiếu chưa gửi bếp: $count món · ${formatMoney(ref.watch(cartSubtotalProvider))}',
              style: const TextStyle(color: AppColors.coral600, fontWeight: FontWeight.w700),
            ),
          ),
          TextButton(onPressed: () => context.go(AppRoutes.ticket(tableId)), child: const Text('Xem phiếu')),
        ],
      ),
    );
  }
}

/// Bàn có order đã cất (S08 "Cất order"): "Order đã cất: 3 món · lúc 19:05" + nút "Mở order" → S08.
class _SavedTicketBanner extends ConsumerWidget {
  const _SavedTicketBanner({required this.tableId, required this.onOpen});
  final int tableId;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final saved = ref.watch(savedTicketsProvider)[tableId];
    if (saved == null) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.fromLTRB(14, 6, 6, 6),
      decoration: BoxDecoration(
        color: AppColors.coral50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.coral500),
      ),
      child: Row(
        children: [
          const Icon(Icons.bookmark_rounded, color: AppColors.coral600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Order đã cất: ${saved.count} món · lúc ${formatTime(saved.savedAt)}',
              style: const TextStyle(color: AppColors.coral600, fontWeight: FontWeight.w700),
            ),
          ),
          TextButton(onPressed: onOpen, child: const Text('Mở order')),
        ],
      ),
    );
  }
}

/// Đã gửi thanh toán: "Đã gửi thanh toán lúc 20:15 · Thu ngân in bill và thu tiền".
/// Nút "Rút yêu cầu thanh toán" nằm ở thanh dưới (không lặp lại ở đây).
class _BillRequestedBanner extends StatelessWidget {
  const _BillRequestedBanner({required this.order});
  final Order order;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      decoration: BoxDecoration(color: AppColors.coral500, borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          const Icon(Icons.receipt_long_rounded, color: AppColors.white),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Đã gửi thanh toán lúc ${formatTime(order.billRequestedAt)}',
                  style: const TextStyle(color: AppColors.white, fontWeight: FontWeight.w700),
                ),
                Text(
                  'Thu ngân in bill và thu tiền',
                  style: TextStyle(color: AppColors.white.withValues(alpha: 0.85), fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Mã đơn, trạng thái, giờ mở bàn, người mở, "5 món · 2 món chưa ra bàn".
class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.order});
  final Order order;

  @override
  Widget build(BuildContext context) {
    final waiting = order.waitingCount;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(order.code, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900)),
                ),
                StatusBadge.order(order.status),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              [
                'Mở bàn lúc ${formatTime(order.createdAt)}',
                if (order.staffName != null) order.staffName!,
              ].join(' · '),
              style: const TextStyle(color: AppColors.slate500, fontSize: 13),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(
                  waiting > 0 ? Icons.hourglass_top_rounded : Icons.check_circle_rounded,
                  size: 18,
                  color: waiting > 0 ? AppColors.ocean500 : AppColors.success,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    waiting > 0
                        ? '${order.itemCount} món · $waiting món chưa ra bàn'
                        : '${order.itemCount} món · đã ra bàn đủ',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: waiting > 0 ? AppColors.ocean900 : AppColors.success,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Khung xanh "2 món chờ cân": món bán theo kg chưa có số kg thật -> bếp chưa thấy, chưa gửi thanh toán được.
/// Có quyền Sửa thì kèm nút "Nhập số kg" (→ S14); chỉ xem thì chỉ nhắc.
class _WeighBanner extends StatelessWidget {
  const _WeighBanner({required this.count, required this.canUpdate, required this.onWeigh});
  final int count;
  final bool canUpdate;
  final VoidCallback onWeigh;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cyan.background,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cyan.foreground.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.scale_rounded, size: 20, color: AppColors.cyan.foreground),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '$count món bán theo kg chờ cân',
                  style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.cyan.foreground),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            canUpdate
                ? 'Dẫn khách ra hồ chọn con, cân rồi nhập số kg thật. Bếp chỉ thấy món sau khi có số kg.'
                : 'Phục vụ cần cân tại hồ và nhập số kg thì món mới xuống bếp.',
            style: const TextStyle(color: AppColors.slate500, fontSize: 13),
          ),
          if (canUpdate) ...[
            const SizedBox(height: 10),
            FilledButton.icon(
              onPressed: onWeigh,
              icon: const Icon(Icons.scale_rounded, size: 20),
              label: const Text('Nhập số kg'),
            ),
          ],
        ],
      ),
    );
  }
}

/// Món đã gọi, gom theo từng lần gửi bếp + tạm tính.
class _ItemsCard extends StatelessWidget {
  const _ItemsCard({required this.order});
  final Order order;

  @override
  Widget build(BuildContext context) {
    final rounds = order.rounds;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Món đã gọi (${order.itemCount} món)', style: AppText.sectionTitle()),
            for (var r = 0; r < rounds.length; r++) ...[
              const SizedBox(height: 12),
              Text(
                rounds.length == 1
                    ? 'Gửi bếp lúc ${formatTime(rounds[r].first.createdAt)}'
                    : 'Lần ${r + 1} · ${formatTime(rounds[r].first.createdAt)}',
                style: const TextStyle(color: AppColors.ocean500, fontSize: 12, fontWeight: FontWeight.w700),
              ),
              for (final item in rounds[r]) OrderItemRow(item: item),
            ],
            if (order.note != null && order.note!.trim().isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('Ghi chú: ${order.note}', style: const TextStyle(color: AppColors.ocean700, fontSize: 13)),
            ],
            const Divider(height: 28),
            Row(
              children: [
                const Expanded(child: Text('Tạm tính', style: TextStyle(fontSize: 15, color: AppColors.slate800))),
                Text(
                  formatMoney(order.total),
                  style: const TextStyle(color: AppColors.coral600, fontSize: 22, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// 1 món: "2×  Tôm sú hấp bia            500.000đ" + ghi chú + nhãn trạng thái. Món hủy: gạch ngang + lý do.
/// Dùng ở S04 và các sheet S09, S12, S13.
class OrderItemRow extends StatelessWidget {
  const OrderItemRow({super.key, required this.item, this.showStatus = true, this.trailing});
  final OrderItem item;
  final bool showStatus;
  final Widget? trailing; // thay cho tiền (vd ô tick ở S12)

  static const _statusColors = {
    OrderItemStatus.weighing: AppColors.cyan,
    OrderItemStatus.pending: AppColors.amber,
    OrderItemStatus.cooking: AppColors.indigo,
    OrderItemStatus.ready: AppColors.violet,
    OrderItemStatus.served: AppColors.green,
    OrderItemStatus.cancelled: AppColors.red,
  };

  @override
  Widget build(BuildContext context) {
    final cancelled = item.isCancelled;
    final strike = cancelled ? TextDecoration.lineThrough : null;
    final color = _statusColors[item.status]!;
    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 34,
            child: Text(
              '${item.quantity}×',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                color: cancelled ? AppColors.slate500 : AppColors.ocean900,
                decoration: strike,
              ),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: cancelled ? AppColors.slate500 : AppColors.slate800,
                    decoration: strike,
                  ),
                ),
                if (item.isByWeight)
                  Text(
                    // Chờ cân: số kg phục vụ ghi tạm (tiền tạm). Cân xong: số kg thật cân tại hồ.
                    item.weight == null
                        ? '${formatMoney(item.price)}/kg · chờ cân tại hồ'
                        : item.isWeighing
                            ? 'Ghi tạm ${formatKg(item.weight!)} × ${formatMoney(item.price)}/kg · chờ cân tại hồ'
                            : 'Đã cân ${formatKg(item.weight!)} × ${formatMoney(item.price)}/kg',
                    style: TextStyle(color: AppColors.cyan.foreground, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                if (item.note != null && item.note!.trim().isNotEmpty)
                  Text('Ghi chú: ${item.note}', style: const TextStyle(color: AppColors.ocean700, fontSize: 13)),
                if (cancelled && item.cancelReason != null && item.cancelReason!.trim().isNotEmpty)
                  Text('Lý do hủy: ${item.cancelReason}', style: const TextStyle(color: AppColors.danger, fontSize: 13)),
                if (showStatus) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: color.background, borderRadius: BorderRadius.circular(999)),
                    child: Text(
                      item.status.label,
                      style: TextStyle(color: color.foreground, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          trailing ??
              Text(
                // Chờ cân mà chưa có số kg (đơn gửi từ bản app cũ): chưa có tiền
                item.isWeighing && item.weight == null ? 'Chờ cân' : formatMoney(item.lineTotal),
                style: TextStyle(color: cancelled ? AppColors.slate500 : AppColors.slate800, decoration: strike),
              ),
        ],
      ),
    );
  }
}

/// Dưới cùng: 3 nút "Check món" · "Hủy món" · "Order" + "Gửi thanh toán" (hoặc "Rút yêu cầu thanh toán").
class _ActionBar extends StatelessWidget {
  const _ActionBar({
    required this.order,
    required this.busy,
    required this.canTakeOrder,
    required this.canUpdate,
    required this.onCheck,
    required this.onCancelItem,
    required this.onOrderMore,
    required this.onRequestBill,
    required this.onWithdrawBill,
  });

  final Order order;
  final bool busy;
  final bool canTakeOrder;
  final bool canUpdate;
  final VoidCallback onCheck;
  final VoidCallback onCancelItem;
  final VoidCallback onOrderMore;
  final VoidCallback onRequestBill;
  final VoidCallback onWithdrawBill;

  @override
  Widget build(BuildContext context) {
    if (!canTakeOrder && !canUpdate) return const SizedBox.shrink();
    final buttons = <Widget>[
      if (canUpdate) _ActionButton(icon: Icons.checklist_rounded, label: 'Check món', onPressed: busy ? null : onCheck),
      if (canUpdate)
        _ActionButton(icon: Icons.remove_circle_outline_rounded, label: 'Hủy món', onPressed: busy ? null : onCancelItem),
      if (canTakeOrder)
        _ActionButton(icon: Icons.add_circle_outline_rounded, label: 'Order', onPressed: busy ? null : onOrderMore),
    ];
    return BottomPanel(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              for (var i = 0; i < buttons.length; i++) ...[
                if (i > 0) const SizedBox(width: 8),
                Expanded(child: buttons[i]),
              ],
            ],
          ),
          if (canUpdate) ...[
            const SizedBox(height: 10),
            if (order.billRequested)
              OutlinedButton.icon(
                onPressed: busy ? null : onWithdrawBill,
                icon: const Icon(Icons.undo_rounded, size: 20),
                label: const Text('Rút yêu cầu thanh toán'),
              )
            else
              FilledButton.icon(
                onPressed: busy ? null : onRequestBill,
                icon: const Icon(Icons.receipt_long_rounded, size: 20),
                label: FittedBox(fit: BoxFit.scaleDown, child: Text('Gửi thanh toán · ${formatMoney(order.total)}')),
              ),
          ],
        ],
      ),
    );
  }
}

/// Nút vuông nhỏ: icon trên, chữ dưới (3 nút chia đều chiều ngang, máy hẹp vẫn vừa).
class _ActionButton extends StatelessWidget {
  const _ActionButton({required this.icon, required this.label, required this.onPressed});
  final IconData icon;
  final String label;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(0, 60),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 22),
          const SizedBox(height: 4),
          FittedBox(fit: BoxFit.scaleDown, child: Text(label, maxLines: 1)),
        ],
      ),
    );
  }
}
