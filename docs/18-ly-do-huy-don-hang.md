# 18. Lý do hủy đơn hàng

Khi nhà hàng **hủy** một đơn hàng, nhân viên phải chọn hoặc ghi **lý do**. Khách xem được lý do ở trang chi tiết đơn và ở danh sách "Đơn hàng của tôi", nên biết vì sao đơn bị hủy mà không cần gọi hỏi.

Cách làm giống hệt [14. Lý do hủy đặt bàn](14-ly-do-huy-dat-ban.md), và dùng chung hộp thoại chọn lý do.

## 1. Dùng trên giao diện

**Nhân viên**: trang **Đơn hàng** (`/admin/orders`, cần quyền Sửa đơn hàng)
1. Bấm **Xem** ở một đơn, rồi bấm nút đỏ **Hủy đơn**.
2. Cửa sổ chi tiết đơn đổi thành hộp thoại chọn lý do (không mở 2 cửa sổ chồng nhau):
   - Món / hải sản trong đơn đã hết
   - Không liên lạc được với khách
   - Địa chỉ ngoài khu vực giao hàng
   - Nhà hàng quá tải / sắp đóng cửa
   - Khách yêu cầu hủy qua điện thoại
   - **Lý do khác**: hiện ô để tự gõ (tối đa 300 ký tự)
3. Chưa chọn / chưa gõ lý do thì nút **Hủy đơn** bị mờ, không bấm được.
4. Hủy xong tự quay lại cửa sổ chi tiết, có dòng đỏ **"Lý do hủy (khách xem được): …"**. Ở danh sách đơn, dưới nhãn "Đã hủy" cũng có dòng **"Lý do: …"**.

**Khách**
- Trang chi tiết đơn `/orders/<mã>` (kể cả khi tra cứu bằng mã + SĐT ở trang **Tra cứu đơn**): thanh tiến trình được thay bằng khung đỏ *Nhà hàng đã hủy đơn này · Lý do: … · Rất xin lỗi bạn…*. Trang tự cập nhật mỗi 15 giây nên khách đang mở trang sẽ thấy ngay.
- Đơn đã trả tiền online (VNPay) bị hủy: khung đỏ có thêm dòng *"Số tiền bạn đã thanh toán online sẽ được nhà hàng hoàn lại."*
- Trang **Tài khoản → Đơn hàng** (`/account/orders`): đơn bị nhà hàng hủy có dòng đỏ *Nhà hàng đã hủy đơn · Lý do: …*.
- Khách **tự hủy** thì không có lý do, vẫn hiện khung "Đơn hàng đã bị hủy" như cũ.
- Đơn bị hủy không còn hiện "Cảm ơn bạn đã đặt món!" dù vừa đặt chưa tới 10 phút.

## 2. Dữ liệu

| Bảng / cột | Ý nghĩa |
|---|---|
| `Order.cancelReason` | Lý do nhà hàng hủy (chữ, có thể trống) |

- Có lý do ⇒ **nhà hàng** hủy. Trống ⇒ khách tự hủy, hoặc đơn hủy từ trước khi có tính năng này. Nhờ vậy không cần thêm cột "ai hủy".
- Migration: `backend/prisma/migrations/20261112131225_them_ly_do_huy_don_hang/`. Chỉ thêm 1 cột cho phép trống, **không mất dữ liệu cũ**.

Máy khác sau khi `git pull` thì chạy:

```bash
npm --prefix backend run db:deploy
```

## 3. API

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| PATCH | `/api/v1/orders/:id/status` | 🛡️ Sửa đơn hàng | `{ status, reason }`. Khi `status = CANCELLED` thì **bắt buộc** có `reason` (≤ 300 ký tự). Trạng thái khác không cần `reason` |
| GET | `/api/v1/orders/my`, `/orders/track/:code`, `/orders`, `/orders/:id` | 🔐 / 🌐 / 🛡️ | Trả thêm field `cancelReason` |
| POST | `/api/v1/orders/:code/cancel` | 🌐 | Khách tự hủy: **không** nhận lý do, `cancelReason` để `null` |

Ví dụ:

