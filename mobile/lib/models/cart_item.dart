// 1 dòng trong giỏ hàng. Giỏ lưu trên máy, không có API giỏ hàng (mục S08, mục 4 docs/16).
// Giá ở đây CHỈ ĐỂ HIỂN THỊ: backend tính lại khi đặt đơn.

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
    this.note = '',
  });

  final int dishId;
  final String name;
  final String slug; // mở lại S06
  final int price; // giá bán lúc thêm vào giỏ (salePrice nếu có, không thì price)
  final String? image;
  final String? unit; // "đĩa", "phần"...
  final String? category; // tên danh mục, để S07 gợi ý ghi chú theo loại món
  final int quantity;
  final String note; // ghi chú khẩu vị riêng của món (S07), tối đa 200 ký tự

  int get lineTotal => price * quantity;

  CartItem copyWith({int? quantity, String? note}) => CartItem(
        dishId: dishId,
        name: name,
        slug: slug,
        price: price,
        image: image,
        unit: unit,
        category: category,
        quantity: quantity ?? this.quantity,
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
        note: json['note'] as String? ?? '',
      );
}
