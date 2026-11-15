// Thông báo ngắn ở dưới màn hình (mục C01 docs/16): xanh lá = thành công, đỏ = lỗi,
// có thể kèm 1 nút ("Xem giỏ", "Hoàn tác").
//
// Gọi được ở bất cứ đâu, không cần context:
//   showAppSnack('Đã thêm "Tôm sú hấp bia" vào giỏ', action: 'Xem giỏ', onAction: () => ...);
//   showAppSnack(e.message, error: true);

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Gắn vào MaterialApp (main.dart) để hiện snackbar từ bất cứ đâu.
final appMessengerKey = GlobalKey<ScaffoldMessengerState>();

void showAppSnack(
  String message, {
  bool error = false,
  String? action,
  VoidCallback? onAction,
  Duration duration = const Duration(seconds: 3),
}) {
  final messenger = appMessengerKey.currentState;
  if (messenger == null) return;
  messenger
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(message),
      duration: duration,
      backgroundColor: error ? AppColors.danger : AppColors.success,
      showCloseIcon: action == null,
      closeIconColor: AppColors.white,
      action: action == null
          ? null
          : SnackBarAction(label: action, textColor: AppColors.white, onPressed: onAction ?? () {}),
    ));
}
