# 20. Vệ sinh & dọn dẹp (trang của Tạp vụ)

Tạp vụ đăng nhập (`tapvu@fab.vn` / `123456`) sẽ thấy nhóm **Vệ sinh** với đúng 4 mục:

| Mục | Đường dẫn | Dùng để |
|---|---|---|
| Tổng quan | `/admin/cleaning` | Việc của tôi, việc gấp, khu vực đang cần dọn, khu lâu chưa dọn, hôm nay ai làm được bao nhiêu việc |
| Nhiệm vụ vệ sinh | `/admin/cleaning/tasks` | Danh sách việc chưa xong. Bấm **Bắt đầu** để nhận việc, **Hoàn thành** khi làm xong |
| Khu vực cần dọn | `/admin/cleaning/areas` | Mỗi khu 1 ô: đỏ = đang có việc, vàng = lâu chưa dọn, xanh = sạch. Bấm **Đã dọn xong** sau khi dọn cả khu |
| Lịch sử công việc | `/admin/cleaning/history` | Việc đã xong, lọc theo ngày, người làm, khu vực; xem cả việc đã hủy |

Tạp vụ vào `/admin` sẽ được chuyển thẳng tới Tổng quan vệ sinh. Tạp vụ **không** xem được doanh thu, đơn hàng hay đặt bàn.

> **Phạm vi công việc:** tạp vụ lo vệ sinh quanh nhà hàng: rửa chén bát, rửa ly, quét lau sàn, dọn nhà vệ sinh, đổ rác. **Dọn bàn sau khi khách về là việc của phục vụ**, không nằm trong chức năng này.

## 1. Luồng làm việc

```
Quản lý / tổ trưởng giao việc ─┐
Tạp vụ tự thêm việc ───────────┼─► Việc "Chờ làm" ──Bắt đầu──► "Đang làm" ──Hoàn thành──► "Đã xong" ─► Lịch sử
Phục vụ / lễ tân / bếp báo ────┘        │                                                    ▲
  ("Nhà vệ sinh nữ hết giấy")           └──────────────── Xong (làm luôn) ──────────────────┘
                                        Quản lý có thể Hủy (bắt buộc lý do) ──► "Đã hủy"
```

- **Bắt đầu** = nhận việc: người bấm trở thành người làm. Việc đang giao cho người khác thì hệ thống hỏi lại "nhận làm thay?".
- **Hoàn thành**: được ghi chú (không bắt buộc), vd "Hết xà phòng, đã báo kho". Chỉ bấm được với việc chưa ai nhận, việc của mình, hoặc nếu là quản lý (xác nhận thay).
- **Đã dọn xong** (ở trang Khu vực): đánh dấu xong mọi việc đang chờ ở khu đó mà mình được phép hoàn thành (việc người khác đang làm thì giữ nguyên). Khu chưa có việc nào thì ghi 1 lần **"Dọn định kỳ"** vào lịch sử, giống tờ giấy ký tên dán ở cửa nhà vệ sinh.
- **Việc gấp** luôn nằm trên cùng, viền đỏ.
- Các trang tự tải lại mỗi 30 giây, nên phục vụ vừa báo là tạp vụ thấy ngay.

## 2. Ai được làm gì

Chức năng mới trong ma trận phân quyền: **Vệ sinh & dọn dẹp** (`CLEANING`), tách riêng khỏi **Thiết bị & bảo trì** (`FACILITY`, trước đây tên là "Thiết bị, bảo trì & vệ sinh"). Tách ra để Kỹ thuật, Bếp, Hồ hải sản (có quyền ở Thiết bị) không bị hiện thêm 4 mục vệ sinh.

| Quyền | Được làm |
|---|---|
| Xem | Vào trang Khu vực cần dọn |
| Thêm | Thêm việc / **Báo cần dọn** |
| Sửa | Thấy cả 4 trang; Bắt đầu, Hoàn thành, Đã dọn xong; sửa nội dung và giao việc cho người khác |
| Xóa | Hủy việc, hoàn thành thay người khác, thêm / sửa / ẩn khu vực (nút **Quản lý khu vực**) |

Vì sao Tổng quan, Nhiệm vụ, Lịch sử cần quyền **Sửa**: người chỉ có Xem + Thêm (phục vụ, lễ tân, bếp) chỉ cần báo chỗ cần dọn, nên menu của họ chỉ thêm 1 mục "Khu vực cần dọn" cho gọn. Khai báo bằng `action: 'edit'` trong [adminMenu.js](../frontend/src/lib/adminMenu.js).

