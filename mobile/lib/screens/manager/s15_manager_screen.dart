// S15. Quản lý · Tổng quan: docs/28-app-quan-ly.md
// API: GET /stats/manager (tự tải lại mỗi 60 giây; vuốt xuống để tải ngay)
//
// Từ trên xuống:
//   thẻ lớn DOANH THU HÔM NAY (tổng, số đơn, trung bình 1 đơn) + 2 dòng tách Tại quán / Online
//   thẻ DOANH THU THÁNG 11/2026 (từ ngày 1)
//   thẻ ĐƠN ĐÃ HỦY: hôm nay / tháng này (số đơn + tiền), bấm vào → S16 xem lý do từng đơn
//   thẻ ĐANG PHỤC VỤ: bàn có khách / trống / chờ thu tiền + tiền đang phục vụ
//   thẻ BIA & NƯỚC bán hôm nay: tổng lon/chai + từng loại
//   thẻ TỒN HỒ HẢI SẢN: loại nào còn bao nhiêu kg, loại gần hết tô đỏ (docs/27)
//   thẻ MÓN BÁN CHẠY hôm nay
//
// Chỉ tài khoản có quyền Xem "Tổng quan" vào được (user.canSeeManager); router tự đẩy về
// Sơ đồ bàn nếu không có quyền.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/app_drawer.dart';
import '../../app/routes.dart';
import '../../models/manager_stats.dart';
import '../../services/manager_service.dart';
import '../../state/auth_state.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/format.dart';
import '../../widgets/state_views.dart';

class ManagerScreen extends ConsumerStatefulWidget {
  const ManagerScreen({super.key});

  static const refreshEvery = Duration(seconds: 60);

  @override
  ConsumerState<ManagerScreen> createState() => _ManagerScreenState();
}

class _ManagerScreenState extends ConsumerState<ManagerScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(ManagerScreen.refreshEvery, (_) => _reload());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _reload() => ref.invalidate(managerStatsProvider);

  @override
  Widget build(BuildContext context) {
    final value = ref.watch(managerStatsProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      drawer: const AppDrawer(current: AppSection.manager),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Quản lý'),
            Text(
              user?.roleLabel ?? '',
              style: const TextStyle(fontSize: 12, color: AppColors.slate500, fontWeight: FontWeight.w400),
            ),
          ],
        ),
        actions: [
          IconButton(tooltip: 'Tải lại', onPressed: _reload, icon: const Icon(Icons.refresh_rounded)),
        ],
      ),
      body: AsyncView(
        value: value,
        onRetry: _reload,
        data: (s) => RefreshIndicator(
          color: AppColors.coral500,
          onRefresh: () async => _reload(),
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
            children: [
              _RevenueCard(block: s.today, title: 'Doanh thu hôm nay', big: true),
              const SizedBox(height: 12),
              _RevenueCard(block: s.month, title: 'Doanh thu tháng ${s.month.label ?? ''}', big: false),
              const SizedBox(height: 12),
              _CancelledCard(
                today: s.cancelledToday,
                month: s.cancelledMonth,
                onTap: () => context.push(AppRoutes.cancelled),
              ),
              const SizedBox(height: 12),
              _TablesCard(s.tables),
              const SizedBox(height: 12),
              _DrinksCard(
                items: s.drinks,
                quantity: s.drinkQuantity,
                revenue: s.drinkRevenue,
                // Có quyền xem phiếu kiểm thì bấm thẻ để mở S17 Kiểm bia nước (docs/29)
                onTap: (user?.canSeeDrinks ?? false) ? () => context.push(AppRoutes.drinks) : null,
              ),
              const SizedBox(height: 12),
              _TankCard(s.tank),
              if (s.topDishes.isNotEmpty) ...[
                const SizedBox(height: 12),
                _TopDishesCard(s.topDishes),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Khung thẻ dùng chung: tiêu đề + nội dung.
class _Card extends StatelessWidget {
  const _Card({required this.title, required this.child, this.icon, this.color, this.onTap, this.trailing});
  final String title;
  final Widget child;
  final IconData? icon;
  final Color? color;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final head = Row(
      children: [
        if (icon != null) ...[
          Icon(icon, size: 18, color: color ?? AppColors.ocean500),
          const SizedBox(width: 6),
        ],
        Expanded(child: Text(title, style: AppText.sectionTitle())),
        ?trailing,
        if (onTap != null) const Icon(Icons.chevron_right_rounded, color: AppColors.slate500),
      ],
    );
    final body = Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [head, const SizedBox(height: 10), child]),
    );
    return Card(
      child: onTap == null ? body : InkWell(borderRadius: BorderRadius.circular(16), onTap: onTap, child: body),
    );
  }
}

/// Doanh thu: số lớn + số đơn + trung bình 1 đơn, rồi tách Tại quán / Online.
class _RevenueCard extends StatelessWidget {
  const _RevenueCard({required this.block, required this.title, required this.big});
  final RevenueBlock block;
  final String title;
  final bool big;

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: title,
      icon: big ? Icons.today_rounded : Icons.calendar_month_rounded,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            formatMoney(block.revenue),
            style: TextStyle(
              fontSize: big ? 32 : 26,
              fontWeight: FontWeight.w800,
              color: AppColors.ocean900,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            block.orders == 0
                ? 'Chưa có đơn nào đã thu tiền'
                : '${block.orders} đơn đã thu · trung bình ${formatMoney(block.avgPerOrder)}/đơn',
            style: const TextStyle(color: AppColors.slate500, fontSize: 13),
          ),
          const SizedBox(height: 12),
          _ChannelRow(
            icon: Icons.restaurant_rounded,
            label: 'Ăn tại quán',
            revenue: block.dineInRevenue,
            orders: block.dineInOrders,
            total: block.revenue,
            color: AppColors.ocean500,
          ),
          const SizedBox(height: 8),
          _ChannelRow(
            icon: Icons.delivery_dining_rounded,
            label: 'Khách đặt online',
            revenue: block.onlineRevenue,
            orders: block.onlineOrders,
            total: block.revenue,
            color: AppColors.coral500,
          ),
        ],
      ),
    );
  }
}

