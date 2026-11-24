// Logo FAB Seafood (theo thiết kế Stitch, design/S01.png):
// con cá màu cam đào viền trắng, chấm cam phía trên, 2 làn sóng phía dưới.
// Vẽ bằng code (CustomPainter) nên không cần file ảnh, phóng to thu nhỏ vẫn nét.
//
//   const FabFishMark(size: 56)                    // chỉ hình con cá
//   const FabLogoBadge(size: 90)                   // con cá trong vòng tròn tối phát sáng (Splash)
//   const FabLogoTile(size: 44)                    // con cá trong ô vuông tối (thanh trên S04)
//   const FabLogo()                                // hình + chữ "FAB Seafood" (S02, S03, thanh trên S04)

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Màu thân cá (cam đào) trong thiết kế.
const _fishPeach = Color(0xFFF7C1A9);

/// Chỉ hình con cá + sóng.
class FabFishMark extends StatelessWidget {
  const FabFishMark({super.key, this.size = 48});
  final double size;

  @override
  Widget build(BuildContext context) =>
      SizedBox.square(dimension: size, child: const CustomPaint(painter: _FishPainter()));
}

/// Con cá trong vòng tròn tối có quầng sáng nhẹ (S01 Splash).
class FabLogoBadge extends StatelessWidget {
  const FabLogoBadge({super.key, this.size = 90});
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFF123F5A),
        border: Border.all(color: AppColors.white.withValues(alpha: 0.08)),
        boxShadow: [
          // quầng sáng xanh nhạt quanh vòng tròn
          BoxShadow(color: AppColors.ocean200.withValues(alpha: 0.18), blurRadius: 36, spreadRadius: 6),
        ],
      ),
      alignment: Alignment.center,
      child: FabFishMark(size: size * 0.66),
    );
  }
}

/// Con cá trong ô vuông bo góc nền Ocean 900 (thanh trên S04, giống biểu tượng app).
class FabLogoTile extends StatelessWidget {
  const FabLogoTile({super.key, this.size = 44});
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: AppColors.ocean900, borderRadius: BorderRadius.circular(size * 0.28)),
      alignment: Alignment.center,
      child: FabFishMark(size: size * 0.72),
    );
  }
}

/// Hình con cá + chữ "FAB Seafood".
class FabLogo extends StatelessWidget {
  const FabLogo({super.key, this.fontSize = 22, this.vertical = false, this.onDark = false});

  final double fontSize;

  /// true = hình nằm trên chữ (Đăng nhập, Đăng ký); false = hình bên trái chữ (thanh trên).
  final bool vertical;

  /// true = đặt trên nền tối → chữ trắng.
  final bool onDark;

  @override
  Widget build(BuildContext context) {
    final mark = vertical ? FabLogoBadge(size: fontSize * 2.6) : FabFishMark(size: fontSize * 1.5);
    final text = Text(
      'Ngưu Quán',
      style: AppText.pageTitle(onDark ? AppColors.white : AppColors.ocean900).copyWith(fontSize: fontSize),
    );
    return vertical
        ? Column(mainAxisSize: MainAxisSize.min, children: [mark, SizedBox(height: fontSize * 0.5), text])
        : Row(mainAxisSize: MainAxisSize.min, children: [mark, const SizedBox(width: 8), text]);
  }
}

/// Vẽ trên khung 100 × 100 rồi phóng theo kích thước thật.
class _FishPainter extends CustomPainter {
  const _FishPainter();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.scale(size.width / 100, size.height / 100);

    final stroke = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Chấm cam phía trên (như bọt nước / mặt trời)
    canvas.drawCircle(const Offset(54, 16), 4.5, Paint()..color = AppColors.coral500);

    // Thân cá + đuôi
    final body = Path()
      ..moveTo(16, 47)
      ..quadraticBezierTo(38, 25, 68, 40)
      ..lineTo(86, 29)
      ..lineTo(81, 46)
      ..lineTo(86, 62)
      ..lineTo(68, 52)
      ..quadraticBezierTo(38, 66, 16, 47)
      ..close();
    canvas.drawPath(body, Paint()..color = _fishPeach);
    canvas.drawPath(body, stroke
      ..color = AppColors.white
      ..strokeWidth = 3.5);

    // Mang cá + mắt
    canvas.drawPath(
      Path()
        ..moveTo(36, 37)
        ..quadraticBezierTo(41, 46, 36, 56),
      stroke
        ..color = AppColors.ocean900
        ..strokeWidth = 2.6,
    );
    canvas.drawCircle(const Offset(26, 44), 2.8, Paint()..color = AppColors.ocean950);

    // 2 làn sóng dài, mềm phía dưới (mỗi đường 2 nhịp)
    Path wave(double y, double from, double to) {
      final half = (to - from) / 4; // nửa nhịp sóng
      final p = Path()..moveTo(from, y);
      for (var i = 0; i < 4; i++) {
        final x = from + i * half;
        p.quadraticBezierTo(x + half / 2, i.isEven ? y - 4.5 : y + 4.5, x + half, y);
      }
      return p;
    }

    canvas.drawPath(wave(74, 12, 88), stroke
      ..color = AppColors.white
      ..strokeWidth = 4.5);
    canvas.drawPath(wave(86, 22, 78), stroke
      ..color = AppColors.ocean200
      ..strokeWidth = 3.5);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
