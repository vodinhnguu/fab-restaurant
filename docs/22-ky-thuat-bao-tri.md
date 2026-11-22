# 22. Kỹ thuật: thiết bị, phiếu sửa chữa, bảo trì định kỳ

Nhân viên kỹ thuật đăng nhập (`kythuat@fab.vn` / `123456`) sẽ thấy nhóm **Kỹ thuật** với 4 mục. Vào `/admin` sẽ được chuyển thẳng tới Tổng quan.

| Mục | Đường dẫn | Dùng để |
|---|---|---|
| Tổng quan | `/admin/maintenance` | Phiếu của tôi, phiếu gấp, phiếu mới chưa ai nhận, thiết bị **đến hạn bảo trì** (bấm "Đã bảo trì" ngay tại đây), phiếu vừa sửa xong, chi phí tháng này |
| Phiếu sửa chữa | `/admin/maintenance/tickets` | Sự cố chưa xong. Tab Tất cả / Của tôi / Mới báo / Đang sửa / Chờ linh kiện, lọc theo nhóm thiết bị |
| Thiết bị & bảo trì | `/admin/maintenance/equipment` | Thiết bị gom theo nhóm, mỗi máy 1 ô: tình trạng, phiếu đang mở, chu kỳ và hạn bảo trì. Thêm / sửa / ngưng dùng thiết bị |
| Lịch sử sửa chữa | `/admin/maintenance/history` | Phiếu đã xong và các lần bảo trì, lọc theo ngày / loại / người sửa / thiết bị, **tổng chi phí** |

Các bộ phận khác báo hỏng bằng nút **Báo hỏng** trên thanh tiêu đề trang admin (không phải mục menu, để menu của tạp vụ, phục vụ, lễ tân không dài thêm). Bên dưới form có danh sách **"Bạn đã báo gần đây"** để người báo xem kỹ thuật đã xử lý tới đâu.

Phạm vi: điện lạnh (máy lạnh, tủ đông, kho lạnh), hệ thống hồ hải sản (sục khí, lọc, làm lạnh nước), thiết bị bếp, điện nước, máy phát điện, thiết bị an toàn (bình chữa cháy, camera).

## 1. Luồng phiếu sửa chữa

```
Nhân viên bấm "Báo hỏng" ──► Mới báo ──Nhận sửa──► Đang sửa ──Hoàn thành──► Đã sửa xong ─► Lịch sử
(chọn thiết bị, sự cố,          │                    │    ▲         (ghi cách xử lý + chi phí)
 mức độ Bình thường / Gấp)      │           Chờ linh kiện │
                                │           (ghi đang chờ gì)
                                │                    └─Tiếp tục sửa─┘
                                └── Kỹ thuật có thể Hủy (bắt buộc lý do) ──► Đã hủy
```

- **Nhận sửa** / **Tiếp tục sửa**: người bấm trở thành người sửa. Phiếu đang do người khác nhận thì hệ thống hỏi lại "nhận sửa thay?".
- **Chờ linh kiện**: bắt buộc ghi đang chờ gì, vd "Đã đặt màng bơm, 2 ngày nữa giao". Người báo thấy dòng này ở "Bạn đã báo gần đây".
- **Hoàn thành**: bắt buộc ghi cách xử lý; **chi phí** (linh kiện, thuê thợ) không bắt buộc.
- Chỉ người đang nhận phiếu, phiếu chưa ai nhận, hoặc người có quyền Xóa (kỹ thuật) mới bấm Chờ linh kiện / Hoàn thành.
- Phiếu **Gấp** (ảnh hưởng khách hoặc an toàn: tủ đông không lạnh, máy sục khí hồ ngừng) luôn nằm trên cùng, viền đỏ.

## 2. Bảo trì định kỳ

Mỗi thiết bị có **chu kỳ bảo trì** (số ngày, để trống = không bảo trì định kỳ), vd máy sục khí hồ 30 ngày, máy lạnh 90 ngày, bình chữa cháy 180 ngày.

- **Hạn tiếp theo** = lần bảo trì gần nhất (`lastMaintainedAt`; chưa có thì lấy ngày thêm thiết bị) + chu kỳ.
- Quá hạn → đỏ "Quá hạn bảo trì x ngày"; còn ≤ 7 ngày (`DUE_SOON_DAYS`) → vàng "Còn x ngày".
- Bấm **Đã bảo trì** (ghi chú, chi phí không bắt buộc): lưu 1 phiếu loại "Bảo trì định kỳ" đã xong vào lịch sử và tính lại hạn từ hôm nay.
- Mỗi máy chỉ ghi bảo trì **1 lần / ngày** (giờ VN): bấm xong nút đổi thành "Đã bảo trì hôm nay" (mờ), backend cũng chặn ghi trùng.

