# 16. Đặc tả app mobile cho khách hàng (để gửi Stitch AI)

Tài liệu này mô tả **từng màn hình** của app mobile FAB Seafood dành cho **khách hàng**, dựa đúng trên những gì backend hiện có. Mục đích:

1. Dán vào **Stitch AI** để sinh giao diện (UI) cho từng màn hình.
2. Dùng lại khi viết app **Flutter**: mỗi màn hình đã ghi rõ gọi API nào, kiểm tra gì, báo lỗi gì.

> **Stitch chỉ vẽ giao diện**, không viết logic. Phần "Quy tắc" và "API" bên dưới là để bạn (và Flutter) làm cho đúng, không cần dán vào Stitch.

---

## 0. Cách dùng tài liệu này với Stitch

1. Mở Stitch, chọn chế độ **Mobile**.
2. Dán **Prompt chung (mục 2)** trước để Stitch nắm màu sắc, font, phong cách. Nếu Stitch cho tạo "theme" / "design system" thì dán vào đó.
3. Sau đó **mỗi lần chỉ dán 1 prompt màn hình** (khối `Prompt Stitch` ở mỗi mục). Stitch làm từng màn hình một sẽ đúng và đẹp hơn dán cả tài liệu.
4. Sinh xong, đối chiếu với **"Bố cục"** và **"Trạng thái"** của màn hình đó. Thiếu gì thì nhắn Stitch sửa thêm, ví dụ: *"Add the empty state: ..."*.
5. Prompt viết bằng **tiếng Anh** (Stitch hiểu tiếng Anh tốt nhất), còn **chữ trên giao diện để tiếng Việt** trong dấu ngoặc kép. Đừng để Stitch dịch các chữ này.

**Không** để Stitch tự thêm chức năng mà backend chưa có (xem mục 1.4). Nếu Stitch tự vẽ thêm, xóa đi.

---

## 1. Tổng quan app

### 1.1. App làm được gì

FAB Seafood là nhà hàng hải sản ở Đà Nẵng. App cho khách:

| Nhóm | Việc khách làm |
|---|---|
| Xem món | Xem thực đơn theo danh mục, tìm món, sắp xếp, xem chi tiết và đánh giá |
| Đặt món | Thêm vào giỏ, ghi chú khẩu vị từng món, áp mã giảm giá, chọn giao tận nơi / đến lấy, trả tiền mặt hoặc VNPay |
| Theo dõi đơn | Xem trạng thái đơn tự cập nhật, hủy đơn khi còn chờ xác nhận, thanh toán lại VNPay |
| Đặt bàn | Chọn ngày giờ, số khách, khu vực, **chọn bàn trên sơ đồ**, xem lịch, hủy lịch, đặt lại khi nhà hàng hủy |
| Tài khoản | Đăng ký, đăng nhập, sửa hồ sơ, đổi mật khẩu, xem lịch sử đơn và lịch đặt bàn |
| Không cần tài khoản | Vẫn đặt món, đặt bàn được; tra cứu bằng **mã + số điện thoại** |

### 1.2. Danh sách màn hình

| # | Màn hình | Cần đăng nhập? |
|---|---|---|
| S01 | Splash (mở app) | Không |
| S02 | Đăng nhập | Không |
| S03 | Đăng ký | Không |
| S04 | Trang chủ | Không |
| S05 | Thực đơn | Không |
| S06 | Chi tiết món | Không (đánh giá thì cần) |
| S07 | Bottom sheet: Ghi chú khẩu vị | Không |
| S08 | Giỏ hàng | Không |
| S09 | Thanh toán (đặt hàng) | Không |
| S10 | Bottom sheet: Chọn mã giảm giá | Không |
| S11 | Trang VNPay (WebView) | Không |
| S12 | Kết quả thanh toán | Không |
| S13 | Chi tiết đơn hàng (theo dõi đơn) | Không (cần mã + SĐT nếu chưa đăng nhập) |
| S14 | Bottom sheet: Đánh giá món | **Có** |
| S15 | Hoạt động: Đơn hàng của tôi | Không (khách vãng lai thấy đơn đã đặt trên máy này) |
| S16 | Tra cứu đơn / đặt bàn | Không |
| S17 | Đặt bàn | Không |
| S18 | Chọn bàn trên sơ đồ | Không |
| S19 | Đặt bàn thành công | Không |
| S20 | Hoạt động: Lịch đặt bàn của tôi | Không (như S15) |
| S21 | Chi tiết đặt bàn | Không (cần mã + SĐT nếu chưa đăng nhập) |
| S22 | Tài khoản | Không (chưa đăng nhập thì hiện nút đăng nhập) |
| S23 | Sửa hồ sơ | **Có** |
| S24 | Đổi mật khẩu | **Có** |
| S25 | Thông tin nhà hàng | Không |
| C01 | Các trạng thái chung: đang tải, trống, lỗi, mất mạng, hết phiên | – |

### 1.3. Điều hướng

**Thanh tab dưới (bottom navigation), 5 tab:**

| Tab | Icon | Mở màn hình |
|---|---|---|
| Trang chủ | home | S04 |
| Thực đơn | restaurant_menu | S05 |
| Đặt bàn | event_seat / calendar | S17 |
| Hoạt động | receipt_long | S15 (2 tab con: Đơn hàng / Đặt bàn) |
| Tài khoản | person | S22 |

**Nút giỏ hàng:** khi giỏ có món, hiện **thanh giỏ hàng nổi** (floating cart bar) phía trên thanh tab ở các màn S04, S05, S06: `🛒 3 món · 850.000đ   Xem giỏ ›`. Bấm mở S08. Giỏ trống thì ẩn thanh này.

**Sơ đồ chuyển màn:**

```
S01 Splash ─► S04 Trang chủ
S04 ─► S05 (bấm danh mục / "Xem tất cả") ─► S06 Chi tiết món ─► (Thêm vào giỏ)
Thanh giỏ ─► S08 Giỏ hàng ─► S09 Thanh toán
S09 ─(Tiền mặt)─► S13 Chi tiết đơn (lời cảm ơn)
S09 ─(VNPay)───► S11 WebView VNPay ─► S12 Kết quả ─► S13
S17 Đặt bàn ─► S18 Chọn bàn ─► S17 ─► S19 Thành công ─► S21 Chi tiết đặt bàn
S15 Hoạt động ─► S13 / S21
S22 Tài khoản ─► S02 / S23 / S24 / S25 / S16
```

### 1.4. KHÔNG làm (backend chưa có, đừng để Stitch vẽ)

- Quên mật khẩu / đặt lại mật khẩu qua email, đăng nhập Google / Facebook / OTP.
- Đổi ảnh đại diện (API upload ảnh chỉ dành cho nhân viên). Dùng **chữ cái đầu của tên** làm avatar.
- Thông báo đẩy (push notification), chat với nhà hàng, ví / điểm thưởng, món yêu thích, lưu nhiều địa chỉ.
- Chọn ngân hàng / nhập thẻ trong app (làm trên trang VNPay), thanh toán Momo / ZaloPay.
- Theo dõi shipper trên bản đồ, chọn giờ giao hàng.
- Sửa đơn hay sửa lịch đặt bàn sau khi đã đặt (chỉ **hủy** rồi đặt lại).
- Khách tự xóa đánh giá, khách viết phản hồi cho đánh giá.
- Đặt cọc khi đặt bàn, gọi món trước khi đến.

---

## 2. Phong cách giao diện (design system)

Lấy đúng theo web hiện tại để app và web giống nhau.

### 2.1. Màu

| Tên | Mã | Dùng cho |
|---|---|---|
| Ocean 900 (chủ đạo) | `#0B3954` | Thanh tiêu đề, chữ tiêu đề, chip đang chọn, nút phụ màu tối |
| Ocean 950 | `#072538` | Lớp phủ tối trên ảnh, chữ tiêu đề đậm |
| Ocean 500 | `#1F7AA3` | Tên danh mục nhỏ, icon thông tin |
| Ocean 50 | `#EEF7FB` | Nền ô thông tin |
| Coral 500 (nhấn) | `#F5602E` | Nút chính, nhãn giảm giá, bước timeline đang ở |
| Coral 600 | `#E0461A` | **Giá tiền**, tổng tiền |
| Coral 50 | `#FFF4EF` | Nền ô lựa chọn đang chọn |
| Sand 50 (nền app) | `#FDFBF7` | Nền toàn màn hình |
| Sand 100 | `#F8F3EA` | Nền khối phụ |
| Trắng | `#FFFFFF` | Thẻ (card) |
| Slate 800 | `#1E293B` | Chữ thường |
| Slate 500 | `#64748B` | Chữ phụ |
| Slate 200 | `#E2E8F0` | Viền |

**Màu trạng thái** (dùng cho nhãn/badge):

| Màu | Mã nền / chữ | Trạng thái |
|---|---|---|
| Vàng (amber) | `#FEF3C7` / `#B45309` | Chờ xác nhận, Chưa thanh toán |
| Xanh dương | `#DBEAFE` / `#1D4ED8` | Đã xác nhận |
| Chàm (indigo) | `#E0E7FF` / `#4338CA` | Đang chế biến |
| Xanh ngọc (cyan) | `#CFFAFE` / `#0E7490` | Đang giao |
| Xanh lá | `#DCFCE7` / `#15803D` | Hoàn thành, Đã đến, Đã thanh toán |
| Đỏ | `#FEE2E2` / `#B91C1C` | Đã hủy |
| Xám | `#F1F5F9` / `#475569` | Đã hoàn tiền |

### 2.2. Chữ

- Chữ thường: **Be Vietnam Pro** (hỗ trợ tiếng Việt tốt).
- Tiêu đề lớn (tên trang, tên món ở chi tiết, câu chào trang chủ): **Playfair Display**, đậm.
- Cỡ: tiêu đề trang 24–28, tiêu đề khối 18, chữ thường 14–16, chữ phụ 12.

### 2.3. Hình khối

- Thẻ (card): nền trắng, bo góc **16**, viền mảnh `#E2E8F0` 70%, bóng rất nhẹ.
- Nút: cao 48 (nút lớn) / 40 (thường) / 32 (nhỏ), bo góc 12. Nút chính nền Coral 500 chữ trắng. Nút viền: viền Slate 300 nền trắng. Nút nguy hiểm (hủy): nền đỏ `#DC2626`.
- Ô nhập: cao 44, bo 12, viền Slate 300, khi lỗi viền đỏ + dòng lỗi đỏ nhỏ bên dưới.
- Chip lọc: bo tròn hẳn, đang chọn nền Ocean 900 chữ trắng; chưa chọn nền trắng viền Slate 200.
- Icon: bộ **Material Symbols Rounded** (hoặc Lucide).
- Ảnh món tỉ lệ **4:3**, bo 12–16.

### 2.4. Định dạng

- Tiền: `850.000đ` (dấu chấm ngăn nghìn, chữ "đ" liền sau).
- Ngày giờ: `19:00 28/10/2026`. Thời gian tương đối cho đánh giá: `3 ngày trước`.
- Mã đơn: chữ đơn cách (monospace), vd `FAB261027123456`. Mã đặt bàn bắt đầu bằng `RSV`.
- Món không có ảnh: ảnh giữ chỗ nền Ocean 100 chữ "FAB Seafood".