Quyền mặc định (sửa được trên trang Phân quyền):

| Vai trò | Vệ sinh | Thấy gì |
|---|---|---|
| Chủ nhà hàng, Admin, Quản lý | VCED | Cả 4 trang + hủy việc + quản lý khu vực |
| Tổ trưởng | VCE | Cả 4 trang, giao việc |
| **Tạp vụ** | **VCE** | **Cả 4 trang**, tự thêm việc |
| Phục vụ, Lễ tân, Bếp | VC | Chỉ "Khu vực cần dọn" để báo |
| Thu ngân, Kỹ thuật, Tiếp thực, Hồ hải sản | - | Không thấy |

Cùng lúc, Tạp vụ **bỏ quyền xem Đặt bàn** (không dọn bàn nên không cần) và chỉ giữ quyền **Thêm** ở Thiết bị & bảo trì (để báo hỏng: vòi nước rò, đèn hỏng...).

## 3. Dữ liệu

| Bảng | Ý nghĩa |
|---|---|
| `CleaningArea` | Khu vực: `name`, `description` (việc thường làm), `sortOrder`, `isActive` (ẩn khi đang sửa chữa), `lastCleanedAt` (lần gần nhất có việc xong ở khu này) |
| `CleaningTask` | 1 việc: `title`, `note`, `areaId`, `priority` (`NORMAL` / `URGENT`), `status` (`TODO` / `IN_PROGRESS` / `DONE` / `CANCELLED`), `assigneeId` (người làm, trống = chưa ai nhận), `createdById` (người báo / giao), `startedAt`, `completedAt`, `resultNote` (ghi chú khi xong / lý do hủy) |

**Một nguồn dữ liệu:** "Khu vực cần dọn" = khu đang có việc `TODO` / `IN_PROGRESS`; "Lịch sử" = việc `DONE`. Không có cột "bẩn / sạch" riêng nên không bao giờ lệch: việc xong là khu tự xanh lại.

**10 khu vực mặc định** nằm ở [config/cleaning.js](../backend/src/config/cleaning.js): Khu rửa chén bát, Quầy rửa ly, Nhà vệ sinh nam, Nhà vệ sinh nữ, Sảnh & lối vào, Sàn phòng ăn trong nhà, Sân ngoài trời - view biển, Phòng VIP, Sàn bếp & cống thoát nước, Khu tập kết rác. Chỉ dùng để tạo lần đầu (database chưa có khu nào thì tự tạo khi mở trang), sau đó quản lý sửa trên giao diện.

`STALE_HOURS = 4` trong cùng file: khu sạch nhưng quá 4 tiếng chưa ai dọn sẽ hiện màu vàng "Lâu chưa dọn".

## 4. API

