// Kiểm bia nước cuối ngày (S17): khớp GET /drinks/check. Tài liệu: docs/29-kiem-bia-nuoc.md
//
//   lệch = (bán + trả lại) − xuất
//     0     = khớp
//     ÂM    = thiếu hàng (xuất ra mà không bán, không trả lại)
//     DƯƠNG = thừa (bán + trả lại nhiều hơn số đã ghi xuất)

/// 1 loại đồ uống trong phiếu kiểm của 1 ngày.
class DrinkCheckRow {
  const DrinkCheckRow({
    required this.productId,
    required this.dishId,
    required this.name,
    required this.unit,
    required this.packSize,
    required this.issuedPacks,
    required this.issuedUnits,
    required this.issued,
    required this.sold,
    required this.returned,
    required this.diff,
    required this.checked,
    this.note,
    this.by,
  });

  final int productId;
  final int dishId;
  final String name;
  final String unit; // lon / chai
  final int packSize; // số lon / chai mỗi thùng
  final int issuedPacks; // số thùng xuất ra quầy
  final int issuedUnits; // lon / chai lẻ xuất thêm
  final int issued; // tổng đã xuất = issuedPacks × packSize + issuedUnits
  final int sold; // bán theo đơn (backend tự tính)
  final int returned; // trả lại cuối ngày
  final int diff; // lệch: âm = thiếu, dương = thừa
  final bool checked; // đã ghi phiếu hôm đó chưa
  final String? note;
  final String? by; // ai ghi phiếu

  bool get isMissing => checked && diff < 0; // thiếu hàng
  bool get isExtra => checked && diff > 0; // thừa
  bool get isMatched => checked && diff == 0;

  /// "thiếu 8 lon" / "thừa 2 lon" / "khớp" / "chưa kiểm"
  String get diffLabel {
    if (!checked) return 'chưa kiểm';
    if (diff == 0) return 'khớp';
    return '${diff < 0 ? 'thiếu' : 'thừa'} ${diff.abs()} $unit';
  }

  factory DrinkCheckRow.fromJson(Map<String, dynamic> json) => DrinkCheckRow(
        productId: json['productId'] as int,
        dishId: json['dishId'] as int? ?? 0,
        name: json['name'] as String? ?? '',
        unit: json['unit'] as String? ?? 'lon',
        packSize: json['packSize'] as int? ?? 24,
        issuedPacks: json['issuedPacks'] as int? ?? 0,
        issuedUnits: json['issuedUnits'] as int? ?? 0,
        issued: json['issued'] as int? ?? 0,
        sold: json['sold'] as int? ?? 0,
        returned: json['returned'] as int? ?? 0,
        diff: json['diff'] as int? ?? 0,
        checked: json['checked'] as bool? ?? false,
        note: json['note'] as String?,
        by: json['by'] as String?,
      );
}

/// Phiếu kiểm của cả 1 ngày.
class DrinkDayCheck {
  const DrinkDayCheck({
    required this.date,
    required this.rows,
    required this.issued,
    required this.sold,
    required this.returned,
    required this.diff,
    required this.checked,
    required this.total,
    required this.mismatched,
  });

  final DateTime date;
  final List<DrinkCheckRow> rows;
  final int issued; // tổng xuất (chỉ các loại đã kiểm)
  final int sold; // tổng bán cả ngày
  final int returned;
  final int diff; // tổng lệch: âm = thiếu
  final int checked; // số loại đã ghi phiếu
  final int total; // tổng số loại
  final int mismatched; // số loại có lệch khác 0

  bool get allChecked => checked == total && total > 0;

  factory DrinkDayCheck.fromJson(Map<String, dynamic> json) {
    final s = json['summary'] as Map<String, dynamic>? ?? const {};
    return DrinkDayCheck(
      date: DateTime.tryParse(json['date'] as String? ?? '') ?? DateTime.now(),
      rows: [
        for (final r in (json['rows'] as List? ?? const [])) DrinkCheckRow.fromJson(r as Map<String, dynamic>),
      ],
      issued: s['issued'] as int? ?? 0,
      sold: s['sold'] as int? ?? 0,
      returned: s['returned'] as int? ?? 0,
      diff: s['diff'] as int? ?? 0,
      checked: s['checked'] as int? ?? 0,
      total: s['total'] as int? ?? 0,
      mismatched: s['mismatched'] as int? ?? 0,
    );
  }
}
