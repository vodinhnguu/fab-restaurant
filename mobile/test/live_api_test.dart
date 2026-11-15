// Test GỌI BACKEND THẬT (không phải server giả). Mặc định bị bỏ qua.
// Chỉ đọc / đăng nhập, không tạo đơn, không tạo tài khoản.
//
// Chạy: bật backend (`npm run dev` ở thư mục gốc) rồi trong thư mục mobile:
//   flutter test test/live_api_test.dart --dart-define=LIVE_API=true --dart-define=API_URL=http://localhost:4000/api/v1

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:fab_seafood/services/api_client.dart';
import 'package:fab_seafood/services/api_exception.dart';
import 'package:fab_seafood/services/auth_service.dart';
import 'package:fab_seafood/services/info_service.dart';
import 'package:fab_seafood/services/token_store.dart';
import 'package:fab_seafood/state/app_providers.dart';
import 'package:fab_seafood/state/auth_state.dart';

const live = bool.fromEnvironment('LIVE_API');

void main() {
  final skip = live ? null : 'Cần backend đang chạy, xem cách chạy ở đầu file';

  test('GET /info đọc được thành RestaurantInfo', () async {
    final info = await InfoService(ApiClient(tokenStore: MemoryTokenStore())).fetch();
    expect(info.name, 'FAB Seafood');
    expect(info.reservationAreas, contains('Phòng VIP'));
    expect(info.shippingFee, greaterThan(0));
    expect(info.lastReservationTime, '21:00');
  }, skip: skip);

  test('Sai mật khẩu → 401 câu tiếng Việt, không bị coi là hết phiên', () async {
    var expired = 0;
    final api = ApiClient(tokenStore: MemoryTokenStore(), onSessionExpired: () => expired++);
    try {
      await AuthService(api).login(email: 'khach@fab.vn', password: 'sai-mat-khau');
      fail('Đáng lẽ phải lỗi');
    } on ApiException catch (e) {
      expect(e.statusCode, 401);
      expect(e.message, 'Email hoặc mật khẩu không đúng');
    }
    expect(expired, 0);
  }, skip: skip);

  test('Đăng nhập khach@fab.vn qua authProvider, mở lại app vẫn còn đăng nhập', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final store = MemoryTokenStore();

    ProviderContainer open() {
      final c = ProviderContainer(overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        tokenStoreProvider.overrideWithValue(store),
      ]);
      addTearDown(c.dispose);
      return c;
    }

    final first = open();
    expect(await first.read(authProvider.future), isNull);
    final user = await first.read(authProvider.notifier).login(email: 'khach@fab.vn', password: '123456');
    expect(user.email, 'khach@fab.vn');

    // "Mở lại app": container mới, cùng kho token → GET /auth/me
    final second = open();
    expect((await second.read(authProvider.future))?.email, 'khach@fab.vn');
  }, skip: skip);

  test('Token giả → 401 → xóa token, báo hết phiên', () async {
    final store = MemoryTokenStore('token-gia');
    var expired = 0;
    final api = ApiClient(tokenStore: store, onSessionExpired: () => expired++);
    await api.loadToken();
    await expectLater(api.get('/orders/my'), throwsA(isA<ApiException>()));
    expect(expired, 1);
    expect(await store.read(), isNull);
  }, skip: skip);

  test('Dữ liệu sai → lỗi theo từng ô (errors[].field)', () async {
    final api = ApiClient(tokenStore: MemoryTokenStore());
    try {
      await api.post('/orders', body: {'customerName': 'An', 'phone': '123', 'items': []});
      fail('Đáng lẽ phải lỗi');
    } on ApiException catch (e) {
      expect(e.statusCode, 400);
      expect(e.fieldErrors['phone'], 'Số điện thoại không hợp lệ');
    }
  }, skip: skip);
}