/// 1 kênh bán: tên, tiền, số đơn + thanh tỉ lệ so với tổng.
class _ChannelRow extends StatelessWidget {
  const _ChannelRow({
    required this.icon,
    required this.label,
    required this.revenue,
    required this.orders,
    required this.total,
    required this.color,
  });
  final IconData icon;
  final String label;
  final int revenue;
  final int orders;
  final int total;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final ratio = total > 0 ? revenue / total : 0.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, color: AppColors.slate800),
              ),
            ),
            const SizedBox(width: 6),
            // Máy hẹp + số tiền lớn (240.000.000đ): tự thu nhỏ chữ cho vừa 1 dòng
            Flexible(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerRight,
                child: Text(
                  '${formatMoney(revenue)} · $orders đơn',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.ocean900),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: ratio,
            minHeight: 6,
            backgroundColor: AppColors.sand100,
            valueColor: AlwaysStoppedAnimation(color),
          ),
        ),
      ],
    );
  }
}

/// Đơn đã hủy hôm nay / tháng này. Bấm vào mở S16 xem lý do từng đơn.
class _CancelledCard extends StatelessWidget {
  const _CancelledCard({required this.today, required this.month, required this.onTap});
  final CancelledBlock today;
  final CancelledBlock month;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: 'Đơn đã hủy',
      icon: Icons.cancel_outlined,
      color: AppColors.danger,
      onTap: onTap,
      child: Row(
        children: [
          Expanded(
            child: _MiniStat(
              label: 'Hôm nay',
              value: '${today.orders} đơn',
              sub: formatMoney(today.amount),
              color: today.orders > 0 ? AppColors.danger : AppColors.slate500,
            ),
          ),
          Container(width: 1, height: 44, color: AppColors.sand100),
          Expanded(
            child: _MiniStat(
              label: 'Tháng này',
              value: '${month.orders} đơn',
              sub: formatMoney(month.amount),
              color: AppColors.slate800,
            ),
          ),
        ],
      ),
    );
  }
}

