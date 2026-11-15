// Trạng thái đăng nhập dùng chung cả app.
//
// Đọc trong màn hình:
//   final user = ref.watch(currentUserProvider);   // null = khách chưa đăng nhập
//   if (ref.watch(isLoggedInProvider)) { ... }
//
// Làm việc:
//   await ref.read(authProvider.notifier).login(email: ..., password: ...);
//   await ref.read(authProvider.notifier).logout();
//
// Lúc mở app (S01): `await ref.read(authProvider.future)` → đọc token đã lưu, gọi GET /auth/me.
// Token hỏng / hết hạn (401) thì lặng lẽ xóa, coi như khách (mục S01 docs/16).

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../services/api_exception.dart';
import '../services/auth_service.dart';
import 'app_providers.dart';

class AuthNotifier extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async {
    final api = ref.read(apiClientProvider);
    final token = await api.loadToken();
    if (token == null) return null;
    try {
      return await ref.read(authServiceProvider).me(silent401: true);
    } on ApiException catch (e) {
      if (e.isUnauthorized) {
        await api.setToken(null); // token hết hạn / tài khoản bị khóa → coi như khách
        return null;
      }
      rethrow; // mất mạng... → S01 hiện "Mất kết nối" + "Thử lại"
    }
  }

  /// Đăng nhập (S02). Lỗi (sai mật khẩu, 429...) ném ra ApiException cho màn hình báo.
  Future<User> login({required String email, required String password}) async {
    final result = await ref.read(authServiceProvider).login(email: email, password: password);
    await ref.read(apiClientProvider).setToken(result.token);
    state = AsyncData(result.user);
    return result.user;
  }

  /// Đăng ký (S03), xong tự đăng nhập luôn.
  Future<User> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    final result = await ref
        .read(authServiceProvider)
        .register(name: name, email: email, password: password, phone: phone);
    await ref.read(apiClientProvider).setToken(result.token);
    state = AsyncData(result.user);
    return result.user;
  }

  /// Đăng xuất (S22): xóa token, GIỮ NGUYÊN giỏ hàng.
  Future<void> logout() async {
    await ref.read(apiClientProvider).setToken(null);
    state = const AsyncData(null);
  }

  /// Cập nhật thông tin sau khi sửa hồ sơ (S23).
  void setUser(User user) => state = AsyncData(user);

  /// ApiClient gọi khi gặp 401 (token đã bị xóa sẵn).
  void markLoggedOut() => state = const AsyncData(null);
}

final authProvider = AsyncNotifierProvider<AuthNotifier, User?>(AuthNotifier.new);

/// Người đang đăng nhập, null = khách. Trong lúc đang kiểm tra token cũng là null.
final currentUserProvider = Provider<User?>((ref) => ref.watch(authProvider).valueOrNull);

final isLoggedInProvider = Provider<bool>((ref) => ref.watch(currentUserProvider) != null);
