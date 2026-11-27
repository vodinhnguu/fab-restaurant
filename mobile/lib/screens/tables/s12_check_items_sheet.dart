// S12. Bottom sheet "Check món": docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: POST /dine-in/items/serve { itemIds, served: true } (tick) và { served: false } (bỏ tick khi bấm nhầm)
//
// Danh sách món còn tính tiền của bàn, mỗi món 1 ô tick = "đã mang ra bàn". Món đã ra bàn tick sẵn.
// Tick / bỏ tick tùy ý, bấm "Lưu" mới gửi (tối đa 2 lần gọi API: món mới tick, món bỏ tick).
// "Chọn hết": tick mọi món (khi bưng ra cùng lúc).
//
// Mở từ S04: final changed = await showCheckItemsSheet(context, order: order, tableCode: 'B05');

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/order.dart';
import '../../services/api_exception.dart';
import '../../services/dine_in_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import 's04_table_order_screen.dart' show OrderItemRow;

Future<bool> showCheckItemsSheet(BuildContext context, {required Order order, required String tableCode}) async {
  final changed = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.7,
      maxChildSize: 0.92,
      builder: (context, scroll) => _CheckItemsSheet(order: order, tableCode: tableCode, scroll: scroll),
    ),
  );
  return changed ?? false;
}

class _CheckItemsSheet extends ConsumerStatefulWidget {
  const _CheckItemsSheet({required this.order, required this.tableCode, required this.scroll});
  final Order order;
  final String tableCode;
  final ScrollController scroll;

  @override
  ConsumerState<_CheckItemsSheet> createState() => _CheckItemsSheetState();
}

class _CheckItemsSheetState extends ConsumerState<_CheckItemsSheet> {
  // Món theo kg còn chờ cân thì chưa nấu, chưa check được
  late final List<OrderItem> _items = widget.order.liveItems.where((i) => !i.isWeighing).toList();
  late final Set<int> _servedBefore = {
    for (final i in _items)
      if (i.isServed) i.id,
  };
  // Chỉ món bếp đã xong (READY) hoặc đã ra bàn (SERVED) mới tick/bỏ tick được
  bool _canCheck(OrderItem item) => item.isReady || item.isServed;
  late final Set<int> _checked = {..._servedBefore};
  bool _saving = false;
  String? _error;

  Set<int> get _toServe => _checked.difference(_servedBefore);
  Set<int> get _toUnserve => _servedBefore.difference(_checked);
  int get _changes => _toServe.length + _toUnserve.length;

  void _toggle(int id, bool on) => setState(() => on ? _checked.add(id) : _checked.remove(id));

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    final service = ref.read(dineInServiceProvider);
    try {
      if (_toServe.isNotEmpty) await service.serveItems(_toServe.toList());
      if (_toUnserve.isNotEmpty) await service.serveItems(_toUnserve.toList(), served: false);
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final allChecked = _checked.length == _items.length;
    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: widget.scroll,
            padding: const EdgeInsets.fromLTRB(20, 0, 12, 12),
            children: [
              Row(
                children: [
                  Expanded(child: Text('Check món bàn ${widget.tableCode}', style: AppText.sectionTitle())),
                  TextButton(
                    onPressed: allChecked || _saving
                        ? null
                        : () => setState(() => _checked.addAll(_items.where(_canCheck).map((i) => i.id))),
                    child: const Text('Chọn hết'),
                  ),
                ],
              ),
              const Text(
                'Tick món bếp đã xong khi mang ra bàn. Bỏ tick nếu lỡ bấm nhầm.',
                style: TextStyle(color: AppColors.slate500, fontSize: 13),
              ),
              if (_items.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 24),
                  child: Text('Bàn chưa có món nào.', style: TextStyle(color: AppColors.slate500)),
                ),
              for (final item in _items)
                InkWell(
                  onTap: _saving || !_canCheck(item) ? null : () => _toggle(item.id, !_checked.contains(item.id)),
                  child: Opacity(
                    opacity: _canCheck(item) ? 1.0 : 0.5,
                    child: OrderItemRow(
                      item: item,
                      trailing: _canCheck(item)
                          ? Checkbox(
                              value: _checked.contains(item.id),
                              onChanged: _saving ? null : (v) => _toggle(item.id, v ?? false),
                            )
                          : Padding(
                              padding: const EdgeInsets.all(8),
                              child: Text(
                                item.status.label,
                                style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                              ),
                            ),
                    ),
                  ),
                ),
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
                  onPressed: _saving || _changes == 0 ? null : _save,
                  icon: _saving
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white),
                        )
                      : const Icon(Icons.check_rounded),
                  label: Text(_changes == 0 ? 'Chưa đổi gì' : 'Lưu ($_changes món)'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
