// S14. Bottom sheet "Nhập số kg": docs/23-app-nhan-vien-phuc-vu.md mục 2, docs/24-thuc-don-ban-theo-kg.md
// API: POST /dine-in/items/:id/weigh { weight } (gọi lần lượt cho từng món đổi số kg)
//
// Phục vụ dẫn khách ra hồ, khách chỉ con, cân trên cân điện tử rồi nhập số kg thật ngay tại hồ.
// Nhập xong món chuyển từ "Chờ cân" sang "Chờ bếp" (bếp mới thấy) và tiền tính theo số kg thật.
// Mỗi món 1 bộ [ − ] 1 kg [ + ] (bấm vào số để gõ, vd 0,98) + tiền xem trước = giá 1 kg × số kg.
// Món bếp đã nhận làm thì backend không cho sửa nữa -> chỉ hiện món đang "Chờ cân".
//
// Mở từ S04: final changed = await showWeighSheet(context, order: order, tableCode: 'B05');

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/order.dart';
import '../../services/api_exception.dart';
import '../../services/dine_in_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/quantity_stepper.dart';

/// Trả true nếu đã nhập số kg cho ít nhất 1 món (S04 tải lại bàn).
Future<bool> showWeighSheet(BuildContext context, {required Order order, required String tableCode}) async {
  final changed = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.7,
      maxChildSize: 0.92,
      builder: (context, scroll) => _WeighSheet(order: order, tableCode: tableCode, scroll: scroll),
    ),
  );
  return changed ?? false;
}

class _WeighSheet extends ConsumerStatefulWidget {
  const _WeighSheet({required this.order, required this.tableCode, required this.scroll});
  final Order order;
  final String tableCode;
  final ScrollController scroll;

  @override
  ConsumerState<_WeighSheet> createState() => _WeighSheetState();
}

class _WeighSheetState extends ConsumerState<_WeighSheet> {
  /// Món còn "Chờ cân" của bàn (món đã cân, đã xuống bếp không sửa ở đây).
  late final List<OrderItem> _items = widget.order.liveItems.where((i) => i.isWeighing).toList();

  /// Số kg đang nhập cho từng món. Mặc định = số kg phục vụ ghi lúc gửi bếp (thường 1 kg).
  late final Map<int, double> _kg = {for (final i in _items) i.id: i.weight ?? 1};

  bool _saving = false;
  String? _error;

  /// Món đã nhập xong (gọi API thành công) — giữ lại để không gọi lại khi bấm "Lưu" lần nữa sau lỗi.
  final Set<int> _done = {};

  List<OrderItem> get _todo => _items.where((i) => !_done.contains(i.id)).toList();

  /// Tổng tiền các món trong sheet theo số kg đang nhập (để phục vụ đọc cho khách nghe).
  int get _preview => _items.fold(0, (sum, i) => sum + (i.price * (_kg[i.id] ?? 0)).round());

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    final service = ref.read(dineInServiceProvider);
    try {
      // Gọi lần lượt: lỗi ở món nào thì các món trước đó đã lưu vẫn giữ (đánh dấu _done).
      for (final item in _todo) {
        await service.weighItem(item.id, _kg[item.id]!);
        _done.add(item.id);
      }
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: widget.scroll,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            children: [
              Text('Nhập số kg bàn ${widget.tableCode}', style: AppText.sectionTitle()),
              const Text(
                'Cân tại hồ cùng khách rồi nhập số kg thật. Nhập xong món mới xuống bếp và tính tiền theo số kg này.',
                style: TextStyle(color: AppColors.slate500, fontSize: 13),
              ),
              if (_items.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 24),
                  child: Text('Bàn không còn món nào chờ cân.', style: TextStyle(color: AppColors.slate500)),
                ),
              for (final item in _items) _WeighRow(
                item: item,
                kg: _kg[item.id]!,
                saved: _done.contains(item.id),
                onChanged: _saving ? null : (kg) => setState(() => _kg[item.id] = kg),
              ),
              if (_items.length > 1) ...[
                const Divider(height: 28),
                Row(
                  children: [
                    const Expanded(child: Text('Tiền hải sản tạm tính', style: TextStyle(fontWeight: FontWeight.w600))),
                    Text(
                      formatMoney(_preview),
                      style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.ocean900),
                    ),
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
                // Lỗi backend đặt ngay trên nút (snackbar bị sheet che)
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600),
                    ),
                  ),
                FilledButton.icon(
                  onPressed: _saving || _todo.isEmpty ? null : _save,
                  icon: _saving
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white),
                        )
                      : const Icon(Icons.scale_rounded),
                  label: Text(_todo.isEmpty ? 'Đã nhập xong' : 'Lưu số kg (${_todo.length} món)'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// 1 món chờ cân: tên + giá 1 kg, bộ chọn số kg, tiền xem trước.
class _WeighRow extends StatelessWidget {
  const _WeighRow({required this.item, required this.kg, required this.saved, required this.onChanged});
  final OrderItem item;
  final double kg;
  final bool saved;
  final ValueChanged<double>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.slate800)),
              ),
              if (saved)
                const Icon(Icons.check_circle_rounded, size: 20, color: AppColors.success)
              else
                Text(
                  formatMoney((item.price * kg).round()),
                  style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.ocean900),
                ),
            ],
          ),
          Text('${formatMoney(item.price)} / kg', style: const TextStyle(color: AppColors.slate500, fontSize: 13)),
          if (item.note != null && item.note!.trim().isNotEmpty)
            Text('Ghi chú: ${item.note}', style: const TextStyle(color: AppColors.ocean700, fontSize: 13)),
          const SizedBox(height: 8),
          if (saved)
            Text('Đã nhập ${formatKg(kg)}', style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w600))
          else
            WeightStepper(value: kg, onChanged: onChanged ?? (_) {}),
        ],
      ),
    );
  }
}
