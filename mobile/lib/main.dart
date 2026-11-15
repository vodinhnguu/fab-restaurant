// Điểm khởi động app. File này chỉ ghép 3 thứ: Riverpod, theme, router.
// Muốn sửa màn hình nào thì vào lib/screens/, không sửa ở đây.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/router.dart';
import 'theme/app_theme.dart';

void main() {
  // ProviderScope: nơi Riverpod giữ dữ liệu dùng chung (giỏ hàng, đăng nhập...).
  runApp(const ProviderScope(child: FabApp()));
}

class FabApp extends StatelessWidget {
  const FabApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'FAB Seafood',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      routerConfig: appRouter,
    );
  }
}
