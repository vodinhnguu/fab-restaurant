# 14. Lý do hủy đặt bàn

Khi nhà hàng **hủy** một lịch đặt bàn, admin phải chọn hoặc ghi **lý do**. Khách xem được lý do đó ở trang của mình và bấm **Đặt lại ngày/giờ khác** để đặt lịch mới, thông tin cũ đã điền sẵn.

## 1. Dùng trên giao diện

**Admin**: trang Đặt bàn (cần quyền Sửa đặt bàn)
1. Bấm **Hủy** ở một lịch, ở chế độ **Danh sách** hay **Sơ đồ bàn** đều được.
2. Hộp thoại hiện ra với các lý do có sẵn:
   - Hết bàn vào khung giờ này
   - Nhà hàng có sự kiện / đóng cửa
   - Không liên lạc được với khách
   - **Lý do khác**: hiện ô để tự gõ (tối đa 300 ký tự)
3. Chưa chọn / chưa gõ lý do thì nút **Hủy lịch** bị mờ, không bấm được.
4. Ở danh sách, lịch đã hủy hiện dòng đỏ **"Lý do: …"** ngay dưới trạng thái.

**Khách**: trang **Tài khoản → Đặt bàn** (`/account/reservations`) và trang chi tiết (`/reservations/<mã>`, kể cả khi tra cứu bằng mã + SĐT)
- Lịch bị nhà hàng hủy hiện khung đỏ: *Nhà hàng đã hủy lịch này · Lý do: … · Rất xin lỗi bạn…*
- Nút **Đặt lại ngày/giờ khác** mở trang `/reservation`, điền sẵn **tên, SĐT, email, số khách, khu vực**. Khách chỉ cần chọn ngày giờ mới (và bàn nếu muốn).
- Khách **tự hủy** thì không có lý do nên không hiện khung đỏ.

## 2. Dữ liệu

| Bảng / cột | Ý nghĩa |
|---|---|
| `Reservation.cancelReason` | Lý do nhà hàng hủy (chữ, có thể trống) |

- Có lý do ⇒ **nhà hàng** hủy. Trống ⇒ khách tự hủy, hoặc lịch hủy từ trước khi có tính năng này. Nhờ vậy không cần thêm cột "ai hủy".
- Migration: `backend/prisma/migrations/20261021100003_them_ly_do_huy_dat_ban/`. Chỉ thêm 1 cột cho phép trống, **không mất dữ liệu cũ**.

Máy khác sau khi `git pull` thì chạy:

```bash
npm --prefix backend run db:deploy
```

## 3. API

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| PATCH | `/api/v1/reservations/:id/status` | 🛡️ Sửa đặt bàn | `{ status, reason }`. Khi `status = CANCELLED` thì **bắt buộc** có `reason` (≤ 300 ký tự) |
| GET | `/api/v1/reservations/my`, `/reservations/track/:code` | 🔐 / 🌐 | Trả thêm field `cancelReason` |

Ví dụ:

```http
PATCH /api/v1/reservations/12/status
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "CANCELLED", "reason": "Hết bàn vào khung giờ này" }
```

Thiếu lý do thì nhận `400`:

```json
{ "success": false, "message": "Vui lòng nhập lý do hủy", "errors": [{ "field": "reason", "message": "Vui lòng nhập lý do hủy" }] }
```

App Flutter sau này: đọc `cancelReason`, khác `null` thì hiện khung báo hủy + nút đặt lại giống web.

## 4. Code ở đâu

| Việc | File |
|---|---|
| Cột `cancelReason` | [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) |
| Bắt buộc lý do khi hủy (zod) | [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js): `updateReservationStatusSchema` |
| Lưu lý do | [reservations.controller.js](../backend/src/modules/reservations/reservations.controller.js): `updateStatus` |
| Hộp thoại hủy, danh sách lý do có sẵn | [frontend/src/pages/admin/Reservations.jsx](../frontend/src/pages/admin/Reservations.jsx): `CANCEL_REASONS`, `CancelDialog` |
| Khung báo hủy + nút đặt lại | [frontend/src/components/CancelNotice.jsx](../frontend/src/components/CancelNotice.jsx) |
| Điền sẵn form khi đặt lại | [frontend/src/pages/Reservation.jsx](../frontend/src/pages/Reservation.jsx): `rebook` (đọc từ `location.state`) |

**Muốn thêm / sửa lý do có sẵn**: sửa mảng `CANCEL_REASONS` ở đầu `admin/Reservations.jsx`. Không cần đổi backend vì backend nhận mọi lý do dạng chữ.

## 5. Luồng chạy (để học)

```
Admin bấm Hủy → CancelDialog (chọn lý do)
  → PATCH /reservations/:id/status { status: CANCELLED, reason }
  → zod kiểm tra có reason → controller lưu status + cancelReason
Khách mở trang của mình → GET /reservations/my (có cancelReason)
  → CancelNotice hiện lý do → bấm "Đặt lại"
  → <Link to="/reservation" state={{ rebook }}> → form đọc location.state, điền sẵn
```

`state` của React Router là dữ liệu đi kèm khi chuyển trang mà **không hiện trên URL**, nên SĐT của khách không lộ trên thanh địa chỉ. Tải lại trang `/reservation` thì `state` vẫn còn, mở tab mới thì mất.

## 6. Chưa có

- Gửi **email / SMS** báo khách ngay khi nhà hàng hủy (hiện khách phải tự vào xem).
- Khách tự hủy cũng ghi được lý do (để nhà hàng thống kê).
- Thống kê lý do hủy nhiều nhất trong trang Tổng quan.
