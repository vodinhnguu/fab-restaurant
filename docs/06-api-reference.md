# 06. Tài liệu API

Base URL: `http://localhost:4000/api/v1`

> **Khi chạy app Flutter:** máy ảo Android không hiểu `localhost` là máy tính của bạn. Hãy dùng `http://10.0.2.2:4000/api/v1`. Máy iOS Simulator dùng được `localhost`. Điện thoại thật thì dùng IP LAN của máy tính, ví dụ `http://192.168.1.10:4000/api/v1`.

## Quy ước chung

**Response thành công**
```json
{ "success": true, "data": { ... } }
{ "success": true, "data": [ ... ], "meta": { "total": 26, "page": 1, "limit": 12, "totalPages": 3 } }
```

**Response lỗi**
```json
{ "success": false, "message": "Số điện thoại không hợp lệ",
  "errors": [{ "field": "phone", "message": "Số điện thoại không hợp lệ" }] }
```

| HTTP code | Ý nghĩa |
|---|---|
| 200 / 201 | Thành công / Tạo mới thành công |
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập hoặc token hết hạn → client nên đăng xuất |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 409 | Trùng dữ liệu hoặc xung đột |
| 429 | Gọi quá nhiều lần (rate limit). Header `Retry-After` cho biết số giây phải chờ. Áp dụng cho `/auth/login`, `/auth/register`, `/auth/change-password` (20 lần / 15 phút) và `/orders/track`, `/reservations/track` (60 lần / 15 phút) |

**Xác thực:** gửi header `Authorization: Bearer <token>`. Token hết hạn sau 7 ngày (`JWT_EXPIRES_IN`).

**Ảnh:** trường `image` có 2 dạng: URL đầy đủ (`https://...`) hoặc đường dẫn tương đối (`/uploads/abc.jpg`). Với dạng tương đối, hãy ghép thêm địa chỉ server: `http://localhost:4000/uploads/abc.jpg`.

**Tiền:** số nguyên, đơn vị VNĐ. **Thời gian:** chuỗi ISO 8601 theo giờ UTC (`2026-10-01T12:00:00.000Z`). Khi hiển thị cần đổi sang giờ Việt Nam.