### Prompt Stitch: phong cách chung

```text
Design a mobile app for "FAB Seafood", a premium seafood restaurant in Da Nang, Vietnam.
All UI text must be in Vietnamese exactly as given in quotes. Do not translate it.

Style: fresh, clean, coastal, premium but friendly. Lots of white space, large food photos.
Colors: primary deep ocean blue #0B3954, darker #072538, accent coral #F5602E (primary buttons, badges),
price color #E0461A, app background warm sand #FDFBF7, cards white with 16px radius, thin border #E2E8F0, very soft shadow.
Fonts: "Be Vietnam Pro" for body, "Playfair Display" bold for big titles.
Buttons: 48px tall, 12px radius; primary = coral background white text; secondary = white with slate border; danger = red #DC2626.
Inputs: 44px tall, 12px radius, label above, red error text below when invalid.
Filter chips: fully rounded; selected = #0B3954 background white text; unselected = white with border.
Status badges (small rounded pills): amber = waiting, blue = confirmed, indigo = cooking, cyan = delivering,
green = completed/paid, red = cancelled, gray = refunded.
Prices formatted like "850.000đ". Icons: Material Symbols Rounded.
Bottom navigation with 5 tabs: "Trang chủ", "Thực đơn", "Đặt bàn", "Hoạt động", "Tài khoản".
When the cart is not empty, show a floating dark-blue cart bar above the bottom navigation:
"3 món · 850.000đ" on the left and "Xem giỏ ›" on the right.
```

---

## S01. Splash

**Mục đích:** hiện logo trong lúc app tải thông tin nhà hàng và kiểm tra đăng nhập.

**Bố cục:** nền Ocean 900, giữa màn hình là logo (icon con cá / sóng biển + chữ "FAB Seafood" màu trắng, font Playfair), dưới logo slogan nhỏ "Hải sản tươi sống mỗi ngày" màu Ocean 200. Dưới cùng là vòng xoay tải nhỏ.

**Việc làm khi mở:**
1. Gọi `GET /info` (tên, hotline, địa chỉ, giờ mở cửa, khu vực đặt bàn, phí ship, mức miễn phí ship, `onlinePayment`). Lưu lại dùng chung cả app.
2. Có token đã lưu thì gọi `GET /auth/me`. Được → coi như đã đăng nhập. Lỗi 401 → xóa token, coi như khách.
3. Xong thì vào S04. Không có mạng → hiện C01 "Mất kết nối" với nút "Thử lại".

```text
Splash screen. Full deep ocean blue (#0B3954) background. Centered white logo: a simple fish/wave icon
above the wordmark "FAB Seafood" in Playfair Display. Under it the slogan "Hải sản tươi sống mỗi ngày" in light blue.
A small white loading spinner near the bottom.
```

---

## S02. Đăng nhập

**Vào từ:** S22 (nút "Đăng nhập"), hoặc bị chuyển tới khi bấm việc cần đăng nhập (đánh giá món). Đăng nhập xong **quay lại đúng màn đang làm dở**; nếu mở từ S22 thì về S22.

**Bố cục (từ trên xuống):**
1. Nút quay lại (←) góc trái.
2. Logo FAB Seafood nhỏ ở giữa.
3. Tiêu đề "Đăng nhập".
4. Ô **Email** (bàn phím email, gợi ý tự điền).
5. Ô **Mật khẩu** (có nút con mắt hiện/ẩn).
6. Nút chính to, rộng hết: "Đăng nhập".
7. Dòng: "Chưa có tài khoản? **Đăng ký**" → S03.
8. Dòng nhỏ dưới cùng: "Đặt món và đặt bàn không cần tài khoản" + liên kết "Tiếp tục không đăng nhập" (quay lại).

**Kiểm tra:**

| Ô | Quy tắc | Thông báo |
|---|---|---|
| Email | Bắt buộc, đúng dạng email | "Vui lòng nhập email" / "Email không hợp lệ" |
| Mật khẩu | Bắt buộc | "Vui lòng nhập mật khẩu" |

**Trạng thái:** đang gửi → nút hiện vòng xoay, khóa nút. Sai thông tin → thông báo đỏ (snackbar) theo `message` của backend. Lỗi 429 → "Bạn thử đăng nhập quá nhiều lần, vui lòng thử lại sau X phút" (X lấy từ header `Retry-After`).

**Thành công:** lưu token (bảo mật, vd `flutter_secure_storage`), hiện snackbar "Xin chào, {tên}!".

> Tài khoản **nhân viên** đăng nhập app khách vẫn dùng được như khách bình thường. Trang quản trị chỉ có trên web.

**API:** `POST /auth/login` `{ email, password }` → `{ user, token }`.

```text
Login screen. Back arrow top-left. Small "FAB Seafood" logo centered, title "Đăng nhập".
Fields: "Email" (email keyboard) and "Mật khẩu" (password with show/hide eye icon).
Full-width coral primary button "Đăng nhập".
Below: "Chưa có tài khoản? Đăng ký" with "Đăng ký" as a link.
At the bottom, small gray text "Đặt món và đặt bàn không cần tài khoản" and a link "Tiếp tục không đăng nhập".
Also show one field in error state: red border and red helper text "Email không hợp lệ".
No social login, no "forgot password".
```

---

## S03. Đăng ký

**Vào từ:** S02. Đăng ký xong tự đăng nhập, quay lại màn đang làm dở (như S02).

**Bố cục:** nút ←, logo, tiêu đề "Tạo tài khoản", 5 ô, nút "Đăng ký", dòng "Đã có tài khoản? **Đăng nhập**".

| Ô | Bắt buộc | Quy tắc | Thông báo |
|---|---|---|---|
| Họ tên | Có | 2–100 ký tự | "Vui lòng nhập họ tên" / "Tối thiểu 2 ký tự" |
| Email | Có | Đúng dạng email | "Vui lòng nhập email" / "Email không hợp lệ" |
| Số điện thoại | Không | `0` hoặc `+84` + 9–10 số | "Số điện thoại không hợp lệ" |
| Mật khẩu | Có | 6–100 ký tự | "Tối thiểu 6 ký tự" |
| Nhập lại mật khẩu | Có | Trùng mật khẩu | "Mật khẩu không khớp" |

Ghi chú dưới ô SĐT: "Dùng để điền sẵn khi đặt món, đặt bàn".

**Lỗi thường gặp:** email đã có → 409, hiện `message` của backend. 429 như S02.

**API:** `POST /auth/register` `{ name, email, password, phone? }` → `{ user, token }`. Ô SĐT để trống thì **không gửi** trường `phone`.

```text
Register screen "Tạo tài khoản". Back arrow, small logo.
Fields in order: "Họ tên" (required *), "Email" (required *), "Số điện thoại" (optional, helper text
"Dùng để điền sẵn khi đặt món, đặt bàn"), "Mật khẩu" (required *), "Nhập lại mật khẩu" (required *).
Full-width coral button "Đăng ký". Below: "Đã có tài khoản? Đăng nhập".
```

---

## S04. Trang chủ

**Mục đích:** giới thiệu nhà hàng, dẫn khách tới đặt món / đặt bàn nhanh nhất.

**Bố cục (cuộn dọc, từ trên xuống):**

1. **Thanh trên:** trái là logo "FAB Seafood"; phải là icon giỏ hàng kèm số món (badge cam). Không có nút chuông thông báo (backend chưa có thông báo).
2. **Banner lớn (hero):** ảnh hải sản phủ lớp tối Ocean 950. Nhãn nhỏ "📍 Biển Mỹ Khê, Đà Nẵng". Tiêu đề 2 dòng: "Hương vị đại dương" / "trên bàn ăn của bạn" (dòng 2 màu coral). 2 nút: **"Đặt món ngay"** (coral) → S05, **"Đặt bàn"** (viền trắng) → S17. Dòng nhỏ: "🕙 Mở cửa 10:00 - 22:00 hằng ngày · Hotline 1900 1234" (lấy từ `/info`).
3. **4 điểm nổi bật** (lưới 2×2, mỗi ô có icon tròn nền coral nhạt):
   - "Tươi sống mỗi ngày" – "Nhập hải sản từ làng chài lúc 5h sáng"
   - "Đầu bếp 15 năm" – "Kết hợp vị Việt và kỹ thuật Âu - Nhật"
   - "Giao nhanh 45 phút" – "Miễn phí cho đơn từ 500.000đ" (số tiền lấy `freeShippingMin` từ `/info`)
   - "Top 10 Đà Nẵng" – "Hơn 20.000 lượt khách hài lòng"
4. **Danh mục:** tiêu đề nhỏ "THỰC ĐƠN" + "Khám phá theo danh mục". Dải cuộn ngang các ô ảnh danh mục (ảnh, tên, "12 món"). Bấm → S05 đã lọc sẵn danh mục đó.
5. **Món đặc biệt:** tiêu đề "Món đặc biệt của FAB" + "Xem tất cả ›" (→ S05). Dải cuộn ngang thẻ món (thẻ món chuẩn, xem S05). Tối đa 8 món.
6. **Ưu đãi đang diễn ra** (chỉ hiện khi có mã): khối nền gradient coral. Mỗi mã là 1 vé có viền đứt: số giảm to ("-10%" hoặc "-50.000đ"), mô tả, mã (chữ đơn cách, nền trắng chữ coral) + nút **"Sao chép"**. Bấm sao chép → snackbar "Đã sao chép mã WELCOME10".
7. **Khối đặt bàn:** nền Ocean 900: "Đặt bàn cho buổi tối tuyệt vời" / "Phòng VIP, khu ngoài trời view biển - giữ chỗ miễn phí, xác nhận trong 15 phút." + nút "Đặt bàn ngay" → S17.
8. **Khách hàng nói gì:** 3 thẻ đánh giá mẫu (5 sao, lời nhận xét, tên). Cuộn ngang.
9. **Liên hệ:** địa chỉ, hotline (bấm gọi), nút "Chỉ đường" (mở Google Maps) → hoặc liên kết sang S25.

**Dữ liệu:** `GET /info`, `GET /categories`, `GET /dishes?featured=true&limit=8&sort=popular`, `GET /coupons/public`.

**Trạng thái:** từng khối tải riêng, khối nào đang tải thì hiện khung xương (skeleton). Kéo xuống để tải lại (pull-to-refresh).

```text
Home screen of a seafood restaurant app, scrollable.
Top bar: "FAB Seafood" logo left, cart icon with coral count badge right.
Hero card: full-width seafood photo with dark blue overlay, small pill "Biển Mỹ Khê, Đà Nẵng" with pin icon,
big Playfair title "Hương vị đại dương" and second line in coral "trên bàn ăn của bạn",
two buttons: coral "Đặt món ngay" and outlined white "Đặt bàn",
small line "Mở cửa 10:00 - 22:00 hằng ngày · Hotline 1900 1234".
A 2x2 grid of feature tiles with coral circle icons: "Tươi sống mỗi ngày", "Đầu bếp 15 năm",
"Giao nhanh 45 phút" (subtitle "Miễn phí cho đơn từ 500.000đ"), "Top 10 Đà Nẵng".
Section "Khám phá theo danh mục": horizontal scroll of category image tiles with name and "12 món"
(Khai vị, Tôm, Cá, Mâm hải sản, Món Nhật, Cơm & Mì, Tráng miệng, Đồ uống).
Section "Món đặc biệt của FAB" with "Xem tất cả ›": horizontal scroll of dish cards.
Coral gradient block "Ưu đãi đang diễn ra" with ticket-style coupons (dashed border): "-10%", description,
code "WELCOME10" in monospace and a small "Sao chép" button.
Dark blue block "Đặt bàn cho buổi tối tuyệt vời" with button "Đặt bàn ngay".
Horizontal testimonial cards with 5 stars.
Bottom navigation with "Trang chủ" active and the floating cart bar.
```

