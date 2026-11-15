// Kiểm tra ô nhập, trả về câu lỗi (null = hợp lệ). Quy tắc khớp backend (*.validation.js)
// và câu báo lỗi lấy đúng bảng "Kiểm tra" của từng màn trong docs/16.
//
// Dùng thẳng làm validator của TextFormField:
//   TextFormField(validator: Validators.email)
//   TextFormField(validator: (v) => Validators.phone(v, required: false))

class Validators {
  Validators._();

  static final _emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

  /// Giống backend: bắt đầu bằng 0 hoặc +84, sau đó 9–10 chữ số.
  static final _phoneRegex = RegExp(r'^(0|\+84)\d{9,10}$');

  /// Bỏ dấu cách, chấm, gạch trong SĐT trước khi kiểm tra / gửi lên: "090 123 4567" → "0901234567".
  static String normalizePhone(String? value) => (value ?? '').replaceAll(RegExp(r'[\s.\-]'), '');

  /// Ô bắt buộc chung.
  static String? required(String? value, [String message = 'Vui lòng nhập thông tin này']) =>
      (value ?? '').trim().isEmpty ? message : null;

  /// Họ tên: 2–100 ký tự.
  static String? name(String? value) {
    final v = (value ?? '').trim();
    if (v.isEmpty) return 'Vui lòng nhập họ tên';
    if (v.length < 2) return 'Tối thiểu 2 ký tự';
    if (v.length > 100) return 'Tối đa 100 ký tự';
    return null;
  }

  /// Email. [required] = false: để trống được (ô "Email (không bắt buộc)" ở S17).
  static String? email(String? value, {bool required = true}) {
    final v = (value ?? '').trim();
    if (v.isEmpty) return required ? 'Vui lòng nhập email' : null;
    return _emailRegex.hasMatch(v) ? null : 'Email không hợp lệ';
  }

  /// Số điện thoại. [required] = false: để trống được (S03, S23).
  static String? phone(String? value, {bool required = true}) {
    final v = normalizePhone(value);
    if (v.isEmpty) return required ? 'Vui lòng nhập số điện thoại' : null;
    return _phoneRegex.hasMatch(v) ? null : 'Số điện thoại không hợp lệ';
  }

  /// Mật khẩu khi đăng nhập: chỉ cần không trống.
  static String? loginPassword(String? value) =>
      (value ?? '').isEmpty ? 'Vui lòng nhập mật khẩu' : null;

  /// Mật khẩu mới (S03, S24): 6–100 ký tự.
  static String? newPassword(String? value, {String tooShort = 'Tối thiểu 6 ký tự'}) {
    final v = value ?? '';
    if (v.length < 6) return tooShort;
    if (v.length > 100) return 'Tối đa 100 ký tự';
    return null;
  }

  /// Ô nhập lại mật khẩu phải trùng.
  static String? confirmPassword(String? value, String password, {String message = 'Mật khẩu không khớp'}) =>
      value == password ? null : message;

  /// Giới hạn độ dài (ghi chú ≤ 500, địa chỉ ≤ 255...).
  static String? maxLength(String? value, int max) =>
      (value ?? '').trim().length > max ? 'Tối đa $max ký tự' : null;
}
