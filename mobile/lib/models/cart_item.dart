// 1 dòng trong phiếu gọi món. Phiếu lưu trên máy, không có API phiếu (mục S08).
// Giá ở đây CHỈ ĐỂ HIỂN THỊ: backend tính lại khi gửi bếp.
//
// Món theo phần: số phần [quantity] (mặc định 1, số nguyên).
// Món theo kg (hải sản sống, docs/24): số kg [weight] (mặc định 1 kg, sửa được số lẻ vd 0,98), quantity luôn = 1.

class CartItem {
  const CartItem({
    required this.dishId,
    required this.name,
    required this.slug,
    required this.price,
    this.image,
    this.unit,
    this.category,
    this.quantity = 1,
    this.weight = 1,
    this.note = '',
  });

  final int dishId;
  final String name;
  final String slug; // mở lại S06
  final int price; // giá bán lúc thêm vào phiếu (salePrice nếu có, không thì price). Món theo kg: giá 1 kg
  final String? image;
  final String? unit; // "đĩa", "phần", "kg"...
  final String? category; // tên danh mục, để S07 gợi ý ghi chú theo loại món
  final int quantity;
  final double weight; // số kg phục vụ ghi (chỉ dùng cho món theo kg)
  final String note; // ghi chú khẩu vị riêng của món (S07), tối đa 200 ký tự

  /// Món bán theo kg (hải sản sống): price là giá 1 kg, phục vụ cân tại hồ cùng khách rồi nhập số kg thật (S14).
  bool get soldByWeight => unit == 'kg';

  /// Tiền tạm tính của dòng: món theo kg = giá 1 kg × số kg đang ghi (làm tròn đồng), món theo phần = giá × số phần.
  int get lineTotal => soldByWeight ? (price * weight).round() : price * quantity;

  CartItem copyWith({int? quantity, double? weight, String? note}) => CartItem(
        dishId: dishId,
        name: name,
        slug: slug,
        price: price,
        image: image,
        unit: unit,
        category: category,
        quantity: quantity ?? this.quantity,
        weight: weight ?? this.weight,
        note: note ?? this.note,
      );

  Map<String, dynamic> toJson() => {
        'dishId': dishId,
        'name': name,
        'slug': slug,
        'price': price,
        'image': image,
        'unit': unit,
        'category': category,
        'quantity': quantity,
        'weight': weight,
        'note': note,
      };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        dishId: json['dishId'] as int,
        name: json['name'] as String? ?? '',
        slug: json['slug'] as String? ?? '',
        price: json['price'] as int? ?? 0,
        image: json['image'] as String?,
        unit: json['unit'] as String?,
        category: json['category'] as String?,
        quantity: json['quantity'] as int? ?? 1,
        weight: (json['weight'] as num?)?.toDouble() ?? 1, // phiếu lưu từ bản cũ chưa có số kg: 1 kg
        note: json['note'] as String? ?? '',
      );
}