---

## S05. Thực đơn

**Mục đích:** xem, tìm, lọc toàn bộ món.

**Bố cục:**
1. Tiêu đề "Thực đơn", phụ đề "Hải sản tươi sống - chế biến theo yêu cầu".
2. **Ô tìm kiếm** "Tìm món..." (icon kính lúp). Gõ xong **chờ 0,4 giây** mới gọi API.
3. **Dải chip danh mục** cuộn ngang, dính trên đầu khi cuộn: "Tất cả", rồi từng danh mục.
4. **Nút sắp xếp** (icon sort + chữ đang chọn) → bottom sheet 5 lựa chọn: "Bán chạy" (mặc định), "Mới nhất", "Đánh giá cao", "Giá thấp → cao", "Giá cao → thấp".
5. **Lưới 2 cột thẻ món.** Cuộn tới cuối tự tải trang tiếp (12 món/trang).

**Thẻ món (dùng chung S04, S05, S06):**
- Ảnh 4:3. Góc trên trái: nhãn "-20%" (coral, chỉ khi có giá khuyến mãi thấp hơn giá gốc) và nhãn "🔥 Đặc biệt" (nền trắng, khi `isFeatured`).
- Tên danh mục chữ nhỏ in hoa màu Ocean 500.
- Tên món (1 dòng, cắt "...").
- Sao trung bình + "(24)" + "· Đã bán 120" (ẩn nếu chưa bán).
- Giá: giá bán (coral, đậm) + "/phần" (đơn vị) ; nếu khuyến mãi thì giá gốc gạch ngang bên dưới.
- Nút tròn "+" Ocean 900 góc phải dưới: thêm 1 phần vào giỏ, snackbar "Đã thêm "Tôm sú hấp bia" vào giỏ".
- Món **hết hàng** không xuất hiện ở danh sách (backend tự ẩn).
- Bấm vào thẻ → S06.

**Trạng thái:** đang tải (skeleton 4 thẻ); không có món → icon dao nĩa, "Không tìm thấy món nào", "Hãy thử từ khóa hoặc danh mục khác."; lỗi → C01.

**API:** `GET /categories`; `GET /dishes?search=&category=<slug>&sort=&page=&limit=12` → `data[]`, `meta.totalPages`.

```text
Menu screen. Title "Thực đơn", subtitle "Hải sản tươi sống - chế biến theo yêu cầu".
Search field "Tìm món..." with magnifier icon, next to a sort button showing "Bán chạy" with a sort icon.
Sticky horizontal chip row: "Tất cả" (selected), "Khai vị", "Tôm", "Cá", "Mâm hải sản", "Món Nhật", "Cơm & Mì", "Tráng miệng", "Đồ uống".
2-column grid of dish cards: 4:3 photo, top-left coral badge "-20%" and white badge "Đặc biệt" with flame icon,
small uppercase blue category, dish name (one line), star rating with count and "· Đã bán 120",
price in coral bold "250.000đ" with gray "/phần", old price struck through below when on sale,
round dark-blue "+" button at bottom-right of the card.
Example dishes: "Tôm sú hấp bia", "Sashimi cá hồi Na Uy", "Mâm hải sản nướng FAB", "Cá vược nướng rau củ".
Also design a bottom sheet "Sắp xếp theo" with radio options: "Bán chạy", "Mới nhất", "Đánh giá cao", "Giá thấp → cao", "Giá cao → thấp".
And an empty state: fork-and-knife icon, "Không tìm thấy món nào", "Hãy thử từ khóa hoặc danh mục khác."
```

---

## S06. Chi tiết món

**Vào từ:** thẻ món ở S04, S05, món gợi ý; hoặc bấm tên món trong giỏ (S08).

**Bố cục:**
1. Ảnh lớn tràn mép trên (4:3), nút ← và nút giỏ hàng nổi trên ảnh.
2. Tên danh mục (chữ nhỏ in hoa Ocean 500).
3. Tên món (Playfair, lớn).
4. Dòng: ★★★★☆ "4.6 (24 đánh giá)" | "Đã bán 120".
5. Giá: "250.000đ" (coral, rất to) "/ phần", giá gốc gạch ngang nếu khuyến mãi.
6. Mô tả món.
7. **Khối Đánh giá:** điểm to "4.6" + sao + "24 lượt đánh giá". Danh sách tối đa 20 đánh giá mới nhất: avatar chữ cái đầu, tên, sao, "3 ngày trước", nội dung. Chưa có → "Chưa có đánh giá" / "Hãy là người đầu tiên đánh giá món này!".
   - Đã đăng nhập: nút **"Viết đánh giá"** → S14.
   - Chưa đăng nhập: dòng "**Đăng nhập** để đánh giá món ăn bạn đã thưởng thức." → S02.
8. **"Có thể bạn cũng thích":** dải ngang 4 món cùng danh mục.
9. **Thanh dưới cố định:** bộ chọn số lượng `[ − ] 1 [ + ]` (1–50) + nút coral rộng "Thêm vào giỏ · 250.000đ" (tiền = giá × số lượng, đổi theo số lượng).
   - Món hết hàng (`isAvailable = false`): thay thanh dưới bằng khối xám "Món này tạm hết, vui lòng quay lại sau".

**Khi bấm "Thêm vào giỏ":** cộng vào giỏ (nếu món đã có thì cộng dồn, tối đa 50), snackbar "Đã thêm 2 × Tôm sú hấp bia" kèm nút "Xem giỏ" → S08. Số lượng về lại 1.

**API:** `GET /dishes/:slug` → món + `category` + `reviews[]` (có `user.name`) + `related[]`.

```text
Dish detail screen. Large edge-to-edge 4:3 food photo at top with floating round back button and cart button.
Below: small uppercase blue "TÔM", big Playfair title "Tôm sú hấp bia",
row with stars "4.6 (24 đánh giá)" | "Đã bán 120",
price "250.000đ" big coral with "/ phần" and old price "300.000đ" struck through,
description paragraph.
Reviews section: big "4.6" with stars and "24 lượt đánh giá", outlined button "Viết đánh giá",
review cards with initial-letter avatar, name, stars, "3 ngày trước", comment.
Section "Có thể bạn cũng thích" with horizontal dish cards.
Sticky bottom bar: quantity stepper [-] 1 [+] and wide coral button "Thêm vào giỏ · 250.000đ".
Also a variant where the bottom bar is replaced by a gray box "Món này tạm hết, vui lòng quay lại sau".
```

---

## S07. Bottom sheet: Ghi chú khẩu vị (cho 1 món trong giỏ)

**Vào từ:** bấm vào ảnh món hoặc dòng "Thêm ghi chú khẩu vị" ở S08 / S09.

**Bố cục:**
1. Tiêu đề "Ghi chú cho {tên món}" + nút đóng (×).
2. **Chip gợi ý** (bấm để nối thêm vào ghi chú, bắt đầu bằng "+"), theo danh mục của món:

| Danh mục | Gợi ý |
|---|---|
| Tôm, Mâm hải sản | Ít cay · Không hành · Hấp · Nướng · Bóc vỏ sẵn |
| Cá | Ít xương · Chiên giòn · Hấp xì dầu · Không hành |
| Đồ uống | Ít đá · Không đá · Ít đường |
| Khác | Ít cay · Không hành · Không rau thơm |

3. Ô nhập nhiều dòng, gợi ý mờ: "Khẩu vị riêng cho Tôm sú hấp bia, vd: 2 phần ít cay, 1 phần không hành".
4. Bộ đếm "12/200" bên dưới.
5. Nút "Xong".

**Quy tắc:**
- Tối đa **200 ký tự**. Không nhập thêm được khi đủ.
- Bấm chip: nếu ghi chú đã có chữ đó thì bỏ qua; nếu có chữ rồi thì nối bằng ", ".
- Ghi chú lưu **trong giỏ hàng trên máy** (tắt app mở lại vẫn còn). Gửi lên khi đặt đơn.
- Đây là ghi chú **riêng từng món**, khác ô "Ghi chú cho nhà hàng" của cả đơn ở S09.

```text
Bottom sheet titled "Ghi chú cho Tôm sú hấp bia" with a close (x) icon.
A wrap of small outlined suggestion chips: "+ Ít cay", "+ Không hành", "+ Hấp", "+ Nướng", "+ Bóc vỏ sẵn".
Multi-line text field with placeholder "Khẩu vị riêng cho Tôm sú hấp bia, vd: 2 phần ít cay, 1 phần không hành".
Character counter "12/200" bottom-left and a coral button "Xong" full width.
```

---

## S08. Giỏ hàng

**Vào từ:** thanh giỏ nổi, icon giỏ trên thanh trên.

**Bố cục:**
1. Thanh trên: ← , "Giỏ hàng của bạn", bên phải nút chữ "Xóa hết" (hỏi xác nhận "Xóa tất cả món trong giỏ?").
2. Danh sách món, mỗi dòng:
   - Ảnh vuông 80 (bấm → S07).
   - Tên món (bấm → S06), icon thùng rác bên phải (xóa ngay, snackbar "Đã xóa … " kèm nút "Hoàn tác").
   - "250.000đ / phần".
   - Dòng ghi chú: chưa có → "📝 Thêm ghi chú khẩu vị" (xám); đã có → nội dung ghi chú (Ocean 700, tối đa 2 dòng). Bấm → S07.
   - Bộ chọn số lượng nhỏ (giảm về 0 = xóa món) + thành tiền bên phải.
3. Dưới cùng cố định: "Tạm tính" … "850.000đ" (coral), nút coral rộng "Tiến hành đặt món" → S09.

**Giỏ trống:** icon túi, "Giỏ hàng trống", "Hãy chọn vài món hải sản tươi ngon nhé!", nút "Xem thực đơn" → S05.

**Quy tắc:**
- Giỏ lưu **trên máy** (không có API giỏ hàng). Mỗi dòng: `dishId, name, slug, image, unit, category, price, quantity, note`.
- Giá trong giỏ **chỉ để hiển thị**; backend tính lại khi đặt. Nếu món đổi giá / hết hàng, lỗi sẽ báo ở S09.
- Mỗi món tối đa 50.

```text
Cart screen "Giỏ hàng của bạn" with back arrow and text button "Xóa hết" on the right.
List of cart rows: 80px rounded square food photo, dish name, trash icon on the right,
gray "250.000đ / phần", a small note line with notebook icon: either gray "Thêm ghi chú khẩu vị"
or a blue note text "2 phần ít cay, 1 phần không hành", a small quantity stepper and line total on the right.
Sticky footer: "Tạm tính" and "850.000đ" in coral, full-width coral button "Tiến hành đặt món".
Also an empty state: shopping bag icon, "Giỏ hàng trống", "Hãy chọn vài món hải sản tươi ngon nhé!", button "Xem thực đơn".
```

