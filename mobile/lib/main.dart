// Điểm khởi động app. File này chỉ ghép: kho lưu trên máy, Riverpod, theme, router.
// Muốn sửa màn hình nào thì vào lib/screens/, không sửa ở đây.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/router.dart';
import 'app/routes.dart';
import 'state/app_providers.dart';
import 'theme/app_theme.dart';
import 'widgets/app_snackbar.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Mở kho lưu trước khi chạy app, để phiếu gọi món chưa gửi có ngay từ màn đầu tiên.
  final prefs = await SharedPreferences.getInstance();

  runApp(ProviderScope(
    // ProviderScope: nơi Riverpod giữ dữ liệu dùng chung (phiếu gọi món, đăng nhập...).
    overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
    child: const FabApp(),
  ));
}

class FabApp extends ConsumerStatefulWidget {
  const FabApp({super.key, this.initialLocation = AppRoutes.splash});

  /// Màn mở đầu tiên. App thật luôn là Splash; test có thể đổi.
  final String initialLocation;

  @override
  ConsumerState<FabApp> createState() => _FabAppState();
}

class _FabAppState extends ConsumerState<FabApp> {
  late final GoRouter _router = createAppRouter(initialLocation: widget.initialLocation);

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Hết phiên đăng nhập (401): báo và về màn Đăng nhập. Phiếu gọi món chưa gửi vẫn giữ,
    // đăng nhập lại là gửi tiếp được.
    ref.listen(sessionExpiredProvider, (_, _) {
      showAppSnack('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', error: true);
      _router.go(AppRoutes.login);
    });

    return MaterialApp.router(
      title: 'Ngưu Quán',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      scaffoldMessengerKey: appMessengerKey,
      routerConfig: _router,
    );
  }
}
