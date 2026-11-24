// S01. Splash: docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: GET /auth/me (nếu có token đã lưu)
// Thiết kế: design/S01.png
//
// Việc làm khi mở app:
// 1. Có token thì kiểm tra GET /auth/me. Token hỏng (401) / tài khoản không còn quyền → xóa (auth_state.dart lo).
// 2. Đã đăng nhập → tab Bàn (S03). Chưa → Đăng nhập (S02).
// 3. Mất mạng → "Mất kết nối mạng" + "Thử lại" ngay trên nền Splash.

import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../app/config.dart';
import '../app/routes.dart';
import '../services/api_exception.dart';
import '../state/auth_state.dart';
import '../theme/app_colors.dart';
import '../widgets/app_button.dart';
import '../widgets/fab_logo.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  /// Lỗi lần tải gần nhất. null = đang tải.
  Object? _error;

  @override
  void initState() {
    super.initState();
    _start();
  }

  Future<void> _start() async {
    try {
      final user = ref.read(authProvider.future);
      await Future.wait([
        user,
        // Hiện Splash ít nhất 1 giây cho đỡ nháy, kể cả khi mạng rất nhanh.
        Future<void>.delayed(const Duration(seconds: 1)),
      ]);
      final me = await user;
      if (!mounted) return;
      // Mở lại app: quản lý / chủ / tổ trưởng / thu ngân vào màn Quản lý, còn lại vào Sơ đồ bàn (docs/28)
      if (me == null) {
        context.go(AppRoutes.login);
      } else {
        context.go(me.canSeeManager ? AppRoutes.manager : AppRoutes.tables);
      }
    } catch (e) {
      if (mounted) setState(() => _error = e);
    }
  }

  void _retry() {
    // Xóa kết quả lỗi cũ để lần sau tải lại thật.
    ref.invalidate(authProvider);
    setState(() => _error = null);
    _start();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0C3A57), AppColors.ocean900, Color(0xFF1A3D55)],
            stops: [0, 0.55, 1],
          ),
        ),
        child: CustomPaint(
          painter: const _RingsPainter(),
          child: SafeArea(
            child: SizedBox.expand(
              child: Column(
                children: [
                  const Spacer(flex: 5),
                  const _Brand(),
                  const Spacer(flex: 4),
                  if (_error == null)
                    const _LoadingFooter()
                  else
                    _ErrorFooter(error: _error!, onRetry: _retry),
                  const SizedBox(height: 14),
                  Text(
                    'Phiên bản ${AppConfig.appVersion}',
                    style: TextStyle(color: AppColors.white.withValues(alpha: 0.3), fontSize: 11),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---- Phần riêng của S01 ----

/// Logo, tên, câu giới thiệu, nhãn "Dành cho nhân viên nhà hàng".
class _Brand extends StatelessWidget {
  const _Brand();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const FabLogoBadge(size: 90),
          const SizedBox(height: 26),
          Text(
            'Ngưu Quán',
            style: GoogleFonts.playfairDisplay(fontSize: 36, fontWeight: FontWeight.w700, color: AppColors.white),
          ),
          const SizedBox(height: 2),
          Text(
            'Hải sản tươi sống · Đà Nẵng',
            textAlign: TextAlign.center,
            style: GoogleFonts.playfairDisplay(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: const Color(0xFFBFE0F0),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'App phục vụ tại bàn',
            style: TextStyle(color: AppColors.ocean200.withValues(alpha: 0.8), fontSize: 14),
          ),
          const SizedBox(height: 22),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
            decoration: BoxDecoration(
              color: AppColors.ocean950.withValues(alpha: 0.75),
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(radius: 4, backgroundColor: AppColors.coral500),
                SizedBox(width: 10),
                Flexible(
                  child: FittedBox(
                    // máy hẹp thì chữ tự nhỏ lại, không xuống dòng
                    fit: BoxFit.scaleDown,
                    child: Text(
                      'DÀNH CHO NHÂN VIÊN NHÀ HÀNG',
                      maxLines: 1,
                      style: TextStyle(
                        color: Color(0xFFCDE6F2),
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Đang tải: vòng xoay + "Đang chuẩn bị phiên làm việc...".
class _LoadingFooter extends StatelessWidget {
  const _LoadingFooter();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox.square(
          dimension: 26,
          child: CircularProgressIndicator(
            strokeWidth: 3.5,
            color: AppColors.ocean200,
            backgroundColor: AppColors.white.withValues(alpha: 0.15),
          ),
        ),
        const SizedBox(height: 14),
        Text(
          'Đang chuẩn bị phiên làm việc...',
          style: TextStyle(color: AppColors.white.withValues(alpha: 0.6), fontSize: 13),
        ),
      ],
    );
  }
}

/// Tải lỗi: mất mạng hoặc lỗi server, có nút "Thử lại" (mục C01 docs/16).
class _ErrorFooter extends StatelessWidget {
  const _ErrorFooter({required this.error, required this.onRetry});

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final isNetwork = error is ApiException && (error as ApiException).isNetwork;
    final message = isNetwork
        ? 'Kiểm tra Wi-Fi hoặc 4G rồi thử lại'
        : (error is ApiException ? (error as ApiException).message : 'Đã có lỗi xảy ra, vui lòng thử lại');
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        children: [
          Icon(
            isNetwork ? Icons.wifi_off_rounded : Icons.error_outline_rounded,
            size: 34,
            color: AppColors.ocean200,
          ),
          const SizedBox(height: 8),
          Text(
            isNetwork ? 'Mất kết nối mạng' : 'Không tải được dữ liệu',
            style: const TextStyle(color: AppColors.white, fontSize: 16, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.white.withValues(alpha: 0.65), fontSize: 13),
          ),
          const SizedBox(height: 14),
          AppButton(label: 'Thử lại', size: AppButtonSize.medium, expand: false, onPressed: onRetry),
        ],
      ),
    );
  }
}

/// Hoa văn nền: 2 vòng tròn mảnh (1 liền, 1 nét đứt) và 1 đường sóng mờ ngang màn.
class _RingsPainter extends CustomPainter {
  const _RingsPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height * 0.5);
    final line = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Vòng liền
    canvas.drawCircle(center, size.width * 0.36, line..color = AppColors.white.withValues(alpha: 0.1));

    // Vòng nét đứt
    final dashed = Rect.fromCircle(center: center, radius: size.width * 0.47);
    const dashes = 72;
    for (var i = 0; i < dashes; i++) {
      final start = i * 2 * math.pi / dashes;
      canvas.drawArc(dashed, start, math.pi / dashes, false, line..color = AppColors.white.withValues(alpha: 0.06));
    }

    // Đường sóng ngang
    final y = size.height * 0.52;
    final wave = Path()..moveTo(0, y);
    for (var x = 0.0; x < size.width; x += 60) {
      wave.quadraticBezierTo(x + 15, y - 6, x + 30, y);
      wave.quadraticBezierTo(x + 45, y + 6, x + 60, y);
    }
    canvas.drawPath(wave, line..color = AppColors.white.withValues(alpha: 0.07));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