---

## S09. Thanh toán (đặt hàng)

**Vào từ:** S08. Giỏ trống thì hiện trạng thái trống như S08.

**Bố cục (cuộn dọc, các khối thẻ):**

**Khối 1 – "Hình thức nhận món"**: 2 thẻ chọn, chọn 1:
- 🚚 "Giao tận nơi" – "Khoảng 30-45 phút" (mặc định)
- 🏪 "Đến lấy tại quán" – "Không mất phí giao hàng"
Thẻ đang chọn: viền coral 2px, nền Coral 50.

**Khối 2 – "Thông tin người nhận"**:
- Chưa đăng nhập: ô thông tin nền Ocean 50: "**Đăng nhập** để lưu lịch sử đơn hàng và điền thông tin nhanh hơn."
- Ô "Họ tên" *, "Số điện thoại" *, "Địa chỉ giao hàng" * (chỉ hiện khi Giao tận nơi, gợi ý "Số nhà, đường, phường, quận"), "Ghi chú cho nhà hàng" (nhiều dòng, gợi ý "Ví dụ: ít cay, giao trước 12h...").
- Đã đăng nhập: tự điền sẵn tên, SĐT, địa chỉ từ hồ sơ.

**Khối 3 – "Phương thức thanh toán"**: 2 thẻ chọn:
- 💵 "Tiền mặt" – "Thanh toán khi nhận món" (mặc định)
- 💳 "Thanh toán VNPay" – "Thẻ ATM, Visa/Master, QR ngân hàng". Nếu `/info.onlinePayment = false`: thẻ mờ, mô tả đổi thành "Tạm thời chưa hỗ trợ", không bấm được.

**Khối 4 – "Đơn hàng (3 món)"**: danh sách món: ảnh 56 có số lượng tròn ở góc, tên, thành tiền; dưới là dòng ghi chú (giống S08, bấm → S07).

**Khối 5 – Mã giảm giá**:
- Chưa áp: ô "Mã giảm giá" (tự in hoa) + nút "Áp dụng" (mờ khi ô trống), bên dưới là các mã đang có dạng chip viền đứt (bấm là áp luôn) + liên kết "Xem tất cả ưu đãi" → S10.
- Đã áp: dải xanh lá "🎟 WELCOME10 · Giảm 50.000đ" + nút × để bỏ mã.

**Khối 6 – Tổng tiền**:
- "Tạm tính" … 850.000đ
- "Giảm giá" … -50.000đ (xanh lá, chỉ khi có)
- "Phí giao hàng" … "20.000đ" hoặc "Miễn phí"
- Nếu đang tính phí ship: chữ nhỏ "Mua thêm 150.000đ để được miễn phí giao hàng"
- Đường kẻ, "**Tổng cộng**" … "**820.000đ**" (coral, to)

**Thanh dưới cố định:** "Tổng cộng 820.000đ" + nút coral: "Đặt hàng" (tiền mặt) hoặc "Đặt hàng & thanh toán VNPay".

**Kiểm tra form:**

| Ô | Quy tắc | Thông báo |
|---|---|---|
| Họ tên | 2–100 ký tự | "Vui lòng nhập họ tên" |
| Số điện thoại | `0` hoặc `+84` + 9–10 số | "Vui lòng nhập số điện thoại" / "Số điện thoại không hợp lệ" |
| Địa chỉ | Bắt buộc khi Giao tận nơi, ≥ 5 ký tự, ≤ 255 | "Vui lòng nhập địa chỉ giao hàng" |
| Ghi chú | ≤ 500 ký tự | – |

Bấm đặt hàng mà có ô lỗi → cuộn tới ô lỗi đầu tiên.

**Cách tính tiền hiển thị** (backend tính lại, con số cuối cùng lấy từ kết quả trả về):
- `phí ship = (Giao tận nơi và tạm tính < freeShippingMin) ? shippingFee : 0` (hiện tại 20.000đ, miễn phí từ 500.000đ; lấy từ `/info`).
- `tổng = tạm tính − giảm giá + phí ship`.
- Mã giảm giá: % thì giảm `tạm tính × %` nhưng không quá mức tối đa; tiền cố định thì giảm đúng số đó; không vượt quá tạm tính. Đơn phải đạt mức tối thiểu.
- Đổi giỏ sau khi đã áp mã: gọi kiểm tra mã lại; mã không còn hợp lệ thì tự bỏ và báo lý do.

**Lỗi mã giảm giá** (lấy `message` từ backend): "Mã giảm giá không tồn tại", "Mã giảm giá chưa đến thời gian áp dụng", "Mã giảm giá đã hết hạn", "Mã giảm giá đã hết lượt sử dụng", "Đơn tối thiểu 200.000đ để dùng mã này".

**Lỗi đặt đơn:** "Món "X" hiện đã hết", "Có món không tồn tại" → báo, mở lại giỏ để khách sửa.

**Sau khi đặt thành công:**
1. Xóa giỏ hàng.
2. Lưu `{ code, phone }` của đơn vào danh sách "đơn trên máy này" (để S15 hiện được cho khách chưa đăng nhập).
3. Tiền mặt → snackbar "Đặt hàng thành công!", sang **S13** (thay màn, không cho quay lại S09).
4. VNPay → gọi lấy link thanh toán → mở **S11**. Lấy link lỗi → báo "Đã đặt đơn nhưng chưa mở được VNPay: …", sang S13 (ở đó có nút thanh toán lại).

**API:**
- `POST /coupons/check` `{ code, subtotal }` → `{ code, discount, description }`
- `GET /coupons/public`
- `POST /orders` `{ customerName, phone, type, address?, paymentMethod, couponCode?, note?, items: [{ dishId, quantity, note? }] }`
- `POST /payments/vnpay/:code` `{ phone }` → `{ paymentUrl }`

```text
Checkout screen "Thanh toán", scrollable cards:
Card "1. Hình thức nhận món": two selectable option cards side by side, "Giao tận nơi" (truck icon, "Khoảng 30-45 phút", selected with coral border and light coral fill)
and "Đến lấy tại quán" (store icon, "Không mất phí giao hàng").
Card "2. Thông tin người nhận": light blue info banner "Đăng nhập để lưu lịch sử đơn hàng và điền thông tin nhanh hơn.",
fields "Họ tên *", "Số điện thoại *", "Địa chỉ giao hàng *" (placeholder "Số nhà, đường, phường, quận"),
multiline "Ghi chú cho nhà hàng" (placeholder "Ví dụ: ít cay, giao trước 12h...").
Card "3. Phương thức thanh toán": option cards "Tiền mặt" ("Thanh toán khi nhận món", selected) and "Thanh toán VNPay" ("Thẻ ATM, Visa/Master, QR ngân hàng").
Card "Đơn hàng (3 món)": rows with 56px photo with quantity bubble, name, price, small note line under each.
Coupon row: input "Mã giảm giá" + dark button "Áp dụng", below dashed coral chips "WELCOME10", "FAB50K", "HAISAN20" and link "Xem tất cả ưu đãi".
Summary: "Tạm tính 850.000đ", green "Giảm giá -50.000đ", "Phí giao hàng Miễn phí",
small gray hint "Mua thêm 150.000đ để được miễn phí giao hàng", bold "Tổng cộng 820.000đ" in coral.
Sticky bottom bar with total and coral button "Đặt hàng".
Also show the applied-coupon variant: green strip "WELCOME10 · Giảm 50.000đ" with an x button,
and the variant where "Thanh toán VNPay" is disabled/greyed with subtitle "Tạm thời chưa hỗ trợ".
```

---

## S10. Bottom sheet: Chọn mã giảm giá

**Vào từ:** S09 ("Xem tất cả ưu đãi").

**Bố cục:** tiêu đề "Ưu đãi đang diễn ra", danh sách vé:
- Bên trái số giảm to: "-10%" / "-50.000đ".
- Mô tả (vd "Giảm 10% cho đơn từ 200.000đ (tối đa 50.000đ)").
- Mã chữ đơn cách.
- Nút "Dùng mã" bên phải. Đơn chưa đủ mức tối thiểu → vé mờ, nút đổi thành chữ "Mua thêm 50.000đ" (tính từ `minOrder − tạm tính`), không bấm được.
- Mã đang áp có nhãn "Đang dùng".

Bấm "Dùng mã" → gọi kiểm tra mã → đóng sheet, áp vào S09.

Không có mã nào → "Hiện chưa có ưu đãi nào".

**API:** `GET /coupons/public` (có `code, description, type, value, minOrder, maxDiscount, expiresAt`), `POST /coupons/check`.

```text
Bottom sheet "Ưu đãi đang diễn ra" with a list of ticket-shaped coupon cards (notched edges, dashed divider):
left side big coral "-10%", middle description "Giảm 10% cho đơn từ 200.000đ (tối đa 50.000đ)" and monospace code "WELCOME10",
right side coral button "Dùng mã". One coupon greyed out with disabled label "Mua thêm 50.000đ".
One coupon marked with a green "Đang dùng" pill.
```

---

## S11. Trang VNPay (WebView)

**Mục đích:** khách trả tiền trên trang của VNPay ngay trong app.

**Bố cục:** thanh trên: nút × (đóng), tiêu đề "Thanh toán VNPay", dòng nhỏ "Mã đơn FAB…". Phần còn lại là WebView mở `paymentUrl`. Thanh tiến trình mảnh khi trang đang tải.

**Quy tắc:**
- Theo dõi địa chỉ WebView: khi địa chỉ bắt đầu bằng `VNP_RETURN_URL` (cấu hình ở backend, vd `.../payment/vnpay-return`) → đóng WebView, lấy phần `?vnp_...` gửi lên `GET /payments/vnpay/return` → sang S12.
- Bấm × → hỏi "Hủy thanh toán? Đơn hàng vẫn được giữ, bạn có thể thanh toán lại sau." → đồng ý thì sang S13.
- Link hết hạn sau **15 phút**. Mỗi lần mở là một giao dịch mới.
- **Không** tự đọc `vnp_ResponseCode` trên địa chỉ để báo thành công; luôn hỏi backend.

```text
In-app browser screen: top bar with close (x) icon, title "Thanh toán VNPay", subtitle "Mã đơn FAB261027123456",
thin coral progress bar under the top bar, the rest is a web page placeholder.
Also a confirm dialog: title "Hủy thanh toán?", text "Đơn hàng vẫn được giữ, bạn có thể thanh toán lại sau.",
buttons "Tiếp tục thanh toán" and red "Hủy thanh toán".
```

---

## S12. Kết quả thanh toán

