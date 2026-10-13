# 12. Ma trận phân quyền

Mỗi bộ phận trong nhà hàng (Thu ngân, Bếp, Lễ tân...) được **Xem / Thêm / Sửa / Xóa** những chức năng nào. Quyền có hiệu lực thật: backend chặn API, giao diện ẩn menu và nút.

## 1. Ba loại tài khoản

| `User.role` | Ai | Vào trang quản trị |
|---|---|---|
| `CUSTOMER` | Khách hàng | Không |
| `STAFF` | Nhân viên, gắn với **1 vai trò** (`staffRoleId`) | Có, chỉ thấy mục vai trò đó được Xem |
| `ADMIN` | Quản trị viên | Có, toàn quyền, là người duy nhất được sửa ma trận |

Tài khoản demo (mật khẩu `123456`): `quanly@fab.vn` (Quản lý), `thungan@fab.vn` (Thu ngân), `letan@fab.vn` (Lễ tân), `bep@fab.vn` (Bếp).

## 2. Dùng trên giao diện

**Admin → Phân quyền** (`/admin/permissions`)

- **Theo vai trò**: cột trái là 12 vai trò, kèm số chức năng và số nhân viên. Bấm một vai trò để xem bộ phận đó làm gì và có quyền gì.
- **Toàn bộ ma trận**: dòng là vai trò, cột là chức năng. `X` = Xem, `T` = Thêm, `S` = Sửa, `Xó` = Xóa.
- **Sửa**: bấm tên cột để chọn / bỏ cả cột, ô "Tất cả" để chọn cả dòng. Tích Thêm / Sửa / Xóa thì Xem tự bật.
- **Thêm vai trò** / **Xóa**: chỉ xóa được vai trò tự tạo và không còn nhân viên nào giữ.
- **Chủ nhà hàng** luôn toàn quyền (biểu tượng khóa), chỉ đổi được tên và mô tả.
- Nhân viên có quyền Xem "Nhân sự & phân quyền" chỉ được xem trang này, không sửa được.

**Admin → Người dùng** (`/admin/users`): quản lý nhân viên ngay trong trang admin, nhân viên **không cần tự đăng ký**.

- **Thêm nhân viên**: nhập họ tên, email, SĐT, chọn vai trò. Mật khẩu ban đầu được tạo ngẫu nhiên (sửa được). Tạo xong hiện khung thông tin đăng nhập để bấm **Sao chép** gửi cho nhân viên; mật khẩu chỉ hiện một lần.
- **Đặt lại mật khẩu** (biểu tượng chìa khóa): khi nhân viên quên mật khẩu. Mật khẩu cũ hết hiệu lực ngay.
- **Đổi vai trò**: chọn ở ô Vai trò trên từng dòng. Có thể chuyển một khách hàng thành nhân viên.
- **Khóa / Mở khóa**: khi nhân viên nghỉ việc hoặc tạm nghỉ.
- Lọc theo "Nhân viên" để lọc tiếp theo bộ phận.

Vì sao mỗi người một tài khoản thay vì dùng chung 1 tài khoản admin: biết ai làm gì, nghỉ việc chỉ cần khóa 1 tài khoản, và mỗi người chỉ có đúng quyền của mình.

## 3. Cách hoạt động

```
Đăng nhập ─► backend trả user + permissions { ORDERS: { view, create, edit, delete }, ... }
                │
                ├─► Frontend (lib/permissions.js): ẩn menu, chặn route, ẩn nút   ← chỉ cho gọn mắt
                │
Gọi API ───────► requirePermission('ORDERS', 'edit') đọc quyền từ DB          ← lớp bảo vệ thật
```

- [backend/src/config/permissions.js](../backend/src/config/permissions.js): 11 chức năng (`MODULES`) và quyền mặc định của 12 vai trò.
- [backend/src/modules/permissions/permissions.service.js](../backend/src/modules/permissions/permissions.service.js): `userPermissions(user)` và `can(user, module, action)`.
- [backend/src/middlewares/auth.js](../backend/src/middlewares/auth.js): `requirePermission(...)`. Mỗi request đọc quyền mới nhất từ DB, nên admin đổi quyền thì nhân viên bị ảnh hưởng ngay ở lần gọi API tiếp theo.
- [frontend/src/lib/permissions.js](../frontend/src/lib/permissions.js): `useCan()`, `canAccessAdmin()`. Menu khai báo `module` trong [frontend/src/lib/adminMenu.js](../frontend/src/lib/adminMenu.js).

Ví dụ ẩn nút trong một trang:

