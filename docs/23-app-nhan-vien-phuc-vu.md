# 23. App nhân viên phục vụ: gọi món tại bàn, bếp, thu ngân

Từ 20/11/2026 app mobile **"FAB Phục vụ"** chỉ dành cho nhân viên. Phục vụ cầm điện thoại tới bàn, ghi món cùng khách, gửi xuống bếp, theo dõi món ra bàn và gửi thanh toán. Bếp và thu ngân làm trên web `/admin`. Khách không dùng app (khách vẫn đặt món online, đặt bàn trên web).

| Ai | Dùng gì | Làm gì |
|---|---|---|
| Phục vụ, tổ trưởng, tiếp thực | App mobile | Chọn khu → chọn bàn → chọn món → **Gửi bếp** (hoặc **Cất order** để gửi sau, **Hủy order** để bỏ); **Nhập số kg** (dẫn khách ra hồ cân món bán theo kg), **Check món** (tick món đã mang ra bàn), **Hủy món**, **Order** (gọi thêm), **Gửi thanh toán** |
| Hồ hải sản (cả bếp, quản lý) | Web `/admin/weighing` "Cân hải sản" | Theo dõi món bán theo kg (tôm hùm, tôm sú, cua, cá mú, tôm tít) còn "Chờ cân"; đối chiếu "Đã cân hôm nay", **Cân lại** khi phục vụ nhập nhầm. Từ 23/11/2026 **phục vụ nhập số kg ngay tại hồ trên app**, không phải chạy vào máy tính |
| Bếp | Web `/admin/kitchen` "Phiếu bếp" | Xem món mới gửi xuống (món theo kg chỉ hiện sau khi cân), bấm **Nhận làm** |
| Thu ngân | Web `/admin/cashier` "Thanh toán tại bàn" | Nhận thông báo bàn gửi thanh toán, **In bill** (khổ 80mm), **Đã thu tiền** |
| Quản lý | Web `/admin/orders` | Xem mọi đơn (đơn tại bàn có loại "Ăn tại quán") |

Code: app `mobile/lib/screens/` (cấu trúc ở [19-app-mobile.md](19-app-mobile.md)), backend `backend/src/modules/dine-in/`, web `frontend/src/pages/admin/dine-in/`. Thực đơn bán theo kg, cân tại hồ: [24-thuc-don-ban-theo-kg.md](24-thuc-don-ban-theo-kg.md).

---

## 1. Luồng

```
 PHỤC VỤ (app)                              BẾP (web)                   THU NGÂN (web)
 ─────────────                              ─────────                   ──────────────
 Đăng nhập → S03 chọn khu → chọn bàn
 S04 bàn trống: "Ghi món" → S05 chọn món
 → S08 phiếu gọi món → "Gửi bếp" ─────────► món mới "Chờ bếp"
   │                                        (chuông + số đỏ trên menu)
   │ món bán theo kg: "Chờ cân"             ▲
   │ (tiền tạm theo số kg ghi, bếp chưa thấy)│
   │ Dẫn khách ra hồ, khách chỉ con, cân:    │
   └──► S04 "Nhập số kg" (S14) ─────────────┘ tiền = giá 1 kg × số kg
        sửa 1 → 0,98, "Lưu số kg"
        (hồ hải sản / quản lý xem lại,
         "Cân lại" trên web khi nhập nhầm)
                                            "Nhận làm" → "Bếp đang làm"
 S04: "Check món" (tick món đã ra bàn)
      "Hủy món" (bếp chưa làm: hủy luôn;
                 bếp làm rồi: ghi lý do)
      "Order" (gọi thêm, cộng vào cùng đơn) ─► món mới "Chờ bếp"
 Khách ăn xong: "Gửi thanh toán" ───────────────────────────────────► bàn lên đầu danh sách, viền cam
 (còn món chờ cân thì nút bị khóa)                                    (chuông + thông báo)
 (gọi thêm sau khi gửi: tự rút yêu cầu,                                "In bill" → "Đã thu tiền"
  hoặc bấm "Rút yêu cầu thanh toán")                                   → đơn Hoàn thành + Đã thanh toán
 S03: bàn trống lại ◄──────────────────────────────────────────────────┘
```

