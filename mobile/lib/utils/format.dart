// Định dạng hiển thị (mục 2.4 docs/16), giống frontend/src/lib/format.js.
//
//   formatMoney(850000)             → "850.000đ"
//   formatDateTime(order.createdAt) → "19:05 27/10/2026"   (giờ Việt Nam)
//   timeAgo(review.createdAt)       → "3 ngày trước"
//   imageUrl('/uploads/a.jpg')      → "http://10.0.2.2:4000/uploads/a.jpg"

import 'package:intl/intl.dart';

import '../app/config.dart';

final _money = NumberFormat.decimalPattern('vi'); // nhóm nghìn bằng dấu chấm

/// 850000 → "850.000đ". null → "0đ".
String formatMoney(num? amount) => '${_money.format(amount ?? 0)}đ';

// ---------- Ngày giờ ----------
// API trả giờ UTC ("2026-10-27T12:05:00.000Z"). App luôn hiện giờ Việt Nam (UTC+7),
// kể cả khi điện thoại đang để múi giờ khác.

const _vnOffset = Duration(hours: 7);

/// Đọc chuỗi ngày giờ của API. Chuỗi rỗng / sai thì trả null.
DateTime? parseApiDate(Object? value) => value is String ? DateTime.tryParse(value) : null;

/// Đổi 1 thời điểm sang "giờ treo tường" ở Việt Nam (để lấy giờ, ngày, thứ).
DateTime toVietnamTime(DateTime time) => time.toUtc().add(_vnOffset);

/// Bây giờ theo giờ Việt Nam.
DateTime vietnamNow() => toVietnamTime(DateTime.now());

/// "19:05 27/10/2026"
String formatDateTime(DateTime? time) =>
    time == null ? '' : DateFormat('HH:mm dd/MM/yyyy').format(toVietnamTime(time));

/// "27/10/2026"
String formatDate(DateTime? time) => time == null ? '' : DateFormat('dd/MM/yyyy').format(toVietnamTime(time));

/// "19:05"
String formatTime(DateTime? time) => time == null ? '' : DateFormat('HH:mm').format(toVietnamTime(time));

/// Thứ viết tắt + ngày/tháng cho dải chọn ngày ở S17: "T2 28/10", "CN 02/11".
String formatShortDay(DateTime time) {
  final vn = toVietnamTime(time);
  final day = vn.weekday == DateTime.sunday ? 'CN' : 'T${vn.weekday + 1}';
  return '$day ${DateFormat('dd/MM').format(vn)}';
}

/// Thời gian tương đối cho đánh giá: "vừa xong", "5 phút trước", "3 ngày trước"...
String timeAgo(DateTime? time, {DateTime? now}) {
  if (time == null) return '';
  final diff = (now ?? DateTime.now()).difference(time);
  if (diff.inMinutes < 1) return 'vừa xong';
  if (diff.inHours < 1) return '${diff.inMinutes} phút trước';
  if (diff.inDays < 1) return '${diff.inHours} giờ trước';
  if (diff.inDays < 30) return '${diff.inDays} ngày trước';
  if (diff.inDays < 365) return '${diff.inDays ~/ 30} tháng trước';
  return '${diff.inDays ~/ 365} năm trước';
}

// ---------- Ảnh ----------

/// Ảnh món / danh mục: URL đầy đủ giữ nguyên, "/uploads/..." thì ghép địa chỉ server.
/// Không có ảnh → null (màn hình hiện ảnh giữ chỗ nền Ocean 100 chữ "FAB Seafood").
String? imageUrl(String? src) {
  if (src == null || src.isEmpty) return null;
  if (src.startsWith('http')) return src;
  return '${AppConfig.serverOrigin}$src';
}