/// Bàn lúc này: có khách / trống / chờ thu tiền + tiền đang phục vụ.
class _TablesCard extends StatelessWidget {
  const _TablesCard(this.t);
  final TablesBlock t;

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: 'Đang phục vụ',
      icon: Icons.table_restaurant_rounded,
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _MiniStat(label: 'Bàn có khách', value: '${t.busy}', color: AppColors.ocean900)),
              Expanded(child: _MiniStat(label: 'Bàn trống', value: '${t.free}', color: AppColors.success)),
              Expanded(
                child: _MiniStat(
                  label: 'Chờ thu tiền',
                  value: '${t.billRequested}',
                  color: t.billRequested > 0 ? AppColors.coral500 : AppColors.slate500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: AppColors.sand100, borderRadius: BorderRadius.circular(10)),
            child: Text(
              'Tiền đang phục vụ (chưa thu): ${formatMoney(t.servingAmount)}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.ocean900, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

/// Bia & nước bán hôm nay (nhóm "Nước uống").
class _DrinksCard extends StatelessWidget {
  const _DrinksCard({required this.items, required this.quantity, required this.revenue, this.onTap});
  final List<DrinkRow> items;
  final int quantity;
  final int revenue;

  /// Có thì bấm thẻ mở S17 Kiểm bia nước.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: 'Bia & nước hôm nay',
      icon: Icons.local_bar_rounded,
      onTap: onTap,
      trailing: Text(
        '$quantity · ${formatMoney(revenue)}',
        style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900, fontSize: 13),
      ),
      child: items.isEmpty
          ? Text(
              onTap == null
                  ? 'Hôm nay chưa bán bia / nước nào.'
                  : 'Hôm nay chưa bán bia / nước nào. Bấm để kiểm kho quầy cuối ngày.',
              style: const TextStyle(color: AppColors.slate500, fontSize: 13),
            )
          : Column(
              children: [
                for (final d in items)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      children: [
                        Expanded(child: Text(d.name, style: const TextStyle(fontSize: 13))),
                        Text(
                          '${d.quantity} ${d.unit}',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.ocean900),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(
                          width: 92,
                          child: Text(
                            formatMoney(d.revenue),
                            textAlign: TextAlign.right,
                            style: const TextStyle(fontSize: 13, color: AppColors.slate500),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
    );
  }
}

/// Tồn hồ hải sản (docs/27-ton-ho-hai-san.md): loại nào còn bao nhiêu kg.
class _TankCard extends StatelessWidget {
  const _TankCard(this.rows);
  final List<TankRow> rows;

  @override
  Widget build(BuildContext context) {
    final low = rows.where((r) => r.isLow).toList();
    return _Card(
      title: 'Tồn hồ hải sản',
      icon: Icons.set_meal_rounded,
      child: rows.isEmpty
          ? const Text(
              'Chưa khai báo loại hải sản nào trong hồ.',
              style: TextStyle(color: AppColors.slate500, fontSize: 13),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (low.isNotEmpty)
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.amber.background,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Cần nhập hàng: ${low.map((r) => '${r.name} (${formatKg(r.stockKg)})').join(', ')}',
                      style: TextStyle(color: AppColors.amber.foreground, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final r in rows)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: r.isEmpty
                              ? AppColors.danger.withValues(alpha: 0.1)
                              : r.isLow
                                  ? AppColors.amber.background
                                  : AppColors.sand100,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${r.name} · ${r.isEmpty ? 'hết' : formatKg(r.stockKg)}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: r.isEmpty
                                ? AppColors.danger
                                : r.isLow
                                    ? AppColors.amber.foreground
                                    : AppColors.slate800,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
    );
  }
}

/// Món bán chạy hôm nay (5 món đầu).
class _TopDishesCard extends StatelessWidget {
  const _TopDishesCard(this.dishes);
  final List<TopDish> dishes;

  @override
  Widget build(BuildContext context) {
    return _Card(
      title: 'Món bán chạy hôm nay',
      icon: Icons.local_fire_department_rounded,
      color: AppColors.coral500,
      child: Column(
        children: [
          for (final (i, d) in dishes.indexed)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  SizedBox(
                    width: 20,
                    child: Text(
                      '${i + 1}.',
                      style: const TextStyle(color: AppColors.slate500, fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                  ),
                  Expanded(child: Text(d.name, style: const TextStyle(fontSize: 13))),
                  Text(
                    '${d.quantity}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.ocean900),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Ô số nhỏ: nhãn trên, số to, chú thích dưới.
class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.label, required this.value, required this.color, this.sub});
  final String label;
  final String value;
  final Color color;
  final String? sub;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color, height: 1.1)),
        if (sub != null) Text(sub!, style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
      ],
    );
  }
}
