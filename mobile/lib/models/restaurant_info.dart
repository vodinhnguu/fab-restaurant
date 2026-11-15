// Thông tin nhà hàng: khớp kết quả GET /info
// (backend/src/config/restaurant.js + phí ship + onlinePayment).
// Tải 1 lần lúc mở app (S01), cả app dùng chung qua infoProvider.

class RestaurantInfo {
  const RestaurantInfo({
    required this.name,
    required this.slogan,
    required this.phone,
    required this.email,
    required this.address,
    required this.openTime,
    required this.closeTime,
    required this.reservationAreas,
    required this.diningMinutes,
    required this.shippingFee,
    required this.freeShippingMin,
    required this.onlinePayment,
    this.socials = const {},
  });

  final String name;
  final String slogan;
  final String phone; // hotline
  final String email;
  final String address;
  final String openTime; // "10:00"
  final String closeTime; // "22:00"
  final List<String> reservationAreas; // "Trong nhà", "Ngoài trời - view biển", "Phòng VIP"
  final int diningMinutes; // 1 lượt giữ bàn bao lâu (120 phút)
  final int shippingFee; // 20000
  final int freeShippingMin; // đơn từ mức này được miễn phí ship (500000)
  final bool onlinePayment; // false = chưa bật VNPay, chỉ nhận tiền mặt
  final Map<String, String> socials; // facebook, instagram, tiktok

  /// Phí ship hiển thị ở S09 (backend tính lại khi đặt):
  /// giao tận nơi và tạm tính < freeShippingMin → shippingFee, còn lại 0.
  int shippingFor({required int subtotal, required bool delivery}) =>
      delivery && subtotal < freeShippingMin ? shippingFee : 0;

  /// Giờ đặt bàn muộn nhất: trước giờ đóng cửa 1 tiếng ("21:00").
  String get lastReservationTime {
    final parts = closeTime.split(':');
    final hour = (int.tryParse(parts.first) ?? 22) - 1;
    return '${hour.toString().padLeft(2, '0')}:${parts.length > 1 ? parts[1] : '00'}';
  }

  factory RestaurantInfo.fromJson(Map<String, dynamic> json) {
    final hours = json['openingHours'] as Map<String, dynamic>? ?? const {};
    final socials = json['socials'] as Map<String, dynamic>? ?? const {};
    return RestaurantInfo(
      name: json['name'] as String? ?? 'FAB Seafood',
      slogan: json['slogan'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      address: json['address'] as String? ?? '',
      openTime: hours['open'] as String? ?? '10:00',
      closeTime: hours['close'] as String? ?? '22:00',
      reservationAreas: (json['reservationAreas'] as List? ?? const []).cast<String>(),
      diningMinutes: json['diningMinutes'] as int? ?? 120,
      shippingFee: json['shippingFee'] as int? ?? 0,
      freeShippingMin: json['freeShippingMin'] as int? ?? 0,
      onlinePayment: json['onlinePayment'] as bool? ?? false,
      socials: socials.map((k, v) => MapEntry(k, v.toString())),
    );
  }
}
