// S13. Bottom sheet "Hủy món": docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: POST /dine-in/items/:id/cancel { quantity?, reason? }
//
// Chọn 1 món còn tính tiền → (món nhiều phần) chọn hủy bao nhiêu phần → lý do → "Hủy món".
// Quy tắc (backend kiểm lại): món "Chờ bếp" hủy luôn, lý do không bắt buộc;
// món "Bếp đang làm" / "Đã ra bàn" BẮT BUỘC ghi lý do. Hủy hết món thì bàn trống lại.
//
// Mở từ S04: final cancelled = await showCancelItemSheet(context, order: order, tableCode: 'B05');
// Trả về (name, quantity) của phần vừa hủy, null nếu đóng sheet.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/order.dart';
import '../../models/status.dart';
import '../../services/api_exception.dart';
import '../../services/dine_in_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../widgets/quantity_stepper.dart';
import 's04_table_order_screen.dart' show OrderItemRow;

typedef CancelledItem = ({String name, int quantity});

/// Lý do hay gặp, bấm để điền nhanh.
const cancelReasons = ['Khách đổi món', 'Khách không chờ được', 'Ghi nhầm món', 'Món hết nguyên liệu'];

Future<CancelledItem?> showCancelItemSheet(BuildContext context, {required Order order, required String tableCode}) {
  return showModalBottomSheet<CancelledItem>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.8,
      maxChildSize: 0.95,
      builder: (context, scroll) => _CancelItemSheet(order: order, tableCode: tableCode, scroll: scroll),
    ),
  );
}

class _CancelItemSheet extends ConsumerStatefulWidget {
  const _CancelItemSheet({required this.order, required this.tableCode, required this.scroll});
  final Order order;
  final String tableCode;
  final ScrollController scroll;

  @override
  ConsumerState<_CancelItemSheet> createState() => _CancelItemSheetState();
}

class _CancelItemSheetState extends ConsumerState<_CancelItemSheet> {
  late final List<OrderItem> _items = widget.order.liveItems;
  final _reason = TextEditingController();
  OrderItem? _selected;
  int _quantity = 1;
  bool _sending = false;
  String? _error;

  /// Bếp đã làm / đã ra bàn thì phải có lý do (chờ cân, chờ bếp thì không cần).
  bool get _needReason =>
      _selected != null && !{OrderItemStatus.weighing, OrderItemStatus.pending}.contains(_selected!.status);
  bool get _canSubmit => _selected != null && (!_needReason || _reason.text.trim().isNotEmpty);

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  void _select(OrderItem item) => setState(() {
    _selected = item;
    _quantity = item.quantity; // mặc định hủy cả dòng
    _error = null;
  });

  Future<void> _submit() async {
    final item = _selected!;
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await ref
          .read(dineInServiceProvider)
          .cancelItem(item.id, quantity: _quantity < item.quantity ? _quantity : null, reason: _reason.text);
      if (mounted) Navigator.pop<CancelledItem>(context, (name: item.name, quantity: _quantity));
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final selected = _selected;
    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: widget.scroll,
            padding: const EdgeInsets.fromLTRB(20, 0, 12, 12),
            children: [
              Text('Hủy món bàn ${widget.tableCode}', style: AppText.sectionTitle()),
              const SizedBox(height: 4),
              const Text(
                'Bếp chưa làm thì hủy luôn. Bếp đã làm hoặc đã ra bàn phải ghi lý do.',
                style: TextStyle(color: AppColors.slate500, fontSize: 13),
              ),
              for (final item in _items)
                InkWell(
                  onTap: _sending ? null : () => _select(item),
                  child: OrderItemRow(
                    item: item,
                    trailing: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Icon(
                        selected?.id == item.id ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                        color: selected?.id == item.id ? AppColors.danger : AppColors.slate300,
                      ),
                    ),
                  ),
                ),
              if (selected != null) ...[
                const Divider(height: 28),
                // Món theo kg cân chung cả dòng: chỉ hủy cả dòng
                if (selected.quantity > 1 && !selected.isByWeight) ...[
                  Row(
                    children: [
                      const Expanded(
                        child: Text('Hủy bao nhiêu phần', style: TextStyle(fontWeight: FontWeight.w600)),
                      ),
                      QuantityStepper(
                        value: _quantity,
                        min: 1,
                        max: selected.quantity,
                        small: true,
                        onChanged: (v) => setState(() => _quantity = v),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                ],
                TextField(
                  controller: _reason,
                  maxLength: 200,
                  decoration: InputDecoration(
                    labelText: _needReason ? 'Lý do hủy (bắt buộc)' : 'Lý do hủy (không bắt buộc)',
                    helperText: !_needReason
                        ? null
                        : (selected.status == OrderItemStatus.cooking
                              ? 'Bếp đã làm món này nên phải ghi lý do'
                              : 'Món đã mang ra bàn nên phải ghi lý do'),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final r in cancelReasons)
                      ActionChip(label: Text(r), onPressed: () => setState(() => _reason.text = r)),
                  ],
                ),
              ],
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Lỗi backend đặt ngay trên nút (luôn thấy, không bị khuất dưới danh sách; snackbar thì bị sheet che)
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600),
                    ),
                  ),
                FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
                  onPressed: _sending || !_canSubmit ? null : _submit,
                  icon: _sending
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white),
                        )
                      : const Icon(Icons.remove_circle_outline_rounded),
                  label: Text(
                    selected == null ? 'Chọn món cần hủy' : 'Hủy $_quantity × ${selected.name}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
