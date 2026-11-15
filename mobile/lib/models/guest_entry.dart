// Đơn / lịch đặt bàn mà khách CHƯA ĐĂNG NHẬP đã tạo trên máy này (mục 4 docs/16:
// guestOrders, guestReservations). Nhờ lưu mã + SĐT, S15 / S20 vẫn hiện được lịch sử
// bằng GET /orders/track/:code?phone= và GET /reservations/track/:code?phone=.

class GuestEntry {
  const GuestEntry({required this.code, required this.phone, required this.time});

  final String code; // FAB... hoặc RSV...
  final String phone;

  /// Đơn hàng: lúc đặt. Lịch đặt bàn: giờ hẹn.
  final DateTime time;

  Map<String, dynamic> toJson() => {'code': code, 'phone': phone, 'time': time.toIso8601String()};

  factory GuestEntry.fromJson(Map<String, dynamic> json) => GuestEntry(
        code: json['code'] as String,
        phone: json['phone'] as String,
        time: DateTime.tryParse(json['time'] as String? ?? '') ?? DateTime.now(),
      );
}
