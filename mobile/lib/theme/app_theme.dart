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
    final textTheme = GoogleFonts.beVietnamProTextTheme(base.textTheme).apply(
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

      // Thanh tab dưới: tab đang chọn màu Ocean 900, nền đánh dấu Coral 50.
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: AppColors.coral50,
        height: 68,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => textTheme.labelSmall?.copyWith(
            fontWeight: states.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w500,
            color: states.contains(WidgetState.selected) ? AppColors.ocean900 : AppColors.slate500,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected) ? AppColors.coral500 : AppColors.slate500,
          ),
        ),
      ),

      snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating),
      dividerTheme: const DividerThemeData(color: AppColors.slate200, space: 1),
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
