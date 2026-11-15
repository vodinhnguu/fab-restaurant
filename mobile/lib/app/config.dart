// Cấu hình chung của app.

class AppConfig {
  AppConfig._();

  /// Địa chỉ API backend (backend chạy bằng `npm run dev` ở thư mục gốc, cổng 4000).
  ///
  /// - Máy ảo Android: 10.0.2.2 chính là "localhost" của máy tính → giữ mặc định.
  /// - Chạy trên Chrome: thêm `--dart-define=API_URL=http://localhost:4000/api/v1`
  /// - Điện thoại thật (cùng Wi-Fi): thay bằng IP máy tính, vd
  ///   `--dart-define=API_URL=http://192.168.1.10:4000/api/v1`
  static const apiBaseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:4000/api/v1',
  );

  /// Hiện ở cuối màn Tài khoản (S22).
  static const appVersion = '1.0.0';
}
