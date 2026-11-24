# 27. Tồn hồ hải sản: nhập bao nhiêu, bán bao nhiêu, còn lại bao nhiêu

Từ 23/11/2026. Hồ nhà hàng nuôi hải sản sống bán theo kg. Trước đây hệ thống **không biết trong hồ còn gì**: chỉ có cờ bật / tắt món. Giờ mỗi loại hải sản có **tồn kho tính theo kg**, mỗi lần tồn đổi là **1 dòng sổ** nên luôn giải thích được tồn hiện tại từ đâu ra.

| Ai | Dùng gì | Làm gì |
|---|---|---|
| Hồ hải sản (cả bếp, quản lý) | Web `/admin/tank` **Tồn hồ hải sản** | **Nhập hàng** (xe hàng về, kèm giá nhập), **Kiểm hồ** (cân / đếm thực tế, hệ thống ghi phần lệch), **Hao hụt** (hải sản chết, bắt buộc lý do); xem sổ nhập - xuất |
| Phục vụ | App (S05 thẻ món, S06 chi tiết món) | Thấy "Hồ còn 3,2 kg" / "Hồ gần hết" / "Hồ hết hàng" để tư vấn khách. Cân tại hồ và nhập số kg → hệ thống **tự trừ hồ** ([docs/23](23-app-nhan-vien-phuc-vu.md), [docs/24](24-thuc-don-ban-theo-kg.md)) |
| Quản lý | Web `/admin/tank` | Xem hôm nay nhập / bán / hao hụt bao nhiêu, ai ghi phiếu nào, giá nhập để đối chiếu tiền hàng |
| Phục vụ, tổ trưởng | Web `/admin/tank` (chỉ xem) | Xem còn hàng không, không ghi phiếu được |

Code: backend [modules/tank/](../backend/src/modules/tank/), danh sách loại [config/tank.js](../backend/src/config/tank.js); web [admin/dine-in/Tank.jsx](../frontend/src/pages/admin/dine-in/Tank.jsx); app [models/dish.dart](../mobile/lib/models/dish.dart) + [widgets/dish_card.dart](../mobile/lib/widgets/dish_card.dart).

---

## 1. Vì sao tính tồn theo "loại hải sản", không theo món

Thực đơn có **28 món bán theo kg** nhưng hồ chỉ có **6 loại hàng**: "Tôm hùm nướng phô mai", "Tôm hùm sốt bơ tỏi", "Tôm hùm sashimi"... đều bắt **cùng một con tôm hùm** trong hồ. Nếu tính tồn theo từng món thì 1 con tôm hùm sẽ bị đếm 5 lần.

Cũng không dùng **danh mục món** (`Category`) làm tồn kho được: nhóm "Cua" trên thực đơn gồm **cua gạch** (990.000đ/kg) và **cua thịt** (790.000đ/kg) — cùng nhóm nhưng là **2 loại hàng khác nhau** trong hồ, giá nhập khác nhau.

Vì vậy có bảng riêng `TankItem`:

| Loại trong hồ | Nhóm món | Số món | Ngưỡng "gần hết" |
|---|---|---|---|
| Tôm hùm | Tôm hùm | 5 | 3 kg |
| Tôm sú | Tôm sú | 8 | 5 kg |
| Cua gạch | Cua (tên món có "cua gạch") | 2 | 3 kg |
| Cua thịt | Cua (tên món có "cua thịt") | 3 | 3 kg |
| Cá mú | Cá mú | 5 | 5 kg |
| Tôm tít | Tôm tít | 5 | 3 kg |

Cách gắn món vào loại nằm ở [config/tank.js](../backend/src/config/tank.js) (`tankItemNameForDish`): theo **nhóm món** + **từ khóa trong tên món**. Thêm nhóm hải sản sống mới thì khai báo thêm 1 dòng trong file đó rồi chạy `npm --prefix backend run db:seed-tank`.

---

## 2. Năm loại phiếu

