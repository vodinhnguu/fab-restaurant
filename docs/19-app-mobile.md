# 19. App mobile Flutter (nhân viên phục vụ)

App Flutter nằm ở thư mục [`mobile/`](../mobile), tên trên điện thoại **"FAB Phục vụ"**. Tài liệu này nói **file nằm ở đâu, sửa ở đâu, đang làm tới bước nào**.

Từ 20/11/2026 app **chỉ dành cho nhân viên phục vụ**: đăng nhập tài khoản nhân viên, chọn bàn, ghi món cùng khách, gửi bếp. Khách không dùng app (khách đặt online, đặt bàn trên web). Luồng nghiệp vụ, API: [23-app-nhan-vien-phuc-vu.md](23-app-nhan-vien-phuc-vu.md). Giao diện S01, S05, S06, S07, S08 vẫn theo thiết kế Stitch của app khách cũ ([16-dac-ta-app-mobile-stitch.md](16-dac-ta-app-mobile-stitch.md)).

Bản app khách cũ (trang chủ, thanh toán, VNPay, đặt bàn...) cất trong nhãn git `refs/du-phong/truoc-app-nhan-vien-20-11`, lấy lại 1 file: `git show refs/du-phong/truoc-app-nhan-vien-20-11:mobile/lib/screens/home/s04_home_screen.dart`.

- Công nghệ: Flutter 3.41, `go_router` (chuyển màn), `flutter_riverpod` (dữ liệu dùng chung), `dio` (gọi API), `flutter_secure_storage` (lưu token), `shared_preferences` (lưu giỏ hàng), `intl` (định dạng), `google_fonts`.
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

Bản **debug** được gọi `http://` (khai báo `usesCleartextTraffic` ở `android/app/src/debug/AndroidManifest.xml`). Bản phát hành thì server phải dùng `https`.

**Kiểm tra trước khi báo xong:**

```bash
cd mobile
flutter analyze   # tìm lỗi, cảnh báo
flutter test      # chạy test, KHÔNG cần bật backend (dùng server giả)

# Thử với backend thật (bật `npm run dev` trước). CÓ tạo 1 đơn thử rồi tự "Hủy cả đơn":
flutter test test/live_api_test.dart --dart-define=LIVE_API=true --dart-define=API_URL=http://localhost:4000/api/v1

# Build file cài Android (ra build/app/outputs/flutter-apk/app-debug.apk):
flutter build apk --debug
```

Thử bằng tay trên máy ảo: đăng nhập bằng nút tài khoản demo "Phục vụ" (`phucvu@fab.vn` / `123456`).

