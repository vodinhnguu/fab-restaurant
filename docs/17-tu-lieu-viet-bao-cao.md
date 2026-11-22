# 17. Tư liệu để viết báo cáo dự án FAB Seafood

Tài liệu này gom **mọi thông tin cần để viết một bản báo cáo đồ án** về dự án, sắp theo bố cục báo cáo hay dùng: Mở đầu → Chương 1 (tổng quan, cơ sở lý thuyết) → Chương 2 (phân tích, thiết kế) → Chương 3 (cài đặt, kết quả, kiểm thử) → Kết luận → Phụ lục.

- Mọi số liệu, quy tắc, sơ đồ đều lấy từ **code thật**, không lấy từ tài liệu cũ. Bản đầu viết theo commit `801bacc` (27/10/2026); **cập nhật 19/11/2026** thêm: lý do hủy đơn hàng, tài khoản nhân viên demo, Chủ nhà hàng ngang quyền Admin, trang **Vệ sinh** (tạp vụ), **Lễ tân chuyển / xếp bàn**, trang **Kỹ thuật** (thiết bị, sửa chữa, bảo trì); **cập nhật 22/11/2026** thêm: thực đơn hải sản mới 12 nhóm / 70 món, hải sản sống **bán theo kg** (web không đặt online được, tại quán hồ hải sản **cân** rồi mới tính tiền, trang **Cân hải sản**), khối **Best seller** ở trang chủ ([docs/24](24-thuc-don-ban-theo-kg.md)).
- **Chưa đưa vào tài liệu này:** phần ăn tại quán / app nhân viên phục vụ làm ngày 20, 21/11 ([docs/23](23-app-nhan-vien-phuc-vu.md): phục vụ ghi món tại bàn trên app, Phiếu bếp, Thanh toán tại bàn, in bill). Các bảng kiểm kê lấy từ code (số liệu mục 1, danh sách API 4.11, enum và migration 4.10, cột "Đã có trang" 4.12, sơ đồ trang 4.13) đã tính cả phần này; còn tác nhân, use case, quy tắc, sơ đồ, màn hình, ca kiểm thử của phần ăn tại quán thì chưa viết (chỗ nào còn ghi app mobile là app cho khách, "chưa có gọi món tại bàn / màn hình bếp" là chỗ chưa cập nhật).
- Thêm tính năng mới thì cập nhật file này ở các mục: 1 (số liệu), 2.5 (tiến độ), 4.1 + 4.4 (tác nhân, bảng tác nhân × use case), 4.2, 4.5, 4.6, 4.7, 4.10, 4.11, 4.12, 4.13, 5.4, 5.6, 7.
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
| Loại sản phẩm | Ứng dụng web (SPA) + REST API dùng chung; app mobile Flutter cho nhân viên phục vụ ([docs/19](19-app-mobile.md), [docs/23](23-app-nhan-vien-phuc-vu.md)) |
| Người thực hiện | [Tự điền] (làm một mình) |
| Giảng viên hướng dẫn | [Tự điền] |
| Thời gian thực hiện | 01/10/2026 đến 22/11/2026 (23 commit tính đến 22/11; trang Kỹ thuật và các phần làm sau đó chưa commit; khi chốt báo cáo đếm lại bằng `git rev-list --count HEAD`) |
| Mã nguồn | Repo GitHub công khai [Tự điền link] |
| Bối cảnh giả định | Nhà hàng hải sản ở Đà Nẵng (địa chỉ mẫu: 123 Võ Nguyên Giáp, Sơn Trà), mở cửa 10:00 đến 22:00, 3 khu vực ăn |

**Số liệu đo trên code (dùng cho phần tóm tắt / kết quả):**

| Hạng mục | Số lượng |
|---|---|
| Backend (`backend/src`) | 64 file JavaScript, khoảng 4.000 dòng |
| Schema + dữ liệu mẫu (`backend/prisma`) | khoảng 1.100 dòng (`schema.prisma`, `seed.js`, `seed-staff.js`, `menu.js`), 14 lần migration |
| Frontend (`frontend/src`) | 84 file, khoảng 8.300 dòng |
| Tài liệu (`docs/`) | 23 file Markdown khác, khoảng 6.000 dòng (chưa tính file này) |
| Bảng dữ liệu | 17 bảng, 14 kiểu liệt kê (enum) |
| API | 94 endpoint: 15 module + 2 route chung (`/health`, `/info`) |
| Trang giao diện | 36 trang: 12 trang khách, 3 trang tài khoản, 21 trang quản trị (9 trang chung + 4 trang Vệ sinh + 4 trang Kỹ thuật + 4 trang Tại quán: Cân hải sản, Phiếu bếp, Thanh toán tại bàn, In bill) |
| Thực đơn | 12 nhóm, 70 món: 28 món hải sản sống **bán theo kg** (Tôm hùm, Tôm sú, Cua, Cá mú, Tôm tít), 42 món bán theo phần / lon / chai (Hàu, Sò điệp, Nghêu, Cháo, Cơm, Rau, Nước uống); 8 món Best seller |
| Phân quyền | 3 loại tài khoản, 12 vai trò nhân viên × 12 chức năng × 4 quyền (Xem / Thêm / Sửa / Xóa) |
| Sơ đồ bàn | 23 bàn ở 3 khu vực (Trong nhà 12, Ngoài trời view biển 8, Phòng VIP 3) |
| Vệ sinh | 10 khu vực mặc định (khu rửa chén bát, quầy rửa ly, 2 nhà vệ sinh, sảnh, sàn phòng ăn, sân ngoài trời, phòng VIP, sàn bếp, khu rác) |
| Thiết bị | 18 thiết bị mặc định, 6 nhóm (Điện lạnh, Hồ hải sản, Bếp, Điện nước, An toàn, Khác) |
| Dữ liệu mẫu | 12 nhóm, 70 món, 81 đơn hàng, 3 mã giảm giá, 4 lịch đặt bàn, 15 tài khoản (1 admin, 3 khách, 11 nhân viên mỗi vai trò 1 người), việc vệ sinh 7 ngày, phiếu sửa chữa 30 ngày |

---

## 2. Mở đầu

### 2.1 Lý do chọn đề tài (ý để viết)

- Khách hàng ngày càng quen đặt đồ ăn và đặt bàn qua mạng thay vì gọi điện.
- Nhà hàng nhỏ khi bán qua các ứng dụng giao đồ ăn trung gian phải trả phí hoa hồng; có website riêng thì chủ động khách hàng, giá và khuyến mãi.
- Đặt bàn qua điện thoại dễ nhầm giờ, trùng bàn, khó biết bàn nào còn trống ở từng khung giờ.
- Hải sản tươi sống hết hàng theo ngày, cần bật / tắt món nhanh để khách không đặt món đã hết.
- Nhà hàng có nhiều bộ phận (lễ tân, thu ngân, bếp, phục vụ...), mỗi bộ phận chỉ nên thấy và làm đúng phần việc của mình.
- Ngoài phục vụ khách còn việc hậu cần: vệ sinh (nhà vệ sinh hết giấy, sàn ướt), bảo trì thiết bị (tủ đông, máy sục khí hồ hải sản hỏng là mất hàng). Giao việc bằng lời nói và ghi sổ tay thì dễ quên, khó biết ai đã làm, tốn bao nhiêu tiền sửa.
- Thanh toán online (VNPay, QR ngân hàng) đã phổ biến ở Việt Nam.
- Về mặt học tập: đề tài đi qua đủ các phần của một ứng dụng thật: giao diện, API, cơ sở dữ liệu, xác thực, phân quyền, thanh toán, xử lý đồng thời.

### 2.2 Mục tiêu

1. Xây dựng website cho khách: xem thực đơn, đặt món (giao tận nơi hoặc đến lấy), áp mã giảm giá, thanh toán tiền mặt hoặc VNPay, theo dõi đơn, đặt bàn có chọn bàn trên sơ đồ, đánh giá món.
2. Xây dựng trang quản trị: thống kê doanh thu, xử lý đơn hàng và lịch đặt bàn (lễ tân xếp / chuyển bàn trên sơ đồ), quản lý món, danh mục, mã giảm giá, đánh giá, tài khoản nhân viên; trang công việc cho bộ phận hậu cần: **vệ sinh** (tạp vụ) và **kỹ thuật** (báo hỏng, sửa chữa, bảo trì định kỳ, chi phí).
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
- App mobile hoàn chỉnh (đặc tả 25 màn hình ở [docs/16](16-dac-ta-app-mobile-stitch.md), đang làm theo [docs/19](19-app-mobile.md)); app cho nhân viên.
- Gọi món tại bàn (POS), màn hình bếp, quản lý kho, nhập / xuất và tồn kho hồ hải sản (mới có phần cân hải sản bán theo kg), chấm công.
- Nhiều chi nhánh, giao hàng có theo dõi vị trí shipper.
- Nhận tiền thật qua VNPay (cần ký hợp đồng với VNPay).

### 2.4 Phương pháp thực hiện

- **Khảo sát:** tìm hiểu quy trình đặt món, đặt bàn, các bộ phận trong nhà hàng hải sản; tham khảo website các nhà hàng. [Tự điền thêm nếu có khảo sát thật]
- **Phát triển tăng dần (incremental):** làm bản lõi trước (thực đơn, giỏ hàng, đặt món, đặt bàn, admin), sau đó mỗi đợt thêm một tính năng lớn (VNPay, phân quyền, sơ đồ bàn, lý do hủy, ghi chú món, vệ sinh, chuyển bàn, kỹ thuật, thực đơn bán theo kg).
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
| 12/11/2026 | Tài khoản nhân viên demo cho mọi vai trò; Chủ nhà hàng ngang quyền Admin; lý do hủy đơn hàng (khách xem được); tư liệu viết báo cáo |
| 15/11/2026 | App mobile Flutter bước 0 và 1: khung app, theme, 25 màn giữ chỗ, gọi API, đăng nhập, giỏ hàng, test |
| 19/11/2026 | Trang Vệ sinh cho tạp vụ; lễ tân: tab Hôm nay, chuyển / xếp bàn có lịch sử; trang Kỹ thuật: thiết bị, phiếu sửa chữa, bảo trì định kỳ, nút Báo hỏng cho mọi bộ phận |
| 22/11/2026 | Thực đơn hải sản mới 12 nhóm / 70 món (`prisma/menu.js`, lệnh `db:seed-menu` đổi thực đơn không xóa đơn cũ); hải sản sống bán theo kg: web không cho đặt online (nút "Đặt bàn để thưởng thức"), tại quán món vào "Chờ cân", trang **Cân hải sản** cho hồ hải sản nhập số kg rồi mới tính tiền; khối Best seller ở trang chủ, chip lọc Best seller ở Thực đơn (chưa commit) |

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
2. **Đặt bàn:** khách chọn ngày giờ, số khách, khu vực, có thể chọn bàn → lễ tân gọi xác nhận, xếp bàn nếu khách chưa chọn, chuyển bàn khi khách muốn đổi chỗ → khách đến (đánh dấu "đã đến") hoặc nhà hàng hủy kèm lý do.
3. **Quản lý thực đơn:** món có giá gốc, giá khuyến mãi, đơn vị (phần, kg, lon, chai...), bật / tắt khi hết hàng, đánh dấu món Best seller để giới thiệu ở trang chủ.
4. **Khuyến mãi:** mã giảm theo % hoặc số tiền, có đơn tối thiểu, giảm tối đa, số lượt, thời gian hiệu lực.
5. **Nhân sự:** mỗi bộ phận có quyền riêng.
6. **Vệ sinh:** quản lý / tổ trưởng giao việc, phục vụ / lễ tân / bếp báo chỗ cần dọn → tạp vụ nhận việc, làm xong bấm hoàn thành → lưu lịch sử ai dọn khu nào lúc nào (thay tờ giấy ký tên dán ở cửa nhà vệ sinh). Dọn bàn sau khi khách về là việc của phục vụ.
7. **Kỹ thuật:** nhân viên bất kỳ báo thiết bị hỏng → kỹ thuật nhận sửa, có thể chờ linh kiện → sửa xong ghi cách xử lý và chi phí. Thiết bị quan trọng có lịch bảo trì định kỳ (máy sục khí hồ 30 ngày, máy lạnh 90 ngày...).
8. **Bán hải sản sống theo kg:** tôm hùm, tôm sú, cua, cá mú, tôm tít bơi trong hồ, niêm yết giá 1 kg. Khách chọn con tại hồ → phục vụ gọi món (chọn cách chế biến) → nhân viên hồ hải sản bắt con, cân → tiền = giá 1 kg × số kg thực tế → bếp chế biến → thu ngân in bill ghi rõ số kg. Vì phải chọn con và cân tại chỗ nên món theo kg **không bán giao hàng online**; các món theo phần (hàu, sò điệp, nghêu, cháo, cơm, rau, nước) vẫn đặt online được.

**Các bộ phận trong nhà hàng** (12 vai trò tạo sẵn, `backend/src/config/permissions.js`):

| Vai trò | Công việc chính |
|---|---|
| Chủ nhà hàng | Toàn quyền, xem mọi báo cáo và quyết định cuối cùng |
| Admin | Quản trị hệ thống, tài khoản và cấu hình website |
| Quản lý | Điều hành ca, xử lý khiếu nại, duyệt thực đơn và khuyến mãi |
| Tổ trưởng | Phân công nhân viên trong ca, giám sát phục vụ tại khu vực |
| Nhân viên phục vụ | Đón khách tại bàn, ghi món, tư vấn hải sản trong hồ, dọn bàn sau khi khách về |
| Lễ tân | Nghe điện thoại, nhận đặt bàn, đón và xếp chỗ cho khách |
| Thu ngân | Tính tiền, áp mã giảm giá, in hóa đơn, chốt tiền cuối ca |
| Nhân viên kỹ thuật | Bảo trì điện nước, máy lạnh, hệ thống lọc và sục khí hồ |
| Tạp vụ | Vệ sinh quanh nhà hàng: rửa chén bát, rửa ly, quét lau sàn, dọn nhà vệ sinh, đổ rác (không dọn bàn) |
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
| REST API | Tài nguyên được định danh bằng URL, thao tác bằng phương thức HTTP (GET, POST, PUT, PATCH, DELETE), trả mã trạng thái (200, 201, 400, 401, 403, 404, 409, 429, 500) | 94 endpoint dưới `/api/v1`, một định dạng phản hồi chung |
| SPA (Single Page Application) | Tải trang một lần, chuyển trang bằng JavaScript, không tải lại toàn trang | React Router, tải trễ (lazy load) từng trang |
| JWT (JSON Web Token) | Chuỗi gồm header.payload.chữ ký, server ký bằng khóa bí mật; client gửi kèm mỗi request trong header `Authorization: Bearer` | Payload `{ sub: id, role }`, hết hạn sau 7 ngày |
| Băm mật khẩu bcrypt | Hàm băm một chiều có muối (salt) và hệ số chi phí; không thể giải ngược | Lưu `passwordHash`, cost = 10 |
| ORM và migration | Ánh xạ bảng thành đối tượng; migration là lịch sử các lần đổi cấu trúc DB, chạy lại được trên máy khác | Prisma, 14 migration trong `backend/prisma/migrations/` (có migration kèm dữ liệu: cấp quyền cho vai trò có sẵn) |
| Transaction, ACID | Nhiều thao tác hoặc thành công hết, hoặc hoàn tác hết | Tạo đơn (lấy giá, trừ lượt mã, tạo đơn, tăng số đã bán), hủy đơn, ghi nhận thanh toán |
| Mức cô lập Serializable | Các transaction chạy đồng thời cho kết quả như chạy lần lượt; nếu xung đột thì một bên bị hủy | Đặt bàn có chọn bàn và lễ tân chuyển bàn: 2 người không giữ được cùng 1 bàn |
| Máy trạng thái (state machine) | Đối tượng chỉ được chuyển giữa các trạng thái theo những bước cho phép | Trạng thái đơn hàng, lịch đặt bàn, giao dịch thanh toán, việc vệ sinh, phiếu sửa chữa, từng món của đơn tại quán (Chờ cân → Chờ bếp → Bếp đang làm → Đã ra bàn) |
| Chữ ký HMAC-SHA512 | Mã xác thực tạo từ dữ liệu + khóa bí mật chung; ai không có khóa thì không tạo được chữ ký đúng | Tạo link VNPay và kiểm tra kết quả VNPay gửi về |
| Phân quyền theo vai trò (RBAC) | Quyền gán cho vai trò, người dùng nhận quyền qua vai trò | Ma trận 12 vai trò × 12 chức năng × 4 quyền; menu hiện theo từng quyền (vd trang Nhiệm vụ vệ sinh cần quyền Sửa) |
| Giới hạn tần suất (rate limiting) | Giới hạn số request của một IP trong một khoảng thời gian | Chống dò mật khẩu, dò SĐT, spam đơn ảo (lỗi 429) |
| CORS | Trình duyệt chỉ cho trang web gọi API khác tên miền nếu server cho phép | Chỉ cho phép `CORS_ORIGIN` |
| Kiểm tra dữ liệu hai lớp | Frontend kiểm tra để báo lỗi nhanh; backend kiểm tra để bảo mật | React Hook Form + Zod |
| Cache phía client | Lưu tạm dữ liệu đã tải, tránh gọi API trùng | React Query: dữ liệu "mới" trong 30 giây |
| Polling | Client hỏi lại server theo chu kỳ để cập nhật | Trang đơn hàng tự cập nhật 15 giây / lần; trang vệ sinh, kỹ thuật, tab Hôm nay của lễ tân 30 giây / lần; trang Cân hải sản 10 giây / lần (có chuông khi có món mới chờ cân) |
| Phi chuẩn hóa (denormalization) | Lưu sẵn giá trị tổng hợp để đọc nhanh | `Dish.soldCount`, `ratingAvg`, `ratingCount` |

---

## 4. Chương 2: Phân tích và thiết kế hệ thống

### 4.1 Tác nhân (actor)

Hệ thống có 12 vai trò nhân viên (mục 3.1). Để sơ đồ dễ đọc, báo cáo **gộp các vai trò có use case giống nhau thành 7 tác nhân nội bộ**, đều kế thừa tác nhân chung "Nhân viên". Phạm vi từng tác nhân lấy theo **quyền mặc định** (`DEFAULT_ROLES`); admin sửa ma trận phân quyền thì phạm vi thực tế có thể khác.

