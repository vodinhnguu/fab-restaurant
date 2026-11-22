// S06 – Khối "Đánh giá từ thực khách" (chỉ xem: nhân viên dùng để tư vấn món cho khách;
// khách viết đánh giá trên web sau khi đơn hoàn thành):
//   tiêu đề
//   ô tổng: điểm to "4.8", sao, "120 lượt đánh giá"
//   tối đa 20 đánh giá mới nhất: avatar chữ cái đầu, tên, "3 ngày trước", sao, nội dung
// Chưa có đánh giá: "Chưa có đánh giá".

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../models/dish.dart';
import '../../../models/review.dart';
import '../../../theme/app_colors.dart';
import '../../../utils/format.dart';
import '../../../widgets/star_rating.dart';

class DishReviews extends StatelessWidget {
  const DishReviews({super.key, required this.dish, required this.reviews});

  final Dish dish;
  final List<Review> reviews;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Đánh giá từ thực khách',
          style: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.ocean950),
        ),
        const SizedBox(height: 14),
        if (reviews.isEmpty)
          const _NoReviews()
        else ...[
          _Summary(dish),
          for (var i = 0; i < reviews.length; i++)
            Padding(padding: const EdgeInsets.only(top: 12), child: _ReviewCard(reviews[i], index: i)),
        ],
      ],
    );
  }
}

class _NoReviews extends StatelessWidget {
  const _NoReviews();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(color: AppColors.sand100, borderRadius: BorderRadius.circular(16)),
      child: const Column(
        children: [
          Icon(Icons.reviews_outlined, size: 36, color: AppColors.slate300),
          SizedBox(height: 8),
          Text('Chưa có đánh giá', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean900)),
        ],
      ),
    );
  }
}

/// Ô tổng: "4.8" + sao + "120 lượt đánh giá" + nhãn "chỉ khách đã nhận món mới đánh giá được".
class _Summary extends StatelessWidget {
  const _Summary(this.dish);
  final Dish dish;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.sand100, borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          Text(
            dish.ratingAvg.toStringAsFixed(1),
            style: GoogleFonts.playfairDisplay(fontSize: 36, fontWeight: FontWeight.w700, color: AppColors.ocean950),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                StarRating(dish.ratingAvg, size: 18),
                const SizedBox(height: 2),
                Text(
                  '${dish.ratingCount} lượt đánh giá',
                  style: const TextStyle(color: AppColors.slate500, fontSize: 12),
                ),
              ],
            ),
          ),
          // Backend chỉ nhận đánh giá của khách có đơn đã hoàn thành chứa món này.
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(999)),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified_outlined, size: 16, color: AppColors.success),
                  SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      'Từ khách đã nhận món',
                      style: TextStyle(color: AppColors.slate800, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard(this.review, {required this.index});
  final Review review;
  final int index; // xen kẽ màu avatar cho đỡ đơn điệu

  @override
  Widget build(BuildContext context) {
    final avatarColors = index.isEven
        ? (AppColors.ocean100, AppColors.ocean700)
        : (AppColors.coral50, AppColors.coral600);
    final comment = review.comment?.trim() ?? '';
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: avatarColors.$1,
                  child: Text(review.initial, style: TextStyle(color: avatarColors.$2, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review.userName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ocean950),
                      ),
                      Text(timeAgo(review.createdAt), style: const TextStyle(color: AppColors.slate500, fontSize: 12)),
                    ],
                  ),
                ),
                StarRating(review.rating.toDouble(), size: 15),
              ],
            ),
            if (comment.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(comment, style: const TextStyle(height: 1.5)),
            ],
          ],
        ),
      ),
    );
  }
}
