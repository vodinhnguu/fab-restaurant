# 19. App mobile Flutter (khách hàng)

App Flutter cho khách hàng nằm ở thư mục [`mobile/`](../mobile). Giao diện và quy tắc của từng màn lấy theo [16-dac-ta-app-mobile-stitch.md](16-dac-ta-app-mobile-stitch.md). Tài liệu này nói **file nằm ở đâu, sửa ở đâu, đang làm tới bước nào**.

- Công nghệ: Flutter 3.41, `go_router` (chuyển màn), `flutter_riverpod` (dữ liệu dùng chung), `google_fonts`.
- Riverpod dùng bản 2.6 (bản mới nhất chạy được với Flutter trên máy) và **viết tay**, không dùng phần tự sinh code (`riverpod_generator`, `build_runner`) để khỏi phải chạy thêm lệnh mỗi lần sửa.

---

## 1. Chạy app

**Cần có (làm 1 lần):**

1. Chấp nhận giấy phép Android: `flutter doctor --android-licenses`, gõ `y` cho tất cả.
2. VS Code cài extension **Flutter** (tự cài kèm Dart).
3. Một máy chạy thử: máy ảo Android (`flutter emulators` xem danh sách, `flutter emulators --launch <id>` để bật, vd `Medium_Phone_API_36.0`) hoặc điện thoại Android cắm cáp USB, bật "Gỡ lỗi USB". Trên Windows **không** chạy được iOS.
4. Backend đang chạy: `npm run dev` ở thư mục gốc.

**Chạy:**

| Cách | Làm gì |
|---|---|
| VS Code | Chọn thiết bị ở góc dưới phải, bấm F5, chọn **"App mobile (thiết bị đang chọn)"** |
| Terminal | `cd mobile` rồi `flutter run` |
| Xem nhanh trên Chrome | F5 chọn **"App mobile (Chrome)"**. Chỉ để xem giao diện: VNPay (WebView) không chạy trên Chrome, và muốn gọi API từ Chrome phải cho phép địa chỉ đó trong `CORS_ORIGIN` của backend |

Đang chạy mà sửa code: lưu file là app tự cập nhật (**hot reload**). Sửa `router.dart` / `main.dart` thì bấm `R` (hot restart).

**Địa chỉ API** ở [mobile/lib/app/config.dart](../mobile/lib/app/config.dart). Mặc định `http://10.0.2.2:4000/api/v1`: trong máy ảo Android, `10.0.2.2` chính là `localhost` của máy tính. Điện thoại thật thì dùng IP máy tính trong cùng Wi-Fi: `flutter run --dart-define=API_URL=http://192.168.1.10:4000/api/v1`.

**Kiểm tra trước khi báo xong:**

```bash
cd mobile
flutter analyze   # tìm lỗi, cảnh báo
flutter test      # chạy test (test/widget_test.dart)
```

**Lỗi thường gặp khi build Android:**

| Báo lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `The supplied javaHome seems to be invalid ... Android Studio\jbr\bin\java.exe` | Java đi kèm Android Studio bị thiếu / hỏng | `flutter config --jdk-dir "C:\Program Files\Microsoft\jdk-17..."` (đường dẫn JDK 17 trên máy). Vẫn lỗi thì Gradle đang nhớ tiến trình cũ: đổi tên file `%USERPROFILE%\.gradle\daemon\8.14\registry.bin` rồi build lại |
| `Failed to find Platform SDK with path: platforms;android-35` hoặc `some licences have not been accepted` | Chưa chấp nhận giấy phép Android nên Gradle không tự tải SDK được | `flutter doctor --android-licenses`, gõ `y` hết, build lại |

Lần build Android đầu tiên mất 5–10 phút vì Gradle tải thư viện về, các lần sau nhanh hơn nhiều.

---

## 2. Cấu trúc thư mục

```
mobile/
├─ design/                     ← ảnh Stitch xuất ra, đặt tên theo mã màn: S04.png, S05.png...
├─ test/widget_test.dart       ← test mở app, bấm qua các tab và màn
└─ lib/
   ├─ main.dart                ← khởi động app (ghép Riverpod + theme + router), không sửa nhiều
   ├─ app/
   │  ├─ config.dart           ← địa chỉ API, phiên bản app
   │  ├─ routes.dart           ← TÊN đường đi của từng màn (AppRoutes.menu(), AppRoutes.dish(slug)...)
   │  ├─ router.dart           ← đường đi nào MỞ màn nào
   │  └─ main_shell.dart       ← khung 5 tab dưới (+ thanh giỏ nổi ở Bước 3)
   ├─ theme/
   │  ├─ app_colors.dart       ← bảng màu (mục 2.1 docs/16)
   │  └─ app_theme.dart        ← font, nút, ô nhập, chip, thẻ (mục 2.2, 2.3)
   ├─ screens/                 ← MỖI MÀN 1 FILE, tên file bắt đầu bằng mã màn
   ├─ widgets/                 ← mảnh giao diện dùng ở ≥ 2 màn
   │  └─ placeholder_screen.dart  ← khung giữ chỗ, xóa khi làm xong cả 25 màn
   ├─ services/                ← (Bước 1) gọi API
   ├─ state/                   ← (Bước 1) dữ liệu dùng chung: đăng nhập, giỏ hàng, /info
   ├─ models/                  ← (Bước 1) Dish, Order, Reservation...
   └─ utils/                   ← (Bước 1) định dạng tiền / ngày, kiểm tra email / SĐT
```