| Tác nhân | Loại | Gồm vai trò | Mô tả |
|---|---|---|---|
| Khách vãng lai | Người | | Không đăng nhập. Xem thực đơn, đặt món, đặt bàn, thanh toán, tra cứu và hủy bằng mã + số điện thoại |
| Khách hàng (CUSTOMER) | Người, kế thừa Khách vãng lai | | Có tài khoản. Thêm: lịch sử đơn và đặt bàn, hồ sơ, đổi mật khẩu, đánh giá món đã nhận. Dùng website hoặc app mobile |
| Nhân viên (STAFF) | Người, tác nhân cha của 7 tác nhân dưới | Mọi vai trò | Đăng nhập trang quản trị, chỉ thấy mục vai trò được cấp quyền |
| Quản lý | Kế thừa Nhân viên | Quản lý, Tổ trưởng | Điều hành ca: xem thống kê, xử lý đơn hàng và đặt bàn, thực đơn, mã giảm giá, kiểm duyệt đánh giá; giao và hủy việc vệ sinh, quản lý khu vực vệ sinh; giao phiếu sửa chữa, ghi bảo trì; xem nhân sự. Tổ trưởng hẹp hơn Quản lý (vd chỉ xem thực đơn) |
| Lễ tân | Kế thừa Nhân viên | Lễ tân | Xác nhận / hủy lịch đặt bàn, **xếp / chuyển bàn**; xem đơn, món, mã giảm giá, đánh giá; báo cần dọn, báo hỏng |
| Thu ngân | Kế thừa Nhân viên | Thu ngân | Xem thống kê, chuyển trạng thái đơn khi thu tiền; xem đặt bàn, món, mã giảm giá |
| Phục vụ | Kế thừa Nhân viên | Phục vụ, Tiếp thực | Xử lý đơn hàng (ghi món, báo đã ra món); xem đặt bàn, món; phục vụ báo cần dọn, báo hỏng |
| Bếp / Hồ hải sản | Kế thừa Nhân viên | Bếp, Hồ hải sản | Xem đơn; sửa món, bật / tắt món hết hàng; **cân hải sản bán theo kg** (trang Cân hải sản, việc chính của nhân viên hồ hải sản); xem tình trạng thiết bị, báo hỏng; bếp báo cần dọn |
| Tạp vụ | Kế thừa Nhân viên | Tạp vụ | Làm việc vệ sinh (nhận, hoàn thành, báo đã dọn cả khu), báo hỏng. Không dọn bàn |
| Nhân viên kỹ thuật | Kế thừa Nhân viên | Kỹ thuật | Nhận và sửa phiếu sửa chữa, bảo trì định kỳ, quản lý danh sách thiết bị |
| Quản trị viên (ADMIN) | Người | Admin | Toàn quyền: mọi use case nội bộ, sửa ma trận phân quyền, tạo / sửa tài khoản kể cả ADMIN |
| Chủ nhà hàng | Người, ngang Quản trị viên | Chủ nhà hàng | Tài khoản STAFF giữ vai trò Chủ nhà hàng, quyền như Quản trị viên (`isFullAdmin`) |
| Cổng VNPay | Hệ thống bên ngoài | | Nhận khách sang thanh toán, gọi IPN báo kết quả về backend |

**Không coi là tác nhân:**
- Google Maps chỉ được nhúng để hiện bản đồ, không trao đổi dữ liệu với hệ thống.
- Ảnh Unsplash là nguồn ảnh mẫu, không trao đổi dữ liệu.
- App mobile là một kênh truy cập của Khách hàng, không phải tác nhân riêng.
- **"Thời gian"**: hệ thống chưa có việc tự chạy theo lịch. Hạn bảo trì và "khu lâu chưa dọn" chỉ được tính lúc mở trang. Sau này nếu làm việc tự động (tự tạo việc vệ sinh mỗi 2 tiếng, tự nhắc bảo trì) thì thêm tác nhân này.

### 4.2 Yêu cầu chức năng

**Phía khách hàng:**

| Mã | Chức năng | Mô tả |
|---|---|---|
| KH01 | Xem trang chủ | Banner, khối **Best seller** ngay dưới ảnh bìa (8 món, bán chạy trước, nút "Xem tất cả"), danh mục, mã giảm giá đang có, giới thiệu, cảm nhận khách, bản đồ |
| KH02 | Xem thực đơn | Lọc theo danh mục (danh mục không còn món đang bán thì ẩn), chip lọc **Best seller**, tìm theo tên (chờ ngừng gõ 400ms mới tìm), sắp xếp (bán chạy, mới nhất, đánh giá cao, giá tăng / giảm), phân trang 12 món; bộ lọc lưu trên URL |
| KH03 | Xem chi tiết món | Ảnh, giá gốc / giá khuyến mãi, đơn vị, mô tả, điểm đánh giá, số đã bán, 20 đánh giá mới nhất, 4 món cùng danh mục. Món bán theo kg: giá / kg, khung "Hải sản sống, bán theo kg" và nút **Đặt bàn để thưởng thức** thay cho "Thêm vào giỏ" |
| KH04 | Quản lý giỏ hàng | Thêm, đổi số lượng (tối đa 50 / món), xóa; giỏ dạng ngăn kéo trượt, lưu ở trình duyệt nên tải lại trang không mất. Món bán theo kg không thêm vào giỏ được (thẻ món ghi "Cân tại hồ" thay cho nút "+") |
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
| QT02 | Quản lý đơn hàng | Tab theo trạng thái kèm số lượng, tìm theo mã / tên / SĐT, phân trang, xem chi tiết (món, ghi chú món, lịch sử thanh toán VNPay), chuyển trạng thái đúng quy trình, hủy bắt buộc chọn / ghi lý do (khách xem được), tự làm mới 30 giây / lần |
| QT03 | Quản lý đặt bàn | Ba chế độ: **Hôm nay** (mặc định: lịch hôm nay theo giờ, tô vàng khách sắp đến trong 60 phút, tô đỏ khách trễ, đếm lịch chưa xếp bàn), danh sách (lọc theo ngày, trạng thái, tìm kiếm) và sơ đồ bàn theo ngày giờ (bấm bàn xem khách); xác nhận, đánh dấu khách đã đến, hủy bắt buộc kèm lý do |
| QT04 | Quản lý món ăn | Thêm / sửa / xóa, upload ảnh hoặc dán link, bật / tắt "đang bán" bằng công tắc, đánh dấu **Best seller**; ghi đơn vị `kg` thì món thành bán theo kg (giá là giá 1 kg), không cần sửa code |
| QT05 | Quản lý danh mục | Thêm / sửa / xóa, ảnh, thứ tự hiển thị |
| QT06 | Quản lý mã giảm giá | Thêm / sửa / xóa, xem đã dùng bao nhiêu lượt, trạng thái (hoạt động, tắt, hết hạn, hết lượt) |
| QT07 | Kiểm duyệt đánh giá | Xem, xóa đánh giá (điểm trung bình của món tự tính lại) |
| QT08 | Quản lý người dùng | Tìm, lọc theo loại tài khoản và bộ phận; tạo tài khoản nhân viên (mật khẩu ngẫu nhiên, hiện một lần để sao chép); đổi loại tài khoản, gán vai trò, khóa / mở khóa, đặt lại mật khẩu |
| QT09 | Ma trận phân quyền | Xem theo từng vai trò hoặc toàn bộ ma trận; ADMIN / Chủ nhà hàng thêm / sửa / xóa vai trò và tích quyền theo ô, theo hàng, theo cột |
| QT10 | Chuyển bàn / xếp bàn (lễ tân) | Nút ở cả 3 chế độ xem. Sơ đồ mở đúng giờ khách đến: bàn hiện tại tô tím, chỉ chọn được bàn trống đủ ghế; lý do nhanh hoặc tự ghi; lưu lịch sử (bàn cũ → bàn mới, ai chuyển, lúc nào, lý do). Chuyển được cả khi khách đã đến |
| QT11 | Tổng quan vệ sinh | Việc của tôi, việc đang chờ (gấp / chưa ai nhận / đang làm), khu vực cần dọn, khu quá 4 tiếng chưa dọn, hôm nay ai làm được bao nhiêu việc |
| QT12 | Nhiệm vụ vệ sinh | Danh sách việc chưa xong (việc gấp trên cùng), tab Tất cả / Của tôi / Chờ làm / Đang làm, lọc khu vực; Bắt đầu (nhận việc), Hoàn thành (ghi chú), sửa / giao việc, hủy kèm lý do |
| QT13 | Khu vực cần dọn | Mỗi khu 1 ô: đỏ cần dọn, vàng lâu chưa dọn, xanh sạch. Phục vụ / lễ tân / bếp bấm **Báo cần dọn**; tạp vụ bấm **Đã dọn xong** cả khu; quản lý thêm / sửa / ẩn khu vực |
| QT14 | Lịch sử công việc vệ sinh | Việc đã xong / đã hủy gom theo ngày, lọc ngày, người làm, khu vực, số việc từng người |
| QT15 | Tổng quan kỹ thuật | Phiếu của tôi, phiếu đang mở, thiết bị có sự cố, thiết bị quá hạn / sắp đến hạn bảo trì (bấm Đã bảo trì ngay), chi phí tháng này |
| QT16 | Phiếu sửa chữa | Phiếu chưa xong, tab Tất cả / Của tôi / Mới báo / Đang sửa / Chờ linh kiện, lọc nhóm thiết bị; Nhận sửa, Chờ linh kiện (ghi đang chờ gì), Hoàn thành (ghi cách xử lý + chi phí), hủy kèm lý do |
| QT17 | Thiết bị & bảo trì định kỳ | Thiết bị gom theo nhóm, tình trạng (có sự cố / quá hạn / sắp đến hạn / tốt), chu kỳ và hạn bảo trì; nút **Hoàn thành** ngay cạnh từng phiếu đang mở; bấm Đã bảo trì (mỗi máy 1 lần / ngày, có thể đóng luôn phiếu sửa chữa); kỹ thuật thêm / sửa / ngưng dùng thiết bị |
| QT18 | Lịch sử sửa chữa | Phiếu đã xong và lần bảo trì, lọc ngày / loại / người sửa / thiết bị, tổng chi phí, thời gian xử lý từ lúc báo tới lúc xong |
| QT19 | Báo hỏng thiết bị | Nút "Báo hỏng" trên thanh tiêu đề trang quản trị cho mọi bộ phận có quyền: chọn thiết bị, sự cố (gợi ý tự ghép tên máy + tình trạng), mức độ; xem lại các phiếu mình đã báo và tiến độ |
| QT20 | Cân hải sản (hồ hải sản) | Trang `/admin/weighing`, nhóm menu "Tại quán". Thẻ món bán theo kg phục vụ vừa gọi đang "Chờ cân" (bàn, khu, người gọi, giờ gọi, ghi chú, giá / kg); ô nhập số kg (gõ "1,25" hay "1.25" đều được) xem trước thành tiền, Enter để cân; bảng "Đã cân hôm nay" có nút **Cân lại** khi bếp chưa nhận làm. Chuông + thông báo + số đỏ trên menu khi có món mới chờ cân, tự tải lại 10 giây |

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

Chia 3 sơ đồ cho dễ đọc khi chèn vào Word: quan hệ giữa các tác nhân, use case phía khách, use case phía nhà hàng.

**a) Quan hệ kế thừa giữa các tác nhân:**

```mermaid
flowchart BT
    KH([Khách hàng]) -. kế thừa .-> KV([Khách vãng lai])
    QL([Quản lý]) -. kế thừa .-> NV([Nhân viên])
    LT([Lễ tân]) -. kế thừa .-> NV
    TN([Thu ngân]) -. kế thừa .-> NV
    PV([Phục vụ]) -. kế thừa .-> NV
    BEP([Bếp / Hồ hải sản]) -. kế thừa .-> NV
    TV([Tạp vụ]) -. kế thừa .-> NV
    KT([Nhân viên kỹ thuật]) -. kế thừa .-> NV
    CHU([Chủ nhà hàng]) -. ngang quyền .-> QTV([Quản trị viên])
```

**b) Use case phía khách:**

```mermaid
flowchart LR
    KV([Khách vãng lai])
    KH([Khách hàng])
    VNP([Cổng VNPay])

    subgraph HT[Hệ thống FAB Seafood: phía khách]
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
    end

    KV --- U1 & U2 & U3 & U5 & U6 & U7 & U8
    KH --- U9 & U10
    KH -. kế thừa .-> KV
    U3 -. mở rộng .-> U4
    U4 --- VNP
```

**c) Use case phía nhà hàng** (chỉ nối các việc tác nhân **làm được**; việc chỉ được xem thì ghi ở bảng bên dưới):

```mermaid
flowchart LR
    QL([Quản lý])
    LT([Lễ tân])
    TN([Thu ngân])
    PV([Phục vụ])
    BEP([Bếp / Hồ hải sản])
    TV([Tạp vụ])
    KT([Nhân viên kỹ thuật])
    QTV([Quản trị viên / Chủ nhà hàng])

    subgraph HT[Hệ thống FAB Seafood: trang quản trị]
      A1((Xem thống kê))
      A2((Xử lý đơn hàng))
      A3((Xác nhận / hủy đặt bàn))
      A4((Chuyển / xếp bàn))
      A5((Quản lý thực đơn))
      A6((Quản lý mã giảm giá))
      A7((Kiểm duyệt đánh giá))
      A8((Quản lý nhân viên))
      A9((Sửa ma trận phân quyền))
      A10((Làm việc vệ sinh))
      A11((Báo cần dọn))
      A12((Báo hỏng thiết bị))
      A13((Sửa chữa, bảo trì thiết bị))
      A14((Quản lý khu vực / thiết bị))
      A15((Cân hải sản bán theo kg))
    end

    QL --- A1 & A2 & A3 & A4 & A5 & A6 & A7
    QL --- A10 & A11 & A12 & A13 & A14 & A15
    LT --- A3 & A4 & A11 & A12
    TN --- A1 & A2
    PV --- A2 & A11 & A12
    BEP --- A5 & A11 & A12 & A15
    TV --- A10 & A11 & A12
    KT --- A12 & A13 & A14
    QTV --- A8 & A9
```

Quản trị viên / Chủ nhà hàng làm được **mọi** use case nội bộ; sơ đồ chỉ nối 2 use case riêng của họ để đỡ rối.

**Bảng tác nhân × use case** (theo quyền mặc định; ✔ = làm được, 👁 = chỉ xem, - = không thấy):

| Use case | Quản lý | Lễ tân | Thu ngân | Phục vụ | Bếp / Hồ hải sản | Tạp vụ | Kỹ thuật | QTV / Chủ |
|---|---|---|---|---|---|---|---|---|
| A1 Xem thống kê | ✔ | - | ✔ | - | - | - | - | ✔ |
| A2 Xử lý đơn hàng | ✔ | 👁 | ✔ | ✔ | 👁 | - | - | ✔ |
| A3 Xác nhận / hủy đặt bàn | ✔ | ✔ | 👁 | 👁 | - | - | - | ✔ |
| A4 Chuyển / xếp bàn | ✔ | ✔ | - | - | - | - | - | ✔ |
| A5 Quản lý thực đơn | ✔ (Tổ trưởng 👁) | 👁 | 👁 | 👁 | ✔ (sửa, bật / tắt) | - | - | ✔ |
| A6 Quản lý mã giảm giá | ✔ (Tổ trưởng -) | 👁 | 👁 | - | - | - | - | ✔ |
| A7 Kiểm duyệt đánh giá | ✔ (Tổ trưởng 👁) | 👁 | - | - | - | - | - | ✔ |
| A8 Quản lý nhân viên | 👁 | - | - | - | - | - | - | ✔ |
| A9 Sửa ma trận phân quyền | 👁 | - | - | - | - | - | - | ✔ |
| A10 Làm việc vệ sinh | ✔ | - | - | - | - | ✔ | - | ✔ |
| A11 Báo cần dọn | ✔ | ✔ | - | ✔ (Tiếp thực -) | ✔ (Hồ hải sản -) | ✔ | - | ✔ |
| A12 Báo hỏng thiết bị | ✔ | ✔ | - | ✔ (Tiếp thực -) | ✔ | ✔ | ✔ | ✔ |
| A13 Sửa chữa, bảo trì thiết bị | ✔ (Tổ trưởng 👁) | - | - | - | 👁 | - | ✔ | ✔ |
| A14 Quản lý khu vực / thiết bị | ✔ khu vực vệ sinh | - | - | - | - | - | ✔ thiết bị | ✔ |
| A15 Cân hải sản bán theo kg | ✔ (Tổ trưởng 👁) | - | - | 👁 (Tiếp thực -) | ✔ (cả Bếp và Hồ hải sản) | - | 👁 | ✔ |

