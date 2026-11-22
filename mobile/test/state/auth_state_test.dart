// Kiểm tra trạng thái đăng nhập: mở app có / không có token, token hỏng, chỉ nhân viên dùng được app,
// đăng xuất xóa phiếu gọi món.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:fab_seafood/models/cart_item.dart';
import 'package:fab_seafood/services/api_client.dart';
import 'package:fab_seafood/services/api_exception.dart';
import 'package:fab_seafood/services/token_store.dart';
import 'package:fab_seafood/state/app_providers.dart';
import 'package:fab_seafood/state/auth_state.dart';
import 'package:fab_seafood/state/cart_state.dart';

import '../helpers/fake_server.dart';
import '../helpers/test_app.dart' show phucVuJson, khachJson, tapVuJson;

Future<ProviderContainer> makeContainer(FakeServer server, MemoryTokenStore store) async {
  SharedPreferences.setMockInitialValues({});
  final prefs = await SharedPreferences.getInstance();
  final container = ProviderContainer(overrides: [
    sharedPreferencesProvider.overrideWithValue(prefs),
    tokenStoreProvider.overrideWithValue(store),
    apiClientProvider.overrideWithValue(ApiClient(tokenStore: store, dio: server.dio)),
  ]);
  addTearDown(container.dispose);
  return container;
}

FakeServer loginReturns(Map<String, Object?> user) => FakeServer((_) => FakeServer.json(200, {
      'success': true,
      'data': {'user': user, 'token': 'token-moi'},
    }));

void main() {
  test('Mở app chưa có token → chưa đăng nhập, không gọi API', () async {
    final server = FakeServer((_) => FakeServer.json(500, {}));
    final c = await makeContainer(server, MemoryTokenStore());

    expect(await c.read(authProvider.future), isNull);
    expect(server.requests, isEmpty);
  });

  test('Mở app có token nhân viên còn hạn → đã đăng nhập, đọc được quyền', () async {
    final server = FakeServer((_) => FakeServer.json(200, {'success': true, 'data': phucVuJson}));
    final c = await makeContainer(server, MemoryTokenStore('token-tot'));

    final user = await c.read(authProvider.future);
    expect(user?.name, 'Lý Phục Vụ');
    expect(user?.initial, 'V');
    expect(user?.roleLabel, 'Nhân viên phục vụ');
    expect(user?.canTakeOrder, isTrue);
    expect(user?.canUpdateOrder, isTrue);
    expect(c.read(isLoggedInProvider), isTrue);
  });

  test('Mở app có token hết hạn (401) → lặng lẽ xóa token', () async {
    final store = MemoryTokenStore('token-het-han');
    final server = FakeServer((_) => FakeServer.json(401, {'success': false, 'message': 'Phiên đăng nhập hết hạn'}));
    final c = await makeContainer(server, store);

    expect(await c.read(authProvider.future), isNull);
    expect(await store.read(), isNull);
  });

  test('Token của tài khoản đã mất quyền dùng app → xóa token', () async {
    final store = MemoryTokenStore('token-cu');
    final server = FakeServer((_) => FakeServer.json(200, {'success': true, 'data': tapVuJson}));
    final c = await makeContainer(server, store);

    expect(await c.read(authProvider.future), isNull);
    expect(await store.read(), isNull);
  });

  test('Đăng nhập nhân viên lưu token; đăng xuất xóa token và phiếu gọi món', () async {
    final store = MemoryTokenStore();
    final c = await makeContainer(loginReturns(phucVuJson), store);
    await c.read(authProvider.future);

    await c.read(authProvider.notifier).login(email: 'phucvu@fab.vn', password: '123456');
    expect(c.read(currentUserProvider)?.email, 'phucvu@fab.vn');
    expect(await store.read(), 'token-moi');

    c.read(ticketTableProvider.notifier).set(const TicketTable(id: 2, code: 'T02'));
    c.read(cartProvider.notifier).add(const CartItem(dishId: 1, name: 'Tôm', slug: 'tom', price: 250000));

    await c.read(authProvider.notifier).logout();
    expect(c.read(currentUserProvider), isNull);
    expect(await store.read(), isNull);
    expect(c.read(cartProvider), isEmpty);
    expect(c.read(ticketTableProvider), isNull);
  });

  for (final (who, json) in [('khách hàng', khachJson), ('tạp vụ (không có quyền đơn hàng)', tapVuJson)]) {
    test('Đăng nhập bằng tài khoản $who → báo lỗi, KHÔNG lưu token', () async {
      final store = MemoryTokenStore();
      final c = await makeContainer(loginReturns(json), store);
      await c.read(authProvider.future);

      await expectLater(
        c.read(authProvider.notifier).login(email: 'x@fab.vn', password: '123456'),
        throwsA(isA<ApiException>().having((e) => e.message, 'message', notStaffMessage)),
      );
      expect(await store.read(), isNull);
      expect(c.read(currentUserProvider), isNull);
    });
  }
}
