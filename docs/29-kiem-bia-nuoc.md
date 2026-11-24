# 29. Kiểm bia nước cuối ngày: xuất theo thùng, lệch âm / dương

Từ 24/11/2026. Bia và nước đóng lon / chai xuất từ kho ra quầy **theo thùng**; cuối **ngày** kiểm số còn lại mang về kho. Hệ thống so với số đã bán theo đơn để biết **thiếu hay thừa**:

```
lệch = (bán theo đơn + trả lại kho) − (xuất ra quầy)

   0      khớp — giải thích được hết số hàng đã xuất
   ÂM     THIẾU hàng: xuất ra mà không bán, không trả lại (mất, uống không ghi đơn)
   DƯƠNG  THỪA: bán + trả lại nhiều hơn số đã ghi xuất (lấy thêm từ kho chưa ghi phiếu)
```

Ví dụ: xuất **2 thùng Bia Tiger** (2 × 24 = 48 lon), bán theo đơn 10 lon, cuối ngày trả lại 30 lon → lệch = 10 + 30 − 48 = **−8 → thiếu 8 lon**.

| Ai | Dùng gì | Làm gì |
|---|---|---|
| **Thu ngân** `thungan@fab.vn` (đứng quầy) | App, màn **S17 Kiểm bia nước** | Ghi số **thùng** xuất ra quầy, số lon lẻ, số **trả lại** cuối ngày, ghi chú |
| **Quản lý**, Chủ, Admin | App S17 | Như trên + sửa **quy cách thùng** (thùng 24 lon / két 20 chai), tắt / bật loại |
| **Tổ trưởng** | App S17 | Chỉ xem (không ghi được) |
| Phục vụ, bếp, hồ hải sản, lễ tân, tạp vụ, kỹ thuật | — | Không thấy màn này (403) |

Quyền: chức năng mới **"Bia nước & kiểm kho quầy"** (`DRINKS`) trong ma trận phân quyền ([12](12-ma-tran-phan-quyen.md)): Xem = mở màn, **Sửa** = ghi số xuất / trả lại, Thêm = thêm loại vào danh sách kiểm, Xóa = sửa quy cách thùng / tắt loại.

Code: backend [modules/drinks/](../backend/src/modules/drinks/), quy cách thùng [config/drinks.js](../backend/src/config/drinks.js); app [screens/manager/s17_drink_check_screen.dart](../mobile/lib/screens/manager/s17_drink_check_screen.dart).

---

## 1. Mười loại đồ uống, quy cách thùng

Mọi món trong nhóm thực đơn **"Nước uống"** đều vào danh sách kiểm. Khác tồn hồ hải sản ([27](27-ton-ho-hai-san.md)): mỗi **món** là một loại hàng riêng (không gộp), vì mỗi loại bia / nước là một mặt hàng khác nhau.

| Loại | Đơn vị | Thùng |
|---|---|---|
| Coca-Cola, 7 Up, Fanta cam, Sprite | lon | 24 |
| Bia Larue, Bia Tiger, Bia Heineken | lon | 24 |
| Trà xanh Không Độ, Nước suối Aquafina | chai | 24 |
| **Bia Sài Gòn Special** | chai | **20** (két chai) |

Quy cách đoán theo tên món trong [config/drinks.js](../backend/src/config/drinks.js), mặc định 24. Quản lý sửa được trên app; sửa xong **số đã xuất tính lại ngay** theo quy cách mới.

## 2. Màn S17 trên app

Mở từ thẻ **"Bia & nước hôm nay"** ở màn Quản lý (S15, [28](28-app-quan-ly.md)), hoặc đường dẫn `/manager/drinks`.

**Đầu màn — tổng kết ngày:** khung màu theo tổng lệch — đỏ "Thiếu 8 lon / chai", vàng "Thừa 2", xanh "Khớp hết", xám "Chưa kiểm loại nào"; kèm "Đã kiểm 2/10 loại · 1 loại lệch" và "Cả ngày: xuất 72 · bán 20 · trả lại 48".