```
                                 TỒN HỒ (stockKg)
 Nhập hàng    IMPORT  +kg  ───────────►  ◄─── xe hàng về, có giá nhập + nhà cung cấp
 Bán          SALE    −kg  ◄───────────  TỰ ĐỘNG: phục vụ nhập số kg ở app (S14)
 Trả lại hồ   RETURN  +kg  ───────────►  TỰ ĐỘNG: hủy món đã cân khi BẾP CHƯA nhận làm,
                                          hoặc cân lại số nhỏ hơn (1 → 0,98 kg)
 Kiểm hồ      AUDIT   ±kg  ◄──────────►  hồ hải sản cân / đếm thật, ghi phần lệch
 Hao hụt      LOSS    −kg  ◄───────────  hải sản chết, thất thoát (bắt buộc lý do)
```

**Quy tắc:**

| Chủ đề | Quy tắc |
|---|---|
| Luôn có sổ | Không bao giờ sửa `stockKg` mà không ghi `TankEntry`. Mỗi dòng lưu `stockAfter` (tồn sau dòng đó) để xem lại lịch sử không phải tính lại |
| Trừ hồ lúc nào | **Lúc nhập số kg thật** (phục vụ cân tại hồ), không phải lúc gửi bếp. Gửi bếp chỉ tạo món "Chờ cân", chưa biết nặng bao nhiêu nên chưa trừ |
| Cân lại | Chỉ ghi **phần chênh lệch**: sửa 1,25 → 1,2 kg thì trả lại hồ 0,05 kg (phiếu RETURN), sửa lên thì trừ thêm (phiếu SALE) |
| Hủy món | Món đã cân mà **bếp chưa "Nhận làm"** (`PENDING`): con hải sản còn sống → **trả lại hồ**. Bếp đã làm (`COOKING` / `SERVED`): hàng đã mất, **không** trả lại |
| Hủy cả đơn | Cũng trả lại hồ các món đã cân mà bếp chưa nhận làm ([orders.service.js](../backend/src/modules/orders/orders.service.js) `changeStatus`) |
| Tồn âm | Không có: kẹp ở 0 kg (đếm lệch, bán lúc tồn đang 0), nhưng dòng sổ vẫn ghi đúng số kg thật để quản lý thấy sai ở đâu |
| Kiểm hồ khớp số | Nhập đúng y số máy đang ghi thì **không tạo phiếu** (`{ skipped: true }`), để sổ không bị rác |
| Hết hàng | **Không chặn** phục vụ ghi món, chỉ hiện nhãn đỏ "Hồ hết hàng". Lý do: khách đang đứng ở hồ có thể chỉ con thật mà máy chưa kịp cập nhật; chặn cứng sẽ làm phục vụ không ghi được món. Muốn chặn hẳn thì hồ hải sản / bếp **tắt món** ở trang Món ăn như trước |
| Số kg | Làm tròn tới **gam** (3 số lẻ). Nhập hàng 0,01 – 500 kg; kiểm hồ 0 – 500 kg |

---

## 3. Trang web `/admin/tank`

Mỗi loại là 1 thẻ: **tồn còn bao nhiêu kg** (số lớn), nhãn Còn hàng / Gần hết / Hết hàng, rồi 3 số **Nhập hôm nay · Bán hôm nay · Hao hụt**, số món trên thực đơn, ghi chú. Đầu trang có khung vàng "Cần nhập hàng: Tôm hùm (còn 2 kg), ..." khi có loại dưới ngưỡng.

Ba nút trên mỗi thẻ mở hộp thoại:

| Nút | Hộp thoại | Ghi chú |
|---|---|---|
| **Nhập hàng** | Số kg (gõ "12" hay "12,5" đều được), giá nhập 1 kg (không bắt buộc, hiện luôn tiền hàng), nhà cung cấp, ghi chú | Hiện trước "tồn sẽ thành bao nhiêu" |
| **Kiểm hồ** | Số kg đếm được (0 = hồ hết loại này), ghi chú | Hiện ngay "Thừa 0,3 kg so với sổ" / "Thiếu ..." / "Khớp với sổ" |
| **Hao hụt** | Số kg, **lý do bắt buộc** | Nút đỏ |

