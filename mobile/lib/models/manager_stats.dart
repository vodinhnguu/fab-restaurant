// Số liệu màn Quản lý (S15): khớp GET /stats/manager. Tài liệu: docs/28-app-quan-ly.md

/// Doanh thu 1 khoảng thời gian (hôm nay / tháng này), tách tại quán - online.
class RevenueBlock {
  const RevenueBlock({
    this.revenue = 0,
    this.orders = 0,
    this.avgPerOrder = 0,
    this.dineInRevenue = 0,
    this.dineInOrders = 0,
    this.onlineRevenue = 0,
    this.onlineOrders = 0,
    this.label,
  });

  final int revenue; // tổng tiền đơn đã hoàn thành (VNĐ)
  final int orders; // số đơn đã hoàn thành
  final int avgPerOrder; // tiền trung bình 1 đơn
  final int dineInRevenue; // ăn tại quán (phục vụ ghi trên app)
  final int dineInOrders;
  final int onlineRevenue; // khách đặt online (giao tận nơi + đến lấy)
  final int onlineOrders;
  final String? label; // "11/2026" (chỉ khối tháng)

  factory RevenueBlock.fromJson(Map<String, dynamic> json) {
    final dineIn = json['dineIn'] as Map<String, dynamic>? ?? const {};
    final online = json['online'] as Map<String, dynamic>? ?? const {};
    return RevenueBlock(
      revenue: json['revenue'] as int? ?? 0,
      orders: json['orders'] as int? ?? 0,
      avgPerOrder: json['avgPerOrder'] as int? ?? 0,
      dineInRevenue: dineIn['revenue'] as int? ?? 0,
      dineInOrders: dineIn['orders'] as int? ?? 0,
      onlineRevenue: online['revenue'] as int? ?? 0,
      onlineOrders: online['orders'] as int? ?? 0,
      label: json['label'] as String?,
    );
  }
}

/// Đơn đã hủy: số đơn + số tiền của các đơn đó.
class CancelledBlock {
  const CancelledBlock({this.orders = 0, this.amount = 0, this.items = 0});
  final int orders;
  final int amount;
  final int items;

  factory CancelledBlock.fromJson(Map<String, dynamic>? json) => CancelledBlock(
        orders: json?['orders'] as int? ?? 0,
        amount: json?['amount'] as int? ?? 0,
        items: json?['items'] as int? ?? 0,
      );
}

/// Tình hình bàn lúc này.
class TablesBlock {
  const TablesBlock({this.total = 0, this.busy = 0, this.free = 0, this.billRequested = 0, this.servingAmount = 0});
  final int total;
  final int busy; // bàn đang có khách (đơn chưa thu tiền)
  final int free;
  final int billRequested; // bàn đã gửi thanh toán, chờ thu ngân
  final int servingAmount; // tiền đang phục vụ (chưa thu)

  factory TablesBlock.fromJson(Map<String, dynamic>? json) => TablesBlock(
        total: json?['total'] as int? ?? 0,
        busy: json?['busy'] as int? ?? 0,
        free: json?['free'] as int? ?? 0,
        billRequested: json?['billRequested'] as int? ?? 0,
        servingAmount: json?['servingAmount'] as int? ?? 0,
      );
}

/// 1 dòng bia / nước bán hôm nay.
class DrinkRow {
  const DrinkRow({required this.name, required this.quantity, required this.revenue, this.unit = 'lon'});
  final String name;
  final int quantity;
  final int revenue;
  final String unit;

  factory DrinkRow.fromJson(Map<String, dynamic> json) => DrinkRow(
        name: json['name'] as String? ?? '',
        quantity: json['quantity'] as int? ?? 0,
        revenue: json['revenue'] as int? ?? 0,
        unit: json['unit'] as String? ?? 'lon',
      );
}

/// 1 loại hải sản trong hồ (docs/27-ton-ho-hai-san.md).
class TankRow {
  const TankRow({required this.name, required this.stockKg, required this.isLow, required this.isEmpty});
  final String name;
  final double stockKg;
  final bool isLow;
  final bool isEmpty;

  factory TankRow.fromJson(Map<String, dynamic> json) => TankRow(
        name: json['name'] as String? ?? '',
        stockKg: (json['stockKg'] as num?)?.toDouble() ?? 0,
        isLow: json['isLow'] as bool? ?? false,
        isEmpty: json['isEmpty'] as bool? ?? false,
      );
}

/// Món bán chạy hôm nay.
class TopDish {
  const TopDish({required this.name, required this.quantity});
  final String name;
  final int quantity;

  factory TopDish.fromJson(Map<String, dynamic> json) =>
      TopDish(name: json['name'] as String? ?? '', quantity: json['quantity'] as int? ?? 0);
}

class ManagerStats {
  const ManagerStats({
    required this.today,
    required this.month,
    required this.cancelledToday,
    required this.cancelledMonth,
    required this.tables,
    required this.drinks,
    required this.drinkQuantity,
    required this.drinkRevenue,
    required this.tank,
    required this.topDishes,
  });

  final RevenueBlock today;
  final RevenueBlock month;
  final CancelledBlock cancelledToday;
  final CancelledBlock cancelledMonth;
  final TablesBlock tables;
  final List<DrinkRow> drinks;
  final int drinkQuantity; // tổng lon / chai bán hôm nay
  final int drinkRevenue;
  final List<TankRow> tank;
  final List<TopDish> topDishes;