**Bố cục:**
- Đang kiểm tra: vòng xoay + "Đang kiểm tra kết quả thanh toán...".
- Thành công: icon ✓ tròn xanh lá lớn, "Thanh toán thành công!", câu `message` từ backend.
- Không thành công: icon × tròn đỏ, "Thanh toán chưa thành công", `message` (vd "Bạn đã hủy giao dịch").
- Thẻ thông tin: "Mã đơn" (đơn cách), "Số tiền", "Mã giao dịch VNPay" (ẩn nếu trống hoặc `0`), "Ngân hàng" (ẩn nếu trống).
- Nút chính: "Xem đơn hàng" (thành công) / "Xem đơn & thanh toán lại" (thất bại) → S13. Nút viền: "Tiếp tục đặt món" → S05.

**API:** `GET /payments/vnpay/return?vnp_...` → `{ paid, message, orderCode, phone, amount, transactionNo, bankCode }`.

```text
Payment result screen, two variants side by side.
Success: big green check circle, title "Thanh toán thành công!", message text,
info card rows "Mã đơn" FAB261027123456 (monospace), "Số tiền" 820.000đ, "Mã giao dịch VNPay" 14123456, "Ngân hàng" NCB,
coral button "Xem đơn hàng" and outlined "Tiếp tục đặt món".
Failure: big red x circle, "Thanh toán chưa thành công", "Bạn đã hủy giao dịch",
same info card, coral button "Xem đơn & thanh toán lại".
```

---

## S13. Chi tiết đơn hàng (theo dõi đơn)

**Vào từ:** S09 (vừa đặt), S12, S15, S16.

**Bố cục:**
1. Đầu trang:
   - Đơn vừa đặt (dưới 10 phút): icon ✓ xanh lá, "Cảm ơn bạn đã đặt món!".
   - Đơn cũ: "Chi tiết đơn hàng".
   - "Mã đơn: **FAB261027123456**" (bấm giữ để sao chép) · "19:05 27/10/2026".
   - Chữ nhỏ "Trạng thái tự động cập nhật mỗi 15 giây".
2. **Khung nhắc thanh toán** (khi VNPay + chưa trả + chưa hủy): nền vàng, "Đơn hàng chưa được thanh toán. Vui lòng thanh toán để nhà hàng xác nhận nhanh hơn." + nút "Thanh toán qua VNPay" → S11.
3. **Thanh tiến trình (timeline) ngang**, các bước:
   - Giao tận nơi: Chờ xác nhận → Đã xác nhận → Đang chế biến → Đang giao → Hoàn thành
   - Đến lấy: bỏ bước "Đang giao".
   - Bước đã qua: tròn coral có dấu ✓; bước hiện tại: tròn coral có vòng sáng; bước sau: xám.
   - Đơn đã hủy: thay timeline bằng khung đỏ "Đơn hàng đã bị hủy".
   - Đơn bị **nhà hàng** hủy (có `cancelReason`): khung đỏ "Nhà hàng đã hủy đơn này" + "Lý do: {cancelReason}" + (nếu trạng thái thanh toán "Đã hoàn tiền") "Số tiền bạn đã thanh toán online sẽ được nhà hàng hoàn lại." + "Rất xin lỗi bạn vì sự bất tiện này. Cần hỗ trợ thêm, bạn vui lòng gọi nhà hàng." Đơn đã hủy thì không hiện "Cảm ơn bạn đã đặt món!".
4. **Thẻ "Thông tin nhận hàng"**: Người nhận, Điện thoại, Hình thức ("Giao tận nơi" / "Đến lấy tại quán"), Địa chỉ (nếu có), Ghi chú (nếu có), Thanh toán ("Tiền mặt khi nhận" / "VNPay") + nhãn trạng thái thanh toán, Trạng thái đơn (nhãn).
5. **Thẻ "Chi tiết đơn"**: mỗi món: ảnh 48, "Tôm sú hấp bia × 2", dòng "Ghi chú: 2 phần ít cay" (Ocean 700, nếu có), thành tiền. Đơn **Hoàn thành** + đã đăng nhập: mỗi món có nút nhỏ "Đánh giá" → S14.
   - Tổng: Tạm tính, Giảm giá (kèm nhãn mã), Phí giao hàng ("Miễn phí" nếu 0), **Tổng cộng**.
6. **Nút dưới:** "Tiếp tục đặt món" (viền) → S05; "Hủy đơn" (đỏ) chỉ khi đơn **Chờ xác nhận** và **chưa thanh toán** → hỏi "Bạn chắc chắn muốn hủy đơn này?" → thành công: snackbar "Đã hủy đơn hàng", tải lại.
   - Đơn đã trả VNPay mà muốn hủy: hiện chữ "Đơn đã thanh toán, vui lòng gọi {hotline} để hủy và hoàn tiền" + nút gọi.
7. Nút "Gọi nhà hàng" (icon điện thoại) trên thanh trên.

**Nhãn trạng thái:**

| Mã | Chữ | Màu |
|---|---|---|
| PENDING | Chờ xác nhận | vàng |
| CONFIRMED | Đã xác nhận | xanh dương |
| PREPARING | Đang chế biến | chàm |
| DELIVERING | Đang giao | xanh ngọc |
| COMPLETED | Hoàn thành | xanh lá |
| CANCELLED | Đã hủy | đỏ |
| UNPAID | Chưa thanh toán | vàng |
| PAID | Đã thanh toán | xanh lá |
| REFUNDED | Đã hoàn tiền | xám |

**Quy tắc:**
- Tự tải lại mỗi **15 giây** khi màn hình đang mở (và kéo xuống để tải lại).
- Chưa đăng nhập phải có **SĐT** đi kèm mã. Không tìm thấy → icon hộp kính lúp, "Không tìm thấy đơn hàng", "Kiểm tra lại mã đơn và số điện thoại đặt hàng.", nút "Tra cứu đơn khác" → S16.
- Quay lại từ màn này (khi vừa đặt) → về S04, không về S09.

**API:** `GET /orders/track/:code?phone=` (có `cancelReason`), `POST /orders/:code/cancel` `{ phone }`, `POST /payments/vnpay/:code` `{ phone }`.

```text
Order tracking screen. Top: green check circle, title "Cảm ơn bạn đã đặt món!",
"Mã đơn: FAB261027123456 · 19:05 27/10/2026" (code in monospace), tiny gray "Trạng thái tự động cập nhật mỗi 15 giây".
Amber banner "Đơn hàng chưa được thanh toán. Vui lòng thanh toán để nhà hàng xác nhận nhanh hơn." with coral button "Thanh toán qua VNPay".
Card with a horizontal 5-step progress tracker: "Chờ xác nhận", "Đã xác nhận", "Đang chế biến", "Đang giao", "Hoàn thành";
first two steps done (coral circles with check), third current (coral with glow ring), rest gray.
Card "Thông tin nhận hàng": rows Người nhận, Điện thoại, Hình thức "Giao tận nơi", Địa chỉ, Ghi chú,
Thanh toán "VNPay" with amber pill "Chưa thanh toán", Trạng thái with indigo pill "Đang chế biến".
Card "Chi tiết đơn": item rows with 48px photo, "Tôm sú hấp bia × 2", small blue line "Ghi chú: 2 phần ít cay, 1 phần không hành", price;
totals "Tạm tính", green "Giảm giá" with small pill "WELCOME10", "Phí giao hàng Miễn phí", bold coral "Tổng cộng 820.000đ".
Bottom buttons: outlined "Tiếp tục đặt món" and red "Hủy đơn".
Also a cancelled variant where the tracker is replaced by a red box "Đơn hàng đã bị hủy",
and a completed variant where each item has a small outlined "Đánh giá" button.
```

---

## S14. Bottom sheet: Đánh giá món

**Vào từ:** S06 ("Viết đánh giá") hoặc S13 (nút "Đánh giá" cạnh món của đơn đã hoàn thành). **Cần đăng nhập.**

**Bố cục:** ảnh nhỏ + tên món, "Đánh giá của bạn", 5 ngôi sao to bấm chọn (mặc định 5), chữ theo số sao ("Rất tệ", "Tệ", "Bình thường", "Ngon", "Tuyệt vời"), ô nhập "Chia sẻ cảm nhận về món ăn..." (không bắt buộc), nút "Gửi đánh giá".

**Quy tắc:**
- Chỉ đánh giá được món nằm trong **đơn đã Hoàn thành** của chính mình. Chưa đủ điều kiện → backend trả 403 "Bạn cần đặt và nhận món này trước khi đánh giá", hiện câu này.
- Mỗi người **1 đánh giá / món**; gửi lại là **cập nhật** đánh giá cũ.
- Thành công: snackbar "Cảm ơn bạn đã đánh giá!", đóng sheet, tải lại điểm ở S06.

**API:** `POST /reviews` `{ dishId, rating (1-5), comment? }`.

```text
Bottom sheet for rating a dish: small dish photo and name "Tôm sú hấp bia", label "Đánh giá của bạn",
five large tappable stars (4 filled amber), caption "Ngon", multiline field "Chia sẻ cảm nhận về món ăn...",
full-width coral button "Gửi đánh giá".
```

---

## S15. Hoạt động: Đơn hàng của tôi

**Vào từ:** tab "Hoạt động" (tab con **"Đơn hàng"**, tab con kia là "Đặt bàn" = S20).

**Bố cục:**
- Thanh tab con trên đầu: "Đơn hàng" | "Đặt bàn".
- Danh sách thẻ đơn: mã (đơn cách) + ngày giờ, nhãn trạng thái bên phải; hàng ảnh tối đa 4 món + "+2" nếu nhiều hơn; tổng tiền (coral) + mũi tên ›. Bấm → S13.
- Đơn bị nhà hàng hủy (có `cancelReason`): dưới dòng mã đơn có dải đỏ nhạt "Nhà hàng đã hủy đơn · Lý do: {cancelReason}".
- Lọc nhanh bằng chip: "Tất cả", "Đang xử lý" (Chờ xác nhận / Đã xác nhận / Đang chế biến / Đang giao), "Hoàn thành", "Đã hủy" (lọc ngay trên máy).
- Cuộn tới cuối tải thêm trang.
- Liên kết dưới cùng: "Tra cứu đơn khác bằng mã" → S16.

**Đã đăng nhập:** lấy từ `GET /orders/my?page=`.

**Chưa đăng nhập:** hiện các đơn đã đặt **trên máy này** (đã lưu `{code, phone}` ở S09), gọi `GET /orders/track/:code?phone=` cho từng đơn. Đầu danh sách có khung: "**Đăng nhập** để xem lịch sử đơn trên mọi thiết bị".

**Trống:** icon hóa đơn, "Bạn chưa có đơn hàng nào", nút "Đặt món ngay" → S05.

```text
"Hoạt động" screen with a segmented control at top: "Đơn hàng" (selected) | "Đặt bàn".
Filter chips: "Tất cả", "Đang xử lý", "Hoàn thành", "Đã hủy".
List of order cards: monospace code "FAB261027123456" and gray "19:05 27/10/2026", status pill on the right
(e.g. amber "Chờ xác nhận", green "Hoàn thành", red "Đã hủy"), a row of up to 4 small rounded food photos and "+2",
total "820.000đ" in coral with a chevron.
A light-blue banner at the top for guests: "Đăng nhập để xem lịch sử đơn trên mọi thiết bị".
Link at the bottom "Tra cứu đơn khác bằng mã".
Empty state: receipt icon, "Bạn chưa có đơn hàng nào", button "Đặt món ngay".
```

---

