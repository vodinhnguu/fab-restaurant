// Lỗi khi gọi API, đã "dịch" sẵn sang câu tiếng Việt để hiện cho khách.
//
// Màn hình chỉ cần: try { ... } on ApiException catch (e) { showAppSnack(e.message, error: true); }

class ApiException implements Exception {
  const ApiException(
    this.message, {
    this.statusCode,
    this.fieldErrors = const {},
    this.retryAfter,
    this.isNetwork = false,
  });

  /// Câu lỗi tiếng Việt: ưu tiên `message` backend trả về (mục C01 docs/16).
  final String message;

  /// Mã HTTP (400, 401, 404, 409, 429...). null khi không tới được server.
  final int? statusCode;

  /// Lỗi theo từng ô nhập: { 'phone': 'Số điện thoại không hợp lệ' } (từ `errors[]` của backend).
  final Map<String, String> fieldErrors;

  /// Lỗi 429: phải chờ bao lâu mới thử lại (header `Retry-After`).
  final Duration? retryAfter;

  /// true = mất mạng / không kết nối được server → hiện màn "Mất kết nối mạng".
  final bool isNetwork;

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isConflict => statusCode == 409;
  bool get isRateLimited => statusCode == 429;

  /// Số phút phải chờ khi bị 429, làm tròn lên (ít nhất 1).
  int? get retryAfterMinutes {
    final wait = retryAfter;
    if (wait == null) return null;
    final minutes = (wait.inSeconds / 60).ceil();
    return minutes < 1 ? 1 : minutes;
  }

  /// Câu để hiện cho khách. Lỗi 429 thì ghép số phút phải chờ (mục C01, S02 docs/16):
  ///   e.friendlyMessage()                                    → "Bạn thao tác quá nhanh, vui lòng thử lại sau 3 phút"
  ///   e.friendlyMessage(tooMany: 'Bạn thử đăng nhập quá nhiều lần') → "Bạn thử đăng nhập quá nhiều lần, vui lòng thử lại sau 3 phút"
  /// Lỗi khác: trả nguyên câu backend gửi.
  String friendlyMessage({String tooMany = 'Bạn thao tác quá nhanh'}) {
    if (!isRateLimited) return message;
    final minutes = retryAfterMinutes;
    return minutes == null ? '$tooMany, vui lòng thử lại sau' : '$tooMany, vui lòng thử lại sau $minutes phút';
  }

  @override
  String toString() => message;
}