Ký hiệu cột Quyền: 🌐 công khai · 👤 cần đăng nhập · 🔓 có đăng nhập hay không đều được · 🛡️ ADMIN hoặc nhân viên có quyền tương ứng trong [ma trận phân quyền](12-ma-tran-phan-quyen.md#5-quyền-cần-có-cho-từng-api)

---

## Chung
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/health` | 🌐 | Kiểm tra server còn sống |
| GET | `/info` | 🌐 | Thông tin nhà hàng: tên, địa chỉ, giờ mở cửa, khu vực đặt bàn, phí ship |

## Auth
| Method | Endpoint | Quyền | Body |
|---|---|---|---|
| POST | `/auth/register` | 🌐 | `{ name, email, password, phone? }` → `{ user, token }` |
| POST | `/auth/login` | 🌐 | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | 👤 | Thông tin người đang đăng nhập |
| PATCH | `/auth/me` | 👤 | `{ name?, phone?, address?, avatar? }` |
| POST | `/auth/change-password` | 👤 | `{ currentPassword, newPassword }` |

## Danh mục
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/categories` | 🌐 | Danh sách, kèm `_count.dishes` = số món **đang bán** (`isAvailable`). Web và app ẩn danh mục 0 món (vd nhóm "Ngừng bán (thực đơn cũ)") |
| POST | `/categories` | 🛡️ | `{ name, description?, image?, sortOrder? }` |
| PUT | `/categories/:id` | 🛡️ | Như trên |
| DELETE | `/categories/:id` | 🛡️ | Lỗi 409 nếu danh mục còn món |

## Món ăn
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/dishes` | 🌐 | Query: `search`, `category` (slug), `featured=true` (chỉ món Best seller), `sort` (`newest`/`price_asc`/`price_desc`/`popular`/`rating`), `page`, `limit`, `minPrice`, `maxPrice`, `available=all` (admin) |
| GET | `/dishes/:idOrSlug` | 🌐 | Chi tiết + `reviews` (20 đánh giá mới nhất) + `related` (4 món cùng danh mục) |
| POST | `/dishes` | 🛡️ | `{ name, price, categoryId, salePrice?, unit?, image?, description?, isAvailable?, isFeatured? }`. `unit: "kg"` = bán theo kg, `price` là giá 1 kg ([24](24-thuc-don-ban-theo-kg.md)); `isFeatured` = Best seller |
| PUT | `/dishes/:id` | 🛡️ | Như trên |
| PATCH | `/dishes/:id/toggle` | 🛡️ | Bật/tắt `isAvailable` |
| DELETE | `/dishes/:id` | 🛡️ | Món đã có trong đơn sẽ chỉ bị ẩn, không xóa hẳn |

## Đơn hàng
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/orders` | 🔓 | Tạo đơn (xem ví dụ bên dưới). Có món bán theo kg (`unit = "kg"`) thì báo 400 *"Món "…" bán theo kg, cần chọn và cân tại hồ. Vui lòng đặt bàn để thưởng thức tại quán"* |
| GET | `/orders/my` | 👤 | Đơn của tôi, có phân trang |
| GET | `/orders/track/:code?phone=` | 🔓 | Xem đơn: chủ đơn, admin, hoặc ai biết đúng SĐT đặt hàng |
| POST | `/orders/:code/cancel` | 🔓 | Khách tự hủy (chỉ khi đơn còn `PENDING` và chưa thanh toán online) |
| GET | `/orders` | 🛡️ | Query: `status`, **`type`** (`DELIVERY` / `PICKUP` / `DINE_IN`, lọc theo hình thức), `search`, `from`, `to`, `page`. `meta.statusCounts` = số đơn theo từng trạng thái, đã tính cả `type` và `search` đang lọc (không tính `status`) |
| GET | `/orders/:id` | 🛡️ | Chi tiết, kèm `payments` (lịch sử thanh toán VNPay) |
| PATCH | `/orders/:id/status` | 🛡️ | `{ status, reason? }`, phải đúng thứ tự trong STATUS_FLOW. Hủy (`CANCELLED`) thì **bắt buộc** `reason` ≤ 300 ký tự, lưu vào `cancelReason` cho khách xem (xem [18](18-ly-do-huy-don-hang.md)). Mọi API trả đơn hàng đều có thêm field `cancelReason` |

## Thanh toán VNPay
Chi tiết luồng: [11-thanh-toan-vnpay.md](11-thanh-toan-vnpay.md). Đơn `paymentMethod: "ONLINE"` chỉ tạo được khi `/info` trả `onlinePayment: true`.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/payments/vnpay/:code` | 🔓 | Body `{ phone }` nếu không đăng nhập. Trả `{ paymentUrl }` để chuyển khách sang VNPay (Flutter: mở bằng WebView) |
| GET | `/payments/vnpay/ipn` | VNPay | Máy chủ VNPay gọi, trả `{ RspCode, Message }` |
| GET | `/payments/vnpay/return?vnp_...` | 🔓 | Gửi nguyên query VNPay trả về. Trả `{ paid, message, orderCode, phone, amount, transactionNo, bankCode }` |

**Ví dụ tạo đơn**
```http
POST /api/v1/orders
Content-Type: application/json

{
  "customerName": "Nguyễn Văn An",
  "phone": "0901234567",
  "type": "DELIVERY",
  "address": "45 Bạch Đằng, Hải Châu, Đà Nẵng",
  "paymentMethod": "COD",
  "couponCode": "WELCOME10",
  "note": "Ít cay",
  "items": [{ "dishId": 4, "quantity": 2, "note": "1 phần ít cay, 1 phần không hành" }, { "dishId": 17, "quantity": 1 }]
}
```
Kết quả trả về: đơn hàng đầy đủ gồm `code`, `subtotal`, `discount`, `shippingFee`, `total`, `items[]`.

`items[].note` là ghi chú khẩu vị riêng của món (không bắt buộc, ≤ 200 ký tự), khác với `note` chung của cả đơn. Xem [15](15-ghi-chu-tung-mon.md).

**Enum**
- `type`: `DELIVERY` | `PICKUP` | `DINE_IN` (ăn tại quán, nhân viên ghi món trên app: xem mục "Ăn tại quán" bên dưới). Đơn `DINE_IN` có thêm `tableId`, `table: { id, code, area }`, `staffId`
- `paymentMethod`: `COD` | `ONLINE`
- `status`: `PENDING` → `CONFIRMED` → `PREPARING` → `DELIVERING` → `COMPLETED`, hoặc `CANCELLED`
- `paymentStatus`: `UNPAID` | `PAID` | `REFUNDED`

## Đặt bàn
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/reservations` | 🔓 | `{ name, phone, date (ISO), guests, email?, area?, tableId?, note? }`. Phải đặt trước ít nhất 30 phút và trong giờ mở cửa. Có `tableId` thì bàn phải trống và đủ ghế (xem [13](13-so-do-ban.md)) |
| GET | `/reservations/tables?date=<ISO>` | 🌐 | Sơ đồ bàn theo khu vực + trạng thái `free` / `pending` / `occupied` / `inactive` tại thời điểm đó (300 lần / 15 phút) |
| GET | `/reservations/my` | 👤 | Lịch của tôi |
| GET | `/reservations/track/:code?phone=` | 🔓 | Xem 1 lịch (chủ lịch, admin, hoặc đúng SĐT; SĐT có dấu cách vẫn được) |
| POST | `/reservations/:code/cancel` | 🔓 | `{ phone? }`. Hủy khi đang `PENDING` hoặc `CONFIRMED` **và chưa tới giờ hẹn** |
| GET | `/reservations` | 🛡️ | Query: `status`, `date=YYYY-MM-DD`, `search`, `page`, `limit` (≤ 100). Mỗi lịch kèm `tableChanges[]` (lịch sử chuyển bàn, chỉ nhân viên thấy) |
| PATCH | `/reservations/:id/status` | 🛡️ | `{ status: PENDING|CONFIRMED|CANCELLED|COMPLETED, reason? }`. Hủy (`CANCELLED`) thì **bắt buộc** `reason` ≤ 300 ký tự, lưu vào `cancelReason` cho khách xem (xem [14](14-ly-do-huy-dat-ban.md)) |
| PATCH | `/reservations/:id/table` | 🛡️ | Lễ tân chuyển / xếp bàn: `{ tableId, reason? }`. Lịch phải đang `PENDING` / `CONFIRMED` / `COMPLETED`; bàn mới đang phục vụ, đủ ghế, không trùng giờ. Lưu lịch sử vào `ReservationTableChange` (xem [21](21-le-tan-chuyen-ban.md)) |

## Đánh giá
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/reviews` | 👤 | `{ dishId, rating (1-5), comment? }`. Phải có đơn đã `COMPLETED` chứa món này. Gửi lại sẽ cập nhật đánh giá cũ |
| GET | `/reviews` | 🛡️ | Tất cả đánh giá |
| DELETE | `/reviews/:id` | 🛡️ | Xóa và tính lại điểm trung bình |

## Mã giảm giá
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/coupons/public` | 🌐 | Các mã đang có hiệu lực |
| POST | `/coupons/check` | 🌐 | `{ code, subtotal }` → `{ code, discount, description }` |
| GET / POST / PUT / DELETE | `/coupons`, `/coupons/:id` | 🛡️ | CRUD. `{ code, type: PERCENT|FIXED, value, minOrder?, maxDiscount?, usageLimit?, startsAt?, expiresAt?, isActive? }` |

## Vệ sinh (tạp vụ)
Cần đăng nhập, quyền theo chức năng `CLEANING`. Chi tiết luồng và quyền: [20-ve-sinh.md](20-ve-sinh.md).

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/cleaning/overview` | 🛡️ Xem | Số việc chờ / đang làm / gấp / xong hôm nay, việc của tôi, khu cần dọn, khu lâu chưa dọn |
| GET | `/cleaning/areas?all=` | 🛡️ Xem | Khu vực + `openTasks[]`, `needsCleaning`, `isStale` |
| POST / PUT | `/cleaning/areas`, `/cleaning/areas/:id` | 🛡️ Xóa | `{ name, description?, sortOrder?, isActive? }` |
| POST | `/cleaning/areas/:id/clean` | 🛡️ Sửa | `{ note? }` "Đã dọn xong" cả khu |
| GET | `/cleaning/tasks?status=OPEN\|TODO\|IN_PROGRESS&mine=true&areaId=` | 🛡️ Xem | Việc chưa xong, việc gấp trước |
| POST | `/cleaning/tasks` | 🛡️ Thêm | `{ title, areaId, note?, priority?: NORMAL\|URGENT, assigneeId? }` |
| PUT | `/cleaning/tasks/:id` | 🛡️ Sửa | Sửa / giao việc (chỉ việc chưa xong) |
| PATCH | `/cleaning/tasks/:id/status` | 🛡️ Sửa | `{ status: IN_PROGRESS\|DONE\|CANCELLED, note? }`. Hủy cần quyền Xóa + bắt buộc `note` |
| GET | `/cleaning/history?from=&to=&userId=&areaId=&status=DONE\|CANCELLED&page=` | 🛡️ Xem | Mặc định 7 ngày, `meta.byUser` |
| GET | `/cleaning/staff` | 🛡️ Thêm/Sửa | Nhân viên giao việc được |

## Kỹ thuật: thiết bị & sửa chữa
Cần đăng nhập, quyền theo chức năng `FACILITY` (Thiết bị & bảo trì). Chi tiết: [22-ky-thuat-bao-tri.md](22-ky-thuat-bao-tri.md).

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/maintenance/overview` | 🛡️ Xem | Số phiếu mở / gấp / chờ linh kiện, thiết bị có sự cố, đến hạn bảo trì, chi phí tháng |
| GET | `/maintenance/equipment?all=` | 🛡️ Xem/Thêm | Thiết bị + `openTickets[]`, `hasIssue`, `nextDueAt`, `daysLeft`, `maintenance` |
| POST / PUT | `/maintenance/equipment`, `/maintenance/equipment/:id` | 🛡️ Xóa | `{ name, category, location?, maintenanceDays?, note?, sortOrder?, isActive? }` |
| POST | `/maintenance/equipment/:id/maintain` | 🛡️ Sửa | `{ note?, cost?, closeTickets? }` ghi bảo trì định kỳ (1 lần / ngày); `closeTickets: true` đóng luôn phiếu sửa chữa đang mở, khi đó bắt buộc `note` |
| GET | `/maintenance/tickets?status=ACTIVE\|OPEN\|IN_PROGRESS\|WAITING_PARTS&mine=true&category=` | 🛡️ Xem | Phiếu chưa xong, phiếu gấp trước |
| GET | `/maintenance/tickets/reported` | 🛡️ Thêm/Xem | 10 phiếu gần nhất tôi đã báo |
| POST | `/maintenance/tickets` | 🛡️ Thêm | Báo hỏng `{ equipmentId, title, description?, priority?: NORMAL\|URGENT, assigneeId? }` |
| PUT | `/maintenance/tickets/:id` | 🛡️ Sửa | Sửa / giao phiếu (chỉ phiếu chưa xong) |
| PATCH | `/maintenance/tickets/:id/status` | 🛡️ Sửa | `{ status: IN_PROGRESS\|WAITING_PARTS\|DONE\|CANCELLED, note?, cost? }`. `note` bắt buộc trừ `IN_PROGRESS`; hủy cần quyền Xóa |
| GET | `/maintenance/history?from=&to=&type=&status=&userId=&equipmentId=&page=` | 🛡️ Xem | Mặc định 30 ngày, `meta.totalCost`, `meta.byUser` |
| GET | `/maintenance/staff` | 🛡️ Thêm/Sửa | Nhân viên nhận sửa được |

## Ăn tại quán: phục vụ ghi món (app), bếp + thu ngân (web)
Phục vụ dùng app mobile: chọn khu → chọn bàn → ghi món → gửi bếp → check món / hủy món / gọi thêm → gửi thanh toán. Bếp nhận làm ở web `/admin/kitchen`, thu ngân in bill + thu tiền ở web `/admin/cashier`. Chi tiết luồng, quy tắc: [23-app-nhan-vien-phuc-vu.md](23-app-nhan-vien-phuc-vu.md).

Quyền: phục vụ = chức năng `ORDERS`, bếp = `KITCHEN`, thu ngân = `PAYMENTS`, hồ hải sản (cân món bán theo kg) = `SEAFOOD_TANK`. Các API phục vụ (trừ 2 API GET danh sách) trả về bàn sau khi làm, giống `GET /dine-in/tables/:id`.

**Trạng thái từng món** (`items[].status`): `WEIGHING` chờ cân (chỉ món bán theo kg, xem [24](24-thuc-don-ban-theo-kg.md)) → `PENDING` chờ bếp → `COOKING` bếp đang làm → `SERVED` đã mang ra bàn, hoặc `CANCELLED` đã hủy.

**Món bán theo kg** (`unit = "kg"`): `price` là giá 1 kg. Gửi bếp kèm số kg phục vụ ghi trên app (`items[].weight`, mặc định 1 kg): món ở `WEIGHING` có `weight` = số kg tạm, **cộng tiền tạm**, bếp chưa thấy. Hồ hải sản cân (`POST /dine-in/items/:id/weigh`) thì `weight` thành số kg thật, có `weighedAt`, món sang `PENDING`, tiền đơn đổi theo chênh lệch với tiền tạm. Tiền 1 dòng món: có `weight` (hoặc đang `WEIGHING`) → `price × weight` làm tròn đồng (chưa có số kg = 0); còn lại → `price × quantity`. Mọi API trả món đều có thêm `weight`, `weighedAt`. **Trạng thái đơn** tự suy ra từ món: còn món chờ bếp = `CONFIRMED` "Đã gửi bếp", còn món đang làm = `PREPARING`, lên hết = `DELIVERING` "Đã lên món", hủy hết món = `CANCELLED` (bàn trống).

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/dine-in/tables` | 🛡️ `ORDERS` Xem | Bàn theo khu `[{ name, tables: [{ id, code, seats, x, y, order \| null }] }]`. `order`: `total`, `itemCount` (không tính món hủy), `waitingCount` (phần chưa lên), `weighingCount` (phần bán theo kg còn chờ cân), `billRequestedAt` |
| GET | `/dine-in/tables/:id` | 🛡️ `ORDERS` Xem | `{ table, order \| null }`. `order.items[]` gồm cả món đã hủy: `id, name, price, quantity, note, status, servedAt, cancelReason, createdAt, weight, weighedAt`; `order.billRequestedAt`, `billPrintedAt` |
| GET | `/dine-in/orders` | 🛡️ `ORDERS` Xem | Đơn tại bàn hôm nay (mới nhất trước), kèm `itemCount` |
| POST | `/dine-in/orders` | 🛡️ `ORDERS` Thêm | **Gửi bếp** `{ tableId, items: [{ dishId, quantity, weight?, note? }], note? }`: bàn chưa có đơn → tạo đơn `DINE_IN`, có rồi → thêm món (món mới `PENDING`, món bán theo kg `WEIGHING`, 1 dòng `quantity` = 1, `weight` = số kg phục vụ ghi 0,05 – 30, không gửi thì coi mỗi phần là 1 kg; cộng tiền tạm). Gọi thêm sau khi đã gửi thanh toán thì yêu cầu thanh toán tự rút lại |
| POST | `/dine-in/items/serve` | 🛡️ `ORDERS` Sửa | **Check món** `{ itemIds: [..], served?: true }`: tick món đã mang ra bàn (`served: false` = bỏ tick, món về `COOKING`). Các món phải cùng 1 đơn đang mở; món đã hủy = 400; món chờ cân không đổi (chưa nấu) |
| POST | `/dine-in/items/:id/cancel` | 🛡️ `ORDERS` Sửa | **Hủy món** `{ quantity?, reason? }`. Bỏ trống `quantity` = hủy cả dòng, ít hơn = hủy bớt (tách thành dòng mới). Món `WEIGHING` / `PENDING` hủy luôn; `COOKING` / `SERVED` thiếu `reason` = 400. Món bán theo kg chỉ hủy cả dòng (hủy bớt = 400). Tổng tiền tự trừ |
| POST | `/dine-in/orders/:id/bill-request` | 🛡️ `ORDERS` Sửa | **Gửi thanh toán**: thu ngân nhận thông báo. Bàn không còn món = 400; còn món chờ cân = 400 *"Còn món chưa cân: …. Nhập số kg (cân tại hồ) trước khi gửi thanh toán"* |
| DELETE | `/dine-in/orders/:id/bill-request` | 🛡️ `ORDERS` Sửa | Rút yêu cầu thanh toán (bấm nhầm) |
| GET | `/dine-in/kitchen` | 🛡️ `KITCHEN` Xem | Phiếu bếp: bàn còn món `PENDING` / `COOKING` (món chờ cân chưa hiện), phiếu chờ lâu nhất trước |
| POST | `/dine-in/kitchen/start` | 🛡️ `KITCHEN` Sửa | **Nhận làm** `{ itemIds: [..] }`: `PENDING` → `COOKING`. Trả `{ updated }` |
| GET | `/dine-in/bills` | 🛡️ `PAYMENTS` Xem | Bàn đang mở kèm món, bàn đã gửi thanh toán xếp trước (gửi sớm trước) |
| GET | `/dine-in/bills/:id` | 🛡️ `PAYMENTS` Xem | 1 bill để in (cả đơn đã thu tiền, để in lại) |
| POST | `/dine-in/bills/:id/printed` | 🛡️ `PAYMENTS` Xem | Ghi nhận đã in (`billPrintedAt`) |
| POST | `/dine-in/bills/:id/pay` | 🛡️ `PAYMENTS` Sửa | **Đã thu tiền**: đơn `COMPLETED` + `PAID`, bàn trống lại. Đơn đã đóng = 400; còn món chờ cân = 400 *"Còn món chưa cân: …. Cần nhập số kg (cân tại hồ) trước khi thu tiền"* |
| GET | `/dine-in/weighing` | 🛡️ `SEAFOOD_TANK` Xem | Trang **Cân hải sản** (theo dõi, cân lại): `{ waiting: [món chờ cân, gọi sớm trước], weighed: [món đã cân hôm nay, 30 món mới nhất] }`. Mỗi món: `id, name, price` (giá 1 kg), `quantity, note, status, weight, weighedAt, createdAt` kèm `order.table`, `order.staff` |
| POST | `/dine-in/items/:id/weigh` | 🛡️ `ORDERS` Sửa **hoặc** `SEAFOOD_TANK` Sửa | **Nhập số kg** `{ "weight": 1.25 }` (phục vụ nhập tại hồ trên app S14; hồ hải sản / quản lý nhập lại trên web) (số kg, 0,05 đến 30, làm tròn tới gam). Tiền dòng = giá 1 kg × số kg, cộng vào đơn, món sang `PENDING` (bếp thấy). **Cân lại** được khi bếp chưa "Nhận làm" (tiền đơn đổi theo chênh lệch, yêu cầu thanh toán cũ bị rút); bếp đã nhận làm / món đã hủy = 400; không phải món theo kg = 404. Trả món vừa cân, `message` "Đã cân Tôm hùm nướng phô mai: 1,25 kg" |

### App Quản lý (`/stats`) — docs/28

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| GET | `/stats/manager` | 🛡️ `DASHBOARD` Xem | Số liệu màn Quản lý trong app (S15), gom sẵn 1 lần gọi: `today` / `month` (`revenue`, `orders`, `avgPerOrder`, `dineIn`, `online`; `month.label` = "11/2026", tính từ ngày 1), `cancelled.today` / `cancelled.month` (`orders`, `amount`), `tables` (`total`, `busy`, `free`, `billRequested`, `servingAmount`), `drinks` (nhóm món "Nước uống" hôm nay: `items`, `quantity`, `revenue`), `tank` (tồn hồ, docs/27), `topDishes`. Giờ tính theo UTC+7 |
| GET | `/stats/cancellations?range=today\|7d\|month&page=&limit=` | 🛡️ `DASHBOARD` Xem | Màn Đơn đã hủy (S16): `orders` (đơn `CANCELLED` kèm `cancelReason`, `table`, `staff`, phân trang 20), `items` (50 món hủy lẻ mới nhất, đơn chưa hủy), `summary` |

### Kiểm bia nước (`/drinks`) — docs/29

Quyền: chức năng `DRINKS` "Bia nước & kiểm kho quầy". Xuất ra quầy theo **thùng**, kiểm theo **ngày** (giờ VN).
Lệch = (bán + trả lại) − xuất: **âm = thiếu hàng**, dương = thừa.

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| GET | `/drinks/check?date=yyyy-MM-dd&all=1` | 🛡️ `DRINKS` Xem | Phiếu kiểm 1 ngày (không truyền `date` = hôm nay): `rows` mỗi loại kèm `packSize`, `issuedPacks`, `issuedUnits`, `issued`, `sold` (backend tự tính theo đơn), `returned`, `diff`, `checked`, `note`, `by`; `summary` có `issued`, `sold`, `returned`, `diff`, `checked`, `total`, `mismatched` |
| PUT | `/drinks/check` | 🛡️ Sửa | `{ date?, productId, issuedPacks?, issuedUnits?, returnedUnits?, note? }`. Trả lại > xuất = 400; ngày chưa tới = 400; loại đã tắt = 400. `message`: *"Bia Tiger: xuất 48, bán 10, trả lại 30 lon → THIẾU 8"* |
| GET | `/drinks/history?days=14` | 🛡️ Xem | Các ngày đã kiểm + tổng lệch mỗi ngày |
| GET | `/drinks/products?all=1` | 🛡️ Xem | Danh sách loại + quy cách thùng |
| POST | `/drinks/products` | 🛡️ Thêm | `{ dishId, packSize? }`. Món ngoài nhóm "Nước uống" = 400, đã có = 400 |
| PATCH | `/drinks/products/:id` | 🛡️ Xóa | `{ packSize?, isActive? }`: sửa quy cách thùng, tắt / bật loại |

### Tồn hồ hải sản (`/tank`) — docs/27

Quyền: chức năng `SEAFOOD_TANK` "Hồ hải sản & nhập hàng". Mọi tồn tính theo **kg**, làm tròn tới gam.

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| GET | `/tank?all=1` | 🛡️ `SEAFOOD_TANK` Xem | Danh sách loại hải sản: `stockKg`, `lowStockKg`, `isLow`, `isEmpty`, `dishCount`, `today: { imported, sold, returned, lost, audited }`. `all=1` kèm loại đã tắt |
| GET | `/tank/entries?tankItemId=&type=&date=&page=&limit=` | 🛡️ Xem | Sổ nhập - xuất (mới nhất trước). `type`: `IMPORT` / `SALE` / `RETURN` / `AUDIT` / `LOSS`; `date` dạng `yyyy-MM-dd` (giờ VN). Mỗi dòng kèm `tankItem`, `user`, `order.table`, `stockAfter`; có `meta` phân trang |
| POST | `/tank/:id/import` | 🛡️ Sửa | **Nhập hàng** `{ kg, unitCost?, supplier?, note? }`. `kg` 0,01 – 500, ngoài khoảng = 400 |
| POST | `/tank/:id/audit` | 🛡️ Sửa | **Kiểm hồ** `{ actualKg, note? }` (0 – 500). Trả `{ skipped, stockKg, diff }`; khớp số thì `skipped: true`, không tạo phiếu |
| POST | `/tank/:id/loss` | 🛡️ Sửa | **Hao hụt** `{ kg, note }`. Thiếu `note` = 400 (bắt buộc lý do) |
| POST | `/tank` | 🛡️ Thêm | Thêm loại `{ name, lowStockKg?, note? }`. Trùng tên = 400 |
| PATCH | `/tank/:id` | 🛡️ Sửa | Sửa `{ name?, lowStockKg?, note? }`. Không đổi tồn ở đây |
| PATCH | `/tank/:id/active` | 🛡️ Xóa | `{ isActive }`: tắt loại hồ không nuôi nữa (giữ lịch sử) hoặc bật lại |

Ghi sổ **tự động** (không có endpoint riêng): `POST /dine-in/items/:id/weigh` trừ hồ đúng số kg đã cân (cân lại chỉ ghi chênh lệch); `POST /dine-in/items/:id/cancel` và `PATCH /orders/:id/status` → `CANCELLED` trả lại hồ món đã cân mà bếp chưa "Nhận làm".

`PATCH /orders/:id/status` vẫn dùng được với đơn tại bàn (trang Đơn hàng trên web, hủy cả đơn trên app): `PREPARING` → món chờ bếp thành đang làm, `DELIVERING` → tick hết món, `CANCELLED` + `reason` → hủy mọi món còn lại.

## Người dùng, thống kê, upload (Admin / nhân viên có quyền)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/users?search=&role=&staffRoleId=&page=` | Danh sách người dùng. `role`: `CUSTOMER` / `STAFF` / `ADMIN` |
| POST | `/users` | Tạo tài khoản nhân viên: `{ name, email, phone?, password, role?: STAFF|ADMIN, staffRoleId }`. Chỉ ADMIN hoặc Chủ nhà hàng tạo được tài khoản ADMIN |
| POST | `/users/:id/reset-password` | `{ password }` đặt lại mật khẩu (không dùng cho chính mình) |
| PATCH | `/users/:id` | `{ role?, staffRoleId?, isActive? }`. `role: STAFF` bắt buộc có vai trò. Không tự sửa chính mình; nhân viên không sửa được tài khoản ADMIN |
| GET | `/stats/overview?days=30` | Doanh thu, số đơn, `revenueByDay[]`, **`revenueByType[]`** (doanh thu + số đơn theo kênh: `DELIVERY`, `PICKUP`, `DINE_IN`; cộng lại bằng `totalRevenue`), `topDishes[]`, `ordersByStatus[]`, `recentOrders[]` |
| POST | `/upload` | `multipart/form-data`, field `image` (tối đa 5MB) → `{ url: "/uploads/xxx.jpg" }` |

---

## Gợi ý cho app Flutter

Thư viện nên dùng: `dio` (gọi HTTP), `flutter_secure_storage` (lưu token), `riverpod` hoặc `provider` (quản lý state), `go_router` (điều hướng).

```dart
final dio = Dio(BaseOptions(baseUrl: 'http://10.0.2.2:4000/api/v1'));

dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) async {
    final token = await storage.read(key: 'token');
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  },
  onError: (e, handler) {
    // Lấy thông báo tiếng Việt từ backend
    final msg = e.response?.data?['message'] ?? 'Không thể kết nối máy chủ';
    handler.next(e.copyWith(message: msg));
  },
));

// Đăng nhập
final res = await dio.post('/auth/login', data: {'email': email, 'password': password});
await storage.write(key: 'token', value: res.data['data']['token']);

// Lấy menu
final menu = await dio.get('/dishes', queryParameters: {'category': 'tom', 'page': 1});
final List dishes = menu.data['data'];
```