## S16. Tra cứu đơn / đặt bàn

**Vào từ:** S15, S20, S22, hoặc nút "Tra cứu đơn khác" (S13), "Tra cứu lại" (S21).

**Bố cục:**
- Thanh chọn 2 nút: "Đơn hàng" | "Đặt bàn".
- Icon lớn (hộp tìm kiếm / lịch tìm kiếm), tiêu đề "Tra cứu đơn hàng" / "Tra cứu đặt bàn", mô tả "Nhập mã đơn và số điện thoại đã dùng khi đặt hàng" / "Nhập mã đặt bàn và số điện thoại đã dùng khi đặt".
- Ô "Mã đơn hàng" (gợi ý "VD: FAB261001123456") hoặc "Mã đặt bàn" (gợi ý "VD: RSV261001123456"). Tự in hoa, bỏ khoảng trắng.
- Ô "Số điện thoại" (gợi ý "0901234567"). Bỏ dấu cách trước khi gửi.
- Nút "Tra cứu" → S13 hoặc S21 (mang theo mã + SĐT).

**Kiểm tra:** cả 2 ô bắt buộc: "Vui lòng nhập mã", "Vui lòng nhập số điện thoại". Lỗi 429 → "Bạn tra cứu quá nhiều lần, vui lòng thử lại sau".

```text
Lookup screen with a segmented control "Đơn hàng" | "Đặt bàn".
Large coral search-box icon, title "Tra cứu đơn hàng", subtitle "Nhập mã đơn và số điện thoại đã dùng khi đặt hàng".
Fields "Mã đơn hàng" (placeholder "VD: FAB261001123456") and "Số điện thoại" (placeholder "0901234567").
Full-width coral button "Tra cứu".
```

---

## S17. Đặt bàn

**Vào từ:** tab "Đặt bàn", nút đặt bàn ở S04, nút "Đặt lại ngày/giờ khác" ở S20 / S21 (khi đó **điền sẵn** tên, SĐT, email, số khách, khu vực từ lịch cũ).

**Bố cục:**
1. Ảnh nhỏ không gian nhà hàng ở đầu, chữ trên ảnh: "Giữ chỗ cho khoảnh khắc đặc biệt", "🕙 10:00 - 22:00 hằng ngày", "📞 Đoàn trên 20 người: gọi 1900 1234".
2. Tiêu đề "Đặt bàn", phụ đề "Điền thông tin, chúng tôi sẽ xác nhận qua điện thoại."
3. **Thông tin khách:** "Họ tên" *, "Số điện thoại" *, "Email (không bắt buộc)". Đã đăng nhập thì điền sẵn.
4. **Thời gian:**
   - "Ngày" *: dải ngày cuộn ngang 14 ngày tới (thẻ "T2 28/10"), mặc định **ngày mai**, + nút lịch để chọn ngày xa hơn. Không chọn được ngày đã qua.
   - "Giờ" *: lưới chip giờ, 30 phút một ô, từ **10:00 đến 21:00** (giờ mở cửa đến trước giờ đóng 1 tiếng). Mặc định **19:00**. Hôm nay thì làm mờ các giờ cách hiện tại dưới 30 phút.
   - "Số khách" *: bộ chọn `[ − ] 2 [ + ]`, 1–50, mặc định 2.
5. **"Khu vực mong muốn"**: thẻ chọn: "Không yêu cầu" (mặc định), "Trong nhà", "Ngoài trời - view biển", "Phòng VIP" (danh sách lấy từ `/info.reservationAreas`).
6. Khi đã chọn khu vực → hiện dòng **"Chọn bàn (không bắt buộc)"**:
   - Chưa chọn bàn: nút viền "Xem sơ đồ & chọn bàn" → S18. Chữ nhỏ: "Không chọn thì nhà hàng sẽ xếp bàn giúp bạn."
   - Đã chọn bàn: dải Ocean 50 "Đã chọn bàn **B03** · 4 ghế" + "Đổi bàn" (→ S18) + "Bỏ chọn".
7. "Ghi chú" (nhiều dòng, gợi ý "Sinh nhật, ghế trẻ em, dị ứng thực phẩm...").
8. Nút dưới cố định: "Xác nhận đặt bàn".

**Kiểm tra:**

| Ô | Quy tắc | Thông báo |
|---|---|---|
| Họ tên | 2–100 ký tự | "Vui lòng nhập họ tên" |
| SĐT | `0`/`+84` + 9–10 số | "Số điện thoại không hợp lệ" |
| Email | Nếu nhập thì phải đúng dạng | "Email không hợp lệ" |
| Ngày giờ | Sau hiện tại **ít nhất 30 phút**; trong 10:00–21:00 | "Vui lòng đặt trước ít nhất 30 phút" / "Nhà hàng nhận khách từ 10:00, đặt muộn nhất trước giờ đóng cửa 1 tiếng" |
| Số khách | 1–50 | "Ít nhất 1 khách" / "Tối đa 50 khách, đoàn lớn vui lòng gọi hotline" |
| Ghi chú | ≤ 500 ký tự | – |

**Quy tắc chọn bàn:**
- Đổi ngày, giờ, số khách hoặc khu vực mà bàn đã chọn không còn trống / không đủ ghế / khác khu → **tự bỏ chọn** và báo nhỏ "Bàn B03 không còn phù hợp, vui lòng chọn lại".
- Gửi lên lỗi **409** (người khác vừa đặt mất bàn) → báo `message`, bỏ chọn bàn, mở lại S18.

**Thành công:** lưu `{code, phone}` vào "lịch trên máy này" (cho S20 khi chưa đăng nhập), sang S19.

**API:** `POST /reservations` `{ name, phone, email?, date (ISO, ghép ngày + giờ theo giờ Việt Nam +07:00), guests, area?, tableId?, note? }`.

```text
Table reservation screen. Small header photo of an elegant restaurant interior with dark overlay and text
"Giữ chỗ cho khoảnh khắc đặc biệt", "10:00 - 22:00 hằng ngày", "Đoàn trên 20 người: gọi 1900 1234".
Title "Đặt bàn", subtitle "Điền thông tin, chúng tôi sẽ xác nhận qua điện thoại."
Fields "Họ tên *", "Số điện thoại *", "Email (không bắt buộc)".
"Ngày *": horizontal scroll of date pills like "T3 28/10" (one selected in dark blue) and a calendar icon button.
"Giờ *": grid of time chips 10:00, 10:30 ... 21:00, "19:00" selected, a few past times disabled.
"Số khách *": stepper [-] 2 [+] with people icon.
"Khu vực mong muốn": selectable cards "Không yêu cầu", "Trong nhà", "Ngoài trời - view biển", "Phòng VIP" ("Ngoài trời - view biển" selected).
Row "Chọn bàn (không bắt buộc)" with a light-blue strip "Đã chọn bàn B03 · 4 ghế" and text buttons "Đổi bàn", "Bỏ chọn".
Multiline "Ghi chú" with placeholder "Sinh nhật, ghế trẻ em, dị ứng thực phẩm...".
Sticky coral button "Xác nhận đặt bàn".
```

---

## S18. Chọn bàn trên sơ đồ

**Vào từ:** S17. Chọn xong bấm "Chọn bàn này" → quay về S17 với bàn đã chọn.

**Bố cục:**
1. Thanh trên: ←, "Chọn bàn", dòng nhỏ "Ngoài trời - view biển · 19:00 28/10 · 4 khách".
2. **Chú thích màu** (hàng chấm tròn): 🟢 Bàn trống · 🔵 Bàn bạn chọn · 🟡 Đã đặt - chờ xác nhận · 🔴 Đã có khách · ⚪ Không đủ ghế.
3. **Sơ đồ khu vực**: lưới theo số cột (`cols`) và hàng (`rows`) của khu; mỗi bàn đặt đúng ô `x` (cột), `y` (hàng).
   - Khu ngoài trời: dải xanh biển nhạt có sóng "🌊 Biển" ở **trên** sơ đồ.
   - Khu trong nhà: đường chấm "Cửa ra vào" ở **dưới** sơ đồ.
   - Mỗi bàn hiện **mã bàn** (đậm) và "👥 4".
   - Bàn ≤ 6 ghế: hình **tròn**. Bàn ≥ 8 ghế: hình **vuông bo góc**. Bàn 2 ghế nhỏ hơn.
4. Chữ nhỏ dưới sơ đồ: "Bấm vào một bàn màu xanh lá để chọn. Sơ đồ tự cập nhật mỗi 30 giây."
5. Thanh dưới cố định: chưa chọn → nút mờ "Chọn bàn"; đã chọn → "Bàn B03 · 4 ghế" + nút coral "Chọn bàn này".

**Màu và cách bấm:**

| Trạng thái | Giao diện | Bấm được? |
|---|---|---|
| Trống (`free`) | Viền + nền xanh lá nhạt, chữ xanh lá đậm | Có → thành "đang chọn" |
| Đang chọn | Nền Ocean 600, chữ trắng, vòng sáng | Bấm lại để bỏ chọn |
| Chờ xác nhận (`pending`) | Viền + nền vàng nhạt | Không |
| Đã có khách (`occupied`) | Viền + nền đỏ nhạt | Không |
| Không đủ ghế (ghế < số khách) | Viền **đứt** xám, chữ xám | Không |
| Tạm ngưng (`inactive`) | Nền xám, chữ **gạch ngang** | Không |

Bấm bàn không chọn được → hiện tooltip/snackbar ngắn, vd "Bàn T03 đã có khách vào giờ này".

**Quy tắc:** mỗi lượt đặt giữ bàn **120 phút**, nên bàn bận nếu có lịch bắt đầu trong khoảng ±2 tiếng so với giờ bạn chọn (backend tính sẵn, app chỉ hiện màu). Tự tải lại mỗi 30 giây; bàn đang chọn bị người khác đặt mất → bỏ chọn và báo.

**Bố cục bàn mặc định** (để Stitch vẽ cho giống):
- Trong nhà (4 cột × 3 hàng): T01(2) T02(2) T03(4) T04(4) / T05(4) T06(4) T07(6) T08(6) / T09(2) T10(2) T11(8) T12(10)
- Ngoài trời - view biển (4 × 2): B01(2) B02(2) B03(4) B04(4) / B05(4) B06(6) B07(6) B08(8)
- Phòng VIP (3 × 1): VIP1(10) VIP2(12) VIP3(20)

**API:** `GET /reservations/tables?date=<ISO>` → `{ diningMinutes, areas: [{ name, cols, rows, tables: [{ id, code, seats, x, y, status }] }] }`.

```text
Table picker screen. Top bar with back arrow, title "Chọn bàn", subtitle "Ngoài trời - view biển · 19:00 28/10 · 4 khách".
Legend row with colored dots: green "Bàn trống", blue "Bàn bạn chọn", amber "Đã đặt - chờ xác nhận", red "Đã có khách", gray "Không đủ ghế".
Floor plan card: on top a light sky-blue gradient strip with wave icon labeled "Biển".
Grid of 4 columns x 2 rows of tables. Row 1: B01 (2 seats, small circle, green), B02 (2, red), B03 (4, circle, selected solid blue with white text and glow ring), B04 (4, amber).
Row 2: B05 (4, green), B06 (6, green), B07 (6, red), B08 (8 seats, rounded square, green).
Each table shows its code in bold and a small people icon with seat count.
Small gray hint "Bấm vào một bàn màu xanh lá để chọn. Sơ đồ tự cập nhật mỗi 30 giây."
Sticky bottom bar: "Bàn B03 · 4 ghế" and coral button "Chọn bàn này".
Also show the indoor variant (4x3 grid, T01..T12, a dotted line "Cửa ra vào" at the bottom, one table with dashed gray border meaning not enough seats, one struck-through gray table meaning inactive).
```

