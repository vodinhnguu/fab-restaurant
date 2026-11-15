// Kiểm tra ApiClient: bóc data/meta, gắn token, đổi lỗi sang tiếng Việt, xử lý 401 / 429 / mất mạng.

import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/services/api_client.dart';
import 'package:fab_seafood/services/api_exception.dart';
import 'package:fab_seafood/services/token_store.dart';

import '../helpers/fake_server.dart';

void main() {
  test('Bóc lớp vỏ { success, data, meta }', () async {
    final server = FakeServer((_) => FakeServer.json(200, {
          'success': true,
          'data': [1, 2],
          'meta': {'page': 1, 'totalPages': 3},
        }));
    final api = ApiClient(tokenStore: MemoryTokenStore(), dio: server.dio);

    final res = await api.get('/dishes', query: {'page': 1, 'search': '', 'category': null});

    expect(res.data, [1, 2]);
    expect(res.meta?['totalPages'], 3);
    // Tham số rỗng / null không gửi lên server
    expect(server.requests.single.queryParameters, {'page': 1});
  });

  test('Có token thì gắn Authorization: Bearer, chưa có thì không gắn', () async {
    final server = FakeServer((_) => FakeServer.json(200, {'success': true, 'data': {}}));
    final api = ApiClient(tokenStore: MemoryTokenStore(), dio: server.dio);

    await api.get('/info');
    expect(server.requests.last.headers.containsKey('Authorization'), isFalse);

    await api.setToken('abc');
    await api.get('/auth/me');
    expect(server.requests.last.headers['Authorization'], 'Bearer abc');
  });

  test('Lỗi lấy đúng message tiếng Việt và lỗi từng ô của backend', () async {
    final server = FakeServer((_) => FakeServer.json(400, {
          'success': false,
          'message': 'Số điện thoại không hợp lệ',
          'errors': [
            {'field': 'phone', 'message': 'Số điện thoại không hợp lệ'},
          ],
        }));
    final api = ApiClient(tokenStore: MemoryTokenStore(), dio: server.dio);

    final error = await _catch(() => api.post('/orders', body: {}));

    expect(error.message, 'Số điện thoại không hợp lệ');
    expect(error.statusCode, 400);
    expect(error.fieldErrors, {'phone': 'Số điện thoại không hợp lệ'});
  });

  test('429: đọc thời gian chờ từ header Retry-After', () async {
    final server = FakeServer((_) => FakeServer.json(
          429,
          {'success': false, 'message': 'Bạn thao tác quá nhiều lần, vui lòng thử lại sau ít phút'},
          headers: {'retry-after': '125'},
        ));
    final api = ApiClient(tokenStore: MemoryTokenStore(), dio: server.dio);

    final error = await _catch(() => api.post('/auth/login', body: {}));

    expect(error.isRateLimited, isTrue);
    expect(error.retryAfter, const Duration(seconds: 125));
    expect(error.retryAfterMinutes, 3); // 125 giây → làm tròn lên 3 phút
  });

  test('Mất mạng → isNetwork = true', () async {
    final server = FakeServer((_) => throw const SocketException('Không có mạng'));
    final api = ApiClient(tokenStore: MemoryTokenStore(), dio: server.dio);

    final error = await _catch(() => api.get('/info'));

    expect(error.isNetwork, isTrue);
    expect(error.statusCode, isNull);
  });

  test('401 khi đang đăng nhập → xóa token, báo hết phiên đúng 1 lần', () async {
    final store = MemoryTokenStore('token-cu');
    final server = FakeServer((_) => FakeServer.json(401, {'success': false, 'message': 'Phiên đăng nhập hết hạn'}));
    var expiredCount = 0;
    final api = ApiClient(tokenStore: store, dio: server.dio, onSessionExpired: () => expiredCount++);
    await api.loadToken();

    // 2 API cùng bị 401 một lúc
    await Future.wait([
      _catch(() => api.get('/orders/my')),
      _catch(() => api.get('/reservations/my')),
    ]);

    expect(expiredCount, 1);
    expect(api.hasToken, isFalse);
    expect(await store.read(), isNull);
  });

  test('401 khi chưa đăng nhập (sai mật khẩu) → KHÔNG coi là hết phiên', () async {
    final server = FakeServer(
      (_) => FakeServer.json(401, {'success': false, 'message': 'Email hoặc mật khẩu không đúng'}),
    );
    var expiredCount = 0;
    final api = ApiClient(tokenStore: MemoryTokenStore(), dio: server.dio, onSessionExpired: () => expiredCount++);

    final error = await _catch(() => api.post('/auth/login', body: {}));

    expect(error.message, 'Email hoặc mật khẩu không đúng');
    expect(expiredCount, 0);
  });

  test('silent401 (GET /auth/me lúc mở app) → không báo hết phiên, vẫn giữ token', () async {
    final server = FakeServer((_) => FakeServer.json(401, {'success': false}));
    var expiredCount = 0;
    final api = ApiClient(tokenStore: MemoryTokenStore('t'), dio: server.dio, onSessionExpired: () => expiredCount++);
    await api.loadToken();

    final error = await _catch(() => api.get('/auth/me', silent401: true));

    expect(error.isUnauthorized, isTrue);
    expect(expiredCount, 0);
    expect(api.hasToken, isTrue); // AuthNotifier tự quyết định xóa
  });

  test('Backend không gửi message → dùng câu mặc định theo mã lỗi', () {
    final e = toApiException(DioException.badResponse(
      statusCode: 404,
      requestOptions: RequestOptions(path: '/x'),
      response: Response(requestOptions: RequestOptions(path: '/x'), statusCode: 404),
    ));
    expect(e.message, 'Không tìm thấy dữ liệu');
  });
}

/// Chạy [call], bắt và trả về ApiException (test hỏng nếu không có lỗi).
Future<ApiException> _catch(Future<Object?> Function() call) async {
  try {
    await call();
  } on ApiException catch (e) {
    return e;
  }
  fail('Đáng lẽ phải có ApiException');
}
