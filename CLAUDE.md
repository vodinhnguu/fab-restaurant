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
- `mobile/`: app Flutter (go_router + Riverpod 2 viết tay, không codegen), dùng chung API nên giữ API dễ dùng cho Flutter. **App dành cho nhân viên** (từ 20/11/2026), khách không dùng app: phục vụ đăng nhập → chọn bàn, ghi món, gửi bếp (`docs/23-app-nhan-vien-phuc-vu.md`); **quản lý / chủ / tổ trưởng / thu ngân** đăng nhập → vào thẳng nhóm **Quản lý**: doanh thu hôm nay / tháng, đơn đã hủy, bia & nước, tồn hồ (`docs/28-app-quan-ly.md`). Giao diện cũ của app khách: Đặc tả màn hình: `docs/16-dac-ta-app-mobile-stitch.md`; cấu trúc, quy ước, tiến độ: `docs/19-app-mobile.md`. Mỗi màn 1 file `lib/screens/**/sXX_*.dart`. Kiểm tra: `cd mobile && flutter analyze && flutter test`.
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
- Đã có dữ liệu, chỉ cần cập nhật bảng sau khi pull: `npm run dev` tự làm (bước `predev` của backend chạy `backend/scripts/check-db.js`: tự `prisma migrate deploy` + `prisma generate` khi cần, không xóa dữ liệu; database tắt / trống / sai mật khẩu thì in `[db] ✖` kèm cách sửa và không bật backend). Chạy tay: `npm --prefix backend run db:check` hoặc `db:deploy`. Đừng chạy `npm run setup` khi người dùng có dữ liệu thật, hãy hỏi trước.- Thiếu tài khoản nhân viên demo (đăng nhập `bep@fab.vn`... báo sai mật khẩu, thường do database tạo trước khi có ma trận phân quyền): `npm --prefix backend run db:seed-staff`. Chỉ thêm tài khoản còn thiếu, không xóa gì.
- Thiếu loại hải sản trong hồ (trang Tồn hồ trống): `npm --prefix backend run db:seed-tank`. Tạo 6 loại + gắn món bán theo kg, không xóa tồn kho đang có (`docs/27-ton-ho-hai-san.md`).
- Màn Kiểm bia nước trên app trống, hoặc vai trò nào cũng báo 403 (chức năng `DRINKS` là quyền mới): `npm --prefix backend run db:seed-drinks`. Tạo 10 loại đồ uống + quy cách thùng và cấp quyền mặc định (`docs/29-kiem-bia-nuoc.md`).
- Thực đơn còn món cũ (Khai vị, Món Nhật, Tráng miệng...) hoặc thiếu nhóm hải sản (Tôm hùm, Cua, Cá mú...): `npm --prefix backend run db:seed-menu`. Đổi sang thực đơn mới 12 nhóm / 70 món ở `backend/prisma/menu.js` (`docs/24-thuc-don-ban-theo-kg.md`), không xóa đơn hàng, đánh giá; món cũ đã có trong đơn thì ẩn và gom vào nhóm "Ngừng bán (thực đơn cũ)".
- `backend/.env` không có trên git. Thanh toán VNPay cần `VNP_TMN_CODE`, `VNP_HASH_SECRET`; bỏ trống thì web chỉ nhận tiền mặt. Người dùng tự chép khóa này giữa các máy.

## Tài khoản demo (dữ liệu mẫu, không phải tài khoản thật)

Tạo bởi `npm run setup` / `npm run db:seed`. Dùng để đăng nhập thử khi kiểm tra tính năng.

