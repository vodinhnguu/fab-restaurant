// Điểm khởi động app. File này chỉ ghép: kho lưu trên máy, Riverpod, theme, router.
// Muốn sửa màn hình nào thì vào lib/screens/, không sửa ở đây.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/router.dart';
import 'app/routes.dart';
import 'state/app_providers.dart';
import 'theme/app_theme.dart';
import 'widgets/app_snackbar.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Mở kho lưu trước khi chạy app, để giỏ hàng có ngay từ màn đầu tiên.
  final prefs = await SharedPreferences.getInstance();

  runApp(ProviderScope(
    // ProviderScope: nơi Riverpod giữ dữ liệu dùng chung (giỏ hàng, đăng nhập...).
    overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
    child: const FabApp(),
  ));
}

class FabApp extends ConsumerWidget {
  const FabApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Hết phiên đăng nhập (401): báo và mở màn Đăng nhập, giỏ hàng giữ nguyên (mục C01 docs/16).
    ref.listen(sessionExpiredProvider, (_, _) {
      showAppSnack('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', error: true);
      appRouter.push(AppRoutes.login);
    });

    return MaterialApp.router(
      title: 'FAB Seafood',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      scaffoldMessengerKey: appMessengerKey,
      routerConfig: appRouter,
    );
  }
}
