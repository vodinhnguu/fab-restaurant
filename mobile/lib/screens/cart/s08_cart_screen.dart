// S08. Phiếu gọi món (giỏ của nhân viên): docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: POST /dine-in/orders { tableId, items[] } ("Gửi bếp")
// Thiết kế: design/S08.png (màn Giỏ hàng cũ của app khách)
//
// Từ trên xuống:
//   thanh trên: ←, "Phiếu gọi món" + "Bàn B05"
//   từng món: parts/cart_item_tile.dart (bấm ảnh / dòng ghi chú → S07, bấm tên → S06)
//   dưới cùng cố định (giống app CukCuk): "Tạm tính (3 món)" + 3 nút
//     "Hủy order" (hỏi lại, xóa phiếu chưa gửi) → S04 của bàn
//     "Cất order" (lưu phiếu, chưa gửi bếp; savedTicketsProvider ở state/cart_state.dart) → S03 Sơ đồ bàn
//     "Gửi bếp" (hỏi lại) → S04 của bàn
// Phiếu trống: "Phiếu trống" + "Chọn món" → S05.
// Phiếu đang ghi cho bàn khác (ticketTableProvider khác bàn này): báo và không cho gửi.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../app/routes.dart';
import '../../models/cart_item.dart';
import '../../services/api_exception.dart';
import '../../services/dine_in_service.dart';
import '../../state/cart_state.dart';
import '../../theme/app_colors.dart';
import '../../utils/format.dart';
import '../../widgets/app_snackbar.dart';
import '../../widgets/bottom_panel.dart';
import '../../widgets/confirm_dialog.dart';
import '../../widgets/state_views.dart';
import 'parts/cart_item_tile.dart';
import 's07_note_sheet.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key, required this.tableId});

  final int tableId;

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  bool _sending = false;

  /// Xóa 1 món + snackbar "Hoàn tác" (đặt món về đúng chỗ cũ).
  void _remove(CartItem item) {
    // Lấy "kho" Riverpod trước: bấm "Hoàn tác" lúc màn đã đóng vẫn chạy được.
    final container = ProviderScope.containerOf(context, listen: false);
    final removed = ref.read(cartProvider.notifier).remove(item.dishId);
    if (removed == null) return;
    showAppSnack(
      'Đã xóa "${item.name}"',
      action: 'Hoàn tác',
      onAction: () => container.read(cartProvider.notifier).restore(removed),
    );
  }

  void _setQuantity(CartItem item, int quantity) {
    if (quantity <= 0) {
      _remove(item);
    } else {
      ref.read(cartProvider.notifier).setQuantity(item.dishId, quantity);
    }
  }

  /// "Hủy order": hỏi lại, xóa phiếu chưa gửi (cả order đã cất của bàn, nếu có), về S04.
  /// Món đã gửi bếp trước đó không bị ảnh hưởng (hủy món đã gửi ở S04 "Hủy món").
  Future<void> _cancelOrder(String tableCode) async {
    final count = ref.read(cartCountProvider);
    final ok = await showConfirmDialog(
      context,
      title: 'Hủy order?',
      message: 'Xóa $count món chưa gửi bếp của bàn $tableCode? Món đã gửi bếp trước đó vẫn giữ nguyên.',
      confirmLabel: 'Hủy order',
      cancelLabel: 'Giữ lại',
      danger: true,
    );
    if (!ok || !mounted) return;
    ref.read(cartProvider.notifier).clear();
    ref.read(ticketTableProvider.notifier).set(null);
    ref.read(savedTicketsProvider.notifier).remove(widget.tableId);
    showAppSnack('Đã hủy order bàn $tableCode');
    context.go(AppRoutes.table(widget.tableId));
  }

  /// "Cất order": lưu phiếu lại (chưa gửi bếp) rồi về sơ đồ bàn để phục vụ bàn khác.
  void _stashOrder() {
    final saved = ref.read(savedTicketsProvider.notifier).stashCurrent();
    if (saved == null) return;
    showAppSnack('Đã cất order bàn ${saved.table.code} (${saved.count} món). Mở lại bàn để gửi bếp');
    context.go(AppRoutes.tables);
  }

  /// "Gửi bếp": hỏi lại, gửi, xóa phiếu, về S04.
  Future<void> _send(String tableCode) async {
    final items = ref.read(cartProvider);
    final count = ref.read(cartCountProvider);
    final ok = await showConfirmDialog(
      context,
      title: 'Gửi bếp?',
      message: 'Gửi $count món cho bàn $tableCode xuống bếp?',
      confirmLabel: 'Gửi bếp',
      cancelLabel: 'Xem lại',
    );
    if (!ok || !mounted) return;

    setState(() => _sending = true);
    try {
      await ref.read(dineInServiceProvider).sendToKitchen(tableId: widget.tableId, items: items);
      ref.read(cartProvider.notifier).clear();
      ref.invalidate(tableDetailProvider(widget.tableId));
      ref.invalidate(floorProvider);
      ref.invalidate(todayOrdersProvider);
      showAppSnack('Đã gửi bếp $count món cho bàn $tableCode');
      if (mounted) context.go(AppRoutes.table(widget.tableId));
    } on ApiException catch (e) {
      // vd "Món "X" hiện đã hết": phiếu giữ nguyên để nhân viên bỏ món đó rồi gửi lại
      showAppSnack(e.message, error: true);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(cartProvider);
    final table = ref.watch(ticketTableProvider);
    final otherTable = items.isNotEmpty && table != null && table.id != widget.tableId;
    final tableCode = table?.id == widget.tableId ? table!.code : '';

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Phiếu gọi món',
              style: GoogleFonts.playfairDisplay(fontSize: 21, fontWeight: FontWeight.w700, color: AppColors.ocean950),
            ),
            if (tableCode.isNotEmpty)
              Text(
                'Bàn $tableCode',
                style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w400),
              ),
          ],
        ),
        actions: const [SizedBox(width: 4)],
      ),
      body: otherTable
          ? EmptyView(
              icon: Icons.swap_horiz_rounded,
              title: 'Phiếu đang ghi cho bàn ${table.code}',
              message: 'Mở bàn ${table.code} để gửi bếp, hoặc xóa phiếu đó trước khi ghi món cho bàn này.',
              actionLabel: 'Mở phiếu bàn ${table.code}',
              onAction: () => context.go(AppRoutes.ticket(table.id)),
            )
          : items.isEmpty
              ? EmptyView(
                  icon: Icons.edit_note_rounded,
                  title: 'Phiếu trống',
                  message: 'Chọn món cùng khách, món sẽ hiện ở đây trước khi gửi bếp.',
                  actionLabel: 'Chọn món',
                  onAction: () => context.go(AppRoutes.menu(widget.tableId)),
                )
              : ListView(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                  children: [
                    for (final item in items)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: CartItemTile(
                          key: ValueKey(item.dishId),
                          item: item,
                          onQuantityChanged: (q) => _setQuantity(item, q),
                          onWeightChanged: (kg) => ref.read(cartProvider.notifier).setWeight(item.dishId, kg),
                          onRemove: () => _remove(item),
                          onEditNote: () => showNoteSheet(context, item),
                          onOpenDish: () => context.push(AppRoutes.dish(widget.tableId, item.slug)),
                        ),
                      ),
                    const SizedBox(height: 12),
                    TextButton.icon(
                      onPressed: () => context.go(AppRoutes.menu(widget.tableId)),
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('Chọn thêm món'),
                    ),
                  ],
                ),
      bottomNavigationBar: items.isEmpty || otherTable
          ? null
          : _SendBar(
              sending: _sending,
              onCancel: () => _cancelOrder(tableCode),
              onStash: _stashOrder,
              onSend: () => _send(tableCode),
            ),
    );
  }
}