| Vai trò | Email | Mật khẩu | Thấy gì |
|---|---|---|---|
| Admin | `admin@fab.vn` | `admin123` | Toàn bộ trang `/admin` |
| Chủ nhà hàng | `chunha@fab.vn` | `123456` | Ngang Admin: mọi mục, sửa ma trận phân quyền, quản lý tài khoản Admin / Chủ (`isFullAdmin`) |
| Quản lý | `quanly@fab.vn` | `123456` | Admin, chỉ xem nhân sự / phân quyền; vệ sinh: hủy việc, quản lý khu vực; 4 trang kỹ thuật (giao phiếu); Tồn hồ hải sản. Trên app: nhóm **Quản lý** (doanh thu, đơn đã hủy) |
| Tổ trưởng | `totruong@fab.vn` | `123456` | Tổng quan, đơn hàng, đặt bàn, món, đánh giá, xem nhân sự, 4 trang vệ sinh (giao việc), xem thiết bị, nút Báo hỏng |
| Phục vụ | `phucvu@fab.vn` | `123456` | Đơn hàng, đặt bàn (xem), món, khu vực cần dọn (báo cần dọn), nút Báo hỏng. Trên app còn nhập số kg món bán theo kg (cân tại hồ) |
| Lễ tân | `letan@fab.vn` | `123456` | Đặt bàn: tab Hôm nay, xác nhận / hủy, chuyển bàn (`docs/21-le-tan-chuyen-ban.md`); xem đơn hàng, món, mã giảm giá, đánh giá, khu vực cần dọn (báo), nút Báo hỏng |
| Thu ngân | `thungan@fab.vn` | `123456` | Tổng quan, đơn hàng, đặt bàn, món, mã giảm giá. Trên app: nhóm Quản lý + **Kiểm bia nước** (`docs/29-kiem-bia-nuoc.md`) |
| Kỹ thuật | `kythuat@fab.vn` | `123456` | Nhóm Kỹ thuật: Tổng quan, Phiếu sửa chữa, Thiết bị & bảo trì, Lịch sử sửa chữa (`docs/22-ky-thuat-bao-tri.md`) |
| Tạp vụ | `tapvu@fab.vn` | `123456` | Nhóm Vệ sinh: Tổng quan, Nhiệm vụ vệ sinh, Khu vực cần dọn, Lịch sử công việc (`docs/20-ve-sinh.md`). Không dọn bàn (việc của phục vụ). Nút Báo hỏng trên thanh tiêu đề |
| Bếp | `bep@fab.vn` | `123456` | Đơn hàng, món ăn, danh mục, Cân hải sản, khu vực cần dọn (báo), xem thiết bị, nút Báo hỏng |
| Tiếp thực | `tiepthuc@fab.vn` | `123456` | Đơn hàng, đặt bàn (xem), món |
| Hồ hải sản | `hohaisan@fab.vn` | `123456` | Đơn hàng, món, **Tồn hồ hải sản** (nhập hàng, kiểm hồ, hao hụt, `docs/27-ton-ho-hai-san.md`), Cân hải sản (theo dõi + cân lại; số kg do phục vụ nhập tại hồ trên app, `docs/24-thuc-don-ban-theo-kg.md`), xem thiết bị, nút Báo hỏng |
| Nhân viên bar | `bar@fab.vn` | `123456` | **Quầy bia nước** (lấy đồ uống theo đơn, kiểm kho quầy), xem đơn hàng, nút Báo hỏng |
| Khách hàng | `khach@fab.vn` | `123456` | Có sẵn đơn đã hoàn thành `FAB0000DEMO` để thử đánh giá |

Danh sách nhân viên demo nằm ở `backend/prisma/seed-staff.js` (mỗi vai trò 1 tài khoản). Cột "Thấy gì" là quyền **mặc định** (`backend/src/config/permissions.js`). Quyền thật lấy theo ma trận trong DB, admin sửa được trên giao diện nên có thể khác bảng này.

Mã giảm giá mẫu: `WELCOME10`, `FAB50K`, `HAISAN20`.

### Đăng nhập tự động khi kiểm tra

- API: `POST http://localhost:4000/api/v1/auth/login` với `{ "email", "password" }`, lấy `data.token`, gửi kèm header `Authorization: Bearer <token>`.
- Trình duyệt (vd Playwright): vào `/login`, điền `input[type=email]`, `input[type=password]`, bấm `button[type=submit]`. Trang login có sẵn nút điền nhanh từng tài khoản demo.
- Đăng nhập bị giới hạn **20 lần SAI / 15 phút / IP** (lỗi 429), đăng nhập đúng không bị trừ lượt. Lỡ bị chặn thì khởi động lại backend (`touch backend/src/server.js` khi đang `npm run dev`) để xóa bộ đếm.

## Kiểm tra trước khi báo xong

```bash
cd frontend && npx oxlint src && npx vite build   # lint + build frontend
```

- Thay đổi schema Prisma: `npm --prefix backend run db:migrate -- --name <ten>` rồi commit cả thư mục `backend/prisma/migrations/`.
- Dữ liệu thử tạo trong lúc test (đơn, lịch đặt bàn, tài khoản) thì xóa đi sau khi xong.
