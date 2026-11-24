// Gọi API cho nhóm Quản lý trong app (S15, S16). Tài liệu: docs/28-app-quan-ly.md
// Cần tài khoản có quyền Xem "Tổng quan" (DASHBOARD): quản lý, chủ, admin, tổ trưởng, thu ngân.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/manager_stats.dart';
import '../state/app_providers.dart';
import 'api_client.dart';

class ManagerService {
  ManagerService(this._api);
  final ApiClient _api;

  /// GET /stats/manager (S15): doanh thu hôm nay / tháng này, đơn đã hủy, bàn, bia nước, tồn hồ.
  Future<ManagerStats> stats() async {
    final res = await _api.get('/stats/manager');
    return ManagerStats.fromJson(res.data as Map<String, dynamic>);
  }

  /// GET /stats/cancellations?range=today|7d|month (S16): đơn hủy cả đơn + món hủy lẻ.
  Future<Cancellations> cancellations({String range = 'today'}) async {
    final res = await _api.get('/stats/cancellations', query: {'range': range});
    return Cancellations.fromJson(res.data as Map<String, dynamic>);
  }
}

final managerServiceProvider = Provider<ManagerService>((ref) => ManagerService(ref.watch(apiClientProvider)));

/// Số liệu màn Quản lý (S15). Tải lại: ref.invalidate(managerStatsProvider)
final managerStatsProvider = FutureProvider.autoDispose<ManagerStats>(
  (ref) => ref.watch(managerServiceProvider).stats(),
);

/// Đơn đã hủy (S16) theo khoảng thời gian đang chọn.
final cancellationsProvider = FutureProvider.autoDispose.family<Cancellations, String>(
  (ref, range) => ref.watch(managerServiceProvider).cancellations(range: range),
);
