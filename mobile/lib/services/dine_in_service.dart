// Gọi API phục vụ tại bàn. Xem docs/06-api-reference.md mục "Ăn tại quán" và docs/23-app-nhan-vien-phuc-vu.md.
// Mọi API ở đây cần đăng nhập tài khoản nhân viên (token gửi kèm tự động).

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/cart_item.dart';
import '../models/dining_table.dart';
import '../models/order.dart';
import '../state/app_providers.dart';
import 'api_client.dart';

class DineInService {
  DineInService(this._api);
  final ApiClient _api;

  /// GET /dine-in/tables (S03): mọi bàn theo khu vực, bàn có khách kèm tóm tắt đơn đang mở.
  Future<List<FloorArea>> floor() async {
    final res = await _api.get('/dine-in/tables');
    return [for (final a in res.data as List) FloorArea.fromJson(a as Map<String, dynamic>)];
  }

  /// GET /dine-in/tables/:id (S04): bàn + đơn đang mở (đủ món). Bàn trống thì order = null.
  Future<TableDetail> table(int tableId) async {
    final res = await _api.get('/dine-in/tables/$tableId');
    return TableDetail.fromJson(res.data as Map<String, dynamic>);
  }

  /// POST /dine-in/orders (S08 "Gửi bếp"). Bàn chưa có đơn thì backend tạo đơn mới,
  /// có rồi thì thêm món vào đơn đó. Giá do backend lấy từ DB. Trả về bàn sau khi gửi.
  /// Lỗi hay gặp: "Món "X" hiện đã hết", "Bàn này hiện không phục vụ...", 403 không có quyền ghi món.
  Future<TableDetail> sendToKitchen({required int tableId, required List<CartItem> items}) async {
    final res = await _api.post('/dine-in/orders', body: {
      'tableId': tableId,
      'items': [
        for (final i in items)
          {
            'dishId': i.dishId,
            'quantity': i.quantity,
            if (i.soldByWeight) 'weight': i.weight, // số kg phục vụ ghi (mặc định 1), hồ hải sản cân lại
            if (i.note.trim().isNotEmpty) 'note': i.note.trim(),
          },
      ],
    });
    return TableDetail.fromJson(res.data as Map<String, dynamic>);
  }

  /// GET /dine-in/orders (S10): đơn tại bàn hôm nay, mới nhất lên đầu.
  Future<List<Order>> todayOrders() async {
    final res = await _api.get('/dine-in/orders');
    return [for (final o in res.data as List) Order.fromJson(o as Map<String, dynamic>)];
  }

  /// GET /orders/:id: chi tiết 1 đơn (xem lại đơn đã thu tiền ở S10).
  Future<Order> order(int orderId) async {
    final res = await _api.get('/orders/$orderId');
    return Order.fromJson(res.data as Map<String, dynamic>);
  }

  /// POST /dine-in/items/serve (S04 "Check món"): tick các món đã mang ra bàn ([served] = true),
  /// hoặc bỏ tick khi bấm nhầm (false). Trả về bàn sau khi đổi.
  Future<TableDetail> serveItems(List<int> itemIds, {bool served = true}) async {
    final res = await _api.post('/dine-in/items/serve', body: {'itemIds': itemIds, 'served': served});
    return TableDetail.fromJson(res.data as Map<String, dynamic>);
  }

  /// POST /dine-in/items/:id/cancel (S04 "Hủy món"). [quantity] null = hủy cả dòng, có số = hủy bớt.
  /// Bếp chưa làm (Chờ bếp) hủy luôn; bếp đã làm / đã ra bàn thì backend bắt buộc [reason].
  Future<TableDetail> cancelItem(int itemId, {int? quantity, String? reason}) async {
    final res = await _api.post('/dine-in/items/$itemId/cancel', body: {
      'quantity': ?quantity,
      if (reason != null && reason.trim().isNotEmpty) 'reason': reason.trim(),
    });
    return TableDetail.fromJson(res.data as Map<String, dynamic>);
  }

  /// POST /dine-in/orders/:id/bill-request (S09 "Gửi thanh toán"): thu ngân trên web nhận thông báo, in bill, thu tiền.
  Future<TableDetail> requestBill(int orderId) async {
    final res = await _api.post('/dine-in/orders/$orderId/bill-request');
    return TableDetail.fromJson(res.data as Map<String, dynamic>);
  }

  /// PATCH /orders/:id/status { status: CANCELLED, reason } (S04 menu ⋮ "Hủy cả đơn"): khách bỏ về, ghi nhầm bàn...
  /// Cả bàn trống lại. Bắt buộc lý do.
  Future<void> cancelOrder(int orderId, String reason) async {
    await _api.patch('/orders/$orderId/status', body: {'status': 'CANCELLED', 'reason': reason.trim()});
  }

  /// DELETE /dine-in/orders/:id/bill-request (S04 "Rút lại"): khách muốn gọi thêm / gửi nhầm.
  Future<TableDetail> cancelBillRequest(int orderId) async {
    final res = await _api.delete('/dine-in/orders/$orderId/bill-request');
    return TableDetail.fromJson(res.data as Map<String, dynamic>);
  }
}

final dineInServiceProvider = Provider<DineInService>((ref) => DineInService(ref.watch(apiClientProvider)));

/// Sơ đồ phục vụ (S03). Tải lại: ref.invalidate(floorProvider)
final floorProvider = FutureProvider.autoDispose<List<FloorArea>>((ref) => ref.watch(dineInServiceProvider).floor());

/// 1 bàn (S04). autoDispose: rời màn thì bỏ, mở lại thì tải mới.
final tableDetailProvider = FutureProvider.autoDispose.family<TableDetail, int>(
  (ref, tableId) => ref.watch(dineInServiceProvider).table(tableId),
);

/// Đơn hôm nay (S10).
final todayOrdersProvider = FutureProvider.autoDispose<List<Order>>((ref) => ref.watch(dineInServiceProvider).todayOrders());
