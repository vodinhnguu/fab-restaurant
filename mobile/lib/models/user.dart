// Người dùng đang đăng nhập: khớp kết quả GET /auth/me, POST /auth/login (phần `user`).

class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.address,
    this.role = 'CUSTOMER',
  });

  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? address; // địa chỉ mặc định, điền sẵn ở S09
  final String role; // CUSTOMER / STAFF / ADMIN (app khách coi như nhau)

  /// Chữ cái làm avatar (mục 1.4: không có ảnh đại diện).
  /// Tên Việt gọi theo chữ cuối: "Nguyễn Văn An" → "A".
  String get initial {
    final words = name.trim().split(RegExp(r'\s+'));
    final last = words.isEmpty ? '' : words.last;
    return last.isEmpty ? '?' : last.substring(0, 1).toUpperCase();
  }

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        email: json['email'] as String? ?? '',
        phone: json['phone'] as String?,
        address: json['address'] as String?,
        role: json['role'] as String? ?? 'CUSTOMER',
      );
}