/// Dưới cùng cố định: "Tạm tính (3 món)  850.000đ" + 3 nút "Hủy order" · "Cất order" · "Gửi bếp".
class _SendBar extends ConsumerWidget {
  const _SendBar({required this.sending, required this.onCancel, required this.onStash, required this.onSend});

  final bool sending;
  final VoidCallback onCancel;
  final VoidCallback onStash;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartCountProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    final hasWeighed = ref.watch(cartProvider).any((i) => i.soldByWeight);
    return BottomPanel(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  // Món theo kg tính theo số kg đang ghi tạm, cân tại hồ xong tiền có thể đổi
                  hasWeighed ? 'Tạm tính ($count món, món kg tính tạm)' : 'Tạm tính ($count món)',
                  style: const TextStyle(color: AppColors.slate800, fontSize: 15),
                ),
              ),
              Text(
                formatMoney(subtotal),
                style: const TextStyle(color: AppColors.coral600, fontSize: 22, fontWeight: FontWeight.w800),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: sending ? null : onCancel,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.danger,
                    side: const BorderSide(color: AppColors.danger),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                  ),
                  child: const FittedBox(child: Text('Hủy order')),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: sending ? null : onStash,
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 4)),
                  child: const FittedBox(child: Text('Cất order')),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton(
                  onPressed: sending ? null : onSend,
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 4)),
                  child: sending
                      ? const SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white))
                      : const FittedBox(child: Text('Gửi bếp')),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
