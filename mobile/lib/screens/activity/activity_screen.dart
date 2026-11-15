// Tab "Hoạt động": khung chứa 2 tab con "Đơn hàng" (S15) | "Đặt bàn" (S20).
// Xem docs/16-dac-ta-app-mobile-stitch.md mục 1.3, S15, S20.
//
// File này chỉ lo phần chuyển tab con. Nội dung từng tab nằm ở
// s15_my_orders_tab.dart và s20_my_reservations_tab.dart.

import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';
import 's15_my_orders_tab.dart';
import 's20_my_reservations_tab.dart';

class ActivityScreen extends StatefulWidget {
  const ActivityScreen({super.key, this.showReservations = false});

  /// true = mở sẵn tab con "Đặt bàn" (vd bấm "Lịch đặt bàn" ở S22).
  final bool showReservations;

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(
    length: 2,
    vsync: this,
    initialIndex: widget.showReservations ? 1 : 0,
  );

  @override
  void didUpdateWidget(covariant ActivityScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Đang ở tab Hoạt động mà được mở lại với tab con khác → chuyển theo.
    if (oldWidget.showReservations != widget.showReservations) {
      _tabs.animateTo(widget.showReservations ? 1 : 0);
    }
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hoạt động'),
        bottom: TabBar(
          controller: _tabs,
          labelColor: AppColors.ocean900,
          unselectedLabelColor: AppColors.slate500,
          indicatorColor: AppColors.coral500,
          tabs: const [Tab(text: 'Đơn hàng'), Tab(text: 'Đặt bàn')],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const [MyOrdersTab(), MyReservationsTab()],
      ),
    );
  }
}
