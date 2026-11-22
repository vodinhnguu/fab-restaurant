// Bàn ăn trên sơ đồ phục vụ: khớp GET /dine-in/tables (S03) và GET /dine-in/tables/:id (S04).

import '../utils/format.dart';
import 'order.dart';
import 'status.dart';

/// Tóm tắt đơn đang mở của 1 bàn (ô bàn ở S03).
class OpenOrderSummary {
  const OpenOrderSummary({
    required this.id,
    required this.code,
    required this.status,
    required this.total,
    required this.itemCount,
    this.waitingCount = 0,
    this.weighingCount = 0,
    this.billRequestedAt,
    this.createdAt,
  });

  final int id;
  final String code;
  final OrderStatus status;
  final int total;
  final int itemCount; // tổng số phần (bỏ món hủy)
  final int waitingCount; // số phần chưa mang ra bàn (chờ cân + chờ bếp + bếp đang làm)
  final int weighingCount; // số phần bán theo kg còn chờ hồ hải sản cân
  final DateTime? billRequestedAt; // đã "Gửi thanh toán" (null = chưa)
  final DateTime? createdAt; // giờ mở bàn (gửi bếp lần đầu)

  bool get billRequested => billRequestedAt != null;

  factory OpenOrderSummary.fromJson(Map<String, dynamic> json) => OpenOrderSummary(
        id: json['id'] as int? ?? 0,
        code: json['code'] as String? ?? '',
        status: OrderStatus.fromCode(json['status'] as String?),
        total: json['total'] as int? ?? 0,
        itemCount: json['itemCount'] as int? ?? 0,
        waitingCount: json['waitingCount'] as int? ?? 0,
        weighingCount: json['weighingCount'] as int? ?? 0,
        billRequestedAt: parseApiDate(json['billRequestedAt']),
        createdAt: parseApiDate(json['createdAt']),
      );
}

class DiningTable {
  const DiningTable({required this.id, required this.code, required this.seats, this.area, this.x = 0, this.y = 0, this.order});

  final int id;
  final String code; // "B05"
  final int seats;
  final String? area; // "Ngoài trời - view biển"
  final int x; // cột trên sơ đồ (từ 1), 0 = không có
  final int y; // hàng trên sơ đồ (từ 1)
  final OpenOrderSummary? order; // null = bàn trống

  bool get isBusy => order != null;

  factory DiningTable.fromJson(Map<String, dynamic> json, {String? area}) => DiningTable(
        id: json['id'] as int? ?? 0,
        code: json['code'] as String? ?? '',
        seats: json['seats'] as int? ?? 0,
        area: json['area'] as String? ?? area,
        x: json['x'] as int? ?? 0,
        y: json['y'] as int? ?? 0,
        order: json['order'] is Map<String, dynamic> ? OpenOrderSummary.fromJson(json['order'] as Map<String, dynamic>) : null,
      );
}

/// 1 khu vực trên sơ đồ: "Trong nhà", "Ngoài trời - view biển", "Phòng VIP".
class FloorArea {
  const FloorArea({required this.name, required this.tables});

  final String name;
  final List<DiningTable> tables;

  factory FloorArea.fromJson(Map<String, dynamic> json) {
    final name = json['name'] as String? ?? '';
    return FloorArea(
      name: name,
      tables: [for (final t in json['tables'] as List? ?? const []) DiningTable.fromJson(t as Map<String, dynamic>, area: name)],
    );
  }
}

/// S04: bàn + đơn đang mở (null = bàn trống).
class TableDetail {
  const TableDetail({required this.table, this.order});

  final DiningTable table;
  final Order? order;

  factory TableDetail.fromJson(Map<String, dynamic> json) => TableDetail(
        table: DiningTable.fromJson(json['table'] as Map<String, dynamic>),
        order: json['order'] is Map<String, dynamic> ? Order.fromJson(json['order'] as Map<String, dynamic>) : null,
      );
}
