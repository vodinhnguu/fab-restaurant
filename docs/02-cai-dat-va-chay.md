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
| `npm run dev` | Chạy server, tự khởi động lại khi sửa code (nodemon). **Trước khi bật** tự chạy `db:check` (dòng dưới) |
| `npm run db:check` | Kiểm tra database (`scripts/check-db.js`): nối được không, đủ bảng không. Thiếu migration (vd vừa pull code mới) thì **tự cập nhật bảng** (`prisma migrate deploy`, không xóa dữ liệu); `schema.prisma` đổi thì tự `prisma generate`. Hỏng thì in cách sửa và **không bật backend** |
| `npm run db:migrate` | Sau khi sửa `schema.prisma`: tạo migration và cập nhật DB |
| `npm run db:seed` | **Xóa hết dữ liệu** rồi nạp lại dữ liệu mẫu |
| `npm run db:seed-staff` | Thêm tài khoản nhân viên demo còn thiếu (mỗi vai trò 1 tài khoản, mật khẩu `123456`). **Không xóa** gì, chạy nhiều lần không sao |
| `npm run db:seed-menu` | Đổi database đang dùng sang thực đơn mới 12 nhóm / 70 món (ở `prisma/menu.js`, xem [24](24-thuc-don-ban-theo-kg.md)). **Không xóa** đơn hàng, đánh giá: món có trong `menu.js` thì cập nhật / tạo mới, món cũ chưa bán thì xóa, món cũ đã có trong đơn thì ẩn và gom vào nhóm "Ngừng bán (thực đơn cũ)". Chạy lại nhiều lần không sao |
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
| Terminal hiện `[db] ✖ ...` lúc `npm run dev`, web báo "Không thể kết nối máy chủ" | Bước kiểm tra database thấy lỗi nên **không bật backend**. Đọc dòng `[db] ✖` và các gợi ý ngay dưới nó, sửa xong chạy lại `npm run dev` |
| `[db] ✖ Database ... đang TRỐNG` dù trước đó web vẫn chạy | Máy có **2 Postgres cùng cổng 5432** (Postgres cài trên Windows và Postgres trong Docker `fab-restaurant-db-1`), backend nối nhầm vào cái trống. Máy đã dùng Postgres Windows thì tắt cái Docker: `docker stop fab-restaurant-db-1` và `docker update --restart=no fab-restaurant-db-1` (để Docker Desktop không tự bật lại). Đừng chạy `npm run setup` vào database thật |
| `Can't reach database server at localhost:5432` | PostgreSQL chưa chạy → `brew services start postgresql@16` (Mac) hoặc mở Services và start PostgreSQL (Windows) |
| `Authentication failed against database server` | Sai user hoặc mật khẩu trong `DATABASE_URL` |
| `Database "fab_restaurant" does not exist` | Chưa chạy `createdb fab_restaurant` |
| `Thiếu biến môi trường DATABASE_URL` | Chưa tạo file `backend/.env` |
| `@prisma/client did not initialize yet` | Chạy `npx prisma generate` trong `backend/` |
| Frontend báo "Không thể kết nối máy chủ" | Backend chưa chạy, hoặc chạy sai cổng (phải là 4000, khớp với proxy trong `vite.config.js`) |
| `EADDRINUSE :::4000` | Cổng 4000 đang bị chiếm → tắt tiến trình cũ (`lsof -i :4000` rồi `kill <PID>`) hoặc đổi `PORT` |
| Đăng nhập xong vẫn bị đá ra | `JWT_SECRET` vừa bị đổi nên token cũ không còn hợp lệ → đăng nhập lại |
| Tài khoản nhân viên (`bep@fab.vn`, `thungan@fab.vn`, `kythuat@fab.vn`...) báo "Email hoặc mật khẩu không đúng" | Database được seed **trước** khi dự án có ma trận phân quyền, nên chưa có tài khoản nhân viên (pull code mới không tự thêm dữ liệu). Chạy `npm --prefix backend run db:seed-staff` để thêm tài khoản còn thiếu, không mất dữ liệu cũ |
| Thực đơn vẫn là món cũ (Khai vị, Món Nhật, Tráng miệng...), không có nhóm Tôm hùm, Cua, Cá mú | Database được seed trước khi đổi thực đơn (pull code mới không tự đổi dữ liệu). Chạy `npm --prefix backend run db:seed-menu`, không mất đơn hàng cũ |
| "Bạn thao tác quá nhiều lần" khi đăng nhập | Sai mật khẩu quá 20 lần trong 15 phút (đăng nhập đúng không tính). Đợi 15 phút, hoặc lưu lại 1 file bất kỳ trong `backend/src/` để nodemon khởi động lại backend (bộ đếm bị xóa) |
| Nhân viên đăng nhập được nhưng `/admin` báo "Chưa có trang cho công việc của bạn" | Vai trò đó không có quyền nào ứng với một mục trên menu, vd vai trò tự tạo chỉ có quyền Xem "Hồ hải sản & nhập hàng" (mục **Cân hải sản** chỉ hiện cho người có quyền Sửa). Muốn họ thấy thêm mục nào thì admin cấp quyền ở trang Phân quyền |

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