App tự tải lại sơ đồ bàn và đơn của bàn mỗi **15 giây**, web cân hải sản / bếp / thu ngân mỗi **10 giây** (không dùng thông báo đẩy, xem mục 9).

---

## 2. Màn hình

**App (14 mã màn: 9 màn hình + 5 bottom sheet S07, S09, S12, S13, S14).** Chuyển giữa S03, S10, S11 bằng **menu trái** kiểu CukCuk (nút ☰ góc trái hoặc vuốt từ mép trái): đầu menu có tên, vai trò, tổng số bàn có khách / trống / tiền đang phục vụ; dưới là Sơ đồ bàn · Đơn hôm nay · Tài khoản · Đăng xuất.

| Mã | Màn | Có gì |
|---|---|---|
| S01 | Splash | Kiểm tra đăng nhập, mất mạng thì "Thử lại" |
| S02 | Đăng nhập nhân viên | Nút điền nhanh tài khoản demo. Chặn tài khoản khách / không có quyền đơn hàng |
| S03 | Sơ đồ bàn (màn đầu) | **3 ô khu** (Trong nhà, Ngoài trời - view biển, Phòng VIP) kèm số bàn có khách, số bàn chờ thanh toán; sơ đồ bàn của khu theo vị trí x, y: trắng = trống, xanh = có khách (tiền, số món, "2 chưa ra", "1 chờ cân"), cam = chờ thu tiền. Có order đã cất: khung "Order đã cất, chưa gửi bếp" với nút từng bàn ("T01 · 3 món"), ô bàn viền cam + icon dấu trang |
| S04 | Đơn của bàn | Khung xanh "1 món bán theo kg chờ cân" + nút **Nhập số kg** (→ S14). Món theo từng lần gửi bếp, nhãn trạng thái từng món, món hủy gạch ngang kèm lý do, tạm tính. Món bán theo kg: nhãn **Chờ cân**, "Ghi 1 kg × 1.890.000đ/kg · chờ hồ hải sản cân" + tiền tạm; cân rồi: "Đã cân 1,25 kg × 1.890.000đ/kg" + thành tiền. Bàn có order đã cất: khung "Order đã cất: 3 món · lúc 19:05" + nút **Mở order** (→ S08). 3 nút **Check món / Hủy món / Order** + **Gửi thanh toán** (đã gửi thì "Rút yêu cầu thanh toán"). Menu ⋮ **Hủy cả đơn** (bắt buộc lý do) |
| S05 | Chọn món | Tìm, lọc danh mục, sắp xếp, nút "+" thêm vào phiếu, thanh phiếu nổi "Bàn B05 · 3 món" |
| S06 | Chi tiết món | Ảnh, mô tả, đánh giá (để tư vấn khách), ghi chú khẩu vị, `[ − ] 1 [ + ]` (món theo kg: `[ − ] 1 kg [ + ]`, bấm số để gõ, vd 0,98), "Thêm vào phiếu · tiền" |
| S07 | Ghi chú món (sheet) | Chip gợi ý theo loại món + ô 200 ký tự |
| S08 | Phiếu gọi món | Đổi số lượng (−/+ hoặc **bấm vào số để gõ**), ghi chú, xóa món (Hoàn tác). Dưới cùng 3 nút như app CukCuk: **Hủy order** (hỏi lại, xóa phiếu chưa gửi, về S04), **Cất order** (lưu phiếu chưa gửi bếp, về S03), **Gửi bếp** (hỏi lại). Món theo kg: mặc định **1 kg**, `[ − ] 1 kg [ + ]` (−/+ 0,1 kg, gõ được số lẻ vd 0,98, từ 0,05 đến 30 kg), "1.890.000đ / kg · hồ hải sản cân lại", tiền tạm = giá 1 kg × số kg; tạm tính ghi "(N món, món kg tính tạm)" |
| S09 | Gửi thanh toán (sheet) | Xem lại bill (món còn tính tiền, tổng); còn món chưa ra bàn thì nhắc; còn món bán theo kg chưa cân thì khung xanh báo và nút **Gửi thanh toán** bị khóa |
| S10 | Đơn hôm nay | Đã thu hôm nay, đang phục vụ; lọc Đang phục vụ / Đã thu tiền / Đã hủy; xem lại đơn |
| S11 | Tài khoản | Vai trò, việc làm được theo quyền, đăng xuất (xóa phiếu chưa gửi) |
| S12 | Check món (sheet) | Tick / bỏ tick từng món, "Chọn hết", "Lưu (2 món)" |
| S14 | Nhập số kg (sheet) | Món bán theo kg còn "Chờ cân": mỗi món `[ − ] 1 kg [ + ]` (bấm số để gõ, vd 0,98), tiền xem trước; **Lưu số kg (N món)** → món sang "Chờ bếp", tính tiền theo số kg thật (`docs/24`) |
| S13 | Hủy món (sheet) | Chọn món, hủy bao nhiêu phần, lý do (chip điền nhanh); bắt buộc khi bếp đã làm. Món theo kg không có ô chọn số phần (hủy cả dòng) |