Bảng lấy từ ma trận ở [mục 4.12](#412-thiết-kế-phân-quyền): ✔ = có quyền Thêm / Sửa / Xóa ở chức năng tương ứng, 👁 = chỉ có quyền Xem. A15 dùng chức năng "Hồ hải sản & nhập hàng" (`SEAFOOD_TANK`): mục menu Cân hải sản chỉ hiện cho người có quyền Sửa, nên người chỉ có quyền Xem không thấy mục này.

### 4.5 Đặc tả các use case chính

#### UC01: Đặt món

| Mục | Nội dung |
|---|---|
| Tác nhân | Khách vãng lai, khách hàng |
| Điều kiện trước | Giỏ hàng có ít nhất 1 món |
| Luồng chính | 1. Khách mở trang Thanh toán. 2. Chọn hình thức nhận (giao tận nơi / đến lấy). 3. Nhập họ tên, SĐT, địa chỉ (nếu giao), ghi chú. Đã đăng nhập thì điền sẵn từ hồ sơ. 4. (Tùy chọn) nhập mã giảm giá, bấm Áp dụng. 5. Chọn tiền mặt hoặc VNPay. 6. Bấm Đặt hàng. 7. Hệ thống tính lại tiền từ giá trong DB, tạo đơn mã `FAB...`, xóa giỏ, chuyển sang trang chi tiết đơn |
| Luồng rẽ nhánh | 4a. Mã không hợp lệ / hết hạn / chưa đủ đơn tối thiểu / hết lượt: báo lỗi, không áp dụng. 5a. Nhà hàng chưa cấu hình VNPay: ô VNPay bị mờ. 6a. Thiếu địa chỉ khi giao tận nơi: báo "Vui lòng nhập địa chỉ giao hàng". 7a. Có món vừa hết: báo "Món ... hiện đã hết". 7b. Chọn VNPay: chuyển sang UC02. 7c. Có món bán theo kg (giỏ không cho thêm, nhưng gọi thẳng API vẫn gửi được): báo 400 "Món ... bán theo kg, cần chọn và cân tại hồ. Vui lòng đặt bàn để thưởng thức tại quán" |
| Điều kiện sau | Đơn ở trạng thái Chờ xác nhận, số đã bán của món tăng, lượt dùng mã tăng 1 |

#### UC02: Thanh toán qua VNPay

| Mục | Nội dung |
|---|---|
| Tác nhân | Khách vãng lai, khách hàng, cổng VNPay |
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
| Tác nhân | Phục vụ, Thu ngân, Quản lý (chuyển trạng thái); Lễ tân, Bếp (chỉ xem) |
| Luồng chính | 1. Mở trang Đơn hàng, chọn tab trạng thái. 2. Bấm Xem một đơn. 3. Bấm nút bước kế tiếp: Xác nhận đơn → Bắt đầu chế biến → Giao hàng → Hoàn thành |
| Luồng rẽ nhánh | 3a. Đơn đến lấy: không có nút Giao hàng. 3b. Hủy đơn: bắt buộc chọn lý do có sẵn hoặc tự ghi (khách xem được lý do ở trang chi tiết đơn), hoàn lại số đã bán và lượt dùng mã; nếu khách đã trả online thì đổi sang Đã hoàn tiền và nhắc hoàn tiền trên trang VNPay. 3c. Chuyển sai quy trình (vd Chờ xác nhận → Hoàn thành): backend từ chối |
| Điều kiện sau | Đơn tiền mặt chuyển Hoàn thành thì tự đổi sang Đã thanh toán |

#### UC05: Hủy lịch đặt bàn kèm lý do (nhân viên)

| Mục | Nội dung |
|---|---|
| Tác nhân | Lễ tân, Quản lý |
| Luồng chính | 1. Bấm Hủy ở danh sách hoặc trên sơ đồ bàn. 2. Chọn lý do có sẵn (Hết bàn vào khung giờ này / Nhà hàng có sự kiện, đóng cửa / Không liên lạc được với khách) hoặc "Lý do khác" và tự gõ (tối đa 300 ký tự). 3. Bấm Hủy lịch |
| Luồng rẽ nhánh | 2a. Chưa có lý do: nút Hủy lịch bị mờ; gọi API không có lý do thì backend trả lỗi 400. 3a. Người khác vừa cập nhật lịch này: báo "vừa được người khác cập nhật, vui lòng tải lại trang" (409) |
| Điều kiện sau | Khách thấy khung đỏ "Nhà hàng đã hủy lịch này · Lý do: ..." và nút đặt lại với thông tin cũ |

#### UC06: Quản lý nhân viên và phân quyền

| Mục | Nội dung |
|---|---|
| Tác nhân | Quản trị viên, Chủ nhà hàng (thêm / sửa tài khoản, sửa ma trận); Quản lý chỉ xem |
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

#### UC08: Chuyển bàn / xếp bàn (lễ tân)

| Mục | Nội dung |
|---|---|
| Tác nhân | Lễ tân, Quản lý |
| Điều kiện trước | Lịch ở trạng thái Chờ xác nhận, Đã xác nhận hoặc Khách đã đến |
| Luồng chính | 1. Ở tab Hôm nay / Danh sách / Sơ đồ bàn, bấm **Chuyển bàn** (lịch chưa có bàn thì là **Xếp bàn**). 2. Hệ thống hiện sơ đồ 3 khu đúng giờ khách đến, bàn hiện tại tô tím. 3. Lễ tân bấm một bàn trống đủ ghế, chọn lý do nhanh hoặc tự ghi (không bắt buộc). 4. Bấm "Chuyển bàn sang ...". 5. Trong 1 transaction Serializable: kiểm tra bàn mới (đang phục vụ, đủ ghế, không trùng giờ), đổi bàn và khu vực của lịch, ghi 1 dòng lịch sử chuyển bàn |
| Luồng rẽ nhánh | 3a. Bàn đỏ / vàng / không đủ ghế: không bấm được. 5a. Lễ tân khác vừa xếp lịch khác vào bàn đó: báo "Bàn vừa được xếp cho khách khác" (409), sơ đồ tự tải lại. 5b. Chọn đúng bàn đang ngồi: "Khách đang ở bàn ... rồi" (400). 5c. Lịch đã hủy: không chuyển được |
| Điều kiện sau | Khách xem chi tiết lịch thấy số bàn mới; lý do và tên nhân viên chỉ nhân viên thấy |

#### UC09: Làm việc vệ sinh (tạp vụ)

| Mục | Nội dung |
|---|---|
| Tác nhân | Tạp vụ (làm việc); Phục vụ, Lễ tân, Bếp (báo cần dọn); Quản lý (giao, hủy việc) |
| Luồng chính | 1. Phục vụ thấy nhà vệ sinh nữ hết giấy, mở **Khu vực cần dọn**, bấm Báo cần dọn ở khu đó, chọn mức Gấp. 2. Khu chuyển màu đỏ, việc hiện đầu danh sách của tạp vụ (trang tự tải lại 30 giây). 3. Tạp vụ bấm **Bắt đầu** (nhận việc). 4. Làm xong bấm **Hoàn thành**, ghi chú nếu cần (vd "đã báo kho hết giấy"). 5. Khu xanh lại, việc vào Lịch sử công việc |
| Luồng rẽ nhánh | 3a. Việc đang giao cho người khác: hỏi "nhận làm thay?". 4a. Tạp vụ dọn cả khu: bấm **Đã dọn xong** ở trang khu vực, mọi việc đang chờ ở khu đó (mình được phép) xong một lượt; khu không có việc thì ghi 1 lần "Dọn định kỳ". 4b. Phiếu người khác đang làm: tạp vụ khác không bấm Hoàn thành được (403). Quản lý hủy việc phải ghi lý do |
| Điều kiện sau | `CleaningTask.status = DONE`, `CleaningArea.lastCleanedAt` = lúc xong |

#### UC10: Báo hỏng và sửa chữa thiết bị

| Mục | Nội dung |
|---|---|
| Tác nhân | Nhân viên kỹ thuật (sửa chữa); Phục vụ, Lễ tân, Bếp, Tạp vụ, Quản lý (báo hỏng) |
| Luồng chính | 1. Bếp bấm **Báo hỏng** trên thanh tiêu đề, chọn "Tủ đông hải sản", bấm gợi ý "Không lạnh" (tên sự cố tự ghép), chọn Gấp, gửi. 2. Phiếu "Mới báo" hiện ở Tổng quan / Phiếu sửa chữa của kỹ thuật. 3. Kỹ thuật bấm **Nhận sửa**. 4. Thiếu linh kiện: bấm **Chờ linh kiện**, ghi "Chờ thợ hãng đến sửa"; bếp mở lại nút Báo hỏng thấy dòng này. 5. Linh kiện về, bấm Tiếp tục sửa. 6. Sửa xong bấm **Hoàn thành**, ghi cách xử lý (bắt buộc) và chi phí |
| Luồng rẽ nhánh | 1a. Không biết là máy nào: chọn "Khác / chưa rõ thiết bị", ghi rõ ở mô tả. 1b. Thiết bị đã ngưng sử dụng: không báo được. 6a. Không ghi cách xử lý: nút xác nhận bị mờ, gọi API báo lỗi 400. 6b. Báo nhầm: kỹ thuật hủy phiếu kèm lý do |
| Điều kiện sau | Phiếu vào Lịch sử sửa chữa, cộng vào chi phí tháng |

#### UC11: Bảo trì định kỳ

| Mục | Nội dung |
|---|---|
| Tác nhân | Nhân viên kỹ thuật, Quản lý |
| Luồng chính | 1. Tổng quan kỹ thuật hiện thiết bị quá hạn (đỏ) / còn ≤ 7 ngày (vàng), hạn = lần bảo trì gần nhất + chu kỳ. 2. Kỹ thuật bảo trì xong bấm **Đã bảo trì**, ghi chú và chi phí (không bắt buộc). 3. Hệ thống ghi 1 phiếu loại "Bảo trì định kỳ" đã xong vào lịch sử và tính lại hạn từ hôm nay |
| Luồng rẽ nhánh | 2a. Máy đang có phiếu sửa chữa chưa xong: hộp thoại liệt kê các phiếu, nhắc "bảo trì không tự đóng phiếu"; tích "Máy đã sửa xong, đóng luôn các phiếu này" và ghi cách xử lý thì các phiếu chuyển Đã sửa xong. 2b. Hôm nay đã ghi bảo trì máy này: nút đổi thành "Đã bảo trì hôm nay" (mờ), gọi API thì báo lỗi 400 |
| Điều kiện sau | `Equipment.lastMaintainedAt` = hôm nay; máy không còn phiếu mở thì trở về "Hoạt động tốt" |

#### UC12: Cân hải sản bán theo kg (hồ hải sản)

| Mục | Nội dung |
|---|---|
| Tác nhân | Bếp / Hồ hải sản (người cân, chủ yếu là nhân viên hồ hải sản), Quản lý; Phục vụ (gọi món trên app, xem kết quả) |
| Điều kiện trước | Món có đơn vị `kg` (tôm hùm, tôm sú, cua, cá mú, tôm tít); phục vụ đã gửi bếp đơn tại bàn kèm số kg ghi trên app (mặc định 1 kg), món đang "Chờ cân" |
| Luồng chính | 1. Khách muốn con tôm hùm khoảng 1,2 kg; phục vụ gọi "Tôm hùm nướng phô mai" trên app, số kg mặc định **1 kg**, bấm vào số gõ `1,2` (tiền tạm 2.268.000đ), bấm Gửi bếp. 2. Món vào trạng thái **Chờ cân** với số kg tạm 1,2, tiền tạm được cộng vào đơn, phiếu bếp chưa có món này; trang Cân hải sản kêu chuông, menu có số đỏ (tự tải lại 10 giây). 3. Nhân viên hồ hải sản bắt con khách chọn, cân; ô số kg **điền sẵn `1,2`** (số phục vụ ghi), cân ra 1,25 kg thì sửa thành `1,25`, ô bên cạnh hiện trước thành tiền. 4. Bấm **Xác nhận cân** (hoặc Enter). 5. Trong 1 transaction, hệ thống làm tròn số kg tới gam, tính tiền dòng = 1.890.000 × 1,25 = 2.362.500đ, cộng **phần chênh lệch** với tiền tạm (+94.500đ) vào tổng đơn, chuyển món sang **Chờ bếp**. 6. Bếp thấy món kèm "Đã cân 1,25 kg"; app của phục vụ hiện "Đã cân 1,25 kg × 1.890.000đ/kg" |
| Luồng rẽ nhánh | 3a. Số kg dưới 0,05 hoặc trên 30: báo lỗi 400 ("Ít nhất 0,05 kg" / "Nhiều nhất 30 kg, kiểm tra lại số cân"). 4a. Nhập nhầm: bấm **Cân lại** ở bảng "Đã cân hôm nay" khi bếp chưa "Nhận làm"; tiền đơn đổi theo chênh lệch, yêu cầu thanh toán đã gửi (nếu có) bị rút. Bếp đã nhận làm: 400 "Bếp đã nhận làm món này, không cân lại được". 1a. Phục vụ gõ số kg dưới 0,05 hoặc trên 30 (hay gõ chữ): app báo ngay trong ô nhập, không đổi số. Cân ra đúng số phục vụ ghi: hồ hải sản chỉ bấm Xác nhận cân, tiền không đổi. 4b. Khách đổi ý trước khi cân: phục vụ hủy cả dòng món, không cần lý do, tiền tạm bị trừ khỏi đơn. 6a. Phục vụ bấm Gửi thanh toán khi còn món chờ cân: nút bị khóa trên app; gọi API thì báo 400 "Còn món chưa cân: ...". Thu ngân bấm Đã thu tiền cũng bị chặn như vậy |
| Điều kiện sau | `OrderItem.weight` = số kg, `weighedAt` = lúc cân, `status = PENDING`; `Order.subtotal`, `total` bằng đúng tiền theo số kg thật; bill in dòng "1,25 kg x 1.890.000/kg" |

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
| R26 | Nhân viên hủy đơn | Bắt buộc lý do, tối đa 300 ký tự; khách xem được. Khách tự hủy thì không có lý do | `orders.validation.js > updateStatusSchema` |
| R27 | Chuyển / xếp bàn | Lịch Chờ xác nhận / Đã xác nhận / Đã đến; bàn mới đang phục vụ, đủ ghế, không trùng ±120 phút; khu vực đổi theo bàn; lý do ≤ 200 ký tự, chỉ nhân viên thấy; mỗi lần chuyển lưu 1 dòng lịch sử | `reservations.controller.js > moveTable` |
| R28 | Quy trình việc vệ sinh | Chờ làm → Đang làm → Đã xong (Chờ làm → Đã xong được); Hủy cần quyền Xóa và lý do | `CLEANING_FLOW` |
| R29 | Ai hoàn thành việc / phiếu | Việc chưa ai nhận, việc của mình, hoặc người có quyền Xóa (quản lý / kỹ thuật) xác nhận thay. Bấm Bắt đầu / Nhận sửa thì người bấm thành người làm | `assertCanFinish` (vệ sinh, kỹ thuật) |
| R30 | Khu vực cần dọn | Khu có việc chưa xong = cần dọn; khu sạch mà quá 4 tiếng chưa có việc nào xong = "lâu chưa dọn" | `config/cleaning.js > STALE_HOURS` |
| R31 | Đã dọn xong cả khu | Đóng mọi việc đang chờ ở khu mà người bấm được phép hoàn thành; khu không có việc thì ghi 1 lần "Dọn định kỳ" | `cleaning.controller.js > cleanArea` |
| R32 | Giao việc / giao phiếu | Chỉ người có quyền Sửa mới giao cho ai đó; người chỉ có quyền Thêm (phục vụ, lễ tân...) báo thì để trống | `createTask`, `createTicket` |
| R33 | Quy trình phiếu sửa chữa | Mới báo → Đang sửa ⇄ Chờ linh kiện → Đã sửa xong; Chờ linh kiện bắt buộc ghi đang chờ gì; Hoàn thành bắt buộc ghi cách xử lý, chi phí ≥ 0 không bắt buộc; Hủy cần quyền Xóa và lý do | `REPAIR_FLOW`, `ticketStatusSchema` |
| R34 | Hạn bảo trì | Hạn = lần bảo trì gần nhất (chưa có thì ngày thêm thiết bị) + chu kỳ; còn ≤ 7 ngày = sắp đến hạn; thiết bị không có chu kỳ thì không tính | `maintenanceInfo`, `DUE_SOON_DAYS` |
| R36 | Bảo trì và sửa chữa là 2 việc khác nhau | Bấm "Đã bảo trì" **không tự đóng** phiếu sửa chữa (máy vẫn "Có sự cố"). Muốn đóng thì tích "Máy đã sửa xong, đóng luôn các phiếu này", khi đó bắt buộc ghi cách xử lý; phiếu người khác đang sửa thì giữ nguyên. Mỗi máy chỉ ghi bảo trì 1 lần / ngày (giờ VN) | `maintenance.controller.js > maintain` |
| R35 | Báo hỏng | Chỉ chọn được thiết bị đang sử dụng; nhóm thiết bị phải thuộc danh sách cố định | `assertActiveEquipment`, `equipmentSchema` |
| R37 | Món bán theo kg | Món có đơn vị `kg`; giá của món là giá 1 kg. Không đặt online được: giỏ hàng bỏ qua, backend báo 400 nếu đơn online có món này | `isSoldByWeight`, `createOrder`, `stores/cart.js` |
| R38 | Gọi món theo kg tại quán | App mặc định **1 phần / 1 kg**, phục vụ sửa được (kg: 0,05 đến 30, gõ số lẻ vd 0,98). Gửi bếp kèm số kg; món theo kg luôn 1 dòng, ở **Chờ cân** (`WEIGHING`), **cộng tiền tạm** theo số kg ghi, phiếu bếp chưa có món này | `addItemsSchema`, `dine-in.service.js > addItems`, `CartNotifier.setWeight` |
| R39 | Cân | Ô cân điền sẵn số kg phục vụ ghi; số kg từ 0,05 đến 30, làm tròn tới gam. Tiền dòng = `Math.round(giá 1 kg × số kg)`, tiền đơn đổi theo chênh lệch với tiền tạm; cân xong món sang Chờ bếp | `weighItemSchema`, `lineTotal`, `weighItem` |
| R40 | Cân lại | Chỉ khi bếp chưa "Nhận làm" (món còn Chờ bếp). Tiền đơn đổi theo chênh lệch; số tiền đổi thì yêu cầu thanh toán đã gửi bị rút | `weighItem` |
| R41 | Còn món chờ cân | Không gửi thanh toán, không thu tiền được; câu báo kể tên món chưa cân | `requestBill`, `pay` |
| R42 | Hủy / check món theo kg | Chỉ hủy cả dòng (số kg cân chung cho cả dòng); món chờ cân hủy không cần lý do; món chưa cân không "Check món" được (chưa nấu) | `cancelItem`, `serveItems` |
| R43 | Quyền cân | Xem danh sách món chờ cân = quyền Xem "Hồ hải sản & nhập hàng"; cân / cân lại = quyền Sửa. Mặc định cân được: Chủ, Admin, Quản lý, Bếp, Hồ hải sản | `dine-in.routes.js`, `adminMenu.js` |
| R44 | Best seller | Món bật ô Best seller (`isFeatured`); trang chủ hiện 8 món, bán chạy trước; `/menu?best=1` chỉ hiện các món này | `Home.jsx`, `Menu.jsx` |
| R45 | Danh mục hiện cho khách | Chỉ đếm món đang bán (`_count.dishes`); danh mục 0 món bị ẩn ở web và app | `categories.controller.js > list` |
| R46 | Đổi thực đơn (`db:seed-menu`) | Món trùng slug trong `menu.js`: cập nhật và bật bán lại; chưa có: tạo mới. Món cũ chưa bán, chưa có đánh giá: xóa; đã nằm trong đơn / có đánh giá: ẩn, gom vào nhóm "Ngừng bán (thực đơn cũ)". Danh mục cũ hết món: xóa. Không xóa đơn hàng, đánh giá | `prisma/menu.js > applyMenu` |
| R47 | Cất order / Hủy order (app, S08) | **Cất order**: phiếu chưa gửi bếp được lưu theo từng bàn trên điện thoại (nhiều bàn cùng lúc, giữ ghi chú và số kg), mở lại bàn thì món hiện lại; đang ghi dở bàn khác mà bấm "Order" thì phiếu cũ tự cất. Chưa gửi bếp nên bếp, thu ngân, máy khác không thấy. **Hủy order**: chỉ xóa phiếu chưa gửi, món đã gửi bếp giữ nguyên | `state/cart_state.dart > SavedTicketsNotifier`, `s08_cart_screen.dart` |

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

**Việc vệ sinh (`CleaningTask.status`)** — `CLEANING_FLOW` trong `cleaning.controller.js`:

```mermaid
stateDiagram-v2
    [*] --> TODO: Quản lý giao / tạp vụ thêm / phục vụ báo cần dọn
    TODO --> IN_PROGRESS: Bắt đầu (nhận việc)
    TODO --> DONE: Xong luôn / Đã dọn xong cả khu
    TODO --> CANCELLED: Quản lý hủy (có lý do)
    IN_PROGRESS --> DONE: Hoàn thành
    IN_PROGRESS --> CANCELLED
    DONE --> [*]
    CANCELLED --> [*]
```

| Trạng thái | Nhãn |
|---|---|
| TODO | Chờ làm |
| IN_PROGRESS | Đang làm |
| DONE | Đã xong |
| CANCELLED | Đã hủy |

**Phiếu sửa chữa (`RepairTicket.status`)** — `REPAIR_FLOW` trong `maintenance.controller.js`:

```mermaid
stateDiagram-v2
    [*] --> OPEN: Nhân viên báo hỏng
    OPEN --> IN_PROGRESS: Nhận sửa
    OPEN --> DONE: Xong luôn
    IN_PROGRESS --> WAITING_PARTS: Chờ linh kiện (ghi đang chờ gì)
    WAITING_PARTS --> IN_PROGRESS: Tiếp tục sửa
    IN_PROGRESS --> DONE: Hoàn thành (cách xử lý + chi phí)
    WAITING_PARTS --> DONE
    OPEN --> CANCELLED: Kỹ thuật hủy (có lý do)
    IN_PROGRESS --> CANCELLED
    WAITING_PARTS --> CANCELLED
    DONE --> [*]
    CANCELLED --> [*]
```

| Trạng thái | Nhãn |
|---|---|
| OPEN | Mới báo |
| IN_PROGRESS | Đang sửa |
| WAITING_PARTS | Chờ linh kiện |
| DONE | Đã sửa xong |
| CANCELLED | Đã hủy |

Bảo trì định kỳ không đi qua quy trình này: bấm "Đã bảo trì" tạo thẳng 1 phiếu `type = MAINTENANCE` ở trạng thái DONE.

**Từng món của đơn ăn tại quán (`OrderItem.status`)**, trong `dine-in.service.js` (đơn online không dùng cột này). Chỉ món bán theo kg đi qua `WEIGHING`:

```mermaid
stateDiagram-v2
    [*] --> WEIGHING: Phục vụ gửi bếp (món bán theo kg)
    [*] --> PENDING: Phục vụ gửi bếp (món theo phần)
    WEIGHING --> PENDING: Hồ hải sản cân, nhập số kg (tính tiền)
    WEIGHING --> CANCELLED: Hủy (không cần lý do)
    PENDING --> COOKING: Bếp "Nhận làm"
    PENDING --> SERVED: Phục vụ "Check món"
    PENDING --> CANCELLED: Hủy (không cần lý do)
    COOKING --> SERVED: Phục vụ "Check món"
    SERVED --> COOKING: Bỏ tick (bấm nhầm)
    COOKING --> CANCELLED: Hủy (bắt buộc lý do)
    SERVED --> CANCELLED: Hủy (bắt buộc lý do)
    SERVED --> [*]
    CANCELLED --> [*]
```

| Trạng thái | Nhãn |
|---|---|
| WEIGHING | Chờ cân (tiền tạm theo số kg phục vụ ghi, bếp chưa thấy) |
| PENDING | Chờ bếp |
| COOKING | Bếp đang làm |
| SERVED | Đã ra bàn |
| CANCELLED | Đã hủy |

Món theo kg ở PENDING (đã cân, bếp chưa nhận làm) vẫn **cân lại** được: số kg và tiền đổi, trạng thái giữ nguyên PENDING. Còn món ở WEIGHING thì đơn chưa gửi thanh toán, chưa thu tiền được (R41).

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
    A->>A: Kiểm tra chữ ký, đã ghi nhận rồi thì đọc lại kết quả
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

**Lễ tân chuyển bàn** (`MoveTableDialog.jsx`, `reservations.controller.js > moveTable`):

```mermaid
sequenceDiagram
    actor L as Lễ tân
    participant W as Website
    participant A as API Express
    participant DB as PostgreSQL

    L->>W: Bấm "Chuyển bàn" ở lịch RSV... (bàn T03, 19:00)
    W->>A: GET /reservations/tables?date=<giờ khách đến>
    A-->>W: Sơ đồ 3 khu, T03 tô tím (bàn hiện tại)
    L->>W: Chọn T04, lý do "Khách muốn đổi chỗ", xác nhận
    W->>A: PATCH /reservations/:id/table { tableId, reason }
    A->>DB: BEGIN (Serializable)
    A->>DB: T04 đang phục vụ? đủ ghế? trùng giờ?
    A->>DB: UPDATE Reservation SET tableId, area WHERE id AND tableId = T03
    A->>DB: INSERT ReservationTableChange (T03 → T04, người chuyển, lý do)
    A->>DB: COMMIT
    alt Lễ tân khác vừa xếp lịch khác vào T04
        A-->>W: 409 "Bàn vừa được xếp cho khách khác"
        W->>A: Tải lại sơ đồ
    else Thành công
        A-->>W: 200 "Đã chuyển từ bàn T03 sang bàn T04"
    end
```

**Báo hỏng → kỹ thuật sửa** (`ReportIssueButton.jsx`, `maintenance.controller.js`):

```mermaid
sequenceDiagram
    actor B as Bếp
    actor K as Kỹ thuật
    participant W as Website
    participant A as API Express
    participant DB as PostgreSQL

    B->>W: Bấm "Báo hỏng", chọn Tủ đông, "Không lạnh", Gấp
    W->>A: POST /maintenance/tickets
    A->>A: requirePermission(FACILITY.create), bỏ assigneeId nếu không có quyền Sửa
    A->>DB: INSERT RepairTicket (OPEN, reportedById = bếp)
    loop Mỗi 30 giây
        W->>A: GET /maintenance/overview (trang của kỹ thuật)
    end
    K->>W: Nhận sửa → Chờ linh kiện → Hoàn thành (cách xử lý, chi phí)
    W->>A: PATCH /maintenance/tickets/:id/status
    A->>DB: UPDATE ... WHERE id AND status = trạng thái cũ (chống 2 người bấm cùng lúc)
    A-->>W: Phiếu DONE, vào Lịch sử sửa chữa
    B->>W: Mở lại "Báo hỏng" → "Bạn đã báo gần đây": Đã sửa xong
```

**Cân hải sản bán theo kg** (`Weighing.jsx`, `dine-in.service.js > addItems, weighItem`):

```mermaid
sequenceDiagram
    actor P as Phục vụ (app)
    actor H as Hồ hải sản (web)
    participant A as API Express
    participant DB as PostgreSQL

    P->>A: POST /dine-in/orders { tableId, items: [{ Tôm hùm nướng phô mai, weight: 1.2 }] }
    A->>DB: INSERT OrderItem (price = giá 1 kg, weight = 1.2, status = WEIGHING), tiền đơn += tiền tạm 2.268.000
    loop Mỗi 10 giây
        H->>A: GET /dine-in/weighing
    end
    A-->>H: waiting: [Tôm hùm nướng phô mai, bàn B05, phục vụ ghi 1,2 kg]
    H->>A: POST /dine-in/items/:id/weigh { weight: 1.25 }
    A->>A: requirePermission(SEAFOOD_TANK.edit), Zod 0,05 đến 30 kg
    A->>DB: BEGIN
    A->>DB: Món còn WEIGHING / PENDING? (bếp nhận làm rồi thì 400)
    A->>DB: UPDATE OrderItem SET weight = 1.25, status = PENDING
    A->>DB: UPDATE Order total += 1.890.000 × (1,25 - 1,2) (chênh lệch với tiền tạm / lần cân trước)
    A->>DB: COMMIT
    A-->>H: "Đã cân Tôm hùm nướng phô mai: 1,25 kg"
    P->>A: GET /dine-in/tables/:id (tự tải lại 15 giây)
    A-->>P: món "Đã cân 1,25 kg", tổng tiền mới
```

### 4.9 Kiến trúc hệ thống

**Kiến trúc tổng thể (client - server, 3 lớp):**

```mermaid
flowchart LR
    subgraph Client
      W[Website React<br/>localhost:5173]
      M[App Flutter<br/>nhân viên phục vụ]
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

15 module trong `backend/src/modules/`: `auth`, `categories`, `dishes`, `orders`, `payments`, `reservations`, `reviews`, `coupons`, `users`, `stats`, `permissions`, `upload`, `cleaning` (vệ sinh), `maintenance` (kỹ thuật), `dine-in` (ăn tại quán: gọi món tại bàn, phiếu bếp, thu ngân, cân hải sản) (cộng 2 route chung `/health`, `/info`). Mỗi module có `*.routes.js`, `*.controller.js`, `*.validation.js`, và `*.service.js` nếu logic phức tạp.

**Kiến trúc frontend:**

| Lớp | Thư mục | Vai trò |
|---|---|---|
| Trang | `src/pages/` (`account/`, `admin/`) | Mỗi trang 1 file, tải trễ bằng `lazy()` |
| Component | `src/components/` (`ui/`, `layout/`, `cleaning/`, `maintenance/`, `dine-in/`) | Nút, form, modal, bảng, badge...; khung trang khách / admin; sơ đồ bàn, hộp thoại chuyển bàn, ghi chú món; thẻ việc vệ sinh, thẻ phiếu sửa chữa, nút Báo hỏng; chuông báo món chờ cân / gửi bếp / gửi thanh toán, cách tính tiền dòng món theo kg |
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
    Reservation ||--o{ ReservationTableChange : "lịch sử chuyển bàn"
    User |o--o{ ReservationTableChange : "chuyển"
    CleaningArea ||--o{ CleaningTask : "có việc"
    User |o--o{ CleaningTask : "làm / báo"
    Equipment ||--o{ RepairTicket : "có phiếu"
    User |o--o{ RepairTicket : "báo / sửa"

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
      int price "món kg: giá 1 kg"
      int salePrice "có thể trống"
      string unit "kg = bán theo kg"
      bool isAvailable
      bool isFeatured "Best seller"
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
      string cancelReason
    }
    OrderItem {
      int id PK
      int orderId FK
      int dishId FK
      string name "lưu lúc đặt"
      int price "lưu lúc đặt"
      int quantity
      string note
      enum status "đơn tại quán"
      float weight "số kg, món theo kg"
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
    ReservationTableChange {
      int id PK
      int reservationId FK
      string fromTableCode "trống = xếp bàn lần đầu"
      string toTableCode
      string reason
      int changedById FK
    }
    CleaningArea {
      int id PK
      string name UK
      bool isActive
      datetime lastCleanedAt
    }
    CleaningTask {
      int id PK
      string title
      int areaId FK
      enum priority
      enum status
      int assigneeId FK
      int createdById FK
      datetime completedAt
    }
    Equipment {
      int id PK
      string name UK
      string category
      int maintenanceDays
      datetime lastMaintainedAt
      bool isActive
    }
    RepairTicket {
      int id PK
      enum type "REPAIR | MAINTENANCE"
      int equipmentId FK
      enum priority
      enum status
      int reportedById FK
      int assigneeId FK
      int cost "VNĐ"
      datetime completedAt
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
| slug | String | Duy nhất | Tên không dấu cho URL, vd `tom-hum` |
| description, image | String? | | |
| sortOrder | Int | 0 | Số nhỏ hiện trước |

**Dish (món ăn)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| name | String | | Tên món |
| slug | String | Duy nhất | Trùng thì thêm số: `tom-hap-bia-2` |
| description | String? | | |
| price | Int | > 0 | Giá gốc (VNĐ). Món bán theo kg: giá 1 kg |
| salePrice | Int? | < price | Giá khuyến mãi |
| unit | String | "phần" | Đơn vị: phần, kg, lon, chai...; `kg` = **bán theo kg** (không đặt online, tại quán cân rồi mới tính tiền) |
| image | String? | | Link ảnh hoặc `/uploads/...` |
| isAvailable | Boolean | true | Đang bán |
| isFeatured | Boolean | false | **Best seller**: hiện ở khối Best seller trang chủ, nhãn cam trên thẻ món |
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
| cancelReason | String? | ≤ 300 ký tự | Lý do nhà hàng hủy đơn, khách xem được; trống = khách tự hủy |
| createdAt | DateTime | có index | |

**OrderItem (chi tiết đơn)**

| Cột | Kiểu | Ràng buộc | Ý nghĩa |
|---|---|---|---|
| orderId | Int | FK → Order, xóa đơn thì xóa theo; index (orderId, status) | |
| dishId | Int | FK → Dish | |
| name, price | String, Int | | Tên và giá **tại lúc đặt**. Món bán theo kg: `price` là giá 1 kg |
| quantity | Int | 1 đến 50 | |
| note | String? | ≤ 200 ký tự | Ghi chú khẩu vị của món |
| createdAt | DateTime | Tự điền | Đơn tại quán: lúc gửi bếp (mỗi lần gọi thêm là dòng mới) |
| status | OrderItemStatus | PENDING | Chỉ đơn tại quán: Chờ cân / Chờ bếp / Bếp đang làm / Đã ra bàn / Đã hủy |
| servedAt | DateTime? | | Lúc phục vụ "Check món" |
| cancelReason, cancelledAt | String?, DateTime? | | Lý do hủy món (bắt buộc khi bếp đã làm), lúc hủy |
| weight | Float? | Kiểm tra ở API: 0,05 đến 30, làm tròn tới gam | Số kg thực tế hồ hải sản cân. `null` = món theo phần hoặc chưa cân. Tiền dòng = `price × weight` |
| weighedAt | DateTime? | | Lúc cân |

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

**ReservationTableChange (lịch sử chuyển bàn)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| reservationId | Int | FK → Reservation, xóa lịch thì xóa theo; có index | |
| fromTableCode, fromArea | String? | | Bàn cũ (lưu mã dạng chữ); trống = lần xếp bàn đầu tiên |
| toTableCode, toArea | String | | Bàn mới |
| reason | String? | ≤ 200 ký tự | Lý do, chỉ nhân viên thấy |
| changedById | Int? | FK → User, xóa người thì đặt null | Nhân viên chuyển |
| createdAt | DateTime | Tự điền | |

**CleaningArea (khu vực vệ sinh)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| name | String | Duy nhất | vd "Nhà vệ sinh nữ", "Khu rửa chén bát" |
| description | String? | | Việc thường làm ở khu này |
| sortOrder | Int | 0 | Thứ tự hiển thị |
| isActive | Boolean | true | false = ẩn (đang sửa chữa) |
| lastCleanedAt | DateTime? | | Lần gần nhất có việc ở khu này xong |

**CleaningTask (việc vệ sinh)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| title | String | 2 đến 120 ký tự | vd "Nhà vệ sinh nữ hết giấy" |
| note | String? | ≤ 500 ký tự | Mô tả thêm lúc tạo |
| areaId | Int | FK → CleaningArea; index (areaId, status) | |
| priority | CleaningPriority | NORMAL | Gấp thì xếp lên đầu |
| status | CleaningStatus | TODO, có index | |
| assigneeId | Int? | FK → User, có index | Người làm; trống = chưa ai nhận |
| createdById | Int? | FK → User | Người giao / báo |
| startedAt, completedAt | DateTime? | completedAt có index | Lúc bắt đầu, lúc xong / hủy |
| resultNote | String? | ≤ 300 ký tự | Ghi chú khi xong hoặc lý do hủy |

**Equipment (thiết bị)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| name | String | Duy nhất | vd "Máy sục khí hồ tôm hùm" |
| category | String | Thuộc 6 nhóm cố định | Điện lạnh, Hồ hải sản, Bếp, Điện nước, An toàn, Khác |
| location | String? | | Vị trí |
| maintenanceDays | Int? | 1 đến 3650 | Chu kỳ bảo trì; trống = không bảo trì định kỳ |
| lastMaintainedAt | DateTime? | | Lần bảo trì gần nhất |
| note | String? | | Hãng, SĐT thợ bảo hành |
| sortOrder | Int | 0 | |
| isActive | Boolean | true | false = ngưng sử dụng / thanh lý |

**RepairTicket (phiếu sửa chữa / lần bảo trì)**

| Cột | Kiểu | Ràng buộc / mặc định | Ý nghĩa |
|---|---|---|---|
| type | RepairType | REPAIR | Sửa sự cố / bảo trì định kỳ |
| title | String | 3 đến 120 ký tự | vd "Tủ đông hải sản không lạnh" |
| description | String? | ≤ 500 ký tự | Mô tả của người báo |
| equipmentId | Int | FK → Equipment; index (equipmentId, status) | |
| priority | RepairPriority | NORMAL | Gấp = ảnh hưởng khách / an toàn |
| status | RepairStatus | OPEN, có index | |
| reportedById | Int? | FK → User, có index | Người báo |
| assigneeId | Int? | FK → User, có index | Kỹ thuật nhận sửa |
| waitingNote | String? | | Đang chờ gì (khi Chờ linh kiện) |
| resolution | String? | ≤ 500 ký tự | Cách xử lý (bắt buộc khi xong) hoặc lý do hủy |
| cost | Int? | ≥ 0 | Chi phí VNĐ (linh kiện, thuê thợ) |
| startedAt, completedAt | DateTime? | completedAt có index | |

**Các kiểu liệt kê (enum):**

| Enum | Giá trị |
|---|---|
| Role | CUSTOMER, STAFF, ADMIN |
| OrderType | DELIVERY, PICKUP, DINE_IN (ăn tại quán) |
| OrderStatus | PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED, CANCELLED |
| OrderItemStatus | WEIGHING (chờ cân, chỉ món bán theo kg), PENDING, COOKING, SERVED, CANCELLED |
| PaymentMethod | COD, ONLINE |
| PaymentStatus | UNPAID, PAID, REFUNDED |
| PaymentTxnStatus | PENDING, SUCCESS, FAILED |
| ReservationStatus | PENDING, CONFIRMED, CANCELLED, COMPLETED |
| CouponType | PERCENT, FIXED |
| CleaningStatus | TODO, IN_PROGRESS, DONE, CANCELLED |
| CleaningPriority | NORMAL, URGENT |
| RepairStatus | OPEN, IN_PROGRESS, WAITING_PARTS, DONE, CANCELLED |
| RepairType | REPAIR, MAINTENANCE |
| RepairPriority | NORMAL, URGENT |

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
| "Khu vực cần dọn", "thiết bị có sự cố" **tính từ bảng việc / phiếu**, không lưu cột trạng thái riêng | Một nguồn dữ liệu: việc xong là khu tự xanh lại, không bao giờ lệch giữa "khu bẩn" và "danh sách việc" |
| Bảo trì định kỳ lưu chung bảng `RepairTicket` (`type = MAINTENANCE`) | Lịch sử và tổng chi phí của sửa chữa lẫn bảo trì nằm một chỗ, lọc được theo loại |
| `ReservationTableChange` lưu **mã bàn dạng chữ** | Giống `OrderItem` lưu tên món: bàn đổi mã hoặc bị xóa thì lịch sử vẫn đọc đúng |
| Tách chức năng `CLEANING` khỏi `FACILITY` | Nếu dùng chung, Kỹ thuật / Bếp / Hồ hải sản (có quyền Thiết bị) sẽ thấy thêm 4 trang vệ sinh không liên quan |
| Migration kèm câu SQL cấp quyền | Chức năng mới thêm vào code thì vai trò cũ trong DB chưa có quyền; migration `them_ve_sinh` tự `INSERT RolePermission` cho vai trò mặc định nên máy đang có dữ liệu chỉ cần `db:deploy` |
| Bán theo kg nhận biết bằng `Dish.unit = 'kg'`, không thêm cột riêng | Admin đổi món sang bán theo kg ngay trên form Món ăn, không cần sửa code; một hàm `isSoldByWeight` dùng chung |
| `OrderItem.price` của món theo kg là **giá 1 kg**, số kg để riêng ở `weight` | Bill in được "1,25 kg x 1.890.000/kg"; cân lại chỉ cần đổi `weight`, tiền tính lại từ 2 cột, không mất giá gốc |
| Món chờ cân **cộng tiền tạm** theo số kg phục vụ ghi (mặc định 1 kg) | Phục vụ, thu ngân thấy ngay tổng tiền gần đúng; hồ hải sản cân thật thì chỉ cộng / trừ phần chênh lệch. Còn món chờ cân thì chưa gửi thanh toán / thu tiền được, nên khách không bao giờ trả theo số tạm |
| Trạng thái `WEIGHING` thêm vào trước `PENDING` thay vì cờ "đã cân" riêng | Phiếu bếp chỉ lấy món PENDING / COOKING nên tự không thấy món chưa cân; gửi thanh toán / thu tiền chỉ cần kiểm "còn món WEIGHING không" |
| Đổi thực đơn **không xóa** món đã bán | Đơn cũ trỏ tới món qua `dishId`; món cũ đã bán chỉ ẩn và gom vào nhóm "Ngừng bán (thực đơn cũ)", lịch sử đơn và đánh giá vẫn đúng |

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
| `20261112131225_them_ly_do_huy_don_hang` | Cột `Order.cancelReason` |
| `20261119031859_them_ve_sinh` | Bảng CleaningArea, CleaningTask, 2 enum; **kèm dữ liệu**: cấp quyền `CLEANING` cho các vai trò có sẵn, bỏ quyền xem Đặt bàn của Tạp vụ |
| `20261119034706_them_lich_su_chuyen_ban` | Bảng ReservationTableChange |
| `20261119075222_them_ky_thuat_sua_chua` | Bảng Equipment, RepairTicket, 3 enum |
| `20261120142816_them_don_an_tai_quan` | Đơn ăn tại quán: giá trị `DINE_IN` của OrderType, cột `Order.tableId`, `staffId`, `OrderItem.createdAt` |
| `20261120152428_them_trang_thai_mon_thanh_toan_tai_ban` | Enum OrderItemStatus, cột `OrderItem.status`, `servedAt`, `cancelReason`, `cancelledAt`; `Order.billRequestedAt`, `billPrintedAt`; **kèm dữ liệu**: món của đơn tại quán cũ lấy trạng thái theo đơn |
| `20261122011700_can_hai_san_theo_kg` | Thêm giá trị `WEIGHING` (chờ cân) vào OrderItemStatus; cột `OrderItem.weight` (số kg), `weighedAt` |

Các migration sau đều chỉ **thêm** bảng / cột cho phép trống (hoặc giá trị enum mới), nên cập nhật trên máy đang có dữ liệu không mất dữ liệu cũ (`npm --prefix backend run db:deploy`).

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

**Danh sách 94 endpoint.** Ký hiệu quyền: 🌐 công khai; 🔓 không bắt buộc đăng nhập (có token thì nhận diện); 🔐 phải đăng nhập; 🛡️ cần quyền `CHỨC_NĂNG.quyền`; 👑 chỉ ADMIN.

| Nhóm | Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|---|
| Chung | GET | `/health` | 🌐 | Kiểm tra server sống |
| | GET | `/info` | 🌐 | Thông tin nhà hàng, giờ mở cửa, khu vực, phí ship, có bật VNPay không |
| Auth | POST | `/auth/register` | 🌐 (20 lần/15') | Đăng ký, trả token |
| | POST | `/auth/login` | 🌐 (20 lần/15') | Đăng nhập, trả token + user + permissions |
| | GET | `/auth/me` | 🔐 | Thông tin tài khoản + ma trận quyền |
| | PATCH | `/auth/me` | 🔐 | Sửa tên, SĐT, địa chỉ |
| | POST | `/auth/change-password` | 🔐 (20 lần/15') | Đổi mật khẩu |
| Danh mục | GET | `/categories` | 🌐 | Danh sách, kèm số món **đang bán** (`_count.dishes`) |
| | POST | `/categories` | 🛡️ MENU.create | Thêm |
| | PUT | `/categories/:id` | 🛡️ MENU.edit | Sửa |
| | DELETE | `/categories/:id` | 🛡️ MENU.delete | Xóa (chặn nếu còn món) |
| Món ăn | GET | `/dishes` | 🌐 | `search`, `category`, `featured` (Best seller), `available`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| | GET | `/dishes/:idOrSlug` | 🌐 | Chi tiết + 20 đánh giá + 4 món liên quan |
| | POST | `/dishes` | 🛡️ MENU.create | Thêm |
| | PUT | `/dishes/:id` | 🛡️ MENU.edit | Sửa |
| | PATCH | `/dishes/:id/toggle` | 🛡️ MENU.edit | Bật / tắt đang bán |
| | DELETE | `/dishes/:id` | 🛡️ MENU.delete | Xóa (đã có trong đơn thì chuyển ngừng bán) |
| Đơn hàng | POST | `/orders` | 🔓 (10 lần/15') | Đặt hàng (có món bán theo kg thì 400) |
| | GET | `/orders/my` | 🔐 | Đơn của tôi (phân trang) |
| | GET | `/orders/track/:code?phone=` | 🔓 (60 lần/15') | Xem đơn bằng mã + SĐT |
| | POST | `/orders/:code/cancel` | 🔓 (60 lần/15') | Khách tự hủy |
| | GET | `/orders` | 🛡️ ORDERS.view | Danh sách, lọc, kèm số đơn mỗi trạng thái |
| | GET | `/orders/:id` | 🛡️ ORDERS.view | Chi tiết + lịch sử thanh toán |
| | PATCH | `/orders/:id/status` | 🛡️ ORDERS.edit | Chuyển trạng thái; hủy phải có `reason` |
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
| | PATCH | `/reservations/:id/table` | 🛡️ RESERVATIONS.edit | Chuyển / xếp bàn `{ tableId, reason? }`, lưu lịch sử |
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
| Vệ sinh | GET | `/cleaning/overview` | 🛡️ CLEANING.view | Số liệu tổng quan vệ sinh |
| | GET | `/cleaning/areas` | 🛡️ CLEANING.view | Khu vực + việc chưa xong, `needsCleaning`, `isStale` |
| | POST | `/cleaning/areas` | 🛡️ CLEANING.delete | Thêm khu vực |
| | PUT | `/cleaning/areas/:id` | 🛡️ CLEANING.delete | Sửa / ẩn khu vực |
| | POST | `/cleaning/areas/:id/clean` | 🛡️ CLEANING.edit | "Đã dọn xong" cả khu |
| | GET | `/cleaning/tasks` | 🛡️ CLEANING.view | Việc chưa xong, lọc `status`, `mine`, `areaId` |
| | POST | `/cleaning/tasks` | 🛡️ CLEANING.create | Thêm việc / báo cần dọn |
| | PUT | `/cleaning/tasks/:id` | 🛡️ CLEANING.edit | Sửa / giao việc |
| | PATCH | `/cleaning/tasks/:id/status` | 🛡️ CLEANING.edit (hủy cần .delete) | Bắt đầu / hoàn thành / hủy |
| | GET | `/cleaning/history` | 🛡️ CLEANING.view | Việc đã xong / hủy theo ngày, số việc từng người |
| | GET | `/cleaning/staff` | 🛡️ CLEANING.create hoặc .edit | Người giao việc được |
| Kỹ thuật | GET | `/maintenance/overview` | 🛡️ FACILITY.view | Số liệu tổng quan kỹ thuật, chi phí tháng |
| | GET | `/maintenance/equipment` | 🛡️ FACILITY.view hoặc .create | Thiết bị + phiếu đang mở + hạn bảo trì |
| | POST | `/maintenance/equipment` | 🛡️ FACILITY.delete | Thêm thiết bị |
| | PUT | `/maintenance/equipment/:id` | 🛡️ FACILITY.delete | Sửa / ngưng dùng thiết bị |
| | POST | `/maintenance/equipment/:id/maintain` | 🛡️ FACILITY.edit | Ghi bảo trì định kỳ (1 lần / ngày); `closeTickets: true` đóng luôn phiếu sửa chữa |
| | GET | `/maintenance/tickets` | 🛡️ FACILITY.view | Phiếu chưa xong, lọc `status`, `mine`, `category` |
| | GET | `/maintenance/tickets/reported` | 🛡️ FACILITY.create hoặc .view | 10 phiếu tôi đã báo |
| | POST | `/maintenance/tickets` | 🛡️ FACILITY.create | Báo hỏng / tạo phiếu |
| | PUT | `/maintenance/tickets/:id` | 🛡️ FACILITY.edit | Sửa / giao phiếu |
| | PATCH | `/maintenance/tickets/:id/status` | 🛡️ FACILITY.edit (hủy cần .delete) | Nhận sửa / chờ linh kiện / hoàn thành / hủy |
| | GET | `/maintenance/history` | 🛡️ FACILITY.view | Lịch sử, tổng chi phí, theo người |
| | GET | `/maintenance/staff` | 🛡️ FACILITY.create hoặc .edit | Người nhận sửa được |
| Ăn tại quán | GET | `/dine-in/tables` | 🛡️ ORDERS.view | Sơ đồ bàn theo khu kèm đơn đang mở (tiền, số món, món chưa ra, `weighingCount` món chờ cân, đã gửi thanh toán chưa) |
| | GET | `/dine-in/tables/:id` | 🛡️ ORDERS.view | 1 bàn + đơn đang mở (cả món đã hủy; món có `status`, `weight`, `weighedAt`) |
| | GET | `/dine-in/orders` | 🛡️ ORDERS.view | Đơn tại bàn hôm nay |
| | POST | `/dine-in/orders` | 🛡️ ORDERS.create | Gửi bếp / gọi thêm (`items[].weight` = số kg ghi; món theo kg vào "Chờ cân", tiền tạm) |
| | POST | `/dine-in/items/serve` | 🛡️ ORDERS.edit | Check món / bỏ tick |
| | POST | `/dine-in/items/:id/cancel` | 🛡️ ORDERS.edit | Hủy món (cả dòng / bớt phần; món theo kg chỉ cả dòng) |
| | POST | `/dine-in/orders/:id/bill-request` | 🛡️ ORDERS.edit | Gửi thanh toán (còn món chờ cân thì 400) |
| | DELETE | `/dine-in/orders/:id/bill-request` | 🛡️ ORDERS.edit | Rút yêu cầu thanh toán |
| | GET | `/dine-in/kitchen` | 🛡️ KITCHEN.view | Phiếu bếp: món chờ bếp / đang làm (món chờ cân chưa hiện) |
| | POST | `/dine-in/kitchen/start` | 🛡️ KITCHEN.edit | Nhận làm |
| | GET | `/dine-in/bills` | 🛡️ PAYMENTS.view | Bàn đang mở, bàn gửi thanh toán xếp trước |
| | GET | `/dine-in/bills/:id` | 🛡️ PAYMENTS.view | 1 bill để in |
| | POST | `/dine-in/bills/:id/printed` | 🛡️ PAYMENTS.view | Ghi nhận đã in bill |
| | POST | `/dine-in/bills/:id/pay` | 🛡️ PAYMENTS.edit | Đã thu tiền (còn món chờ cân thì 400) |
| | GET | `/dine-in/weighing` | 🛡️ SEAFOOD_TANK.view | Cân hải sản: món chờ cân (gọi sớm trước) + món đã cân hôm nay |
| | POST | `/dine-in/items/:id/weigh` | 🛡️ SEAFOOD_TANK.edit | Cân / cân lại `{ weight }` (0,05 đến 30 kg): tính tiền dòng, món sang Chờ bếp |

Chi tiết từng API và ví dụ: [docs/06-api-reference.md](06-api-reference.md), gọi thử bằng [docs/api.http](api.http).

### 4.12 Thiết kế phân quyền

**Ba lớp:**
1. **Loại tài khoản (`User.role`):** CUSTOMER (khách, không vào được trang quản trị), STAFF (nhân viên, quyền theo vai trò), ADMIN (toàn quyền).
2. **Vai trò (`StaffRole`):** 12 vai trò tạo sẵn, admin thêm được vai trò mới.
3. **Ma trận (`RolePermission`):** mỗi vai trò × 12 chức năng × 4 quyền.

**12 chức năng (module):**

| Mã | Tên | Đã có trang |
|---|---|---|
| DASHBOARD | Tổng quan & báo cáo | Có |
| ORDERS | Đơn hàng & gọi món | Có |
| RESERVATIONS | Đặt bàn | Có |
| MENU | Thực đơn & danh mục | Có (Món ăn, Danh mục) |
| KITCHEN | Phiếu bếp & chế biến | Có (Phiếu bếp) |
| SEAFOOD_TANK | Hồ hải sản & nhập hàng | Có (Cân hải sản); nhập / xuất hồ chưa có |
| PAYMENTS | Thu ngân & thanh toán | Có (Thanh toán tại bàn, In bill) |
| COUPONS | Khuyến mãi & mã giảm giá | Có |
| REVIEWS | Đánh giá khách hàng | Có |
| STAFF | Nhân sự & phân quyền | Có (Người dùng, Phân quyền) |
| FACILITY | Thiết bị & bảo trì | Có (Tổng quan, Phiếu sửa chữa, Thiết bị & bảo trì, Lịch sử sửa chữa; nút Báo hỏng) |
| CLEANING | Vệ sinh & dọn dẹp | Có (Tổng quan, Nhiệm vụ vệ sinh, Khu vực cần dọn, Lịch sử công việc) |

**Ý nghĩa 4 quyền ở 2 chức năng hậu cần** (các chức năng khác: Xem = vào trang, Thêm / Sửa / Xóa = nút tương ứng):

| Quyền | Vệ sinh (`CLEANING`) | Thiết bị & bảo trì (`FACILITY`) |
|---|---|---|
| Xem | Trang Khu vực cần dọn | Trang Thiết bị & bảo trì |
| Thêm | Báo cần dọn / thêm việc | Nút Báo hỏng |
| Sửa | Thấy cả 4 trang; nhận việc, hoàn thành, giao việc | Thấy cả 4 trang; nhận sửa, chờ linh kiện, hoàn thành, ghi bảo trì |
| Xóa | Hủy việc, quản lý khu vực | Hủy phiếu, quản lý thiết bị |

**Hồ hải sản & nhập hàng (`SEAFOOD_TANK`)** hiện dùng cho trang **Cân hải sản**: Xem = xem danh sách món chờ cân (API `GET /dine-in/weighing`), Sửa = nhập số kg, cân lại. Mục menu Cân hải sản khai báo `action: 'edit'` nên chỉ người cân được mới thấy (mặc định: Chủ, Admin, Quản lý, Bếp, Hồ hải sản); Tổ trưởng, Phục vụ, Kỹ thuật chỉ có Xem.

**Ma trận mặc định** (V = Xem, C = Thêm, E = Sửa, D = Xóa, "-" = không có quyền), lấy từ `DEFAULT_ROLES`:

| Vai trò | DASH | ORDERS | RESERV | MENU | KITCHEN | TANK | PAYMENTS | COUPONS | REVIEWS | STAFF | FACILITY | CLEANING |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Chủ nhà hàng | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED |
| Admin | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED | VCED |
| Quản lý | V | VCED | VCED | VCED | VCE | VCE | VE | VCED | VD | V | VCE | VCED |
| Tổ trưởng | V | VCE | VCE | V | V | V | V | - | V | V | VC | VCE |
| Phục vụ | - | VCE | V | V | V | V | - | - | - | - | C | VC |
| Lễ tân | - | V | VCE | V | - | - | - | V | V | - | C | VC |
| Thu ngân | V | VE | V | V | - | - | VCE | V | - | - | - | - |
| Kỹ thuật | - | - | - | - | V | V | - | - | - | - | VCED | - |
| Tạp vụ | - | - | - | - | - | - | - | - | - | - | C | VCE |
| Bếp | - | V | - | VE | VCE | VE | - | - | - | - | VC | VC |
| Tiếp thực | - | VE | V | V | VE | - | - | - | - | - | - | - |
| Hồ hải sản | - | V | - | VE | V | VCED | - | - | - | - | VC | - |

**Cách hoạt động:**
- Backend: mỗi request nạp lại user + vai trò + quyền từ DB (`loadUser`), nên khóa tài khoản hay đổi quyền có hiệu lực ngay. Route dùng `requirePermission('ORDERS', 'edit')`; ADMIN luôn qua, STAFF xét ma trận, CUSTOMER bị chặn (403).
- Frontend: `/auth/login` và `/auth/me` trả kèm `permissions`. Menu admin chỉ hiện mục có quyền Xem (mục nào cần quyền khác thì khai báo `action`, vd 3 trang vệ sinh cần Sửa để phục vụ chỉ thấy "Khu vực cần dọn", trang Cân hải sản cần Sửa); menu chia nhóm (Vệ sinh, Kỹ thuật, Tại quán); nút Báo hỏng trên thanh tiêu đề hiện cho ai có quyền Thêm Thiết bị; nút Thêm / Sửa / Xóa ẩn theo quyền; `ProtectedRoute module="..."` chặn vào trang bằng URL. **Việc ẩn ở frontend chỉ để giao diện gọn, chặn thật nằm ở backend.**
- Vào `/admin` mà không có quyền Tổng quan thì tự chuyển tới trang đầu tiên được phép (vd Tạp vụ → Tổng quan vệ sinh, Kỹ thuật → Tổng quan kỹ thuật).

**Chống tự nâng quyền:**
- Chỉ ADMIN và Chủ nhà hàng sửa được ma trận (nhân viên có quyền Nhân sự chỉ xem).
- Không ai tự sửa / khóa / đặt lại mật khẩu của chính mình trong trang quản trị.
- Người không phải ADMIN / Chủ nhà hàng không thay đổi được tài khoản ADMIN hay người giữ vai trò Chủ nhà hàng, không tạo được tài khoản ADMIN, không gán được vai trò Chủ.
- Người chỉ có quyền Thêm (báo cần dọn / báo hỏng) gửi kèm `assigneeId` cũng bị bỏ qua: chỉ người có quyền Sửa mới giao việc được.
- Vai trò Chủ nhà hàng bị khóa ở toàn quyền.
- Zod bỏ trường lạ, nên khách gửi `role: "ADMIN"` khi đăng ký hay sửa hồ sơ cũng không có tác dụng.

### 4.13 Thiết kế giao diện

**Sơ đồ trang (sitemap):**

| Khu | Đường dẫn | Trang |
|---|---|---|
| Khách | `/` | Trang chủ |
| | `/menu` (`?category=tom-hum`, `?best=1`), `/menu/:slug` | Thực đơn (lọc danh mục, chỉ Best seller), chi tiết món |
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
| Nhóm Vệ sinh | `/admin/cleaning`, `/admin/cleaning/tasks`, `/admin/cleaning/areas`, `/admin/cleaning/history` | Tổng quan, Nhiệm vụ vệ sinh, Khu vực cần dọn, Lịch sử công việc |
| Nhóm Kỹ thuật | `/admin/maintenance`, `/admin/maintenance/tickets`, `/admin/maintenance/equipment`, `/admin/maintenance/history` | Tổng quan, Phiếu sửa chữa, Thiết bị & bảo trì, Lịch sử sửa chữa |
| Nhóm Tại quán | `/admin/weighing`, `/admin/kitchen`, `/admin/cashier`, `/admin/bill/:id/print` | Cân hải sản, Phiếu bếp, Thanh toán tại bàn, In bill (khổ 80mm, mở từ trang Thanh toán tại bàn) |

Giỏ hàng là ngăn kéo trượt từ phải, mở được ở mọi trang khách. Trang Đặt bàn của admin có 3 tab: Hôm nay (mặc định), Danh sách, Sơ đồ bàn. Nút **Báo hỏng** nằm trên thanh tiêu đề mọi trang admin (không phải mục menu, để menu tạp vụ / phục vụ không dài thêm).

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
| Màu bàn | Trống: xanh lá; Bạn chọn: xanh đậm; Chờ xác nhận: vàng; Có khách: đỏ; Không đủ ghế: xám viền đứt; Tạm ngưng: xám gạch ngang; Bàn hiện tại của khách (khi lễ tân chuyển bàn): tím |
| Màu khu vực / thiết bị | Viền trái: đỏ = cần dọn / có sự cố; vàng = lâu chưa dọn / đến hạn bảo trì; xanh = sạch / hoạt động tốt. Việc / phiếu Gấp có viền đỏ |
| Nhãn trên thẻ món | **Best seller**: nền san hô (coral 500) + biểu tượng ngọn lửa; **Cân tại hồ** (món bán theo kg, thay nút "+"): nền xanh nhạt (ocean 50) + biểu tượng cái cân. Khối Best seller ở trang chủ nền xanh đậm (ocean 950) để nổi ngay dưới ảnh bìa |

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

Máy đã có dữ liệu từ trước khi đổi thực đơn: `npm --prefix backend run db:seed-menu` đổi sang thực đơn 12 nhóm / 70 món, không xóa đơn hàng.

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
│   ├── prisma/            schema.prisma, migrations/ (14), seed.js, seed-staff.js, menu.js (thực đơn 12 nhóm / 70 món)
│   └── src/
│       ├── config/        env.js, permissions.js (chức năng + 12 vai trò), restaurant.js (thông tin quán), tables.js (23 bàn), cleaning.js (10 khu vực), equipment.js (18 thiết bị)
│       ├── lib/           prisma.js (1 kết nối dùng chung)
│       ├── middlewares/   auth.js, validate.js, error.js, rateLimit.js, upload.js
│       ├── modules/       15 module, mỗi module: routes + controller + validation (+ service)
│       ├── utils/         ApiError.js, helpers.js (slug, sinh mã, phân trang, isSoldByWeight)
│       ├── routes.js      gắn module vào /api/v1
│       ├── app.js         cấu hình Express
│       └── server.js      khởi động, tắt gọn kết nối DB
├── frontend/src/
│   ├── pages/             12 trang khách, account/ (3 + layout), admin/ (9 + tab Hôm nay), admin/cleaning/ (4), admin/maintenance/ (4), admin/dine-in/ (4: Cân hải sản, Phiếu bếp, Thanh toán tại bàn, In bill)
│   ├── components/        ui/ (Button, Form, Modal, Table, Badge, Feedback, QuantityInput), layout/, cleaning/, maintenance/, dine-in/, TableMap, MoveTableDialog, CancelReasonDialog, ItemNote, CancelNotice, DishCard, ImageUpload, ErrorBoundary
│   ├── services/index.js  toàn bộ hàm gọi API
│   ├── stores/            auth.js, cart.js (Zustand + localStorage)
│   └── lib/               api.js (axios), format.js, constants.js, permissions.js, reservation.js, hooks.js, adminMenu.js
├── docs/                  24 tài liệu + api.http
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

**13. Một nguồn dữ liệu cho trạng thái** (`cleaning.controller.js`, `maintenance.controller.js`): không có cột "khu bẩn" hay "máy hỏng"; API tính từ việc / phiếu chưa xong mỗi lần đọc. Việc xong là khu tự xanh, không phải nhớ cập nhật 2 chỗ.

```js
const areas = await prisma.cleaningArea.findMany({
  include: { tasks: { where: { status: { in: ['TODO', 'IN_PROGRESS'] } } } },
});
areas.map(({ tasks, ...a }) => ({ ...a, openTasks: tasks, needsCleaning: tasks.length > 0 }));
```

**14. Chuyển bàn dùng lại luật đặt bàn** (`moveTable`): gọi lại `assertTableAvailable` (đã dùng khi khách đặt) trong transaction Serializable, cộng điều kiện bàn cũ trong `where` để 2 lễ tân không ghi đè nhau:

```js
const table = await assertTableAvailable(tx, tableId, current.date, current.guests);
const { count } = await tx.reservation.updateMany({
  where: { id, tableId: current.tableId, status: { in: MOVABLE } },
  data: { tableId: table.id, area: table.area },
});
if (count === 0) throw ApiError.conflict('Lịch này vừa được người khác cập nhật, vui lòng tải lại');
```

**15. Menu theo quyền chi tiết** (`lib/adminMenu.js`): mỗi mục khai báo chức năng và quyền cần có; cùng một hàm dùng cho sidebar, route và trang mặc định khi vào `/admin`.

```js
{ to: '/admin/cleaning/tasks', label: 'Nhiệm vụ vệ sinh', module: 'CLEANING', action: 'edit', group: 'Vệ sinh' },
{ to: '/admin/cleaning/areas', label: 'Khu vực cần dọn', module: 'CLEANING', group: 'Vệ sinh' }, // chỉ cần Xem
export const allowedMenu = (user, can) => ADMIN_MENU.filter((m) => can(user, m.module, m.action));
```

**16. Migration kèm dữ liệu** (`20261119031859_them_ve_sinh`): ngoài tạo bảng, migration chạy SQL cấp quyền chức năng mới cho vai trò đang có, `ON CONFLICT DO NOTHING` để không ghi đè quyền admin đã tự chỉnh.

**17. Món bán theo kg: tiền tính ở server lúc cân** (`dine-in.service.js`). Một công thức tiền dòng món dùng chung; cân / cân lại chỉ cộng **phần chênh lệch** vào đơn, trong transaction, và chặn cân lại khi bếp đã nhận làm:

```js
const byWeight = (i) => i.status === 'WEIGHING' || i.weight != null;
export const lineTotal = (i) => (byWeight(i) ? Math.round(i.price * (i.weight ?? 0)) : i.price * i.quantity);

// weighItem: kg = số kg đã làm tròn tới gam
if (!['WEIGHING', 'PENDING'].includes(item.status)) throw ApiError.badRequest('Bếp đã nhận làm món này, không cân lại được');
const diff = lineTotal({ ...item, weight: kg }) - lineTotal(item); // lần đầu: trừ đi tiền tạm theo số kg phục vụ ghi
await tx.orderItem.update({ where: { id: item.id }, data: { weight: kg, weighedAt: new Date(), status: 'PENDING' } });
await tx.order.update({ where: { id: order.id }, data: { subtotal: { increment: diff }, total: { increment: diff } } });
```

Web (`components/dine-in/bill.js > lineAmount`) và app (`OrderItem.lineTotal`) viết lại đúng công thức này để hiển thị; số tiền thật vẫn là số backend lưu.

**18. Đổi thực đơn an toàn trên database đang chạy** (`prisma/menu.js > applyMenu`): chạy trong 1 transaction; danh mục và món tìm theo slug, có thì cập nhật, chưa có thì tạo (ảnh admin đã tự tải lên `/uploads/...` được giữ nguyên); món cũ không còn trong danh sách thì kiểm tra có nằm trong đơn / đánh giá không: không có thì xóa, có thì ẩn và chuyển sang nhóm "Ngừng bán (thực đơn cũ)". Nhờ vậy `npm run db:seed-menu` chạy lại nhiều lần được và không làm hỏng lịch sử đơn.

### 5.4 Kết quả: các màn hình đã làm (ảnh cần chụp)

Đăng nhập bằng tài khoản demo ở [mục 5.5](#55-dữ-liệu-mẫu-và-tài-khoản-demo). Gợi ý đặt tên hình theo chương: Hình 3.1, 3.2...

| # | Màn hình | Đường dẫn | Tài khoản | Nên thể hiện trong ảnh |
|---|---|---|---|---|
| 1 | Trang chủ | `/` | Không cần | Banner, **khối Best seller** nền xanh đậm ngay dưới ảnh bìa (8 món, nhãn cam), danh mục, ưu đãi |
| 2 | Thực đơn | `/menu?category=tom-hum`, `/menu?best=1` | Không cần | Dải danh mục + chip Best seller, ô tìm kiếm, sắp xếp, lưới món, phân trang; thẻ món theo kg ghi "/kg" và "Cân tại hồ" |
| 3 | Chi tiết món (bán theo phần) | `/menu/hau-nuong-mo-hanh` | Không cần | Giá, đánh giá sao, nút thêm vào giỏ, món liên quan |
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
| 21 | Quản lý món ăn | `/admin/dishes` + form thêm món | `admin@fab.vn` | Công tắc đang bán, upload ảnh, ô "Best seller", món đơn vị kg |
| 22 | Danh mục, mã giảm giá, đánh giá | `/admin/categories`, `/admin/coupons`, `/admin/reviews` | `admin@fab.vn` | |
| 23 | Người dùng + tạo nhân viên | `/admin/users` | `admin@fab.vn` | Hộp hiện thông tin đăng nhập một lần |
| 24 | Ma trận phân quyền | `/admin/permissions` (2 chế độ xem) + form sửa quyền | `admin@fab.vn` | Bảng tích quyền |
| 25 | Cùng trang admin nhưng ít quyền | `/admin` | `bep@fab.vn` | Menu chỉ có mục của bếp (Đơn hàng, Món ăn, Danh mục, Khu vực cần dọn, Thiết bị & bảo trì, nhóm Tại quán: Cân hải sản, Phiếu bếp); không có Mã giảm giá, Người dùng, không có nút Thêm món |
| 26 | Quản lý chỉ được xem ma trận | `/admin/permissions` | `quanly@fab.vn` | Dòng "Bạn chỉ được xem" |
| 27 | Hủy đơn kèm lý do | `/admin/orders`, mở đơn, bấm Hủy đơn | `admin@fab.vn` | Các lý do có sẵn; trang chi tiết đơn của khách hiện lý do |
| 28 | Đặt bàn: tab Hôm nay | `/admin/reservations` | `letan@fab.vn` | Thẻ khách sắp đến (vàng) / trễ (đỏ), "chưa xếp bàn", nút Chuyển bàn |
| 29 | Hộp thoại chuyển bàn | bấm Chuyển bàn | `letan@fab.vn` | Bàn hiện tại tím, bàn mới xanh đậm, lý do nhanh, lịch sử chuyển bàn |
| 30 | Menu tạp vụ | `/admin` | `tapvu@fab.vn` | Chỉ nhóm Vệ sinh 4 mục + nút Báo hỏng |
| 31 | Tổng quan / Nhiệm vụ vệ sinh | `/admin/cleaning`, `/admin/cleaning/tasks` | `tapvu@fab.vn` | Việc gấp viền đỏ, nút Bắt đầu / Hoàn thành |
| 32 | Khu vực cần dọn | `/admin/cleaning/areas` | `tapvu@fab.vn` và `phucvu@fab.vn` | Ô đỏ / vàng / xanh; phục vụ chỉ có nút Báo cần dọn |
| 33 | Lịch sử công việc | `/admin/cleaning/history` | `tapvu@fab.vn` | Gom theo ngày, số việc từng người |
| 34 | Tổng quan kỹ thuật | `/admin/maintenance` | `kythuat@fab.vn` | Phiếu gấp, bảo trì đến hạn, chi phí tháng |
| 35 | Phiếu sửa chữa + hộp thoại hoàn thành | `/admin/maintenance/tickets` | `kythuat@fab.vn` | Phiếu chờ linh kiện, ô cách xử lý + chi phí |
| 36 | Thiết bị & bảo trì | `/admin/maintenance/equipment` | `kythuat@fab.vn` | Thiết bị theo nhóm, máy quá hạn bảo trì, nút Đã bảo trì |
| 37 | Lịch sử sửa chữa | `/admin/maintenance/history` | `kythuat@fab.vn` | Tổng chi phí, thời gian xử lý |
| 38 | Báo hỏng từ bộ phận khác | bấm nút Báo hỏng trên thanh tiêu đề | `bep@fab.vn` | Form báo hỏng + "Bạn đã báo gần đây" |
| 39 | Trang vệ sinh / kỹ thuật trên điện thoại | chế độ giả lập mobile (F12) | `tapvu@fab.vn`, `kythuat@fab.vn` | Menu thu gọn, tab cuộn ngang, nút Báo hỏng chỉ còn biểu tượng |
| 40 | Chi tiết món bán theo kg | `/menu/tom-hum-nuong-pho-mai` | Không cần | Giá "/kg", khung "Hải sản sống, bán theo kg", nút **Đặt bàn để thưởng thức** (không có "Thêm vào giỏ") |
| 41 | Cân hải sản | `/admin/weighing` | `hohaisan@fab.vn` (trước đó `phucvu@fab.vn` gọi 1 món tôm hùm trên app và Gửi bếp) | Thẻ món "Chờ cân" (bàn, người gọi, giá / kg, "Phục vụ ghi 1,2 kg"), ô số kg điền sẵn `1,2`, sửa thành `1,25` kèm thành tiền xem trước, số đỏ trên menu "Cân hải sản"; sau khi cân: bảng "Đã cân hôm nay" có nút Cân lại |
| 42 | App: món chờ cân / đã cân | App S04 của bàn vừa gọi | `phucvu@fab.vn` | Nhãn "Chờ cân", "Ghi 1,2 kg × 1.890.000đ/kg · chờ hồ hải sản cân" + tiền tạm; sau khi cân: "Đã cân 1,25 kg × 1.890.000đ/kg"; S09 khóa "Gửi thanh toán" khi còn món chưa cân |
| 43 | Bill có món theo kg | `/admin/cashier` → In bill | `thungan@fab.vn` | Dòng "1,25 kg x 1.890.000/kg" trên bill 80mm |
| 44 | App: sửa số kg / số phần ở phiếu | App S08 (phiếu có tôm hùm + cơm) | `phucvu@fab.vn` | Tôm hùm `[ − ] 1 kg [ + ]`; bấm vào số mở hộp "Số kg", gõ `0,98`; tiền dòng và tạm tính đổi theo |

### 5.5 Dữ liệu mẫu và tài khoản demo

Tạo bằng `npm run setup` (hoặc `npm --prefix backend run db:seed`). **Xóa dữ liệu cũ** trước khi tạo.

| Vai trò | Email | Mật khẩu | Thấy gì |
|---|---|---|---|
| Admin | `admin@fab.vn` | `admin123` | Toàn bộ trang quản trị |
| Chủ nhà hàng | `chunha@fab.vn` | `123456` | Ngang Admin |
| Quản lý | `quanly@fab.vn` | `123456` | Gần hết; Nhân sự & phân quyền chỉ xem; hủy việc vệ sinh, quản lý khu vực; 4 trang kỹ thuật |
| Tổ trưởng | `totruong@fab.vn` | `123456` | Tổng quan, đơn, đặt bàn, món, đánh giá, xem nhân sự, 4 trang vệ sinh, xem thiết bị |
| Phục vụ | `phucvu@fab.vn` | `123456` | Đơn hàng, đặt bàn (xem), món, Khu vực cần dọn (báo), nút Báo hỏng |
| Lễ tân | `letan@fab.vn` | `123456` | Đặt bàn: tab Hôm nay, xác nhận / hủy, chuyển / xếp bàn; xem đơn, món, mã giảm giá, đánh giá; báo cần dọn, báo hỏng |
| Thu ngân | `thungan@fab.vn` | `123456` | Tổng quan, đơn hàng, đặt bàn, món, mã giảm giá |
| Kỹ thuật | `kythuat@fab.vn` | `123456` | Nhóm Kỹ thuật 4 trang |
| Tạp vụ | `tapvu@fab.vn` | `123456` | Nhóm Vệ sinh 4 trang, nút Báo hỏng |
| Bếp | `bep@fab.vn` | `123456` | Đơn hàng, món ăn, danh mục, Cân hải sản, báo cần dọn, xem thiết bị, nút Báo hỏng |
| Tiếp thực | `tiepthuc@fab.vn` | `123456` | Đơn hàng, đặt bàn (xem), món |
| Hồ hải sản | `hohaisan@fab.vn` | `123456` | Đơn hàng, món, **Cân hải sản** (nhập số kg món bán theo kg), xem thiết bị, nút Báo hỏng |
| Khách hàng | `khach@fab.vn` | `123456` | Có sẵn đơn hoàn thành `FAB0000DEMO` để thử đánh giá, lịch `RSV0000001` |

Thêm 2 khách mẫu `binh@fab.vn`, `chau@fab.vn` (mật khẩu `123456`), là người viết các đánh giá mẫu. Danh sách nhân viên demo ở `backend/prisma/seed-staff.js`; database cũ thiếu tài khoản thì chạy `npm --prefix backend run db:seed-staff` (không xóa gì). Database cũ còn thực đơn cũ (Khai vị, Món Nhật...) thì chạy `npm --prefix backend run db:seed-menu` (không xóa đơn hàng, đánh giá). Cột "Thấy gì" là quyền mặc định, admin sửa được trên giao diện.

| Dữ liệu | Số lượng / nội dung |
|---|---|
| Danh mục | 12 nhóm, theo thứ tự hiện trên web / app: Tôm hùm, Tôm sú, Cua, Cá mú, Tôm tít (5 nhóm bán theo kg), Hàu, Sò điệp, Nghêu, Cháo, Cơm, Rau, Nước uống |
| Món ăn | 70 món (danh sách ở `backend/prisma/menu.js`, xem [docs/24](24-thuc-don-ban-theo-kg.md)): 28 món bán theo kg (tôm hùm 1.890.000 đến 2.090.000đ / kg, tôm sú, cua, cá mú, tôm tít), 42 món theo phần / lon / chai (15.000 đến 149.000đ). Ảnh từ Unsplash, nhiều món dùng chung ảnh, rau và nước ngọt chưa có ảnh. 8 món Best seller: Tôm hùm nướng phô mai, Tôm sú sốt trứng muối, Cua gạch hấp bia, Cá mú hấp Hồng Kông, Tôm tít cháy tỏi, Hàu nướng mỡ hành, Sò điệp nướng phô mai, Cơm chiên hải sản |
| Đơn hàng | 80 đơn ngẫu nhiên trong 30 ngày (90% hoàn thành, 10% hủy; đơn hôm nay ở đủ trạng thái; chỉ chọn món bán theo phần vì món theo kg không đặt online) + đơn `FAB0000DEMO` (3 món Best seller bán theo phần) |
| Mã giảm giá | `WELCOME10` (giảm 10%, đơn từ 200.000đ, tối đa 50.000đ), `FAB50K` (giảm 50.000đ, đơn từ 500.000đ, 100 lượt), `HAISAN20` (giảm 20%, đơn từ 800.000đ, tối đa 150.000đ); hết hạn sau 60 ngày kể từ lúc seed |
| Đánh giá | 2 đánh giá 4 đến 5 sao cho mỗi món Best seller |
| Bàn | 23 bàn: Trong nhà T01 đến T12 (2 đến 10 ghế), Ngoài trời B01 đến B08 (2 đến 8 ghế), VIP1 (10), VIP2 (12), VIP3 (20) |
| Đặt bàn | 4 lịch: ngày mai 19:00 bàn B03 (đã xác nhận, sinh nhật), hôm nay 20:00 bàn T01 (chờ), 3 ngày nữa VIP2 tiệc công ty 12 khách (chờ), 2 ngày trước T03 (đã đến) |
| Vai trò | 12 vai trò mặc định với ma trận ở [mục 4.12](#412-thiết-kế-phân-quyền) |
| Vệ sinh | 10 khu vực; 5 việc đang chờ / đang làm (2 việc gấp do lễ tân, phục vụ báo); lịch sử 7 ngày, mỗi ngày 8 việc định kỳ (rửa chén, rửa ly, dọn nhà vệ sinh, đổ rác...) |
| Kỹ thuật | 18 thiết bị (máy sục khí hồ quá hạn bảo trì, máy hút khói và máy lạnh VIP sắp đến hạn); 5 phiếu đang mở (có phiếu gấp, phiếu chờ linh kiện); 6 phiếu đã sửa trong 30 ngày có chi phí + các lần bảo trì |

### 5.6 Kiểm thử

**Hiện trạng (nói thật trong báo cáo):** backend và website **chưa có bộ kiểm thử tự động** (unit test / API test chạy lại được). Việc kiểm tra gồm:
- Kiểm thử thủ công theo kịch bản trên giao diện và qua `docs/api.http`.
- Lint + build frontend trước mỗi lần hoàn thành: `cd frontend && npx oxlint src && npx vite build`.
- Script gọi API thật chạy một lần khi làm tính năng (không lưu trong repo): phần cân hải sản bán theo kg qua **13/13 bước** ngày 22/11; phần phục vụ ghi số kg trên app qua **14/14 bước** cùng ngày (xem [docs/24](24-thuc-don-ban-theo-kg.md) mục 4).
- App mobile có test Flutter tự động (`cd mobile && flutter test`, dùng server giả): **78 test** qua ngày 22/11, gồm `test/models/weight_test.dart` (định dạng kg, đọc số gõ "0,98", tiền dòng món theo kg, phiếu mặc định 1 kg), test phiếu cộng số kg, 3 test màn S04 / S09 cho món chờ cân / đã cân, 1 test S08 gõ số kg / số phần và dữ liệu gửi bếp.

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
| TC37 | Hủy đơn không lý do | Gọi `PATCH /orders/:id/status` với `CANCELLED`, không có `reason` | 400; trên giao diện nút hủy bị mờ khi chưa chọn lý do | |
| TC38 | Chuyển bàn | Lễ tân chuyển lịch từ T03 sang T04 có lý do | "Đã chuyển từ bàn T03 sang bàn T04"; danh sách ghi "chuyển từ T03"; hộp thoại hiện lịch sử | |
| TC39 | Chuyển vào bàn bận / không đủ ghế | Chuyển lịch 4 khách sang T01 (2 ghế), sang bàn đã có lịch cùng giờ | "Bàn T01 chỉ có 2 ghế..." (400); bàn đã có khách: 409 | |
| TC40 | 2 lễ tân cùng chuyển | Hai tài khoản cùng chuyển 2 lịch khác nhau vào 1 bàn trống | Chỉ 1 người thành công, người còn lại 409 | |
| TC41 | Khách không thấy lịch sử chuyển bàn | Khách tra cứu lịch đã bị chuyển bàn | Thấy bàn mới, không có `tableChanges` (tên nhân viên, lý do) | |
| TC42 | Menu tạp vụ | Đăng nhập `tapvu@fab.vn` | Chỉ nhóm Vệ sinh 4 mục; vào `/admin/reservations` bị chuyển về Tổng quan vệ sinh | |
| TC43 | Phục vụ báo cần dọn | `phucvu@fab.vn` báo cần dọn kèm `assigneeId` | Việc được tạo, `assigneeId` bị bỏ qua; phục vụ bấm Bắt đầu (gọi API) bị 403 | |
| TC44 | Hoàn thành việc của người khác | Tạp vụ A bấm Hoàn thành việc tạp vụ B đang làm | 403 "Việc này đang giao cho ..." | |
| TC45 | Đã dọn xong cả khu | Khu có 2 việc chờ; khu không có việc | Khu 1: "Đã hoàn thành 2 việc"; khu 2: ghi 1 lần "Dọn định kỳ" vào lịch sử | |
| TC46 | Tạp vụ hủy việc | `tapvu@fab.vn` gọi hủy việc | 403 (chỉ quyền Xóa mới hủy) | |
| TC47 | Báo hỏng | `tapvu@fab.vn` bấm Báo hỏng, chọn thiết bị, gửi | Phiếu "Mới báo"; tạp vụ không xem được trang Phiếu sửa chữa (403 / bị chuyển trang) | |
| TC48 | Quy trình sửa chữa | Kỹ thuật: Nhận sửa → Chờ linh kiện không ghi chú | 400 "Vui lòng ghi rõ..."; có ghi chú thì chuyển được | |
| TC49 | Hoàn thành thiếu cách xử lý / chi phí âm | Gọi API `DONE` không có `note`; `cost: -5` | Cả hai 400 | |
| TC50 | Bảo trì định kỳ | Bấm Đã bảo trì ở máy quá hạn | Máy về "Hoạt động tốt", hạn mới = hôm nay + chu kỳ; lịch sử có phiếu "Bảo trì định kỳ" | |
| TC51 | Quyền kỹ thuật | `quanly@fab.vn` hủy phiếu / thêm thiết bị; `thungan@fab.vn` xem thiết bị | 403 cả ba | |
| TC52 | Thiết bị ngưng dùng | Ngưng dùng 1 máy rồi báo hỏng máy đó | "Thiết bị không tồn tại hoặc đã ngưng sử dụng" (400) | |
| TC53 | Bảo trì máy đang có sự cố | Máy có phiếu "không chạy": bấm Đã bảo trì không tích ô; lần khác tích "Máy đã sửa xong" và ghi cách xử lý | Không tích: máy vẫn "Có sự cố", hộp thoại đã nhắc trước. Tích: phiếu Đã sửa xong, máy "Hoạt động tốt" | |
| TC54 | Bảo trì 2 lần / ngày | Bấm Đã bảo trì rồi gọi API ghi lần nữa | Nút thành "Đã bảo trì hôm nay" (mờ); API báo "đã được ghi bảo trì hôm nay lúc ..." (400) | |
| TC55 | Hoàn thành trên thẻ thiết bị | Bấm Hoàn thành cạnh phiếu ở trang Thiết bị, ghi cách xử lý + chi phí | Phiếu Đã sửa xong, thẻ hết đỏ, lịch sử có chi phí | |
| TC56 | Không đặt online món theo kg | Web: mở thẻ / chi tiết "Tôm hùm nướng phô mai"; gọi thẳng `POST /orders` có món này | Thẻ món có nhãn "Cân tại hồ" (không có nút "+"), chi tiết món có nút "Đặt bàn để thưởng thức", không có "Thêm vào giỏ"; API trả 400 "Món ... bán theo kg, cần chọn và cân tại hồ..." | |
| TC57 | Gọi món theo kg tại bàn | `phucvu@fab.vn` (app): gọi Tôm hùm nướng phô mai + Cơm chiên hải sản; ở S08 bấm số kg của tôm hùm, gõ `1,2`; Gửi bếp | S08: tôm hùm mặc định "1 kg", sửa xong tạm tính 2.357.000đ; S04: tôm hùm "Chờ cân", "Ghi 1,2 kg × 1.890.000đ/kg", tổng 2.357.000đ (tiền tạm); phiếu bếp (`bep@fab.vn`) chỉ có cơm; S03 ô bàn ghi "1 chờ cân" | |
| TC58 | Cân hải sản | `hohaisan@fab.vn` mở Cân hải sản (ô số kg điền sẵn `1,2`), sửa thành `1,25`, Xác nhận cân | "Đã cân Tôm hùm nướng phô mai: 1,25 kg"; món sang Chờ bếp; tổng đơn tăng 94.500đ (thành 2.451.500đ); phiếu bếp hiện món kèm "Đã cân 1,25 kg" | |
| TC59 | Số kg sai | Trang Cân hải sản nhập `0,01`; gọi API cân với `weight: 31`; gọi `POST /dine-in/orders` với `weight: 0.01`; app S08 gõ `40` | "Ít nhất 0,05 kg"; "Nhiều nhất 30 kg, kiểm tra lại số cân" (400); gửi bếp 400 "Món theo kg ít nhất 0,05 kg"; app báo "Từ 0,05 đến 30 kg", không đổi số | |
| TC60 | Cân lại | Cân lại món vừa cân thành `1,3` khi bếp chưa nhận làm; sau khi bếp bấm Nhận làm thì cân lại lần nữa | Lần 1: tổng đơn tăng thêm phần chênh lệch (94.500đ); lần 2: 400 "Bếp đã nhận làm món này, không cân lại được" | |
| TC61 | Gửi thanh toán / thu tiền khi còn món chờ cân | App mở S09 khi tôm hùm chưa cân; gọi `POST /dine-in/orders/:id/bill-request` và `POST /dine-in/bills/:id/pay` | S09 báo còn món chưa cân, nút Gửi thanh toán bị khóa; cả 2 API trả 400 "Còn món chưa cân: Tôm hùm nướng phô mai..." | |
| TC62 | Quyền cân | `phucvu@fab.vn` gọi `POST /dine-in/items/:id/weigh`; xem menu của `phucvu@fab.vn` trên web | 403; menu không có mục Cân hải sản | |
| TC63 | Hủy món theo kg | App S13 chọn dòng tôm hùm chờ cân, hủy không ghi lý do | Không có ô chọn số phần (món theo kg chỉ hủy cả dòng); hủy thành công không cần lý do; tiền tạm bị trừ khỏi tổng đơn | |
| TC64 | Đổi thực đơn trên database cũ | Database còn thực đơn cũ có đơn hàng: chạy `npm --prefix backend run db:seed-menu` | Thực đơn còn 12 nhóm / 70 món; đơn cũ vẫn xem đúng tên món; nhóm "Ngừng bán (thực đơn cũ)" không hiện ở `/menu`; chạy lại lần 2 không lỗi | |
| TC65 | Best seller | Mở `/`, `/menu?best=1`; admin tắt ô Best seller của 1 món | Trang chủ có khối Best seller ngay dưới ảnh bìa, 8 món có nhãn cam; `/menu?best=1` chỉ có món Best seller; món vừa tắt biến khỏi khối | |
| TC66 | Sửa số lượng trên app | S08: bấm số phần của Cơm, gõ `1,5` rồi `3`; bấm số kg của tôm hùm, gõ `abc`, rồi `0,98`; bấm + rồi − của tôm hùm | "Số phần phải là số nguyên", sau đó cơm 3 phần 267.000đ; "Nhập số, vd 0,98", sau đó "0,98 kg" 1.852.200đ; + / − đổi 0,1 kg (1,08 rồi 0,98 kg); Gửi bếp gửi kèm `weight: 0.98` | |
| TC67 | Cất order / Hủy order | `phucvu@fab.vn` (app): bàn T02 chọn 2 món → S08 bấm **Cất order**; sang bàn T01 bấm Ghi món, chọn 1 món → **Hủy order**; quay lại bàn T02 bấm **Mở order** | Cất: về Sơ đồ bàn, khung "Order đã cất, chưa gửi bếp" có nút "T02 · 2 món", ô T02 viền cam; phiếu bếp không có món nào. Hủy: hỏi lại, phiếu T01 trống, không gửi API nào. Mở order: S08 bàn T02 hiện lại đúng 2 món + ghi chú, Gửi bếp được | |

TC57 đến TC63 đã chạy bằng script API ngày 22/11 (13/13 bước; sau khi thêm ghi số kg trên app: 14/14 bước); TC66 có test tự động ở app; khi viết báo cáo nên thử lại trên giao diện rồi ghi kết quả thật.

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
| 21 | Lộ thông tin nội bộ cho khách | Lịch sử chuyển bàn (tên nhân viên, lý do) chỉ có trong API quản trị (`adminInclude`), API tra cứu của khách không trả | `reservations.controller.js` |
| 22 | Nhân viên chỉ được báo việc lại tự giao / tự đóng việc | Backend bỏ `assigneeId` nếu không có quyền Sửa; Hoàn thành / Hủy kiểm tra quyền và người nhận ở backend | `cleaning.controller.js`, `maintenance.controller.js` |
| 23 | Sửa tiền món bán theo kg | App / web chỉ gửi số kg; giá 1 kg lấy từ DB lúc gọi món, tiền dòng tính ở backend. Chỉ người có quyền Sửa "Hồ hải sản & nhập hàng" mới cân được (phục vụ gọi API cân: 403); số kg ngoài 0,05 đến 30 bị từ chối | `dine-in.service.js > weighItem`, `dine-in.routes.js` |

**Còn thiếu (nên nêu ở phần hạn chế):** token lưu ở localStorage (nếu web bị chèn mã độc XSS thì có thể bị lấy; mạnh hơn là cookie `httpOnly` + refresh token); chưa có thu hồi token; chưa xác thực email / quên mật khẩu; rate limit lưu trong RAM (chạy nhiều server cần Redis).

---

## 7. Kết luận và hướng phát triển

### 7.1 Kết quả đạt được

- Hoàn thành website khách hàng với 18 chức năng (KH01 đến KH18) và trang quản trị với 20 chức năng (QT01 đến QT20), gồm trang công việc cho lễ tân (chuyển / xếp bàn), tạp vụ (vệ sinh), kỹ thuật (sửa chữa, bảo trì định kỳ, chi phí) và hồ hải sản (cân hải sản bán theo kg).
- Một REST API 94 endpoint dùng chung cho website và app Flutter của nhân viên phục vụ ([docs/23](23-app-nhan-vien-phuc-vu.md)).
- Thực đơn hải sản 12 nhóm / 70 món bán đúng như quán hải sản thật: hải sản sống tính tiền **theo kg cân thực tế** (khách không đặt online được, tại quán hồ hải sản cân rồi mới cộng tiền, tiền tính ở server, cân lại được khi bếp chưa làm, chưa cân thì chưa thu tiền); khối Best seller ở trang chủ giới thiệu món bán chạy; đổi thực đơn trên database đang chạy không làm mất đơn cũ.
- Phân quyền chi tiết 12 vai trò × 12 chức năng × 4 quyền, chặn ở cả backend và giao diện, có cơ chế chống tự nâng quyền.
- Tích hợp thanh toán VNPay (sandbox) đúng quy trình: chữ ký, IPN, trang trả về, ghi nhận một lần, lưu lịch sử để đối soát.
- Đặt bàn có sơ đồ bàn trực quan, chặn đặt trùng kể cả khi nhiều người đặt cùng lúc.
- Đảm bảo đúng dữ liệu: tính tiền ở server, transaction, state machine, lưu giá tại thời điểm đặt, xử lý múi giờ Việt Nam.
- Mọi bộ phận trong nhà hàng đều có chỗ làm việc trên hệ thống: phục vụ / lễ tân / bếp báo cần dọn và báo hỏng chỉ bằng 1 nút, bộ phận phụ trách thấy ngay, mọi việc có lịch sử ai làm, lúc nào.
- Bộ tài liệu 24 file giải thích kiến trúc, CSDL, API, từng tính năng, cách sửa và bài tập.
- Về bản thân: [Tự điền: kiến thức, kỹ năng học được]

### 7.2 Hạn chế

| Hạn chế | Ghi chú |
|---|---|
| Chưa có kiểm thử tự động | Mới kiểm thử thủ công + lint + build |
| Cập nhật trạng thái bằng polling (15 đến 30 giây) | Chưa realtime, admin chưa có chuông báo đơn mới |
| Hồ hải sản mới có phần cân | Chức năng "Hồ hải sản & nhập hàng" mới dùng cho trang Cân hải sản; chưa có nhập / xuất hồ, tồn kho theo kg, báo hải sản hết (vẫn tắt món bằng tay) |
| Cân hải sản nhập tay | Chưa nối cân điện tử; chưa lưu con nào khách chọn (ảnh, mã con); trang Cân hải sản báo món mới bằng tự tải lại 10 giây |
| Chưa có trang quản lý bàn | Thêm / sửa / tắt bàn đang làm qua Prisma Studio (xếp / chuyển bàn cho lịch đã có) |
| Đơn tại bàn chưa nhận mã giảm giá / VNPay | Thu ngân chỉ ghi nhận "Đã thu tiền" (tiền mặt / chuyển khoản tự kiểm), xem [docs/23](23-app-nhan-vien-phuc-vu.md) |
| Món chưa có tùy chọn | Chưa chọn size, cách chế biến: mỗi cách chế biến là 1 món riêng (vd Tôm sú có 8 món). Món theo kg chỉ bán tại quán, chưa có đặt trước con hải sản online |
| Mã giảm giá chỉ giới hạn tổng lượt | Chưa giới hạn số lần mỗi khách được dùng |
| Đổi giờ / số khách của lịch đặt bàn | Chưa sửa được, phải hủy rồi đặt lại |
| Chưa có thông báo email / SMS | Khách phải tự vào xem khi đơn đổi trạng thái hay lịch bị hủy |
| Thanh toán | VNPay mới chạy sandbox; hoàn tiền phải làm tay trên trang VNPay; chưa có MoMo / QR chuyển khoản |
| Đánh giá | Admin chỉ xóa được, chưa phản hồi hay ẩn đánh giá |
| Báo cáo | Chưa xuất Excel / PDF |
| Bảo mật | Token ở localStorage, chưa có refresh token, chưa quên mật khẩu; rate limit trong RAM |
| Ảnh upload | Lưu trên ổ đĩa server, mất khi deploy lại trên một số dịch vụ |
| App mobile chưa xong | Đang làm ([docs/19](19-app-mobile.md)) |
| Việc vệ sinh / bảo trì chưa tự tạo theo lịch | Phải bấm "Đã dọn xong" / thêm việc; bảo trì chỉ nhắc khi đến hạn, chưa tự tạo phiếu |
| Báo hỏng, báo cần dọn chưa đính kèm ảnh | Chỉ có chữ |
| Tạp vụ, kỹ thuật chưa nhận thông báo đẩy | Dùng polling 30 giây, phải mở trang mới thấy việc mới |

### 7.3 Hướng phát triển

1. Làm **app mobile Flutter** cho khách theo đặc tả [docs/16](16-dac-ta-app-mobile-stitch.md), dùng lại toàn bộ API.
2. **Realtime bằng Socket.IO:** admin có chuông báo đơn mới, khách thấy trạng thái đổi ngay.
3. **Gọi món tại bàn bằng mã QR** + **màn hình bếp** hiện món và ghi chú khẩu vị theo thứ tự đơn (dùng quyền KITCHEN đã có).
4. Trang **quản lý bàn** (kéo thả bố cục), đánh dấu bàn có khách vãng lai; bàn báo hỏng thì tự tạm ngưng.
5. **Hậu cần:** việc vệ sinh lặp lại theo lịch (vd dọn nhà vệ sinh mỗi 2 tiếng), ảnh trước / sau khi dọn, ảnh sự cố khi báo hỏng, biểu đồ chi phí sửa chữa theo tháng / thiết bị, app cho nhân viên.
6. **Tùy chọn món** (size, cách chế biến): khách chọn 1 loại hải sản rồi chọn cách chế biến, thay vì mỗi cách là 1 món; cho khách đặt trước con hải sản khi đặt bàn.
7. Trang **Thu ngân** (chốt ca, đối soát VNPay) và mở rộng **Hồ hải sản**: nhập / xuất hàng, tồn kho theo kg, báo hải sản hết thì món tự tắt, nối cân điện tử để số kg tự nhảy vào ô cân.
8. **Thông báo email / SMS / Zalo** khi xác nhận, hủy đơn hay lịch; **quên mật khẩu** qua email.
9. Thêm cổng **MoMo**, **QR chuyển khoản (VietQR)**.
10. **Tích điểm thành viên**, giới hạn lượt dùng mã theo từng khách, món yêu thích.
11. **Kiểm thử tự động** (vitest + supertest), **CI** bằng GitHub Actions (lint, test, build mỗi lần push).
12. **Bảo mật:** cookie `httpOnly` + refresh token, rate limit bằng Redis, giám sát lỗi (Sentry).
13. **Hạ tầng:** ảnh lên Cloudinary / S3, Docker hóa cả backend + frontend, deploy chính thức.

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
19. Tài liệu nội bộ dự án: thư mục `docs/` (01 đến 24)

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
| Hai lễ tân cùng chuyển 2 lịch vào 1 bàn thì sao? | Chuyển bàn dùng lại hàm kiểm tra của đặt bàn trong transaction Serializable; người sau nhận 409 và sơ đồ tự tải lại (mục 5.3.14) |
| Khu vực bẩn / thiết bị hỏng lưu thế nào, có bị lệch không? | Không lưu cột trạng thái riêng; tính từ việc / phiếu chưa xong mỗi lần đọc, nên việc xong là khu tự sạch (mục 5.3.13) |
| Vì sao tách Vệ sinh khỏi Thiết bị & bảo trì? | Nếu chung 1 chức năng, ai có quyền Thiết bị (kỹ thuật, bếp, hồ hải sản) cũng thấy 4 trang vệ sinh; tách ra để mỗi bộ phận chỉ thấy đúng việc của mình |
| Vì sao Báo hỏng là nút, không phải mục menu? | Gần như bộ phận nào cũng cần báo hỏng; nếu thành mục menu thì menu của tạp vụ, phục vụ dài thêm, trong khi họ chỉ cần bấm 1 nút |
| Bấm "Đã bảo trì" mà máy vẫn báo có sự cố là lỗi à? | Không. Bảo trì định kỳ (máy chạy tốt, đến hạn vệ sinh) và sửa sự cố (máy hỏng) là 2 việc khác nhau, bảo trì không tự đóng phiếu hỏng. Hộp thoại bảo trì liệt kê phiếu đang mở và có ô "Máy đã sửa xong, đóng luôn các phiếu này" (bắt buộc ghi cách xử lý) để không đóng nhầm |
| Vì sao bảo trì định kỳ lưu chung bảng phiếu sửa chữa? | Để lịch sử và tổng chi phí của cả sửa chữa lẫn bảo trì nằm một chỗ; phân biệt bằng cột `type` |
| Thêm chức năng mới thì vai trò cũ có quyền không? | Không tự có. Migration `them_ve_sinh` chạy SQL cấp quyền cho vai trò mặc định; vai trò tự tạo thì admin tích trên giao diện |
| Vì sao món hải sản theo kg không cho đặt online? | Mỗi con nặng khác nhau, khách phải chọn con tại hồ và cân thì mới biết giá. Web chỉ hiện giá / kg và nút "Đặt bàn để thưởng thức"; giỏ hàng bỏ qua món này, backend cũng chặn (400) nếu ai gọi thẳng API |
| Gọi món theo kg lúc chưa cân thì tính tiền thế nào? | App mặc định 1 kg, phục vụ ghi theo ý khách (vd "con khoảng 1,2 kg"), backend cộng **tiền tạm** theo số đó để phục vụ, thu ngân thấy tổng gần đúng. Hồ hải sản cân thật, ô cân điền sẵn số phục vụ ghi; xác nhận hoặc sửa thì backend chỉ cộng / trừ phần chênh lệch. Còn món chờ cân thì không cho gửi thanh toán / thu tiền, nên khách luôn trả theo số kg thật |
| Cân nhầm thì sao, tiền có bị cộng 2 lần không? | Bấm "Cân lại" khi bếp chưa nhận làm. Backend tính lại tiền dòng theo số kg mới và chỉ cộng / trừ **phần chênh lệch** trong transaction, nên không bị cộng trùng. Bếp đã nhận làm thì không cho cân lại (con đã vào nồi) |
| Đổi thực đơn có làm mất đơn hàng cũ không? | Không. `db:seed-menu` chỉ xóa món cũ chưa từng bán và chưa có đánh giá; món cũ đã nằm trong đơn thì ẩn và gom vào nhóm "Ngừng bán (thực đơn cũ)". Đơn cũ còn lưu tên và giá lúc đặt (`OrderItem`) nên xem lại vẫn đúng |
| Best seller lấy theo gì? | Admin tự chọn (ô Best seller, cột `isFeatured`); trong số đó trang chủ xếp món bán chạy (`soldCount`) lên trước. Chọn tay để quán chủ động giới thiệu món muốn đẩy, không phụ thuộc hoàn toàn vào số bán |

### Phụ lục B: Kịch bản demo khi bảo vệ (khoảng 10 phút)

Chuẩn bị: chạy `npm run setup` trước buổi bảo vệ cho dữ liệu sạch; mở 2 trình duyệt (hoặc 1 điện thoại + 1 máy tính cùng mạng).

1. **Trang khách (điện thoại):** trang chủ: khối Best seller ngay dưới ảnh bìa → thực đơn, bấm chip "Best seller", lọc "Hàu", tìm "cơm chiên" → mở "Tôm hùm nướng phô mai": chỉ có nút "Đặt bàn để thưởng thức" (bán theo kg, không giao hàng) → thêm 2 món theo phần vào giỏ (Hàu nướng mỡ hành, Cơm chiên hải sản), ghi chú "ít cay" bằng nút gợi ý.
2. **Thanh toán:** áp mã `WELCOME10`, chỉ phí ship / miễn phí → đặt hàng tiền mặt → trang theo dõi đơn.
3. **Admin (máy tính, `admin@fab.vn`):** trang Đơn hàng → mở đơn vừa đặt, chỉ ghi chú món → bấm Xác nhận, Bắt đầu chế biến → quay lại điện thoại: trạng thái tự đổi.
4. **Đặt bàn (điện thoại):** chọn khu "Ngoài trời - view biển", 19:00 ngày mai → chỉ bàn B03 đang có khách (đỏ) → chọn bàn trống → đặt thành công, có mã RSV.
5. **Lễ tân (`letan@fab.vn`):** trang Đặt bàn, chế độ Sơ đồ bàn → thấy bàn vừa đặt màu vàng → Hủy kèm lý do "Hết bàn vào khung giờ này" → khách tra cứu thấy lý do, bấm Đặt lại.
6. **Phân quyền:** đăng nhập `bep@fab.vn` → menu chỉ có mục của bếp, không có Mã giảm giá, không có nút Thêm món → `admin@fab.vn` mở Ma trận, cấp cho Bếp quyền Xem mã giảm giá → Bếp tải lại trang thấy mục mới.
7. **Tổng quan:** biểu đồ doanh thu 30 ngày, món bán chạy.
8. (Nếu đã cấu hình VNPay sandbox) đặt đơn VNPay, thanh toán bằng thẻ test, xem lịch sử giao dịch trong admin.
9. **Lễ tân chuyển bàn (`letan@fab.vn`):** tab Hôm nay → bấm Chuyển bàn → bàn hiện tại màu tím → chọn bàn ngoài trời view biển, lý do "Khách muốn ngồi view biển" → khách tra cứu thấy số bàn mới.
10. **Vệ sinh:** `phucvu@fab.vn` mở Khu vực cần dọn, báo "Nhà vệ sinh nữ hết giấy" mức Gấp → `tapvu@fab.vn` thấy việc gấp viền đỏ, bấm Bắt đầu rồi Hoàn thành → khu xanh lại, việc vào Lịch sử.
11. **Kỹ thuật:** `bep@fab.vn` bấm nút Báo hỏng "Tủ đông hải sản không lạnh" → `kythuat@fab.vn` Nhận sửa → Chờ linh kiện → Hoàn thành kèm chi phí → Lịch sử sửa chữa hiện tổng chi phí; bấm Đã bảo trì ở máy sục khí hồ quá hạn.
12. **Cân hải sản bán theo kg:** `phucvu@fab.vn` trên app chọn 1 bàn, gọi "Tôm hùm nướng phô mai" + "Cơm chiên hải sản", ở phiếu bấm vào "1 kg" gõ `1,2` → Gửi bếp → S04 thấy tôm hùm "Chờ cân", "Ghi 1,2 kg", tổng đã gồm tiền tạm → web `hohaisan@fab.vn` mở **Cân hải sản** (số đỏ 1), ô số kg điền sẵn `1,2`, sửa thành `1,25`, Xác nhận cân → app tự tải lại: "Đã cân 1,25 kg", tổng tăng thêm 94.500đ → Gửi thanh toán → `thungan@fab.vn` In bill thấy dòng "1,25 kg x 1.890.000/kg".

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
| Bảo trì định kỳ | Kiểm tra, vệ sinh thiết bị theo chu kỳ (vd 30 ngày) trước khi hỏng |
| Migration dữ liệu | Migration ngoài đổi cấu trúc còn sửa / thêm dữ liệu (vd cấp quyền cho vai trò có sẵn) |
| Best seller | Món bán chạy / món quán muốn giới thiệu, hiện nổi bật ở trang chủ (cột `isFeatured`) |
| Bán theo kg, cân tại hồ | Hải sản sống niêm yết giá 1 kg; khách chọn con, nhân viên hồ hải sản cân, tiền = giá 1 kg × số kg thực tế |
| Chờ cân | Trạng thái món bán theo kg vừa gọi, hồ hải sản chưa cân; tiền đang là tiền tạm theo số kg phục vụ ghi (`WEIGHING`) |

### Phụ lục D: Tài liệu cũ chưa khớp với code hiện tại

Khi chép từ các tài liệu khác trong `docs/` vào báo cáo, lưu ý mấy chỗ đã cũ (file này đã dùng thông tin đúng):

| Tài liệu | Chỗ cũ | Thực tế hiện tại |
|---|---|---|
| [01](01-tong-quan-kien-truc.md) mục 5 | Chỉ có CUSTOMER và ADMIN, middleware `requireAdmin` | Có thêm STAFF + ma trận quyền, route quản trị dùng `requirePermission` |
| [03](03-database-prisma.md) mục 1 | ERD 9 bảng, `role` chỉ "CUSTOMER \| ADMIN" | 17 bảng (thêm StaffRole, RolePermission, DiningTable, ReservationTableChange, CleaningArea, CleaningTask, Equipment, RepairTicket), có STAFF, thêm cột `OrderItem.note`, `Reservation.tableId`, `cancelReason`, `Order.cancelReason` |
| [10](10-so-tay-toan-tap.md) mục 26 | "8 bảng" | 17 bảng |
| [10](10-so-tay-toan-tap.md) mục 27 dòng 4 | "`requireAdmin` ở mọi route admin" | `requirePermission` theo từng chức năng |
| [10](10-so-tay-toan-tap.md) mục 33 | "Đặt bàn chưa kiểm tra còn bàn trống" | Đã có sơ đồ bàn và chặn đặt trùng giờ |
| [07](07-lo-trinh-hoc-va-bai-tap.md) bài tập 8a, 15, 16 | Ghi là bài tập | Đã làm: rate limit cho đặt món / đặt bàn, VNPay, quản lý bàn + kiểm tra bàn trống |
| [16](16-dac-ta-app-mobile-stitch.md) (đặc tả app khách, đã bỏ) | Thực đơn 8 danh mục (Khai vị, Tôm, Cá, Mâm hải sản, Món Nhật, Cơm & Mì, Tráng miệng, Đồ uống), món "Sashimi cá hồi Na Uy" | Từ 22/11 thực đơn 12 nhóm hải sản / 70 món ([24](24-thuc-don-ban-theo-kg.md)); app là app nhân viên ([23](23-app-nhan-vien-phuc-vu.md)) |
