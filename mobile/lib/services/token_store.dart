// Nơi lưu token đăng nhập (JWT) trên máy.
//
// App thật dùng SecureTokenStore (mã hóa, theo mục 4 docs/16).
// Test dùng MemoryTokenStore vì máy test không có kho bảo mật của điện thoại.

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class TokenStore {
  Future<String?> read();

  /// [token] = null thì xóa.
  Future<void> write(String? token);
}

class SecureTokenStore implements TokenStore {
  static const _key = 'token';
  final _storage = const FlutterSecureStorage();

  @override
  Future<String?> read() => _storage.read(key: _key);

  @override
  Future<void> write(String? token) =>
      token == null ? _storage.delete(key: _key) : _storage.write(key: _key, value: token);
}

class MemoryTokenStore implements TokenStore {
  MemoryTokenStore([this._token]);
  String? _token;

  @override
  Future<String?> read() async => _token;

  @override
  Future<void> write(String? token) async => _token = token;
}