**Web:**

| Trang | Quyền | Có gì |
|---|---|---|
| `/admin/weighing` Cân hải sản | Hồ hải sản & nhập hàng (SEAFOOD_TANK): xem trang = Xem, cân lại = Sửa; mục menu chỉ hiện cho người có quyền Sửa | Trang theo dõi + cân lại (phục vụ mới là người nhập số kg, trên app). Thẻ món chờ cân (bàn, khu, phục vụ, giờ gọi, giá / kg), ô nhập kg xem trước thành tiền, "Xác nhận cân"; bảng "Đã cân hôm nay" có nút **Cân lại** |
| `/admin/kitchen` Phiếu bếp | Phiếu bếp (KITCHEN) | Phiếu theo bàn, chờ lâu nhất lên đầu; "Nhận làm" từng món / cả phiếu. Món theo kg chỉ hiện sau khi cân, kèm "Đã cân 1,3 kg" |
| `/admin/cashier` Thanh toán tại bàn | Thu ngân & thanh toán (PAYMENTS) | Bàn đã gửi thanh toán xếp trên + viền cam, bàn đang ăn bên dưới; "In bill", "Đã thu tiền" |
| `/admin/bill/:id/print` | Như trên | Bill khổ 80mm, tự mở hộp thoại in |

Web có chuông + thông báo + số đỏ trên menu khi có món mới chờ cân / gửi bếp / bàn gửi thanh toán (`frontend/src/components/dine-in/useDineInAlerts.js`).

---

## 3. Trạng thái

**Từng món** (`OrderItem.status`):

| Mã | App hiện | Đổi khi |
|---|---|---|
| `WEIGHING` | Chờ cân | Chỉ món bán theo kg: phục vụ gửi bếp / gọi thêm. Chưa tính tiền thật, bếp chưa thấy |
| `PENDING` | Chờ bếp | Phục vụ gửi bếp / gọi thêm (món theo phần); phục vụ nhập số kg sau khi cân tại hồ (món theo kg) |
| `COOKING` | Bếp đang làm | Bếp bấm "Nhận làm"; hoặc phục vụ bỏ tick món đã ra (bấm nhầm) |
| `SERVED` | Đã ra bàn | Phục vụ "Check món" |
| `CANCELLED` | Đã hủy | Phục vụ "Hủy món" / "Hủy cả đơn" |

