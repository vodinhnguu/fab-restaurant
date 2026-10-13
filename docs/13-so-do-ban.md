# 13. Sơ đồ bàn

Khách chọn **khu vực** khi đặt bàn thì thấy sơ đồ bàn của khu đó, màu sắc cho biết bàn nào **trống**, bàn nào **đã có khách** đúng vào ngày giờ đã chọn. Admin xem toàn bộ sơ đồ và thông tin khách ở từng bàn.

## 1. Màu sắc

| Màu | Ý nghĩa | Khách bấm được? |
|---|---|---|
| 🟢 Xanh lá | Bàn trống | Có |
| 🔵 Xanh đậm | Bàn khách đang chọn | Bấm lại để bỏ chọn |
| 🟡 Vàng | Đã có người đặt, chờ nhà hàng xác nhận | Không |
| 🔴 Đỏ | Đã có khách (lịch đã xác nhận hoặc khách đã đến) | Không |
| ⚪ Xám, viền đứt | Không đủ ghế cho số khách đã nhập | Không |
| ⚪ Xám, gạch ngang | Bàn tạm ngưng (`isActive = false`) | Không |

Bàn tròn là bàn nhỏ (≤ 6 ghế), bàn vuông là bàn lớn (≥ 8 ghế). Khu ngoài trời có dải "Biển" phía trên; khu trong nhà có "Cửa ra vào" phía dưới.

## 2. Bàn bận được tính thế nào

Mỗi lượt đặt **giữ bàn 120 phút** (`diningMinutes` trong [backend/src/config/restaurant.js](../backend/src/config/restaurant.js)).

Một bàn bận lúc `T` nếu có lịch đặt bàn đó, bắt đầu trong khoảng **(T − 2 tiếng, T + 2 tiếng)**, ở trạng thái `PENDING`, `CONFIRMED` hoặc `COMPLETED`. Lịch đã hủy thì bàn tự trống lại.

Ví dụ: bàn T03 có khách đặt lúc 19:00.
- Đặt T03 lúc 17:30 hoặc 20:30 → bị từ chối (trùng giờ ăn).
- Đặt T03 lúc 21:00 → được.

## 3. Dùng trên giao diện

**Khách**: trang `/reservation`
1. Chọn ngày, giờ, số khách.
2. Chọn **Khu vực mong muốn** thì sơ đồ hiện ra ngay bên dưới.
3. Bấm một bàn xanh lá để chọn. Không chọn cũng được, nhà hàng sẽ xếp bàn.
4. Đổi giờ, số khách hay khu vực mà bàn đã chọn không còn hợp lệ thì tự bỏ chọn.
5. Sơ đồ tự cập nhật mỗi 30 giây. Nếu người khác vừa đặt mất bàn, khách nhận thông báo và sơ đồ tải lại.

**Admin**: trang Đặt bàn → nút **Sơ đồ bàn**
- Chọn ngày, giờ (nút **Bây giờ** để về giờ hiện tại); xem cả 3 khu cùng lúc kèm tổng số bàn trống / chờ / có khách.
- Bấm vào bàn để xem tên, SĐT, giờ, số khách; bấm **Xác nhận**, **Khách đã đến** hoặc **Hủy** ngay tại đó (cần quyền Sửa đặt bàn).
- Ở chế độ **Danh sách**, cột "Khu vực / Bàn" hiện số bàn khách đã chọn.

## 4. Dữ liệu

| Bảng / cột | Ý nghĩa |
|---|---|
| `DiningTable` | `code` (T01, B03, VIP1), `area`, `seats`, `x` (cột), `y` (hàng), `isActive` |
| `Reservation.tableId` | Bàn khách chọn, có thể trống |

Bàn mặc định (12 trong nhà, 8 ngoài trời, 3 phòng VIP) khai báo trong [backend/src/config/tables.js](../backend/src/config/tables.js). DB chưa có bàn thì lần đầu mở sơ đồ backend tự tạo; `npm run db:seed` cũng tạo lại.

Muốn đổi bố cục: sửa bảng `DiningTable` (vd bằng `npm run db:studio`), đổi `x`, `y`, `seats` hoặc tắt `isActive`. Tên khu vực `area` phải khớp `reservationAreas` trong `config/restaurant.js`.

## 5. API

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| GET | `/api/v1/reservations/tables?date=<ISO>` | 🌐 | `{ diningMinutes, areas: [{ name, cols, rows, tables: [{ id, code, seats, x, y, status }] }] }`. `status`: `free` / `pending` / `occupied` / `inactive`. Nhân viên có quyền xem đặt bàn nhận thêm `reservation` (tên, SĐT, giờ...) |
| POST | `/api/v1/reservations` | 🔓 | Thêm `tableId` (không bắt buộc). Bàn phải đang phục vụ, đủ ghế, không trùng giờ; `area` tự lấy theo bàn |

Lỗi khi đặt:
- `400` bàn tạm ngưng hoặc không đủ ghế.
- `409` bàn đã có người đặt khung giờ đó, hoặc 2 người bấm đặt cùng lúc. Lệnh tạo chạy trong transaction `Serializable` nên chỉ 1 người giữ được bàn.

## 6. Chưa có

- Trang admin để **thêm / sửa / xóa bàn** và kéo thả bố cục (hiện sửa qua `db:studio`).
- Admin **xếp bàn** cho lịch khách không chọn bàn.
- Đánh dấu bàn có khách vãng lai (khách đến ăn không đặt trước).