So với web: `screens/` ≈ `frontend/src/pages/`, `widgets/` ≈ `components/`, `services/` ≈ `services/`, `state/` ≈ `stores/`.

---

## 3. Màn hình nào ở file nào

Muốn sửa màn nào: trong VS Code bấm `Ctrl+P`, gõ mã màn (vd `s05`) là ra file.

| Mã | Màn | File (trong `lib/screens/`) | Mở bằng |
|---|---|---|---|
| S01 | Splash | `s01_splash_screen.dart` | Tự mở khi vào app |
| S02 | Đăng nhập | `auth/s02_login_screen.dart` | `AppRoutes.login` |
| S03 | Đăng ký | `auth/s03_register_screen.dart` | `AppRoutes.register` |
| S04 | Trang chủ | `home/s04_home_screen.dart` | Tab, `AppRoutes.home` |
| S05 | Thực đơn | `menu/s05_menu_screen.dart` | Tab, `AppRoutes.menu(category: 'tom')` |
| S06 | Chi tiết món | `menu/s06_dish_detail_screen.dart` | `AppRoutes.dish(slug)` |
| S07 | Ghi chú khẩu vị (sheet) | `cart/s07_note_sheet.dart` | `showNoteSheet(context, dishName: ...)` |
| S08 | Giỏ hàng | `cart/s08_cart_screen.dart` | `AppRoutes.cart` |
| S09 | Thanh toán | `checkout/s09_checkout_screen.dart` | `AppRoutes.checkout` |
| S10 | Chọn mã giảm giá (sheet) | `checkout/s10_coupon_sheet.dart` | `showCouponSheet(context)` |
| S11 | Trang VNPay | `checkout/s11_vnpay_screen.dart` | `AppRoutes.vnpay(code)` |
| S12 | Kết quả thanh toán | `checkout/s12_payment_result_screen.dart` | `AppRoutes.paymentResult` |
| S13 | Chi tiết đơn hàng | `orders/s13_order_detail_screen.dart` | `AppRoutes.order(code, phone: ..., justPlaced: true)` |
| S14 | Đánh giá món (sheet) | `orders/s14_review_sheet.dart` | `showReviewSheet(context, dishName: ...)` |
| S15 | Đơn hàng của tôi | `activity/s15_my_orders_tab.dart` | Tab Hoạt động, `AppRoutes.activity()` |
| S16 | Tra cứu đơn / đặt bàn | `lookup/s16_lookup_screen.dart` | `AppRoutes.lookup(reservation: true)` |
| S17 | Đặt bàn | `reservation/s17_reservation_screen.dart` | Tab, `AppRoutes.reservation` |
| S18 | Chọn bàn trên sơ đồ | `reservation/s18_table_picker_screen.dart` | `AppRoutes.tablePicker` |
| S19 | Đặt bàn thành công | `reservation/s19_reservation_success_screen.dart` | `AppRoutes.reservationSuccess(code)` |
| S20 | Lịch đặt bàn của tôi | `activity/s20_my_reservations_tab.dart` | `AppRoutes.activity(reservations: true)` |
| S21 | Chi tiết đặt bàn | `reservation/s21_reservation_detail_screen.dart` | `AppRoutes.reservationDetail(code, phone: ...)` |
| S22 | Tài khoản | `account/s22_account_screen.dart` | Tab, `AppRoutes.account` |
| S23 | Sửa hồ sơ | `account/s23_edit_profile_screen.dart` | `AppRoutes.editProfile` |
| S24 | Đổi mật khẩu | `account/s24_change_password_screen.dart` | `AppRoutes.changePassword` |
| S25 | Thông tin nhà hàng | `account/s25_restaurant_info_screen.dart` | `AppRoutes.restaurantInfo` |
| – | Khung tab "Hoạt động" | `activity/activity_screen.dart` | Chứa 2 tab con S15, S20 |