**Cả đơn** (`Order.status`) backend **tự tính từ các món**, app không tự đổi:

| Mã | App hiện | Khi nào |
|---|---|---|
| `CONFIRMED` | Đã gửi bếp | Còn món "Chờ bếp" hoặc "Chờ cân" |
| `PREPARING` | Đang chế biến | Không còn món chờ, còn món bếp đang làm |
| `DELIVERING` | Đã lên đủ món | Mọi món còn lại đã ra bàn |
| `COMPLETED` | Đã thu tiền | Thu ngân "Đã thu tiền" (kèm Đã thanh toán) |
| `CANCELLED` | Đã hủy | Hủy hết món, hoặc "Hủy cả đơn" |

`Order.billRequestedAt` khác rỗng = phục vụ đã gửi thanh toán (S03 ô bàn màu cam "Chờ thu tiền").

---

## 4. Quy tắc

| Chủ đề | Quy tắc |
|---|---|
| 1 bàn 1 đơn mở | Đơn chưa thu tiền của bàn nhận mọi lần gọi thêm. Thu tiền / hủy xong thì bàn trống, lần sau là đơn mới |
| Giá | Lấy từ DB lúc gửi bếp (giá khuyến mãi nếu có), không tin app. Không phí giao, không mã giảm giá |
| Gửi bếp | Món trùng trong 1 lần gửi gộp số lượng, nối ghi chú bằng "; ", giữ thứ tự bấm. Lần gửi sau là dòng mới (S04 gom theo giờ gửi) |
| Cất order | Phiếu chưa gửi bếp được cất theo **từng bàn**, nhiều bàn cùng lúc, giữ ghi chú và số kg. Lưu **trên điện thoại đó** (chưa gửi lên server: máy khác, bếp, thu ngân không thấy), đăng xuất thì xóa. Bấm "Order" / "Ghi món" / "Mở order" ở bàn có order đã cất thì món đã cất hiện lại. Đang ghi dở bàn A mà sang bàn B bấm "Order" thì phiếu bàn A **tự cất** (không mất, không gửi nhầm bàn) |
| Hủy order | Chỉ xóa phiếu **chưa gửi bếp** (và order đã cất) của bàn đó; món đã gửi bếp giữ nguyên (hủy món đã gửi: S04 "Hủy món"; hủy cả đơn: menu ⋮) |
| Hủy món | "Chờ bếp" hủy luôn; "Bếp đang làm" / "Đã ra bàn" bắt buộc lý do. Hủy bớt phần: tách phần hủy thành dòng riêng. Tiền đơn và số lượng đã bán trừ ngay |
| Hủy hết món | Đơn tự "Đã hủy", bàn trống |
| Check món | Chỉ món của cùng 1 bàn, món đã hủy không check được. Bỏ tick: về "Bếp đang làm" |
| Nhập số kg | Phục vụ nhập tại hồ (quyền ORDERS Sửa) hoặc hồ hải sản / quản lý nhập lại trên web (SEAFOOD_TANK Sửa). Sửa lại được khi bếp **chưa** "Nhận làm"; sửa làm đổi tiền thì yêu cầu thanh toán cũ bị rút |
| Gửi thanh toán | Bàn phải còn món. Gọi thêm sau khi gửi → tự rút yêu cầu (bill cũ không còn đúng) |
| Thu tiền | Chỉ thu ngân (quyền Thanh toán). Phục vụ gọi API thu tiền → 403 |
| Phiếu gọi món | Lưu trên máy, gắn với 1 bàn; mở bàn khác khi phiếu còn món thì phiếu bàn cũ **tự cất** (xem "Cất order"), không hỏi bỏ phiếu nữa; đăng xuất thì xóa |
| Ai dùng app | Tài khoản STAFF / ADMIN có quyền **Xem** "Đơn hàng & gọi món". Khách, tạp vụ, kỹ thuật bị chặn ở màn đăng nhập |
| Món bán theo kg | App mặc định 1 kg, phục vụ sửa được (0,05 đến 30 kg); gửi bếp kèm số kg, món ở "Chờ cân", **cộng tiền tạm** theo số kg đó. Hồ hải sản cân thật: ô số kg điền sẵn số phục vụ ghi, xác nhận hoặc sửa (0,05 đến 30 kg) → tiền dòng = giá 1 kg × số kg (làm tròn đồng), món sang "Chờ bếp". Cân lại được khi bếp chưa "Nhận làm". Chỉ hủy cả dòng; chờ cân hủy không cần lý do; chưa cân thì không "Check món" được |
| Còn món chờ cân | Không gửi thanh toán, không thu tiền được (báo tên món chưa cân) |

