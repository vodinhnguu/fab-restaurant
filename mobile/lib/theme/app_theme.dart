// Giao diện chung của app: font, nút, ô nhập, chip, thẻ.
// Lấy theo mục 2.2 (chữ) và 2.3 (hình khối) docs/16-dac-ta-app-mobile-stitch.md.
//
// Nhờ file này, trong màn hình chỉ cần viết FilledButton(...) là ra nút cam
// đúng chuẩn, không phải tự đặt màu, chiều cao, bo góc từng nút.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    final base = ThemeData(useMaterial3: true, brightness: Brightness.light);

    // Chữ thường: Be Vietnam Pro, màu Slate 800.
    // Bỏ khoảng giãn giữa các chữ cái mặc định của Material 3: tiếng Việt có dấu nhìn
    // tự nhiên hơn, và chữ trên nút / chip không bị xuống dòng trên máy rộng 360.
    final textTheme = _noLetterSpacing(GoogleFonts.beVietnamProTextTheme(base.textTheme)).apply(
      bodyColor: AppColors.slate800,
      displayColor: AppColors.ocean900,
    );

    const radius12 = BorderRadius.all(Radius.circular(12));

    return base.copyWith(
      colorScheme: const ColorScheme.light(
        primary: AppColors.ocean900,
        onPrimary: AppColors.white,
        secondary: AppColors.coral500,
        onSecondary: AppColors.white,
        error: AppColors.danger,
        surface: AppColors.white,
        onSurface: AppColors.slate800,
        outline: AppColors.slate300,
        outlineVariant: AppColors.slate200,
      ),
      scaffoldBackgroundColor: AppColors.sand50,
      textTheme: textTheme,

      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.sand50,
        foregroundColor: AppColors.ocean900,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: textTheme.titleLarge?.copyWith(
          color: AppColors.ocean900,
          fontWeight: FontWeight.w700,
          fontSize: 18,
        ),
      ),

      // Thẻ: nền trắng, bo 16, viền mảnh Slate 200 (70%), bóng rất nhẹ.
      cardTheme: CardThemeData(
        color: AppColors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: const BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: AppColors.slate200.withValues(alpha: 0.7)),
        ),
      ),

      // Nút chính: nền Coral 500, chữ trắng, cao 48, bo 12.
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.coral500,
          foregroundColor: AppColors.white,
          disabledBackgroundColor: AppColors.slate200,
          disabledForegroundColor: AppColors.slate500,
          minimumSize: const Size(64, 48),
          shape: const RoundedRectangleBorder(borderRadius: radius12),
          textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),

      // Nút viền: viền Slate 300, nền trắng.
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.ocean900,
          backgroundColor: AppColors.white,
          minimumSize: const Size(64, 48),
          side: const BorderSide(color: AppColors.slate300),
          shape: const RoundedRectangleBorder(borderRadius: radius12),
          textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.coral600,
          textStyle: textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
        ),
      ),

      // Ô nhập: cao 44, bo 12, viền Slate 300; lỗi thì viền đỏ + dòng lỗi đỏ bên dưới.
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        isDense: true,
        contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: radius12,
          borderSide: BorderSide(color: AppColors.slate300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: radius12,
          borderSide: BorderSide(color: AppColors.slate300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: radius12,
          borderSide: BorderSide(color: AppColors.ocean500, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: radius12,
          borderSide: BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: radius12,
          borderSide: BorderSide(color: AppColors.danger, width: 1.5),
        ),
        hintStyle: TextStyle(color: AppColors.slate500),
        errorStyle: TextStyle(color: AppColors.danger, fontSize: 12),
      ),

      // Chip lọc: bo tròn hẳn; đang chọn nền Ocean 900 chữ trắng, chưa chọn nền trắng viền Slate 200.
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.white,
        selectedColor: AppColors.ocean900,
        labelStyle: textTheme.labelLarge?.copyWith(color: AppColors.slate800),
        secondaryLabelStyle: textTheme.labelLarge?.copyWith(color: AppColors.white),
        side: const BorderSide(color: AppColors.slate200),
        shape: const StadiumBorder(),
        showCheckmark: false,
      ),

      // Menu trái (lib/app/app_drawer.dart): nền trắng, không ám màu.
      drawerTheme: const DrawerThemeData(
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        width: 300,
      ),

      snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating),
      dividerTheme: const DividerThemeData(color: AppColors.slate200, space: 1),
    );
  }

  /// Đặt letterSpacing = 0 cho mọi kiểu chữ.
  /// (Không dùng apply(letterSpacingFactor: 0) vì kiểu chữ nào chưa có letterSpacing sẽ báo lỗi
  /// ở bản debug.)
  static TextTheme _noLetterSpacing(TextTheme t) {
    TextStyle? zero(TextStyle? s) => s?.copyWith(letterSpacing: 0);
    return t.copyWith(
      displayLarge: zero(t.displayLarge),
      displayMedium: zero(t.displayMedium),
      displaySmall: zero(t.displaySmall),
      headlineLarge: zero(t.headlineLarge),
      headlineMedium: zero(t.headlineMedium),
      headlineSmall: zero(t.headlineSmall),
      titleLarge: zero(t.titleLarge),
      titleMedium: zero(t.titleMedium),
      titleSmall: zero(t.titleSmall),
      bodyLarge: zero(t.bodyLarge),
      bodyMedium: zero(t.bodyMedium),
      bodySmall: zero(t.bodySmall),
      labelLarge: zero(t.labelLarge),
      labelMedium: zero(t.labelMedium),
      labelSmall: zero(t.labelSmall),
    );
  }
}

/// Kiểu chữ tiêu đề lớn (Playfair Display, đậm): tên trang, tên món ở chi tiết,
/// câu chào trang chủ. Chữ thường đã có sẵn trong Theme (Be Vietnam Pro).
class AppText {
  AppText._();

  /// Tiêu đề trang: cỡ 26.
  static TextStyle pageTitle([Color color = AppColors.ocean900]) =>
      GoogleFonts.playfairDisplay(fontSize: 26, fontWeight: FontWeight.w700, color: color);

  /// Tiêu đề khối: cỡ 18.
  static TextStyle sectionTitle([Color color = AppColors.ocean900]) =>
      GoogleFonts.beVietnamPro(fontSize: 18, fontWeight: FontWeight.w700, color: color);

  /// Mã đơn, mã đặt bàn: chữ đơn cách, vd FAB261027123456.
  static const code = TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600, letterSpacing: 0.5);
}
