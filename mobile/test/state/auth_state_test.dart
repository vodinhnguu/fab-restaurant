// Kiểm tra trạng thái đăng nhập: mở app có / không có token, token hỏng, đăng nhập, đăng xuất.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:fab_seafood/services/api_client.dart';
import 'package:fab_seafood/services/token_store.dart';
import 'package:fab_seafood/state/app_providers.dart';
import 'package:fab_seafood/state/auth_state.dart';

import '../helpers/fake_server.dart';

const khach = {'id': 7, 'name': 'Nguyễn Văn An', 'email': 'khach@fab.vn', 'phone': '0901234567', 'role': 'CUSTOMER'};

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

void main() {
  test('Mở app chưa có token → khách, không gọi API', () async {
    final server = FakeServer((_) => FakeServer.json(500, {}));
    final c = await makeContainer(server, MemoryTokenStore());

    expect(await c.read(authProvider.future), isNull);
    expect(server.requests, isEmpty);
  });

  test('Mở app có token còn hạn → đã đăng nhập', () async {
    final server = FakeServer((_) => FakeServer.json(200, {'success': true, 'data': khach}));
    final c = await makeContainer(server, MemoryTokenStore('token-tot'));

    final user = await c.read(authProvider.future);
    expect(user?.name, 'Nguyễn Văn An');
    expect(user?.initial, 'A');
    expect(c.read(isLoggedInProvider), isTrue);
  });

  test('Mở app có token hết hạn (401) → lặng lẽ xóa token, coi như khách', () async {
    final store = MemoryTokenStore('token-het-han');
    final server = FakeServer((_) => FakeServer.json(401, {'success': false, 'message': 'Phiên đăng nhập hết hạn'}));
    final c = await makeContainer(server, store);

    expect(await c.read(authProvider.future), isNull);
    expect(await store.read(), isNull);
  });

  test('Đăng nhập lưu token và user; đăng xuất xóa token', () async {
    final store = MemoryTokenStore();
    final server = FakeServer((_) => FakeServer.json(200, {
          'success': true,
          'data': {'user': khach, 'token': 'token-moi'},
        }));
    final c = await makeContainer(server, store);
    await c.read(authProvider.future);

    await c.read(authProvider.notifier).login(email: 'khach@fab.vn', password: '123456');
    expect(c.read(currentUserProvider)?.email, 'khach@fab.vn');
    expect(await store.read(), 'token-moi');

    await c.read(authProvider.notifier).logout();
    expect(c.read(currentUserProvider), isNull);
    expect(await store.read(), isNull);
  });
}
