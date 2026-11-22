// Chi tiết 1 món (S06): khớp GET /dishes/:slug → món + category + reviews[] (20 mới nhất) + related[] (4 món).

import 'dish.dart';
import 'review.dart';

class DishDetail {
  const DishDetail({required this.dish, this.reviews = const [], this.related = const []});

  final Dish dish;
  final List<Review> reviews;

  /// "Có thể bạn cũng thích": món cùng danh mục, bán chạy trước.
  final List<Dish> related;

  factory DishDetail.fromJson(Map<String, dynamic> json) => DishDetail(
        dish: Dish.fromJson(json),
        reviews: [for (final r in json['reviews'] as List? ?? const []) Review.fromJson(r as Map<String, dynamic>)],
        // Backend không gửi kèm danh mục của món gợi ý, nhưng chúng cùng danh mục với món đang xem.
        related: [
          for (final d in json['related'] as List? ?? const [])
            Dish.fromJson({...d as Map<String, dynamic>, 'category': json['category']}),
        ],
      );
}
