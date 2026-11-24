# 28. App Quản lý: doanh thu, đơn đã hủy, bia nước, tồn hồ

Từ 24/11/2026. App **FAB Phục vụ** có thêm nhóm **Quản lý**: quản lý / chủ nhà hàng mở app trên điện thoại là thấy ngay doanh thu hôm nay, doanh thu tháng, đơn bị hủy và tình hình hàng — không phải mở máy tính vào `/admin`.

| Ai | Đăng nhập app thấy gì |
|---|---|
| **Quản lý** `quanly@fab.vn`, **Chủ** `chunha@fab.vn`, **Admin** | Vào thẳng **S15 Quản lý · Tổng quan**; menu trái có đủ Sơ đồ bàn · Đơn hôm nay · Quản lý · Tài khoản (quản lý ghi món được nên vẫn vào Sơ đồ bàn làm việc bình thường) |
| **Tổ trưởng** `totruong@fab.vn`, **Thu ngân** `thungan@fab.vn` | Cũng vào S15 trước (họ có quyền Xem "Tổng quan" để nắm doanh thu ca) |
| **Phục vụ, tiếp thực, bếp, hồ hải sản, lễ tân** | Vào **Sơ đồ bàn** như trước; menu trái **không có** mục Quản lý. Gõ thẳng `/manager` thì gặp màn "Tài khoản của bạn không xem được số liệu quản lý" + nút Về sơ đồ bàn |

Điều kiện duy nhất: quyền **Xem "Tổng quan"** (`DASHBOARD`) trong ma trận phân quyền ([12](12-ma-tran-phan-quyen.md)). Admin sửa ma trận trên web là app đổi theo ngay lần đăng nhập sau, không phải sửa code.

Code: app [screens/manager/](../mobile/lib/screens/manager/), [models/manager_stats.dart](../mobile/lib/models/manager_stats.dart), [services/manager_service.dart](../mobile/lib/services/manager_service.dart); backend [modules/stats/manager.controller.js](../backend/src/modules/stats/manager.controller.js).

---

## 1. Hai màn hình

| Mã | Màn | Có gì |
|---|---|---|
| **S15** | Quản lý · Tổng quan | 7 thẻ, xem mục 2. Tự tải lại **60 giây**, vuốt xuống để tải ngay, có nút ⟳ |
| **S16** | Đơn đã hủy | Mở từ thẻ "Đơn đã hủy" ở S15 (có nút ←). Chip **Hôm nay · 7 ngày · Tháng này**; khung tóm tắt; phần **Hủy cả đơn** và phần **Món hủy lẻ** |
| **S17** | Kiểm bia nước | Mở từ thẻ "Bia & nước hôm nay" ở S15. Xuất theo thùng, trả lại cuối ngày, lệch âm / dương ([29](29-kiem-bia-nuoc.md)) |

Vào S15 bằng menu trái (nút ☰) như 3 màn chính khác.

## 2. Bảy thẻ của S15

| Thẻ | Nội dung | Lấy từ đâu |
|---|---|---|
| **Doanh thu hôm nay** | Số lớn = tổng tiền đơn **đã thu** hôm nay; dưới là số đơn + trung bình 1 đơn; rồi 2 dòng **Ăn tại quán** / **Khách đặt online** kèm thanh tỉ lệ | Đơn `COMPLETED` từ 0h hôm nay (giờ VN) |
| **Doanh thu tháng 11/2026** | Như trên, tính **từ ngày 1 của tháng** (không phải 30 ngày gần nhất) | Đơn `COMPLETED` từ 0h ngày 1 |
| **Đơn đã hủy** | Hôm nay bao nhiêu đơn + bao nhiêu tiền; tháng này bao nhiêu. Bấm vào → S16 | Đơn `CANCELLED` |
| **Đang phục vụ** | Bàn có khách / bàn trống / bàn chờ thu tiền + **tiền đang phục vụ (chưa thu)** | Đơn tại quán chưa thu tiền |
| **Bia & nước hôm nay** | Tổng lon/chai + tiền; liệt kê từng loại. **Bấm vào → S17 Kiểm bia nước** ([29](29-kiem-bia-nuoc.md)) | `OrderItem` nhóm món **"Nước uống"** hôm nay, món đã hủy không tính |
| **Tồn hồ hải sản** | Mỗi loại 1 chip "Tôm hùm · 8,5 kg"; loại gần hết tô vàng, hết tô đỏ; trên cùng nhắc "Cần nhập hàng: Cua gạch (1,2 kg)..." | Bảng `TankItem` ([27](27-ton-ho-hai-san.md)) |
| **Món bán chạy hôm nay** | 5 món nhiều nhất | `OrderItem` hôm nay |

**Doanh thu chỉ tính đơn đã hoàn thành** (`COMPLETED` = thu ngân đã bấm "Đã thu tiền", hoặc đơn online đã giao). Bàn đang ăn chưa tính vào doanh thu — tiền đó nằm ở thẻ "Đang phục vụ".

## 3. S16 Đơn đã hủy

Quản lý mở ra để biết **hủy nhiều vì lý do gì** và mất bao nhiêu tiền.

