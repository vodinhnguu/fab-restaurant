// Test GỌI BACKEND THẬT (không phải server giả). Mặc định bị bỏ qua.
// Kiểm tra app đọc đúng dữ liệu thật của backend: sơ đồ bàn, đơn của bàn, trạng thái món...
//
// CÓ TẠO DỮ LIỆU: gửi bếp 1 đơn ở 1 bàn trống, check món, hủy món, gửi / rút thanh toán,
// cuối cùng "Hủy cả đơn" (lý do "Test tự động") để bàn trống lại. Đơn đã hủy vẫn còn trong
// "Đơn hôm nay"; id đơn được in ra để xóa nếu cần.
//
// Chạy: bật backend (`npm run dev` ở thư mục gốc) rồi trong thư mục mobile:
//   flutter test test/live_api_test.dart --dart-define=LIVE_API=true --dart-define=API_URL=http://localhost:4000/api/v1

import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/models/cart_item.dart';
import 'package:fab_seafood/models/status.dart';
import 'package:fab_seafood/services/api_client.dart';
import 'package:fab_seafood/services/api_exception.dart';
import 'package:fab_seafood/services/auth_service.dart';
import 'package:fab_seafood/services/dine_in_service.dart';
import 'package:fab_seafood/services/dish_service.dart';
import 'package:fab_seafood/services/token_store.dart';

const live = bool.fromEnvironment('LIVE_API');

void main() {
  final skip = live ? null : 'Cần backend đang chạy, xem cách chạy ở đầu file';

  test('Tài khoản khách đăng nhập được backend nhưng không có quyền dùng app', () async {
    final result = await AuthService(ApiClient(tokenStore: MemoryTokenStore())).login(email: 'khach@fab.vn', password: '123456');
    expect(result.user.canUseApp, isFalse);
  }, skip: skip);

  test('Phục vụ: sơ đồ → gửi bếp → check món → hủy món → gửi / rút thanh toán → hủy cả đơn', () async {
    final api = ApiClient(tokenStore: MemoryTokenStore());
    final login = await AuthService(api).login(email: 'phucvu@fab.vn', password: '123456');
    expect(login.user.canTakeOrder, isTrue);
    expect(login.user.roleLabel, 'Nhân viên phục vụ');
    await api.setToken(login.token);
    final service = DineInService(api);

    // Sơ đồ: 3 khu, bàn có vị trí
    final floor = await service.floor();
    expect(floor.map((a) => a.name), containsAll(['Trong nhà', 'Ngoài trời - view biển', 'Phòng VIP']));
    final table = floor.expand((a) => a.tables).firstWhere((t) => !t.isBusy);
    expect(table.x, greaterThan(0));

    // Gửi bếp 2 món
    final dishes = (await DishService(api).dishes(limit: 2)).items;
    final sent = await service.sendToKitchen(tableId: table.id, items: [
      CartItem(dishId: dishes[0].id, name: dishes[0].name, slug: dishes[0].slug, price: 0, quantity: 2, note: 'Test tự động'),
      CartItem(dishId: dishes[1].id, name: dishes[1].name, slug: dishes[1].slug, price: 0),
    ]);
    final order = sent.order!;
    // ignore: avoid_print
    print('Đơn thử: id ${order.id}, ${order.code}, bàn ${table.code}');
    try {
      expect(order.status, OrderStatus.confirmed);
      expect(order.items.map((i) => i.status), everyElement(OrderItemStatus.pending));
      expect(order.itemCount, 3);
      expect(order.waitingCount, 3);
      expect(order.items.first.note, 'Test tự động');

      // Check món
      final first = order.items.first;
      final served = await service.serveItems([first.id]);
      expect(served.order!.items.firstWhere((i) => i.id == first.id).status, OrderItemStatus.served);
      expect(served.order!.waitingCount, 1);

      // Hủy món chờ bếp: không cần lý do
      final second = order.items[1];
      final cancelled = await service.cancelItem(second.id);
      expect(cancelled.order!.items.firstWhere((i) => i.id == second.id).isCancelled, isTrue);
      expect(cancelled.order!.status, OrderStatus.delivering); // món còn lại đã ra bàn

      // Hủy món đã ra bàn mà thiếu lý do: backend chặn
      await expectLater(
        service.cancelItem(first.id, quantity: 1),
        throwsA(isA<ApiException>().having((e) => e.message, 'message', contains('lý do'))),
      );

      // Gửi thanh toán / rút lại
      final billed = await service.requestBill(order.id);
      expect(billed.order!.billRequested, isTrue);
      final floorBilled = await service.floor();
      expect(floorBilled.expand((a) => a.tables).firstWhere((t) => t.id == table.id).order!.billRequested, isTrue);
      final withdrawn = await service.cancelBillRequest(order.id);
      expect(withdrawn.order!.billRequested, isFalse);

      // Đơn hôm nay đọc được
      final today = await service.todayOrders();
      expect(today.firstWhere((o) => o.id == order.id).tableCode, table.code);
    } finally {
      // Dọn: hủy cả đơn để bàn trống lại
      await service.cancelOrder(order.id, 'Test tự động');
    }
    expect((await service.table(table.id)).order, isNull);
  }, skip: skip);
}
