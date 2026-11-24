// Gọi API Kiểm bia nước (S17). Tài liệu: docs/29-kiem-bia-nuoc.md
// Cần quyền "Bia nước & kiểm kho quầy" (DRINKS): Xem để mở màn, Sửa để ghi số xuất / trả lại.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/drink_check.dart';
import '../state/app_providers.dart';
import 'api_client.dart';

class DrinkService {
  DrinkService(this._api);
  final ApiClient _api;

  /// GET /drinks/check?date=yyyy-MM-dd: phiếu kiểm của 1 ngày (không truyền = hôm nay).
  Future<DrinkDayCheck> dayCheck({String? date}) async {
    final res = await _api.get('/drinks/check', query: {'date': ?date});
    return DrinkDayCheck.fromJson(res.data as Map<String, dynamic>);
  }

  /// PUT /drinks/check: ghi / sửa phiếu 1 loại trong ngày. Backend tự tính "bán" theo đơn và lệch.
  /// Lỗi hay gặp: trả lại nhiều hơn số xuất (400), ngày chưa tới (400), không có quyền (403).
  Future<String> saveCheck({
    required int productId,
    String? date,
    int issuedPacks = 0,
    int issuedUnits = 0,
    int returnedUnits = 0,
    String? note,
  }) async {
    final res = await _api.put('/drinks/check', body: {
      'productId': productId,
      'date': ?date,
      'issuedPacks': issuedPacks,
      'issuedUnits': issuedUnits,
      'returnedUnits': returnedUnits,
      if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
    });
    return res.message ?? 'Đã lưu phiếu kiểm';
  }
}

final drinkServiceProvider = Provider<DrinkService>((ref) => DrinkService(ref.watch(apiClientProvider)));

/// Phiếu kiểm của ngày đang xem (S17). Tham số là 'yyyy-MM-dd' ('' = hôm nay).
final drinkCheckProvider = FutureProvider.autoDispose.family<DrinkDayCheck, String>(
  (ref, date) => ref.watch(drinkServiceProvider).dayCheck(date: date.isEmpty ? null : date),
);
