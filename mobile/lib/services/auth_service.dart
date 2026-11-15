// Gọi API tài khoản: đăng nhập, đăng ký, hồ sơ, đổi mật khẩu.
// Xem docs/06-api-reference.md mục "Auth". Màn hình không gọi file này trực tiếp
// mà đi qua authProvider (state/auth_state.dart) để cả app biết ai đang đăng nhập.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../state/app_providers.dart';
import 'api_client.dart';

/// Kết quả đăng nhập / đăng ký.
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

  /// POST /auth/register → { user, token }. SĐT để trống thì KHÔNG gửi trường phone (mục S03).
  Future<AuthResult> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    final res = await _api.post('/auth/register', body: {
      'name': name.trim(),
      'email': email.trim(),
      'password': password,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
    });
    return _toResult(res);
  }

  /// GET /auth/me. [silent401]: token cũ hỏng thì không báo "hết phiên".
  Future<User> me({bool silent401 = false}) async {
    final res = await _api.get('/auth/me', silent401: silent401);
    return User.fromJson(res.data as Map<String, dynamic>);
  }

  /// PATCH /auth/me. Gửi chuỗi rỗng = xóa SĐT / địa chỉ (mục S23).
  Future<User> updateProfile({required String name, required String phone, required String address}) async {
    final res = await _api.patch('/auth/me', body: {'name': name.trim(), 'phone': phone, 'address': address.trim()});
    return User.fromJson(res.data as Map<String, dynamic>);
  }

  /// POST /auth/change-password
  Future<void> changePassword({required String currentPassword, required String newPassword}) async {
    await _api.post('/auth/change-password', body: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  AuthResult _toResult(ApiResponse res) {
    final data = res.data as Map<String, dynamic>;
    return AuthResult(User.fromJson(data['user'] as Map<String, dynamic>), data['token'] as String);
  }
}

final authServiceProvider = Provider<AuthService>((ref) => AuthService(ref.watch(apiClientProvider)));
