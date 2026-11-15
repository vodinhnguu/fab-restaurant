// Các trạng thái chung của mọi màn hình (mục C01 docs/16):
// đang tải, danh sách trống, lỗi tải, mất mạng.
//
// Cách dùng nhanh nhất với Riverpod: AsyncView lo sẵn cả 3 trạng thái.
//   AsyncView(
//     value: ref.watch(infoProvider),
//     onRetry: () => ref.invalidate(infoProvider),
//     data: (info) => Text(info.phone),
//   )

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/api_exception.dart';
import '../theme/app_colors.dart';

/// Tự hiện "đang tải" / "lỗi" (hoặc "mất mạng") / dữ liệu theo [value].
class AsyncView<T> extends StatelessWidget {
  const AsyncView({super.key, required this.value, required this.data, this.onRetry, this.loading});

  final AsyncValue<T> value;
  final Widget Function(T data) data;

  /// Nút "Thử lại" khi lỗi. Thường là: () => ref.invalidate(xxxProvider)
  final VoidCallback? onRetry;

  /// Khung xương (skeleton) riêng của màn. Không truyền thì hiện vòng xoay.
  final Widget? loading;

  @override
  Widget build(BuildContext context) {
    return value.when(
      // Đang tải lại mà đã có dữ liệu cũ (kéo xuống để tải lại) thì vẫn hiện dữ liệu cũ.
      skipLoadingOnRefresh: true,
      skipLoadingOnReload: true,
      loading: () => loading ?? const LoadingView(),
      error: (error, _) => ErrorView(error: error, onRetry: onRetry),
      data: data,
    );
  }
}

/// Vòng xoay ở giữa (khi chưa có khung xương riêng).
class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) => const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(color: AppColors.coral500),
        ),
      );
}

/// Danh sách trống: icon lớn xám + tiêu đề + mô tả + 1 nút (chữ ghi ở từng màn).
class EmptyView extends StatelessWidget {
  const EmptyView({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 64, color: AppColors.slate300),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.ocean900),
            ),
            if (message != null) ...[
              const SizedBox(height: 6),
              Text(message!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.slate500)),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 20),
              FilledButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}

/// Lỗi tải. Mất mạng thì hiện "Mất kết nối mạng", lỗi khác thì "Không tải được dữ liệu" + câu lỗi backend.
class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.error, this.onRetry});

  final Object error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final isNetwork = error is ApiException && (error as ApiException).isNetwork;
    return EmptyView(
      icon: isNetwork ? Icons.wifi_off_rounded : Icons.error_outline_rounded,
      title: isNetwork ? 'Mất kết nối mạng' : 'Không tải được dữ liệu',
      message: isNetwork ? 'Kiểm tra Wi-Fi hoặc 4G rồi thử lại' : _messageOf(error),
      actionLabel: onRetry == null ? null : 'Thử lại',
      onAction: onRetry,
    );
  }

  static String _messageOf(Object error) =>
      error is ApiException ? error.message : 'Đã có lỗi xảy ra, vui lòng thử lại';
}

/// Một khối xám nhạt để ghép thành khung xương (skeleton) lúc đang tải lần đầu.
///   Column(children: [SkeletonBox(height: 120), SkeletonBox(width: 80, height: 14)])
class SkeletonBox extends StatelessWidget {
  const SkeletonBox({super.key, this.width, this.height = 16, this.radius = 12});

  final double? width;
  final double height;
  final double radius;

  @override
  Widget build(BuildContext context) => Container(
        width: width,
        height: height,
        decoration: BoxDecoration(color: AppColors.slate200, borderRadius: BorderRadius.circular(radius)),
      );
}