| File test | Kiểm tra gì |
|---|---|
| `test/widget_test.dart` | Chưa đăng nhập → S02; đã đăng nhập → S03; menu trái có tên, vai trò, 3 số của ca, đi qua 3 màn chính; nút back của điện thoại ở S10 → về S03 (đang mở menu thì chỉ đóng menu); bấm bàn → S04, quay lại; đăng xuất từ menu trái |
| `test/screens/s02_login_test.dart` | Nút tài khoản demo điền sẵn + đăng nhập → S03; tài khoản khách bị chặn; sai mật khẩu |
| `test/screens/s03_s04_table_test.dart` | S03 chọn khu, bàn "Chờ thu tiền"; S04 món theo lần gửi bếp + nhãn trạng thái + món hủy; Check món (tick / bỏ tick); Hủy món chờ bếp (hủy bớt phần, không lý do) / bếp đang làm (bắt lý do, chip); lỗi hiện trong sheet; Gửi thanh toán → về S03; Rút yêu cầu; Hủy cả đơn (bắt lý do); Order → S05; nút theo quyền (thu ngân, bếp); bàn trống; món bán theo kg "Chờ cân" có số kg phục vụ ghi (hiện "Ghi 1 kg ..." + tiền tạm) / đơn cũ chưa có số kg (chưa tính tiền), S09 khóa "Gửi thanh toán", món đã cân (hiện số kg, tiền = giá 1 kg × số kg) |
| `test/screens/s05_s08_ticket_test.dart` | S05 nút "+" thêm vào phiếu, thanh phiếu nổi; S08 "Gửi bếp" hỏi lại, dữ liệu gửi đi, xóa phiếu, về S04; "Xem lại" không gửi; món hết giữ phiếu; phiếu của bàn khác không gửi được; **Cất order** (về S03, khung "Order đã cất", bấm bàn → S04 "Mở order" → món hiện lại), **Hủy order** (hỏi lại, xóa phiếu, không gửi gì), đang ghi bàn T02 sang T01 "Ghi món" thì phiếu T02 tự cất |
| `test/screens/s10_s11_test.dart` | S10 tổng đã thu / đang phục vụ, lọc "Đã hủy", xem lại đơn + lý do hủy, bấm đơn đang mở → S04; S11 vai trò + quyền, đăng xuất xóa phiếu |
| `test/helpers/test_app.dart` | `pumpApp()`: mở cả app với server giả, khung 360 × 800; tài khoản giả (phục vụ, thu ngân, bếp, tạp vụ, khách), sơ đồ bàn, đơn đang mở, đơn hôm nay; `enterField`, `tapButton`, `sent` |
| `test/models/weight_test.dart` | Món bán theo kg ([docs/24](24-thuc-don-ban-theo-kg.md)): `formatKg` (dấu phẩy thập phân, bỏ số 0 thừa); tiền dòng món: chờ cân = tiền tạm theo số kg ghi (chưa có số kg = 0), đã cân = giá 1 kg × số kg làm tròn đồng, món theo phần = giá × số phần; phiếu gọi món: món theo kg mặc định 1 kg, tiền tạm = giá 1 kg × số kg, lưu / đọc số kg (phiếu cũ = 1 kg); `formatDecimal`, `parseDecimal` (gõ "0,98" hay "0.98") |
| `test/services/api_client_test.dart` | Bóc `data` / `meta`, gắn token, câu lỗi tiếng Việt, lỗi từng ô, 401, 429, mất mạng |
| `test/state/auth_state_test.dart` | Mở app có / không có token, token hết hạn, tài khoản mất quyền, đăng nhập nhân viên, chặn khách / tạp vụ, đăng xuất xóa phiếu |
| `test/state/cart_state_test.dart` | Phiếu gọi món: cộng dồn, tối đa 50, xóa / hoàn tác, ghi chú 200 ký tự, tắt app vẫn còn; order đã cất giữ số kg + ghi chú, tắt app vẫn còn, mở lại bàn thì món về phiếu, phiếu trống không cất |
| `test/utils/format_and_validators_test.dart` | `850.000đ`, giờ Việt Nam, "3 ngày trước", kiểm tra SĐT / email |
| `test/utils/notes_test.dart` | Chip gợi ý ghi chú theo danh mục, nối ghi chú bỏ ý trùng, tối đa 200 ký tự |
| `test/live_api_test.dart` | Gọi backend thật (mặc định bỏ qua): tài khoản khách bị chặn; phục vụ gửi bếp, check món, hủy món, gửi / rút thanh toán, hủy cả đơn |
| `test/helpers/fake_server.dart` | "Server giả" dùng chung cho các test trên |

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
├─ design/                     ← ảnh Stitch của app khách cũ (S01, S05, S06, S08 vẫn dùng giao diện này)
├─ test/                       ← xem bảng test ở mục 1
└─ lib/
   ├─ main.dart                ← khởi động app (ghép Riverpod + theme + router); hết phiên → màn Đăng nhập
   ├─ app/
   │  ├─ config.dart           ← địa chỉ API, phiên bản app
   │  ├─ routes.dart           ← TÊN đường đi: AppRoutes.table(5), AppRoutes.menu(5), AppRoutes.ticket(5)...
   │  ├─ router.dart           ← đường đi nào MỞ màn nào. S04, S05, S06, S08 là "con" của Sơ đồ bàn
   │  ├─ app_drawer.dart       ← MENU TRÁI kiểu CukCuk (nút ☰): tên, vai trò, 3 số của ca; Sơ đồ bàn · Đơn hôm nay ·
   │  │                           Tài khoản · Đăng xuất (confirmLogout dùng chung với S11)
   │  └─ main_shell.dart       ← khung giữ 3 màn chính; nút back ở S10 / S11 thì về S03 thay vì thoát app
   ├─ theme/                   ← app_colors.dart (bảng màu), app_theme.dart (font, nút, ô nhập, chip, thẻ)
   ├─ screens/                 ← MỖI MÀN 1 FILE, tên file bắt đầu bằng mã màn (mục 3)
   ├─ widgets/                 ← mảnh giao diện dùng ở ≥ 2 màn
   │  ├─ dish_card.dart        ← thẻ món (S05, S06): nút "+" thêm 1 phần vào phiếu gọi món
   │  ├─ dish_strip.dart       ← dải "Món cùng loại" cuộn ngang (S06)
   │  ├─ floating_cart_bar.dart ← thanh "Bàn B05 · 3 món / 850.000đ   Xem phiếu ›" (S05, S06)
   │  ├─ cart_icon_button.dart ← nút phiếu có số món (S05, S06)
   │  ├─ note_input.dart       ← chip gợi ý "+ Ít cay" + ô ghi chú khẩu vị 200 ký tự (S06, S07)
   │  ├─ status_badge.dart     ← nhãn trạng thái đơn (Đã gửi bếp, Đang chế biến, Đã lên món...)
   │  ├─ app_text_field.dart, app_button.dart, fab_logo.dart, app_network_image.dart, app_snackbar.dart,
   │  │  confirm_dialog.dart, state_views.dart, quantity_stepper.dart (+ WeightStepper số kg, bấm số để gõ), star_rating.dart, section_header.dart,
   │  │  bottom_panel.dart
   ├─ services/                ← gọi API (mỗi nhóm API 1 file)
   │  ├─ api_client.dart       ← CỬA NGÕ: gắn token, bóc data/meta, đổi lỗi sang tiếng Việt, 401, 429
   │  ├─ api_exception.dart, token_store.dart
   │  ├─ auth_service.dart     ← /auth/login, /auth/me
   │  ├─ dish_service.dart     ← /categories, /dishes; DishSort (5 cách sắp xếp ở S05)
   │  └─ dine_in_service.dart  ← /dine-in/* (sơ đồ bàn, 1 bàn, gửi bếp, check món, hủy món, gửi / rút thanh toán,
   │                              đơn hôm nay) + PATCH /orders/:id/status (hủy cả đơn);
   │                              floorProvider, tableDetailProvider, todayOrdersProvider
   ├─ state/                   ← dữ liệu dùng chung nhiều màn (Riverpod)
   │  ├─ app_providers.dart    ← apiClientProvider, kho lưu trên máy, sự kiện hết phiên
   │  ├─ auth_state.dart       ← authProvider, currentUserProvider; chỉ nhận nhân viên có quyền "Đơn hàng & gọi món"
   │  ├─ catalog_state.dart    ← categoriesProvider
   │  └─ cart_state.dart       ← PHIẾU GỌI MÓN (trong code vẫn tên cart): cartProvider, cartCountProvider,
   │                              cartSubtotalProvider, ticketTableProvider (phiếu đang ghi cho bàn nào)
   ├─ models/                  ← User (+ quyền), Category, Dish, DishDetail, Review, CartItem, Order (+ OrderItem có
   │                              trạng thái món, các lần gửi bếp, đã gửi thanh toán), DiningTable (+ x, y, FloorArea,
   │                              TableDetail), Paged, status.dart (OrderStatus, OrderItemStatus)
   └─ utils/                   ← format.dart (tiền, giờ VN), validators.dart, notes.dart (gợi ý ghi chú)
```

Màn dài thì tách khối vào thư mục `parts/` cạnh nó: S05 `menu/parts/` (`menu_toolbar` có sheet "Sắp xếp theo", `category_chips`), S06 `menu/parts/` (`dish_app_bar`, `dish_header`, `dish_reviews`), S08 `cart/parts/cart_item_tile.dart`.

So với web: `screens/` ≈ `frontend/src/pages/`, `widgets/` ≈ `components/`, `services/` ≈ `services/`, `state/` ≈ `stores/`.

---

## 3. Màn hình nào ở file nào

Muốn sửa màn nào: trong VS Code bấm `Ctrl+P`, gõ mã màn (vd `s04`) là ra file.

| Mã | Màn | File (trong `lib/screens/`) | Mở bằng | Trạng thái |
|---|---|---|---|---|
| S01 | Splash | `s01_splash_screen.dart` | Tự mở khi vào app | ✅ |
| S02 | Đăng nhập nhân viên (+ nút tài khoản demo) | `auth/s02_login_screen.dart` | `AppRoutes.login` | ✅ |
| S03 | Sơ đồ bàn (màn đầu, menu trái): chọn 1 trong 3 khu → bàn | `tables/s03_tables_screen.dart` | `AppRoutes.tables` | ✅ |
| S04 | Đơn của bàn: Check món / Hủy món / Order / Gửi thanh toán | `tables/s04_table_order_screen.dart` | `AppRoutes.table(id)` | ✅ |
| S05 | Chọn món | `menu/s05_menu_screen.dart` | `AppRoutes.menu(tableId)` | ✅ |
| S06 | Chi tiết món | `menu/s06_dish_detail_screen.dart` | `AppRoutes.dish(tableId, slug)` | ✅ |
| S07 | Ghi chú món (sheet) | `cart/s07_note_sheet.dart` | `showNoteSheet(context, item)` | ✅ |
| S08 | Phiếu gọi món ("Gửi bếp") | `cart/s08_cart_screen.dart` | `AppRoutes.ticket(tableId)` | ✅ |
| S09 | Gửi thanh toán (sheet) | `tables/s09_bill_request_sheet.dart` | `showBillRequestSheet(...)` | ✅ |
| S10 | Đơn hôm nay (menu trái) | `orders/s10_today_orders_screen.dart` | `AppRoutes.orders` | ✅ |
| S11 | Tài khoản (menu trái) | `account/s11_account_screen.dart` | `AppRoutes.account` | ✅ |
| S12 | Check món (sheet) | `tables/s12_check_items_sheet.dart` | `showCheckItemsSheet(...)` | ✅ |
| S13 | Hủy món (sheet) | `tables/s13_cancel_item_sheet.dart` | `showCancelItemSheet(...)` | ✅ |
| S14 | Nhập số kg (sheet) | `tables/s14_weigh_sheet.dart` | `showWeighSheet(...)` | ✅ |
| S15 | Quản lý · Tổng quan | `manager/s15_manager_screen.dart` | `AppRoutes.manager` | ✅ |
| S16 | Quản lý · Đơn đã hủy | `manager/s16_cancelled_screen.dart` | `AppRoutes.cancelled` | ✅ |
| S17 | Quản lý · Kiểm bia nước | `manager/s17_drink_check_screen.dart` | `AppRoutes.drinks` | ✅ |

Dòng món dùng chung cho S04, S09, S12, S13: `OrderItemRow` (trong `s04_table_order_screen.dart`): "2× Tôm sú … 500.000đ", ghi chú, nhãn trạng thái (Chờ bếp / Bếp đang làm / Đã ra bàn / Đã hủy), món hủy gạch ngang + lý do.

**Chuyển giữa 3 màn chính** (S03, S10, S11) bằng **menu trái** giống app CukCuk: bấm nút ☰ góc trái thanh tiêu đề hoặc vuốt từ mép trái màn hình. Đầu menu có tên, vai trò và 3 số của ca (bàn có khách, bàn trống, tiền đang phục vụ; trước 22/11 nằm ở đầu S03). Mỗi màn chính tự gắn menu bằng `Scaffold(drawer: const AppDrawer(current: AppSection.tables))`, Flutter tự thêm nút ☰. Nút back của điện thoại ở S10 / S11 về S03; ở S03 mới thoát app.

Đường đi: `/tables` (S03) → `/tables/5` (S04) → `/tables/5/menu` (S05) → `/tables/5/menu/dish/tom-hum` (S06); `/tables/5/ticket` (S08). Nút quay lại đi ngược từng bước. Gửi bếp xong `context.go(AppRoutes.table(5))` là về thẳng S04.

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
| File màn dài quá ~400 dòng (S04, S05, S06 dễ bị) | Tách khối ra thư mục `parts/` cạnh nó, vd `menu/parts/dish_header.dart` |
| Bottom sheet (S07, S09) | File riêng có hàm `showXxxSheet(context, ...)` |

**Chuyển màn:**

| Lệnh | Khi nào | Ví dụ |
|---|---|---|
| `context.go(...)` | Chuyển tab, đi tới màn "con", hoặc về hẳn 1 màn (bỏ các màn phía trên) | S03 bấm bàn → S04; S08 gửi bếp xong → về S04 |
| `context.push(...)` | Mở chồng lên, có nút ← | S05 → S06 |
| `context.pop()` / `Navigator.pop(context, ketQua)` | Quay lại / đóng sheet kèm kết quả | S09 thu tiền xong trả `true` về S04 |

Luôn dùng tên đường trong `AppRoutes`, không gõ tay chuỗi `'/tables/5'`.

**Dùng dữ liệu chung và gọi API trong màn hình** (Riverpod):

```dart
// 1. Màn cần dữ liệu chung thì kế thừa ConsumerWidget (hoặc ConsumerStatefulWidget nếu có ô nhập)
class AccountScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);   // null = khách. Đổi là màn tự vẽ lại
    final count = ref.watch(cartCountProvider);     // số món trong phiếu gọi món
    ...
  }
}

// 2. Dữ liệu tải từ API: AsyncView lo sẵn đang tải / lỗi / mất mạng / "Thử lại" (mục C01)
AsyncView(
  value: ref.watch(floorProvider),
  onRetry: () => ref.invalidate(floorProvider),
  data: (areas) => Text('${areas.length} khu vực'),
)

// 3. Bấm nút gọi API: bắt ApiException, hiện câu lỗi tiếng Việt của backend
Future<void> _submit() async {
  try {
    await ref.read(authProvider.notifier).login(email: email, password: password);
    showAppSnack('Xin chào, ${ref.read(currentUserProvider)!.name}!');
  } on ApiException catch (e) {
    // e.fieldErrors['email'] → hiện dưới ô Email; e.retryAfterMinutes → lỗi 429
    showAppSnack(e.message, error: true);
  }
}

// 4. Phiếu gọi món (giỏ của nhân viên)
ref.read(cartProvider.notifier).add(item);
final removed = ref.read(cartProvider.notifier).remove(dishId);
showAppSnack('Đã xóa món', action: 'Hoàn tác', onAction: () => ref.read(cartProvider.notifier).restore(removed!));
```

**Ẩn / hiện nút theo quyền** (ma trận phân quyền, chức năng "Đơn hàng & gọi món"). Backend vẫn tự kiểm tra lại, app chỉ ẩn cho gọn:

```dart
final user = ref.watch(currentUserProvider);
if (user?.canTakeOrder ?? false) ...   // Thêm = ghi món, gửi bếp (phục vụ, tổ trưởng, quản lý)
if (user?.canUpdateOrder ?? false) ... // Sửa = lên món, hủy... (thêm thu ngân, tiếp thực)
```

Đã lo sẵn ở `api_client.dart`, màn hình **không** phải tự làm:
- Gắn token vào mọi request.
- Gặp 401 khi đang đăng nhập (token hết hạn): tự xóa token, hiện "Phiên đăng nhập đã hết hạn...", về S02, phiếu gọi món giữ nguyên.
- Sai mật khẩu (401 khi chưa đăng nhập) chỉ báo lỗi bình thường.

**Thêm / sửa một màn:**

1. Sửa file `sXX_...dart` (thêm màn mới: tạo file, thêm tên đường ở `routes.dart`, `GoRoute` ở `router.dart`).
2. Chạy thử trên máy ảo, xem cả máy hẹp (360 điểm ảnh) và chữ to: hàng (Row) có chữ dài thì bọc `Expanded` / `Flexible`, nhiều nút / chip thì dùng `Wrap` để tự xuống dòng.
3. `flutter analyze` và `flutter test` không lỗi; thêm / sửa test của màn đó.
4. Cập nhật bảng mục 3, mục 6.

---

## 5. Muốn sửa gì thì sửa ở đâu

| Muốn sửa | File |
|---|---|
| Màu cả app | `lib/theme/app_colors.dart` |
| Font, kiểu nút, ô nhập, chip, thẻ | `lib/theme/app_theme.dart` |
| Tên / icon / thứ tự mục ở menu trái, khối thông tin đầu menu | enum `AppSection` và `_Header` ở `lib/app/app_drawer.dart` (thứ tự nhánh trong `lib/app/router.dart` phải khớp `AppSection`) |
| Thêm màn mới | Tạo file trong `lib/screens/`, thêm tên đường ở `routes.dart`, thêm `GoRoute` ở `router.dart` |
| Địa chỉ API | `lib/app/config.dart` hoặc `--dart-define=API_URL=...` |
| Ai dùng được app (quyền) | `lib/models/user.dart` (`canUseApp`, `canTakeOrder`, `canUpdateOrder`), câu báo: `notStaffMessage` ở `lib/state/auth_state.dart` |
| Tài khoản demo trên màn đăng nhập | `demoAccounts` ở `lib/screens/auth/s02_login_screen.dart` |
| Tự tải lại sơ đồ bàn / đơn của bàn (15 giây) | `refreshEvery` ở `s03_tables_screen.dart`, `s04_table_order_screen.dart` |
| Quy tắc phiếu gọi món (tối đa 50 phần, ghi chú 200 ký tự, bàn của phiếu) | `lib/state/cart_state.dart` |
| Chữ / màu nhãn trạng thái đơn | `lib/models/status.dart` (chữ), `lib/widgets/status_badge.dart` (màu) |
| Câu báo lỗi chung (mất mạng, 404, 429...) | `lib/services/api_client.dart` (cuối file) |
| Cách hiện tiền, ngày giờ, số kg ("1,25 kg") | `lib/utils/format.dart` (`formatKg` cho số kg) |
| Món nào bán theo kg, tiền 1 dòng món theo kg | `soldByWeight` (đơn vị `kg`) ở `lib/models/dish.dart`, `lib/models/cart_item.dart`; `lineTotal`, `isWeighing` ở `lib/models/order.dart` (phải khớp `lineTotal` ở backend, xem [docs/24](24-thuc-don-ban-theo-kg.md)) |
| Tên app hiện trên điện thoại ("FAB Phục vụ") | `android/app/src/main/AndroidManifest.xml` (`android:label`) |

---

## 6. Lộ trình và tiến độ

| Bước | Làm gì | Xong |
|---|---|---|
| 0–4 | App khách: khung, đăng nhập, thực đơn, chi tiết món, giỏ, thanh toán, theo dõi đơn | ✅ (phần khách bỏ ngày 20/11, xem nhãn dự phòng ở đầu file) |
| 5 | Backend đơn ăn tại quán `DINE_IN` (bàn, nhân viên ghi món) | ✅ 20/11 |
| 6 | Đổi thành app nhân viên: bỏ 16 màn của khách, 3 tab, S01–S11 bản đầu, sửa bố cục (thanh phiếu nổi, chip lọc S10) | ✅ 20/11 |
| 7 | Luồng phục vụ mới: S03 chọn khu, S04 Check món / Hủy món / Order / Gửi thanh toán, S09, S12, S13; backend trạng thái từng món, web Bếp + Thu ngân (in bill) | ✅ 21/11 |
| 8 | Kiểm tra: 63 test app, live test backend thật 2/2, script API cả quy trình 28/28, web lint + build, build APK, chụp bố cục 360 × 800 | ✅ 21/11 |
| 8b | Đổi 3 tab dưới thành **menu trái kiểu CukCuk** (nút ☰): tên + 3 số của ca chuyển từ đầu S03 vào menu, nút back ở S10 / S11 về S03; 65 test qua | ✅ 22/11 |
| 8c | **Thực đơn bán theo kg** ([docs/24](24-thuc-don-ban-theo-kg.md)): món hải sản sống "Chờ cân" tới khi có số kg thật (lúc đó hồ hải sản cân trên web, từ 23/11 phục vụ nhập trên app, xem 8f); S03 ô bàn "1 chờ cân", S04 "Chờ cân" / "Đã cân 1,25 kg × ...", S05 / S06 giá "/kg", S08 tiền "Chờ cân" (sau đó đổi thành số kg sửa được, xem bước 8d), S09 khóa "Gửi thanh toán" khi còn món chưa cân, S13 món kg hủy cả dòng; thêm `test/models/weight_test.dart` + 2 test S04 / S09; 72 test qua | ✅ 22/11 |
| 8d | **Phục vụ ghi số kg** ([docs/24](24-thuc-don-ban-theo-kg.md) mục 3): mặc định 1 phần / 1 kg, sửa được; `WeightStepper` (−/+ 0,1 kg) và **bấm vào số để gõ** (`showAmountDialog`, cả số phần) ở `widgets/quantity_stepper.dart`; `CartItem.weight`, `CartNotifier.setWeight` (0,05 – 30 kg, làm tròn gam); S06, S08 tiền tạm = giá 1 kg × số kg; gửi bếp kèm `weight`; S04 "Ghi tạm 1 kg ... · chờ cân tại hồ"; web Cân hải sản điền sẵn số kg phục vụ ghi; 78 test qua | ✅ 22/11 |
| 8e | **3 nút dưới phiếu gọi món (S08) như CukCuk**: Hủy order · Cất order · Gửi bếp. Order đã cất theo từng bàn (`savedTicketsProvider` ở `state/cart_state.dart`, lưu trên máy), S03 khung "Order đã cất" + ô bàn có dấu, S04 "Mở order", đổi bàn tự cất phiếu ghi dở (bỏ hộp hỏi "Bỏ phiếu cũ"); bỏ nút "Xóa hết" trên thanh tiêu đề S08; 83 test qua | ✅ 22/11 |
| 8f | **Phục vụ nhập số kg tại hồ** ([docs/24](24-thuc-don-ban-theo-kg.md) mục 3): đổi tác nhân nhập số kg từ hồ hải sản (web) sang **phục vụ** (app) vì phục vụ dẫn khách ra hồ cân cùng khách. S04 khung xanh "N món bán theo kg chờ cân" + nút **Nhập số kg** → sheet **S14** (`[ − ] 1 kg [ + ]` từng món, tiền xem trước, "Lưu số kg (N món)"); `DineInService.weighItem`; backend mở quyền `ORDERS` Sửa cho `POST /dine-in/items/:id/weigh`; web `/admin/weighing` thành trang theo dõi + cân lại của hồ hải sản / quản lý; 85 test qua | ✅ 23/11 |
| 8g | **Nhóm Quản lý trong app** ([docs/28](28-app-quan-ly.md)): S15 Tổng quan (doanh thu hôm nay / tháng, tách tại quán - online, đơn đã hủy, bàn đang phục vụ, bia & nước, tồn hồ, món bán chạy) và S16 Đơn đã hủy (chip Hôm nay / 7 ngày / Tháng này, lý do hủy từng đơn, món hủy lẻ); mục menu trái chỉ hiện cho ai có quyền Xem "Tổng quan", `ManagerGuard` chặn mở thẳng đường dẫn; sau đăng nhập quản lý vào thẳng S15; backend thêm `GET /stats/manager`, `GET /stats/cancellations`; 98 test qua | ✅ 24/11 |
| 8h | **Kiểm bia nước** ([docs/29](29-kiem-bia-nuoc.md)): S17 - xuất bia nước ra quầy theo **thùng**, kiểm số trả lại cuối **ngày**, lệch = (bán + trả lại) − xuất (**âm = thiếu**, dương = thừa); "bán" backend tự tính theo đơn; chọn ngày xem lại; chức năng quyền mới `DRINKS`; `ApiClient` thêm `put` và `ApiResponse.message`; 102 test qua | ✅ 24/11 |
| 9 | Chạy thử bằng tay trên máy ảo / điện thoại (phục vụ trên app, bếp + thu ngân trên web), cập nhật docs/17, chụp ảnh báo cáo | ⬜ |

---

## 7. Thiết kế Stitch

> Mục này ghi lại thiết kế Stitch của **app khách cũ** (trước 20/11/2026), giữ để biết lịch sử. Các màn S04 Trang chủ, S09 Thanh toán, S13 Theo dõi đơn... đã bỏ khỏi app; giao diện S01, S05, S06, S07, S08 vẫn dùng (S05 thành "Chọn món", S08 thành "Phiếu gọi món"). Mã màn trong mục này là mã cũ.

Project Stitch có **17 màn**: S01, S02, S03, S04, S05, S06, S08, S09, S13, S15, S16, S17, S18, S19, S20, S22, S23. Các màn còn lại (S07, S10, S11, S12, S14, S21, S24, S25 và các trạng thái C01) chưa vẽ trên Stitch, nên làm theo docs/16 và hệ màu mục 2.

**Thứ tự làm giao diện theo Stitch** (người dùng gửi ảnh từng màn, lưu vào `mobile/design/SXX.png`):

| Màn | Ảnh | Đã làm theo thiết kế |
|---|---|---|
| S01 Splash | `design/S01.png` | ✅ |
| S04 Trang chủ | `design/S04.png` (bản chuẩn), `S04-v2.png` | ✅ |
| S05 Thực đơn | `design/S05.png` | ✅ |
| S06 Chi tiết món (+ S07 ghi chú) | `design/S06.png` | ✅ (S07 làm cùng S08) |
| S08 Giỏ hàng (+ S07) | `design/S08.png` | ✅ |
| S09 Thanh toán (+ S10, S11, S12) | `design/S09.png` | ✅ S09, S10 (S11, S12 làm ở Bước 5) |
| S13 Chi tiết đơn (+ S14) | `design/S13.png` | ✅ (S14 làm cùng) |
| S17 Đặt bàn | | ⬜ |
| S18 Chọn bàn | | ⬜ |
| S19 Đặt bàn thành công (+ S21) | | ⬜ |
| S15 Đơn hàng của tôi | | ⬜ |
| S20 Lịch đặt bàn của tôi | | ⬜ |
| S16 Tra cứu | | ⬜ |
| S22 Tài khoản | | ⬜ (đã có bản theo docs/16, sửa lại khi có ảnh) |
| S02 Đăng nhập | | ⬜ (như trên) |
| S03 Đăng ký | | ⬜ (như trên) |
| S23 Thông tin cá nhân (+ S24, S25) | | ⬜ |

Màn trong ngoặc (+) không có trên Stitch, làm cùng lúc với màn dẫn tới nó vì cần nhau (vd giỏ hàng cần ô ghi chú S07).

**S13 theo thiết kế** (S14 làm cùng, Stitch không vẽ S14). Khác ảnh Stitch:
- Tiêu đề thanh trên "Theo dõi đơn hàng" (ảnh ghi "S10. Theo Dõi Đơn Hàng Fab..." là tên khung của Stitch). Nút nhà bên phải về S04.
- "● Theo dõi trực tiếp" và dòng "Trạng thái tự động cập nhật mỗi 15 giây" chỉ hiện khi đơn **còn đang xử lý**. Đơn Hoàn thành / Đã hủy không đổi nữa nên thôi tự tải lại: backend chỉ cho tra cứu 60 lần / 15 phút mỗi mã đơn, tải mỗi 15 giây là vừa chạm mức đó.
- Nhãn trạng thái giữ màu theo bảng của docs/16 (ảnh vẽ nhãn "Đang chế biến" nền xanh đậm), để S13, S15 cùng một kiểu màu.
- "Hủy đơn" chỉ hiện khi đơn **Chờ xác nhận và chưa trả tiền** (ảnh vẽ nút cả khi đang chế biến). Đã trả VNPay: "Đơn đã thanh toán, vui lòng gọi {hotline} để hủy và hoàn tiền" + nút "Gọi".
- Khung "Dự kiến giao hàng lúc 19:35 - 19:50 (khoảng 35 phút nữa)": backend không có giờ giao, nên app tính **giờ đặt + 30 đến 45 phút**, khớp chữ "Khoảng 30-45 phút" khách đã thấy ở S09. Chỉ hiện với giao tận nơi, đơn còn đang xử lý, chưa quá giờ dự kiến. Muốn bỏ thì xóa `_deliveryWindow()` trong `orders/parts/order_status_card.dart`.
- Món trong ảnh có dòng mô tả ("Kèm nước tương Nhật & wasabi tươi"): đơn chỉ lưu tên, giá, ghi chú của món nên app chỉ hiện "Ghi chú: ..." khi có. Bấm vào món → S06.
- Số "3 món" là tổng số phần (giống "Đơn hàng (3 món)" ở S09).
- Vừa đặt xong (S09 mở bằng `context.go`, không còn màn trước): nút ← và nút quay lại của điện thoại về S04 chứ không thoát app.
- S14: ảnh + tên món, 5 sao (mặc định 5) kèm chữ "Rất tệ" → "Tuyệt vời", ô nhận xét 1000 ký tự, "Gửi đánh giá". Lỗi backend (vd 403 "Bạn cần đặt và nhận món này trước khi đánh giá") hiện ngay trong sheet vì snackbar bị sheet che. Gửi xong: "Cảm ơn bạn đã đánh giá!", S06 tải lại điểm.

**S04 theo thiết kế** (lấy bản `S04.png`; bản `S04-v2.png` có ô "img" lỗi ảnh). Khác ảnh Stitch:
- Ảnh banner dùng chung ảnh trang chủ web (hải sản trên đá). Ảnh Stitch là biển Đà Nẵng ban đêm, chưa có file ảnh này; có ảnh thì thay hằng `_heroImage` trong `home/parts/hero_banner.dart`.
- Vé ưu đãi hiện số giảm + `description` của mã; bảng `Coupon` không có "tên ưu đãi" kiểu "Ưu đãi chào mừng".
- "Khách hàng nói gì" là 3 lời đánh giá mẫu cố định trong `home/parts/testimonials.dart` (docs/16 ghi rõ là thẻ mẫu).
- Nhãn trên ảnh thẻ món: "-14%" khi giảm giá; "Đặc biệt" cho món nổi bật, món thường thì hiện tên danh mục (như thẻ "Món Nhật" trong ảnh).
- Avatar góc phải: chưa đăng nhập là icon người, đã đăng nhập là chữ cái đầu; bấm → tab Tài khoản.
- Không dùng `IntrinsicHeight` cho các ô có chữ: font Google tải chậm làm chiều cao tính sai, chữ tràn khỏi ô.

**S09 theo thiết kế** (S10 làm cùng, Stitch không vẽ S10). Khác ảnh Stitch:
- Thanh trên chỉ có ← và "Thanh toán" (bỏ logo, nút nhà).
- Thanh dưới: "Tổng cộng" ở trên, nút ở dưới rộng hết chiều ngang (ảnh đặt cạnh nhau), vì chữ "Đặt hàng & thanh toán VNPay" dài.
- Chip mã công khai viền coral liền (ảnh vẽ nền xám; docs/16 ghi viền đứt, Flutter không có sẵn viền đứt).
- Món trong đơn ghi "Tôm sú hấp bia × 2" như ảnh (docs/16 ghi số lượng tròn ở góc ảnh). Món chưa có ghi chú hiện "+ Thêm ghi chú", bấm mở S07.
- "Phí giao hàng": đủ mức thì "Miễn phí" + "Đơn từ 500.000đ được miễn phí giao hàng", chưa đủ thì "20.000đ" + "Mua thêm ... để được miễn phí giao hàng". Đến lấy tại quán: ẩn ô địa chỉ, "Miễn phí", không có dòng nhắc.
- Khách đăng nhập (sẵn, hoặc bấm "Đăng nhập" ở khối ②): tự điền tên, SĐT, địa chỉ vào ô **còn trống**, không đè chữ đã gõ.
- Bấm đặt hàng mà có ô lỗi: cuộn tới ô lỗi đầu tiên. Lỗi từng ô do backend trả về cũng hiện dưới ô.
- Backend báo món hết hàng / không còn: snackbar + về S08. Mã giảm giá hết lượt / hết hạn đúng lúc đặt: tự bỏ mã, báo lý do, ở lại S09 để khách xem lại tổng tiền.
- Ở S09 không đổi được số lượng (chỉ sửa ghi chú), nên tạm tính không đổi khi đang mở; muốn đổi món thì "Chỉnh sửa" về S08, quay lại S09 thì áp mã lại.
- **VNPay:** đặt xong S09 xin link (`POST /payments/vnpay/:code`) rồi mở S11 bằng `context.go(AppRoutes.vnpay(code, phone: ...), extra: link)`. S11 hiện vẫn là khung giữ chỗ (Bước 5 làm WebView). Xin link lỗi: "Đã đặt đơn nhưng chưa mở được VNPay: ..." rồi sang S13.
- S10: vé gồm số giảm to, mô tả, mã; nút "Dùng mã"; chưa đủ đơn tối thiểu thì vé mờ + "Mua thêm ..."; mã đang áp có nhãn "Đang dùng". Bấm "Dùng mã" → đóng sheet, S09 kiểm tra mã rồi áp.

**S08 theo thiết kế** (S07 làm cùng, Stitch không vẽ S07). Khác ảnh Stitch:
- Không có thanh logo, thanh tab, thanh giỏ nổi (Stitch vẽ cả 3): S08 mở toàn màn hình theo docs/16, đang ở giỏ thì không cần thanh "Xem giỏ".
- **Không làm** công tắc "Lấy dụng cụ ăn uống dùng một lần": bảng `Order` không có trường này. Muốn có thì có thể ghi vào "Ghi chú cho nhà hàng" của đơn ở S09.
- **Không làm** khối "Tóm tắt đơn hàng" (tạm tính, phí vận chuyển, thành tiền): lặp lại số "Tạm tính" ở dưới cùng, mà phí giao hàng còn tùy khách chọn giao tận nơi hay tự đến lấy (chọn ở S09), nên tiền đầy đủ để S09 tính.
- "Ưu đãi vận chuyển" lấy mức từ `/info` (`freeShippingMin`): chưa đủ thì "Mua thêm 150.000đ để được miễn phí giao hàng (đơn từ 500.000đ)", đủ thì nhãn "Đã đạt". `/info` chưa tải được thì ẩn khối.
- Xóa món (thùng rác, hoặc giảm về 0): snackbar "Đã xóa ..." + "Hoàn tác" đặt món về đúng chỗ cũ, giữ ghi chú. "Xóa hết" hỏi lại "Xóa tất cả món trong giỏ?".
- S07: "Ghi chú cho {tên món}" + chip gợi ý theo danh mục + ô 200 ký tự + "Xong". Bấm "Xong" mới lưu, đóng (×) hoặc vuốt xuống thì bỏ thay đổi.

**S06 theo thiết kế.** Khác ảnh Stitch:
- **Giữ theo docs/16:** mở toàn màn hình, không có thanh tab (ảnh Stitch vẽ thanh tab). Dưới cùng là thanh cố định `[ − ] 1 [ + ]` + "Thêm vào giỏ · 250.000đ" (ảnh Stitch thiếu thanh này); giỏ có món thì thanh giỏ nổi hiện ngay trên. Không có thanh logo phía trên ảnh: ảnh tràn mép trên, nút ← và nút giỏ nổi trên ảnh, cuộn lên thì thu thành thanh có tên món.
- **Không làm** (backend không có dữ liệu, không hiện số liệu bịa): nút tim yêu thích, nhãn "Đánh bắt trong ngày · Đà Nẵng", "Chế biến: 10 - 15 phút", "Khẩu phần: 2-3 người", nhãn "Tươi sống" / "Bán chạy" trên món gợi ý.
- "100% khách đã ăn" đổi thành "Từ khách đã nhận món": đúng quy tắc backend (chỉ khách có đơn đã hoàn thành chứa món mới đánh giá được), không phải con số thống kê.
- Ô **"Ghi chú khẩu vị"** (chip gợi ý theo danh mục + ô 200 ký tự) đặt dưới mô tả, theo quyết định ở bảng dưới. Bấm "Thêm vào giỏ" thì ghi chú đi kèm rồi ô được xóa, số lượng về 1.
- Món gợi ý dùng thẻ món chung (như S04, S05) thay vì thẻ nhỏ "+ Thêm" của Stitch. "Xem tất cả ›" mở S05 lọc sẵn danh mục của món.
- Giỏ đã có gần 50 phần mà thêm vượt: báo "Mỗi món tối đa 50 phần, giỏ đang có 49 phần", không thêm.
- Khách bấm "Đăng nhập để đánh giá..." → S02, đăng nhập xong mở luôn S14. Đóng S14 thì S06 tải lại để thấy đánh giá mới.
- Món không còn (404): "Không tìm thấy món ăn" + nút "Xem thực đơn".

**S05 theo thiết kế.** Khác ảnh Stitch:
- **Thẻ món dùng chung đổi theo S05**, nên thẻ ở S04 cũng đổi theo (docs/16 quy định 1 thẻ cho S04, S05, S06 và mô tả giống ảnh S05). Thẻ gồm: "-15%" góc trái, "🔥 Đặc biệt" nền trắng góc phải, tên danh mục in hoa, giá gốc gạch ngang trên giá bán, "/phần" lấy từ `unit` của món. Món không giảm giá vẫn chừa chỗ dòng giá gốc để các thẻ cùng hàng cao bằng nhau. Sao đánh giá tô đặc như ảnh S04 (ảnh S05 vẽ sao rỗng, dễ hiểu nhầm là "chưa đánh giá").
- Thanh trên dùng chung với S04 (`widgets/brand_top_bar.dart`), giữ dòng "ĐÀ NẴNG COASTAL DINING" (ảnh S05 ghi "Ẩm thực biển cao cấp") cho 2 tab giống nhau.
- Ô tìm trong ảnh có 2 lớp viền là lúc Stitch vẽ ô đang được chọn; app dùng 1 ô, có nút (x) xóa chữ.
- Ô "Chế biến theo khẩu vị" (Stitch thêm, docs/16 không có): **làm**, hiện ở cuối danh sách khi đã tải hết món.
- Thêm so với docs/16: trống mà đang lọc thì có nút "Xem tất cả món" (bỏ từ khóa và danh mục); kéo xuống để tải lại.
- Danh mục đang lọc nằm trên đường đi `/menu?category=tom`: bấm chip cũng là đổi đường đi, nên mở từ S04 hay bấm chip đều tải lại cùng một cách. Mở S05 với danh mục ở cuối dải (vd "Đồ uống") thì dải chip tự cuộn tới chip đó.
- "Giá thấp → cao" / "Giá cao → thấp": backend xếp theo **giá gốc** (`price`), nên món đang khuyến mãi có thể đứng lệch so với giá bán đang hiện.

**S01 theo thiết kế:** logo con cá vẽ bằng code (`widgets/fab_logo.dart`, dùng chung cho S02, S03), nền có vòng tròn và đường sóng mờ. Khác ảnh Stitch: dòng "Phiên bản 2.4.0 · Luồng S01 ➔ S02" là ghi chú của Stitch nên app hiện "Phiên bản 1.0.0"; nút "Chạm để đăng nhập" bấm trong lúc tải thì tải xong mở S02 (đã đăng nhập thì vào thẳng S04); mất mạng thì hiện "Mất kết nối mạng" + "Thử lại" ngay trên nền Splash.

Sơ đồ luồng Stitch sinh ra **khớp với docs/16** ở các điểm chính: 5 tab chỉ hiện ở màn gốc; S06, S08, S09, S13 mở toàn màn hình, không có thanh tab; thanh giỏ nổi ở S04, S05, S06; quay lại giữ nguyên bộ lọc và vị trí cuộn; khách không đăng nhập vẫn đặt món, đặt bàn được.

**Chỗ Stitch vẽ khác docs/16 và cách xử lý:**

| Stitch vẽ | Xử lý | Lý do |
|---|---|---|
| S06 có chip gợi ý + ô ghi chú khẩu vị ngay ở chi tiết món | **Làm**: thêm vào giỏ kèm ghi chú. Món đã có trong giỏ thì nối ghi chú mới vào bằng ", " (bỏ qua nếu trùng), tối đa 200 ký tự. Vẫn sửa được ở giỏ qua S07 | Backend nhận ghi chú từng món, làm được |
| S08 có dòng mức miễn phí giao hàng ("Đã đạt miễn phí giao hàng") | **Làm**: tính từ `freeShippingMin` của `/info`: "Mua thêm 150.000đ để được miễn phí giao hàng" / "Đã đạt mức miễn phí giao hàng" | Có sẵn dữ liệu |
| S22 có "Danh hiệu Ngọc Trai", điểm tích lũy | **Không làm** | Backend không có điểm thưởng (mục 1.4 docs/16) |
| S06 có "thời gian chế biến", "nguồn gốc đánh bắt trong ngày" | **Không làm**, chỉ hiện mô tả món | Bảng `Dish` không có các trường này, không hiện số liệu bịa |
| S05 món hết hàng "mờ nút + nhãn Tạm hết" | Theo docs/16: không hiện ở danh sách | Backend tự ẩn món hết hàng khỏi `/dishes` |
| S19 "Xem chi tiết" → S20 hoặc S21 | Theo docs/16: mở S21 | Xem đúng lịch vừa đặt |
