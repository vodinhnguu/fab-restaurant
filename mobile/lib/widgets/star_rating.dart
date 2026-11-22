// Hàng 5 ngôi sao chỉ để XEM (S06 điểm trung bình, từng đánh giá; S13).
// 4.6 → ★★★★ + nửa sao + ☆. Chọn số sao khi viết đánh giá là việc của S14.
//
//   StarRating(4.6)            // cỡ mặc định 16
//   StarRating(5, size: 14)

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class StarRating extends StatelessWidget {
  const StarRating(this.value, {super.key, this.size = 16});

  final double value; // 0..5
  final double size;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '${value.toStringAsFixed(1)} trên 5 sao',
      excludeSemantics: true,
      // Chỗ hẹp (chữ to, máy nhỏ) thì thu nhỏ hàng sao lại chứ không tràn.
      child: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.centerLeft,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 1; i <= 5; i++)
              Icon(
                value >= i
                    ? Icons.star_rounded
                    : value >= i - 0.5
                    ? Icons.star_half_rounded
                    : Icons.star_outline_rounded,
                size: size,
                color: AppColors.star,
              ),
          ],
        ),
      ),
    );
  }
}
