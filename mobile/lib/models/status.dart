// Các trạng thái backend trả về (mã tiếng Anh) và chữ tiếng Việt hiện cho khách.
// Giống frontend/src/lib/constants.js. Màu của nhãn: widgets/status_badge.dart.

/// Trạng thái đơn hàng (bảng "Nhãn trạng thái" mục S13).
enum OrderStatus {
  pending('PENDING', 'Chờ xác nhận'),
  confirmed('CONFIRMED', 'Đã xác nhận'),
  preparing('PREPARING', 'Đang chế biến'),
  delivering('DELIVERING', 'Đang giao'),
  completed('COMPLETED', 'Hoàn thành'),
  cancelled('CANCELLED', 'Đã hủy');

  const OrderStatus(this.code, this.label);
  final String code;
  final String label;

  /// Còn đang xử lý (chip "Đang xử lý" ở S15).
  bool get isActive => this != completed && this != cancelled;

  static OrderStatus fromCode(String? code) =>
      values.firstWhere((s) => s.code == code, orElse: () => pending);
}

/// Trạng thái thanh toán của đơn.
enum PaymentStatus {
  unpaid('UNPAID', 'Chưa thanh toán'),
  paid('PAID', 'Đã thanh toán'),
  refunded('REFUNDED', 'Đã hoàn tiền');

  const PaymentStatus(this.code, this.label);
  final String code;
  final String label;

  static PaymentStatus fromCode(String? code) =>
      values.firstWhere((s) => s.code == code, orElse: () => unpaid);
}

/// Trạng thái lịch đặt bàn (mục S20). COMPLETED = khách đã đến.
enum ReservationStatus {
  pending('PENDING', 'Chờ xác nhận'),
  confirmed('CONFIRMED', 'Đã xác nhận'),
  completed('COMPLETED', 'Đã đến'),
  cancelled('CANCELLED', 'Đã hủy');

  const ReservationStatus(this.code, this.label);
  final String code;
  final String label;

  static ReservationStatus fromCode(String? code) =>
      values.firstWhere((s) => s.code == code, orElse: () => pending);
}

/// Cách thanh toán: COD = tiền mặt, ONLINE = VNPay.
const paymentMethodLabels = {'COD': 'Tiền mặt khi nhận', 'ONLINE': 'VNPay'};

/// Hình thức nhận món.
const orderTypeLabels = {'DELIVERY': 'Giao tận nơi', 'PICKUP': 'Đến lấy tại quán'};
