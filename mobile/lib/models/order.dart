// Đơn ăn tại quán: khớp `order` trong GET /dine-in/tables/:id, POST /dine-in/orders, POST /dine-in/items/...,
// từng dòng của GET /dine-in/orders, và GET /orders/:id (chi tiết).
// Tiền ở đây do BACKEND tính (giá lấy từ DB lúc gửi bếp, món hủy đã trừ ra), là con số thật của đơn.

import '../utils/format.dart';
import 'status.dart';

/// 1 món trong đơn: tên và giá lưu lại lúc gửi bếp (món đổi giá sau này thì đơn cũ không đổi).
class OrderItem {
  const OrderItem({
    required this.id,
    required this.dishId,
    required this.name,
    required this.price,
    required this.quantity,
    this.status = OrderItemStatus.pending,
    this.note,
    this.cancelReason,
    this.image,
    this.slug,
    this.createdAt,
    this.weight,
  });

  final int id; // dùng cho "Check món", "Hủy món"
  final int dishId;
  final String name;
  final int price;
  final int quantity;
  final OrderItemStatus status;
  final String? note; // ghi chú khẩu vị của món
  final String? cancelReason; // lý do hủy (bếp đã làm mà hủy thì bắt buộc)
  final String? image; // lấy từ món hiện tại (dish.image)
  final String? slug; // để mở lại S06
  final DateTime? createdAt; // lúc gửi bếp (mỗi lần gọi thêm là các dòng mới)
  final double? weight; // món bán theo kg: số kg đã cân tại hồ (null = món theo phần / chưa cân)

  /// Món bán theo kg (price là giá 1 kg): đang chờ cân hoặc đã cân.
  bool get isByWeight => status == OrderItemStatus.weighing || weight != null;
  bool get isWeighing => status == OrderItemStatus.weighing;

  /// Tiền dòng món, khớp backend: theo kg = giá 1 kg × số kg (chưa cân = 0), theo phần = giá × số phần.
  int get lineTotal => isByWeight ? (price * (weight ?? 0)).round() : price * quantity;
  bool get isCancelled => status == OrderItemStatus.cancelled;
  bool get isServed => status == OrderItemStatus.served;

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final dish = json['dish'] as Map<String, dynamic>?;
    return OrderItem(
      id: json['id'] as int? ?? 0,
      dishId: json['dishId'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      price: json['price'] as int? ?? 0,
      quantity: json['quantity'] as int? ?? 1,
      status: OrderItemStatus.fromCode(json['status'] as String?),
      note: json['note'] as String?,
      cancelReason: json['cancelReason'] as String?,
      image: dish?['image'] as String?,
      slug: dish?['slug'] as String?,
      createdAt: parseApiDate(json['createdAt']),
      weight: (json['weight'] as num?)?.toDouble(),
    );
  }
}

class Order {
  const Order({
    required this.id,
    required this.code,
    required this.status,
    required this.paymentStatus,
    required this.total,
    this.tableId,
    this.tableCode,
    this.staffName,
    this.note,
    this.cancelReason,
    this.billRequestedAt,
    this.createdAt,
    this.updatedAt,
    this.items = const [],
    int? itemCount,
  }) : _itemCount = itemCount;

  final int id;
  final String code; // "FAB261120235440"
  final OrderStatus status;
  final PaymentStatus paymentStatus;
  final int total; // đã trừ món hủy
  final int? tableId;
  final String? tableCode; // "B05"
  final String? staffName; // nhân viên mở đơn
  final String? note;
  final String? cancelReason;
  final DateTime? billRequestedAt; // phục vụ đã "Gửi thanh toán" lúc nào (null = chưa gửi)
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<OrderItem> items; // kể cả món đã hủy (hiện gạch ngang)
  final int? _itemCount; // danh sách đơn hôm nay chỉ có số phần, không có món

  /// Món còn tính tiền (bỏ món đã hủy).
  List<OrderItem> get liveItems => items.where((i) => !i.isCancelled).toList();

  /// Tổng số phần còn tính tiền (vd "5 món").
  int get itemCount => _itemCount ?? liveItems.fold(0, (sum, i) => sum + i.quantity);

  /// Số phần chưa mang ra bàn (chờ cân + chờ bếp + bếp đang làm).
  int get waitingCount => liveItems.where((i) => !i.isServed).fold(0, (sum, i) => sum + i.quantity);

  /// Số món bán theo kg còn chờ cân tại hồ (phục vụ nhập số kg): chưa gửi thanh toán được.
  int get weighingCount => liveItems.where((i) => i.isWeighing).length;

  bool get billRequested => billRequestedAt != null;

  /// Các lần gửi bếp: món gửi cùng 1 lần (cùng giờ) gom 1 nhóm, theo thứ tự gửi.
  /// Lần 1 lúc 19:05 [Tôm, Cua], lần 2 lúc 19:40 [Bia]... Món hủy bớt vẫn nằm đúng lần của nó.
  List<List<OrderItem>> get rounds {
    final sorted = [...items]..sort((a, b) {
        final byTime = (a.createdAt ?? DateTime(0)).compareTo(b.createdAt ?? DateTime(0));
        return byTime != 0 ? byTime : a.id.compareTo(b.id);
      });
    final result = <List<OrderItem>>[];
    for (final item in sorted) {
      final last = result.isEmpty ? null : result.last;
      final sameRound = last != null &&
          item.createdAt != null &&
          last.first.createdAt != null &&
          item.createdAt!.difference(last.first.createdAt!).inSeconds.abs() < 5;
      if (sameRound) {
        last.add(item);
      } else {
        result.add([item]);
      }
    }
    return result;
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    final table = json['table'] as Map<String, dynamic>?;
    final staff = json['staff'] as Map<String, dynamic>?;
    final items = json['items'] as List?;
    // GET /dine-in/orders trả itemCount thay cho danh sách món
    final hasItemDetails = items != null && items.isNotEmpty && (items.first as Map).containsKey('name');
    return Order(
      id: json['id'] as int? ?? 0,
      code: json['code'] as String? ?? '',
      status: OrderStatus.fromCode(json['status'] as String?),
      paymentStatus: PaymentStatus.fromCode(json['paymentStatus'] as String?),
      total: json['total'] as int? ?? 0,
      tableId: json['tableId'] as int? ?? table?['id'] as int?,
      tableCode: table?['code'] as String?,
      staffName: staff?['name'] as String?,
      note: json['note'] as String?,
      cancelReason: json['cancelReason'] as String?,
      billRequestedAt: parseApiDate(json['billRequestedAt']),
      createdAt: parseApiDate(json['createdAt']),
      updatedAt: parseApiDate(json['updatedAt']),
      items: hasItemDetails ? [for (final i in items) OrderItem.fromJson(i as Map<String, dynamic>)] : const [],
      itemCount: json['itemCount'] as int?,
    );
  }
}
