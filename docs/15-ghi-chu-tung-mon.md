# 15. Ghi chú khẩu vị cho từng món

Mỗi món trong đơn có **ô ghi chú riêng**. Bấm vào Tôm thì ghi chú cho Tôm, bấm vào Cua thì ghi chú cho Cua. Nhiều người khác khẩu vị cùng gọi một món thì ghi chung trong ô đó, ví dụ: *"2 phần ít cay, 1 phần không hành"*.

Ghi chú chung cho cả đơn (ô "Ghi chú" ở trang Thanh toán) vẫn giữ như cũ.

## 1. Dùng trên giao diện

**Khách**
- **Giỏ hàng** (khung trượt bên phải): bấm vào **ảnh món** hoặc dòng **"Thêm ghi chú khẩu vị"**.
- **Trang Thanh toán**: bấm vào **món** trong khung "Đơn hàng" bên phải.
- Ô ghi chú mở ra kèm **gợi ý bấm nhanh theo loại món**. Bấm gợi ý thì nối thêm vào ghi chú; khách vẫn tự gõ được (tối đa 200 ký tự). Bấm **Xong** để đóng.
- Ghi chú lưu trong giỏ hàng (trình duyệt), tải lại trang vẫn còn.
- Sau khi đặt: trang **chi tiết đơn** hiện "Ghi chú: …" dưới tên món.

**Nhân viên** (trang admin **Đơn hàng** → mở một đơn): ghi chú hiện chữ cam dưới tên món, để bếp làm đúng khẩu vị.

## 2. Gợi ý theo loại món

| Danh mục | Gợi ý |
|---|---|
| Tôm, Mâm hải sản | Ít cay · Không hành · Hấp · Nướng · Bóc vỏ sẵn |
| Cá | Ít xương · Chiên giòn · Hấp xì dầu · Không hành |
| Đồ uống | Ít đá · Không đá · Ít đường |
| Món khác | Ít cay · Không hành · Không rau thơm |

**Muốn sửa / thêm gợi ý**: sửa `SUGGESTIONS` ở đầu [frontend/src/components/ItemNote.jsx](../frontend/src/components/ItemNote.jsx). Khóa là **tên danh mục đúng như trong DB** (vd `'Món Nhật'`). Danh mục không có trong bảng thì dùng `DEFAULT`.

Giỏ hàng lưu tên danh mục lúc khách bấm "Thêm vào giỏ". Món đã nằm trong giỏ từ trước khi có tính năng này thì chỉ thấy gợi ý chung; xóa đi thêm lại là đúng.

## 3. Dữ liệu

| Bảng / cột | Ý nghĩa |
|---|---|
| `OrderItem.note` | Ghi chú khẩu vị của món (≤ 200 ký tự, có thể trống) |
| `Order.note` | Ghi chú chung cả đơn (giữ như cũ) |

Migration: `backend/prisma/migrations/20261022093956_them_ghi_chu_tung_mon/`. Chỉ thêm 1 cột cho phép trống, **không mất dữ liệu cũ**. Máy khác sau khi `git pull`:

```bash
npm --prefix backend run db:deploy
```

Giỏ hàng (`fab-cart` trong Local Storage) mỗi dòng có thêm `category` và `note`:

```js
{ dishId, name, slug, image, unit, category, price, quantity, note }
```

## 4. API

`POST /api/v1/orders`: mỗi phần tử trong `items` nhận thêm `note` (không bắt buộc, ≤ 200 ký tự).

```json
"items": [
  { "dishId": 4, "quantity": 3, "note": "2 phần ít cay, 1 phần không hành" },
  { "dishId": 17, "quantity": 1 }
]
```

- Các API trả đơn hàng (`/orders/my`, `/orders/track/:code`, admin `/orders/:id`...) có thêm `items[].note`.
- Gửi 2 dòng **cùng `dishId`** thì backend gộp thành 1 dòng: cộng số lượng, nối ghi chú bằng `"; "`.
- Ghi chú quá 200 ký tự → `400` "Ghi chú món tối đa 200 ký tự".

App Flutter sau này: gửi `note` trong từng món, hiện `items[].note` dưới tên món giống web.

## 5. Code ở đâu

| Việc | File |
|---|---|
| Cột `note` của món | [backend/prisma/schema.prisma](../backend/prisma/schema.prisma): `model OrderItem` |
| Kiểm tra ≤ 200 ký tự | [orders.validation.js](../backend/src/modules/orders/orders.validation.js): `createOrderSchema.items` |
| Lưu ghi chú, gộp dòng trùng món | [orders.service.js](../backend/src/modules/orders/orders.service.js): `createOrder` (`noteByDish`) |
| Lưu ghi chú trong giỏ | [frontend/src/stores/cart.js](../frontend/src/stores/cart.js): `setNote` |
| Ô ghi chú + gợi ý | [frontend/src/components/ItemNote.jsx](../frontend/src/components/ItemNote.jsx): `ItemNote`, `ItemNoteToggle` |
| Giỏ hàng | [CartDrawer.jsx](../frontend/src/components/layout/CartDrawer.jsx) |
| Trang Thanh toán, gửi `note` lên API | [Checkout.jsx](../frontend/src/pages/Checkout.jsx) |
| Khách xem ghi chú | [OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx) |
| Admin / bếp xem ghi chú | [admin/Orders.jsx](../frontend/src/pages/admin/Orders.jsx) |

## 6. Luồng chạy (để học)

```
Khách bấm vào món → ItemNote mở ra → gõ / bấm gợi ý
  → cart.setNote(dishId, note) → lưu Local Storage (zustand persist)
Bấm Đặt hàng → Checkout gửi items: [{ dishId, quantity, note }]
  → zod kiểm tra → service lấy giá từ DB, lưu OrderItem kèm note
Bếp mở đơn trong admin → thấy "Ghi chú: …" dưới tên món
```

`ItemNote` và `ItemNoteToggle` tách riêng để trang cha giữ trạng thái "món nào đang mở ghi chú" (`noteFor`). Nhờ vậy bấm vào ảnh / dòng món hay bấm dòng "Thêm ghi chú" đều mở cùng một ô, và chỉ một ô mở tại một lúc.

## 7. Chưa có

- Tách 1 món thành **nhiều dòng khác khẩu vị** (vd Tôm × 2 ít cay, Tôm × 1 không cay), mỗi dòng có số lượng riêng.
- Ghi chú ở trang **chi tiết món** ngay lúc bấm "Thêm vào giỏ".
- Màn hình riêng cho **bếp** (chỉ hiện món + ghi chú, to rõ, theo thứ tự đơn).