**Hủy cả đơn** — mỗi đơn 1 thẻ: mã đơn, tiền (đỏ), "Ăn tại quán · bàn T01" hoặc "Khách đặt online", số món, giờ hủy, nhân viên mở bàn, và khung **lý do**:
- Có lý do = nhà hàng hủy (backend bắt buộc ghi lý do, xem [18](18-ly-do-huy-don-hang.md))
- Trống = **khách tự hủy** trên web → hiện "Khách tự hủy (không ghi lý do)"

**Món hủy lẻ** — đơn vẫn còn, chỉ bỏ vài món. Mỗi dòng: số phần (hoặc số kg với món bán theo kg), tên món, bàn + mã đơn + giờ, lý do, tiền. Món hủy khi **bếp đã làm** thì bắt buộc có lý do — đó là hàng mất thật, nên màn này ghi rõ để quản lý xem.

## 4. API

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| GET | `/stats/manager` | 🛡️ `DASHBOARD` Xem | Số liệu S15, gom sẵn 1 lần gọi: `today`, `month`, `cancelled`, `tables`, `drinks`, `tank`, `topDishes` |
| GET | `/stats/cancellations?range=today\|7d\|month&page=&limit=` | 🛡️ `DASHBOARD` Xem | S16: `orders` (hủy cả đơn, phân trang 20), `items` (50 món hủy lẻ mới nhất), `summary` |

Viết riêng ở [manager.controller.js](../backend/src/modules/stats/manager.controller.js), **không sửa** `/stats/overview` của trang web Tổng quan: web cần nhiều dữ liệu cho biểu đồ, app cần gọn để mạng 3G mở nhanh.

`today.revenue` luôn bằng `today.dineIn.revenue + today.online.revenue` (online = `DELIVERY` + `PICKUP`).

## 5. Quy tắc

| Chủ đề | Quy tắc |
|---|---|
| Vào màn nào sau đăng nhập | Có quyền Xem "Tổng quan" → **S15**; không có → Sơ đồ bàn. Mở lại app (S01 Splash) cũng theo quy tắc này |
| Ẩn / chặn | Menu trái ẩn mục Quản lý; `ManagerGuard` chặn khi mở thẳng đường dẫn hoặc khi admin vừa rút quyền lúc app đang mở; backend vẫn trả **403** (không tin app) |
| Giờ | Mọi mốc "hôm nay", "tháng này" tính theo **giờ Việt Nam (UTC+7)**, không theo múi giờ máy chủ |
| Tải lại | S15 tự tải lại 60 giây (số liệu quản lý không cần nhanh như sơ đồ bàn 15 giây); S16 chỉ tải khi mở / đổi chip / vuốt |
| Không sửa gì | Cả 2 màn **chỉ xem**. Muốn hủy đơn, nhập hàng vào hồ, thu tiền thì làm trên web `/admin` hoặc màn phục vụ |

## 6. Thử bằng tay

1. `npm run dev`. Mở app, đăng nhập `quanly@fab.vn` / `123456` → vào thẳng **Quản lý**, thấy doanh thu hôm nay / tháng 11/2026.
2. Bấm thẻ **Đơn đã hủy** → S16; đổi chip sang **Tháng này** thấy các đơn hủy kèm lý do.
3. Mở menu trái ☰ → **Sơ đồ bàn**: quản lý vẫn ghi món được như phục vụ.
4. Đăng xuất, đăng nhập `phucvu@fab.vn` → vào **Sơ đồ bàn**, menu trái **không có** mục Quản lý.
5. Để thấy số liệu đổi: ghi 1 món cho bàn trống, gửi bếp → thẻ "Đang phục vụ" tăng; thu tiền trên web → doanh thu hôm nay tăng.

## 7. Đã kiểm tra

| Cách | Kết quả |
|---|---|
| 6 test widget `test/screens/s15_s16_manager_test.dart`: doanh thu ngày / tháng + tách kênh, đơn hủy, bàn, bia nước, tồn hồ (nhắc nhập hàng), mở S16 kèm lý do hủy, menu trái có / không có mục Quản lý, phục vụ mở thẳng `/manager` bị chặn | 6/6 |
| `flutter test` toàn bộ | 98 test qua |
| `flutter analyze` | No issues |
| Live test backend thật (`test/live_api_test.dart`, tài khoản `quanly@fab.vn`): `today.revenue = dineIn + online`, tháng ≥ hôm nay, `busy + free = total`, hồ có 6 loại, `cancellations` khớp số đơn hủy ở tổng quan, **phục vụ gọi `/stats/manager` → 403** | 3/3 (đơn thử đã xóa) |

## 8. Kiểm bia nước (S17)

Bấm thẻ **"Bia & nước hôm nay"** ở S15 mở màn **S17 Kiểm bia nước**: xuất ra quầy theo **thùng**, kiểm số trả lại cuối **ngày**, lệch **âm = thiếu hàng** / **dương = thừa**. Chi tiết: [29-kiem-bia-nuoc.md](29-kiem-bia-nuoc.md).

Thẻ chỉ bấm được với tài khoản có quyền Xem "Bia nước & kiểm kho quầy" (quản lý, chủ, tổ trưởng, thu ngân).
