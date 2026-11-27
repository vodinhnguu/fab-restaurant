// Các trạng thái backend trả về (mã tiếng Anh) và chữ tiếng Việt hiện trên app.
// Màu của nhãn: widgets/status_badge.dart.
//
// App nhân viên chỉ làm đơn ĂN TẠI QUÁN (DINE_IN), nên chữ theo nghĩa tại bàn (docs/23-app-nhan-vien-phuc-vu.md):
// DELIVERING ở đơn online là "Đang giao", ở đơn tại bàn là "Đã lên đủ món".
// Trạng thái đơn tại bàn do backend tự tính từ trạng thái từng món (OrderItemStatus).

enum OrderStatus {
  pending('PENDING', 'Chờ xác nhận'),
  confirmed('CONFIRMED', 'Đã gửi bếp'),
  preparing('PREPARING', 'Đang chế biến'),
  delivering('DELIVERING', 'Đã lên đủ món'),
  completed('COMPLETED', 'Đã thu tiền'),
  cancelled('CANCELLED', 'Đã hủy');

  const OrderStatus(this.code, this.label);
  final String code;
  final String label;

  /// Đơn còn mở (bàn đang có khách, chưa thu tiền).
  bool get isOpen => this != completed && this != cancelled;

  static OrderStatus fromCode(String? code) =>
      values.firstWhere((s) => s.code == code, orElse: () => pending);
}

/// Trạng thái từng món của đơn tại bàn: chờ bếp → bếp đang làm (bếp bấm "Nhận làm" trên web)
/// → đã ra bàn (phục vụ "Check món"), hoặc đã hủy.
enum OrderItemStatus {
  weighing('WEIGHING', 'Chờ cân'), // món bán theo kg: chờ cân tại hồ, phục vụ nhập số kg (docs/24)
  pending('PENDING', 'Chờ bếp'),
  cooking('COOKING', 'Bếp đang làm'),
  ready('READY', 'Bếp xong'),
  served('SERVED', 'Đã ra bàn'),
  cancelled('CANCELLED', 'Đã hủy');

  const OrderItemStatus(this.code, this.label);
  final String code;
  final String label;

  static OrderItemStatus fromCode(String? code) =>
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