**Mỗi loại một thẻ:** tên, "Thùng 24 lon", nhãn lệch ở góc (`thiếu 8 lon` / `thừa 2 lon` / `khớp` / `chưa kiểm`), rồi 3 ô số:

| Ô | Nghĩa |
|---|---|
| **Xuất ra quầy** | Tổng lon / chai đã xuất, dưới ghi "2 thùng" |
| **Bán theo đơn** | **Backend tự tính** từ các đơn trong ngày (món đã hủy không tính) — người kiểm không sửa được |
| **Trả lại** | Số mang về kho cuối ngày |

Dưới thẻ có ghi chú và **người kiểm**.

**Bấm thẻ** (cần quyền Sửa) mở sheet nhập: `[−] số thùng [+]`, `[−] lon lẻ [+]`, `[−] trả lại [+]`, ô ghi chú. Khung màu ở giữa **tính lại lệch ngay khi bấm**, hiện cả phép tính "bán 10 + trả lại 30 − xuất 48 = -8" kèm một câu giải thích. Bấm **Lưu phiếu kiểm** mới gửi lên.

**Chọn ngày:** nút 📅 trên thanh tiêu đề — xem lại 90 ngày trước, **không chọn được ngày chưa tới**.

## 3. Quy tắc

| Chủ đề | Quy tắc |
|---|---|
| Mỗi loại 1 phiếu / ngày | `@@unique([productId, date])`. Ghi lại lần nữa là **sửa** phiếu đó, không tạo thêm |
| "Bán" luôn tính lại | Mở màn là tính theo đơn mới nhất; lúc lưu phiếu thì chốt lại vào `soldUnits` để xem lại lịch sử. Hủy món / hủy đơn → "bán" giảm theo |
| Chưa ghi phiếu | Lệch hiện **"chưa kiểm"**, không kết luận thiếu (xuất = 0 không có nghĩa là mất hàng) |
| Trả lại > xuất | Backend trả **400**: "Trả lại 100 lon nhiều hơn số xuất ra quầy (48)" — bắt sửa số xuất trước (thường gõ nhầm) |
| Ngày chưa tới | 400 "Chưa kiểm được cho ngày chưa tới" |
| Loại đã tắt | Không ghi phiếu được (400); bật lại mới kiểm |
| Đổi quy cách thùng | Số đã xuất của phiếu cũ tính lại theo quy cách mới (lưu `issuedPacks`, không lưu tổng) |
| Giờ | "Ngày" tính theo **giờ Việt Nam (UTC+7)** |

## 4. Database

| Bảng / cột | Ý nghĩa |
|---|---|
| `DrinkProduct` | 1 món đồ uống: `dishId` (unique), `packSize` (lon / chai mỗi thùng), `isActive`, `sortOrder` |
| `DrinkDayCheck` | Phiếu kiểm 1 loại / 1 ngày: `date`, `issuedPacks`, `issuedUnits`, `returnedUnits`, `soldUnits` (chốt lúc lưu), `diffUnits`, `note`, `userId` (ai kiểm) |
| `Dish.drink` | Quan hệ 1-1 tới `DrinkProduct` |

Migration: `backend/prisma/migrations/20261123171907_kiem_bia_nuoc/`. Chỉ **thêm** bảng, không xóa dữ liệu cũ.