Dưới cùng là **Sổ nhập - xuất hồ**: 30 dòng mới nhất, lọc theo loại phiếu / theo ngày; mỗi dòng có giờ, loại hải sản, nhãn loại phiếu, số kg (+ xanh / − đỏ), tồn còn lại, ghi chú (phiếu bán ghi kèm **bàn + mã đơn**), **người ghi**.

Tự tải lại 30 giây (phục vụ cân ở hồ làm tồn đổi liên tục).

**Quyền** (chức năng `SEAFOOD_TANK` "Hồ hải sản & nhập hàng"):

| Quyền | Làm được | Mặc định ai có |
|---|---|---|
| Xem | Vào trang, xem sổ | Chủ, Admin, Quản lý, Tổ trưởng, **Phục vụ**, Bếp, Hồ hải sản |
| Sửa | Nhập hàng, kiểm hồ, hao hụt | Chủ, Admin, Quản lý, Bếp, Hồ hải sản |
| Thêm | Thêm loại hải sản mới | Chủ, Admin, Hồ hải sản |
| Xóa | Tắt / bật loại (giữ lịch sử) | Chủ, Admin, Hồ hải sản |

Mục menu **Tồn hồ hải sản** (nhóm "Tại quán") hiện cho mọi người có quyền Xem — phục vụ và tổ trưởng vào xem còn hàng không, không ghi phiếu được.

---

## 4. Trên app phục vụ

Món bán theo kg hiện thêm 1 dòng tồn hồ, **chỉ để tư vấn khách**:

| Chỗ | Hiện gì |
|---|---|
| S05 thẻ món | Dòng nhỏ dưới tên món: 🐟 "Hồ còn 3,2 kg" (xanh) / "Hồ gần hết · 1,5 kg" (vàng) / "Hồ hết hàng" (đỏ) |
| S06 chi tiết món | Khung màu: "Hồ còn 3,2 kg (Tôm hùm)" + gợi ý "Dẫn khách ra hồ chọn con rồi cân"; gần hết: "Còn ít, nên xem hồ rồi mới nhận order lớn"; hết: "Hỏi hồ hải sản trước khi hứa với khách" |

Món theo phần (hàu, sò, cơm, rau...) và món chưa gắn loại hồ nào thì **không hiện gì**.

---

## 5. Database

| Bảng / cột | Ý nghĩa |
|---|---|
| `TankItem` | Loại hải sản trong hồ: `name`, `slug`, `stockKg` (tồn), `lowStockKg` (ngưỡng gần hết), `isActive`, `note`, `sortOrder` |
| `TankEntry` | 1 dòng sổ: `type` (5 loại), `deltaKg` (+/−), `stockAfter`, `unitCost` + `supplier` (phiếu nhập), `note`, `userId` (ai ghi), `orderId` + `orderItemId` (phiếu bán / trả lại) |
| `Dish.tankItemId` | Món bán theo kg trỏ về loại hải sản nó bắt từ hồ (`null` = món theo phần) |
| enum `TankEntryType` | `IMPORT`, `SALE`, `RETURN`, `AUDIT`, `LOSS` |

Migration: `backend/prisma/migrations/20261123155803_ton_ho_hai_san/`. Chỉ **thêm** bảng và cột, không xóa dữ liệu cũ.

---

## 6. API `/api/v1/tank`

