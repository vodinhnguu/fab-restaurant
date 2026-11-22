// Đánh giá món: khớp phần tử reviews[] của GET /dishes/:slug (kèm user.name).
// Backend chỉ cho khách đã đặt và nhận món (đơn COMPLETED) viết đánh giá, mỗi người 1 lần / món.

import '../utils/format.dart';

class Review {
  const Review({required this.id, required this.rating, required this.userName, this.comment, this.createdAt});

  final int id;
  final int rating; // 1..5
  final String userName;
  final String? comment;
  final DateTime? createdAt;

  /// Chữ cái đầu của tên, làm avatar ("Hoàng Nam" → "H").
  String get initial => userName.trim().isEmpty ? '?' : userName.trim()[0].toUpperCase();

  factory Review.fromJson(Map<String, dynamic> json) => Review(
        id: json['id'] as int,
        rating: json['rating'] as int? ?? 0,
        userName: (json['user'] as Map<String, dynamic>?)?['name'] as String? ?? 'Khách',
        comment: json['comment'] as String?,
        createdAt: parseApiDate(json['createdAt']),
      );
}
