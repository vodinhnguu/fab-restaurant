// S16. Quản lý · Đơn đã hủy: docs/28-app-quan-ly.md
// API: GET /stats/cancellations?range=today|7d|month
//
// Mở từ thẻ "Đơn đã hủy" ở S15 (có nút quay lại).
//
//   chip chọn khoảng: Hôm nay · 7 ngày · Tháng này
//   khung tóm tắt: N đơn đã hủy · tổng tiền
//   phần 1 "Hủy cả đơn": mã đơn, loại (Tại quán / Online), bàn, nhân viên mở bàn, tiền, LÝ DO
//                        (lý do trống = khách tự hủy trên web)
//   phần 2 "Món hủy lẻ": đơn vẫn còn, chỉ bỏ vài món - hay là hàng đã mất thật (bếp làm rồi mới hủy)

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/manager_stats.dart';
import '../../services/manager_service.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/state_views.dart';

const _ranges = {'today': 'Hôm nay', '7d': '7 ngày', 'month': 'Tháng này'};

class CancelledScreen extends ConsumerStatefulWidget {
  const CancelledScreen({super.key});

  @override
  ConsumerState<CancelledScreen> createState() => _CancelledScreenState();
}

class _CancelledScreenState extends ConsumerState<CancelledScreen> {
  String _range = 'today';

  @override
  Widget build(BuildContext context) {
    final value = ref.watch(cancellationsProvider(_range));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đơn đã hủy'),
        actions: [
          IconButton(
            tooltip: 'Tải lại',
            onPressed: () => ref.invalidate(cancellationsProvider(_range)),
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            // Wrap (không phải Row): máy hẹp thì chip tự xuống dòng, không bị tràn
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final e in _ranges.entries)
                  ChoiceChip(
                    label: Text(e.value),
                    selected: _range == e.key,
                    onSelected: (_) => setState(() => _range = e.key),
                  ),
              ],
            ),
          ),
          Expanded(
            child: AsyncView(
              value: value,
              onRetry: () => ref.invalidate(cancellationsProvider(_range)),
              data: (c) => RefreshIndicator(
                color: AppColors.coral500,
                onRefresh: () async => ref.invalidate(cancellationsProvider(_range)),
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                  children: [
                    _Summary(orders: c.totalOrders, amount: c.totalAmount, range: _ranges[c.range] ?? ''),
                    const SizedBox(height: 16),
                    Text('Hủy cả đơn (${c.orders.length})', style: AppText.sectionTitle()),
                    const SizedBox(height: 8),
                    if (c.orders.isEmpty)
                      const _Empty('Không có đơn nào bị hủy cả đơn.')
                    else
                      for (final o in c.orders) _OrderTile(o),
                    const SizedBox(height: 20),
                    Text('Món hủy lẻ (${c.items.length})', style: AppText.sectionTitle()),
                    const Text(
                      'Đơn vẫn còn, chỉ bỏ vài món. Hủy khi bếp đã làm là hàng mất thật.',
                      style: TextStyle(color: AppColors.slate500, fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    if (c.items.isEmpty)
                      const _Empty('Không có món nào bị hủy lẻ.')
                    else
                      for (final i in c.items) _ItemTile(i),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.orders, required this.amount, required this.range});
  final int orders;
  final int amount;
  final String range;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: orders > 0 ? AppColors.danger.withValues(alpha: 0.08) : AppColors.sand100,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(
            orders > 0 ? Icons.cancel_outlined : Icons.check_circle_rounded,
            color: orders > 0 ? AppColors.danger : AppColors.success,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  orders > 0 ? '$orders đơn bị hủy · $range' : 'Không có đơn nào bị hủy · $range',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: orders > 0 ? AppColors.danger : AppColors.success,
                  ),
                ),
                if (orders > 0)
                  Text(
                    'Tổng tiền các đơn đó: ${formatMoney(amount)}',
                    style: const TextStyle(color: AppColors.slate500, fontSize: 13),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderTile extends StatelessWidget {
  const _OrderTile(this.o);
  final CancelledOrder o;

  @override
  Widget build(BuildContext context) {
    // Lý do trống = khách tự hủy trên web (nhà hàng hủy thì backend bắt buộc ghi lý do)
    final reason = (o.reason ?? '').trim();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    o.code,
                    style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900),
                  ),
                ),
                Text(
                  formatMoney(o.total),
                  style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.danger),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              [
                o.isDineIn ? 'Ăn tại quán${o.tableCode != null ? ' · bàn ${o.tableCode}' : ''}' : 'Khách đặt online',
                '${o.itemCount} món',
                if (o.cancelledAt != null) formatDateTime(o.cancelledAt!),
              ].join(' · '),
              style: const TextStyle(color: AppColors.slate500, fontSize: 13),
            ),
            if (o.staffName != null)
              Text('Nhân viên mở bàn: ${o.staffName}', style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: reason.isEmpty ? AppColors.sand100 : AppColors.danger.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                reason.isEmpty ? 'Khách tự hủy (không ghi lý do)' : 'Lý do: $reason',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: reason.isEmpty ? AppColors.slate500 : AppColors.danger,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ItemTile extends StatelessWidget {
  const _ItemTile(this.i);
  final CancelledItem i;

  @override
  Widget build(BuildContext context) {
    final reason = (i.reason ?? '').trim();
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 40,
            child: Text(
              i.weight != null ? formatKg(i.weight!) : '${i.quantity}×',
              style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.slate500),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(i.name, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.slate800)),
                Text(
                  [
                    if (i.tableCode != null) 'Bàn ${i.tableCode}',
                    if (i.orderCode != null) i.orderCode!,
                    if (i.cancelledAt != null) formatTime(i.cancelledAt!),
                  ].join(' · '),
                  style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                ),
                Text(
                  reason.isEmpty ? 'Hủy trước khi bếp làm (không cần lý do)' : 'Lý do: $reason',
                  style: TextStyle(
                    color: reason.isEmpty ? AppColors.slate500 : AppColors.danger,
                    fontSize: 12,
                    fontWeight: reason.isEmpty ? FontWeight.w400 : FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          Text(formatMoney(i.amount), style: const TextStyle(color: AppColors.slate800, fontSize: 13)),
        ],
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty(this.text);
  final String text;

  @override
  Widget build(BuildContext context) =>
      Text(text, style: const TextStyle(color: AppColors.slate500, fontSize: 13));
}