  /// Loại hải sản cần nhập thêm (hết hoặc gần hết).
  List<TankRow> get tankLow => tank.where((t) => t.isLow).toList();

  factory ManagerStats.fromJson(Map<String, dynamic> json) {
    final cancelled = json['cancelled'] as Map<String, dynamic>? ?? const {};
    final drinks = json['drinks'] as Map<String, dynamic>? ?? const {};
    return ManagerStats(
      today: RevenueBlock.fromJson(json['today'] as Map<String, dynamic>? ?? const {}),
      month: RevenueBlock.fromJson(json['month'] as Map<String, dynamic>? ?? const {}),
      cancelledToday: CancelledBlock.fromJson(cancelled['today'] as Map<String, dynamic>?),
      cancelledMonth: CancelledBlock.fromJson(cancelled['month'] as Map<String, dynamic>?),
      tables: TablesBlock.fromJson(json['tables'] as Map<String, dynamic>?),
      drinks: [
        for (final d in (drinks['items'] as List? ?? const [])) DrinkRow.fromJson(d as Map<String, dynamic>),
      ],
      drinkQuantity: drinks['quantity'] as int? ?? 0,
      drinkRevenue: drinks['revenue'] as int? ?? 0,
      tank: [
        for (final t in (json['tank'] as List? ?? const [])) TankRow.fromJson(t as Map<String, dynamic>),
      ],
      topDishes: [
        for (final d in (json['topDishes'] as List? ?? const [])) TopDish.fromJson(d as Map<String, dynamic>),
      ],
    );
  }
}

// ---------------- Đơn đã hủy (S16): GET /stats/cancellations ----------------

/// 1 đơn bị hủy cả đơn.
class CancelledOrder {
  const CancelledOrder({
    required this.id,
    required this.code,
    required this.type,
    required this.total,
    required this.itemCount,
    this.reason,
    this.tableCode,
    this.staffName,
    this.customerName,
    this.cancelledAt,
  });

  final int id;
  final String code;
  final String type; // DINE_IN / DELIVERY / PICKUP
  final int total;
  final int itemCount;
  final String? reason; // trống = khách tự hủy
  final String? tableCode;
  final String? staffName;
  final String? customerName;
  final DateTime? cancelledAt;

  bool get isDineIn => type == 'DINE_IN';

  factory CancelledOrder.fromJson(Map<String, dynamic> json) => CancelledOrder(
        id: json['id'] as int,
        code: json['code'] as String? ?? '',
        type: json['type'] as String? ?? 'DELIVERY',
        total: json['total'] as int? ?? 0,
        itemCount: (json['_count'] as Map<String, dynamic>?)?['items'] as int? ?? 0,
        reason: json['cancelReason'] as String?,
        tableCode: (json['table'] as Map<String, dynamic>?)?['code'] as String?,
        staffName: (json['staff'] as Map<String, dynamic>?)?['name'] as String?,
        customerName: json['customerName'] as String?,
        cancelledAt: DateTime.tryParse(json['updatedAt'] as String? ?? ''),
      );
}

/// 1 món bị hủy lẻ (đơn vẫn còn). Hủy khi bếp đã làm là mất hàng thật.
class CancelledItem {
  const CancelledItem({
    required this.id,
    required this.name,
    required this.quantity,
    required this.price,
    this.weight,
    this.reason,
    this.orderCode,
    this.tableCode,
    this.cancelledAt,
  });

  final int id;
  final String name;
  final int quantity;
  final int price;
  final double? weight; // món bán theo kg
  final String? reason;
  final String? orderCode;
  final String? tableCode;
  final DateTime? cancelledAt;

  /// Tiền của phần đã hủy (theo kg = giá 1 kg × số kg).
  int get amount => weight != null ? (price * weight!).round() : price * quantity;

  factory CancelledItem.fromJson(Map<String, dynamic> json) {
    final order = json['order'] as Map<String, dynamic>?;
    return CancelledItem(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      quantity: json['quantity'] as int? ?? 0,
      price: json['price'] as int? ?? 0,
      weight: (json['weight'] as num?)?.toDouble(),
      reason: json['cancelReason'] as String?,
      orderCode: order?['code'] as String?,
      tableCode: (order?['table'] as Map<String, dynamic>?)?['code'] as String?,
      cancelledAt: DateTime.tryParse(json['cancelledAt'] as String? ?? ''),
    );
  }
}

class Cancellations {
  const Cancellations({
    required this.range,
    required this.orders,
    required this.items,
    required this.totalOrders,
    required this.totalAmount,
  });

  final String range; // today / 7d / month
  final List<CancelledOrder> orders;
  final List<CancelledItem> items;
  final int totalOrders;
  final int totalAmount;

  factory Cancellations.fromJson(Map<String, dynamic> json) {
    final summary = json['summary'] as Map<String, dynamic>? ?? const {};
    return Cancellations(
      range: json['range'] as String? ?? 'today',
      orders: [
        for (final o in (json['orders'] as List? ?? const [])) CancelledOrder.fromJson(o as Map<String, dynamic>),
      ],
      items: [
        for (final i in (json['items'] as List? ?? const [])) CancelledItem.fromJson(i as Map<String, dynamic>),
      ],
      totalOrders: summary['orders'] as int? ?? 0,
      totalAmount: summary['amount'] as int? ?? 0,
    );
  }
}