> **Bảo trì không đóng phiếu sửa chữa.** Máy đang có phiếu "không chạy" mà chỉ bấm Đã bảo trì thì vẫn hiện "Có sự cố". Hai cách đóng phiếu:
> 1. Bấm **Hoàn thành** ngay cạnh phiếu trên thẻ thiết bị (hoặc ở trang Phiếu sửa chữa).
> 2. Trong hộp thoại Đã bảo trì, tích **"Máy đã sửa xong, đóng luôn các phiếu này"** và ghi cách xử lý: các phiếu mình được phép hoàn thành sẽ chuyển Đã sửa xong (phiếu người khác đang sửa giữ nguyên). Chi phí chỉ ghi 1 lần ở dòng bảo trì.

Tình trạng hiện trên mỗi thiết bị (ưu tiên từ trên xuống): Ngưng sử dụng → **Có sự cố** (đang có phiếu sửa chưa xong) → Quá hạn bảo trì → Sắp đến hạn → Hoạt động tốt.

## 3. Ai được làm gì

Dùng chức năng **Thiết bị & bảo trì** (`FACILITY`) có sẵn trong ma trận phân quyền (không cần migration quyền).

| Quyền | Được làm |
|---|---|
| Xem | Trang Thiết bị & bảo trì (xem tình trạng máy) |
| Thêm | Nút **Báo hỏng** |
| Sửa | Thấy cả 4 trang; Nhận sửa, Chờ linh kiện, Hoàn thành, Đã bảo trì; sửa / giao phiếu |
| Xóa | Hủy phiếu, hoàn thành thay người khác, thêm / sửa / ngưng dùng thiết bị |

| Vai trò (mặc định) | Thiết bị & bảo trì | Thấy gì |
|---|---|---|
| Chủ nhà hàng, Admin, **Kỹ thuật** | VCED | Cả 4 trang + quản lý thiết bị + hủy phiếu |
| Quản lý | VCE | Cả 4 trang, giao phiếu (không hủy, không sửa danh sách thiết bị) |
| Tổ trưởng, Bếp, Hồ hải sản | VC | Trang Thiết bị + nút Báo hỏng |
| Phục vụ, Lễ tân, Tạp vụ | C | Chỉ nút Báo hỏng |
| Thu ngân, Tiếp thực | - | Không thấy |

## 4. Dữ liệu

| Bảng | Ý nghĩa |
|---|---|
| `Equipment` | Thiết bị: `name`, `category` (nhóm), `location`, `maintenanceDays` (chu kỳ), `lastMaintainedAt`, `note` (hãng, SĐT thợ bảo hành), `isActive` (ngưng dùng), `sortOrder` |
| `RepairTicket` | 1 phiếu sửa chữa hoặc 1 lần bảo trì: `type` (`REPAIR` / `MAINTENANCE`), `title`, `description`, `equipmentId`, `priority` (`NORMAL` / `URGENT`), `status` (`OPEN` / `IN_PROGRESS` / `WAITING_PARTS` / `DONE` / `CANCELLED`), `reportedById`, `assigneeId`, `waitingNote`, `resolution` (cách xử lý / lý do hủy), `cost` (VNĐ), `startedAt`, `completedAt` |

Giống phần Vệ sinh: "thiết bị có sự cố" và "lịch sử" đều lấy từ bảng `RepairTicket`, không lưu cột "đang hỏng" riêng nên không bao giờ lệch.

**18 thiết bị mặc định** trong [config/equipment.js](../backend/src/config/equipment.js), gồm mục **"Khác / chưa rõ thiết bị"** để người báo không biết là máy nào thì chọn và ghi rõ ở mô tả (vd vòi nước rò). Database chưa có thiết bị thì tự tạo khi mở trang lần đầu.

## 5. API

