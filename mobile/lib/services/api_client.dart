// Cửa ngõ gọi backend: MỌI lệnh gọi API trong app đều đi qua đây.
//
// Việc file này lo giúp các màn hình:
// 1. Ghép địa chỉ server (AppConfig.apiBaseUrl) và gắn token: Authorization: Bearer <token>
// 2. Bóc lớp vỏ { success, data, meta } của backend → trả về ApiResponse(data, meta)
// 3. Đổi mọi lỗi thành ApiException có câu tiếng Việt (mục C01 docs/16):
//    - mất mạng → isNetwork = true
//    - 401 khi đang đăng nhập → xóa token, báo onSessionExpired (app chuyển về màn Đăng nhập)
//    - 429 → kèm thời gian phải chờ (header Retry-After)
//
// Dùng trong service:
//   final res = await api.get('/dishes', query: {'page': 1});
//   final list = res.data as List;        // phần data
//   final totalPages = res.meta?['totalPages'];

import 'package:dio/dio.dart';

import '../app/config.dart';
import 'api_exception.dart';
import 'token_store.dart';

/// Kết quả thành công: [data] là phần `data`, [meta] là phần `meta` (phân trang) nếu có.
class ApiResponse {
  const ApiResponse(this.data, [this.meta]);
  final dynamic data;
  final Map<String, dynamic>? meta;
}

class ApiClient {
  ApiClient({required TokenStore tokenStore, Dio? dio, this.onSessionExpired})
      : _tokenStore = tokenStore,
        _dio = dio ??
            Dio(BaseOptions(
              baseUrl: AppConfig.apiBaseUrl,
              connectTimeout: const Duration(seconds: 10),
              receiveTimeout: const Duration(seconds: 20),
              contentType: Headers.jsonContentType,
            ));

  final TokenStore _tokenStore;
  final Dio _dio;

  /// Gọi khi token hết hạn / bị khóa (401) lúc đang đăng nhập.
  void Function()? onSessionExpired;

  String? _token;
  bool _tokenLoaded = false;

  bool get hasToken => _token != null;

  /// Đọc token đã lưu trên máy (gọi 1 lần lúc mở app).
  Future<String?> loadToken() async {
    if (!_tokenLoaded) {
      _token = await _tokenStore.read();
      _tokenLoaded = true;
    }
    return _token;
  }

  /// Lưu token sau khi đăng nhập / đăng ký. null = đăng xuất (xóa token).
  Future<void> setToken(String? token) async {
    _token = token;
    _tokenLoaded = true;
    await _tokenStore.write(token);
  }

  // ---------- Các hàm gọi API ----------
  //
  // [silent401] = true: gặp 401 thì chỉ báo lỗi, không coi là "hết phiên"
  // (dùng cho GET /auth/me lúc mở app: token cũ hỏng thì lặng lẽ coi như khách).

  Future<ApiResponse> get(String path, {Map<String, dynamic>? query, bool silent401 = false}) =>
      _send(() => _dio.get(path, queryParameters: _clean(query), options: _options()), silent401);

  Future<ApiResponse> post(String path, {Object? body, Map<String, dynamic>? query}) =>
      _send(() => _dio.post(path, data: body, queryParameters: _clean(query), options: _options()), false);

  Future<ApiResponse> patch(String path, {Object? body}) =>
      _send(() => _dio.patch(path, data: body, options: _options()), false);

  // ---------- Bên trong ----------

  Options _options() => Options(headers: {if (_token != null) 'Authorization': 'Bearer $_token'});

  /// Bỏ các tham số null / rỗng để không gửi `?search=` thừa lên server.
  Map<String, dynamic>? _clean(Map<String, dynamic>? query) {
    if (query == null) return null;
    return {
      for (final e in query.entries)
        if (e.value != null && e.value.toString().isNotEmpty) e.key: e.value,
    };
  }

  Future<ApiResponse> _send(Future<Response<dynamic>> Function() request, bool silent401) async {
    final sentWithToken = _token != null;
    try {
      final res = await request();
      final body = res.data;
      if (body is Map<String, dynamic>) {
        final meta = body['meta'];
        return ApiResponse(body['data'], meta is Map<String, dynamic> ? meta : null);
      }
      return ApiResponse(body);
    } on DioException catch (e) {
      final error = toApiException(e);
      // `_token != null`: nhiều API cùng bị 401 một lúc thì chỉ báo hết phiên 1 lần.
      if (error.isUnauthorized && sentWithToken && !silent401 && _token != null) {
        await setToken(null);
        onSessionExpired?.call();
      }
      throw error;
    }
  }
}

/// Đổi lỗi của Dio thành ApiException có câu tiếng Việt.
ApiException toApiException(DioException e) {
  final res = e.response;

  // Không có phản hồi: mất mạng, server tắt, quá thời gian chờ.
  if (res == null) {
    return const ApiException(
      'Không kết nối được máy chủ. Kiểm tra Wi-Fi hoặc 4G rồi thử lại',
      isNetwork: true,
    );
  }

  final status = res.statusCode;
  final body = res.data;
  String? message;
  final fieldErrors = <String, String>{};

  if (body is Map) {
    if (body['message'] is String) message = body['message'] as String;
    final errors = body['errors'];
    if (errors is List) {
      for (final item in errors) {
        if (item is Map && item['field'] is String && item['message'] is String) {
          fieldErrors.putIfAbsent(item['field'] as String, () => item['message'] as String);
        }
      }
    }
  }

  Duration? retryAfter;
  if (status == 429) {
    final seconds = int.tryParse(res.headers.value('retry-after') ?? '');
    if (seconds != null) retryAfter = Duration(seconds: seconds);
  }

  return ApiException(
    message ?? _defaultMessage(status),
    statusCode: status,
    fieldErrors: fieldErrors,
    retryAfter: retryAfter,
  );
}

String _defaultMessage(int? status) => switch (status) {
      401 => 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
      403 => 'Bạn không có quyền thực hiện thao tác này',
      404 => 'Không tìm thấy dữ liệu',
      429 => 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút',
      _ => 'Có lỗi xảy ra${status == null ? '' : ' (mã $status)'}, vui lòng thử lại',
    };
