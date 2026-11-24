// Món ăn: khớp GET /dishes (danh sách) và GET /dishes/:slug (chi tiết).
// Bảng Dish chỉ có các trường dưới đây: không có "thời gian chế biến", "nguồn gốc"... (docs/19 mục 7).

import 'cart_item.dart';

class Dish {
  const Dish({
    required this.id,
    required this.name,
    required this.slug,
    required this.price,
    this.salePrice,
    this.description,
    this.unit = 'phần',
    this.image,
    this.isAvailable = true,
    this.isFeatured = false,
    this.soldCount = 0,
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.categoryName,
    this.categorySlug,
    this.tankStockKg,
    this.tankLowKg,
    this.tankName,
  });

  final int id;
  final String name;
  final String slug;
  final int price; // giá gốc
  final int? salePrice; // giá khuyến mãi (nếu có)
  final String? description;
  final String unit; // "phần", "đĩa"...
  final String? image;
  final bool isAvailable;
  final bool isFeatured; // nhãn "Best seller" (admin bật ở trang Món ăn)
  final int soldCount;
  final double ratingAvg;
  final int ratingCount;
  final String? categoryName;
  final String? categorySlug;

  // ---- Tồn hồ hải sản, chỉ món bán theo kg (docs/27-ton-ho-hai-san.md) ----
  /// Số kg loại hải sản này còn trong hồ. null = món theo phần, hoặc món chưa gắn loại hồ nào.
  final double? tankStockKg;

  /// Dưới số kg này thì coi là "gần hết" (hồ hải sản đặt trên web).
  final double? tankLowKg;

  /// Tên loại hải sản trong hồ (vd "Cua gạch"): nhiều món dùng chung 1 loại.
  final String? tankName;

  /// Hồ hết loại này (phục vụ vẫn ghi món được, chỉ là nhắc để khỏi hứa với khách).
  bool get tankEmpty => tankStockKg != null && tankStockKg! <= 0;

  /// Hồ gần hết loại này.
  bool get tankLow => tankStockKg != null && tankLowKg != null && tankStockKg! > 0 && tankStockKg! <= tankLowKg!;

  /// Giá bán thật: giá khuyến mãi nếu có, không thì giá gốc (mục 3 docs/16).
  int get effectivePrice => salePrice ?? price;

  /// Hải sản sống bán theo kg: giá là giá 1 kg, tiền tính sau khi phục vụ cân tại hồ và nhập số kg (docs/24).
  bool get soldByWeight => unit == 'kg';

  /// Đang giảm giá (giá khuyến mãi thấp hơn giá gốc).
  bool get isOnSale => salePrice != null && salePrice! < price;

  /// Phần trăm giảm, làm tròn: 290.000 → 250.000 = 14%.
  int get discountPercent => isOnSale ? ((price - salePrice!) * 100 / price).round() : 0;

  /// Dòng phiếu gọi món từ món này. [quantity] phần (món theo phần) hoặc [weight] kg (món theo kg, mặc định 1 kg),
  /// kèm [note] khẩu vị (nếu có).
  CartItem toCartItem({int quantity = 1, double weight = 1, String note = ''}) => CartItem(
        dishId: id,
        name: name,
        slug: slug,
        price: effectivePrice,
        image: image,
        unit: unit,
        category: categoryName,
        quantity: soldByWeight ? 1 : quantity,
        weight: weight,
        note: note,
      );

  factory Dish.fromJson(Map<String, dynamic> json) {
    final category = json['category'] as Map<String, dynamic>?;
    final tank = json['tankItem'] as Map<String, dynamic>?; // tồn hồ, chỉ món bán theo kg
    return Dish(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      price: json['price'] as int? ?? 0,
      salePrice: json['salePrice'] as int?,
      description: json['description'] as String?,
      unit: json['unit'] as String? ?? 'phần',
      image: json['image'] as String?,
      isAvailable: json['isAvailable'] as bool? ?? true,
      isFeatured: json['isFeatured'] as bool? ?? false,
      soldCount: json['soldCount'] as int? ?? 0,
      ratingAvg: (json['ratingAvg'] as num?)?.toDouble() ?? 0,
      ratingCount: json['ratingCount'] as int? ?? 0,
      categoryName: category?['name'] as String?,
      categorySlug: category?['slug'] as String?,
      tankStockKg: (tank?['stockKg'] as num?)?.toDouble(),
      tankLowKg: (tank?['lowStockKg'] as num?)?.toDouble(),
      tankName: tank?['name'] as String?,
    );
  }
}
