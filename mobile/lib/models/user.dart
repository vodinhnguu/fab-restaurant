// Người đang đăng nhập: khớp kết quả GET /auth/me, POST /auth/login (phần `user`).
// App chỉ dành cho nhân viên: tài khoản phải là STAFF / ADMIN và có quyền Xem "Đơn hàng & gọi món".

class User {
  const User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.role = 'CUSTOMER',
    this.staffRoleName,
    this.permissions = const {},
  });

  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role; // CUSTOMER / STAFF / ADMIN
  final String? staffRoleName; // "Nhân viên phục vụ", "Thu ngân"... (ADMIN thì null)

  /// Ma trận quyền backend trả về: { 'ORDERS': {'view', 'create', 'edit'}, ... }
  final Map<String, Set<String>> permissions;

  /// Có quyền [action] ('view' / 'create' / 'edit' / 'delete') trên chức năng [module] không.
  /// Chỉ để ẩn / hiện nút: backend vẫn tự kiểm tra lại.
  bool can(String module, String action) => permissions[module]?.contains(action) ?? false;

  /// Dùng được app: nhân viên / admin có quyền xem đơn hàng.
  bool get canUseApp => role != 'CUSTOMER' && can('ORDERS', 'view');

  /// Ghi món, gửi bếp (Phục vụ, Tổ trưởng, Quản lý...).
  bool get canTakeOrder => can('ORDERS', 'create');

  /// Đã lên món, thu tiền, hủy đơn (thêm Thu ngân, Tiếp thực).
  bool get canUpdateOrder => can('ORDERS', 'edit');

  /// Tên vai trò hiện ở Tài khoản.
  String get roleLabel => role == 'ADMIN' ? 'Quản trị viên' : (staffRoleName ?? 'Nhân viên');

  /// Chữ cái làm avatar. Tên Việt gọi theo chữ cuối: "Lý Phục Vụ" → "V".
  String get initial {
    final words = name.trim().split(RegExp(r'\s+'));
    final last = words.isEmpty ? '' : words.last;
    return last.isEmpty ? '?' : last.substring(0, 1).toUpperCase();
  }

  factory User.fromJson(Map<String, dynamic> json) {
    final perms = <String, Set<String>>{};
    final raw = json['permissions'];
    if (raw is Map) {
      for (final e in raw.entries) {
        final flags = e.value;
        if (flags is Map) {
          perms['${e.key}'] = {for (final f in flags.entries) if (f.value == true) '${f.key}'};
        }
      }
    }
    final staffRole = json['staffRole'];
    return User(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'CUSTOMER',
      staffRoleName: staffRole is Map ? staffRole['name'] as String? : null,
      permissions: perms,
    );
  }
}
