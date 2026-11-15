// Tên đường đi (địa chỉ) của từng màn hình.
//
// Muốn mở màn nào thì dùng hằng số / hàm ở đây, đừng gõ tay chuỗi '/menu':
//   context.go(AppRoutes.menu)                 → chuyển tab / thay cả màn
//   context.push(AppRoutes.dish('tom-su-hap-bia')) → mở chồng lên, có nút quay lại
//
// Đường nào mở màn nào: xem router.dart.

class AppRoutes {
  AppRoutes._();

  // S01
  static const splash = '/splash';

  // 5 tab dưới (mục 1.3 docs/16)
  static const home = '/home'; // S04
  static String menu({String? category}) => // S05, category = slug danh mục để lọc sẵn
      category == null ? '/menu' : '/menu?category=$category';
  static const reservation = '/reservation'; // S17
  static String activity({bool reservations = false}) => // S15 hoặc S20
      reservations ? '/activity?tab=reservations' : '/activity';
  static const account = '/account'; // S22

  // Mở toàn màn hình (che thanh tab dưới)
  static const login = '/login'; // S02
  static const register = '/register'; // S03
  static String dish(String slug) => '/dish/$slug'; // S06
  static const cart = '/cart'; // S08
  static const checkout = '/checkout'; // S09
  static String vnpay(String orderCode) => '/vnpay/$orderCode'; // S11
  static const paymentResult = '/payment-result'; // S12

  /// S13. [justPlaced] = vừa đặt xong, hiện lời cảm ơn.
  static String order(String code, {String? phone, bool justPlaced = false}) => _withQuery(
        '/order/$code',
        {
          'phone': ?phone, // ?phone: chỉ thêm khi phone khác null
          if (justPlaced) 'justPlaced': '1',
        },
      );

  /// S16. [reservation] = mở sẵn tab "Đặt bàn".
  static String lookup({bool reservation = false}) =>
      reservation ? '/lookup?type=reservation' : '/lookup';

  static const tablePicker = '/table-picker'; // S18
  static String reservationSuccess(String code) => '/reservation-success/$code'; // S19

  /// S21
  static String reservationDetail(String code, {String? phone}) =>
      _withQuery('/reservation-detail/$code', {'phone': ?phone});

  static const editProfile = '/profile'; // S23
  static const changePassword = '/change-password'; // S24
  static const restaurantInfo = '/restaurant-info'; // S25

  /// Ghép tham số vào đường đi, vd '/order/FAB123' + {phone: 090...} → '/order/FAB123?phone=090...'
  static String _withQuery(String path, Map<String, String> query) =>
      Uri(path: path, queryParameters: query.isEmpty ? null : query).toString();
}
