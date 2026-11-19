# 21. Lễ tân: lịch hôm nay, chuyển bàn, hủy bàn

Trang **Đặt bàn** (`/admin/reservations`) có 3 chế độ xem. Lễ tân (`letan@fab.vn` / `123456`) mở trang sẽ vào thẳng tab **Hôm nay**.

| Tab | Dùng để |
|---|---|
| **Hôm nay** (mặc định) | Các lịch hôm nay xếp theo giờ, chia nhóm Chưa đến / Đã đến / Đã hủy. Lịch sắp đến trong 60 phút tô vàng, lịch trễ giờ tô đỏ. Tự tải lại mỗi 30 giây |
| Danh sách | Mọi lịch, lọc theo ngày, trạng thái, tên / SĐT / mã. Cột "Khu vực / Bàn" ghi thêm "chuyển từ T03" nếu đã chuyển bàn |
| Sơ đồ bàn | Sơ đồ 3 khu tại 1 thời điểm. Bấm bàn có khách để xem thông tin, Chuyển bàn, Xác nhận, Hủy |

Ở cả 3 tab, mỗi lịch có các nút (cần quyền **Sửa** đặt bàn):

| Nút | Khi nào hiện | Làm gì |
|---|---|---|
| **Chuyển bàn** | Lịch đã có bàn, trạng thái Chờ xác nhận / Đã xác nhận / Khách đã đến | Đổi sang bàn khác |
| **Xếp bàn** | Lịch chưa có bàn (khách không chọn bàn lúc đặt) | Gán bàn cho khách |
| Xác nhận / Khách đã đến | Như trước | Đổi trạng thái |
| **Hủy** | Chờ xác nhận / Đã xác nhận | Bắt buộc chọn / ghi lý do, khách xem được lý do ([14](14-ly-do-huy-dat-ban.md)) |

## 1. Chuyển bàn / xếp bàn

1. Bấm **Chuyển bàn** (hoặc **Xếp bàn**). Hộp thoại mở sơ đồ **đúng giờ khách đến** của lịch đó.
2. Màu bàn:
   - Tím: bàn khách đang giữ.
   - Xanh lá: bàn trống, bấm chọn được.
   - Vàng / đỏ: đã có lịch khác trong khung giờ (mỗi lượt giữ bàn 120 phút, xem [13](13-so-do-ban.md)).
   - Xám viền đứt: không đủ ghế cho số khách của lịch.
3. Bấm bàn mới (tô xanh đậm), chọn lý do có sẵn hoặc tự ghi (không bắt buộc), bấm **Chuyển bàn sang ...**.
4. Khu vực của lịch tự đổi theo bàn mới. Khách xem chi tiết lịch thấy số bàn mới; **lý do và tên nhân viên chỉ nhân viên thấy**.

Luật kiểm tra ở backend (giống lúc khách tự chọn bàn):
- Bàn mới phải đang phục vụ, đủ ghế, không trùng giờ với lịch khác.
- Không chuyển vào đúng bàn đang ngồi; lịch đã hủy không chuyển được.
- 2 lễ tân cùng chuyển 2 lịch vào 1 bàn: chạy trong transaction `Serializable`, người sau nhận lỗi "Bàn vừa được xếp cho khách khác". Hộp thoại tự tải lại sơ đồ.

Vì sao cho chuyển cả lịch **Khách đã đến**: khách đang ngồi muốn đổi chỗ (ra view biển, thêm người cần bàn lớn hơn).

## 2. Lịch sử chuyển bàn

Mỗi lần chuyển / xếp bàn lưu 1 dòng vào bảng `ReservationTableChange`. Xem ở cuối hộp thoại Chuyển bàn (mở từ tab Hôm nay hoặc Danh sách):

```
10:51 19/11/2026 · T03 → T04 · Hoàng Lễ Tân · Khách muốn gần cửa sổ
```

| Cột | Ý nghĩa |
|---|---|
| `reservationId` | Lịch đặt (xóa lịch thì lịch sử xóa theo) |
| `fromTableCode`, `fromArea` | Bàn cũ; trống = lần xếp bàn đầu tiên |
| `toTableCode`, `toArea` | Bàn mới |
| `reason` | Lý do (không bắt buộc) |
| `changedById` | Nhân viên chuyển |

Lưu **mã bàn dạng chữ** thay vì id (giống `OrderItem` lưu tên món lúc đặt) để lịch sử vẫn đọc đúng khi bàn bị đổi mã hoặc xóa.

## 3. API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| PATCH | `/reservations/:id/table` | Đặt bàn · Sửa | `{ tableId, reason? }` (lý do ≤ 200 ký tự). Trả `{ data, message }`, `message` vd "Đã chuyển từ bàn T03 sang bàn T04" |
| GET | `/reservations?date=YYYY-MM-DD&limit=100` | Đặt bàn · Xem | Tab Hôm nay dùng lại API danh sách. Mỗi lịch có thêm `tableChanges[]` (mới nhất trước, kèm `changedBy.name`) |

Lỗi: 400 (cùng bàn, không đủ ghế, bàn tạm ngưng, lịch đã hủy, thiếu `tableId`), 409 (bàn đã có khách / vừa bị người khác lấy), 403 (không có quyền Sửa đặt bàn, vd Phục vụ).

API của khách (`/reservations/my`, `/reservations/track/:code`) **không** trả `tableChanges`.

## 4. File liên quan

| File | Nội dung |
|---|---|
| [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) | Model `ReservationTableChange` |
| [reservations.controller.js](../backend/src/modules/reservations/reservations.controller.js) | `moveTable`, `MOVABLE`, `adminInclude` (kèm lịch sử, chỉ dùng cho admin) |
| [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js) | `moveTableSchema` |
| [tables.service.js](../backend/src/modules/reservations/tables.service.js) | `assertTableAvailable`: dùng chung cho khách đặt bàn và lễ tân chuyển bàn |
| [frontend/src/pages/admin/Reservations.jsx](../frontend/src/pages/admin/Reservations.jsx) | 3 tab, nút Chuyển bàn ở Danh sách và Sơ đồ |
| [frontend/src/pages/admin/ReservationsToday.jsx](../frontend/src/pages/admin/ReservationsToday.jsx) | Tab Hôm nay (`SOON_MINUTES = 60`) |
| [frontend/src/components/MoveTableDialog.jsx](../frontend/src/components/MoveTableDialog.jsx) | Hộp thoại chuyển / xếp bàn, lý do nhanh (`REASONS`), lịch sử |
| [frontend/src/lib/reservation.js](../frontend/src/lib/reservation.js) | `RESERVATION_ACTIONS`, `MOVABLE_STATUSES`, trạng thái bàn `current` (tím) |

## 5. Cập nhật database đang có

```bash
npm --prefix backend run db:deploy   # tạo bảng ReservationTableChange, KHÔNG xóa dữ liệu
```

## 6. Muốn mở rộng

- **Đổi mốc "sắp đến":** `SOON_MINUTES` trong `ReservationsToday.jsx`.
- **Thêm lý do nhanh:** `REASONS` trong `MoveTableDialog.jsx`.
- **Ý tưởng tiếp theo:** đổi giờ / số khách của lịch; báo cho khách (SMS / thông báo app) khi bị chuyển bàn; ghép 2 bàn cho đoàn đông.
