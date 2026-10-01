# 🦞 FAB Seafood - Website nhà hàng hải sản

Dự án FAB: website đặt món và đặt bàn cho nhà hàng hải sản, gồm **trang khách hàng** và **trang quản trị (Admin)**.
Backend là REST API dùng chung cho cả web và app mobile (Flutter) sau này.

| Phần | Công nghệ |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router 7, TanStack Query, Zustand, React Hook Form, Recharts |
| Backend | Node.js, Express 5, Prisma ORM, Zod, JWT, bcrypt, Multer |
| Database | PostgreSQL |

---

## ✨ Chức năng

### Khách hàng
- Trang chủ: banner, danh mục, món nổi bật, ưu đãi, giới thiệu, đánh giá, bản đồ
- Thực đơn: lọc theo danh mục, tìm kiếm (debounce), sắp xếp, phân trang. Bộ lọc lưu trên URL
- Chi tiết món: ảnh, giá khuyến mãi, đánh giá sao, bình luận, món liên quan
- Giỏ hàng dạng ngăn kéo trượt, lưu ở trình duyệt (F5 không mất)
- Thanh toán: giao tận nơi hoặc đến lấy, **mã giảm giá**, phí ship tự tính (miễn phí từ 500k), COD hoặc **thanh toán online mô phỏng**
- Theo dõi đơn hàng theo dòng thời gian, tự cập nhật mỗi 15 giây, khách được tự hủy khi đơn còn chờ xác nhận
- Tra cứu đơn không cần tài khoản (mã đơn + số điện thoại)
- Đặt bàn: chọn ngày, giờ, số khách, khu vực. Có kiểm tra giờ mở cửa
- Tài khoản: đăng ký, đăng nhập, sửa hồ sơ, đổi mật khẩu, lịch sử đơn và lịch đặt bàn
- Đánh giá món (chỉ khi đã nhận món đó)

### Admin (`/admin`)
- Dashboard: doanh thu, số đơn, biểu đồ doanh thu theo ngày, top món bán chạy, đơn mới nhất
- Quản lý đơn hàng: lọc theo trạng thái, tìm kiếm, xem chi tiết, chuyển trạng thái theo đúng quy trình
- Quản lý đặt bàn: lọc theo ngày và trạng thái, xác nhận, hủy, đánh dấu khách đã đến
- CRUD món ăn (upload ảnh, bật/tắt còn món), danh mục, mã giảm giá
- Kiểm duyệt đánh giá, quản lý người dùng (phân quyền, khóa tài khoản)

---

## 🚀 Chạy nhanh

Yêu cầu: **Node.js 20 trở lên** và **PostgreSQL 14 trở lên**

```bash
# 1. Cài thư viện cho cả 3 thư mục
npm run install:all

# 2. Tạo database và file cấu hình
createdb fab_restaurant
cp backend/.env.example backend/.env      # rồi sửa DATABASE_URL cho đúng máy bạn

# 3. Tạo bảng + dữ liệu mẫu
npm run setup

# 4. Chạy cả backend (cổng 4000) và frontend (cổng 5173)
npm run dev
```

Mở http://localhost:5173

| Tài khoản demo | Email | Mật khẩu |
|---|---|---|
| Admin | admin@fab.vn | admin123 |
| Khách hàng | khach@fab.vn | 123456 |

Mã giảm giá mẫu: `WELCOME10`, `FAB50K`, `HAISAN20`

Hướng dẫn chi tiết và cách xử lý lỗi thường gặp: [docs/02-cai-dat-va-chay.md](docs/02-cai-dat-va-chay.md)

---

## 📁 Cấu trúc thư mục

```
fab-restaurant/
├── backend/                 # REST API
│   ├── prisma/
│   │   ├── schema.prisma    # Định nghĩa bảng dữ liệu
│   │   ├── migrations/      # Lịch sử thay đổi DB
│   │   └── seed.js          # Dữ liệu mẫu
│   └── src/
│       ├── config/          # Biến môi trường, thông tin nhà hàng
│       ├── middlewares/     # auth, validate, error, upload
│       ├── modules/         # Mỗi chức năng 1 thư mục: routes + controller + validation (+ service)
│       ├── utils/
│       ├── routes.js        # Gắn tất cả module vào /api/v1
│       ├── app.js           # Cấu hình Express
│       └── server.js        # Khởi động server
├── frontend/                # Website React
│   └── src/
│       ├── components/      # UI dùng chung, layout
│       ├── pages/           # Mỗi trang 1 file (account/, admin/)
│       ├── services/        # Hàm gọi API
│       ├── stores/          # Zustand: auth, cart
│       └── lib/             # axios, format, hằng số, hooks
└── docs/                    # 📚 Tài liệu học tập
```

---

## 📚 Tài liệu học tập

Nên đọc theo thứ tự:

1. [Tổng quan & kiến trúc](docs/01-tong-quan-kien-truc.md): hệ thống hoạt động thế nào, vì sao chọn các công nghệ này
2. [Cài đặt & chạy dự án](docs/02-cai-dat-va-chay.md): cài đặt, lỗi thường gặp, deploy
3. [Database & Prisma](docs/03-database-prisma.md): thiết kế bảng, sơ đồ quan hệ (ERD), migration, cách truy vấn
4. [Backend với Express](docs/04-backend-express.md): middleware, JWT, validation, xử lý lỗi, cách thêm 1 module mới
5. [Frontend với React](docs/05-frontend-react.md): routing, React Query, Zustand, form, Tailwind
6. [Tài liệu API](docs/06-api-reference.md): danh sách endpoint, dùng cho app Flutter
7. [Lộ trình học & bài tập](docs/07-lo-trinh-hoc-va-bai-tap.md): bài tập nâng cấp dự án từ dễ đến khó

File [docs/api.http](docs/api.http) dùng để gọi thử API ngay trong VS Code (cần cài extension **REST Client**).