```jsx
const can = useCan();
{can('MENU', 'delete') && <Button>Xóa</Button>}
```

## 4. Dữ liệu

| Bảng | Ý nghĩa |
|---|---|
| `StaffRole` | Vai trò: `key` (vd `CASHIER`), `name`, `description`, `isSystem` (mặc định, không xóa được) |
| `RolePermission` | 1 dòng = 1 vai trò × 1 chức năng: `canView`, `canCreate`, `canEdit`, `canDelete` |
| `User.staffRoleId` | Vai trò của nhân viên (chỉ dùng khi `role = STAFF`) |

DB mới chưa có vai trò thì lần đầu mở trang Phân quyền, backend tự tạo 12 vai trò mặc định. `npm run db:seed` cũng tạo lại từ đầu, kèm 4 nhân viên demo.

## 5. Quyền cần có cho từng API

| API | Quyền |
|---|---|
| `GET /stats/overview` | Tổng quan · Xem |
| `GET /orders`, `GET /orders/:id` | Đơn hàng · Xem |
| `PATCH /orders/:id/status` | Đơn hàng · Sửa |
| `GET /reservations` | Đặt bàn · Xem |
| `PATCH /reservations/:id/status` | Đặt bàn · Sửa |
| `POST / PUT / PATCH toggle / DELETE` món và danh mục | Thực đơn · Thêm / Sửa / Sửa / Xóa |
| `POST /upload` | Thực đơn · Thêm **hoặc** Sửa |
| `GET / POST / PUT / DELETE /coupons` | Khuyến mãi · Xem / Thêm / Sửa / Xóa |
| `GET /reviews`, `DELETE /reviews/:id` | Đánh giá · Xem / Xóa |
| `GET /users` | Nhân sự · Xem |
| `POST /users` (thêm nhân viên) | Nhân sự · Thêm |
| `PATCH /users/:id`, `POST /users/:id/reset-password` | Nhân sự · Sửa |
| `GET /permissions` | Nhân sự · Xem |
| `POST / PUT / DELETE /permissions/roles` | Chỉ ADMIN |

API tra cứu / hủy bằng mã (`/orders/track/:code`, `/orders/:code/cancel`, và tương tự với đặt bàn) cũng xét quyền khi nhân viên dùng: có Xem thì tra cứu được đơn của người khác, phải có Sửa mới hủy được.

### Chống tự nâng quyền

- Chỉ ADMIN sửa được ma trận (nếu không, nhân viên có quyền Nhân sự có thể tự cấp thêm quyền cho vai trò của mình).
- Nhân viên có quyền Thêm / Sửa nhân sự **không** được: tạo hoặc sửa tài khoản ADMIN, đặt lại mật khẩu của ADMIN, gán hoặc sửa người giữ vai trò Chủ nhà hàng.
- Không ai tự sửa / khóa / đặt lại mật khẩu chính mình ở trang Người dùng (đổi mật khẩu của mình ở trang Tài khoản).

## 6. API ma trận

| Method | Đường dẫn | Việc |
|---|---|---|
| GET | `/api/v1/permissions` | `{ modules, actions, roles }`, mỗi role có `permissions` và `userCount` |
| GET | `/api/v1/permissions/roles/:id` | Chi tiết 1 vai trò |
| POST | `/api/v1/permissions/roles` | Thêm vai trò |
| PUT | `/api/v1/permissions/roles/:id` | Sửa tên, mô tả, quyền |
| DELETE | `/api/v1/permissions/roles/:id` | Xóa (chỉ vai trò tự tạo, không còn nhân viên) |

```json
{
  "name": "Bảo vệ",
  "description": "Giữ xe, hướng dẫn khách",
  "permissions": { "RESERVATIONS": { "view": true }, "FACILITY": { "view": true, "create": true } }
}
```

Chức năng không gửi lên = không có quyền.

## 7. Giới hạn hiện tại

4 chức năng trong ma trận **chưa có trang riêng**: Phiếu bếp, Hồ hải sản & nhập hàng, Thu ngân & thanh toán, Thiết bị & vệ sinh. Quyền của chúng đã lưu sẵn; khi làm các trang này, chỉ cần dùng `requirePermission('KITCHEN', ...)` ở backend và thêm 1 dòng vào `ADMIN_MENU` ở frontend.

Muốn thêm chức năng mới: thêm vào `MODULES` trong `config/permissions.js`. Các vai trò cũ sẽ chưa có quyền gì với chức năng đó cho tới khi admin tích chọn.
