// S01. Splash: xem docs/16-dac-ta-app-mobile-stitch.md mục S01
// API: GET /info, GET /auth/me (nếu có token)
// Thiết kế: design/S01.png
//
// Bước 0: chỉ hiện logo rồi tự vào Trang chủ.
// TODO(Bước 1): tải /info, kiểm tra token, mất mạng thì hiện "Mất kết nối" + "Thử lại".

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/routes.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) context.go(AppRoutes.home);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ocean900,
      body: SafeArea(
        child: Column(
          children: [
            const Spacer(),
            const Icon(Icons.set_meal_rounded, size: 72, color: AppColors.white),
            const SizedBox(height: 12),
            Text('FAB Seafood', style: AppText.pageTitle(AppColors.white).copyWith(fontSize: 34)),
            const SizedBox(height: 8),
            const Text('Hải sản tươi sống mỗi ngày', style: TextStyle(color: AppColors.ocean200)),
            const Spacer(),
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.white),
            ),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }
}
