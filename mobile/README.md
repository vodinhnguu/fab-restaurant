# FAB Seafood: app mobile cho khách hàng (Flutter)

- Đặc tả từng màn hình: [docs/16-dac-ta-app-mobile-stitch.md](../docs/16-dac-ta-app-mobile-stitch.md)
- Cấu trúc thư mục, màn nào ở file nào, cách chạy, tiến độ: [docs/19-app-mobile.md](../docs/19-app-mobile.md)

```bash
flutter pub get    # cài thư viện (lần đầu / sau khi pull)
flutter run        # chạy trên máy ảo / điện thoại đang cắm
flutter analyze    # tìm lỗi
flutter test       # chạy test
```

Backend phải đang chạy (`npm run dev` ở thư mục gốc). Địa chỉ API: `lib/app/config.dart`.
