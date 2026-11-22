// Các "nguồn" dùng chung cho cả app: kho lưu trên máy, token, ApiClient.
//
// Provider là gì? Một chỗ tạo ra 1 đối tượng dùng chung. Màn hình / service lấy ra bằng
//   ref.watch(apiClientProvider)   (tự vẽ lại khi giá trị đổi)
//   ref.read(apiClientProvider)    (lấy 1 lần, dùng trong hàm bấm nút)

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../services/api_client.dart';
import '../services/token_store.dart';
import 'auth_state.dart';

/// Kho lưu dữ liệu thường trên máy (phiếu gọi món chưa gửi bếp).
/// Mở sẵn trong main.dart rồi truyền vào bằng overrideWithValue, nên ở đây không có giá trị.
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError('Chưa truyền SharedPreferences trong main.dart'),
);

/// Kho lưu token (mã hóa). Test thay bằng MemoryTokenStore.
final tokenStoreProvider = Provider<TokenStore>((ref) => SecureTokenStore());

/// Tăng 1 mỗi lần phiên đăng nhập hết hạn (401). main.dart nghe giá trị này để
/// hiện snackbar và về màn Đăng nhập.
final sessionExpiredProvider = StateProvider<int>((ref) => 0);

/// Phần gửi mạng của ApiClient. null = ApiClient tự tạo (app thật). Test thay bằng server giả.
final dioProvider = Provider<Dio?>((ref) => null);

final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient(tokenStore: ref.watch(tokenStoreProvider), dio: ref.watch(dioProvider));
  client.onSessionExpired = () {
    ref.read(authProvider.notifier).markLoggedOut(); // phiếu gọi món vẫn giữ nguyên
    ref.read(sessionExpiredProvider.notifier).state++;
  };
  return client;
});
