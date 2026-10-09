# 08. Bản đồ mã nguồn: file nào làm gì

Tài liệu này đi qua **từng file** trong dự án: file đó làm gì, bên trong có gì đáng chú ý, và nó nói chuyện với file nào.
Dùng như một cuốn "danh bạ": khi gặp một file lạ, tra ở đây trước.

> Muốn biết **sửa một chức năng cụ thể thì mở file nào**, xem [09-muon-sua-gi-thi-sua-o-dau.md](09-muon-sua-gi-thi-sua-o-dau.md).
> Đường dẫn trong tài liệu bấm được (trong VS Code: giữ `Cmd` / `Ctrl` rồi bấm).

---

## Mục lục

1. [Thư mục gốc](#1-thư-mục-gốc)
2. [Backend: khởi động & cấu hình](#2-backend-khởi-động--cấu-hình)
3. [Backend: middlewares & utils](#3-backend-middlewares--utils)
4. [Backend: các module chức năng](#4-backend-các-module-chức-năng)
5. [Backend: database (Prisma)](#5-backend-database-prisma)
6. [Frontend: khởi động & cấu hình](#6-frontend-khởi-động--cấu-hình)
7. [Frontend: lib, services, stores](#7-frontend-lib-services-stores)
8. [Frontend: components](#8-frontend-components)
9. [Frontend: các trang khách hàng](#9-frontend-các-trang-khách-hàng)
10. [Frontend: các trang admin](#10-frontend-các-trang-admin)
11. [Bảng tra nhanh: URL trên trình duyệt → file trang → API → file backend](#11-bảng-tra-nhanh)

---

## 1. Thư mục gốc

```
fab-restaurant/
├── package.json        ← lệnh chạy chung cho cả dự án
├── README.md           ← giới thiệu + chạy nhanh
├── .gitignore          ← file/thư mục KHÔNG đưa lên git (node_modules, .env, uploads...)
├── backend/            ← API (Node.js + Express + Prisma)
├── frontend/           ← website (React + Vite + Tailwind)
└── docs/               ← tài liệu học tập (bạn đang đọc)
```

| File | Chức năng |
|---|---|
| [package.json](../package.json) | Chỉ chứa **lệnh tiện ích**, không có code. `npm run install:all` cài thư viện cho cả 3 nơi. `npm run setup` tạo bảng + dữ liệu mẫu. `npm run dev` chạy **đồng thời** backend và frontend nhờ thư viện `concurrently` (log backend màu xanh, tên `api`; frontend màu tím, tên `web`). |
| [.gitignore](../.gitignore) | Liệt kê những thứ không commit: `node_modules/`, `.env` (chứa mật khẩu DB), ảnh trong `backend/uploads/`... |
| [docs/api.http](api.http) | Các request mẫu để gọi thử API ngay trong VS Code (cần extension **REST Client**, bấm chữ `Send Request` phía trên mỗi request). |

---

## 2. Backend: khởi động & cấu hình

Thứ tự chạy khi gõ `npm run dev` trong `backend/`:
`server.js` → import `app.js` → import `routes.js` → import từng `modules/*/*.routes.js`.

| File | Chức năng | Chi tiết đáng chú ý |
|---|---|---|
| [backend/package.json](../backend/package.json) | Danh sách thư viện + lệnh | `"type": "module"` → dùng cú pháp `import/export` (ES Module) thay vì `require`. `npm run dev` dùng **nodemon**: sửa file trong `src/` là server tự khởi động lại. Mục `"prisma": { "seed": ... }` cho Prisma biết file seed nằm đâu. |
| [backend/.env.example](../backend/.env.example) | File **mẫu** cấu hình | Copy thành `.env` rồi sửa. `.env` thật không được commit vì chứa mật khẩu. |
| [backend/src/server.js](../backend/src/server.js) | **Điểm bắt đầu** của backend | Gọi `app.listen(port)` để mở cổng 4000. Hàm `shutdown()` ([dòng 10](../backend/src/server.js#L10)) đóng kết nối DB gọn gàng khi bấm `Ctrl+C`. |
| [backend/src/app.js](../backend/src/app.js) | Tạo và cấu hình Express | Gắn các middleware chung theo thứ tự: `helmet` (header bảo mật) → `cors` (cho phép frontend gọi) → `express.json` (đọc body, tối đa 1MB) → `morgan` (in log mỗi request). Phục vụ ảnh tĩnh ở `/uploads` ([dòng 18](../backend/src/app.js#L18)). Gắn toàn bộ API vào `/api/v1` ([dòng 22](../backend/src/app.js#L22)). **Cuối cùng** mới gắn `notFoundHandler` và `errorHandler`; thứ tự này bắt buộc. |
| [backend/src/routes.js](../backend/src/routes.js) | **Tổng đài** của API | Nối mỗi đường dẫn với một module: `/auth` → auth, `/dishes` → dishes... Có sẵn 2 API nhỏ: `GET /health` (kiểm tra server sống) và `GET /info` (thông tin nhà hàng + phí ship, [dòng 18](../backend/src/routes.js#L18)). **Thêm module mới thì phải đăng ký ở đây.** |
| [backend/src/config/env.js](../backend/src/config/env.js) | Đọc file `.env` một lần, export ra object `env` | Thiếu `DATABASE_URL` hoặc `JWT_SECRET` thì báo lỗi ngay khi khởi động ([dòng 4-9](../backend/src/config/env.js#L4-L9)). Có giá trị mặc định: cổng 4000, phí ship 20.000đ, miễn phí ship từ 500.000đ. Nơi khác **không đọc `process.env` trực tiếp** mà import `env` từ đây. |
| [backend/src/config/restaurant.js](../backend/src/config/restaurant.js) | Thông tin nhà hàng | Tên, slogan, hotline, email, địa chỉ, link Google Maps, **giờ mở cửa**, **các khu vực đặt bàn**, mạng xã hội. Frontend lấy qua `GET /api/v1/info`. Giờ mở cửa còn được dùng để **kiểm tra giờ đặt bàn** (trong `reservations.validation.js`). |
| [backend/src/lib/prisma.js](../backend/src/lib/prisma.js) | Tạo **một** `PrismaClient` dùng chung | Mọi file cần truy vấn DB đều `import { prisma } from '../../lib/prisma.js'`. Không tạo `new PrismaClient()` ở nơi khác vì mỗi instance mở thêm một nhóm kết nối DB. |

---

## 3. Backend: middlewares & utils

**Middleware** = hàm chạy *trước* controller, dạng `(req, res, next) => {}`.

| File | Chức năng | Các hàm export |
|---|---|---|
| [middlewares/auth.js](../backend/src/middlewares/auth.js) | Xác thực & phân quyền | `requireAuth`: bắt buộc có token hợp lệ, gắn user vào `req.user`. `optionalAuth`: có token thì gắn `req.user`, không có vẫn cho qua (dùng cho đặt hàng không cần tài khoản). `requireRole('ADMIN')`: kiểm tra vai trò. `requireAdmin`: mảng gộp `[requireAuth, requireRole('ADMIN')]`. Hàm nội bộ `loadUser` ([dòng 12](../backend/src/middlewares/auth.js#L12)) giải mã JWT rồi lấy user từ DB, **từ chối nếu tài khoản bị khóa** (`isActive = false`). |
| [middlewares/validate.js](../backend/src/middlewares/validate.js) | Kiểm tra dữ liệu gửi lên bằng schema Zod | `validate(schema)` kiểm tra `req.body`. `validate(schema, 'query')` kiểm tra query string và ghi kết quả vào `req.validatedQuery` (vì Express 5 không cho ghi đè `req.query`). Sai thì ném lỗi 400 kèm danh sách `errors: [{ field, message }]`. |
| [middlewares/error.js](../backend/src/middlewares/error.js) | Xử lý lỗi tập trung | `notFoundHandler`: không route nào khớp → 404. `errorHandler`: mọi lỗi `throw` ra đều về đây. Nó chuyển lỗi thành JSON thống nhất. Biết dịch lỗi Prisma: `P2002` trùng giá trị unique → 409, `P2025` không tìm thấy → 404, `P2003` đang bị khóa ngoại tham chiếu → 409. Biết dịch lỗi Multer (file quá 5MB). Khi `NODE_ENV=development` và lỗi 500 thì trả thêm `stack` để debug. |
| [middlewares/rateLimit.js](../backend/src/middlewares/rateLimit.js) | Giới hạn số lần gọi API | `rateLimit({ windowMs, max })` tạo middleware đếm số request theo **IP + đường dẫn**. Vượt `max` trong `windowMs` thì ném lỗi 429. Bộ đếm lưu trong một `Map` (RAM) và được dọn định kỳ. Đang dùng ở `auth.routes.js` (`authLimiter`), `orders.routes.js` và `reservations.routes.js` (`trackLimiter`). |
| [middlewares/upload.js](../backend/src/middlewares/upload.js) | Nhận file ảnh (Multer) | Lưu vào `backend/uploads/` với tên ngẫu nhiên `thời-gian-chuỗi-hex.jpg`. Giới hạn 5MB. Chỉ nhận JPG/PNG/WEBP/GIF. |
| [utils/ApiError.js](../backend/src/utils/ApiError.js) | Class lỗi có kèm mã HTTP | `throw ApiError.badRequest('...')` (400), `.unauthorized()` (401), `.forbidden()` (403), `.notFound()` (404), `.conflict()` (409). Thông báo mặc định đều bằng tiếng Việt. |
| [utils/helpers.js](../backend/src/utils/helpers.js) | Hàm tiện ích | `slugify('Tôm Hấp Bia')` → `tom-hap-bia`. `generateCode('FAB')` → `FAB261002123456` (tiền tố + yyMMdd giờ VN + 6 số ngẫu nhiên; dùng cho mã đơn và mã đặt bàn). `withUniqueCode(prefix, create)` → tự sinh lại mã nếu bị trùng. `getPagination(query)` → `{ page, limit, skip, take }`, giới hạn tối đa 100 dòng/trang. `paginationMeta(total, page, limit)` → `{ total, page, limit, totalPages }`. |

---

## 4. Backend: các module chức năng

Mỗi module nằm trong `backend/src/modules/<tên>/`. Quy ước tên file:

| Hậu tố | Vai trò |
|---|---|
| `*.routes.js` | Khai báo URL, middleware nào chạy trước, rồi gọi hàm nào trong controller |
| `*.validation.js` | Schema Zod: dữ liệu thế nào là hợp lệ |
| `*.controller.js` | Đọc `req`, gọi Prisma/service, trả `res.json(...)` |
| `*.service.js` | Logic nghiệp vụ phức tạp, dùng lại được, **không đụng `req`/`res`** |

Module đơn giản thì không có `service` (controller gọi thẳng Prisma). Có module gộp luôn schema vào controller (reviews, users) vì quá ngắn.

### 4.1 `auth`: đăng ký, đăng nhập, hồ sơ

| File | Nội dung |
|---|---|
| [auth.routes.js](../backend/src/modules/auth/auth.routes.js) | `POST /register`, `POST /login`, `GET /me`, `PATCH /me`, `POST /change-password` |
| [auth.validation.js](../backend/src/modules/auth/auth.validation.js) | Regex số điện thoại VN `^(0\|\+84)\d{9,10}$`. Mật khẩu tối thiểu 6 ký tự. Email tự chuyển chữ thường. |
| [auth.controller.js](../backend/src/modules/auth/auth.controller.js) | Mỏng, chủ yếu gọi service. `updateProfile` cập nhật thẳng bằng Prisma. |
| [auth.service.js](../backend/src/modules/auth/auth.service.js) | `toPublicUser` (bỏ `passwordHash` trước khi trả về). `signToken` (tạo JWT chứa `sub: userId`, `role`). `register` (băm mật khẩu bằng bcrypt, 10 vòng). `login` (so mật khẩu; sai email hay sai mật khẩu đều trả **cùng một** thông báo). `changePassword`. |

### 4.2 `categories`: danh mục món

| File | Nội dung |
|---|---|
| [categories.routes.js](../backend/src/modules/categories/categories.routes.js) | `GET /` công khai. Thêm, sửa, xóa chỉ admin. |
| [categories.validation.js](../backend/src/modules/categories/categories.validation.js) | `name`, `description`, `image`, `sortOrder` |
| [categories.controller.js](../backend/src/modules/categories/categories.controller.js) | `list` sắp theo `sortOrder` và kèm số món (`_count`). `create`/`update` tự sinh `slug` từ tên. `remove` **không cho xóa** nếu danh mục còn món. |

### 4.3 `dishes`: món ăn

| File | Nội dung |
|---|---|
| [dishes.routes.js](../backend/src/modules/dishes/dishes.routes.js) | `GET /` (danh sách có lọc), `GET /:idOrSlug` (chi tiết). Admin: `POST`, `PUT /:id`, `PATCH /:id/toggle` (bật/tắt còn món), `DELETE /:id` |
| [dishes.validation.js](../backend/src/modules/dishes/dishes.validation.js) | `dishSchema`: giá khuyến mãi phải nhỏ hơn giá gốc. `dishQuerySchema`: các tham số lọc `search`, `category` (slug), `featured`, `available` (`true`/`false`/`all`), `minPrice`, `maxPrice`, `sort`, `page`, `limit`. |
| [dishes.controller.js](../backend/src/modules/dishes/dishes.controller.js) | Bảng `SORTS` ([dòng 5](../backend/src/modules/dishes/dishes.controller.js#L5)) định nghĩa các kiểu sắp xếp. `list` dựng điều kiện `where` từ query; mặc định khách chỉ thấy món đang bán. `detail` nhận cả id lẫn slug, kèm 20 đánh giá mới nhất và 4 món liên quan cùng danh mục. `uniqueSlug` tạo slug không trùng (`tom-hap-bia-2`). `remove`: món **đã từng có trong đơn** thì không xóa hẳn mà chuyển sang ngừng bán, để giữ lịch sử. |

### 4.4 `orders`: đơn hàng ⭐ (module quan trọng nhất)

| File | Nội dung |
|---|---|
| [orders.routes.js](../backend/src/modules/orders/orders.routes.js) | Khách: `POST /` (đặt), `GET /my`, `GET /track/:code`, `POST /:code/cancel`. Admin: `GET /`, `GET /:id`, `PATCH /:id/status`. **Lưu ý thứ tự:** `/my` và `/track/:code` phải khai báo **trước** `/:id`, nếu không Express sẽ hiểu "my" là một id. |
| [orders.validation.js](../backend/src/modules/orders/orders.validation.js) | `createOrderSchema`: mỗi món tối đa 50 phần. Giao tận nơi thì bắt buộc địa chỉ (≥ 5 ký tự). Client chỉ gửi `dishId` + `quantity`, **không gửi giá**. |
| [orders.service.js](../backend/src/modules/orders/orders.service.js) | `STATUS_FLOW` ([dòng 8](../backend/src/modules/orders/orders.service.js#L8)): bảng chuyển trạng thái hợp lệ. `createOrder` ([dòng 19](../backend/src/modules/orders/orders.service.js#L19)): gộp món trùng → lấy giá **từ DB** → tính tạm tính, phí ship, giảm giá → tạo đơn → tăng `soldCount`, tất cả trong 1 transaction. `findAccessibleOrder`: chỉ cho xem đơn nếu là chủ đơn, admin, hoặc nhập đúng SĐT đặt hàng (sai thì trả 404 chứ không phải 403, để người ngoài không đoán được mã đơn nào tồn tại). `changeStatus`: kiểm tra `STATUS_FLOW`; hoàn thành đơn COD → tự `PAID`; hủy đơn đã trả tiền → `REFUNDED`; hủy thì hoàn lại `soldCount` và lượt dùng mã. |
| [orders.controller.js](../backend/src/modules/orders/orders.controller.js) | `pay`: thanh toán **giả lập**, đánh dấu `PAID` ngay. `cancel`: khách chỉ được hủy khi đơn còn `PENDING`. `list` (admin): lọc theo trạng thái, tìm theo mã/tên/SĐT, kèm `statusCounts` để hiện số trên các tab. |

### 4.5 `coupons`: mã giảm giá

| File | Nội dung |
|---|---|
| [coupons.routes.js](../backend/src/modules/coupons/coupons.routes.js) | Công khai: `GET /public` (mã đang hiệu lực), `POST /check` (thử áp mã). Admin: CRUD. |
| [coupons.validation.js](../backend/src/modules/coupons/coupons.validation.js) | Mã chỉ gồm chữ, số, `-`, `_` và tự viết hoa. Loại `PERCENT` thì tối đa 100. |
| [coupons.service.js](../backend/src/modules/coupons/coupons.service.js) | `applyCoupon(db, code, subtotal)` kiểm tra lần lượt: tồn tại và đang bật → đã đến ngày bắt đầu → chưa hết hạn → còn lượt → đủ đơn tối thiểu. Sau đó tính tiền giảm, áp mức giảm tối đa, và không bao giờ giảm quá tạm tính. Tham số `db` có thể là `prisma` hoặc `tx` để dùng được bên trong transaction của đơn hàng. |
| [coupons.controller.js](../backend/src/modules/coupons/coupons.controller.js) | `check` gọi `applyCoupon` nhưng **không** tăng lượt dùng (chỉ khi đặt đơn thật mới tăng). |

### 4.6 `reservations`: đặt bàn

| File | Nội dung |
|---|---|
| [reservations.routes.js](../backend/src/modules/reservations/reservations.routes.js) | Khách: `POST /`, `GET /my`, `GET /track/:code`, `POST /:code/cancel`. Admin: `GET /`, `PATCH /:id/status` |
| [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js) | Phải đặt trước **ít nhất 30 phút**. Giờ đến phải nằm trong giờ mở cửa và **trước giờ đóng cửa 1 tiếng** (đọc từ `config/restaurant.js`, tính theo giờ Việt Nam UTC+7). Tối đa 50 khách. |
| [reservations.controller.js](../backend/src/modules/reservations/reservations.controller.js) | `create` sinh mã `RSV...`. `cancel` chỉ hủy được khi đang `PENDING`/`CONFIRMED`. `list` (admin) lọc theo **ngày giờ Việt Nam** ([dòng 53-58](../backend/src/modules/reservations/reservations.controller.js#L53-L58)). Admin đổi trạng thái tự do (không có state machine như đơn hàng; giới hạn nút bấm nằm ở frontend). |

### 4.7 Các module nhỏ

| File | Nội dung |
|---|---|
| [reviews.routes.js](../backend/src/modules/reviews/reviews.routes.js) + [reviews.controller.js](../backend/src/modules/reviews/reviews.controller.js) | `upsert`: mỗi người chỉ có **1** đánh giá/món (gửi lại thì sửa đánh giá cũ). Chỉ người có đơn **đã hoàn thành** chứa món đó mới được đánh giá. `recalcRating` tính lại `ratingAvg` và `ratingCount` của món sau mỗi lần thêm/sửa/xóa. |
| [users.routes.js](../backend/src/modules/users/users.routes.js) + [users.controller.js](../backend/src/modules/users/users.controller.js) | Toàn bộ chỉ cho admin (`router.use(requireAdmin)`). Danh sách người dùng, đổi vai trò, khóa/mở khóa. **Không cho admin tự khóa hoặc tự hạ quyền chính mình.** `publicFields` chọn các cột được trả về (không có `passwordHash`). |
| [stats.routes.js](../backend/src/modules/stats/stats.routes.js) + [stats.controller.js](../backend/src/modules/stats/stats.controller.js) | `GET /overview?days=30` cho dashboard. Doanh thu **chỉ tính đơn `COMPLETED`**. Chạy song song nhiều truy vấn bằng `Promise.all`. Doanh thu theo ngày dùng **SQL thuần** (`$queryRaw`) để nhóm theo ngày giờ Việt Nam, sau đó lấp các ngày trống bằng 0 để biểu đồ liền mạch. |
| [upload.routes.js](../backend/src/modules/upload/upload.routes.js) | `POST /upload` (admin, `multipart/form-data`, trường `image`) → trả về `{ url: '/uploads/xxx.jpg' }`. |

---

## 5. Backend: database (Prisma)

| File | Chức năng |
|---|---|
| [prisma/schema.prisma](../backend/prisma/schema.prisma) | **Nguồn sự thật** về cấu trúc DB. Có 7 enum (Role, OrderType, OrderStatus, PaymentMethod, PaymentStatus, ReservationStatus, CouponType) và 8 bảng (User, Category, Dish, Order, OrderItem, Reservation, Review, Coupon). Sửa file này xong phải chạy `npm run db:migrate`. Giải thích chi tiết: [03-database-prisma.md](03-database-prisma.md). |
| [prisma/migrations/](../backend/prisma/migrations/) | Lịch sử thay đổi DB dưới dạng file SQL do Prisma **tự sinh**. Không sửa tay. Mỗi lần `db:migrate` sinh thêm một thư mục mới. |
| [prisma/seed.js](../backend/prisma/seed.js) | Nạp dữ liệu mẫu. ⚠️ **Xóa sạch dữ liệu cũ trước** ([dòng 81-88](../backend/prisma/seed.js#L81-L88)). Tạo: 1 admin + 3 khách, 8 danh mục, 26 món (ảnh từ Unsplash), 3 mã giảm giá (hạn 60 ngày tính từ lúc seed), 80 đơn ngẫu nhiên trong 30 ngày qua, đánh giá mẫu, 4 lịch đặt bàn. |
| `backend/uploads/` | Nơi lưu ảnh admin tải lên. Chỉ có `.gitkeep` được commit để giữ thư mục tồn tại. |

---

## 6. Frontend: khởi động & cấu hình

Thứ tự chạy: trình duyệt mở `index.html` → tải `src/main.jsx` → render `<App />` → `App.jsx` chọn trang theo URL.

| File | Chức năng | Chi tiết đáng chú ý |
|---|---|---|
| [frontend/package.json](../frontend/package.json) | Thư viện + lệnh | `dev` (Vite), `build`, `lint` (oxlint), `preview` (xem thử bản build). |
| [frontend/index.html](../frontend/index.html) | Trang HTML duy nhất (SPA) | `<title>` của tab trình duyệt, thẻ mô tả SEO, nạp **font Google** (Be Vietnam Pro, Playfair Display), thẻ `<div id="root">` nơi React vẽ giao diện. |
| [frontend/vite.config.js](../frontend/vite.config.js) | Cấu hình Vite | Plugin React + Tailwind. Cổng 5173. **Proxy**: mọi request `/api` và `/uploads` được chuyển tiếp sang `localhost:4000`, nên khi dev không gặp lỗi CORS. |
| [frontend/.env.example](../frontend/.env.example) | Mẫu biến môi trường | `VITE_API_URL`: để trống khi dev (dùng proxy), điền domain backend khi deploy. Chỉ biến bắt đầu bằng `VITE_` mới đọc được trong code React. |
| [frontend/.oxlintrc.json](../frontend/.oxlintrc.json) | Cấu hình kiểm tra code | Bật luật về hooks của React. |
| [frontend/public/favicon.svg](../frontend/public/favicon.svg) | Logo (icon tab + logo trên header) | File trong `public/` được phục vụ nguyên trạng ở đường dẫn gốc `/favicon.svg`. |
| [src/main.jsx](../frontend/src/main.jsx) | **Điểm bắt đầu** của React | Bọc ứng dụng theo thứ tự: `ErrorBoundary` → `QueryClientProvider` (React Query, cache 30 giây, thử lại 1 lần) → `BrowserRouter` → `App` + `Toaster` (thông báo góc trên). |
| [src/App.jsx](../frontend/src/App.jsx) | **Bảng định tuyến**: URL nào hiện trang nào | Trang khách nằm trong `CustomerLayout`, trang tài khoản bọc thêm `ProtectedRoute`, trang admin bọc `ProtectedRoute role="ADMIN"` + `AdminLayout`. Hầu hết trang được `lazy()` (chỉ tải khi cần); riêng `Home` tải ngay để trang chủ hiện nhanh. Có một `useEffect` gọi `GET /auth/me` mỗi lần mở web để cập nhật thông tin tài khoản mới nhất (token hết hạn thì tự đăng xuất). |
| [src/index.css](../frontend/src/index.css) | CSS toàn cục + **bảng màu** | Khối `@theme` định nghĩa font và 3 dải màu: `ocean` (xanh biển, màu chính), `coral` (cam san hô, màu nhấn), `sand` (nền kem). Class dùng chung: `.container-page` (khung nội dung giữa trang), `.card` (thẻ trắng bo góc), `.heading-display` (tiêu đề font có chân), `.no-scrollbar`. |

---

## 7. Frontend: lib, services, stores

| File | Chức năng | Các hàm/biến export |
|---|---|---|
| [lib/api.js](../frontend/src/lib/api.js) | Tạo **axios** dùng chung | `api` (baseURL `/api/v1`, timeout 15 giây). *Interceptor request*: tự gắn `Authorization: Bearer <token>`. *Interceptor response*: trả thẳng body JSON; lỗi thì tạo `Error` có `message` tiếng Việt lấy từ backend; gặp **401 thì tự đăng xuất**. `API_ORIGIN`: địa chỉ backend (rỗng khi dev). |
| [services/index.js](../frontend/src/services/index.js) | **Mọi hàm gọi API** gom về một file | `infoApi`, `authApi`, `categoryApi`, `dishApi`, `orderApi`, `reservationApi`, `reviewApi`, `couponApi`, `userApi`, `statsApi`, `uploadApi`. Lưu ý: hàm có `.then((r) => r.data)` trả về **chỉ data**; hàm không có (vd `dishApi.list`) trả về cả `{ data, meta }` để còn phân trang. |
| [lib/format.js](../frontend/src/lib/format.js) | Định dạng hiển thị | `formatPrice(289000)` → `289.000đ`. `formatDate`, `formatDateTime` (dayjs, tiếng Việt). `fromNow` → "3 phút trước". `imageUrl(src)`: ảnh rỗng thì dùng ảnh giữ chỗ, ảnh `/uploads/...` thì ghép địa chỉ server. `effectivePrice(dish)` → giá KM nếu có, không thì giá gốc. `formatCompactPrice` → "99 triệu". |
| [lib/constants.js](../frontend/src/lib/constants.js) | **Nhãn tiếng Việt và màu** cho các giá trị enum | `ORDER_STATUS`, `RESERVATION_STATUS`, `PAYMENT_STATUS` (nhãn + màu badge). `NEXT_STATUS` (**bản sao** `STATUS_FLOW` của backend, để biết hiện nút nào). `PAYMENT_METHOD`, `ORDER_TYPE`, `SORT_OPTIONS` (các lựa chọn sắp xếp ở trang Thực đơn), `STATUS_ACTION_LABEL` (chữ trên nút đổi trạng thái của admin). |
| [lib/hooks.js](../frontend/src/lib/hooks.js) | Hook dùng ở nhiều nơi | `useInfo()` (thông tin nhà hàng, cache suốt phiên). `useCategories()` (danh mục, cache 5 phút). `useDocumentTitle('Thực đơn')` đặt tiêu đề tab trình duyệt thành "Thực đơn \| FAB Seafood". Mọi trang trong `pages/` đều gọi hook này ở dòng đầu. |
| [lib/cn.js](../frontend/src/lib/cn.js) | Gộp class Tailwind | `cn('px-4 w-full', 'w-36')` → class sau ghi đè class trước cùng loại. |
| [stores/auth.js](../frontend/src/stores/auth.js) | Zustand: **ai đang đăng nhập** | State `token`, `user`. Hàm `setAuth`, `setUser`, `logout`. Lưu vào localStorage với key `fab-auth`, nên F5 không bị đăng xuất. |
| [stores/cart.js](../frontend/src/stores/cart.js) | Zustand: **giỏ hàng** | State `items`, `isOpen` (ngăn kéo giỏ đang mở?). Hàm `add`, `setQuantity` (≤ 0 thì xóa), `remove`, `clear`, `open`, `close`. Mỗi món tối đa 50. Lưu localStorage key `fab-cart` (chỉ lưu `items`, không lưu `isOpen`). Selector: `selectCount` (tổng số món), `selectSubtotal` (tạm tính). Giá trong giỏ **chỉ để hiển thị**; backend tính lại khi đặt. |

---

## 8. Frontend: components

### 8.1 `components/ui/`: viên gạch giao diện (không gọi API)

| File | Export | Dùng thế nào |
|---|---|---|
| [Button.jsx](../frontend/src/components/ui/Button.jsx) | `Button` | `variant`: `primary` (cam), `dark` (xanh đậm), `outline`, `ghost`, `danger`. `size`: `sm`, `md`, `lg`, `icon`. `loading` → hiện vòng xoay và khóa nút. `as={Link} to="/menu"` → biến nút thành link. |
| [Form.jsx](../frontend/src/components/ui/Form.jsx) | `Field`, `Input`, `Textarea`, `Select`, `Checkbox` | `Field` bọc nhãn + ô nhập + dòng lỗi (`error`) hoặc gợi ý (`hint`). `invalid` → viền đỏ. Dùng trực tiếp với `{...register('ten')}` của react-hook-form. |
| [Modal.jsx](../frontend/src/components/ui/Modal.jsx) | `Modal` | Hộp thoại. `open`, `onClose`, `title`, `footer`, `size` (`sm`/`md`/`lg`/`xl`). Bấm nền tối hoặc phím `Esc` để đóng. Trên điện thoại trượt lên từ đáy. |
| [Badge.jsx](../frontend/src/components/ui/Badge.jsx) | `Badge`, `StatusBadge` | Nhãn màu nhỏ. `StatusBadge map={ORDER_STATUS} value="PENDING"` tự lấy nhãn và màu từ `constants.js`. |
| [Feedback.jsx](../frontend/src/components/ui/Feedback.jsx) | `Spinner`, `EmptyState`, `ErrorState`, `Rating`, `Pagination` | Trạng thái đang tải / rỗng / lỗi, hiển thị sao, nút phân trang. |
| [Table.jsx](../frontend/src/components/ui/Table.jsx) | `Table`, `Th`, `Td` | Bảng cho trang admin, tự cuộn ngang trên màn hình nhỏ. |
| [QuantityInput.jsx](../frontend/src/components/ui/QuantityInput.jsx) | `QuantityInput` | Nút `−  2  +`. `min`, `max` (mặc định 1–50), `size="sm"`. |

### 8.2 `components/layout/`: khung trang

| File | Chức năng |
|---|---|
| [CustomerLayout.jsx](../frontend/src/components/layout/CustomerLayout.jsx) | Khung trang khách: `Header` + nội dung (`<Outlet />`) + `Footer` + `CartDrawer`. Tự cuộn lên đầu khi chuyển trang. |
| [Header.jsx](../frontend/src/components/layout/Header.jsx) | Thanh trên cùng. Mảng `NAV` ([dòng 9](../frontend/src/components/layout/Header.jsx#L9)) là các mục menu. Icon giỏ hàng có số đếm. `UserMenu` là menu thả xuống khi đã đăng nhập (admin thấy thêm mục "Trang quản trị"). Trên điện thoại có nút ☰. Khi cuộn trang, nền chuyển sang trắng mờ. |
| [Footer.jsx](../frontend/src/components/layout/Footer.jsx) | Chân trang: logo, slogan, mạng xã hội, liên kết, liên hệ, giờ mở cửa (lấy từ `useInfo()`). |
| [CartDrawer.jsx](../frontend/src/components/layout/CartDrawer.jsx) | Ngăn kéo giỏ hàng trượt từ bên phải. Đổi số lượng, xóa món, nút "Tiến hành đặt món" → `/checkout`. |
| [AdminLayout.jsx](../frontend/src/components/layout/AdminLayout.jsx) | Khung trang admin: sidebar trái (mảng `MENU`, [dòng 21](../frontend/src/components/layout/AdminLayout.jsx#L21)) + thanh trên có tên admin. Trên điện thoại, sidebar ẩn sau nút ☰. |
| [ProtectedRoute.jsx](../frontend/src/components/layout/ProtectedRoute.jsx) | Chặn trang: chưa đăng nhập → đưa về `/login` (nhớ trang đang định vào để quay lại sau khi đăng nhập). Sai vai trò → về trang chủ. |
| [Logo.jsx](../frontend/src/components/layout/Logo.jsx) | Logo "FAB Seafood". `light` → chữ trắng (dùng trên nền tối). |

### 8.3 Components khác

| File | Chức năng |
|---|---|
| [DishCard.jsx](../frontend/src/components/DishCard.jsx) | Thẻ món ăn dùng ở trang chủ, thực đơn, món liên quan. Hiện ảnh, nhãn `-x%` khi giảm giá, nhãn "Đặc biệt" khi là món nổi bật, sao, đã bán, giá, nút `+` thêm nhanh vào giỏ. |
| [ImageUpload.jsx](../frontend/src/components/ImageUpload.jsx) | Ô chọn ảnh cho form admin: bấm để tải ảnh từ máy lên, hoặc dán link ảnh. |
| [PageHeader.jsx](../frontend/src/components/PageHeader.jsx) | Tiêu đề + phụ đề + các nút hành động ở đầu mỗi trang admin. |
| [ErrorBoundary.jsx](../frontend/src/components/ErrorBoundary.jsx) | Nếu một component bị lỗi khi render thì hiện "Đã có lỗi xảy ra" thay vì **trắng trang**. Phải viết bằng class component vì React chưa có hook tương đương. |

---

## 9. Frontend: các trang khách hàng

| URL | File | Nội dung chính |
|---|---|---|
| `/` | [pages/Home.jsx](../frontend/src/pages/Home.jsx) | Các khối từ trên xuống: **Hero** (ảnh lớn + khẩu hiệu), **Features** (4 ưu điểm, mảng `FEATURES`), **Danh mục**, **Món đặc biệt** (`featured=true`, 8 món), **Ưu đãi** (mã giảm giá công khai), **Về chúng tôi**, **Khách hàng nói gì** (mảng `TESTIMONIALS`, chữ viết cứng), **Kêu gọi đặt bàn**, **Bản đồ**. Ảnh nền là hằng `HERO`, `ABOUT_1`, `ABOUT_2` ở đầu file. |
| `/menu` | [pages/Menu.jsx](../frontend/src/pages/Menu.jsx) | Dải chip danh mục, ô tìm kiếm (debounce 400ms), chọn sắp xếp, lưới món, phân trang. **Mọi bộ lọc lưu trên URL** (`?category=tom&sort=popular&page=2`). Mỗi trang 12 món. |
| `/menu/:slug` | [pages/DishDetail.jsx](../frontend/src/pages/DishDetail.jsx) | Breadcrumb, ảnh, giá, mô tả, chọn số lượng + thêm vào giỏ, khu đánh giá (`ReviewForm` chọn sao + bình luận), món liên quan. |
| `/checkout` | [pages/Checkout.jsx](../frontend/src/pages/Checkout.jsx) | Component nhỏ `OptionCard`. 3 bước: hình thức nhận món, thông tin người nhận, phương thức thanh toán. Cột phải: tóm tắt đơn, ô mã giảm giá + các mã gợi ý, tổng tiền. Đặt thành công → xóa giỏ → chuyển tới `/orders/:code`. Phí ship ở đây chỉ **ước tính** để hiển thị; backend tính lại. |
| `/orders/:code` | [pages/OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx) | `Timeline` (thanh tiến trình trạng thái; đơn "đến lấy" bỏ bước "Đang giao"). Nút "Thanh toán qua VNPay" cho đơn online chưa trả (gọi `paymentApi.createVnpay` rồi chuyển trang). Tự tải lại mỗi 15 giây. Đơn tạo trong vòng 10 phút thì hiện lời cảm ơn. Có nút hủy khi đơn còn chờ xác nhận và chưa thanh toán online. |
| `/payment/vnpay-return` | [pages/PaymentResult.jsx](../frontend/src/pages/PaymentResult.jsx) | VNPay đưa khách về đây. Gửi nguyên query lên backend kiểm tra chữ ký rồi mới báo thành công/thất bại. |
| `/track` | [pages/TrackOrder.jsx](../frontend/src/pages/TrackOrder.jsx) | 2 tab (hằng `TABS`): **Đơn hàng** và **Đặt bàn** (`/track?tab=reservation`). Nhập mã + SĐT rồi chuyển sang `/orders/:code?phone=...` hoặc `/reservations/:code?phone=...`. |
| `/reservations/:code` | [pages/ReservationDetail.jsx](../frontend/src/pages/ReservationDetail.jsx) | Chi tiết 1 lịch đặt bàn: thời gian, số khách, khu vực, trạng thái. Có nút hủy khi lịch còn `PENDING`/`CONFIRMED` và chưa tới giờ. Khách không có tài khoản cũng vào được nếu biết đúng SĐT. |
| `/reservation` | [pages/Reservation.jsx](../frontend/src/pages/Reservation.jsx) | Hàm `timeSlots` sinh các khung giờ cách nhau 30 phút từ giờ mở cửa tới trước giờ đóng 1 tiếng. Form: tên, SĐT, email, ngày, giờ, số khách, khu vực, ghi chú. Ngày + giờ được ghép theo múi giờ +07:00 trước khi gửi. Thành công thì hiện thẻ xác nhận có mã đặt bàn và nút **Xem chi tiết** (dẫn tới `/reservations/:code`). |
| `/login` | [pages/Login.jsx](../frontend/src/pages/Login.jsx) | Đăng nhập xong: quay lại trang trước đó, nếu không có thì admin → `/admin`, khách → `/`. Có 2 nút **tài khoản demo** điền sẵn (nên xóa khi chạy thật). |
| `/register` | [pages/Register.jsx](../frontend/src/pages/Register.jsx) | Đăng ký, có ô nhập lại mật khẩu. Đăng ký xong tự đăng nhập luôn. |
| `/account` | [pages/account/AccountLayout.jsx](../frontend/src/pages/account/AccountLayout.jsx) + [Profile.jsx](../frontend/src/pages/account/Profile.jsx) | Khung tài khoản có 3 tab (mảng `TABS`). `Profile` gồm `ProfileForm` (tên, SĐT, địa chỉ mặc định) và `PasswordForm`. |
| `/account/orders` | [pages/account/MyOrders.jsx](../frontend/src/pages/account/MyOrders.jsx) | Danh sách đơn của tôi, mỗi trang 10 đơn, bấm vào để xem chi tiết. |
| `/account/reservations` | [pages/account/MyReservations.jsx](../frontend/src/pages/account/MyReservations.jsx) | Lịch đặt bàn của tôi, có nút hủy (chỉ với lịch chưa tới giờ). |
| URL không tồn tại | [pages/NotFound.jsx](../frontend/src/pages/NotFound.jsx) | Trang 404. |

---

## 10. Frontend: các trang admin

Mọi trang admin đều theo một khuôn: `useQuery` lấy danh sách → hiển thị `Table` → bấm nút mở `Modal` chứa form → `useMutation` lưu → `invalidateQueries` để bảng tự tải lại.

| URL | File | Nội dung chính |
|---|---|---|
| `/admin` | [admin/Dashboard.jsx](../frontend/src/pages/admin/Dashboard.jsx) | `StatCard` (4 ô số liệu), biểu đồ vùng doanh thu theo ngày và biểu đồ cột top 5 món (thư viện **Recharts**), đơn theo trạng thái, 6 đơn mới nhất. Chọn khoảng 7/30/90 ngày. Màu biểu đồ là hằng `SERIES`. |
| `/admin/orders` | [admin/Orders.jsx](../frontend/src/pages/admin/Orders.jsx) | Tab theo trạng thái (kèm số lượng), tìm kiếm, bảng đơn, tự làm mới 30 giây/lần. `OrderModal`: chi tiết đơn + các nút chuyển trạng thái lấy từ `NEXT_STATUS` (đơn "đến lấy" ẩn nút "Giao hàng"). |
| `/admin/reservations` | [admin/Reservations.jsx](../frontend/src/pages/admin/Reservations.jsx) | Lọc theo ngày, trạng thái, từ khóa. Hằng `ACTIONS` ([dòng 15](../frontend/src/pages/admin/Reservations.jsx#L15)) quy định nút nào hiện ở trạng thái nào. |
| `/admin/dishes` | [admin/Dishes.jsx](../frontend/src/pages/admin/Dishes.jsx) | `DishForm` (modal thêm/sửa, dùng `Controller` cho ô ảnh). Bảng món có công tắc bật/tắt "đang bán". Hằng `EMPTY` là giá trị mặc định khi thêm món mới. |
| `/admin/categories` | [admin/Categories.jsx](../frontend/src/pages/admin/Categories.jsx) | `CategoryForm`: ảnh, tên, mô tả, thứ tự hiển thị. |
| `/admin/coupons` | [admin/Coupons.jsx](../frontend/src/pages/admin/Coupons.jsx) | `CouponForm`. Hàm `statusOf` tính nhãn Tắt / Hết hạn / Hết lượt / Hoạt động. Ngày bắt đầu tính từ 00:00, ngày hết hạn tính tới 23:59:59 giờ VN. |
| `/admin/reviews` | [admin/Reviews.jsx](../frontend/src/pages/admin/Reviews.jsx) | Danh sách đánh giá, xóa đánh giá vi phạm. |
| `/admin/users` | [admin/Users.jsx](../frontend/src/pages/admin/Users.jsx) | Đổi vai trò ngay trên bảng, khóa/mở khóa tài khoản. Không thể thao tác trên chính mình. |

---

## 11. Bảng tra nhanh

Khi thấy lỗi ở một trang, tra bảng này để biết cần mở những file nào.

| Trang (URL) | File frontend | Hàm trong `services/index.js` | API backend | File backend xử lý |
|---|---|---|---|---|
| `/` | `pages/Home.jsx` | `infoApi.get`, `categoryApi.list`, `dishApi.list`, `couponApi.public` | `GET /info`, `/categories`, `/dishes?featured=true`, `/coupons/public` | `routes.js`, `categories.controller`, `dishes.controller`, `coupons.controller` |
| `/menu` | `pages/Menu.jsx` | `dishApi.list` | `GET /dishes` | `dishes.controller.js > list` |
| `/menu/:slug` | `pages/DishDetail.jsx` | `dishApi.detail`, `reviewApi.create` | `GET /dishes/:slug`, `POST /reviews` | `dishes.controller > detail`, `reviews.controller > upsert` |
| `/checkout` | `pages/Checkout.jsx` | `couponApi.check`, `orderApi.create` | `POST /coupons/check`, `POST /orders` | `coupons.service > applyCoupon`, `orders.service > createOrder` |
| `/orders/:code` | `pages/OrderDetail.jsx` | `orderApi.track`, `.cancel`, `paymentApi.createVnpay` | `GET /orders/track/:code`, `/cancel`, `POST /payments/vnpay/:code` | `orders.controller`, `orders.service > findAccessibleOrder`, `payments.service > createVnpayPayment` |
| `/payment/vnpay-return` | `pages/PaymentResult.jsx` | `paymentApi.vnpayReturn` | `GET /payments/vnpay/return` | `payments.controller`, `payments.service > handleVnpayResult`, `vnpay.js > verifySignature` |
| `/reservation` | `pages/Reservation.jsx` | `reservationApi.create` | `POST /reservations` | `reservations.validation`, `reservations.controller > create` |
| `/reservations/:code` | `pages/ReservationDetail.jsx` | `reservationApi.track`, `.cancel` | `GET /reservations/track/:code`, `POST /reservations/:code/cancel` | `reservations.controller > findAccessible, track, cancel` |
| `/login`, `/register` | `pages/Login.jsx`, `Register.jsx` | `authApi.login`, `.register` | `POST /auth/login`, `/auth/register` | `auth.service.js` |
| `/account` | `pages/account/Profile.jsx` | `authApi.updateProfile`, `.changePassword` | `PATCH /auth/me`, `POST /auth/change-password` | `auth.controller`, `auth.service` |
| `/admin` | `pages/admin/Dashboard.jsx` | `statsApi.overview` | `GET /stats/overview` | `stats.controller.js` |
| `/admin/orders` | `pages/admin/Orders.jsx` | `orderApi.list`, `.detail`, `.updateStatus` | `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` | `orders.controller`, `orders.service > changeStatus` |
| `/admin/dishes` | `pages/admin/Dishes.jsx` | `dishApi.*`, `uploadApi.image` | `/dishes...`, `POST /upload` | `dishes.controller`, `upload.routes`, `middlewares/upload.js` |
| `/admin/users` | `pages/admin/Users.jsx` | `userApi.list`, `.update` | `GET /users`, `PATCH /users/:id` | `users.controller.js` |
