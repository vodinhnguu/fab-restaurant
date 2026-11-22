// Trạng thái đăng nhập dùng chung cả app. App chỉ dành cho NHÂN VIÊN (docs/23-app-nhan-vien-phuc-vu.md).
//
// Đọc trong màn hình:
//   final user = ref.watch(currentUserProvider);   // null = chưa đăng nhập
//   if (user?.canTakeOrder ?? false) { ... }        // ẩn / hiện nút theo quyền
//
// Làm việc:
//   await ref.read(authProvider.notifier).login(email: ..., password: ...);
//   await ref.read(authProvider.notifier).logout();
//
// Lúc mở app (S01): `await ref.read(authProvider.future)` → đọc token đã lưu, gọi GET /auth/me.
// Token hỏng / hết hạn (401), hoặc tài khoản không còn quyền dùng app → xóa, về màn Đăng nhập.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../services/api_exception.dart';
import '../services/auth_service.dart';
import 'app_providers.dart';
import 'cart_state.dart';

/// Câu báo khi đăng nhập bằng tài khoản không dùng được app (khách hàng, tạp vụ, kỹ thuật...).
const notStaffMessage = 'Tài khoản này không dùng được app phục vụ. App dành cho nhân viên có quyền "Đơn hàng & gọi món".';

class AuthNotifier extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async {
    final api = ref.read(apiClientProvider);
    final token = await api.loadToken();
    if (token == null) return null;
    try {
      final user = await ref.read(authServiceProvider).me(silent401: true);
      if (user.canUseApp) return user;
      await api.setToken(null); // bị đổi vai trò / mất quyền từ lần đăng nhập trước
      return null;
    } on ApiException catch (e) {
      if (e.isUnauthorized) {
        await api.setToken(null); // token hết hạn / tài khoản bị khóa
        return null;
      }
      rethrow; // mất mạng... → S01 hiện "Mất kết nối" + "Thử lại"
    }
  }

  /// Đăng nhập (S02). Lỗi (sai mật khẩu, 429, không phải nhân viên...) ném ra ApiException cho màn hình báo.
  Future<User> login({required String email, required String password}) async {
    final result = await ref.read(authServiceProvider).login(email: email, password: password);
    // Không lưu token của tài khoản không dùng được app
    if (!result.user.canUseApp) throw const ApiException(notStaffMessage, statusCode: 403);
    await ref.read(apiClientProvider).setToken(result.token);
    state = AsyncData(result.user);
    return result.user;
  }

  /// Đăng xuất (S11): xóa token, phiếu gọi món chưa gửi và order đã cất (máy có thể đưa cho người khác dùng).
  Future<void> logout() async {
    await ref.read(apiClientProvider).setToken(null);
    ref.read(cartProvider.notifier).clear();
    ref.read(ticketTableProvider.notifier).set(null);
    ref.read(savedTicketsProvider.notifier).clear(); // order đã cất cũng xóa
    state = const AsyncData(null);
  }

  /// ApiClient gọi khi gặp 401 (token đã bị xóa sẵn).
  void markLoggedOut() => state = const AsyncData(null);
}

final authProvider = AsyncNotifierProvider<AuthNotifier, User?>(AuthNotifier.new);

/// Người đang đăng nhập, null = chưa đăng nhập. Trong lúc đang kiểm tra token cũng là null.
final currentUserProvider = Provider<User?>((ref) => ref.watch(authProvider).valueOrNull);

final isLoggedInProvider = Provider<bool>((ref) => ref.watch(currentUserProvider) != null);
