// Tên đường đi (địa chỉ) của từng màn hình. App nhân viên phục vụ: docs/23-app-nhan-vien-phuc-vu.md
//
// Muốn mở màn nào thì dùng hằng số / hàm ở đây, đừng gõ tay chuỗi '/tables/5':
//   context.go(AppRoutes.tables)              → chuyển màn chính / thay cả màn
//   context.push(AppRoutes.ticket(5))         → mở chồng lên, có nút quay lại
//
// Đường nào mở màn nào: xem router.dart.

class AppRoutes {
  AppRoutes._();

  static const splash = '/splash'; // S01
  static const login = '/login'; // S02

  // 3 màn chính, chuyển bằng menu trái (app_drawer.dart)
  static const tables = '/tables'; // S03 Sơ đồ bàn
  static const orders = '/orders'; // S10 Đơn hôm nay
  static const account = '/account'; // S11 Tài khoản

  // Mở toàn màn hình, nằm "dưới" Sơ đồ bàn: quay lại từng bước S06 → S05 → S04 → S03
  static String table(int id) => '/tables/$id'; // S04 Đơn của bàn
  static String menu(int tableId) => '/tables/$tableId/menu'; // S05 Chọn món
  static String dish(int tableId, String slug) => '/tables/$tableId/menu/dish/$slug'; // S06 Chi tiết món
  static String ticket(int tableId) => '/tables/$tableId/ticket'; // S08 Phiếu gọi món
}
