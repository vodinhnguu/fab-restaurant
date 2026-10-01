# 02. Cài đặt & chạy dự án

## 1. Chuẩn bị

| Phần mềm | Phiên bản | Kiểm tra |
|---|---|---|
| Node.js | từ 20 trở lên | `node -v` |
| PostgreSQL | từ 14 trở lên | `psql --version` |
| Git | bất kỳ | `git --version` |
| VS Code (khuyên dùng) | | Extension: **Prisma**, **Tailwind CSS IntelliSense**, **REST Client**, **ESLint** |

Cài PostgreSQL trên macOS:
```bash
brew install postgresql@16
brew services start postgresql@16
```
Trên Windows: tải bộ cài tại postgresql.org và nhớ mật khẩu của user `postgres` khi cài.

## 2. Cài đặt từng bước

```bash
# Ở thư mục gốc fab-restaurant/
npm run install:all          # cài node_modules cho root, backend, frontend

createdb fab_restaurant      # tạo database (hoặc dùng pgAdmin / DBeaver)

cp backend/.env.example backend/.env
```

Mở `backend/.env` và sửa `DATABASE_URL`:

```
# Mẫu: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:matkhau@localhost:5432/fab_restaurant?schema=public"
```

Mac cài bằng Homebrew thường không cần mật khẩu: `postgresql://<tên-user-máy>@localhost:5432/fab_restaurant`

Đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên. Có thể tạo bằng lệnh:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Tạo bảng và dữ liệu mẫu:
```bash
npm run setup     # = prisma migrate dev + prisma db seed
```

Chạy:
```bash
npm run dev       # chạy đồng thời backend :4000 và frontend :5173
```

Hoặc chạy riêng ở 2 cửa sổ terminal:
```bash
cd backend  && npm run dev
cd frontend && npm run dev
```

## 3. Các lệnh hữu ích

| Lệnh (trong `backend/`) | Ý nghĩa |
|---|---|
| `npm run dev` | Chạy server, tự khởi động lại khi sửa code (nodemon) |
| `npm run db:migrate` | Sau khi sửa `schema.prisma`: tạo migration và cập nhật DB |
| `npm run db:seed` | **Xóa hết dữ liệu** rồi nạp lại dữ liệu mẫu |
| `npm run db:reset` | Xóa DB, chạy lại toàn bộ migration và seed |
| `npm run db:studio` | Mở giao diện web để xem/sửa dữ liệu (http://localhost:5555) |

| Lệnh (trong `frontend/`) | Ý nghĩa |
|---|---|
| `npm run dev` | Dev server có hot reload |
| `npm run build` | Build ra thư mục `dist/` để deploy |
| `npm run lint` | Kiểm tra lỗi code (oxlint) |

## 4. Lỗi thường gặp

| Lỗi | Nguyên nhân / cách sửa |
|---|---|
| `Can't reach database server at localhost:5432` | PostgreSQL chưa chạy → `brew services start postgresql@16` (Mac) hoặc mở Services và start PostgreSQL (Windows) |
| `Authentication failed against database server` | Sai user hoặc mật khẩu trong `DATABASE_URL` |
| `Database "fab_restaurant" does not exist` | Chưa chạy `createdb fab_restaurant` |
| `Thiếu biến môi trường DATABASE_URL` | Chưa tạo file `backend/.env` |
| `@prisma/client did not initialize yet` | Chạy `npx prisma generate` trong `backend/` |
| Frontend báo "Không thể kết nối máy chủ" | Backend chưa chạy, hoặc chạy sai cổng (phải là 4000, khớp với proxy trong `vite.config.js`) |
| `EADDRINUSE :::4000` | Cổng 4000 đang bị chiếm → tắt tiến trình cũ (`lsof -i :4000` rồi `kill <PID>`) hoặc đổi `PORT` |
| Đăng nhập xong vẫn bị đá ra | `JWT_SECRET` vừa bị đổi nên token cũ không còn hợp lệ → đăng nhập lại |

## 5. Deploy (đưa lên Internet)

Gợi ý các dịch vụ có gói miễn phí:

| Phần | Dịch vụ gợi ý |
|---|---|
| Database | Neon.tech, Supabase (PostgreSQL miễn phí) |
| Backend | Render.com, Railway.app |
| Frontend | Vercel, Netlify |

Các bước:
1. Tạo database trên Neon và lấy connection string.
2. Deploy backend lên Render:
   - Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start command: `npm start`
   - Biến môi trường: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN=https://<domain-frontend>`, `NODE_ENV=production`
3. Deploy frontend lên Vercel:
   - Root directory: `frontend`
   - Biến môi trường: `VITE_API_URL=https://<domain-backend>`
   - Thêm file `frontend/vercel.json` để F5 ở mọi đường dẫn không bị lỗi 404:
     ```json
     { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
     ```
4. ⚠️ Ảnh upload đang lưu trong thư mục `backend/uploads/`. Render gói miễn phí sẽ **xóa** thư mục này mỗi lần deploy. Khi chạy thật, nên chuyển sang lưu ảnh trên **Cloudinary** (xem bài tập trong tài liệu 07).
