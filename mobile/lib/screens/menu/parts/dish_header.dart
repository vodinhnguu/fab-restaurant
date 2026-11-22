// S06 – Phần thông tin món: danh mục, tên món, sao | đã bán, giá (+ giá gốc, % giảm), mô tả.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../models/dish.dart';
import '../../../theme/app_colors.dart';
import '../../../utils/format.dart';

/// Danh mục, tên món, sao | đã bán, giá.
class DishHeader extends StatelessWidget {
  const DishHeader(this.dish, {super.key});
  final Dish dish;

  @override
  Widget build(BuildContext context) {
    const muted = TextStyle(color: AppColors.slate500, fontSize: 13);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (dish.categoryName != null)
          Text(
            dish.categoryName!.toUpperCase(),
            style: const TextStyle(
              color: AppColors.ocean500,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
        const SizedBox(height: 4),
        Text(
          dish.name,
          style: GoogleFonts.playfairDisplay(
            fontSize: 28,
            height: 1.25,
            fontWeight: FontWeight.w700,
            color: AppColors.ocean950,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: AppColors.sand100, borderRadius: BorderRadius.circular(999)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.star_rounded, size: 16, color: AppColors.star),
                  const SizedBox(width: 4),
                  if (dish.ratingCount > 0)
                    Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: dish.ratingAvg.toStringAsFixed(1),
                            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.slate800, fontSize: 13),
                          ),
                          TextSpan(text: ' (${dish.ratingCount} đánh giá)', style: muted),
                        ],
                      ),
                    )
                  else
                    const Text('Chưa có đánh giá', style: muted),
                ],
              ),
            ),
            if (dish.soldCount > 0)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.local_fire_department_outlined, size: 16, color: AppColors.coral500),
                  const SizedBox(width: 4),
                  Text('Đã bán ${dish.soldCount} ${dish.unit}', style: muted),
                ],
              ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Wrap(
                spacing: 10,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: formatMoney(dish.effectivePrice),
                          style: const TextStyle(color: AppColors.coral600, fontSize: 26, fontWeight: FontWeight.w800),
                        ),
                        TextSpan(text: ' / ${dish.unit}', style: muted.copyWith(fontSize: 15)),
                      ],
                    ),
                  ),
                  if (dish.isOnSale)
                    Text(
                      formatMoney(dish.price),
                      style: muted.copyWith(
                        decoration: TextDecoration.lineThrough,
                        decorationColor: AppColors.slate500,
                      ),
                    ),
                ],
              ),
            ),
            if (dish.isOnSale)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: AppColors.coral50, borderRadius: BorderRadius.circular(999)),
                child: Text(
                  '-${dish.discountPercent}%',
                  style: const TextStyle(color: AppColors.coral600, fontWeight: FontWeight.w700, fontSize: 13),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class DishDescription extends StatelessWidget {
  const DishDescription(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.sand100, borderRadius: BorderRadius.circular(16)),
        child: Text(text, style: const TextStyle(fontSize: 15, height: 1.6)),
      );
}