| Method | Đường dẫn | Quyền | Việc |
|---|---|---|---|
| GET | `/tank?all=1` | 🛡️ `SEAFOOD_TANK` Xem | Danh sách loại + `stockKg`, `lowStockKg`, `isLow`, `isEmpty`, `dishCount`, `today: { imported, sold, returned, lost, audited }`. `all=1` kèm loại đã tắt |
| GET | `/tank/entries?tankItemId=&type=&date=&page=&limit=` | 🛡️ Xem | Sổ nhập - xuất, mới nhất trước; `date` dạng `yyyy-MM-dd` (giờ VN); kèm `user`, `order.table`, phân trang `meta` |
| POST | `/tank/:id/import` | 🛡️ Sửa | `{ kg, unitCost?, supplier?, note? }`. 0 kg hoặc > 500 kg = 400 |
| POST | `/tank/:id/audit` | 🛡️ Sửa | `{ actualKg, note? }` → `{ skipped, stockKg, diff }` |
| POST | `/tank/:id/loss` | 🛡️ Sửa | `{ kg, note }`, thiếu `note` = 400 |
| POST | `/tank` | 🛡️ Thêm | `{ name, lowStockKg?, note? }`, trùng tên = 400 |
| PATCH | `/tank/:id` | 🛡️ Sửa | `{ name?, lowStockKg?, note? }` (không sửa tồn ở đây) |
| PATCH | `/tank/:id/active` | 🛡️ Xóa | `{ isActive }` tắt / bật loại |

Thay đổi API cũ: `GET /dishes` và `GET /dishes/:idOrSlug` thêm `tankItem { id, name, stockKg, lowStockKg, isActive }` cho món bán theo kg; `POST /dine-in/items/:id/weigh` và `POST /dine-in/items/:id/cancel` giờ tự ghi sổ hồ.

---

## 7. Lệnh

```bash
npm --prefix backend run db:seed-tank    # tạo 6 loại + gắn 28 món bán theo kg (không xóa tồn đang có)
```

`npm run setup` và `npm --prefix backend run db:seed-menu` cũng tự làm việc này (bước 4 của `applyMenu`).

---

## 8. Thử bằng tay

1. `npm run dev`, đăng nhập web bằng `hohaisan@fab.vn` / `123456` → menu **Tồn hồ hải sản**: 6 loại, tồn 0 kg, khung vàng "Cần nhập hàng".
2. Thẻ Tôm hùm → **Nhập hàng** 10 kg, giá nhập 1.200.000 → tồn 10 kg, nhãn "Còn hàng", sổ có dòng `Nhập hàng +10 kg`.
3. App (`phucvu@fab.vn`): mở thực đơn, thẻ món tôm hùm hiện "Hồ còn 10 kg". Gọi 1 tôm hùm, gửi bếp → tồn **chưa đổi** (món còn "Chờ cân"). Bấm **Nhập số kg** 1,25 → web thấy tồn 8,75 kg, sổ có `Bán −1,25 kg` kèm bàn + mã đơn + tên phục vụ.
4. App: **Hủy món** đó khi bếp chưa nhận làm → tồn về 10 kg, sổ có `Trả lại hồ +1,25 kg`.
5. Web: **Hao hụt** 0,8 kg ghi "1 con tôm hùm chết" → tồn 9,2 kg. **Kiểm hồ** nhập 8,9 → sổ có `Kiểm hồ −0,3 kg`.
6. Đăng nhập `letan@fab.vn`: không thấy menu Tồn hồ (không có quyền). `bep@fab.vn`: vào được, nhập hàng được, nhưng không thêm / tắt loại.

## 9. Đã kiểm tra

| Cách | Kết quả |
|---|---|
| Script API qua backend thật: quyền (401 / 403 lễ tân / bếp không thêm - không tắt), nhập hàng + chặn 0 kg và 999 kg, gửi bếp chưa trừ, cân xong trừ đúng, cân lại chỉ ghi chênh lệch, hủy món trả lại hồ, hao hụt bắt buộc lý do, kiểm hồ khớp số không tạo phiếu, sổ đủ 5 loại phiếu kèm người ghi + đơn + bàn, lọc theo loại | 32/34 (2 dòng còn lại là script viết sai kỳ vọng: phục vụ **có** quyền xem tồn hồ, và gửi bếp trả mã 201). Dữ liệu thử đã xóa |
| `flutter analyze`, `flutter test` | No issues · 85 test qua |
| `npx oxlint src`, `npx vite build` | Không warning mới · build OK |