---

## S19. Đặt bàn thành công

**Bố cục:** icon lịch có dấu ✓ xanh lá, "Đặt bàn thành công!", "Nhà hàng sẽ gọi xác nhận trong ít phút." Chưa đăng nhập thêm chữ nhỏ: "Hãy lưu lại mã đặt bàn để tra cứu hoặc hủy lịch ở mục **Tra cứu**."

Thẻ thông tin nền Ocean 50: "Mã đặt bàn: **RSV…**" (nút sao chép), "Thời gian: 19:00 28/10/2026", "Số khách: 4", "Khu vực: Ngoài trời - view biển" (nếu có), "Bàn: B03 (4 ghế)" (nếu có).

Nút: "Xem chi tiết" (viền) → S21; "Đặt thêm" (coral) → S17 trống. Nút phụ "Thêm vào lịch điện thoại" (tùy chọn, dùng thư viện lịch của máy).

```text
Reservation success screen. Big green calendar-check icon, title "Đặt bàn thành công!",
"Nhà hàng sẽ gọi xác nhận trong ít phút.", small gray "Hãy lưu lại mã đặt bàn để tra cứu hoặc hủy lịch ở mục Tra cứu."
Light-blue info card: "Mã đặt bàn: RSV261027123456" with copy icon, "Thời gian: 19:00 28/10/2026", "Số khách: 4",
"Khu vực: Ngoài trời - view biển", "Bàn: B03 (4 ghế)".
Buttons: outlined "Xem chi tiết" and coral "Đặt thêm".
```

---

## S20. Hoạt động: Lịch đặt bàn của tôi

**Vào từ:** tab "Hoạt động" → tab con "Đặt bàn".

**Bố cục:** danh sách thẻ, chia 2 nhóm: **"Sắp tới"** (Chờ xác nhận / Đã xác nhận, giờ hẹn chưa qua) và **"Đã qua"** (còn lại). Mỗi thẻ:
- Mã (đơn cách) + nhãn trạng thái.
- 📅 "19:00 28/10/2026" · 👥 "4 khách" · "Ngoài trời - view biển · Bàn B03".
- "Ghi chú: …" nếu có.
- **Khung bị hủy** (khi trạng thái Đã hủy **và** có lý do): viền + nền đỏ nhạt, "📅✕ Nhà hàng đã hủy lịch này", "Lý do: Hết bàn vào khung giờ này", "Rất xin lỗi bạn. Bạn có thể chọn ngày hoặc khung giờ khác để đặt lại." + nút nhỏ "Đặt lại ngày/giờ khác" → S17 điền sẵn.
- Nút "Hủy đặt bàn" (viền) khi Chờ xác nhận / Đã xác nhận **và chưa tới giờ hẹn** → hỏi "Hủy lịch đặt bàn này?" → snackbar "Đã hủy đặt bàn".
- Bấm thẻ → S21.

**Nhãn:** Chờ xác nhận (vàng), Đã xác nhận (xanh dương), Đã đến (xanh lá), Đã hủy (đỏ).

**Đã đăng nhập:** `GET /reservations/my`. **Chưa đăng nhập:** lịch đặt trên máy này (`GET /reservations/track/:code?phone=`) + khung "Đăng nhập để xem lịch trên mọi thiết bị".

**Trống:** icon lịch, "Bạn chưa đặt bàn lần nào", nút "Đặt bàn" → S17.

```text
"Hoạt động" screen with segmented control "Đơn hàng" | "Đặt bàn" (selected).
Section headers "Sắp tới" and "Đã qua". Reservation cards: monospace code "RSV261027123456" and a status pill
(amber "Chờ xác nhận", blue "Đã xác nhận", green "Đã đến", red "Đã hủy"),
row with calendar icon "19:00 28/10/2026", people icon "4 khách", "Ngoài trời - view biển · Bàn B03",
optional gray "Ghi chú: Sinh nhật, chuẩn bị giúp bánh kem", outlined small button "Hủy đặt bàn".
One cancelled card contains a red-tinted notice box: "Nhà hàng đã hủy lịch này", "Lý do: Hết bàn vào khung giờ này",
"Rất xin lỗi bạn. Bạn có thể chọn ngày hoặc khung giờ khác để đặt lại." and a coral small button "Đặt lại ngày/giờ khác".
```

---

## S21. Chi tiết đặt bàn

**Vào từ:** S19, S20, S16.

**Bố cục:**
1. "Mã đặt bàn" + mã to (đơn cách) bên trái, nhãn trạng thái bên phải.
2. Khối Ocean 50: 📅 ngày giờ; 👥 số khách; 📍 khu vực **· Bàn B03**; 📞 tên · SĐT.
3. "Ghi chú: …" (nếu có).
4. Khung bị hủy kèm lý do + nút đặt lại (giống S20).
5. Đang Chờ xác nhận: chữ vàng "Nhà hàng sẽ gọi điện xác nhận trong ít phút."
6. Chữ nhỏ: "Cần thay đổi giờ hoặc số khách? Gọi hotline 1900 1234." + nút "Gọi ngay".
7. Nút: "Xem thực đơn" (viền) → S05; "Hủy đặt bàn" (đỏ, điều kiện như S20); "Chỉ đường" (mở bản đồ tới địa chỉ nhà hàng).

**Không tìm thấy:** icon lịch tìm kiếm, "Không tìm thấy lịch đặt bàn", "Kiểm tra lại mã đặt bàn và số điện thoại.", nút "Tra cứu lại" → S16 (tab Đặt bàn).

**API:** `GET /reservations/track/:code?phone=` (có `table`, `cancelReason`), `POST /reservations/:code/cancel` `{ phone? }`.

```text
Reservation detail screen. Header: gray label "Mã đặt bàn" with big monospace "RSV261027123456", blue pill "Đã xác nhận" on the right.
Light-blue info box with icon rows: calendar "19:00 28/10/2026", people "4 khách", pin "Ngoài trời - view biển · Bàn B03", phone "Nguyễn Văn An · 0901234567".
Gray "Ghi chú: Sinh nhật, chuẩn bị giúp bánh kem".
Small text "Cần thay đổi giờ hoặc số khách? Gọi hotline 1900 1234." with a "Gọi ngay" link.
Buttons: outlined "Xem thực đơn", outlined "Chỉ đường", red "Hủy đặt bàn".
Also a cancelled variant with the red notice box "Nhà hàng đã hủy lịch này" / "Lý do: ..." and button "Đặt lại ngày/giờ khác".
```

---

## S22. Tài khoản

**Bố cục khi đã đăng nhập:**
1. Thẻ đầu: avatar tròn Ocean 900 chữ cái đầu tên (trắng), tên, email, SĐT.
2. Danh sách mục (mỗi mục có icon + ›):
   - "Thông tin cá nhân" → S23
   - "Đổi mật khẩu" → S24
   - "Đơn hàng của tôi" → S15
   - "Lịch đặt bàn" → S20
   - "Tra cứu bằng mã" → S16
   - "Thông tin nhà hàng" → S25
   - "Gọi hotline 1900 1234"
3. Nút "Đăng xuất" (chữ đỏ) → hỏi "Bạn muốn đăng xuất?" → xóa token, giữ nguyên giỏ hàng, về S04.
4. Dưới cùng: "Phiên bản 1.0.0".

**Khi chưa đăng nhập:** thẻ đầu thay bằng: icon người, "Chào bạn!", "Đăng nhập để lưu lịch sử đơn và điền thông tin nhanh hơn", 2 nút "Đăng nhập" (→ S02), "Đăng ký" (→ S03). Danh sách chỉ còn: Tra cứu bằng mã, Thông tin nhà hàng, Gọi hotline.

```text
Account screen, logged-in variant: top card with a dark-blue circle avatar showing the letter "A", name "Nguyễn Văn An",
email "khach@fab.vn", phone "0901234567".
List rows with icons and chevrons: "Thông tin cá nhân", "Đổi mật khẩu", "Đơn hàng của tôi", "Lịch đặt bàn",
"Tra cứu bằng mã", "Thông tin nhà hàng", "Gọi hotline 1900 1234".
Red text row "Đăng xuất". Footer "Phiên bản 1.0.0".
Also a guest variant: card with person icon, "Chào bạn!", "Đăng nhập để lưu lịch sử đơn và điền thông tin nhanh hơn",
buttons coral "Đăng nhập" and outlined "Đăng ký", followed by only "Tra cứu bằng mã", "Thông tin nhà hàng", "Gọi hotline 1900 1234".
```

---

## S23. Sửa hồ sơ ("Thông tin cá nhân")

**Bố cục:** ←, "Thông tin cá nhân". Ô "Email" (chỉ xem, mờ, không sửa được), "Họ tên", "Số điện thoại", "Địa chỉ mặc định" (chữ nhỏ "Dùng để điền sẵn khi đặt hàng"). Nút "Lưu thay đổi" chỉ bấm được khi có thay đổi.

| Ô | Quy tắc | Thông báo |
|---|---|---|
| Họ tên | 2–100 ký tự | "Vui lòng nhập họ tên" |
| SĐT | Để trống được; có thì `0`/`+84` + 9–10 số | "Số điện thoại không hợp lệ" |
| Địa chỉ | ≤ 255 ký tự, để trống được | – |

Thành công: snackbar "Đã cập nhật thông tin", cập nhật S22. Để trống SĐT / địa chỉ = xóa thông tin đó.

**API:** `PATCH /auth/me` `{ name, phone, address }` → user mới.

```text
Edit profile screen "Thông tin cá nhân" with back arrow. Read-only greyed field "Email" with lock icon,
fields "Họ tên", "Số điện thoại", "Địa chỉ mặc định" with helper "Dùng để điền sẵn khi đặt hàng".
Full-width coral button "Lưu thay đổi" (disabled style when nothing changed).
```

---

## S24. Đổi mật khẩu

**Bố cục:** ←, "Đổi mật khẩu". 3 ô mật khẩu (có nút con mắt): "Mật khẩu hiện tại", "Mật khẩu mới", "Nhập lại mật khẩu mới". Nút "Đổi mật khẩu" (nền Ocean 900).

| Ô | Quy tắc | Thông báo |
|---|---|---|
| Mật khẩu hiện tại | Bắt buộc | "Vui lòng nhập mật khẩu hiện tại" |
| Mật khẩu mới | 6–100 ký tự | "Mật khẩu mới tối thiểu 6 ký tự" |
| Nhập lại | Trùng mật khẩu mới | "Không khớp" |

Thành công: snackbar "Đổi mật khẩu thành công", xóa các ô, quay lại S22. Sai mật khẩu hiện tại → hiện `message` của backend. 429 như S02.

