// "Server giả" cho test: thay phần gửi mạng của Dio, trả lời theo kịch bản do test viết.
// Nhờ vậy test chạy được mà không cần bật backend.
//
//   final server = FakeServer((req) => FakeServer.json(200, {'success': true, 'data': {...}}));
//   final api = ApiClient(tokenStore: MemoryTokenStore(), dio: server.dio);

import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';

class FakeServer implements HttpClientAdapter {
  FakeServer(this.handler) {
    dio = Dio(BaseOptions(baseUrl: 'http://test/api/v1', contentType: Headers.jsonContentType))
      ..httpClientAdapter = this;
  }

  /// Kịch bản trả lời cho từng request.
  final Future<ResponseBody> Function(RequestOptions request) handler;

  /// Các request app đã gửi (để kiểm tra header, đường dẫn, body).
  final requests = <RequestOptions>[];

  late final Dio dio;

  @override
  Future<ResponseBody> fetch(RequestOptions options, Stream<Uint8List>? requestStream, Future<void>? cancelFuture) {
    requests.add(options);
    return handler(options);
  }

  @override
  void close({bool force = false}) {}

  /// Trả về JSON với mã HTTP [status].
  static Future<ResponseBody> json(int status, Object body, {Map<String, String> headers = const {}}) async =>
      ResponseBody.fromString(jsonEncode(body), status, headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
        for (final h in headers.entries) h.key: [h.value],
      });
}
