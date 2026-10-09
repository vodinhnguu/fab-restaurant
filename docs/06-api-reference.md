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

Ký hiệu cột Quyền: 🌐 công khai · 👤 cần đăng nhập · 🔓 có đăng nhập hay không đều được · 🛡️ chỉ ADMIN

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
| GET | `/categories` | 🌐 | Danh sách, kèm `_count.dishes` |
| POST | `/categories` | 🛡️ | `{ name, description?, image?, sortOrder? }` |
| PUT | `/categories/:id` | 🛡️ | Như trên |
| DELETE | `/categories/:id` | 🛡️ | Lỗi 409 nếu danh mục còn món |

## Món ăn
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/dishes` | 🌐 | Query: `search`, `category` (slug), `featured=true`, `sort` (`newest`/`price_asc`/`price_desc`/`popular`/`rating`), `page`, `limit`, `minPrice`, `maxPrice`, `available=all` (admin) |
| GET | `/dishes/:idOrSlug` | 🌐 | Chi tiết + `reviews` (20 đánh giá mới nhất) + `related` (4 món cùng danh mục) |
| POST | `/dishes` | 🛡️ | `{ name, price, categoryId, salePrice?, unit?, image?, description?, isAvailable?, isFeatured? }` |
| PUT | `/dishes/:id` | 🛡️ | Như trên |
| PATCH | `/dishes/:id/toggle` | 🛡️ | Bật/tắt `isAvailable` |
| DELETE | `/dishes/:id` | 🛡️ | Món đã có trong đơn sẽ chỉ bị ẩn, không xóa hẳn |

## Đơn hàng
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/orders` | 🔓 | Tạo đơn (xem ví dụ bên dưới) |
| GET | `/orders/my` | 👤 | Đơn của tôi, có phân trang |
| GET | `/orders/track/:code?phone=` | 🔓 | Xem đơn: chủ đơn, admin, hoặc ai biết đúng SĐT đặt hàng |
| POST | `/orders/:code/cancel` | 🔓 | Khách tự hủy (chỉ khi đơn còn `PENDING` và chưa thanh toán online) |
| GET | `/orders` | 🛡️ | Query: `status`, `search`, `from`, `to`, `page`. `meta.statusCounts` = số đơn theo từng trạng thái |
| GET | `/orders/:id` | 🛡️ | Chi tiết, kèm `payments` (lịch sử thanh toán VNPay) |
| PATCH | `/orders/:id/status` | 🛡️ | `{ status }`, phải đúng thứ tự trong STATUS_FLOW |

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
  "items": [{ "dishId": 4, "quantity": 2 }, { "dishId": 17, "quantity": 1 }]
}
```
Kết quả trả về: đơn hàng đầy đủ gồm `code`, `subtotal`, `discount`, `shippingFee`, `total`, `items[]`.

**Enum**
- `type`: `DELIVERY` | `PICKUP`
- `paymentMethod`: `COD` | `ONLINE`
- `status`: `PENDING` → `CONFIRMED` → `PREPARING` → `DELIVERING` → `COMPLETED`, hoặc `CANCELLED`
- `paymentStatus`: `UNPAID` | `PAID` | `REFUNDED`

## Đặt bàn
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/reservations` | 🔓 | `{ name, phone, date (ISO), guests, email?, area?, note? }`. Phải đặt trước ít nhất 30 phút và trong giờ mở cửa |
| GET | `/reservations/my` | 👤 | Lịch của tôi |
| GET | `/reservations/track/:code?phone=` | 🔓 | Xem 1 lịch (chủ lịch, admin, hoặc đúng SĐT; SĐT có dấu cách vẫn được) |
| POST | `/reservations/:code/cancel` | 🔓 | `{ phone? }`. Hủy khi đang `PENDING` hoặc `CONFIRMED` **và chưa tới giờ hẹn** |
| GET | `/reservations` | 🛡️ | Query: `status`, `date=YYYY-MM-DD`, `search`, `page` |
| PATCH | `/reservations/:id/status` | 🛡️ | `{ status: PENDING|CONFIRMED|CANCELLED|COMPLETED }` |

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

## Người dùng, thống kê, upload (Admin)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/users?search=&role=&page=` | Danh sách người dùng |
| PATCH | `/users/:id` | `{ role?, isActive? }` (không thể tự sửa chính mình) |
| GET | `/stats/overview?days=30` | Doanh thu, số đơn, `revenueByDay[]`, `topDishes[]`, `ordersByStatus[]`, `recentOrders[]` |
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
