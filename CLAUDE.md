# FAB Seafood: hướng dẫn cho AI (Claude Code)

File này được Claude Code tự đọc khi mở dự án. Người dùng là người Việt, đang **học** làm web/app qua dự án này.

## Cách làm việc với người dùng

- Trả lời và viết tài liệu bằng **tiếng Việt**.
- Người dùng mới học: trước khi làm phần lớn, giải thích sẽ làm gì và vì sao, đưa ra đề xuất rồi làm từng bước. Hỏi lựa chọn bằng chat thường.
- Thêm tính năng thì cập nhật tài liệu trong `docs/` (mỗi tính năng lớn 1 file đánh số, vd `docs/13-so-do-ban.md`) và README.
- **Không** thêm dòng `Co-Authored-By: Claude` hay "Generated with Claude Code" vào commit / PR.
- Commit message tiếng Việt, ngắn gọn; người dùng làm một mình nên đẩy thẳng lên `main` khi được yêu cầu.
- Repo GitHub để **public**: không bao giờ commit `.env`, mật khẩu thật, khóa VNPay, JWT secret thật.

## Dự án

- `backend/`: Express 5 + Prisma + PostgreSQL, JavaScript (không TypeScript), API `/api/v1`, JWT Bearer.
- `frontend/`: React + Vite + Tailwind v4, React Query, Zustand.
- App mobile Flutter sẽ làm sau, dùng chung API nên giữ API dễ dùng cho Flutter.
- Bản đồ mã nguồn: `docs/08-ban-do-ma-nguon.md`. Muốn sửa gì ở đâu: `docs/09-muon-sua-gi-thi-sua-o-dau.md`.

## Chạy trên máy mới (vừa clone / pull về)

Cần Node.js 20+ và Docker (hoặc PostgreSQL cài sẵn).

```bash
npm run install:all     # cài thư viện, tự tạo backend/.env từ backend/.env.example
docker compose up -d    # bật PostgreSQL (user/pass postgres/postgres, khớp .env.example)
npm run setup           # tạo bảng + dữ liệu mẫu (XÓA dữ liệu cũ, chỉ chạy lần đầu)
npm run dev             # backend :4000, frontend :5173
```

- Postgres cài sẵn trên máy (không dùng Docker): `createdb fab_restaurant`, sửa `DATABASE_URL` trong `backend/.env` cho đúng user của máy.
- Đã có dữ liệu, chỉ cần cập nhật bảng sau khi pull: `npm --prefix backend run db:deploy` (không xóa dữ liệu). Đừng chạy `npm run setup` khi người dùng có dữ liệu thật, hãy hỏi trước.
- `backend/.env` không có trên git. Thanh toán VNPay cần `VNP_TMN_CODE`, `VNP_HASH_SECRET`; bỏ trống thì web chỉ nhận tiền mặt. Người dùng tự chép khóa này giữa các máy.

## Tài khoản demo (dữ liệu mẫu, không phải tài khoản thật)

Tạo bởi `npm run setup` / `npm run db:seed`. Dùng để đăng nhập thử khi kiểm tra tính năng.

| Vai trò | Email | Mật khẩu | Thấy gì |
|---|---|---|---|
| Admin | `admin@fab.vn` | `admin123` | Toàn bộ trang `/admin` |
| Quản lý | `quanly@fab.vn` | `123456` | Admin, chỉ xem nhân sự / phân quyền |
| Thu ngân | `thungan@fab.vn` | `123456` | Tổng quan, đơn hàng, đặt bàn, món, mã giảm giá |
| Lễ tân | `letan@fab.vn` | `123456` | Đặt bàn (xác nhận / hủy), xem đơn hàng, món, mã giảm giá, đánh giá |
| Bếp | `bep@fab.vn` | `123456` | Đơn hàng, món ăn, danh mục |
| Khách hàng | `khach@fab.vn` | `123456` | Có sẵn đơn đã hoàn thành `FAB0000DEMO` để thử đánh giá |

Mã giảm giá mẫu: `WELCOME10`, `FAB50K`, `HAISAN20`.

### Đăng nhập tự động khi kiểm tra

- API: `POST http://localhost:4000/api/v1/auth/login` với `{ "email", "password" }`, lấy `data.token`, gửi kèm header `Authorization: Bearer <token>`.
- Trình duyệt (vd Playwright): vào `/login`, điền `input[type=email]`, `input[type=password]`, bấm `button[type=submit]`. Trang login có sẵn nút điền nhanh từng tài khoản demo.
- Đăng nhập bị giới hạn **20 lần / 15 phút / IP** (lỗi 429). Khi test nhiều, đăng nhập 1 lần rồi dùng lại token, hoặc khởi động lại backend (`touch backend/src/server.js` khi đang `npm run dev`) để xóa bộ đếm.

## Kiểm tra trước khi báo xong

```bash
cd frontend && npx oxlint src && npx vite build   # lint + build frontend
```

- Thay đổi schema Prisma: `npm --prefix backend run db:migrate -- --name <ten>` rồi commit cả thư mục `backend/prisma/migrations/`.
- Dữ liệu thử tạo trong lúc test (đơn, lịch đặt bàn, tài khoản) thì xóa đi sau khi xong.