**API:** `POST /auth/change-password` `{ currentPassword, newPassword }`.

```text
Change password screen "Đổi mật khẩu" with back arrow. Three password fields with eye toggles:
"Mật khẩu hiện tại", "Mật khẩu mới", "Nhập lại mật khẩu mới". Full-width dark-blue (#0B3954) button "Đổi mật khẩu".
```

---

## S25. Thông tin nhà hàng

**Bố cục (toàn bộ lấy từ `GET /info`):**
1. Ảnh nhà hàng + tên "FAB Seafood" + slogan.
2. Thẻ thông tin có nút hành động:
   - 📍 "123 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng" → "Chỉ đường" (mở Google Maps).
   - 🕙 "Mở cửa 10:00 - 22:00 hằng ngày" + nhãn "Đang mở cửa" (xanh) / "Đã đóng cửa" (xám) tính theo giờ hiện tại.
   - 📞 "1900 1234" → "Gọi".
   - ✉️ "contact@fabseafood.vn" → mở ứng dụng email.
3. "Khu vực phục vụ": các chip "Trong nhà", "Ngoài trời - view biển", "Phòng VIP".
4. "Giao hàng": "Phí giao hàng 20.000đ · Miễn phí cho đơn từ 500.000đ".
5. Ô bản đồ nhỏ (ảnh bản đồ tĩnh, bấm mở Google Maps).
6. Hàng icon mạng xã hội: Facebook, Instagram, TikTok (mở link).

```text
Restaurant info screen. Header photo with "FAB Seafood" and slogan "Hải sản tươi sống mỗi ngày".
Card with icon rows and action buttons: pin "123 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng" [Chỉ đường],
clock "Mở cửa 10:00 - 22:00 hằng ngày" with green pill "Đang mở cửa", phone "1900 1234" [Gọi], mail "contact@fabseafood.vn".
Section "Khu vực phục vụ" with chips "Trong nhà", "Ngoài trời - view biển", "Phòng VIP".
Section "Giao hàng": "Phí giao hàng 20.000đ · Miễn phí cho đơn từ 500.000đ".
A rounded static map preview. Row of social icons Facebook, Instagram, TikTok.
```

---

## C01. Trạng thái chung (dùng cho mọi màn hình)

| Trạng thái | Giao diện |
|---|---|
| Đang tải lần đầu | Khung xương (skeleton) xám nhạt đúng hình nội dung |
| Đang tải lại | Vòng xoay nhỏ trên đầu (pull-to-refresh) |
| Đang gửi (nút) | Nút hiện vòng xoay, khóa nút, không cho bấm lần 2 |
| Danh sách trống | Icon lớn xám + tiêu đề + mô tả + 1 nút hành động (ghi ở từng màn) |
| Lỗi tải | Icon cảnh báo, "Không tải được dữ liệu", câu lỗi từ backend, nút "Thử lại" |
| Mất mạng | Icon wifi gạch, "Mất kết nối mạng", "Kiểm tra Wi-Fi hoặc 4G rồi thử lại", nút "Thử lại" |
| Hết phiên (401) | Xóa token, snackbar "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", chuyển S02 (giỏ hàng giữ nguyên) |
| Quá nhiều lần (429) | Snackbar "Bạn thao tác quá nhanh, vui lòng thử lại sau X phút" |
| Thông báo ngắn | Snackbar ở dưới: xanh lá (thành công), đỏ (lỗi), có thể kèm 1 nút ("Xem giỏ", "Hoàn tác") |
| Hỏi xác nhận | Hộp thoại: tiêu đề, câu hỏi, nút "Không" và nút chính (đỏ nếu là hủy / xóa) |

**Câu lỗi:** luôn ưu tiên hiện `message` tiếng Việt backend trả về. Lỗi theo từng ô (`errors[].field`) thì hiện dưới đúng ô đó.

```text
A set of reusable state screens for the same app:
1) skeleton loading list of dish cards; 2) error state with warning icon, "Không tải được dữ liệu" and button "Thử lại";
3) offline state with crossed wifi icon, "Mất kết nối mạng", "Kiểm tra Wi-Fi hoặc 4G rồi thử lại", button "Thử lại";
4) green success snackbar "Đã thêm "Tôm sú hấp bia" vào giỏ" with action "Xem giỏ";
5) red error snackbar "Mã giảm giá đã hết hạn";
6) confirm dialog "Hủy đơn hàng?" / "Bạn chắc chắn muốn hủy đơn này?" with buttons "Không" and red "Hủy đơn".
```

---

## 3. Quy tắc nghiệp vụ tóm tắt (để kiểm tra app đã "dứt điểm" chưa)

| Chủ đề | Quy tắc | Nguồn |
|---|---|---|
| Giá | Giá bán = `salePrice` nếu có, không thì `price`. Backend luôn tính lại, không tin giá app gửi | `orders.service.js` |
| Số lượng | 1–50 mỗi món | `orders.validation.js` |
| Phí ship | Giao tận nơi và tạm tính < 500.000đ → 20.000đ; đến lấy luôn 0đ | `/info` |
| Mã giảm giá | Kiểm tra: tồn tại, đang bật, trong thời gian, còn lượt, đủ mức tối thiểu. % có mức tối đa | `coupons.service.js` |
| Trùng món | Gửi 2 dòng cùng món → gộp, cộng số lượng, nối ghi chú bằng "; " | `orders.service.js` |
| Hủy đơn (khách) | Chỉ khi **Chờ xác nhận** và **chưa thanh toán** | `/orders/:code/cancel` |
| Đơn VNPay | Chỉ tạo được khi `/info.onlinePayment = true`. Link hết hạn 15 phút. Tối thiểu 5.000đ | `docs/11` |
| Đơn tiền mặt | Tự chuyển "Đã thanh toán" khi đơn Hoàn thành | `changeStatus` |
| Hủy đơn đã trả | Chỉ nhà hàng làm, trạng thái thanh toán thành "Đã hoàn tiền" | `changeStatus` |
| Đặt bàn | Trước ≥ 30 phút; 10:00–21:00; 1–50 khách | `reservations.validation.js` |
| Giữ bàn | 120 phút / lượt; bận nếu có lịch trong ±2 tiếng | `docs/13` |
| Hủy đặt bàn (khách) | Khi Chờ xác nhận / Đã xác nhận **và chưa tới giờ** | `/reservations/:code/cancel` |
| Lý do hủy | Có `cancelReason` ⇒ nhà hàng hủy ⇒ hiện khung đỏ + nút đặt lại | `docs/14` |
| Lý do hủy đơn | Đơn có `cancelReason` ⇒ nhà hàng hủy ⇒ khung đỏ kèm lý do ở chi tiết đơn, dòng đỏ ở danh sách đơn | `docs/18` |
| Đánh giá | Cần đăng nhập + đã có đơn Hoàn thành chứa món; 1 người 1 đánh giá / món, gửi lại là sửa | `/reviews` |
| Xem đơn / lịch | Chủ (đăng nhập), hoặc đúng SĐT đã đặt (bỏ dấu cách) | `findAccessibleOrder` |
| Giới hạn | Đăng nhập / đăng ký / đổi mật khẩu: 20 lần / 15 phút. Tra cứu: 60 lần / 15 phút. Sơ đồ bàn: 300 lần / 15 phút | `rateLimit.js` |
| Token | Hết hạn sau 7 ngày | `JWT_EXPIRES_IN` |
| Thời gian | API trả giờ UTC, app hiện giờ Việt Nam (+07:00) | `docs/06` |
| Ảnh | `image` bắt đầu bằng `/uploads/...` thì ghép địa chỉ server phía trước | `docs/06` |

## 4. Dữ liệu app lưu trên máy

| Khóa | Nội dung | Ghi chú |
|---|---|---|
| `token` | JWT đăng nhập | Lưu bảo mật (`flutter_secure_storage`) |
| `cart` | `[{ dishId, name, slug, image, unit, category, price, quantity, note }]` | Giữ khi tắt app, giữ khi đăng xuất |
| `guestOrders` | `[{ code, phone, createdAt }]` | Đơn đặt khi chưa đăng nhập, cho S15 |
| `guestReservations` | `[{ code, phone, date }]` | Lịch đặt khi chưa đăng nhập, cho S20 |
| `info` | Kết quả `/info` | Tải lại mỗi lần mở app |

## 5. Kiểm tra cuối cùng (checklist)

Đi hết các luồng này trên app, cái nào chạy đúng thì đánh dấu:

- [ ] Mở app không mạng → thấy màn "Mất kết nối", bấm "Thử lại" có mạng thì vào được.
- [ ] Khách chưa đăng nhập: xem món → thêm 2 món → ghi chú 1 món → áp `WELCOME10` → đặt tiền mặt → thấy S13 có ghi chú món → tab Hoạt động thấy đơn.
- [ ] Hủy đơn vừa đặt → trạng thái "Đã hủy", timeline đổi thành khung đỏ.
- [ ] Đặt đơn VNPay (sandbox) → trả bằng thẻ test → S12 "Thanh toán thành công" → S13 "Đã thanh toán", không còn nút Hủy.
- [ ] Đặt đơn VNPay → bấm Hủy trên trang VNPay → S12 thất bại → S13 bấm "Thanh toán qua VNPay" mở lại được.
- [ ] Giao tận nơi dưới 500.000đ có phí 20.000đ và dòng "Mua thêm …"; chuyển "Đến lấy" thì phí 0đ và ẩn ô địa chỉ.
- [ ] Mã chưa đủ mức tối thiểu báo đúng câu lỗi.
- [ ] Đặt bàn: chọn khu ngoài trời → sơ đồ có dải "Biển" → chọn bàn → đổi số khách quá số ghế → bàn tự bỏ chọn.
- [ ] Đặt bàn giờ cách hiện tại < 30 phút → báo lỗi.
- [ ] Admin (trên web) hủy lịch với lý do → app thấy khung đỏ + "Đặt lại ngày/giờ khác" điền sẵn thông tin.
- [ ] Đăng nhập `khach@fab.vn` → đơn `FAB0000DEMO` (Hoàn thành) → đánh giá 1 món → điểm món cập nhật.
- [ ] Sửa hồ sơ → ra S09 thấy tên, SĐT, địa chỉ điền sẵn.
- [ ] Đổi mật khẩu sai mật khẩu cũ → báo lỗi; đúng → thành công.
- [ ] Token hết hạn (sửa tay token) → về S02, giỏ hàng vẫn còn.

## 6. Phần dành cho nhân viên (làm sau, không nằm trong app khách)

Web đã có trang `/admin` cho nhân viên (đơn hàng, đặt bàn, sơ đồ bàn, món, danh mục, mã giảm giá, đánh giá, nhân sự, phân quyền, thống kê). Nếu sau này muốn app riêng cho nhân viên (vd màn hình bếp chỉ hiện món + ghi chú, lễ tân xác nhận đặt bàn), nên làm **app thứ hai** hoặc **chế độ nhân viên** riêng, dựa trên [12-ma-tran-phan-quyen.md](12-ma-tran-phan-quyen.md) và các API 🛡️ trong [06-api-reference.md](06-api-reference.md). Không đưa vào lần sinh giao diện này để Stitch tập trung vào app khách.