## 5. API `/api/v1/drinks`

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| GET | `/drinks/check?date=yyyy-MM-dd&all=1` | 🛡️ `DRINKS` Xem | Phiếu kiểm 1 ngày: `rows` (mỗi loại kèm `packSize`, `issuedPacks`, `issued`, `sold`, `returned`, `diff`, `checked`, `note`, `by`) + `summary` (`issued`, `sold`, `returned`, `diff`, `checked`, `total`, `mismatched`). Không truyền `date` = hôm nay |
| PUT | `/drinks/check` | 🛡️ `DRINKS` Sửa | `{ date?, productId, issuedPacks?, issuedUnits?, returnedUnits?, note? }`. Trả `message` kiểu *"Bia Tiger: xuất 48, bán 10, trả lại 30 lon → THIẾU 8"* |
| GET | `/drinks/history?days=14` | 🛡️ Xem | Các ngày đã kiểm gần đây + tổng lệch mỗi ngày |
| GET | `/drinks/products?all=1` | 🛡️ Xem | Danh sách loại + quy cách thùng |
| POST | `/drinks/products` | 🛡️ Thêm | `{ dishId, packSize? }`. Món ngoài nhóm "Nước uống" = 400 |
| PATCH | `/drinks/products/:id` | 🛡️ Xóa | `{ packSize?, isActive? }` |

## 6. Lệnh

```bash
npm --prefix backend run db:seed-drinks   # tạo 10 loại + quy cách thùng, và cấp quyền DRINKS cho các vai trò
```

Lệnh này cũng chạy lại `seedDefaultRoles` vì `DRINKS` là **chức năng mới** trong ma trận: database tạo trước 24/11/2026 chưa có dòng quyền nào cho nó nên mọi vai trò (trừ Chủ / Admin) sẽ không thấy màn. Chạy lệnh là xong, không xóa quyền admin đã sửa tay. `npm run setup` và `db:seed-menu` cũng tự tạo danh sách loại.

## 7. Thử bằng tay

1. `npm run dev`, đăng nhập app bằng `thungan@fab.vn` / `123456` → màn Quản lý → bấm thẻ **Bia & nước hôm nay** → S17.
2. Bấm thẻ **Bia Tiger** → đặt **2 thùng**, trả lại **30** → khung hiện "Thiếu 18 lon" (vì chưa bán lon nào) → **Lưu phiếu kiểm**.
3. Ghi 1 đơn ở bàn có **2 lon Bia Tiger**, gửi bếp → quay lại S17: ô "Bán theo đơn" thành 2, lệch còn **−16**.
4. Sửa trả lại thành **46** → "Khớp". Đổi quy cách thùng (tài khoản `quanly@fab.vn`) từ 24 xuống 12 → số xuất thành 24, lệch đổi theo.
5. Đăng nhập `phucvu@fab.vn`, mở `/manager/drinks` → màn "Tài khoản của bạn không xem được phiếu kiểm bia nước".

## 8. Đã kiểm tra

| Cách | Kết quả |
|---|---|
| Script API qua backend thật: quyền (401, quản lý / thu ngân xem được, phục vụ và bếp 403, thu ngân không sửa quy cách thùng), 10 loại + thùng 24 / két 20, xuất 2 thùng = 48, **lệch âm = thiếu**, **lệch dương = thừa** (tạo đơn bán 2 lon rồi kiểm), "bán" tự tính theo đơn và trả về 0 khi hủy đơn, chặn trả lại > xuất / số âm / ngày tương lai / ngày sai định dạng, đổi quy cách thùng tính lại, tổng kết ngày + lịch sử | **35/35** (dữ liệu thử đã xóa) |
| 4 test widget `test/screens/s17_drink_check_test.dart` | 4/4 |
| `flutter test` toàn bộ | 102 test qua |
| `flutter analyze` | No issues |
| Live test `test/live_api_test.dart` (tài khoản `thungan@fab.vn`): thùng 24 / két 20, xuất 2 thùng, lệch âm = thiếu, chặn trả lại > xuất, phục vụ 403 | 4/4 |

## 9. Chưa làm

- **Trang web cho phần này**: hiện chỉ có trên app (người kiểm đứng ở quầy, dùng điện thoại tiện hơn). Nếu cần bảng tổng hợp theo tháng để in thì làm thêm trang `/admin/drinks`.
- **Lịch sử trên app**: API `/drinks/history` đã có nhưng app chưa vẽ màn lịch sử; hiện xem từng ngày bằng nút 📅.
