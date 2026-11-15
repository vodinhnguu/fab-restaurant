// Bảng màu của app: lấy đúng mục 2.1 docs/16-dac-ta-app-mobile-stitch.md
// và frontend/src/index.css (giống web để app và web nhìn cùng một kiểu).
//
// Muốn đổi màu cả app: sửa ở đây, không viết mã màu trực tiếp trong màn hình.

import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Ocean: màu chủ đạo
  static const ocean950 = Color(0xFF072538); // lớp phủ tối trên ảnh, tiêu đề đậm
  static const ocean900 = Color(0xFF0B3954); // thanh tiêu đề, chip đang chọn, nút tối
  static const ocean700 = Color(0xFF13506E); // chữ ghi chú món
  static const ocean600 = Color(0xFF166287); // bàn đang chọn trên sơ đồ
  static const ocean500 = Color(0xFF1F7AA3); // tên danh mục nhỏ, icon thông tin
  static const ocean200 = Color(0xFFAED7E9); // slogan ở Splash
  static const ocean100 = Color(0xFFD5EBF4); // nền ảnh giữ chỗ khi món không có ảnh
  static const ocean50 = Color(0xFFEEF7FB); // nền ô thông tin

  // Coral: màu nhấn
  static const coral500 = Color(0xFFF5602E); // nút chính, nhãn giảm giá
  static const coral600 = Color(0xFFE0461A); // giá tiền, tổng tiền
  static const coral50 = Color(0xFFFFF4EF); // nền ô lựa chọn đang chọn

  // Sand: nền
  static const sand50 = Color(0xFFFDFBF7); // nền toàn màn hình
  static const sand100 = Color(0xFFF8F3EA); // nền khối phụ

  // Chữ, viền
  static const white = Color(0xFFFFFFFF); // thẻ (card)
  static const slate800 = Color(0xFF1E293B); // chữ thường
  static const slate500 = Color(0xFF64748B); // chữ phụ
  static const slate300 = Color(0xFFCBD5E1); // viền nút viền, ô nhập
  static const slate200 = Color(0xFFE2E8F0); // viền thẻ
  static const danger = Color(0xFFDC2626); // nút nguy hiểm (hủy, xóa)
  static const success = Color(0xFF15803D); // giảm giá, thành công

  // Màu nhãn trạng thái (nền, chữ): mục 2.1, bảng "Màu trạng thái"
  static const amber = StatusColor(Color(0xFFFEF3C7), Color(0xFFB45309)); // chờ xác nhận, chưa thanh toán
  static const blue = StatusColor(Color(0xFFDBEAFE), Color(0xFF1D4ED8)); // đã xác nhận
  static const indigo = StatusColor(Color(0xFFE0E7FF), Color(0xFF4338CA)); // đang chế biến
  static const cyan = StatusColor(Color(0xFFCFFAFE), Color(0xFF0E7490)); // đang giao
  static const green = StatusColor(Color(0xFFDCFCE7), Color(0xFF15803D)); // hoàn thành, đã đến, đã thanh toán
  static const red = StatusColor(Color(0xFFFEE2E2), Color(0xFFB91C1C)); // đã hủy
  static const gray = StatusColor(Color(0xFFF1F5F9), Color(0xFF475569)); // đã hoàn tiền
}

/// Một cặp màu cho nhãn trạng thái: [background] là nền, [foreground] là chữ.
class StatusColor {
  const StatusColor(this.background, this.foreground);
  final Color background;
  final Color foreground;
}
