// Nút chuẩn của app (mục 2.3 docs/16): cao 48 / 40 / 32, bo 12.
// Đang gửi ([loading] = true): hiện vòng xoay, khóa nút, không bấm lần 2 được (mục C01).
//
//   AppButton(label: 'Đăng nhập', loading: _sending, onPressed: _submit)
//   AppButton(label: 'Đổi mật khẩu', kind: AppButtonKind.dark, onPressed: ...)
//   AppButton(label: 'Đăng ký', kind: AppButtonKind.outline, onPressed: ...)
//   AppButton(label: 'Hủy đơn', kind: AppButtonKind.danger, onPressed: ...)

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

enum AppButtonKind {
  primary, // nền Coral 500, chữ trắng: nút chính
  dark, // nền Ocean 900, chữ trắng
  outline, // nền trắng, viền Slate 300
  soft, // nền cát nhạt, chữ Ocean 900 (vd "Gọi ngay" ở S04)
  danger, // nền đỏ: hủy, xóa
}

enum AppButtonSize {
  large(48), // nút to, rộng hết
  medium(40),
  small(32);

  const AppButtonSize(this.height);
  final double height;
}

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.kind = AppButtonKind.primary,
    this.size = AppButtonSize.large,
    this.loading = false,
    this.icon,
    this.iconColor,
    this.trailingIcon,
    this.expand = true,
  });

  /// Màu riêng cho icon (vd icon điện thoại cam trên nút nền cát). null = cùng màu chữ.
  final Color? iconColor;

  final String label;

  /// null = nút mờ, không bấm được.
  final VoidCallback? onPressed;
  final AppButtonKind kind;
  final AppButtonSize size;
  final bool loading;

  /// Icon trước chữ, vd icon chỉ đường.
  final IconData? icon;

  /// Icon sau chữ, vd mũi tên "Đặt bàn ngay →".
  final IconData? trailingIcon;

  /// true = rộng hết chiều ngang.
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final isOutline = kind == AppButtonKind.outline;
    final contentColor = isOutline || kind == AppButtonKind.soft ? AppColors.ocean900 : AppColors.white;

    final child = loading
        ? SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2.5, color: contentColor),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[Icon(icon, size: 20, color: iconColor), const SizedBox(width: 8)],
              Flexible(child: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis)),
              if (trailingIcon != null) ...[const SizedBox(width: 8), Icon(trailingIcon, size: 20)],
            ],
          );

    final minSize = Size(expand ? double.infinity : 64, size.height);
    final textStyle = TextStyle(fontSize: size == AppButtonSize.small ? 13 : 15, fontWeight: FontWeight.w600);
    // Nút nhỏ hơn thì lề trong hẹp hơn, để 2 nút đặt cạnh nhau không bị cắt chữ.
    final padding = EdgeInsets.symmetric(
      horizontal: switch (size) {
        AppButtonSize.large => 20,
        AppButtonSize.medium => 12,
        AppButtonSize.small => 10,
      },
    );

    final Widget button = isOutline
        ? OutlinedButton(
            onPressed: onPressed,
            style: OutlinedButton.styleFrom(minimumSize: minSize, textStyle: textStyle, padding: padding),
            child: child,
          )
        : FilledButton(
            onPressed: onPressed,
            style: FilledButton.styleFrom(
              minimumSize: minSize,
              textStyle: textStyle,
              padding: padding,
              backgroundColor: switch (kind) {
                AppButtonKind.dark => AppColors.ocean900,
                AppButtonKind.danger => AppColors.danger,
                AppButtonKind.soft => AppColors.sand100,
                _ => AppColors.coral500,
              },
              foregroundColor: contentColor,
            ),
            child: child,
          );

    // Đang gửi: chặn bấm nhưng giữ nguyên màu nút (không bị xám như nút tắt).
    return IgnorePointer(ignoring: loading, child: button);
  }
}