## 5. Phân quyền (mặc định, admin sửa được ở ma trận)

| Vai trò | Đơn hàng & gọi món | Trong app | Web |
|---|---|---|---|
| Phục vụ, Tổ trưởng | Xem, Thêm, Sửa | Ghi món, gửi bếp, check / hủy món, gửi thanh toán | |
| Quản lý, Chủ, Admin | Toàn quyền | Như trên | Mọi trang |
| Tiếp thực | Xem, Sửa | Check / hủy món, gửi thanh toán (không ghi món) | |
| Thu ngân | Xem, Sửa | Như tiếp thực | Thanh toán tại bàn, in bill, thu tiền |
| Bếp | Xem | Chỉ xem | Phiếu bếp, Nhận làm, Cân hải sản |
| Hồ hải sản | Xem | Chỉ xem | Cân hải sản (quyền Sửa "Hồ hải sản & nhập hàng") |
| Lễ tân | Xem | Chỉ xem | |

App ẩn nút theo quyền (`User.canTakeOrder` = Thêm, `canUpdateOrder` = Sửa); backend vẫn kiểm tra lại.

## 6. Dữ liệu

- `Order`: thêm loại `DINE_IN` (ăn tại quán), `tableId` (bàn), `staffId` (người mở đơn), `billRequestedAt` (gửi thanh toán lúc), `billPrintedAt` (in bill lúc). Khách tại bàn: `customerName = "Khách bàn B05"`, `phone = ""`.
- `OrderItem`: thêm `status`, `createdAt` (giờ gửi bếp), `servedAt`, `cancelReason`, `cancelledAt`; món bán theo kg thêm `weight` (số kg), `weighedAt` (lúc cân), trạng thái `WEIGHING`. Món theo kg có `price` = giá 1 kg.
- Migration: `20261120142816_them_don_an_tai_quan`, `20261120152428_them_trang_thai_mon_thanh_toan_tai_ban`, `20261122011700_can_hai_san_theo_kg`.

## 7. API

Chi tiết tham số: [06-api-reference.md](06-api-reference.md) mục "Ăn tại quán". Các API phục vụ trả về `{ table, order }` (order = null khi bàn trống).

| API | Ai | Việc |
|---|---|---|
| `GET /dine-in/tables` | Phục vụ | Sơ đồ: khu, bàn (x, y), đơn mở (tiền, số món, số món chưa ra, đã gửi thanh toán chưa) |
| `GET /dine-in/tables/:id` | Phục vụ | 1 bàn + đơn mở (cả món đã hủy) |
| `POST /dine-in/orders` | Phục vụ (Thêm) | Gửi bếp / gọi thêm |
| `POST /dine-in/items/serve` | Phục vụ (Sửa) | Check món / bỏ tick |
| `POST /dine-in/items/:id/cancel` | Phục vụ (Sửa) | Hủy món (cả dòng / bớt phần) |
| `POST`, `DELETE /dine-in/orders/:id/bill-request` | Phục vụ (Sửa) | Gửi / rút thanh toán |
| `PATCH /orders/:id/status` `CANCELLED` + `reason` | Phục vụ (Sửa) | Hủy cả đơn |
| `GET /dine-in/orders` | Phục vụ | Đơn tại bàn hôm nay |
| `GET /dine-in/kitchen`, `POST /dine-in/kitchen/start` | Bếp | Phiếu bếp, Nhận làm |
| `GET /dine-in/bills`, `GET /dine-in/bills/:id`, `POST .../printed`, `POST .../pay` | Thu ngân | Danh sách bàn, bill, đã in, đã thu tiền |
| `GET /dine-in/weighing`, `POST /dine-in/items/:id/weigh` | Hồ hải sản | Món chờ cân + đã cân hôm nay; nhập số kg (cân / cân lại) |

