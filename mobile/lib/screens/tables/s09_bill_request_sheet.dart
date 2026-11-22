// S09. Bottom sheet "Gửi thanh toán": docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: POST /dine-in/orders/:id/bill-request
//
// Khách ăn xong, phục vụ xem lại bill (món còn tính tiền + tổng) rồi gửi. Thu ngân trên web
// (/admin/cashier) nhận thông báo, in bill và bấm "Đã thu tiền". Phục vụ KHÔNG tự thu tiền trên app.
// Còn món chưa ra bàn thì nhắc (vẫn cho gửi: khách có thể không chờ món đó nữa, hủy sau cũng được).
//
// Mở từ S04: final sent = await showBillRequestSheet(context, order: order, tableCode: 'B05');

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/order.dart';
import '../../services/api_exception.dart';
import '../../services/dine_in_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import 's04_table_order_screen.dart' show OrderItemRow;

Future<bool> showBillRequestSheet(BuildContext context, {required Order order, required String tableCode}) async {
  final sent = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.7,
      maxChildSize: 0.92,
      builder: (context, scroll) => _BillRequestSheet(order: order, tableCode: tableCode, scroll: scroll),
    ),
  );
  return sent ?? false;
}

class _BillRequestSheet extends ConsumerStatefulWidget {
  const _BillRequestSheet({required this.order, required this.tableCode, required this.scroll});
  final Order order;
  final String tableCode;
  final ScrollController scroll;

  @override
  ConsumerState<_BillRequestSheet> createState() => _BillRequestSheetState();
}

class _BillRequestSheetState extends ConsumerState<_BillRequestSheet> {
  bool _sending = false;
  String? _error; // lỗi backend, hiện ngay trong sheet (snackbar bị sheet che)

  Future<void> _send() async {
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await ref.read(dineInServiceProvider).requestBill(widget.order.id);
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;
    final waiting = order.waitingCount;
    final weighing = order.weighingCount; // món theo kg chưa cân: chưa có tiền, chưa gửi được
    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: widget.scroll,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            children: [
              Text('Gửi thanh toán bàn ${widget.tableCode}', style: AppText.sectionTitle()),
              const SizedBox(height: 4),
              const Text(
                'Thu ngân sẽ nhận thông báo, in bill và thu tiền.',
                style: TextStyle(color: AppColors.slate500, fontSize: 13),
              ),
              if (weighing > 0) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.cyan.background, borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    children: [
                      Icon(Icons.scale_rounded, color: AppColors.cyan.foreground),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Còn $weighing món bán theo kg chưa cân. Nhờ hồ hải sản cân xong mới gửi thanh toán được.',
                          style: TextStyle(color: AppColors.cyan.foreground, fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              if (waiting > 0) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.amber.background, borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, color: AppColors.amber.foreground),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Còn $waiting món chưa ra bàn. Khách không chờ nữa thì hủy món đó trước khi gửi.',
                          style: TextStyle(color: AppColors.amber.foreground, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 4),
              for (final item in order.liveItems) OrderItemRow(item: item, showStatus: false),
              const Divider(height: 28),
              Row(
                children: [
                  const Expanded(
                    child: Text('Tổng cộng', style: TextStyle(fontSize: 16, color: AppColors.slate800)),
                  ),
                  Text(
                    formatMoney(order.total),
                    style: const TextStyle(color: AppColors.coral600, fontSize: 24, fontWeight: FontWeight.w800),
                  ),
                ],
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
                  onPressed: _sending || widget.order.weighingCount > 0 ? null : _send,
                  icon: _sending
                      ? const SizedBox.square(
                          dimension: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white),
                        )
                      : const Icon(Icons.send_rounded),
                  label: const Text('Gửi thanh toán'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
