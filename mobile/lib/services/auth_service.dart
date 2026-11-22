// Gọi API tài khoản: đăng nhập, lấy người đang đăng nhập.
// Xem docs/06-api-reference.md mục "Auth". Màn hình không gọi file này trực tiếp
// mà đi qua authProvider (state/auth_state.dart) để cả app biết ai đang đăng nhập.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../state/app_providers.dart';
import 'api_client.dart';

/// Kết quả đăng nhập.
class AuthResult {
  const AuthResult(this.user, this.token);
  final User user;
  final String token;
}

class AuthService {
  AuthService(this._api);
  final ApiClient _api;

  /// POST /auth/login → { user, token }
  Future<AuthResult> login({required String email, required String password}) async {
    final res = await _api.post('/auth/login', body: {'email': email.trim(), 'password': password});
    return _toResult(res);
  }

  /// GET /auth/me. [silent401]: token cũ hỏng thì không báo "hết phiên".
  Future<User> me({bool silent401 = false}) async {
    final res = await _api.get('/auth/me', silent401: silent401);
    return User.fromJson(res.data as Map<String, dynamic>);
  }

  AuthResult _toResult(ApiResponse res) {
    final data = res.data as Map<String, dynamic>;
    return AuthResult(User.fromJson(data['user'] as Map<String, dynamic>), data['token'] as String);
  }
}

final authServiceProvider = Provider<AuthService>((ref) => AuthService(ref.watch(apiClientProvider)));
