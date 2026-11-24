// Ảnh tải từ server (ảnh món, danh mục, banner).
// - Đường dẫn "/uploads/..." tự ghép địa chỉ server (utils/format.dart → imageUrl).
// - Không có ảnh / tải lỗi: ảnh giữ chỗ nền Ocean 100 chữ "FAB Seafood" (mục 2.4 docs/16).
//
//   AppNetworkImage(dish.image, borderRadius: BorderRadius.circular(12))

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../utils/format.dart';

class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage(this.src, {super.key, this.fit = BoxFit.cover, this.borderRadius});

  /// Đường dẫn ảnh như backend trả về (URL đầy đủ hoặc "/uploads/..."). null = không có ảnh.
  final String? src;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final url = imageUrl(src);
    final Widget image = url == null
        ? const _Placeholder()
        : Image.network(
            url,
            fit: fit,
            width: double.infinity,
            height: double.infinity,
            // Đang tải: nền nhạt, tải xong thì hiện dần
            frameBuilder: (context, child, frame, wasSyncLoaded) => wasSyncLoaded
                ? child
                : AnimatedOpacity(
                    opacity: frame == null ? 0 : 1,
                    duration: const Duration(milliseconds: 250),
                    child: child,
                  ),
            errorBuilder: (_, _, _) => const _Placeholder(),
          );

    final box = ColoredBox(color: AppColors.ocean100, child: image);
    return borderRadius == null ? box : ClipRRect(borderRadius: borderRadius!, child: box);
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder();

  @override
  Widget build(BuildContext context) => const ColoredBox(
        color: AppColors.ocean100,
        child: Center(
          child: Text(
            'Ngưu Quán',
            style: TextStyle(color: AppColors.ocean500, fontWeight: FontWeight.w700, fontSize: 13),
          ),
        ),
      );
}