---

## 4. Quy ước khi viết một màn hình

**Đầu file** luôn ghi màn này ứng với mục nào, gọi API nào, ảnh thiết kế ở đâu:

```dart
// S05. Thực đơn: xem docs/16-dac-ta-app-mobile-stitch.md mục S05
// API: GET /categories, GET /dishes?search=&category=<slug>&sort=&page=&limit=12
// Thiết kế: design/S05.png
```

**Đặt phần nào ở đâu:**

| Phần giao diện | Đặt ở |
|---|---|
| Chỉ màn này dùng (vd bottom sheet "Sắp xếp theo" của S05) | Cuối file màn đó, tên class bắt đầu bằng `_` (file khác không dùng được) |
| Dùng ở ≥ 2 màn (thẻ món, nhãn trạng thái, bộ chọn số lượng...) | `lib/widgets/` |
| File màn dài quá ~400 dòng (S04, S09, S13, S17 dễ bị) | Tách khối ra thư mục `parts/` cạnh nó, vd `home/parts/hero_banner.dart` |
| Bottom sheet dùng ở nhiều màn (S07, S10, S14) | File riêng có hàm `showXxxSheet(context, ...)` |

**Chuyển màn:**

| Lệnh | Khi nào | Ví dụ |
|---|---|---|
| `context.go(...)` | Chuyển tab, hoặc thay hẳn màn hiện tại (không quay lại được) | S09 đặt xong → S13 (không cho quay lại S09) |
| `context.push(...)` | Mở chồng lên, có nút ← | S05 → S06 |
| `context.pushReplacement(...)` | Thay màn đang đứng | S02 ↔ S03, S19 → S21 |
| `context.pop()` / `context.pop(ketQua)` | Quay lại / quay lại kèm kết quả | S18 trả bàn đã chọn về S17 |

Luôn dùng tên đường trong `AppRoutes`, không gõ tay chuỗi `'/menu'`.

**Làm thật một màn (thay khung giữ chỗ):**

1. Dán prompt Stitch của màn đó (docs/16), lưu ảnh vào `mobile/design/SXX.png`.
2. Mở file `sXX_...dart`, thay `PlaceholderScreen(...)` bằng giao diện thật.
3. Chạy thử, đối chiếu phần **"Bố cục"** và **"Trạng thái"** của màn đó trong docs/16.
4. `flutter analyze` và `flutter test` không lỗi. Test ở `test/widget_test.dart` đang bấm các nút của khung giữ chỗ, nên làm thật màn nào thì sửa test cho khớp màn đó.
5. Đánh dấu tiến độ ở mục 6, commit riêng màn đó, vd `App: màn S05 Thực đơn`.

---

## 5. Muốn sửa gì thì sửa ở đâu

| Muốn sửa | File |
|---|---|
| Màu cả app | `lib/theme/app_colors.dart` |
| Font, kiểu nút, ô nhập, chip, thẻ | `lib/theme/app_theme.dart` |
| Tên / icon / thứ tự 5 tab dưới | `lib/app/main_shell.dart` và các nhánh trong `lib/app/router.dart` |
| Thêm màn mới | Tạo file trong `lib/screens/`, thêm tên đường ở `routes.dart`, thêm `GoRoute` ở `router.dart` |
| Địa chỉ API | `lib/app/config.dart` hoặc `--dart-define=API_URL=...` |
| Tên app hiện trên điện thoại | `android/app/src/main/AndroidManifest.xml` (`android:label`) |

---

## 6. Lộ trình và tiến độ

| Bước | Làm gì | Xong |
|---|---|---|
| 0 | Project, theme, router, 5 tab, 25 màn giữ chỗ | ✅ |
| 1 | `api_client` (gắn token, xử lý 401 / 429), state chung (info, auth, giỏ hàng), widget cơ bản, định dạng tiền / ngày | ⬜ |
| 2 | S01 (thật), S02, S03, S22 | ⬜ |
| 3 | S04, S05, S06, S08, S07, thanh giỏ nổi | ⬜ |
| 4 | S09, S10, S13 | ⬜ |
| 5 | S11, S12 (VNPay) | ⬜ |
| 6 | S17, S18, S19, S21 | ⬜ |
| 7 | S15, S20, S16 | ⬜ |
| 8 | S23, S24, S25, S14 | ⬜ |
| 9 | Đi hết checklist mục 5 docs/16, xóa `placeholder_screen.dart` | ⬜ |

Đăng nhập làm sớm (Bước 2) vì S09, S15, S17, S20 có 2 trường hợp đã / chưa đăng nhập. Có đăng nhập trước thì mỗi màn làm xong một lần, không phải quay lại sửa.