Tất cả cần đăng nhập, quyền theo chức năng `FACILITY`.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/maintenance/overview` | Xem | `{ counts, urgentTickets, myTickets, newTickets, maintenanceDue, recentDone, dueSoonDays }`. `counts` có `costMonth` (chi phí tháng này) |
| GET | `/maintenance/equipment?all=true` | Xem **hoặc** Thêm | Thiết bị + `openTickets[]`, `hasIssue`, `nextDueAt`, `daysLeft`, `maintenance` (`none` / `ok` / `soon` / `overdue`), `maintainedToday`. Người chỉ có quyền Thêm cũng gọi được để chọn thiết bị khi báo hỏng |
| POST / PUT | `/maintenance/equipment`, `/maintenance/equipment/:id` | Xóa | `{ name, category, location?, maintenanceDays?, note?, sortOrder?, isActive? }`. `category` phải thuộc `EQUIPMENT_CATEGORIES` |
| POST | `/maintenance/equipment/:id/maintain` | Sửa | `{ note?, cost?, closeTickets? }` ghi 1 lần bảo trì (tối đa 1 lần / ngày, lần 2 trả 400). `closeTickets: true` đóng luôn phiếu sửa chữa đang mở (bắt buộc `note`). Trả `{ data: { ..., closed, skipped }, message }` |
| GET | `/maintenance/tickets?status=ACTIVE&mine=true&category=` | Xem | Phiếu chưa xong. `status`: `ACTIVE` (mặc định) / `OPEN` / `IN_PROGRESS` / `WAITING_PARTS` |
| GET | `/maintenance/tickets/reported` | Thêm hoặc Xem | 10 phiếu gần nhất tôi đã báo |
| POST | `/maintenance/tickets` | Thêm | `{ equipmentId, title, description?, priority?, assigneeId? }`. `assigneeId` chỉ có tác dụng khi người tạo có quyền Sửa |
| PUT | `/maintenance/tickets/:id` | Sửa | Như trên; chỉ phiếu chưa xong |
| PATCH | `/maintenance/tickets/:id/status` | Sửa | `{ status: IN_PROGRESS \| WAITING_PARTS \| DONE \| CANCELLED, note?, cost? }`. `note` bắt buộc trừ `IN_PROGRESS`; hủy cần thêm quyền Xóa |
| GET | `/maintenance/history?from=&to=&type=&status=DONE&userId=&equipmentId=&page=` | Xem | Mặc định 30 ngày (giờ VN). `meta.totalCost`, `meta.byUser` (số phiếu + chi phí từng người) |
| GET | `/maintenance/staff` | Thêm hoặc Sửa | Nhân viên có quyền Sửa thiết bị (để giao phiếu, lọc lịch sử) |

Hai người bấm cùng lúc: cập nhật kèm điều kiện trạng thái cũ (`updateMany where { id, status }`), người sau nhận lỗi 409.

## 6. File liên quan

| File | Nội dung |
|---|---|
| [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) | `Equipment`, `RepairTicket`, enum `RepairStatus`, `RepairType`, `RepairPriority` |
| [backend/src/config/equipment.js](../backend/src/config/equipment.js) | `EQUIPMENT_CATEGORIES`, `DUE_SOON_DAYS`, thiết bị mặc định |
| [backend/src/modules/maintenance/](../backend/src/modules/maintenance/) | `maintenance.routes.js`, `maintenance.validation.js`, `maintenance.controller.js` (`REPAIR_FLOW`, `maintenanceInfo`) |
| [frontend/src/pages/admin/maintenance/](../frontend/src/pages/admin/maintenance/) | `Overview.jsx`, `Tickets.jsx`, `Equipment.jsx` (kèm form thiết bị), `History.jsx` |
| [frontend/src/components/maintenance/](../frontend/src/components/maintenance/) | `ReportIssueButton.jsx` (nút trên thanh tiêu đề), `TicketFormModal.jsx` (báo hỏng / tạo / sửa phiếu + "Bạn đã báo gần đây"), `TicketCard.jsx`, `TicketActionDialog.jsx` (chờ linh kiện / hoàn thành / bảo trì) |
| [frontend/src/components/layout/AdminLayout.jsx](../frontend/src/components/layout/AdminLayout.jsx) | Hiện nút Báo hỏng cho ai có quyền Thêm |

## 7. Cập nhật database đang có

```bash
npm --prefix backend run db:deploy   # tạo bảng Equipment, RepairTicket, KHÔNG xóa dữ liệu
```

Database mới (`npm run setup`) có sẵn 5 phiếu đang mở, vài máy quá hạn / sắp đến hạn bảo trì và lịch sử 30 ngày có chi phí để xem thử.

## 8. Muốn mở rộng

- **Thêm nhóm thiết bị:** sửa `EQUIPMENT_CATEGORIES` ở **cả** `backend/src/config/equipment.js` và `frontend/src/lib/constants.js`.
- **Đổi mốc "sắp đến hạn":** `DUE_SOON_DAYS` trong `config/equipment.js`.
- **Ý tưởng tiếp theo:** đính kèm ảnh sự cố; khi bàn hỏng thì tự tắt `DiningTable.isActive` để khách không đặt được; báo cáo chi phí sửa chữa theo tháng / theo thiết bị bằng biểu đồ.
