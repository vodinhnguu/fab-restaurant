# 17. Tư liệu để viết báo cáo dự án FAB Seafood

Tài liệu này gom **mọi thông tin cần để viết một bản báo cáo đồ án** về dự án, sắp theo bố cục báo cáo hay dùng: Mở đầu → Chương 1 (tổng quan, cơ sở lý thuyết) → Chương 2 (phân tích, thiết kế) → Chương 3 (cài đặt, kết quả, kiểm thử) → Kết luận → Phụ lục.

- Mọi số liệu, quy tắc, sơ đồ đều lấy từ **code thật** (commit `801bacc`, ngày 27/10/2026), không lấy từ tài liệu cũ.
- Chỗ ghi **[Tự điền]** là thông tin chỉ bạn biết: tên trường, giảng viên, ảnh chụp, kết quả chạy thử...
- Các sơ đồ viết bằng Mermaid. Muốn chèn vào Word: dán code sơ đồ vào https://mermaid.live rồi tải PNG/SVG.

## Mục lục

0. [Cách dùng tài liệu này](#0-cách-dùng-tài-liệu-này)
1. [Thông tin chung và số liệu nhanh](#1-thông-tin-chung-và-số-liệu-nhanh)
2. [Mở đầu](#2-mở-đầu)
3. [Chương 1: Tổng quan và cơ sở lý thuyết](#3-chương-1-tổng-quan-và-cơ-sở-lý-thuyết)
4. [Chương 2: Phân tích và thiết kế hệ thống](#4-chương-2-phân-tích-và-thiết-kế-hệ-thống)
5. [Chương 3: Cài đặt, kết quả và kiểm thử](#5-chương-3-cài-đặt-kết-quả-và-kiểm-thử)
6. [Bảo mật](#6-bảo-mật)
7. [Kết luận và hướng phát triển](#7-kết-luận-và-hướng-phát-triển)
8. [Tài liệu tham khảo](#8-tài-liệu-tham-khảo)
9. [Phụ lục](#9-phụ-lục)

---

## 0. Cách dùng tài liệu này

| Phần trong tài liệu này | Đưa vào phần nào của báo cáo |
|---|---|
| 1. Thông tin chung | Trang bìa, tóm tắt, mở đầu |
| 2. Mở đầu | Lý do chọn đề tài, mục tiêu, phạm vi, phương pháp, tiến độ |
| 3. Chương 1 | Khảo sát bài toán, công nghệ sử dụng, cơ sở lý thuyết |
| 4. Chương 2 | Tác nhân, yêu cầu, use case, quy tắc nghiệp vụ, sơ đồ trạng thái / tuần tự, kiến trúc, CSDL, API, phân quyền, giao diện |
| 5. Chương 3 | Môi trường, cấu trúc code, kỹ thuật nổi bật, ảnh màn hình, kiểm thử, triển khai |
| 6. Bảo mật | Có thể để thành 1 mục riêng trong Chương 2 hoặc Chương 3 |
| 7. Kết luận | Kết quả đạt được, hạn chế, hướng phát triển |
| 8. Tài liệu tham khảo | Danh mục tài liệu tham khảo |
| 9. Phụ lục | Câu hỏi bảo vệ, kịch bản demo, thuật ngữ |

**Việc bạn phải tự làm:**
- Chụp ảnh màn hình theo danh sách ở [mục 5.4](#54-kết-quả-các-màn-hình-đã-làm-ảnh-cần-chụp).
- Chạy các ca kiểm thử ở [mục 5.6](#56-kiểm-thử) rồi ghi kết quả thật vào cột "Kết quả".
- Điền thông tin trường, lớp, giảng viên, ngày bảo vệ.

---

## 1. Thông tin chung và số liệu nhanh

| Mục | Nội dung |
|---|---|
| Tên đề tài (gợi ý) | Xây dựng website đặt món và đặt bàn cho nhà hàng hải sản FAB Seafood |
| Tên sản phẩm | FAB Seafood |
| Loại sản phẩm | Ứng dụng web (SPA) + REST API dùng chung; app mobile Flutter dự kiến làm sau |
| Người thực hiện | [Tự điền] (làm một mình) |
| Giảng viên hướng dẫn | [Tự điền] |
| Thời gian thực hiện | 01/10/2026 đến 27/10/2026 (14 commit trên GitHub) |
| Mã nguồn | Repo GitHub công khai [Tự điền link] |
| Bối cảnh giả định | Nhà hàng hải sản ở Đà Nẵng (địa chỉ mẫu: 123 Võ Nguyên Giáp, Sơn Trà), mở cửa 10:00 đến 22:00, 3 khu vực ăn |

**Số liệu đo trên code (dùng cho phần tóm tắt / kết quả):**

| Hạng mục | Số lượng |
|---|---|
| Backend (`backend/src`) | 52 file JavaScript, khoảng 2.300 dòng |
| Schema + dữ liệu mẫu (`backend/prisma`) | khoảng 560 dòng, 7 lần migration |
| Frontend (`frontend/src`) | 60 file, khoảng 5.000 dòng |
| Tài liệu (`docs/`) | 16 file Markdown, khoảng 4.700 dòng (chưa tính file này) |
| Bảng dữ liệu | 12 bảng, 8 kiểu liệt kê (enum) |
| API | 54 endpoint: 12 module + 2 route chung (`/health`, `/info`) |
| Trang giao diện | 24 trang: 12 trang khách, 3 trang tài khoản, 9 trang quản trị |
| Phân quyền | 3 loại tài khoản, 12 vai trò nhân viên × 11 chức năng × 4 quyền (Xem / Thêm / Sửa / Xóa) |
| Sơ đồ bàn | 23 bàn ở 3 khu vực (Trong nhà 12, Ngoài trời view biển 8, Phòng VIP 3) |
| Dữ liệu mẫu | 8 danh mục, 26 món, 81 đơn hàng, 3 mã giảm giá, 4 lịch đặt bàn, 8 tài khoản |

---

## 2. Mở đầu

### 2.1 Lý do chọn đề tài (ý để viết)

- Khách hàng ngày càng quen đặt đồ ăn và đặt bàn qua mạng thay vì gọi điện.
- Nhà hàng nhỏ khi bán qua các ứng dụng giao đồ ăn trung gian phải trả phí hoa hồng; có website riêng thì chủ động khách hàng, giá và khuyến mãi.
- Đặt bàn qua điện thoại dễ nhầm giờ, trùng bàn, khó biết bàn nào còn trống ở từng khung giờ.
- Hải sản tươi sống hết hàng theo ngày, cần bật / tắt món nhanh để khách không đặt món đã hết.
- Nhà hàng có nhiều bộ phận (lễ tân, thu ngân, bếp, phục vụ...), mỗi bộ phận chỉ nên thấy và làm đúng phần việc của mình.
- Thanh toán online (VNPay, QR ngân hàng) đã phổ biến ở Việt Nam.
- Về mặt học tập: đề tài đi qua đủ các phần của một ứng dụng thật: giao diện, API, cơ sở dữ liệu, xác thực, phân quyền, thanh toán, xử lý đồng thời.

### 2.2 Mục tiêu

1. Xây dựng website cho khách: xem thực đơn, đặt món (giao tận nơi hoặc đến lấy), áp mã giảm giá, thanh toán tiền mặt hoặc VNPay, theo dõi đơn, đặt bàn có chọn bàn trên sơ đồ, đánh giá món.
2. Xây dựng trang quản trị: thống kê doanh thu, xử lý đơn hàng và lịch đặt bàn, quản lý món, danh mục, mã giảm giá, đánh giá, tài khoản nhân viên.
3. Phân quyền chi tiết theo bộ phận (ma trận vai trò × chức năng) và chặn quyền ở cả backend lẫn giao diện.
4. Thiết kế API REST dùng chung để sau này làm app mobile Flutter không phải viết lại backend.
5. Đảm bảo an toàn và đúng dữ liệu: tính tiền ở server, transaction, chống đặt trùng bàn, chống dùng lố lượt mã giảm giá, kiểm tra chữ ký thanh toán.

### 2.3 Đối tượng và phạm vi

**Đối tượng sử dụng:** khách vãng lai, khách hàng có tài khoản, nhân viên nhà hàng (theo vai trò), quản trị viên.

**Trong phạm vi:**
- Website khách hàng và trang quản trị chạy trên trình duyệt, giao diện co giãn được trên điện thoại (responsive).
- Một nhà hàng (một chi nhánh).
- Thanh toán VNPay ở môi trường thử nghiệm (sandbox).

**Ngoài phạm vi (chưa làm):**
- App mobile (mới có đặc tả 25 màn hình ở [docs/16](16-dac-ta-app-mobile-stitch.md)).
- Gọi món tại bàn (POS), màn hình bếp, quản lý kho / hồ hải sản, chấm công.
- Nhiều chi nhánh, giao hàng có theo dõi vị trí shipper.
- Nhận tiền thật qua VNPay (cần ký hợp đồng với VNPay).

### 2.4 Phương pháp thực hiện

- **Khảo sát:** tìm hiểu quy trình đặt món, đặt bàn, các bộ phận trong nhà hàng hải sản; tham khảo website các nhà hàng. [Tự điền thêm nếu có khảo sát thật]
- **Phát triển tăng dần (incremental):** làm bản lõi trước (thực đơn, giỏ hàng, đặt món, đặt bàn, admin), sau đó mỗi đợt thêm một tính năng lớn (VNPay, phân quyền, sơ đồ bàn, lý do hủy, ghi chú món).
- **Quản lý mã nguồn:** Git + GitHub, mỗi tính năng một commit, có migration cho mỗi lần đổi cấu trúc dữ liệu.
- **Kiểm thử:** kiểm thử thủ công theo kịch bản, kiểm tra lint + build frontend trước mỗi lần hoàn thành.
- **Tài liệu hóa:** mỗi tính năng lớn có một file tài liệu riêng trong `docs/`.

### 2.5 Tiến độ thực hiện (lấy từ lịch sử Git)

| Ngày | Công việc |
|---|---|
| 01/10/2026 | Khởi tạo dự án: backend Express + Prisma, frontend React, các chức năng lõi (thực đơn, giỏ hàng, đặt món, mã giảm giá, đặt bàn, đánh giá, trang quản trị) |
| 07/10/2026 | Backend: thêm giới hạn số lần gọi (rate limit), sửa múi giờ thống kê, chặn hủy lịch đã qua. Frontend: trang chi tiết đặt bàn, tra cứu 2 tab (đơn hàng / đặt bàn), tiêu đề tab trình duyệt. Viết bản đồ mã nguồn, sổ tay |
| 09/10/2026 | Thêm thanh toán VNPay; tự tạo `.env`, thêm `docker-compose.yml` để clone về chạy ngay |
| 13/10/2026 | Ma trận phân quyền 12 vai trò × 11 chức năng; quản lý tài khoản nhân viên; sơ đồ bàn |
| 22/10/2026 | Lý do hủy đặt bàn; ghi chú khẩu vị cho từng món; tài liệu đi kèm |
| 27/10/2026 | Đặc tả app mobile (25 màn hình) để chuẩn bị làm Flutter |

### 2.6 Bố cục báo cáo gợi ý

- Mở đầu
- Chương 1: Tổng quan đề tài và cơ sở lý thuyết
- Chương 2: Phân tích và thiết kế hệ thống
- Chương 3: Cài đặt, kết quả và kiểm thử
- Kết luận và hướng phát triển
- Tài liệu tham khảo, Phụ lục

---

## 3. Chương 1: Tổng quan và cơ sở lý thuyết

### 3.1 Khảo sát bài toán

**Quy trình nghiệp vụ mà hệ thống phục vụ** (chỉnh lại theo khảo sát của bạn):

1. **Bán mang đi / giao tận nơi:** khách chọn món → nhà hàng xác nhận đơn → bếp chế biến → giao hàng (hoặc khách đến lấy) → hoàn thành, thu tiền.
2. **Đặt bàn:** khách chọn ngày giờ, số khách, khu vực, có thể chọn bàn → lễ tân gọi xác nhận → khách đến (đánh dấu "đã đến") hoặc nhà hàng hủy kèm lý do.
3. **Quản lý thực đơn:** món có giá gốc, giá khuyến mãi, đơn vị (phần, đĩa, kg, con, mâm...), bật / tắt khi hết hàng.
4. **Khuyến mãi:** mã giảm theo % hoặc số tiền, có đơn tối thiểu, giảm tối đa, số lượt, thời gian hiệu lực.
5. **Nhân sự:** mỗi bộ phận có quyền riêng.

**Các bộ phận trong nhà hàng** (12 vai trò tạo sẵn, `backend/src/config/permissions.js`):

| Vai trò | Công việc chính |
|---|---|
| Chủ nhà hàng | Toàn quyền, xem mọi báo cáo và quyết định cuối cùng |
| Admin | Quản trị hệ thống, tài khoản và cấu hình website |
| Quản lý | Điều hành ca, xử lý khiếu nại, duyệt thực đơn và khuyến mãi |
| Tổ trưởng | Phân công nhân viên trong ca, giám sát phục vụ tại khu vực |
| Nhân viên phục vụ | Đón khách tại bàn, ghi món, tư vấn hải sản trong hồ |
| Lễ tân | Nghe điện thoại, nhận đặt bàn, đón và xếp chỗ cho khách |
| Thu ngân | Tính tiền, áp mã giảm giá, in hóa đơn, chốt tiền cuối ca |
| Nhân viên kỹ thuật | Bảo trì điện nước, máy lạnh, hệ thống lọc và sục khí hồ |
| Tạp vụ | Vệ sinh khu vực ăn uống, nhà vệ sinh, dọn bàn |
| Bếp | Sơ chế và chế biến món, báo món hết nguyên liệu |
| Nhân viên tiếp thực | Nhận món từ bếp, mang ra đúng bàn |
| Nhân viên hồ hải sản | Chăm sóc hồ, vớt và cân hải sản, nhập hàng |

### 3.2 Công nghệ sử dụng

Phiên bản lấy theo `package.json` (dấu `^` nghĩa là bản này hoặc mới hơn trong cùng phiên bản chính).

**Frontend (`frontend/package.json`):**

| Công nghệ | Phiên bản | Dùng để | Lý do chọn |
|---|---|---|---|
| React | 19.2 | Xây dựng giao diện theo component | Phổ biến nhất, cộng đồng lớn |
| Vite | 8.3 | Dev server và đóng gói (build) | Khởi động nhanh, thay Create React App đã ngừng phát triển |
| Tailwind CSS | 4.3 | Viết style bằng class ngay trong JSX | Giao diện đồng bộ, cấu hình màu / font bằng CSS (`@theme`) |
| React Router | 7.18 | Điều hướng giữa các trang (SPA) | Chuẩn phổ biến cho React |
| TanStack Query (React Query) | 5.104 | Gọi API, cache, loading, tự tải lại | Không phải tự viết `useEffect` + `useState` cho mỗi API |
| Zustand | 5.0 | Lưu giỏ hàng, thông tin đăng nhập | Gọn hơn Redux, có sẵn `persist` lưu vào localStorage |
| React Hook Form | 7.89 | Form và kiểm tra dữ liệu nhập | Ít render lại, khai báo luật kiểm tra ngắn |
| Axios | 1.20 | Gửi request HTTP | Có interceptor để tự gắn token và chuẩn hóa lỗi |
| Recharts | 3.10 | Biểu đồ doanh thu, món bán chạy | Viết biểu đồ bằng component React |
| Day.js | 1.11 | Định dạng ngày giờ tiếng Việt | Nhẹ |
| lucide-react, sonner, clsx, tailwind-merge | | Icon, thông báo nổi (toast), gộp class | |
| Oxlint | 1.81 | Kiểm tra lỗi code (lint) | Rất nhanh |

**Backend (`backend/package.json`):**

| Công nghệ | Phiên bản | Dùng để | Lý do chọn |
|---|---|---|---|
| Node.js | 20 trở lên | Môi trường chạy JavaScript phía server | Dùng chung ngôn ngữ với frontend |
| Express | 5.2 | Web framework, định tuyến API | Đơn giản; bản 5 tự bắt lỗi của hàm async |
| Prisma | 6.19 | ORM: truy vấn DB bằng JavaScript, migration | Gợi ý code tốt, chống SQL injection, quản lý thay đổi cấu trúc DB |
| PostgreSQL | 16 (Docker) | Cơ sở dữ liệu quan hệ | Mạnh, miễn phí, hỗ trợ transaction và mức cô lập Serializable |
| Zod | 4.6 | Kiểm tra dữ liệu đầu vào | Khai báo schema ngắn, thông báo lỗi tiếng Việt |
| jsonwebtoken | 9.0 | Tạo và kiểm tra JWT | Xác thực không cần session, hợp cả web lẫn mobile |
| bcryptjs | 3.0 | Băm mật khẩu | Chuẩn phổ biến để lưu mật khẩu |
| helmet | 8.3 | Thêm header bảo mật HTTP | |
| cors | 2.8 | Chỉ cho phép frontend được khai báo gọi API | |
| multer | 2.4 | Nhận file ảnh upload | |
| morgan, dotenv, nodemon | | Ghi log request, đọc `.env`, tự khởi động lại khi sửa code | |

**Công cụ khác:** Git / GitHub, Docker Compose (chạy PostgreSQL), VS Code + REST Client (`docs/api.http`), Prisma Studio (xem dữ liệu), cổng thanh toán VNPay sandbox.

### 3.3 Cơ sở lý thuyết cần trình bày

Mỗi mục dưới đây là một tiểu mục lý thuyết, kèm chỗ áp dụng trong dự án để bạn liên hệ.

| Lý thuyết | Nói ngắn gọn | Áp dụng trong dự án |
|---|---|---|
| Mô hình client - server | Client (trình duyệt, app) gửi request, server xử lý và trả kết quả | Website React gọi API Express qua HTTP + JSON |
| REST API | Tài nguyên được định danh bằng URL, thao tác bằng phương thức HTTP (GET, POST, PUT, PATCH, DELETE), trả mã trạng thái (200, 201, 400, 401, 403, 404, 409, 429, 500) | 54 endpoint dưới `/api/v1`, một định dạng phản hồi chung |
| SPA (Single Page Application) | Tải trang một lần, chuyển trang bằng JavaScript, không tải lại toàn trang | React Router, tải trễ (lazy load) từng trang |
| JWT (JSON Web Token) | Chuỗi gồm header.payload.chữ ký, server ký bằng khóa bí mật; client gửi kèm mỗi request trong header `Authorization: Bearer` | Payload `{ sub: id, role }`, hết hạn sau 7 ngày |
| Băm mật khẩu bcrypt | Hàm băm một chiều có muối (salt) và hệ số chi phí; không thể giải ngược | Lưu `passwordHash`, cost = 10 |
| ORM và migration | Ánh xạ bảng thành đối tượng; migration là lịch sử các lần đổi cấu trúc DB, chạy lại được trên máy khác | Prisma, 7 migration trong `backend/prisma/migrations/` |
| Transaction, ACID | Nhiều thao tác hoặc thành công hết, hoặc hoàn tác hết | Tạo đơn (lấy giá, trừ lượt mã, tạo đơn, tăng số đã bán), hủy đơn, ghi nhận thanh toán |
| Mức cô lập Serializable | Các transaction chạy đồng thời cho kết quả như chạy lần lượt; nếu xung đột thì một bên bị hủy | Đặt bàn có chọn bàn: 2 người không giữ được cùng 1 bàn |
| Máy trạng thái (state machine) | Đối tượng chỉ được chuyển giữa các trạng thái theo những bước cho phép | Trạng thái đơn hàng, lịch đặt bàn, giao dịch thanh toán |
| Chữ ký HMAC-SHA512 | Mã xác thực tạo từ dữ liệu + khóa bí mật chung; ai không có khóa thì không tạo được chữ ký đúng | Tạo link VNPay và kiểm tra kết quả VNPay gửi về |
| Phân quyền theo vai trò (RBAC) | Quyền gán cho vai trò, người dùng nhận quyền qua vai trò | Ma trận 12 vai trò × 11 chức năng × 4 quyền |
| Giới hạn tần suất (rate limiting) | Giới hạn số request của một IP trong một khoảng thời gian | Chống dò mật khẩu, dò SĐT, spam đơn ảo (lỗi 429) |
| CORS | Trình duyệt chỉ cho trang web gọi API khác tên miền nếu server cho phép | Chỉ cho phép `CORS_ORIGIN` |
| Kiểm tra dữ liệu hai lớp | Frontend kiểm tra để báo lỗi nhanh; backend kiểm tra để bảo mật | React Hook Form + Zod |
| Cache phía client | Lưu tạm dữ liệu đã tải, tránh gọi API trùng | React Query: dữ liệu "mới" trong 30 giây |
| Polling | Client hỏi lại server theo chu kỳ để cập nhật | Trang đơn hàng tự cập nhật 15 giây / lần |
| Phi chuẩn hóa (denormalization) | Lưu sẵn giá trị tổng hợp để đọc nhanh | `Dish.soldCount`, `ratingAvg`, `ratingCount` |

---

## 4. Chương 2: Phân tích và thiết kế hệ thống

### 4.1 Tác nhân (actor)

| Tác nhân | Mô tả |
|---|---|
| Khách vãng lai | Không đăng nhập. Xem thực đơn, đặt món, đặt bàn, thanh toán, tra cứu và hủy bằng mã + số điện thoại |
| Khách hàng (CUSTOMER) | Có tài khoản. Thêm: lịch sử đơn và đặt bàn, hồ sơ, đổi mật khẩu, đánh giá món đã nhận |
| Nhân viên (STAFF) | Đăng nhập trang quản trị, thấy và làm được gì tùy vai trò được gán |
| Quản trị viên (ADMIN) | Toàn quyền, là người duy nhất sửa được ma trận phân quyền và tạo tài khoản ADMIN |
| Cổng VNPay | Hệ thống bên ngoài: nhận khách sang thanh toán, gọi IPN báo kết quả về backend |

### 4.2 Yêu cầu chức năng

**Phía khách hàng:**

| Mã | Chức năng | Mô tả |
|---|---|---|
| KH01 | Xem trang chủ | Banner, danh mục, món nổi bật, mã giảm giá đang có, giới thiệu, cảm nhận khách, bản đồ |
| KH02 | Xem thực đơn | Lọc theo danh mục, tìm theo tên (chờ ngừng gõ 400ms mới tìm), sắp xếp (bán chạy, mới nhất, đánh giá cao, giá tăng / giảm), phân trang 12 món; bộ lọc lưu trên URL |
| KH03 | Xem chi tiết món | Ảnh, giá gốc / giá khuyến mãi, đơn vị, mô tả, điểm đánh giá, số đã bán, 20 đánh giá mới nhất, 4 món cùng danh mục |
| KH04 | Quản lý giỏ hàng | Thêm, đổi số lượng (tối đa 50 / món), xóa; giỏ dạng ngăn kéo trượt, lưu ở trình duyệt nên tải lại trang không mất |
| KH05 | Ghi chú khẩu vị từng món | Bấm vào món trong giỏ / trang thanh toán để ghi chú (tối đa 200 ký tự), có nút gợi ý theo loại món (Tôm: ít cay, bóc vỏ sẵn...; Đồ uống: ít đá...) |
| KH06 | Đặt món | Chọn giao tận nơi / đến lấy, nhập người nhận, ghi chú đơn, mã giảm giá, chọn tiền mặt / VNPay. Không cần tài khoản |
| KH07 | Áp mã giảm giá | Nhập mã hoặc bấm mã gợi ý; kiểm tra điều kiện và báo số tiền giảm trước khi đặt |
| KH08 | Thanh toán VNPay | Chuyển sang trang VNPay, quay về trang kết quả; thanh toán lại được nếu lần trước thất bại |
| KH09 | Theo dõi đơn | Dòng thời gian trạng thái, tự cập nhật 15 giây / lần, chi tiết món kèm ghi chú |
| KH10 | Hủy đơn | Khách tự hủy khi đơn còn "Chờ xác nhận" và chưa trả tiền online |
| KH11 | Tra cứu | Tra cứu đơn hàng hoặc lịch đặt bàn bằng mã + số điện thoại |
| KH12 | Đặt bàn | Chọn ngày, khung giờ 30 phút / lần, số khách (1 đến 50), khu vực; có thể chọn bàn trên sơ đồ |
| KH13 | Xem sơ đồ bàn | Màu bàn theo trạng thái tại đúng giờ đã chọn: trống, chờ xác nhận, có khách, không đủ ghế, tạm ngưng; tự tải lại 30 giây / lần |
| KH14 | Hủy đặt bàn | Hủy khi lịch còn "Chờ xác nhận" / "Đã xác nhận" và chưa tới giờ |
| KH15 | Xem lý do hủy và đặt lại | Lịch bị nhà hàng hủy hiện lý do + nút "Đặt lại ngày/giờ khác", form điền sẵn thông tin cũ |
| KH16 | Đăng ký, đăng nhập, đăng xuất | |
| KH17 | Quản lý tài khoản | Sửa họ tên, SĐT, địa chỉ mặc định; đổi mật khẩu; xem lịch sử đơn (phân trang), lịch đặt bàn |
| KH18 | Đánh giá món | 1 đến 5 sao + bình luận; chỉ khi đã nhận món (đơn hoàn thành); mỗi người 1 đánh giá / món, đánh giá lại thì cập nhật |

**Phía quản trị** (mỗi chức năng cần quyền tương ứng, xem [mục 4.12](#412-thiết-kế-phân-quyền)):

| Mã | Chức năng | Mô tả |
|---|---|---|
| QT01 | Tổng quan | Doanh thu (chỉ đơn hoàn thành), tổng đơn, đơn chờ xác nhận, đặt bàn hôm nay, số khách hàng; biểu đồ doanh thu theo ngày; top 5 món bán chạy; đơn theo trạng thái; 6 đơn mới nhất; chọn 7 / 30 / 90 ngày |
| QT02 | Quản lý đơn hàng | Tab theo trạng thái kèm số lượng, tìm theo mã / tên / SĐT, phân trang, xem chi tiết (món, ghi chú món, lịch sử thanh toán VNPay), chuyển trạng thái đúng quy trình, tự làm mới 30 giây / lần |
| QT03 | Quản lý đặt bàn | Hai chế độ: danh sách (lọc theo ngày, trạng thái, tìm kiếm) và sơ đồ bàn theo ngày giờ (bấm bàn xem khách); xác nhận, đánh dấu khách đã đến, hủy bắt buộc kèm lý do |
| QT04 | Quản lý món ăn | Thêm / sửa / xóa, upload ảnh hoặc dán link, bật / tắt "đang bán" bằng công tắc, đánh dấu món nổi bật |
| QT05 | Quản lý danh mục | Thêm / sửa / xóa, ảnh, thứ tự hiển thị |
| QT06 | Quản lý mã giảm giá | Thêm / sửa / xóa, xem đã dùng bao nhiêu lượt, trạng thái (hoạt động, tắt, hết hạn, hết lượt) |
| QT07 | Kiểm duyệt đánh giá | Xem, xóa đánh giá (điểm trung bình của món tự tính lại) |
| QT08 | Quản lý người dùng | Tìm, lọc theo loại tài khoản và bộ phận; tạo tài khoản nhân viên (mật khẩu ngẫu nhiên, hiện một lần để sao chép); đổi loại tài khoản, gán vai trò, khóa / mở khóa, đặt lại mật khẩu |
| QT09 | Ma trận phân quyền | Xem theo từng vai trò hoặc toàn bộ ma trận; ADMIN thêm / sửa / xóa vai trò và tích quyền theo ô, theo hàng, theo cột |

### 4.3 Yêu cầu phi chức năng

| Nhóm | Yêu cầu | Cách đáp ứng |
|---|---|---|
| Bảo mật | Mật khẩu không lưu dạng gốc; chặn truy cập trái phép; chống sửa giá | bcrypt, JWT, phân quyền ở backend, giá lấy từ DB (xem [mục 6](#6-bảo-mật)) |
| Toàn vẹn dữ liệu | Không đặt trùng bàn, không dùng lố lượt mã, không ghi nhận thanh toán 2 lần | Transaction, mức Serializable, câu UPDATE có điều kiện |
| Tương thích thiết bị | Dùng được trên điện thoại và máy tính | Tailwind responsive, menu thu gọn trên mobile |
| Hiệu năng | Trang chủ tải nhanh, không gọi API trùng | Tải trễ từng trang, cache React Query, index DB, ảnh `loading="lazy"` |
| Dễ dùng | Đặt món không cần tài khoản, giỏ không mất khi tải lại, thông báo lỗi tiếng Việt | Đơn có `userId` tùy chọn, Zustand persist, thông báo lỗi từ backend |
| Mở rộng | Dùng lại API cho app mobile | REST, một định dạng phản hồi, JWT Bearer |
| Bảo trì | Dễ tìm code, dễ thêm chức năng | Backend chia theo module, tài liệu `docs/08`, `docs/09` |
| Múi giờ | Ngày giờ đúng giờ Việt Nam kể cả khi server chạy giờ UTC | Tính theo `Asia/Ho_Chi_Minh` / UTC+7 ở mọi chỗ liên quan ngày |

### 4.4 Sơ đồ use case tổng quát

```mermaid
flowchart LR
    KV([Khách vãng lai])
    KH([Khách hàng])
    NV([Nhân viên])
    AD([Quản trị viên])
    VNP([Cổng VNPay])

    subgraph HT[Hệ thống FAB Seafood]
      U1((Xem thực đơn))
      U2((Quản lý giỏ hàng))
      U3((Đặt món))
      U4((Thanh toán VNPay))
      U5((Theo dõi / hủy đơn))
      U6((Đặt bàn, chọn bàn))
      U7((Tra cứu bằng mã + SĐT))
      U8((Đăng ký / đăng nhập))
      U9((Quản lý tài khoản))
      U10((Đánh giá món))
      A1((Xem thống kê))
      A2((Xử lý đơn hàng))
      A3((Xử lý đặt bàn))
      A4((Quản lý thực đơn))
      A5((Quản lý mã giảm giá))
      A6((Kiểm duyệt đánh giá))
      A7((Quản lý nhân viên))
      A8((Sửa ma trận phân quyền))
    end

    KV --- U1 & U2 & U3 & U5 & U6 & U7 & U8
    KH --- U9 & U10
    KH -. kế thừa .-> KV
    U3 -. mở rộng .-> U4
    U4 --- VNP
    NV --- A1 & A2 & A3 & A4 & A5 & A6 & A7
    AD -. kế thừa .-> NV
    AD --- A8
```

Ghi chú: nhân viên chỉ dùng được những use case mà vai trò của họ có quyền Xem; quyền Thêm / Sửa / Xóa quyết định họ thao tác được gì trong đó.

### 4.5 Đặc tả các use case chính

#### UC01: Đặt món

| Mục | Nội dung |
|---|---|
| Tác nhân | Khách vãng lai, khách hàng |
| Điều kiện trước | Giỏ hàng có ít nhất 1 món |
| Luồng chính | 1. Khách mở trang Thanh toán. 2. Chọn hình thức nhận (giao tận nơi / đến lấy). 3. Nhập họ tên, SĐT, địa chỉ (nếu giao), ghi chú. Đã đăng nhập thì điền sẵn từ hồ sơ. 4. (Tùy chọn) nhập mã giảm giá, bấm Áp dụng. 5. Chọn tiền mặt hoặc VNPay. 6. Bấm Đặt hàng. 7. Hệ thống tính lại tiền từ giá trong DB, tạo đơn mã `FAB...`, xóa giỏ, chuyển sang trang chi tiết đơn |
| Luồng rẽ nhánh | 4a. Mã không hợp lệ / hết hạn / chưa đủ đơn tối thiểu / hết lượt: báo lỗi, không áp dụng. 5a. Nhà hàng chưa cấu hình VNPay: ô VNPay bị mờ. 6a. Thiếu địa chỉ khi giao tận nơi: báo "Vui lòng nhập địa chỉ giao hàng". 7a. Có món vừa hết: báo "Món ... hiện đã hết". 7b. Chọn VNPay: chuyển sang UC02 |
| Điều kiện sau | Đơn ở trạng thái Chờ xác nhận, số đã bán của món tăng, lượt dùng mã tăng 1 |

#### UC02: Thanh toán qua VNPay

| Mục | Nội dung |
|---|---|
| Tác nhân | Khách, cổng VNPay |
| Điều kiện trước | Đơn chọn ONLINE, chưa thanh toán, chưa hủy, tổng tiền từ 5.000đ |
| Luồng chính | 1. Frontend xin link thanh toán. 2. Backend tạo 1 dòng `Payment` (PENDING) với mã giao dịch mới, ký link bằng HMAC-SHA512, link hết hạn sau 15 phút. 3. Khách sang trang VNPay, nhập thẻ / quét QR. 4. VNPay gọi IPN về backend; backend kiểm tra chữ ký, số tiền, ghi nhận SUCCESS và đổi đơn sang Đã thanh toán. 5. VNPay đưa khách về `/payment/vnpay-return`; trang này gửi nguyên dữ liệu lên backend kiểm tra chữ ký rồi hiện kết quả |
| Luồng rẽ nhánh | 3a. Khách hủy / thẻ lỗi: Payment FAILED, hiện lý do theo mã lỗi, nút "Xem đơn & thanh toán lại" (lần sau là giao dịch mới). 4a. Sai chữ ký: từ chối (mã 97). 4b. Số tiền không khớp: từ chối (mã 04). 4c. IPN và trang trả về đến cùng lúc: chỉ một bên ghi nhận, bên kia thấy "đã xử lý" |
| Điều kiện sau | `Payment.status = SUCCESS`, `Order.paymentStatus = PAID` |

#### UC03: Đặt bàn có chọn bàn

| Mục | Nội dung |
|---|---|
| Tác nhân | Khách vãng lai, khách hàng |
| Luồng chính | 1. Khách nhập tên, SĐT, email (không bắt buộc), ngày, giờ, số khách. 2. Chọn khu vực, hệ thống hiện sơ đồ bàn của khu vực tại đúng thời điểm đó. 3. Khách bấm một bàn trống đủ ghế (không bắt buộc). 4. Bấm Xác nhận đặt bàn. 5. Hệ thống kiểm tra trong 1 transaction Serializable: bàn đang phục vụ, đủ ghế, không có lịch khác trong vòng ±120 phút; tạo lịch mã `RSV...`. 6. Hiện mã đặt bàn để tra cứu |
| Luồng rẽ nhánh | 1a. Giờ ngoài 10:00 đến 21:00, hoặc đặt trước chưa tới 30 phút: báo lỗi. 3a. Đổi giờ / số khách làm bàn đã chọn không còn hợp: tự bỏ chọn. 5a. Có người vừa đặt bàn đó: báo "Bàn vừa có người khác đặt", tự tải lại sơ đồ. 3b. Không chọn bàn: nhà hàng tự xếp |
| Điều kiện sau | Lịch ở trạng thái Chờ xác nhận, bàn hiện màu vàng trên sơ đồ |

#### UC04: Xử lý đơn hàng (nhân viên)

| Mục | Nội dung |
|---|---|
| Tác nhân | Nhân viên có quyền Xem đơn hàng (xem), quyền Sửa đơn hàng (chuyển trạng thái) |
| Luồng chính | 1. Mở trang Đơn hàng, chọn tab trạng thái. 2. Bấm Xem một đơn. 3. Bấm nút bước kế tiếp: Xác nhận đơn → Bắt đầu chế biến → Giao hàng → Hoàn thành |
| Luồng rẽ nhánh | 3a. Đơn đến lấy: không có nút Giao hàng. 3b. Hủy đơn: hỏi xác nhận, hoàn lại số đã bán và lượt dùng mã; nếu khách đã trả online thì đổi sang Đã hoàn tiền và nhắc hoàn tiền trên trang VNPay. 3c. Chuyển sai quy trình (vd Chờ xác nhận → Hoàn thành): backend từ chối |
| Điều kiện sau | Đơn tiền mặt chuyển Hoàn thành thì tự đổi sang Đã thanh toán |

#### UC05: Hủy lịch đặt bàn kèm lý do (nhân viên)

| Mục | Nội dung |
|---|---|
| Tác nhân | Nhân viên có quyền Sửa đặt bàn |
| Luồng chính | 1. Bấm Hủy ở danh sách hoặc trên sơ đồ bàn. 2. Chọn lý do có sẵn (Hết bàn vào khung giờ này / Nhà hàng có sự kiện, đóng cửa / Không liên lạc được với khách) hoặc "Lý do khác" và tự gõ (tối đa 300 ký tự). 3. Bấm Hủy lịch |
| Luồng rẽ nhánh | 2a. Chưa có lý do: nút Hủy lịch bị mờ; gọi API không có lý do thì backend trả lỗi 400. 3a. Người khác vừa cập nhật lịch này: báo "vừa được người khác cập nhật, vui lòng tải lại trang" (409) |
| Điều kiện sau | Khách thấy khung đỏ "Nhà hàng đã hủy lịch này · Lý do: ..." và nút đặt lại với thông tin cũ |

#### UC06: Quản lý nhân viên và phân quyền

| Mục | Nội dung |
|---|---|
| Tác nhân | Nhân viên có quyền Nhân sự (thêm / sửa), ADMIN (sửa ma trận) |
| Luồng chính | 1. Thêm nhân viên: nhập họ tên, email, chọn vai trò; hệ thống tạo sẵn mật khẩu ngẫu nhiên 8 ký tự (bỏ ký tự dễ nhầm 0/O, 1/l). 2. Hiện thông tin đăng nhập một lần để sao chép gửi nhân viên. 3. ADMIN mở Ma trận phân quyền, chọn vai trò, tích Xem / Thêm / Sửa / Xóa cho từng chức năng, lưu |
| Luồng rẽ nhánh | Không ai tự sửa / khóa tài khoản của chính mình ở trang này. Người không phải ADMIN không đụng được tài khoản ADMIN hay người giữ vai trò Chủ nhà hàng, không cấp được quyền ADMIN hay vai trò Chủ. Vai trò Chủ nhà hàng luôn toàn quyền. Vai trò mặc định không xóa được; vai trò còn người giữ không xóa được |
| Điều kiện sau | Quyền mới có hiệu lực ngay ở request kế tiếp (backend đọc quyền từ DB mỗi request) |

#### UC07: Đánh giá món

| Mục | Nội dung |
|---|---|
| Tác nhân | Khách hàng đã đăng nhập |
| Điều kiện trước | Có ít nhất một đơn Hoàn thành chứa món đó |
| Luồng chính | Chọn số sao, viết bình luận, gửi. Hệ thống tạo hoặc cập nhật đánh giá, tính lại điểm trung bình (làm tròn 1 chữ số) và số lượt đánh giá của món |
| Luồng rẽ nhánh | Chưa nhận món: "Bạn cần đặt và nhận món này trước khi đánh giá" (403) |

### 4.6 Quy tắc nghiệp vụ

| Mã | Quy tắc | Giá trị | Code |
|---|---|---|---|
| R01 | Phí giao hàng | 20.000đ, miễn phí khi tạm tính từ 500.000đ; đến lấy luôn miễn phí. Đổi trong `.env` (`SHIPPING_FEE`, `FREE_SHIPPING_MIN`) | `orders.service.js` |
| R02 | Tổng tiền | Tổng = Tạm tính - Giảm giá + Phí giao. Tạm tính dùng giá khuyến mãi nếu có | `orders.service.js` |
| R03 | Số lượng mỗi món | 1 đến 50; các dòng trùng món được gộp, ghi chú nối bằng "; " | `orders.validation.js` |
| R04 | Ghi chú | Ghi chú món tối đa 200 ký tự, ghi chú đơn tối đa 500 | `orders.validation.js` |
| R05 | Món hết hàng | Không đặt được món đang tắt; mặc định khách chỉ thấy món đang bán | `orders.service.js`, `dishes.controller.js` |
| R06 | Mã giảm giá | Phải đang bật, trong thời gian hiệu lực, còn lượt, tạm tính ≥ đơn tối thiểu. % thì làm tròn xuống, không vượt "giảm tối đa", không vượt tạm tính | `coupons.service.js` |
| R07 | Lượt dùng mã | Cộng lượt khi đặt đơn; trả lại lượt khi đơn bị hủy | `orders.service.js` |
| R08 | Quy trình đơn hàng | Xem [mục 4.7](#47-sơ-đồ-trạng-thái) | `STATUS_FLOW` |
| R09 | Khách tự hủy đơn | Chỉ khi Chờ xác nhận và chưa trả tiền online | `orders.controller.js > cancel` |
| R10 | Thanh toán tự động | Đơn tiền mặt Hoàn thành → Đã thanh toán; đơn đã trả bị hủy → Đã hoàn tiền | `changeStatus` |
| R11 | VNPay | Tối thiểu 5.000đ; link hết hạn 15 phút; mỗi lần bấm là một giao dịch mới; thành công khi cả `vnp_ResponseCode` và `vnp_TransactionStatus` là "00" | `payments.service.js`, `vnpay.js` |
| R12 | Giờ đặt bàn | Từ giờ mở cửa (10:00) đến trước giờ đóng cửa 1 tiếng (21:00), khung 30 phút / lần, đặt trước ít nhất 30 phút | `reservations.validation.js`, `lib/reservation.js` |
| R13 | Số khách | 1 đến 50 (đoàn trên 20 người nên gọi hotline) | `reservations.validation.js` |
| R14 | Giữ bàn | Một lượt đặt giữ bàn 120 phút: bàn đặt 19:00 thì bận từ 17:01 đến 20:59. Lịch Chờ xác nhận, Đã xác nhận, Đã đến đều giữ bàn; lịch hủy thì trả bàn | `tables.service.js` |
| R15 | Chọn bàn | Bàn phải đang phục vụ và đủ ghế | `assertTableAvailable` |
| R16 | Khách hủy đặt bàn | Chỉ khi Chờ xác nhận / Đã xác nhận và chưa tới giờ | `reservations.controller.js > cancel` |
| R17 | Nhà hàng hủy đặt bàn | Bắt buộc lý do, tối đa 300 ký tự | `updateReservationStatusSchema` |
| R18 | Đánh giá | Chỉ người có đơn Hoàn thành chứa món; mỗi người 1 đánh giá / món | `reviews.controller.js` |
| R19 | Xóa món | Món đã có trong đơn thì không xóa hẳn, chỉ chuyển sang ngừng bán (giữ lịch sử) | `dishes.controller.js > remove` |
| R20 | Xóa danh mục | Không xóa được danh mục còn món | `categories.controller.js` |
| R21 | Mã đơn / mã đặt bàn | `FAB` / `RSV` + ngày yyMMdd (giờ VN) + 6 số ngẫu nhiên, vd `FAB261022482913`; trùng thì sinh lại (tối đa 5 lần) | `utils/helpers.js` |
| R22 | Xem đơn / lịch của người khác | Chỉ chủ đơn, nhân viên có quyền, hoặc người biết đúng SĐT; sai thì trả "không tìm thấy" (404) để không lộ đơn có tồn tại | `findAccessibleOrder`, `findAccessible` |
| R23 | Doanh thu | Chỉ tính đơn Hoàn thành, theo ngày giờ Việt Nam | `stats.controller.js` |
| R24 | Tài khoản | Mật khẩu ≥ 6 ký tự, tên 2 đến 100 ký tự, SĐT dạng `0` hoặc `+84` + 9 đến 10 số; email không trùng | `auth.validation.js` |
| R25 | Ảnh upload | Chỉ JPG, PNG, WEBP, GIF, tối đa 5MB | `middlewares/upload.js` |

### 4.7 Sơ đồ trạng thái

**Đơn hàng (`Order.status`)** — `backend/src/modules/orders/orders.service.js` (`STATUS_FLOW`):

```mermaid
stateDiagram-v2
    [*] --> PENDING: Khách đặt món
    PENDING --> CONFIRMED: Xác nhận đơn
    PENDING --> CANCELLED: Hủy (khách hoặc nhân viên)
    CONFIRMED --> PREPARING: Bắt đầu chế biến
    CONFIRMED --> CANCELLED
    PREPARING --> DELIVERING: Giao hàng (chỉ đơn giao tận nơi)
    PREPARING --> COMPLETED: Khách đến lấy
    PREPARING --> CANCELLED
    DELIVERING --> COMPLETED: Giao xong
    DELIVERING --> CANCELLED
    COMPLETED --> [*]
    CANCELLED --> [*]
```

| Trạng thái | Nhãn hiển thị |
|---|---|
| PENDING | Chờ xác nhận |
| CONFIRMED | Đã xác nhận |
| PREPARING | Đang chế biến |
| DELIVERING | Đang giao |
| COMPLETED | Hoàn thành |
| CANCELLED | Đã hủy |

**Thanh toán của đơn (`Order.paymentStatus`):** UNPAID (Chưa thanh toán) → PAID (khi VNPay báo thành công, hoặc đơn tiền mặt Hoàn thành) → REFUNDED (khi đơn đã trả bị hủy).

**Lịch đặt bàn (`Reservation.status`)** — `RESERVATION_FLOW` trong `reservations.controller.js`:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Khách đặt bàn
    PENDING --> CONFIRMED: Nhân viên xác nhận
    PENDING --> CANCELLED: Khách tự hủy / nhà hàng hủy (có lý do)
    CONFIRMED --> COMPLETED: Khách đã đến
    CONFIRMED --> CANCELLED
    COMPLETED --> [*]
    CANCELLED --> [*]
```

**Một lần thanh toán VNPay (`Payment.status`):**

```mermaid
stateDiagram-v2
    [*] --> PENDING: Tạo link thanh toán
    PENDING --> SUCCESS: VNPay báo "00" và chữ ký đúng
    PENDING --> FAILED: Khách hủy / thẻ lỗi / hết hạn
    SUCCESS --> [*]
    FAILED --> [*]
```

### 4.8 Sơ đồ tuần tự

**Đặt món** (từ bấm nút tới khi có đơn):

```mermaid
sequenceDiagram
    actor K as Khách
    participant W as Website (Checkout.jsx)
    participant A as API Express
    participant DB as PostgreSQL

    K->>W: Bấm "Đặt hàng"
    W->>W: React Hook Form kiểm tra form
    W->>A: POST /api/v1/orders { items: [dishId, quantity, note], couponCode, ... }
    A->>A: rateLimit → optionalAuth → validate (Zod)
    A->>DB: BEGIN transaction
    A->>DB: Lấy giá món từ DB (bỏ qua giá client gửi)
    A->>DB: Kiểm tra mã giảm giá, UPDATE usedCount có điều kiện
    A->>DB: INSERT Order + OrderItem
    A->>DB: Tăng soldCount từng món
    A->>DB: COMMIT
    A-->>W: 201 { success: true, data: order }
    W->>W: Xóa giỏ hàng
    W-->>K: Chuyển sang /orders/FAB...?phone=...
```

**Thanh toán VNPay** (`docs/11-thanh-toan-vnpay.md`):

```mermaid
sequenceDiagram
    actor K as Khách
    participant W as Website
    participant A as API Express
    participant DB as PostgreSQL
    participant V as VNPay

    W->>A: POST /payments/vnpay/:code { phone }
    A->>DB: Tạo Payment (PENDING, txnRef mới)
    A-->>W: paymentUrl (đã ký HMAC-SHA512)
    W->>V: Chuyển khách sang trang VNPay
    K->>V: Nhập thẻ / OTP hoặc quét QR
    V->>A: GET /payments/vnpay/ipn?vnp_... (máy chủ gọi máy chủ)
    A->>A: Kiểm tra chữ ký, số tiền, trạng thái
    A->>DB: Payment SUCCESS + Order PAID (chỉ khi còn PENDING)
    A-->>V: { RspCode: "00" }
    V->>W: Đưa khách về /payment/vnpay-return?vnp_...
    W->>A: GET /payments/vnpay/return?vnp_... (gửi nguyên query)
    A->>A: Kiểm tra chữ ký; đã ghi nhận rồi thì đọc lại kết quả
    A-->>W: { paid, message, amount, transactionNo, orderCode }
    W-->>K: "Thanh toán thành công!"
```

Điểm để giải thích: IPN là kênh đáng tin nhất (chạy cả khi khách tắt trình duyệt). Khi chạy trên máy cá nhân, VNPay không gọi được IPN vào `localhost`, nên trang trả về cũng ghi nhận được (vì dữ liệu có chữ ký). Hai kênh dùng chung một hàm xử lý và câu UPDATE có điều kiện `status = PENDING`, nên không bao giờ ghi nhận 2 lần.

**Đặt bàn có chọn bàn:**

```mermaid
sequenceDiagram
    actor K as Khách
    participant W as Website (Reservation.jsx)
    participant A as API Express
    participant DB as PostgreSQL

    K->>W: Chọn ngày, giờ, số khách, khu vực
    W->>A: GET /reservations/tables?date=ISO
    A->>DB: Lấy bàn + lịch đè giờ (±120 phút)
    A-->>W: Sơ đồ theo khu vực: free / pending / occupied / inactive
    K->>W: Bấm 1 bàn trống, bấm "Xác nhận đặt bàn"
    W->>A: POST /reservations { ..., tableId }
    A->>DB: BEGIN (Serializable)
    A->>DB: Bàn còn phục vụ? đủ ghế? có lịch trùng giờ?
    A->>DB: INSERT Reservation
    A->>DB: COMMIT
    alt Hai người đặt cùng bàn cùng lúc
        DB-->>A: Lỗi P2034 cho người sau
        A-->>W: 409 "Bàn vừa có người khác đặt"
        W->>A: Tải lại sơ đồ bàn
    else Thành công
        A-->>W: 201 { code: "RSV...", table, ... }
    end
```

### 4.9 Kiến trúc hệ thống

**Kiến trúc tổng thể (client - server, 3 lớp):**

```mermaid
flowchart LR
    subgraph Client
      W[Website React<br/>localhost:5173]
      M[App Flutter<br/>làm sau]
    end
    subgraph Server
      A[Express API<br/>localhost:4000/api/v1]
      U[(Thư mục uploads/<br/>ảnh món)]
    end
    DB[(PostgreSQL)]
    V[Cổng VNPay]
    W -- HTTP + JSON, JWT Bearer --> A
    M -- HTTP + JSON, JWT Bearer --> A
    A -- Prisma --> DB
    A --- U
    W -- chuyển trang thanh toán --> V
    V -- IPN --> A
```

- Frontend chỉ hiển thị và tương tác, không nối thẳng vào DB.
- Backend nhận request, kiểm tra quyền, kiểm tra dữ liệu, xử lý nghiệp vụ, đọc / ghi DB, trả JSON.
- Khi dev, Vite chuyển tiếp (proxy) `/api` và `/uploads` sang cổng 4000 nên không vướng CORS.

**Kiến trúc backend: chia theo module, mỗi module chia lớp:**

```mermaid
flowchart TB
    R[Request] --> MW1[Middleware chung<br/>helmet, cors, json 1MB, morgan]
    MW1 --> RT[routes.js<br/>gắn module vào /api/v1]
    RT --> MW2[Middleware của route<br/>rateLimit → requireAuth / optionalAuth / requirePermission → validate Zod]
    MW2 --> C[Controller<br/>đọc request, trả response]
    C --> S[Service<br/>logic nghiệp vụ: tính tiền, state machine, VNPay]
    S --> P[Prisma Client]
    P --> DB[(PostgreSQL)]
    C -. throw ApiError .-> E[errorHandler<br/>trả JSON lỗi thống nhất]
```

12 module trong `backend/src/modules/`: `auth`, `categories`, `dishes`, `orders`, `payments`, `reservations`, `reviews`, `coupons`, `users`, `stats`, `permissions`, `upload` (cộng 2 route chung `/health`, `/info`). Mỗi module có `*.routes.js`, `*.controller.js`, `*.validation.js`, và `*.service.js` nếu logic phức tạp.

**Kiến trúc frontend:**

| Lớp | Thư mục | Vai trò |
|---|---|---|
| Trang | `src/pages/` (`account/`, `admin/`) | Mỗi trang 1 file, tải trễ bằng `lazy()` |
| Component | `src/components/` (`ui/`, `layout/`) | Nút, form, modal, bảng, badge...; khung trang khách / admin; sơ đồ bàn, ghi chú món |
| Gọi API | `src/services/index.js` | Toàn bộ hàm gọi API ở một chỗ |
| Trạng thái client | `src/stores/` | Zustand: `auth` (token + user), `cart` (giỏ hàng), cả hai lưu localStorage |
| Tiện ích | `src/lib/` | axios + interceptor, định dạng tiền / ngày, hằng số trạng thái, kiểm tra quyền, menu admin |

**Ba loại trạng thái và công cụ cho từng loại:** dữ liệu từ server → React Query; trạng thái dùng chung phía client (giỏ, đăng nhập) → Zustand; trạng thái của form → React Hook Form. Bộ lọc thực đơn, tab đơn hàng → lưu trên URL.

### 4.10 Thiết kế cơ sở dữ liệu

#### 4.10.1 Sơ đồ quan hệ (ERD) đầy đủ

```mermaid
erDiagram
    StaffRole ||--o{ RolePermission : "có quyền"
    StaffRole |o--o{ User : "gán cho"
    User |o--o{ Order : "đặt"
    User |o--o{ Reservation : "đặt bàn"
    User ||--o{ Review : "viết"
    Category ||--o{ Dish : "chứa"
    Dish ||--o{ OrderItem : "nằm trong"
    Dish ||--o{ Review : "được đánh giá"
    Order ||--|{ OrderItem : "gồm"
    Order ||--o{ Payment : "thanh toán"
    DiningTable |o--o{ Reservation : "được đặt"

    User {
      int id PK
      string email UK
      string passwordHash
      enum role "CUSTOMER | STAFF | ADMIN"
      bool isActive
      int staffRoleId FK "chỉ khi STAFF"
    }
    StaffRole {
      int id PK
      string key UK
      string name
      bool isSystem
    }
    RolePermission {
      int id PK
      int roleId FK
      string module
      bool canView
      bool canCreate
      bool canEdit
      bool canDelete
    }
    Category {
      int id PK
      string slug UK
      int sortOrder
    }
    Dish {
      int id PK
      string slug UK
      int price
      int salePrice "có thể trống"
      bool isAvailable
      int soldCount
      float ratingAvg
      int categoryId FK
    }
    Order {
      int id PK
      string code UK
      int userId FK "trống = khách vãng lai"
      enum type
      enum status
      enum paymentMethod
      enum paymentStatus
      int total
      string couponCode
    }
    OrderItem {
      int id PK
      int orderId FK
      int dishId FK
      string name "lưu lúc đặt"
      int price "lưu lúc đặt"
      int quantity
      string note
    }
    Payment {
      int id PK
      int orderId FK
      string txnRef UK
      int amount
      enum status
      string transactionNo
    }
    Reservation {
      int id PK
      string code UK
      datetime date
      int guests
      int tableId FK
      enum status
      string cancelReason
    }
    DiningTable {
      int id PK
      string code UK
      string area
      int seats
      int x
      int y
      bool isActive
    }
    Review {
      int id PK
      int userId FK
      int dishId FK
      int rating "1 đến 5"
    }
    Coupon {
      int id PK
      string code UK
      enum type
      int value
      int usageLimit
      int usedCount
    }
```

Ghi chú: `Coupon` không nối khóa ngoại với `Order`; đơn lưu `couponCode` dạng chữ để mã có bị xóa thì đơn cũ vẫn còn thông tin.

#### 4.10.2 Từ điển dữ liệu

Kiểu: `Int` số nguyên, `String` chuỗi (PostgreSQL `TEXT`), `Boolean`, `DateTime` (lưu giờ UTC), `Float`, `Json`. "?" = được để trống. Mọi bảng có `id Int` khóa chính tự tăng.

**User (tài khoản)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| name | String | | Họ tên |
| email | String | Duy nhất | Email đăng nhập |
| phone | String? | | Số điện thoại |
| passwordHash | String | | Mật khẩu đã băm bcrypt |
| role | Role | Mặc định CUSTOMER | Loại tài khoản |
| address | String? | | Địa chỉ mặc định khi đặt hàng |
| avatar | String? | | Ảnh đại diện |
| isActive | Boolean | Mặc định true | false = bị khóa |
| staffRoleId | Int? | FK → StaffRole, xóa vai trò thì đặt null | Vai trò nhân viên |
| createdAt, updatedAt | DateTime | Tự điền | |

**StaffRole (vai trò nhân viên)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| key | String | Duy nhất | Mã viết hoa, vd `CASHIER`; tạo từ tên, vd "Bảo vệ ca đêm" → `BAO_VE_CA_DEM` |
| name | String | | Tên hiển thị |
| description | String? | | Công việc chính |
| sortOrder | Int | 0 | Thứ tự hiển thị |
| isSystem | Boolean | false | Vai trò mặc định, không cho xóa |

**RolePermission (quyền của vai trò trên 1 chức năng)**

| Cột | Kiểu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| roleId | Int | FK → StaffRole, xóa vai trò thì xóa theo | |
| module | String | Duy nhất cùng roleId | Mã chức năng, vd `ORDERS` |
| canView, canCreate, canEdit, canDelete | Boolean | Mặc định false | Xem / Thêm / Sửa / Xóa |

**Category (danh mục)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| name | String | | Tên danh mục |
| slug | String | Duy nhất | Tên không dấu cho URL, vd `mam-hai-san` |
| description, image | String? | | |
| sortOrder | Int | 0 | Số nhỏ hiện trước |

**Dish (món ăn)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| name | String | | Tên món |
| slug | String | Duy nhất | Trùng thì thêm số: `tom-hap-bia-2` |
| description | String? | | |
| price | Int | > 0 | Giá gốc (VNĐ) |
| salePrice | Int? | < price | Giá khuyến mãi |
| unit | String | "phần" | Đơn vị: phần, đĩa, kg, con, mâm, ly... |
| image | String? | | Link ảnh hoặc `/uploads/...` |
| isAvailable | Boolean | true | Đang bán |
| isFeatured | Boolean | false | Hiện ở trang chủ |
| soldCount | Int | 0 | Số đã bán (lưu sẵn) |
| ratingAvg | Float | 0 | Điểm trung bình (lưu sẵn) |
| ratingCount | Int | 0 | Số lượt đánh giá (lưu sẵn) |
| categoryId | Int | FK → Category, có index | |

**Order (đơn hàng)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| code | String | Duy nhất | Mã đơn cho khách, vd `FAB261022482913` |
| userId | Int? | FK → User, có index | Trống = khách vãng lai |
| customerName, phone | String | | Người nhận |
| address | String? | | Chỉ có khi giao tận nơi |
| type | OrderType | DELIVERY | Giao tận nơi / đến lấy |
| status | OrderStatus | PENDING, có index | |
| paymentMethod | PaymentMethod | COD | |
| paymentStatus | PaymentStatus | UNPAID | |
| subtotal | Int | | Tạm tính |
| discount | Int | 0 | Số tiền giảm |
| shippingFee | Int | 0 | Phí giao |
| total | Int | | Tổng phải trả |
| couponCode | String? | | Mã đã dùng |
| note | String? | | Ghi chú đơn |
| createdAt | DateTime | có index | |

**OrderItem (chi tiết đơn)**

| Cột | Kiểu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| orderId | Int | FK → Order, xóa đơn thì xóa theo | |
| dishId | Int | FK → Dish | |
| name, price | String, Int | | Tên và giá **tại lúc đặt** |
| quantity | Int | 1 đến 50 | |
| note | String? | ≤ 200 ký tự | Ghi chú khẩu vị của món |

**Payment (một lần thanh toán VNPay)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| orderId | Int | FK → Order, có index | |
| provider | String | "VNPAY" | |
| txnRef | String | Duy nhất | Mã giao dịch gửi VNPay = mã đơn + thời điểm (cơ số 36) |
| amount | Int | | Số tiền lúc tạo link |
| status | PaymentTxnStatus | PENDING | |
| transactionNo | String? | | Mã giao dịch phía VNPay |
| bankCode, responseCode | String? | | Ngân hàng, mã phản hồi ("00" = thành công) |
| paidAt | DateTime? | | Thời điểm trả tiền |
| rawData | Json? | | Toàn bộ dữ liệu VNPay gửi về, để đối soát |

**Reservation (lịch đặt bàn)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| code | String | Duy nhất | vd `RSV261022123456` |
| userId | Int? | FK → User | |
| name, phone | String | | |
| email | String? | | |
| date | DateTime | có index | Ngày giờ đến |
| guests | Int | 1 đến 50 | Số khách |
| area | String? | | Khu vực mong muốn |
| tableId | Int? | FK → DiningTable, xóa bàn thì đặt null; index (tableId, date) | Bàn đã chọn |
| note | String? | | |
| status | ReservationStatus | PENDING | |
| cancelReason | String? | ≤ 300 ký tự | Lý do nhà hàng hủy; trống = khách tự hủy |

**DiningTable (bàn)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| code | String | Duy nhất | Số bàn: T01, B03, VIP1 |
| area | String | | Khớp 1 trong 3 khu vực |
| seats | Int | | Số ghế tối đa |
| x, y | Int | | Cột, hàng trên sơ đồ (từ 1) |
| isActive | Boolean | true | false = bàn hỏng / đang sửa |

**Review (đánh giá)**

| Cột | Kiểu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| userId | Int | FK → User, xóa theo | |
| dishId | Int | FK → Dish, xóa theo | |
| rating | Int | 1 đến 5 | |
| comment | String? | ≤ 1000 ký tự | |
| | | Duy nhất (userId, dishId) | Mỗi người 1 đánh giá / món |

**Coupon (mã giảm giá)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| code | String | Duy nhất, viết hoa, 3 đến 30 ký tự | |
| description | String? | | |
| type | CouponType | | PERCENT (%) / FIXED (số tiền) |
| value | Int | > 0; % thì ≤ 100 | |
| minOrder | Int | 0 | Đơn tối thiểu |
| maxDiscount | Int? | | Giảm tối đa (cho loại %) |
| usageLimit | Int? | | Trống = không giới hạn |
| usedCount | Int | 0 | Đã dùng |
| startsAt, expiresAt | DateTime? | | Thời gian hiệu lực |
| isActive | Boolean | true | |

**Các kiểu liệt kê (enum):**

| Enum | Giá trị |
|---|---|
| Role | CUSTOMER, STAFF, ADMIN |
| OrderType | DELIVERY, PICKUP |
| OrderStatus | PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED, CANCELLED |
| PaymentMethod | COD, ONLINE |
| PaymentStatus | UNPAID, PAID, REFUNDED |
| PaymentTxnStatus | PENDING, SUCCESS, FAILED |
| ReservationStatus | PENDING, CONFIRMED, CANCELLED, COMPLETED |
| CouponType | PERCENT, FIXED |

#### 4.10.3 Các quyết định thiết kế (nên giải thích trong báo cáo)

| Quyết định | Lý do |
|---|---|
| Tiền lưu kiểu số nguyên (VNĐ) | Số thực bị sai số (`0.1 + 0.2 = 0.30000000000000004`); tiền Việt không có phần lẻ |
| `Order.userId` được để trống | Khách không cần tài khoản vẫn đặt được, tăng tỉ lệ chốt đơn |
| `OrderItem` lưu lại tên và giá | "Ảnh chụp" lúc mua; món đổi giá sau đó thì đơn cũ vẫn đúng |
| Mã đơn `code` riêng ngoài `id` | Không lộ `id` tăng dần (đoán được số đơn của quán); mã dễ đọc qua điện thoại |
| Lưu sẵn `soldCount`, `ratingAvg`, `ratingCount` | Sắp xếp "bán chạy", "đánh giá cao" nhanh, không phải tính lại mỗi lần đọc; đổi lại phải cập nhật khi có đơn / đánh giá |
| Bảng `Payment` riêng | Một đơn có thể thanh toán nhiều lần (hủy rồi trả lại); lưu mã giao dịch VNPay để đối soát khi có khiếu nại |
| Quyền lưu trong DB, danh sách chức năng nằm trong code | Admin chỉnh quyền trên giao diện không cần sửa code; chức năng mới cần code mới nên khai báo trong code là hợp lý |
| Bàn có tọa độ x, y | Vẽ sơ đồ giống vị trí thật trong nhà hàng |
| `cancelReason` trống / có | Có lý do ⇒ nhà hàng hủy; trống ⇒ khách tự hủy. Không cần thêm cột "ai hủy" |
| Index trên `Order.status`, `createdAt`, `userId`, `Dish.categoryId`, `Reservation.date`, `(tableId, date)` | Tăng tốc các truy vấn lọc hay dùng |
| `slug` | URL đẹp, tốt cho SEO: `/menu/tom-su-hap-bia` |

#### 4.10.4 Lịch sử thay đổi cấu trúc (migration)

| Migration | Nội dung |
|---|---|
| `20261001071005_init` | 8 bảng ban đầu: User, Category, Dish, Order, OrderItem, Reservation, Review, Coupon và 7 enum |
| `20261009020552_add_payment` | Bảng Payment + enum PaymentTxnStatus |
| `20261013011838_add_role_permissions` | Bảng StaffRole, RolePermission |
| `20261013025332_add_staff_accounts` | Thêm giá trị STAFF vào Role, cột `User.staffRoleId` |
| `20261013061006_add_dining_tables` | Bảng DiningTable, cột `Reservation.tableId` |
| `20261021100003_them_ly_do_huy_dat_ban` | Cột `Reservation.cancelReason` |
| `20261022093956_them_ghi_chu_tung_mon` | Cột `OrderItem.note` |

Các migration sau đều chỉ **thêm** bảng / cột cho phép trống, nên cập nhật trên máy đang có dữ liệu không mất dữ liệu cũ (`npm --prefix backend run db:deploy`).

### 4.11 Thiết kế API

**Quy ước chung:**
- Địa chỉ gốc: `http://localhost:4000/api/v1`
- Xác thực: header `Authorization: Bearer <token>` (lấy từ đăng nhập)
- Phân trang: `?page=1&limit=12` (tối đa 100), trả về `meta: { total, page, limit, totalPages }`
- Thành công: `{ "success": true, "data": ..., "meta": ... }`
- Lỗi: `{ "success": false, "message": "Thông báo tiếng Việt", "errors": [{ "field": "phone", "message": "..." }] }`

**Mã lỗi:**

| Mã | Khi nào |
|---|---|
| 400 | Dữ liệu sai (Zod), vi phạm quy tắc nghiệp vụ, JSON hỏng, file ảnh sai loại / quá lớn |
| 401 | Chưa đăng nhập, token sai / hết hạn, sai email hoặc mật khẩu |
| 403 | Không có quyền, tài khoản bị khóa |
| 404 | Không tìm thấy (kể cả khi tra cứu sai SĐT, để không lộ đơn có tồn tại) |
| 409 | Trùng dữ liệu (email, mã), bàn vừa có người đặt, dữ liệu đang được dùng nên không xóa được |
| 429 | Gọi quá nhiều lần trong 15 phút |
| 500 | Lỗi máy chủ (chỉ trả chi tiết `stack` khi chạy development) |
| 503 | Nhà hàng chưa bật VNPay |

**Danh sách 54 endpoint.** Ký hiệu quyền: 🌐 công khai; 🔓 không bắt buộc đăng nhập (có token thì nhận diện); 🔐 phải đăng nhập; 🛡️ cần quyền `CHỨC_NĂNG.quyền`; 👑 chỉ ADMIN.

| Nhóm | Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|---|
| Chung | GET | `/health` | 🌐 | Kiểm tra server sống |
| | GET | `/info` | 🌐 | Thông tin nhà hàng, giờ mở cửa, khu vực, phí ship, có bật VNPay không |
| Auth | POST | `/auth/register` | 🌐 (20 lần/15') | Đăng ký, trả token |
| | POST | `/auth/login` | 🌐 (20 lần/15') | Đăng nhập, trả token + user + permissions |
| | GET | `/auth/me` | 🔐 | Thông tin tài khoản + ma trận quyền |
| | PATCH | `/auth/me` | 🔐 | Sửa tên, SĐT, địa chỉ |
| | POST | `/auth/change-password` | 🔐 (20 lần/15') | Đổi mật khẩu |
| Danh mục | GET | `/categories` | 🌐 | Danh sách, kèm số món |
| | POST | `/categories` | 🛡️ MENU.create | Thêm |
| | PUT | `/categories/:id` | 🛡️ MENU.edit | Sửa |
| | DELETE | `/categories/:id` | 🛡️ MENU.delete | Xóa (chặn nếu còn món) |
| Món ăn | GET | `/dishes` | 🌐 | `search, category, featured, available, minPrice, maxPrice, sort, page, limit` |
| | GET | `/dishes/:idOrSlug` | 🌐 | Chi tiết + 20 đánh giá + 4 món liên quan |
| | POST | `/dishes` | 🛡️ MENU.create | Thêm |
| | PUT | `/dishes/:id` | 🛡️ MENU.edit | Sửa |
| | PATCH | `/dishes/:id/toggle` | 🛡️ MENU.edit | Bật / tắt đang bán |
| | DELETE | `/dishes/:id` | 🛡️ MENU.delete | Xóa (đã có trong đơn thì chuyển ngừng bán) |
| Đơn hàng | POST | `/orders` | 🔓 (10 lần/15') | Đặt hàng |
| | GET | `/orders/my` | 🔐 | Đơn của tôi (phân trang) |
| | GET | `/orders/track/:code?phone=` | 🔓 (60 lần/15') | Xem đơn bằng mã + SĐT |
| | POST | `/orders/:code/cancel` | 🔓 (60 lần/15') | Khách tự hủy |
| | GET | `/orders` | 🛡️ ORDERS.view | Danh sách, lọc, kèm số đơn mỗi trạng thái |
| | GET | `/orders/:id` | 🛡️ ORDERS.view | Chi tiết + lịch sử thanh toán |
| | PATCH | `/orders/:id/status` | 🛡️ ORDERS.edit | Chuyển trạng thái |
| Thanh toán | POST | `/payments/vnpay/:code` | 🔓 (30 lần/15') | Tạo link VNPay |
| | GET | `/payments/vnpay/ipn` | 🌐 (chỉ VNPay gọi, kiểm chữ ký) | Nhận kết quả từ máy chủ VNPay |
| | GET | `/payments/vnpay/return` | 🌐 (kiểm chữ ký) | Trang kết quả gửi lại dữ liệu VNPay |
| Đặt bàn | POST | `/reservations` | 🔓 (10 lần/15') | Đặt bàn (có thể kèm `tableId`) |
| | GET | `/reservations/my` | 🔐 | Lịch của tôi |
| | GET | `/reservations/tables?date=` | 🔓 (300 lần/15') | Sơ đồ bàn tại 1 thời điểm; nhân viên có quyền thấy thêm tên, SĐT khách |
| | GET | `/reservations/track/:code?phone=` | 🔓 (60 lần/15') | Xem lịch bằng mã + SĐT |
| | POST | `/reservations/:code/cancel` | 🔓 (60 lần/15') | Khách tự hủy |
| | GET | `/reservations` | 🛡️ RESERVATIONS.view | Danh sách, lọc theo ngày / trạng thái / tìm kiếm |
| | PATCH | `/reservations/:id/status` | 🛡️ RESERVATIONS.edit | Chuyển trạng thái; hủy phải có `reason` |
| Đánh giá | POST | `/reviews` | 🔐 | Tạo / sửa đánh giá |
| | GET | `/reviews` | 🛡️ REVIEWS.view | Danh sách |
| | DELETE | `/reviews/:id` | 🛡️ REVIEWS.delete | Xóa |
| Mã giảm giá | GET | `/coupons/public` | 🌐 | Mã đang hiệu lực (gợi ý ở trang thanh toán) |
| | POST | `/coupons/check` | 🌐 | Kiểm tra mã với tạm tính, trả số tiền giảm |
| | GET | `/coupons` | 🛡️ COUPONS.view | Danh sách (admin) |
| | POST | `/coupons` | 🛡️ COUPONS.create | Thêm |
| | PUT | `/coupons/:id` | 🛡️ COUPONS.edit | Sửa |
| | DELETE | `/coupons/:id` | 🛡️ COUPONS.delete | Xóa |
| Người dùng | GET | `/users` | 🛡️ STAFF.view | Danh sách, tìm, lọc |
| | POST | `/users` | 🛡️ STAFF.create | Tạo tài khoản nhân viên |
| | PATCH | `/users/:id` | 🛡️ STAFF.edit | Đổi loại tài khoản, vai trò, khóa / mở |
| | POST | `/users/:id/reset-password` | 🛡️ STAFF.edit | Đặt lại mật khẩu |
| Thống kê | GET | `/stats/overview?days=` | 🛡️ DASHBOARD.view | Số liệu tổng quan (7 đến 365 ngày) |
| Phân quyền | GET | `/permissions` | 🛡️ STAFF.view | Danh sách chức năng + quyền + vai trò |
| | GET | `/permissions/roles/:id` | 🛡️ STAFF.view | Chi tiết 1 vai trò |
| | POST | `/permissions/roles` | 👑 | Thêm vai trò |
| | PUT | `/permissions/roles/:id` | 👑 | Sửa tên, mô tả, ma trận quyền |
| | DELETE | `/permissions/roles/:id` | 👑 | Xóa vai trò tự tạo không còn ai giữ |
| Upload | POST | `/upload` | 🛡️ MENU.create hoặc MENU.edit | Upload ảnh (multipart, trường `image`), trả `/uploads/xxx.jpg` |

Chi tiết từng API và ví dụ: [docs/06-api-reference.md](06-api-reference.md), gọi thử bằng [docs/api.http](api.http).

### 4.12 Thiết kế phân quyền

**Ba lớp:**
1. **Loại tài khoản (`User.role`):** CUSTOMER (khách, không vào được trang quản trị), STAFF (nhân viên, quyền theo vai trò), ADMIN (toàn quyền).
2. **Vai trò (`StaffRole`):** 12 vai trò tạo sẵn, admin thêm được vai trò mới.
3. **Ma trận (`RolePermission`):** mỗi vai trò × 11 chức năng × 4 quyền.

**11 chức năng (module):**

| Mã | Tên | Đã có trang |
|---|---|---|
| DASHBOARD | Tổng quan & báo cáo | Có |
| ORDERS | Đơn hàng & gọi món | Có |
| RESERVATIONS | Đặt bàn | Có |
| MENU | Thực đơn & danh mục | Có (Món ăn, Danh mục) |
| KITCHEN | Phiếu bếp & chế biến | Chưa |
| SEAFOOD_TANK | Hồ hải sản & nhập hàng | Chưa |
| PAYMENTS | Thu ngân & thanh toán | Chưa |
| COUPONS | Khuyến mãi & mã giảm giá | Có |
| REVIEWS | Đánh giá khách hàng | Có |
| STAFF | Nhân sự & phân quyền | Có (Người dùng, Phân quyền) |
| FACILITY | Thiết bị, bảo trì & vệ sinh | Chưa |

**Ma trận mặc định** (V = Xem, C = Thêm, E = Sửa, D = Xóa, "-" = không có quyền), lấy từ `DEFAULT_ROLES`:

| Vai trò | DASH | ORDERS | RESERV | MENU | KITCHEN | TANK | PAYMENTS | COUPONS | REVIEWS | STAFF | FACILITY |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Chủ nhà hàng | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED |
| Admin | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED |
| Quản lý | V | VCED | VCED | VCED | VCE | VCE | VE | VCED | VD | V | VCE |
| Tổ trưởng | V | VCE | VCE | V | V | V | V | - | V | V | VC |
| Phục vụ | - | VCE | V | V | V | V | - | - | - | - | C |
| Lễ tân | - | V | VCE | V | - | - | - | V | V | - | C |
| Thu ngân | V | VE | V | V | - | - | VCE | V | - | - | - |
| Kỹ thuật | - | - | - | - | V | V | - | - | - | - | VCED |
| Tạp vụ | - | - | V | - | - | - | - | - | - | - | VE |
| Bếp | - | V | - | VE | VCE | VE | - | - | - | - | VC |
| Tiếp thực | - | VE | V | V | VE | - | - | - | - | - | - |
| Hồ hải sản | - | V | - | VE | V | VCED | - | - | - | - | VC |

**Cách hoạt động:**
- Backend: mỗi request nạp lại user + vai trò + quyền từ DB (`loadUser`), nên khóa tài khoản hay đổi quyền có hiệu lực ngay. Route dùng `requirePermission('ORDERS', 'edit')`; ADMIN luôn qua, STAFF xét ma trận, CUSTOMER bị chặn (403).
- Frontend: `/auth/login` và `/auth/me` trả kèm `permissions`. Menu admin chỉ hiện mục có quyền Xem; nút Thêm / Sửa / Xóa ẩn theo quyền; `ProtectedRoute module="..."` chặn vào trang bằng URL. **Việc ẩn ở frontend chỉ để giao diện gọn, chặn thật nằm ở backend.**
- Vào `/admin` mà không có quyền Tổng quan thì tự chuyển tới trang đầu tiên được phép.

**Chống tự nâng quyền:**
- Chỉ ADMIN sửa được ma trận (nhân viên có quyền Nhân sự chỉ xem).
- Không ai tự sửa / khóa / đặt lại mật khẩu của chính mình trong trang quản trị.
- Người không phải ADMIN không thay đổi được tài khoản ADMIN hay người giữ vai trò Chủ nhà hàng, không tạo được tài khoản ADMIN, không gán được vai trò Chủ.
- Vai trò Chủ nhà hàng bị khóa ở toàn quyền.
- Zod bỏ trường lạ, nên khách gửi `role: "ADMIN"` khi đăng ký hay sửa hồ sơ cũng không có tác dụng.

### 4.13 Thiết kế giao diện

**Sơ đồ trang (sitemap):**

| Khu | Đường dẫn | Trang |
|---|---|---|
| Khách | `/` | Trang chủ |
| | `/menu`, `/menu/:slug` | Thực đơn, chi tiết món |
| | `/checkout` | Thanh toán |
| | `/orders/:code` | Chi tiết / theo dõi đơn |
| | `/payment/vnpay-return` | Kết quả thanh toán VNPay |
| | `/track` (`?tab=reservation`) | Tra cứu đơn / đặt bàn |
| | `/reservation`, `/reservations/:code` | Đặt bàn, chi tiết đặt bàn |
| | `/login`, `/register` | Đăng nhập, đăng ký |
| | `*` | Trang 404 |
| Tài khoản (phải đăng nhập) | `/account`, `/account/orders`, `/account/reservations` | Hồ sơ + đổi mật khẩu, đơn của tôi, lịch đặt bàn |
| Quản trị (ADMIN / STAFF có quyền) | `/admin` | Tổng quan |
| | `/admin/orders`, `/admin/reservations` | Đơn hàng, đặt bàn |
| | `/admin/dishes`, `/admin/categories` | Món ăn, danh mục |
| | `/admin/coupons`, `/admin/reviews` | Mã giảm giá, đánh giá |
| | `/admin/users`, `/admin/permissions` | Người dùng, phân quyền |

Giỏ hàng là ngăn kéo trượt từ phải, mở được ở mọi trang khách.

**Hệ thống thiết kế (design system)**, khai báo trong `frontend/src/index.css`:

| Thành phần | Giá trị |
|---|---|
| Màu chủ đạo "Đại dương" (ocean) | `#1f7aa3` (500), `#0b3954` (900), `#072538` (950): chữ tiêu đề, nền footer, sidebar admin |
| Màu nhấn "San hô" (coral) | `#ff7f50` (400), `#f5602e` (500): nút chính, giá tiền, huy hiệu giảm giá |
| Màu nền "Cát" (sand) | `#fdfbf7` (50): nền trang khách |
| Font nội dung | Be Vietnam Pro (hỗ trợ tiếng Việt tốt) |
| Font tiêu đề | Playfair Display |
| Bo góc | Thẻ (card) bo 16px, nút bo 12px |
| Màu trạng thái | Chờ: vàng; Đã xác nhận: xanh dương; Hoàn thành: xanh lá; Hủy: đỏ |
| Màu bàn | Trống: xanh lá; Bạn chọn: xanh đậm; Chờ xác nhận: vàng; Có khách: đỏ; Không đủ ghế: xám viền đứt; Tạm ngưng: xám gạch ngang |

Ý tưởng màu: xanh biển + san hô + cát gợi nhà hàng hải sản ven biển Đà Nẵng.

---

## 5. Chương 3: Cài đặt, kết quả và kiểm thử

### 5.1 Môi trường phát triển và cài đặt

| Thành phần | Yêu cầu |
|---|---|
| Hệ điều hành | Windows / macOS / Linux [Tự điền máy bạn dùng] |
| Node.js | 20 trở lên |
| CSDL | PostgreSQL 14 trở lên (Docker dùng bản 16) |
| Trình soạn thảo | VS Code |
| Trình duyệt | Chrome / Edge / Firefox bản mới |

**Các bước cài đặt (từ thư mục gốc):**

```bash
npm run install:all     # cài thư viện cho gốc, backend, frontend; tự tạo backend/.env từ .env.example
docker compose up -d    # bật PostgreSQL (user/pass postgres/postgres)
npm run setup           # tạo bảng + dữ liệu mẫu (XÓA dữ liệu cũ)
npm run dev             # backend :4000, frontend :5173 chạy song song
```

**Biến môi trường backend (`backend/.env`):**

| Biến | Ý nghĩa |
|---|---|
| `PORT`, `NODE_ENV` | Cổng (4000), môi trường |
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL (bắt buộc) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Khóa ký token (bắt buộc, phải đổi khi deploy), thời hạn (7d) |
| `CORS_ORIGIN` | Địa chỉ frontend được gọi API |
| `SHIPPING_FEE`, `FREE_SHIPPING_MIN` | 20000, 500000 |
| `VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_URL`, `VNP_RETURN_URL` | Cấu hình VNPay; bỏ trống 2 biến đầu thì web chỉ nhận tiền mặt |

Frontend có `VITE_API_URL` (để trống khi dev vì đã có proxy).

### 5.2 Cấu trúc mã nguồn

```
fab-restaurant/
├── backend/
│   ├── prisma/            schema.prisma, migrations/ (7), seed.js
│   └── src/
│       ├── config/        env.js, permissions.js (chức năng + 12 vai trò), restaurant.js (thông tin quán), tables.js (23 bàn)
│       ├── lib/           prisma.js (1 kết nối dùng chung)
│       ├── middlewares/   auth.js, validate.js, error.js, rateLimit.js, upload.js
│       ├── modules/       12 module, mỗi module: routes + controller + validation (+ service)
│       ├── utils/         ApiError.js, helpers.js (slug, sinh mã, phân trang)
│       ├── routes.js      gắn module vào /api/v1
│       ├── app.js         cấu hình Express
│       └── server.js      khởi động, tắt gọn kết nối DB
├── frontend/src/
│   ├── pages/             12 trang khách, account/ (3 + layout), admin/ (9)
│   ├── components/        ui/ (Button, Form, Modal, Table, Badge, Feedback, QuantityInput), layout/, TableMap, ItemNote, CancelNotice, DishCard, ImageUpload, ErrorBoundary
│   ├── services/index.js  toàn bộ hàm gọi API
│   ├── stores/            auth.js, cart.js (Zustand + localStorage)
│   └── lib/               api.js (axios), format.js, constants.js, permissions.js, reservation.js, hooks.js, adminMenu.js
├── docs/                  16 tài liệu + api.http
└── docker-compose.yml     PostgreSQL cho dev
```

Bản đồ chi tiết từng file: [docs/08-ban-do-ma-nguon.md](08-ban-do-ma-nguon.md).

### 5.3 Các kỹ thuật nổi bật (nên trình bày kèm đoạn code)

**1. Không tin giá do client gửi** (`orders.service.js`): giỏ hàng gửi lên chỉ có `dishId`, `quantity`, `note`; giá lấy từ DB trong transaction.

```js
// 1. Lấy giá từ DB - KHÔNG BAO GIỜ tin giá do client gửi lên
const dishes = await tx.dish.findMany({ where: { id: { in: [...qtyByDish.keys()] } } });
const items = dishes.map((d) => {
  if (!d.isAvailable) throw ApiError.badRequest(`Món "${d.name}" hiện đã hết`);
  return { dishId: d.id, name: d.name, price: d.salePrice ?? d.price, quantity: qtyByDish.get(d.id), note: noteByDish.get(d.id) ?? null };
});
```

**2. Chống dùng lố lượt mã giảm giá khi nhiều người đặt cùng lúc:** kiểm tra và cộng lượt trong **cùng một câu UPDATE**; PostgreSQL khóa dòng khi UPDATE nên đơn thứ hai phải chờ rồi kiểm tra lại với số lượt mới nhất.

```js
const { count } = await tx.coupon.updateMany({
  where: { id: applied.coupon.id, OR: [{ usageLimit: null }, { usedCount: { lt: tx.coupon.fields.usageLimit } }] },
  data: { usedCount: { increment: 1 } },
});
if (count === 0) throw ApiError.badRequest('Mã giảm giá đã hết lượt sử dụng');
```

**3. Chống đặt trùng bàn bằng transaction Serializable** (`reservations.controller.js`):

```js
return await prisma.$transaction(async (tx) => {
  const table = await assertTableAvailable(tx, tableId, data.date, data.guests);
  return tx.reservation.create({ data: { ...data, code, tableId, area: table.area }, include });
}, { isolationLevel: 'Serializable' });
// P2034: 2 người đặt cùng bàn cùng lúc, người sau bị hủy giao dịch -> trả 409
```

**4. State machine trạng thái đơn** (`orders.service.js`): một bảng khai báo bước hợp lệ, mọi lần đổi trạng thái đều kiểm tra qua bảng này.

```js
export const STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['DELIVERING', 'COMPLETED', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
```

Hủy đơn chạy trong transaction: trả lại số đã bán của từng món và lượt dùng mã.

**5. Kiểm tra chữ ký VNPay** (`vnpay.js`): sắp xếp tham số a-z, ký HMAC-SHA512 bằng khóa bí mật, so sánh bằng `timingSafeEqual` (thời gian so sánh như nhau dù sai ở ký tự nào, không đoán dần được chữ ký).

```js
export function verifySignature(query) {
  const { vnp_SecureHash: received, vnp_SecureHashType, ...rest } = query;
  if (typeof received !== 'string') return false;
  const expected = sign(buildQuery(rest));
  const a = Buffer.from(expected, 'utf-8');
  const b = Buffer.from(received.toLowerCase(), 'utf-8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

**6. Ghi nhận thanh toán đúng một lần (idempotent):** IPN và trang trả về dùng chung `handleVnpayResult`; câu `updateMany where status = 'PENDING'` đảm bảo chỉ một bên cập nhật được, bên còn lại đọc lại kết quả mới nhất.

**7. Chống ghi đè khi 2 nhân viên cùng bấm** (`reservations.controller.js > updateStatus`): điều kiện trạng thái cũ nằm trong `where`; nếu người khác vừa đổi thì `count = 0` → báo 409 "vui lòng tải lại trang".

**8. Mã đơn khó đoán, không trùng** (`utils/helpers.js`): `FAB` + ngày theo giờ Việt Nam + 6 số từ `crypto.randomInt` (1 triệu mã / ngày). Nếu trùng (lỗi unique) thì chạy lại **cả transaction** với mã mới, tối đa 5 lần (lỗi trong transaction PostgreSQL làm hỏng cả transaction nên không thử lại riêng lệnh INSERT được).

**9. Xử lý múi giờ Việt Nam:** server deploy thường chạy giờ UTC.
- Ngày trong mã đơn lấy theo `Asia/Ho_Chi_Minh`.
- Thống kê doanh thu theo ngày dùng SQL thuần: `("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh'`, rồi lấp các ngày không có đơn bằng 0 cho biểu đồ liên tục.
- Đặt bàn: frontend ghép ngày + giờ thành `...T19:00:00+07:00`; backend kiểm tra giờ mở cửa theo UTC+7.

**10. Giới hạn tần suất tự viết** (`middlewares/rateLimit.js`): đếm theo `IP + đường dẫn` trong bộ nhớ, tự dọn bộ đếm hết hạn, trả header `RateLimit-Remaining`, `Retry-After`, lỗi 429.

| API | Giới hạn mỗi IP / 15 phút |
|---|---|
| Đăng ký, đăng nhập, đổi mật khẩu | 20 |
| Đặt món, đặt bàn | 10 |
| Tạo link VNPay | 30 |
| Tra cứu, hủy đơn / lịch bằng mã + SĐT | 60 |
| Sơ đồ bàn | 300 |

**11. Xử lý lỗi tập trung** (`middlewares/error.js`): mọi chỗ chỉ cần `throw ApiError...`; Express 5 tự bắt lỗi của hàm async. Lỗi Prisma được dịch: P2002 → 409 "đã tồn tại", P2025 → 404, P2003 → 409 "đang được sử dụng". Lỗi Multer → 400 "File quá lớn (tối đa 5MB)".

**12. Frontend:**
- **Tải trễ (lazy load)** mọi trang trừ trang chủ → trang chủ tải nhanh.
- **React Query:** cache 30 giây, thử lại 1 lần; `keepPreviousData` khi chuyển trang để không nháy; tự tải lại: chi tiết đơn 15 giây, danh sách đơn admin 30 giây, sơ đồ bàn 30 giây.
- **Axios interceptor:** tự gắn token; gặp 401 thì tự đăng xuất; luôn có thông báo lỗi tiếng Việt từ backend.
- **Mỗi lần mở web gọi lại `/auth/me`** để cập nhật quyền mới nhất (admin vừa đổi quyền / khóa tài khoản).
- **Giỏ hàng lưu localStorage**, giá trong giỏ chỉ để hiển thị.
- **Tìm kiếm có debounce 400ms**, bộ lọc thực đơn lưu trên URL (chia sẻ link được, F5 không mất).
- **Error Boundary** bắt lỗi giao diện, không bị trắng trang.
- **Tiêu đề tab trình duyệt** riêng cho từng trang (`useDocumentTitle`).
- **Đặt lại lịch bị hủy:** truyền thông tin cũ qua `state` của React Router, không hiện SĐT trên URL.

### 5.4 Kết quả: các màn hình đã làm (ảnh cần chụp)

Đăng nhập bằng tài khoản demo ở [mục 5.5](#55-dữ-liệu-mẫu-và-tài-khoản-demo). Gợi ý đặt tên hình theo chương: Hình 3.1, 3.2...

| # | Màn hình | Đường dẫn | Tài khoản | Nên thể hiện trong ảnh |
|---|---|---|---|---|
| 1 | Trang chủ | `/` | Không cần | Banner, danh mục, món nổi bật, ưu đãi |
| 2 | Thực đơn | `/menu?category=tom` | Không cần | Dải danh mục, ô tìm kiếm, sắp xếp, lưới món, phân trang |
| 3 | Chi tiết món | `/menu/tom-su-hap-bia` | Không cần | Giá, đánh giá sao, nút thêm vào giỏ, món liên quan |
| 4 | Giỏ hàng | bấm icon giỏ | Không cần | Ngăn kéo trượt, ô ghi chú khẩu vị đang mở với gợi ý |
| 5 | Thanh toán | `/checkout` | `khach@fab.vn` | 3 bước, mã giảm giá đã áp, tóm tắt tiền |
| 6 | Theo dõi đơn | sau khi đặt | | Dòng thời gian trạng thái, ghi chú món |
| 7 | Trang VNPay + kết quả | khi chọn VNPay | | Cần cấu hình sandbox (xem docs/11) |
| 8 | Tra cứu | `/track`, `/track?tab=reservation` | Không cần | 2 tab |
| 9 | Đặt bàn + sơ đồ bàn | `/reservation`, chọn khu vực "Ngoài trời - view biển" | Không cần | Các màu bàn, bàn đã chọn |
| 10 | Đặt bàn thành công | sau khi đặt | | Mã RSV, bàn đã chọn |
| 11 | Lịch bị hủy có lý do | `/account/reservations` | `khach@fab.vn` (sau khi admin hủy lịch `RSV0000001` kèm lý do) | Khung đỏ lý do + nút đặt lại |
| 12 | Đăng nhập / đăng ký | `/login`, `/register` | | Nút điền nhanh tài khoản demo |
| 13 | Tài khoản | `/account`, `/account/orders` | `khach@fab.vn` | Hồ sơ, lịch sử đơn |
| 14 | Đánh giá món | `/menu/<món trong đơn FAB0000DEMO>` | `khach@fab.vn` | Form chọn sao |
| 15 | Giao diện điện thoại | các trang trên, chế độ giả lập mobile (F12) | | Menu thu gọn, giỏ hàng toàn màn hình |
| 16 | Tổng quan | `/admin` | `admin@fab.vn` | Thẻ số liệu, biểu đồ doanh thu, món bán chạy |
| 17 | Quản lý đơn hàng | `/admin/orders` | `admin@fab.vn` | Tab trạng thái, hộp chi tiết đơn có nút chuyển trạng thái |
| 18 | Quản lý đặt bàn: danh sách | `/admin/reservations` | `letan@fab.vn` | Nút Xác nhận / Hủy, dòng lý do hủy |
| 19 | Quản lý đặt bàn: sơ đồ | `/admin/reservations`, tab "Sơ đồ bàn" | `letan@fab.vn` | Đếm bàn trống / có khách, hộp thông tin khách |
| 20 | Hộp thoại hủy kèm lý do | bấm Hủy | `letan@fab.vn` | Các lý do có sẵn |
| 21 | Quản lý món ăn | `/admin/dishes` + form thêm món | `admin@fab.vn` | Công tắc đang bán, upload ảnh |
| 22 | Danh mục, mã giảm giá, đánh giá | `/admin/categories`, `/admin/coupons`, `/admin/reviews` | `admin@fab.vn` | |
| 23 | Người dùng + tạo nhân viên | `/admin/users` | `admin@fab.vn` | Hộp hiện thông tin đăng nhập một lần |
| 24 | Ma trận phân quyền | `/admin/permissions` (2 chế độ xem) + form sửa quyền | `admin@fab.vn` | Bảng tích quyền |
| 25 | Cùng trang admin nhưng ít quyền | `/admin` | `bep@fab.vn` | Menu chỉ còn Đơn hàng, Món ăn, Danh mục; không có nút Thêm món |
| 26 | Quản lý chỉ được xem ma trận | `/admin/permissions` | `quanly@fab.vn` | Dòng "Bạn chỉ được xem" |

### 5.5 Dữ liệu mẫu và tài khoản demo

Tạo bằng `npm run setup` (hoặc `npm --prefix backend run db:seed`). **Xóa dữ liệu cũ** trước khi tạo.

| Vai trò | Email | Mật khẩu | Thấy gì |
|---|---|---|---|
| Admin | `admin@fab.vn` | `admin123` | Toàn bộ trang quản trị |
| Quản lý | `quanly@fab.vn` | `123456` | Gần hết; Nhân sự & phân quyền chỉ xem |
| Thu ngân | `thungan@fab.vn` | `123456` | Tổng quan, đơn hàng, đặt bàn, món, mã giảm giá |
| Lễ tân | `letan@fab.vn` | `123456` | Đặt bàn (xác nhận / hủy), xem đơn, món, mã giảm giá, đánh giá |
| Bếp | `bep@fab.vn` | `123456` | Đơn hàng, món ăn, danh mục |
| Khách hàng | `khach@fab.vn` | `123456` | Có sẵn đơn hoàn thành `FAB0000DEMO` để thử đánh giá, lịch `RSV0000001` |

Thêm 2 khách mẫu `binh@fab.vn`, `chau@fab.vn` (mật khẩu `123456`), là người viết các đánh giá mẫu.

| Dữ liệu | Số lượng / nội dung |
|---|---|
| Danh mục | 8: Khai vị, Tôm, Cá, Mâm hải sản, Món Nhật, Cơm & Mì, Tráng miệng, Đồ uống |
| Món ăn | 26 món, ảnh từ Unsplash, 7 món nổi bật |
| Đơn hàng | 80 đơn ngẫu nhiên trong 30 ngày (90% hoàn thành, 10% hủy; đơn hôm nay ở đủ trạng thái) + đơn `FAB0000DEMO` |
| Mã giảm giá | `WELCOME10` (giảm 10%, đơn từ 200.000đ, tối đa 50.000đ), `FAB50K` (giảm 50.000đ, đơn từ 500.000đ, 100 lượt), `HAISAN20` (giảm 20%, đơn từ 800.000đ, tối đa 150.000đ); hết hạn sau 60 ngày kể từ lúc seed |
| Đánh giá | 2 đánh giá 4 đến 5 sao cho mỗi món nổi bật |
| Bàn | 23 bàn: Trong nhà T01 đến T12 (2 đến 10 ghế), Ngoài trời B01 đến B08 (2 đến 8 ghế), VIP1 (10), VIP2 (12), VIP3 (20) |
| Đặt bàn | 4 lịch: ngày mai 19:00 bàn B03 (đã xác nhận, sinh nhật), hôm nay 20:00 bàn T01 (chờ), 3 ngày nữa VIP2 tiệc công ty 12 khách (chờ), 2 ngày trước T03 (đã đến) |
| Vai trò | 12 vai trò mặc định với ma trận ở [mục 4.12](#412-thiết-kế-phân-quyền) |

### 5.6 Kiểm thử

**Hiện trạng (nói thật trong báo cáo):** dự án **chưa có kiểm thử tự động** (unit test / API test). Việc kiểm tra gồm:
- Kiểm thử thủ công theo kịch bản trên giao diện và qua `docs/api.http`.
- Lint + build frontend trước mỗi lần hoàn thành: `cd frontend && npx oxlint src && npx vite build`.

**Các ca kiểm thử đề xuất.** Cột "Kết quả mong đợi" suy ra từ code; bạn chạy thử rồi ghi kết quả thật (Đạt / Không đạt) và chụp ảnh nếu cần.

| Mã | Chức năng | Các bước / dữ liệu vào | Kết quả mong đợi | Kết quả |
|---|---|---|---|---|
| TC01 | Đăng ký | Đăng ký bằng email đã có (`khach@fab.vn`) | Báo "Email đã được sử dụng" (409) | |
| TC02 | Đăng nhập | Sai mật khẩu | "Email hoặc mật khẩu không đúng" (401), không nói email có tồn tại hay không | |
| TC03 | Chống dò mật khẩu | Đăng nhập sai 21 lần trong 15 phút | Lần thứ 21 bị chặn, mã 429 | |
| TC04 | Tài khoản bị khóa | Admin khóa `bep@fab.vn`, rồi đăng nhập bằng tài khoản đó | "Tài khoản đã bị khóa" (403); token cũ đang dùng cũng bị từ chối ngay | |
| TC05 | Đặt món | Giao tận nơi, bỏ trống địa chỉ | "Vui lòng nhập địa chỉ giao hàng" | |
| TC06 | Chống sửa giá | Gọi `POST /orders` kèm `price: 1` trong items | Trường lạ bị bỏ, tổng tiền tính theo giá trong DB | |
| TC07 | Phí giao hàng | Đơn giao 300.000đ; đơn giao 600.000đ; đơn đến lấy 300.000đ | Phí lần lượt 20.000đ, 0đ, 0đ | |
| TC08 | Mã giảm giá | `WELCOME10` với tạm tính 150.000đ | "Đơn tối thiểu 200.000đ để dùng mã này" | |
| TC09 | Mã giảm giá | `WELCOME10` với tạm tính 1.000.000đ | Giảm 50.000đ (bị chặn ở mức tối đa, không phải 100.000đ) | |
| TC10 | Món hết hàng | Admin tắt "đang bán" một món đang có trong giỏ, khách đặt | "Món ... hiện đã hết" | |
| TC11 | Khách hủy đơn | Hủy đơn đang Chờ xác nhận có dùng mã | Đơn Đã hủy; số đã bán của món giảm lại; lượt dùng mã giảm 1 | |
| TC12 | Khách hủy đơn | Hủy đơn đã được xác nhận | "Chỉ có thể hủy đơn đang chờ xác nhận" | |
| TC13 | Quy trình đơn | Gọi API chuyển đơn Chờ xác nhận → Hoàn thành | "Không thể chuyển đơn từ PENDING sang COMPLETED" | |
| TC14 | Tự đổi thanh toán | Đơn tiền mặt đi hết quy trình tới Hoàn thành | Thanh toán đổi thành "Đã thanh toán" | |
| TC15 | Tra cứu | Đúng mã đơn, sai SĐT | "Không tìm thấy đơn hàng" (404) | |
| TC16 | Tự cập nhật | Mở trang đơn ở điện thoại, admin xác nhận đơn trên máy tính | Trong tối đa 15 giây trạng thái ở điện thoại tự đổi | |
| TC17 | Giờ đặt bàn | Gọi API đặt lúc 21:30 | "Nhà hàng nhận khách từ 10:00, đặt muộn nhất trước giờ đóng cửa 1 tiếng" | |
| TC18 | Đặt bàn sát giờ | Đặt cho 15 phút nữa | "Vui lòng đặt trước ít nhất 30 phút" | |
| TC19 | Bàn không đủ ghế | 4 khách, chọn bàn T01 (2 ghế) | Trên sơ đồ bàn hiện "Không đủ ghế", không bấm được; gọi API thì báo "Bàn T01 chỉ có 2 ghế..." | |
| TC20 | Trùng bàn | Đặt bàn T01 lúc 21:00 hôm nay (đã có lịch 20:00) | Bàn hiện màu vàng; gọi API báo "đã có khách đặt vào khung giờ này" (409) | |
| TC21 | Đặt cùng lúc | Hai trình duyệt cùng chọn 1 bàn trống, bấm đặt gần như cùng lúc | Chỉ 1 lịch được tạo, người còn lại nhận 409 và sơ đồ tự tải lại | |
| TC22 | Hủy lịch không lý do | Gọi `PATCH /reservations/:id/status` với `CANCELLED`, không có `reason` | "Vui lòng nhập lý do hủy" (400); trên giao diện nút Hủy lịch bị mờ | |
| TC23 | Đặt lại sau khi bị hủy | Khách mở lịch bị hủy, bấm "Đặt lại ngày/giờ khác" | Form điền sẵn tên, SĐT, email, số khách, khu vực | |
| TC24 | Hủy lịch đã qua | Khách hủy lịch có ngày đã qua | "Lịch đặt bàn đã qua, không thể hủy" | |
| TC25 | Đánh giá | Khách đánh giá món chưa từng nhận | "Bạn cần đặt và nhận món này trước khi đánh giá" (403) | |
| TC26 | Đánh giá lại | Đánh giá lại cùng món | Cập nhật đánh giá cũ, không thêm dòng mới; điểm trung bình tính lại | |
| TC27 | Phân quyền giao diện | Đăng nhập `bep@fab.vn`, gõ `/admin/coupons` | Bị chuyển về trang admin được phép; menu không có Mã giảm giá | |
| TC28 | Phân quyền API | Dùng token của `bep@fab.vn` gọi `GET /coupons` | 403 "Bạn không có quyền thực hiện thao tác này" | |
| TC29 | Chống tự nâng quyền | `quanly@fab.vn` gọi `PUT /permissions/roles/:id` | 403 | |
| TC30 | Bảo vệ tài khoản ADMIN | `quanly@fab.vn` đặt lại mật khẩu của `admin@fab.vn` | "Chỉ quản trị viên (ADMIN) mới được thay đổi tài khoản này" (403) | |
| TC31 | Upload ảnh | Upload file PDF; upload ảnh 6MB | "Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF"; "File quá lớn (tối đa 5MB)" | |
| TC32 | Xóa món đã bán | Xóa một món có trong đơn cũ | Món chuyển sang ngừng bán, không bị xóa | |
| TC33 | Xóa danh mục | Xóa danh mục còn món | "Danh mục đang có N món, hãy chuyển hoặc xóa món trước" | |
| TC34 | VNPay thành công | Cấu hình sandbox, thanh toán bằng thẻ test | Trang kết quả "Thanh toán thành công!", đơn Đã thanh toán, admin thấy lịch sử giao dịch | |
| TC35 | VNPay giả mạo | Sửa `vnp_ResponseCode` trên URL trang kết quả rồi tải lại | "Dữ liệu thanh toán không hợp lệ (sai chữ ký)" | |
| TC36 | Giao diện mobile | Mở các trang ở chiều rộng 375px | Không tràn ngang, menu thu gọn hoạt động | |

Sau khi thử xong, xóa dữ liệu thử đã tạo (đơn, lịch, tài khoản) hoặc chạy lại `npm run setup`.

### 5.7 Triển khai (deploy)

Gợi ý dịch vụ có gói miễn phí (chi tiết ở [docs/02 mục 5](02-cai-dat-va-chay.md)):

| Phần | Dịch vụ |
|---|---|
| CSDL | Neon.tech, Supabase |
| Backend | Render.com, Railway.app (build: `npm install && npx prisma generate && npx prisma migrate deploy`, start: `npm start`) |
| Frontend | Vercel, Netlify (`VITE_API_URL` trỏ tới backend; thêm rewrite để F5 ở mọi đường dẫn không lỗi 404) |

Lưu ý khi deploy: đổi `JWT_SECRET`; đặt `CORS_ORIGIN` đúng domain frontend; ảnh upload lưu trên ổ đĩa sẽ mất khi Render gói miễn phí deploy lại (nên chuyển sang Cloudinary); chạy sau proxy thì thêm `app.set('trust proxy', 1)` để lấy đúng IP khách. [Tự điền nếu bạn đã deploy: link, dịch vụ đã dùng]

---

## 6. Bảo mật

| # | Mối nguy | Cách dự án chống | Ở đâu |
|---|---|---|---|
| 1 | Lộ DB thì lộ mật khẩu | Chỉ lưu hash bcrypt (cost 10) | `auth.service.js` |
| 2 | Trả `passwordHash` ra ngoài | `toPublicUser()` loại bỏ; trang admin chỉ `select` trường an toàn | `auth.service.js`, `users.controller.js` |
| 3 | Giả mạo token | JWT ký bằng `JWT_SECRET` trong `.env` (không đưa lên git) | `middlewares/auth.js` |
| 4 | Gọi API quản trị khi không có quyền | `requirePermission` / `requireAdmin` ở mọi route quản trị; quyền đọc từ DB mỗi request | `*.routes.js` |
| 5 | Sửa giá trong giỏ | Giá lấy từ DB khi tạo đơn | `orders.service.js` |
| 6 | Gửi dữ liệu bẩn / trường lạ (vd `role: "ADMIN"`) | Zod kiểm tra kiểu, độ dài, định dạng và bỏ trường lạ | `*.validation.js` |
| 7 | SQL injection | Prisma truyền tham số an toàn; `$queryRaw` dạng tagged template cũng vậy | |
| 8 | Dò mật khẩu, dò SĐT, spam đơn ảo | Rate limit → 429 | `middlewares/rateLimit.js` |
| 9 | Dò email nào tồn tại | Cùng một thông báo cho sai email và sai mật khẩu | `auth.service.js > login` |
| 10 | Xem đơn / lịch của người khác | Phải là chủ, nhân viên có quyền, hoặc đúng SĐT; sai trả 404 | `findAccessibleOrder`, `findAccessible` |
| 11 | Giả mạo kết quả thanh toán | Chữ ký HMAC-SHA512, kiểm tra số tiền, so sánh `timingSafeEqual`; trang kết quả không tự đọc mã thành công mà hỏi backend | `vnpay.js`, `PaymentResult.jsx` |
| 12 | Ghi nhận thanh toán 2 lần | UPDATE có điều kiện `status = PENDING` | `payments.service.js` |
| 13 | Tự nâng quyền | Chỉ ADMIN sửa ma trận; không sửa chính mình; không đụng ADMIN / Chủ | `users.controller.js`, `permissions.routes.js` |
| 14 | Tài khoản bị khóa vẫn dùng token cũ | Mỗi request kiểm tra `isActive` trong DB | `middlewares/auth.js > loadUser` |
| 15 | Upload file độc hại / quá lớn | Chỉ nhận ảnh, ≤ 5MB, tên file ngẫu nhiên | `middlewares/upload.js` |
| 16 | Body khổng lồ làm treo server | `express.json({ limit: '1mb' })` | `app.js` |
| 17 | Lỗ hổng phổ biến của trình duyệt | `helmet` thêm header bảo mật | `app.js` |
| 18 | Website lạ gọi API | CORS chỉ cho phép `CORS_ORIGIN` | `app.js` |
| 19 | Lộ chi tiết lỗi | Chỉ trả `stack` khi `NODE_ENV=development` | `middlewares/error.js` |
| 20 | Lộ khóa bí mật lên GitHub | `.env` nằm trong `.gitignore`, chỉ commit `.env.example` | `.gitignore` |

**Còn thiếu (nên nêu ở phần hạn chế):** token lưu ở localStorage (nếu web bị chèn mã độc XSS thì có thể bị lấy; mạnh hơn là cookie `httpOnly` + refresh token); chưa có thu hồi token; chưa xác thực email / quên mật khẩu; rate limit lưu trong RAM (chạy nhiều server cần Redis).

---

## 7. Kết luận và hướng phát triển

### 7.1 Kết quả đạt được

- Hoàn thành website khách hàng với 18 chức năng (KH01 đến KH18) và trang quản trị với 9 chức năng (QT01 đến QT09).
- Một REST API 54 endpoint dùng chung, sẵn sàng cho app mobile; đã có đặc tả 25 màn hình app.
- Phân quyền chi tiết 12 vai trò × 11 chức năng × 4 quyền, chặn ở cả backend và giao diện, có cơ chế chống tự nâng quyền.
- Tích hợp thanh toán VNPay (sandbox) đúng quy trình: chữ ký, IPN, trang trả về, ghi nhận một lần, lưu lịch sử để đối soát.
- Đặt bàn có sơ đồ bàn trực quan, chặn đặt trùng kể cả khi nhiều người đặt cùng lúc.
- Đảm bảo đúng dữ liệu: tính tiền ở server, transaction, state machine, lưu giá tại thời điểm đặt, xử lý múi giờ Việt Nam.
- Bộ tài liệu 16 file giải thích kiến trúc, CSDL, API, từng tính năng, cách sửa và bài tập.
- Về bản thân: [Tự điền: kiến thức, kỹ năng học được]

### 7.2 Hạn chế

| Hạn chế | Ghi chú |
|---|---|
| Chưa có kiểm thử tự động | Mới kiểm thử thủ công + lint + build |
| Cập nhật trạng thái bằng polling (15 đến 30 giây) | Chưa realtime, admin chưa có chuông báo đơn mới |
| 4 chức năng trong ma trận chưa có trang | Phiếu bếp, Hồ hải sản & nhập hàng, Thu ngân & thanh toán, Thiết bị & vệ sinh (quyền đã lưu sẵn) |
| Chưa có trang quản lý bàn | Thêm / sửa / tắt bàn đang làm qua Prisma Studio; admin chưa xếp bàn cho lịch khách không chọn bàn |
| Chưa có gọi món tại bàn | Đơn chỉ có giao tận nơi / đến lấy |
| Món chưa có tùy chọn | Chưa chọn size, cách chế biến; hải sản bán theo kg chưa tính theo cân thực tế |
| Mã giảm giá chỉ giới hạn tổng lượt | Chưa giới hạn số lần mỗi khách được dùng |
| Đổi giờ / số khách của lịch đặt bàn | Chưa sửa được, phải hủy rồi đặt lại |
| Chưa có thông báo email / SMS | Khách phải tự vào xem khi đơn đổi trạng thái hay lịch bị hủy |
| Thanh toán | VNPay mới chạy sandbox; hoàn tiền phải làm tay trên trang VNPay; chưa có MoMo / QR chuyển khoản |
| Đánh giá | Admin chỉ xóa được, chưa phản hồi hay ẩn đánh giá |
| Báo cáo | Chưa xuất Excel / PDF |
| Bảo mật | Token ở localStorage, chưa có refresh token, chưa quên mật khẩu; rate limit trong RAM |
| Ảnh upload | Lưu trên ổ đĩa server, mất khi deploy lại trên một số dịch vụ |
| Chưa có app mobile | Mới có đặc tả |

### 7.3 Hướng phát triển

1. Làm **app mobile Flutter** cho khách theo đặc tả [docs/16](16-dac-ta-app-mobile-stitch.md), dùng lại toàn bộ API.
2. **Realtime bằng Socket.IO:** admin có chuông báo đơn mới, khách thấy trạng thái đổi ngay.
3. **Gọi món tại bàn bằng mã QR** + **màn hình bếp** hiện món và ghi chú khẩu vị theo thứ tự đơn (dùng quyền KITCHEN đã có).
4. Trang **quản lý bàn** (kéo thả bố cục), xếp bàn cho lịch chưa chọn bàn, đánh dấu bàn có khách vãng lai.
5. **Tùy chọn món** (size, cách chế biến), bán hải sản theo cân.
6. Trang **Thu ngân** (in hóa đơn, chốt ca, đối soát VNPay) và **Hồ hải sản** (nhập / xuất hàng, báo hải sản hết).
7. **Thông báo email / SMS / Zalo** khi xác nhận, hủy đơn hay lịch; **quên mật khẩu** qua email.
8. Thêm cổng **MoMo**, **QR chuyển khoản (VietQR)**.
9. **Tích điểm thành viên**, giới hạn lượt dùng mã theo từng khách, món yêu thích.
10. **Kiểm thử tự động** (vitest + supertest), **CI** bằng GitHub Actions (lint, test, build mỗi lần push).
11. **Bảo mật:** cookie `httpOnly` + refresh token, rate limit bằng Redis, giám sát lỗi (Sentry).
12. **Hạ tầng:** ảnh lên Cloudinary / S3, Docker hóa cả backend + frontend, deploy chính thức.

---

## 8. Tài liệu tham khảo

Tài liệu chính thức của các công nghệ đã dùng (ghi ngày truy cập khi đưa vào báo cáo):

1. React: https://react.dev
2. Vite: https://vite.dev
3. Tailwind CSS: https://tailwindcss.com/docs
4. React Router: https://reactrouter.com
5. TanStack Query: https://tanstack.com/query/latest
6. Zustand: https://zustand.docs.pmnd.rs
7. React Hook Form: https://react-hook-form.com
8. Recharts: https://recharts.org
9. Node.js: https://nodejs.org/docs
10. Express: https://expressjs.com
11. Prisma: https://www.prisma.io/docs
12. PostgreSQL (transaction isolation): https://www.postgresql.org/docs/current/transaction-iso.html
13. Zod: https://zod.dev
14. JSON Web Token, RFC 7519: https://datatracker.ietf.org/doc/html/rfc7519
15. bcrypt.js: https://github.com/dcodeIO/bcrypt.js
16. VNPay, tài liệu tích hợp cổng thanh toán: https://sandbox.vnpayment.vn/apis/
17. OWASP Top 10: https://owasp.org/www-project-top-ten/
18. MDN Web Docs (HTTP, CORS): https://developer.mozilla.org
19. Tài liệu nội bộ dự án: thư mục `docs/` (01 đến 16)

[Tự điền thêm giáo trình, sách của trường nếu có]

---

## 9. Phụ lục

### Phụ lục A: Câu hỏi hội đồng hay hỏi và gợi ý trả lời

| Câu hỏi | Gợi ý trả lời |
|---|---|
| Vì sao không tin giá client gửi lên? | Request có thể bị sửa bằng công cụ trình duyệt. Giỏ hàng chỉ gửi mã món và số lượng; backend đọc giá từ DB trong transaction (mục 5.3.1) |
| Hai người dùng mã giảm giá chỉ còn 1 lượt cùng lúc thì sao? | Kiểm tra và cộng lượt trong cùng một câu UPDATE có điều kiện; PostgreSQL khóa dòng nên người sau chờ rồi thấy hết lượt (mục 5.3.2) |
| Hai người đặt cùng một bàn cùng lúc thì sao? | Kiểm tra + tạo trong transaction mức Serializable; người sau bị hủy giao dịch (lỗi P2034) và nhận 409, sơ đồ tự tải lại (mục 5.3.3) |
| Làm sao biết kết quả VNPay là thật? | Dữ liệu VNPay gửi về có chữ ký HMAC-SHA512 tạo bằng khóa bí mật chỉ mình và VNPay giữ; backend ký lại và so sánh, kiểm tra cả số tiền. Trang kết quả không tự đọc mã thành công trên URL |
| IPN khác gì Return URL? | IPN: máy chủ VNPay gọi thẳng backend, chạy cả khi khách tắt trình duyệt, đáng tin nhất. Return URL: khách được đưa về web. Cả hai dùng chung hàm xử lý, chỉ ghi nhận một lần |
| JWT là gì, lưu ở đâu, có rủi ro gì? | Chuỗi đã ký chứa id và loại tài khoản, hết hạn sau 7 ngày, lưu ở localStorage. Rủi ro: nếu bị XSS có thể bị lấy; hướng cải tiến là cookie `httpOnly` + refresh token |
| Ẩn nút ở frontend có đủ để phân quyền không? | Không. Frontend ẩn chỉ để gọn giao diện; mọi API quản trị đều kiểm tra quyền ở backend, quyền đọc từ DB mỗi request |
| Nhân viên có tự nâng quyền được không? | Không: chỉ ADMIN sửa ma trận, không ai sửa được chính mình, nhân viên không đụng được tài khoản ADMIN / Chủ, Zod bỏ trường `role` lạ |
| Vì sao tiền dùng số nguyên? | Tránh sai số số thực; VNĐ không có phần lẻ |
| Vì sao OrderItem lưu lại tên và giá? | Món đổi giá / đổi tên sau này thì đơn cũ vẫn đúng số tiền đã trả |
| Vì sao có bảng Payment riêng? | Một đơn có thể thanh toán nhiều lần (lần đầu hủy, lần sau trả); cần lưu mã giao dịch VNPay để đối soát khiếu nại |
| `soldCount`, `ratingAvg` lưu sẵn có vi phạm chuẩn hóa không? | Có, đó là phi chuẩn hóa có chủ đích để sắp xếp / hiển thị nhanh; được cập nhật trong transaction khi đặt / hủy đơn và khi đánh giá |
| Khách không đăng nhập xem đơn thế nào, có lộ đơn người khác không? | Phải biết cả mã đơn (khó đoán, 6 số ngẫu nhiên) và đúng SĐT; sai thì trả 404; có rate limit chống dò |
| Mã đơn sinh thế nào, có trùng không? | Tiền tố + ngày giờ VN + 6 số `crypto.randomInt`; cột `code` là unique, trùng thì chạy lại cả transaction với mã mới |
| Xử lý múi giờ thế nào? | DB lưu UTC; mọi chỗ tính ngày (mã đơn, thống kê, đặt bàn) đổi sang giờ Việt Nam rõ ràng (mục 5.3.9) |
| Vì sao chọn PostgreSQL thay vì MongoDB? | Dữ liệu có quan hệ chặt (đơn - món - người dùng - bàn), cần transaction và mức cô lập Serializable |
| Server chạy nhiều máy thì rate limit thế nào? | Bản hiện tại đếm trong RAM của 1 server; nhiều server cần lưu bộ đếm ở Redis |
| Vì sao đơn chuyển trạng thái phải theo thứ tự? | Dùng state machine để không thể nhảy bước sai (vd chưa xác nhận đã hoàn thành), giữ đúng quy trình và đúng trạng thái thanh toán |
| Có kiểm thử chưa? | Đã kiểm thử thủ công theo kịch bản (mục 5.6), chưa có test tự động; đây là hạn chế và hướng phát triển |

### Phụ lục B: Kịch bản demo khi bảo vệ (khoảng 10 phút)

Chuẩn bị: chạy `npm run setup` trước buổi bảo vệ cho dữ liệu sạch; mở 2 trình duyệt (hoặc 1 điện thoại + 1 máy tính cùng mạng).

1. **Trang khách (điện thoại):** trang chủ → thực đơn, lọc "Tôm", tìm "cá hồi" → chi tiết món → thêm 2 món vào giỏ, ghi chú "ít cay" bằng nút gợi ý.
2. **Thanh toán:** áp mã `WELCOME10`, chỉ phí ship / miễn phí → đặt hàng tiền mặt → trang theo dõi đơn.
3. **Admin (máy tính, `admin@fab.vn`):** trang Đơn hàng → mở đơn vừa đặt, chỉ ghi chú món → bấm Xác nhận, Bắt đầu chế biến → quay lại điện thoại: trạng thái tự đổi.
4. **Đặt bàn (điện thoại):** chọn khu "Ngoài trời - view biển", 19:00 ngày mai → chỉ bàn B03 đang có khách (đỏ) → chọn bàn trống → đặt thành công, có mã RSV.
5. **Lễ tân (`letan@fab.vn`):** trang Đặt bàn, chế độ Sơ đồ bàn → thấy bàn vừa đặt màu vàng → Hủy kèm lý do "Hết bàn vào khung giờ này" → khách tra cứu thấy lý do, bấm Đặt lại.
6. **Phân quyền:** đăng nhập `bep@fab.vn` → menu chỉ còn 3 mục, không có nút Thêm món → `admin@fab.vn` mở Ma trận, cấp cho Bếp quyền Xem mã giảm giá → Bếp tải lại trang thấy mục mới.
7. **Tổng quan:** biểu đồ doanh thu 30 ngày, món bán chạy.
8. (Nếu đã cấu hình VNPay sandbox) đặt đơn VNPay, thanh toán bằng thẻ test, xem lịch sử giao dịch trong admin.

### Phụ lục C: Thuật ngữ

| Thuật ngữ | Nghĩa |
|---|---|
| API / REST | Giao diện để chương trình gọi nhau; REST là kiểu API dùng URL + phương thức HTTP |
| Endpoint | Một địa chỉ API cụ thể, vd `POST /api/v1/orders` |
| SPA | Ứng dụng web một trang |
| ORM | Công cụ ánh xạ bảng DB thành đối tượng trong code |
| Migration | Một lần thay đổi cấu trúc DB, có lưu lịch sử |
| Seed | Dữ liệu mẫu tạo sẵn |
| Transaction | Nhóm thao tác thành công hết hoặc hoàn tác hết |
| Serializable | Mức cô lập cao nhất của transaction |
| JWT | Token đã ký dùng để xác thực |
| Hash / bcrypt | Băm một chiều / thuật toán băm mật khẩu |
| Middleware | Hàm chạy chen giữa request và xử lý chính (kiểm tra token, dữ liệu...) |
| RBAC | Phân quyền theo vai trò |
| State machine | Máy trạng thái: quy định trạng thái nào được chuyển sang trạng thái nào |
| IPN | Instant Payment Notification: cổng thanh toán báo kết quả thẳng về server |
| HMAC | Mã xác thực thông điệp dùng khóa bí mật |
| Idempotent | Gọi nhiều lần cho kết quả như gọi một lần |
| Rate limit | Giới hạn số lần gọi trong một khoảng thời gian |
| CORS | Cơ chế trình duyệt cho phép / chặn gọi API khác tên miền |
| Polling | Hỏi lại server theo chu kỳ |
| Debounce | Chờ người dùng ngừng thao tác một lúc mới xử lý |
| Slug | Chuỗi không dấu dùng trong URL |
| Denormalization | Phi chuẩn hóa: lưu sẵn dữ liệu tổng hợp |
| COD | Thanh toán khi nhận hàng |

### Phụ lục D: Tài liệu cũ chưa khớp với code hiện tại

Khi chép từ các tài liệu khác trong `docs/` vào báo cáo, lưu ý mấy chỗ đã cũ (file này đã dùng thông tin đúng):

| Tài liệu | Chỗ cũ | Thực tế hiện tại |
|---|---|---|
| [01](01-tong-quan-kien-truc.md) mục 5 | Chỉ có CUSTOMER và ADMIN, middleware `requireAdmin` | Có thêm STAFF + ma trận quyền, route quản trị dùng `requirePermission` |
| [03](03-database-prisma.md) mục 1 | ERD 9 bảng, `role` chỉ "CUSTOMER \| ADMIN" | 12 bảng (thêm StaffRole, RolePermission, DiningTable), có STAFF, thêm cột `OrderItem.note`, `Reservation.tableId`, `cancelReason` |
| [10](10-so-tay-toan-tap.md) mục 26 | "8 bảng" | 12 bảng |
| [10](10-so-tay-toan-tap.md) mục 27 dòng 4 | "`requireAdmin` ở mọi route admin" | `requirePermission` theo từng chức năng |
| [10](10-so-tay-toan-tap.md) mục 33 | "Đặt bàn chưa kiểm tra còn bàn trống" | Đã có sơ đồ bàn và chặn đặt trùng giờ |
| [07](07-lo-trinh-hoc-va-bai-tap.md) bài tập 8a, 15, 16 | Ghi là bài tập | Đã làm: rate limit cho đặt món / đặt bàn, VNPay, quản lý bàn + kiểm tra bàn trống |
