// Danh mục món: khớp GET /categories (kèm _count.dishes = số món).

class Category {
  const Category({required this.id, required this.name, required this.slug, this.image, this.dishCount = 0});

  final int id;
  final String name; // "Tôm"
  final String slug; // "tom": dùng để lọc ở S05
  final String? image;
  final int dishCount; // "15 món"

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        slug: json['slug'] as String? ?? '',
        image: json['image'] as String?,
        dishCount: (json['_count'] as Map<String, dynamic>?)?['dishes'] as int? ?? 0,
      );
}
