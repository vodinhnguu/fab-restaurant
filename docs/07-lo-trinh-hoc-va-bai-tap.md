# 07. Lộ trình học & bài tập

## 1. Lộ trình đọc code (khoảng 2 tuần)

| Ngày | Nội dung | File nên đọc |
|---|---|---|
| 1 | Chạy được dự án, dùng thử mọi chức năng ở vai trò khách và admin | README, docs/02 |
| 2 | Hiểu kiến trúc và luồng request | docs/01 |
| 3 | Database: đọc schema, mở Prisma Studio, sửa thử dữ liệu | `prisma/schema.prisma`, `seed.js` |
| 4 | Express cơ bản: app, routes, middleware | `app.js`, `routes.js`, `middlewares/*` |
| 5 | Module đơn giản: categories, dishes | `modules/categories`, `modules/dishes` |
| 6 | Auth & JWT | `modules/auth`, `middlewares/auth.js` |
| 7 | Nghiệp vụ phức tạp: đơn hàng, mã giảm giá | `modules/orders`, `modules/coupons` |
| 8 | React: router, layout | `main.jsx`, `App.jsx`, `components/layout/*` |
| 9 | Components UI và Tailwind | `components/ui/*`, `index.css` |
| 10 | React Query + services | `services/index.js`, `pages/Menu.jsx` |
| 11 | Zustand + giỏ hàng + checkout | `stores/*`, `CartDrawer.jsx`, `Checkout.jsx` |
| 12 | Form: đặt bàn, đăng nhập, admin CRUD | `Reservation.jsx`, `admin/Dishes.jsx` |
| 13 | Dashboard + biểu đồ | `admin/Dashboard.jsx`, `modules/stats` |
| 14 | Làm bài tập cấp 1 bên dưới | |

**Mẹo:** trong lúc đọc code, mở song song [08-ban-do-ma-nguon.md](08-ban-do-ma-nguon.md) để tra nhanh vai trò từng file. Khi bắt đầu tự sửa, dùng [09-muon-sua-gi-thi-sua-o-dau.md](09-muon-sua-gi-thi-sua-o-dau.md).

**Mẹo:** đặt `console.log` hoặc breakpoint (VS Code → Run and Debug) ở controller, rồi thao tác trên web để thấy dữ liệu đi qua từng bước. Mở DevTools → tab **Network** để xem request/response thật.

## 2. Bài tập nâng cấp

### 🟢 Cấp 1: Làm quen
1. Đổi tên, địa chỉ, giờ mở cửa nhà hàng (`backend/src/config/restaurant.js`). Kiểm tra footer và trang đặt bàn có cập nhật theo.
2. Thêm 3 món mới qua trang admin, có upload ảnh.
3. Thêm cột `calories` cho món ăn: schema → migration → validation → form admin → hiển thị ở trang chi tiết.
4. Thêm bộ lọc "Chỉ món đang giảm giá" ở trang Thực đơn (gợi ý: backend `where.salePrice = { not: null }`).
5. Làm trang **Liên hệ** theo hướng dẫn ở docs/04 mục 7, kèm trang admin để xem góp ý.

### 🟡 Cấp 2: Trung bình
6. **Món yêu thích:** model `Favorite(userId, dishId)`, nút ❤️ trên DishCard, trang "Món yêu thích" trong tài khoản.
7. **Tùy chọn món:** ví dụ tôm có "Hấp bia / Nướng muối ớt / Rang me", cua có size theo kg. Gợi ý: model `DishOption`, lưu lựa chọn vào `OrderItem`.
8. **Rate limit:** dự án đã có bản tự viết ở `backend/src/middlewares/rateLimit.js` (đọc kỹ để hiểu cách hoạt động). Bài tập: (a) áp dụng thêm cho `POST /orders` và `POST /reservations` để chống spam đơn ảo; (b) thử thay bằng thư viện `express-rate-limit` rồi so sánh với bản tự viết.
9. **Quên mật khẩu qua email:** `nodemailer` + Gmail App Password hoặc Resend. Gửi link có token hết hạn sau 15 phút.
10. **Xuất báo cáo Excel** doanh thu ở dashboard (thư viện `exceljs`).
11. **Upload ảnh lên Cloudinary** thay vì lưu trên ổ đĩa (cần thiết khi deploy).
12. **Viết test** cho API bằng `vitest` + `supertest`. Bắt đầu với `POST /auth/login` và `POST /orders` (sai giá, sai mã giảm giá).

### 🔴 Cấp 3: Nâng cao
13. **Realtime với Socket.IO:** admin nhận thông báo kèm âm thanh ngay khi có đơn mới, khách thấy trạng thái đơn đổi ngay lập tức (thay cho polling 15 giây).
14. **Gọi món tại bàn bằng QR:** mỗi bàn có một mã QR dẫn tới `/menu?table=5`, đơn tạo ra có `type: DINE_IN` và `tableNumber`. Thêm **màn hình bếp** (Kitchen Display) hiện các món cần làm.
15. **Tích hợp VNPay sandbox:** đăng ký tại sandbox.vnpayment.vn và làm theo luồng ở docs/04 mục 6.3.
16. **Quản lý bàn và kiểm tra bàn trống** khi đặt bàn (model `Table`, không cho đặt trùng giờ).
17. **Chương trình tích điểm:** mỗi 10.000đ được 1 điểm, đổi điểm lấy mã giảm giá.
18. **Chuyển sang TypeScript:** bắt đầu từ `frontend/src/lib` và `services`.
19. **Docker hóa:** viết `docker-compose.yml` chạy postgres + backend + frontend chỉ bằng một lệnh.
20. **CI với GitHub Actions:** tự chạy lint, test và build mỗi khi push code.

## 3. Kiến thức nền nên học thêm

| Chủ đề | Tài liệu |
|---|---|
| JavaScript hiện đại (ES6+, async/await, destructuring, module) | javascript.info |
| React chính thức | react.dev/learn |
| TanStack Query | tanstack.com/query/latest/docs |
| Tailwind CSS | tailwindcss.com/docs |
| Express | expressjs.com |
| Prisma | prisma.io/docs |
| SQL cơ bản | sqlbolt.com |
| HTTP, REST API | developer.mozilla.org/docs/Web/HTTP |
| Git | learngitbranching.js.org |

## 4. Gợi ý khi bảo vệ / thuyết trình đồ án

Những điểm "ăn điểm" nên trình bày:
1. **Kiến trúc tách lớp**, một API dùng chung cho web và mobile.
2. **Bảo mật:** giá tính ở server, bcrypt, JWT, phân quyền 2 lớp, validation 2 phía.
3. **Toàn vẹn dữ liệu:** transaction khi tạo đơn, state machine trạng thái đơn, lưu lại giá tại thời điểm đặt.
4. **Trải nghiệm người dùng:** đặt hàng không cần tài khoản, giỏ hàng không mất khi F5, theo dõi đơn tự cập nhật, giao diện responsive trên mobile.
5. **Demo trực tiếp:** khách đặt đơn trên điện thoại → admin xác nhận trên máy tính → trạng thái trên điện thoại tự đổi.