```http
PATCH /api/v1/orders/85/status
Authorization: Bearer <token>
Content-Type: application/json

{ "status": "CANCELLED", "reason": "Món / hải sản trong đơn đã hết" }
```

Thiếu lý do thì nhận `400`:

```json
{ "success": false, "message": "Vui lòng nhập lý do hủy", "errors": [{ "field": "reason", "message": "Vui lòng nhập lý do hủy" }] }
```

App Flutter sau này: đọc `cancelReason` của đơn, khác `null` thì hiện khung đỏ "Nhà hàng đã hủy đơn này" + lý do, giống web.

## 4. Code ở đâu

| Việc | File |
|---|---|
| Cột `cancelReason` | [backend/prisma/schema.prisma](../backend/prisma/schema.prisma), model `Order` |
| Bắt buộc lý do khi hủy (zod) | [orders.validation.js](../backend/src/modules/orders/orders.validation.js): `updateStatusSchema` |
| Lưu lý do | [orders.controller.js](../backend/src/modules/orders/orders.controller.js): `updateStatus` → [orders.service.js](../backend/src/modules/orders/orders.service.js): `changeStatus(order, status, cancelReason)` |
| Hộp thoại chọn lý do (dùng chung với đặt bàn) | [frontend/src/components/CancelReasonDialog.jsx](../frontend/src/components/CancelReasonDialog.jsx) |
| Danh sách lý do có sẵn, mở hộp thoại | [frontend/src/pages/admin/Orders.jsx](../frontend/src/pages/admin/Orders.jsx): `CANCEL_REASONS`, `OrderModal` |
| Khung báo hủy cho khách | [frontend/src/pages/OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx): `CancelledNotice` |
| Dòng lý do ở danh sách đơn của khách | [frontend/src/pages/account/MyOrders.jsx](../frontend/src/pages/account/MyOrders.jsx) |

**Muốn thêm / sửa lý do có sẵn**: sửa mảng `CANCEL_REASONS` ở đầu `admin/Orders.jsx`. Không cần đổi backend vì backend nhận mọi lý do dạng chữ.

## 5. Luồng chạy (để học)

```
Nhân viên bấm "Hủy đơn" trong OrderModal → setCancelling(true)
  → OrderModal trả về CancelReasonDialog thay cho cửa sổ chi tiết
  → chọn lý do → PATCH /orders/:id/status { status: CANCELLED, reason }
  → zod kiểm tra có reason → changeStatus: lưu status + cancelReason,
    trả lại số lượng đã bán + lượt dùng mã giảm giá, đơn đã trả tiền thì REFUNDED
  → thành công: setCancelling(false) → cửa sổ chi tiết hiện lại, có dòng lý do
Khách mở / đang mở trang đơn → GET /orders/track/:code (tự gọi lại mỗi 15 giây)
  → order.cancelReason khác null → CancelledNotice hiện lý do
```

**Vì sao tách `CancelReasonDialog` ra file riêng?** Hủy đặt bàn và hủy đơn hàng cần cùng một hộp thoại, chỉ khác tiêu đề và danh sách lý do. Tách thành component nhận `title`, `description`, `reasons`, `onConfirm` thì sửa giao diện 1 chỗ là cả 2 trang cùng đổi, không phải chép code.

**Vì sao không mở hộp thoại chồng lên cửa sổ chi tiết?** `Modal` hiện tại không biết có cửa sổ khác đang mở: bấm `Esc` sẽ đóng cả 2, đóng cửa sổ trên thì trang phía sau cuộn được dù cửa sổ dưới vẫn mở. Thay cửa sổ này bằng cửa sổ kia thì lúc nào cũng chỉ có 1 cái, không phải sửa `Modal`.

## 6. Chưa có

- Gửi **email / SMS / thông báo đẩy** cho khách ngay khi nhà hàng hủy (hiện khách phải mở trang đơn mới thấy). Khi làm app Flutter có thể thêm thông báo đẩy.
- Nút **"Đặt lại các món này"**: bỏ lại các món của đơn bị hủy vào giỏ hàng (giống nút "Đặt lại ngày/giờ khác" của đặt bàn).
- Khách tự hủy cũng ghi được lý do (để nhà hàng thống kê).
- Thống kê lý do hủy nhiều nhất trong trang Tổng quan.