## 8. Đã kiểm tra (21/11/2026, cập nhật 22/11)

- **22/11:** sau khi thêm món bán theo kg, menu trái, Cất / Hủy order: `flutter test` **83 test** qua ([19](19-app-mobile.md) mục 6), script API cân hải sản 13/13 và phục vụ ghi số kg 14/14 bước.

- **App:** `flutter analyze` sạch; `flutter test` **63/63** (server giả: đăng nhập, chọn khu, đơn của bàn, check món, hủy món có / không lý do, hủy bớt phần, gửi / rút thanh toán, hủy cả đơn, nút theo quyền, phiếu gọi món, gửi bếp, đơn hôm nay, tài khoản); `test/live_api_test.dart` với backend thật **2/2**; `flutter build apk --debug` thành công.
- **Backend:** script gọi API thật **28/28 bước**: quyền (khách, bếp, phục vụ thu tiền = 403), gửi bếp, bếp nhận làm, hủy món chờ bếp / bếp đang làm (thiếu lý do = 400) / hủy bớt, check món / bỏ tick / check món đã hủy = 400, gửi thanh toán, gọi thêm tự rút yêu cầu, rút lại, thu ngân xem bill / in / thu tiền, bàn trống lại, hủy hết món, hủy cả đơn. Dữ liệu thử đã xóa, số lượng đã bán trả lại như cũ.
- **Web:** `npx oxlint src` không lỗi, `npx vite build` thành công.
- Bố cục app đã chụp kiểm tra ở khổ 360 × 800 (không tràn chữ).
- **22/11/2026, món bán theo kg** ([24](24-thuc-don-ban-theo-kg.md)): script API **13/13 bước** (gửi bếp món kg, chặn gửi thanh toán, phiếu bếp chưa có món chờ cân, quyền 403, cân, số kg sai, cân lại, gửi thanh toán, chặn đặt online); app **72 test** qua; web lint + build không lỗi.
- **22/11/2026, phục vụ ghi số kg trên app** (mặc định 1 phần / 1 kg, sửa được, vd 0,98 kg): script API **14/14 bước** (gửi 0,98 kg / không gửi số kg = 1 kg / món theo phần bỏ qua số kg, tiền tạm, 0,01 và 31 kg báo 400, chặn gửi thanh toán, trang Cân hải sản thấy số kg ghi, cân xác nhận + cân sửa đổi tiền đúng, gửi thanh toán; đơn thử đã xóa); app **78 test** qua (thêm test gõ số kg ở S08, S04 món chờ cân có số kg, phiếu cộng số kg); web lint + build không lỗi.

## 9. Giới hạn, hướng phát triển (ghi vào báo cáo)

- Báo món mới / bàn gửi thanh toán bằng **tự tải lại** (10–15 giây), chưa có thông báo đẩy (Firebase Cloud Messaging / WebSocket).
- Thu ngân chưa nhận mã giảm giá / VNPay cho đơn tại bàn (chỉ tiền mặt / chuyển khoản tự kiểm).
- Chưa tách / gộp bàn, chuyển đơn sang bàn khác.
- Khách không theo dõi được món của bàn trên điện thoại của mình (có thể làm thêm: QR trên bàn mở trang web xem đơn).