Tất cả cần đăng nhập, quyền theo chức năng `CLEANING`.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/cleaning/overview` | Xem | `{ counts, urgentTasks, myTasks, dirtyAreas, staleAreas, recentDone, doneTodayByUser, staleHours }` |
| GET | `/cleaning/areas?all=true` | Xem | Khu vực + `openTasks[]`, `needsCleaning`, `isStale`. `all=true` (quyền Xóa) kèm khu đang ẩn |
| POST / PUT | `/cleaning/areas`, `/cleaning/areas/:id` | Xóa | `{ name, description?, sortOrder?, isActive? }`. Không xóa hẳn khu vực (còn lịch sử), chỉ ẩn |
| POST | `/cleaning/areas/:id/clean` | Sửa | `{ note? }` "Đã dọn xong" cả khu. Trả `{ closed, skipped }` + `message` |
| GET | `/cleaning/tasks?status=OPEN&mine=true&areaId=` | Xem | Việc chưa xong. `status`: `OPEN` (mặc định, = chờ + đang làm) / `TODO` / `IN_PROGRESS` |
| POST | `/cleaning/tasks` | Thêm | `{ title, areaId, note?, priority?, assigneeId? }`. `assigneeId` chỉ có tác dụng khi người tạo có quyền Sửa |
| PUT | `/cleaning/tasks/:id` | Sửa | Như trên; chỉ sửa được việc chưa xong. `assigneeId: null` = bỏ giao |
| PATCH | `/cleaning/tasks/:id/status` | Sửa | `{ status: IN_PROGRESS \| DONE \| CANCELLED, note? }`. Hủy cần thêm quyền Xóa và **bắt buộc** `note` (lý do) |
| GET | `/cleaning/history?from=&to=&userId=&areaId=&status=DONE&page=` | Xem | Mặc định 7 ngày gần nhất (giờ VN). `meta.byUser` = số việc từng người |
| GET | `/cleaning/staff` | Thêm hoặc Sửa | Nhân viên có quyền Sửa vệ sinh (để giao việc, lọc lịch sử) |

Hai người bấm cùng lúc: cập nhật kèm điều kiện trạng thái cũ (`updateMany where { id, status }`), người sau nhận lỗi 409 "vừa được người khác cập nhật".

## 5. File liên quan

| File | Nội dung |
|---|---|
| [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) | `CleaningArea`, `CleaningTask`, enum `CleaningStatus`, `CleaningPriority` |
| [backend/prisma/migrations/…_them_ve_sinh](../backend/prisma/migrations/) | Tạo bảng + **cấp quyền `CLEANING` cho vai trò có sẵn**, bỏ quyền Đặt bàn của Tạp vụ |
| [backend/src/config/cleaning.js](../backend/src/config/cleaning.js) | Khu vực mặc định, `STALE_HOURS` |
| [backend/src/config/permissions.js](../backend/src/config/permissions.js) | Chức năng `CLEANING` + quyền mặc định |
| [backend/src/modules/cleaning/](../backend/src/modules/cleaning/) | `cleaning.routes.js`, `cleaning.validation.js`, `cleaning.controller.js` (luật nghiệp vụ, `CLEANING_FLOW`) |
| [backend/src/utils/helpers.js](../backend/src/utils/helpers.js) | `startOfVnDay`, `vnDate`, `addDays`: tính ngày theo giờ Việt Nam |
| [frontend/src/pages/admin/cleaning/](../frontend/src/pages/admin/cleaning/) | `Overview.jsx`, `Tasks.jsx`, `Areas.jsx` (kèm Quản lý khu vực), `History.jsx` |
| [frontend/src/components/cleaning/](../frontend/src/components/cleaning/) | `TaskCard.jsx` (thẻ việc + nút), `TaskFormModal.jsx` (thêm / sửa / báo cần dọn), `NoteDialog.jsx` |
| [frontend/src/lib/adminMenu.js](../frontend/src/lib/adminMenu.js) | 4 mục menu nhóm "Vệ sinh"; mục menu có thêm `action` (quyền cần có) và `group` (tên nhóm) |
| [frontend/src/components/layout/ProtectedRoute.jsx](../frontend/src/components/layout/ProtectedRoute.jsx) | Thêm prop `action`, vd `<ProtectedRoute module="CLEANING" action="edit" />` |

## 6. Cập nhật database đang có

```bash
npm --prefix backend run db:deploy   # tạo 2 bảng + cấp quyền Vệ sinh, KHÔNG xóa dữ liệu
```

Migration tự cấp quyền cho 12 vai trò mặc định đang có trong database. Vai trò tự tạo thì vào **Phân quyền** tích cột "Vệ sinh & dọn dẹp". Database mới (`npm run setup`) có sẵn 5 việc đang chờ và lịch sử 7 ngày để xem thử.

> Windows: nếu lệnh báo `EPERM ... query_engine-windows.dll.node` là do backend đang chạy giữ file. Bảng vẫn đã tạo xong; tắt `npm run dev` rồi chạy `npm --prefix backend run generate` cho chắc.

## 7. Muốn mở rộng

- **Đổi khu vực:** đăng nhập Quản lý → Khu vực cần dọn → **Quản lý khu vực**. Muốn đổi danh sách mặc định cho database mới: sửa `areas` trong `config/cleaning.js`.
- **Đổi mốc "lâu chưa dọn":** `STALE_HOURS` trong `config/cleaning.js`.
- **Thêm gợi ý tên việc:** `CLEANING_SUGGESTIONS` trong [frontend/src/lib/constants.js](../frontend/src/lib/constants.js).
- **Ý tưởng tiếp theo:** việc lặp lại hằng ngày (tự tạo "Dọn nhà vệ sinh" mỗi 2 tiếng), chụp ảnh sau khi dọn, thêm màn hình vệ sinh vào app mobile cho nhân viên.
