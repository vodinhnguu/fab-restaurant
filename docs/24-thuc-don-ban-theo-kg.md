# 24. Thực đơn hải sản, bán theo kg, cân tại hồ, Best seller

Từ 22/11/2026 thực đơn FAB Seafood chỉ còn **món hải sản và món ăn kèm** (cơm, rau, cháo, nước đóng chai). Hải sản sống ở hồ (tôm hùm, tôm sú, cua, cá mú, tôm tít) **bán theo kg**: khách chọn con, nhân viên hồ hải sản cân, tiền = giá 1 kg × số kg thực tế. Trang chủ web làm nổi bật các món **Best seller**.

| Ai | Làm gì | Ở đâu |
|---|---|---|
| Khách (web) | Xem Best seller ở trang chủ, lọc "Best seller" ở Thực đơn. Món theo kg chỉ xem giá / kg, bấm **Đặt bàn** (không đặt giao hàng được) | `/`, `/menu`, `/menu/:slug` |
| Phục vụ (app) | Gọi món: **mặc định 1 phần / 1 kg**, sửa được (bấm −/+ hoặc bấm vào số để gõ, vd 1 kg → 0,98 kg). Món theo kg tính **tiền tạm** theo số kg ghi, vào trạng thái **Chờ cân** | S05 → S06 / S08 → S04 |
| Hồ hải sản (web) | Trang **Cân hải sản**: ô số kg **điền sẵn số phục vụ ghi**, cân đúng thì xác nhận, khác thì sửa; món sang "Chờ bếp" | `/admin/weighing` |
| Bếp (web) | Chỉ thấy món theo kg **sau khi đã cân**, kèm số kg | `/admin/kitchen` |
| Thu ngân (web) | Bill in "1,25 kg x 1.890.000/kg". Còn món chưa cân thì chưa thu tiền được | `/admin/cashier` |

---

## 1. Thực đơn (12 nhóm, 70 món)

Danh sách nằm ở [backend/prisma/menu.js](../backend/prisma/menu.js) (`MENU_CATEGORIES`, `MENU_DISHES`). Thứ tự nhóm = thứ tự hiện trên web / app (hải sản theo kg lên đầu).

| Nhóm | Bán theo | Số món | Giá | Ví dụ |
|---|---|---|---|---|
| Tôm hùm | **kg** | 5 | 1.890.000 – 2.090.000đ / kg | nướng phô mai, sốt bơ tỏi, sốt tiêu đen, sốt chua ngọt, sashimi |
| Tôm sú | **kg** | 8 | 690.000 – 750.000đ / kg | sốt bơ tỏi, chua ngọt, tiêu đen, cháy tỏi, trứng muối, rang muối, sashimi, hấp bia |
| Cua | **kg** | 5 | 790.000 – 990.000đ / kg | cua gạch hấp bia, cua gạch rang me, cua thịt hấp bia / rang muối / sốt ớt Singapore |
| Cá mú | **kg** | 5 | 690.000 – 790.000đ / kg | hấp Hồng Kông, nướng muối ớt, sashimi, chiên giòn sốt mắm, lẩu chua cay |
| Tôm tít | **kg** | 5 | 560.000 – 590.000đ / kg | cháy tỏi, sốt bơ tỏi, rang muối, hấp sả, rang me |
| Hàu | phần (6 con) | 5 | 109.000 – 139.000đ | tái chanh, nướng mỡ hành, nướng phô mai, nướng bơ tỏi, sống mù tạt |
| Sò điệp | phần (5 con) | 4 | 129.000 – 149.000đ | nướng mỡ hành, nướng phô mai, nướng bơ tỏi, hấp gừng sả |
| Nghêu | phần | 5 | 79.000 – 89.000đ | xào sả ớt, hấp sả, hấp Thái, xào bơ tỏi, nướng mỡ hành |
| Cháo | phần | 6 | 69.000 – 89.000đ | hải sản, hàu, nghêu, chíp chíp, cua, tôm |
| Cơm | phần | 6 | 45.000 – 89.000đ | chiên hải sản, chiên dưa bò, chiên tỏi, chiên trứng, chiên cá mặn, Dương Châu |
| Rau | phần | 6 | 39.000 – 69.000đ | rau muống, rau rừng, cải thìa, mồng tơi, bông bí xào tỏi; đậu bắp luộc |
| Nước uống | lon / chai | 10 | 15.000 – 32.000đ | Coca-Cola, 7 Up, Fanta, Sprite, Trà xanh Không Độ, Aquafina, bia Larue, Tiger, Heineken, Sài Gòn Special |

**Best seller** (8 món, cột `isFeatured`): Tôm hùm nướng phô mai, Tôm sú sốt trứng muối, Cua gạch hấp bia, Cá mú hấp Hồng Kông, Tôm tít cháy tỏi, Hàu nướng mỡ hành, Sò điệp nướng phô mai, Cơm chiên hải sản. Admin bật / tắt ở trang **Món ăn** (ô "Best seller").

Món **bán theo kg** = món có đơn vị (`unit`) là `kg`. Đổi món sang bán theo kg: admin sửa ô "Đơn vị" thành `kg`, không cần sửa code.

Ảnh: ảnh miễn phí trên Unsplash, tìm và xem tận mắt ngày 22/11: **70/70 món có ảnh, mỗi món 1 ảnh riêng**, riêng 5 món tôm tít dùng chung ảnh tôm tít sống (Unsplash không có ảnh tôm tít đã nấu). Vài món Việt chỉ có ảnh gần đúng (cháo hàu, cháo chíp chíp, mồng tơi, bông bí, bia Larue / Sài Gòn không đúng nhãn). Có ảnh thật thì admin tải lên ở trang Món ăn; chạy lại `db:seed-menu` **không ghi đè** ảnh tự tải lên (ảnh `/uploads/...`).

### Đổi database đang dùng sang thực đơn này

```bash
npm --prefix backend run db:seed-menu
```

**Không xóa đơn hàng, đánh giá.** Chạy lại nhiều lần được (lần sau chỉ cập nhật).

| Món | Lệnh làm gì |
|---|---|
| Có trong `menu.js` (trùng slug) | Cập nhật tên, giá, đơn vị, ảnh, mô tả, bật bán lại; chưa có thì tạo |
| Món cũ chưa từng bán, chưa có đánh giá | **Xóa** |
| Món cũ đã nằm trong đơn / có đánh giá | Ẩn (ngừng bán), gom vào nhóm **"Ngừng bán (thực đơn cũ)"**, để xem lại đơn cũ vẫn đúng tên món |
| Danh mục cũ không còn món | Xóa |

Database mới (`npm run setup`) có sẵn thực đơn này (`seed.js` gọi `applyMenu()`). Đơn mẫu online trong `seed.js` chỉ chọn món bán theo phần.

API `GET /categories` chỉ đếm **món đang bán** (`_count.dishes`): web và app ẩn nhóm 0 món (nhóm "Ngừng bán" không hiện cho khách).

---

## 2. Web khách

| Chỗ | Thay đổi | File |
|---|---|---|
| Trang chủ | Khối **Best seller** nền xanh đậm ngay dưới ảnh bìa (8 món nổi bật, bán chạy trước), nút "Xem tất cả" → `/menu?best=1` | [Home.jsx](../frontend/src/pages/Home.jsx) |
| Thực đơn | Chip **Best seller** cạnh "Tất cả" (lọc `?best=1` → API `featured=true`); ẩn danh mục 0 món | [Menu.jsx](../frontend/src/pages/Menu.jsx) |
| Thẻ món | Nhãn cam **Best seller**; món theo kg: giá "/kg" + nhãn **Cân tại hồ** thay nút "+" | [DishCard.jsx](../frontend/src/components/DishCard.jsx) |
| Chi tiết món | Món theo kg: khung "Hải sản sống, bán theo kg" + nút **Đặt bàn để thưởng thức** thay cho "Thêm vào giỏ" | [DishDetail.jsx](../frontend/src/pages/DishDetail.jsx) |
| Giỏ hàng | `add()` bỏ qua món theo kg | [stores/cart.js](../frontend/src/stores/cart.js) |
| Backend | Đặt online có món theo kg → lỗi 400 *"Món "…" bán theo kg, cần chọn và cân tại hồ. Vui lòng đặt bàn để thưởng thức tại quán"* | [orders.service.js](../backend/src/modules/orders/orders.service.js) |

Hàm kiểm tra dùng chung: `isSoldByWeight(dish)` (đơn vị = `kg`) ở [backend/src/utils/helpers.js](../backend/src/utils/helpers.js) và [frontend/src/lib/constants.js](../frontend/src/lib/constants.js); app mobile: `CartItem.soldByWeight`.

---

## 3. Cân tại hồ (ăn tại quán)

```
 PHỤC VỤ (app)                    HỒ HẢI SẢN (web)                    BẾP (web)          THU NGÂN (web)
 Gọi "Tôm hùm nướng phô mai"
 mặc định 1 kg (khách muốn con
 to hơn thì sửa, vd 1,3 kg)
 → Gửi bếp ─────────────────────► món "Chờ cân" (chuông, số đỏ),
   tiền TẠM 1 kg = 1.890.000đ       ô số kg điền sẵn "1"
   (bếp chưa thấy)                  bắt con khách chọn, cân ra 0,98 kg
                                    sửa 1 → 0,98, "Xác nhận cân"
                                    tiền = 1.890.000 × 0,98 ─────────► món "Chờ bếp"
                                    = 1.852.200đ (đơn trừ 37.800đ)     "Nhận làm" ...
 S04 thấy "Đã cân 0,98 kg"
 "Gửi thanh toán" ───────────────────────────────────────────────────────────────────► bill:
                                                                                         0,98 kg x 1.890.000/kg
```

Trạng thái món (`OrderItemStatus`): **`WEIGHING` Chờ cân** → `PENDING` Chờ bếp → `COOKING` Bếp đang làm → `SERVED` Đã ra bàn | `CANCELLED`. Chỉ món theo kg đi qua `WEIGHING`.

### Quy tắc

| # | Quy tắc | Kiểm ở |
|---|---|---|
| 1 | Món theo kg: app gửi kèm **số kg phục vụ ghi** (`weight`, mặc định 1 kg, 0,05 – 30 kg; không gửi thì coi mỗi phần = 1 kg). Mỗi món 1 dòng (`quantity` = 1), gửi 2 lần cùng món trong 1 phiếu thì cộng số kg. Gửi bếp xong ở "Chờ cân", **cộng tiền tạm** theo số kg đó, phiếu bếp chưa có | `addItemsSchema`, `addItems` |
| 2 | Cân: 0,05 – 30 kg, làm tròn tới gam. Tiền dòng = `Math.round(giá 1 kg × số kg)` | `weighItemSchema`, `lineTotal` |
| 3 | Cân thật (lần đầu): tiền đơn đổi theo **chênh lệch với tiền tạm** (ghi 1 kg, cân 0,98 kg thì đơn trừ tiền 0,02 kg). **Cân lại** (nhập nhầm) được khi bếp chưa "Nhận làm": tiền đơn đổi theo chênh lệch, yêu cầu thanh toán cũ (nếu có) bị rút | `weighItem` |
| 4 | Còn món chờ cân thì **không gửi thanh toán** và **không thu tiền** được (báo tên món) | `requestBill`, `pay` |
| 5 | Món theo kg chỉ **hủy cả dòng** (số kg cân chung). Chờ cân / chờ bếp hủy không cần lý do | `cancelItem` |
| 6 | Món chờ cân không "Check món" được (chưa nấu) | `serveItems` |
| 7 | Quyền: xem trang = **Xem** "Hồ hải sản & nhập hàng" (`SEAFOOD_TANK`); cân = **Sửa**. Mặc định Sửa được: Chủ, Admin, Quản lý, Bếp, Hồ hải sản. Menu "Cân hải sản" chỉ hiện cho người cân được | `dine-in.routes.js`, `adminMenu.js` |

### API

| Method | Đường dẫn | Quyền | Làm gì |
|---|---|---|---|
| GET | `/dine-in/weighing` | SEAFOOD_TANK xem | `{ waiting: [món chờ cân, gọi sớm trước], weighed: [món đã cân hôm nay, 30 món mới nhất] }`, mỗi món kèm `order.table`, `order.staff` |
| POST | `/dine-in/items/:id/weigh` | SEAFOOD_TANK sửa | Body `{ "weight": 1.25 }`. Trả món vừa cân, `message` "Đã cân Tôm hùm nướng phô mai: 1,25 kg" |

Thay đổi API cũ: `POST /dine-in/orders` mỗi món nhận thêm `weight` (số kg, chỉ dùng cho món theo kg), vd `{ "dishId": 9, "quantity": 1, "weight": 0.98 }`; `GET /dine-in/tables` thêm `order.weighingCount` (số phần chờ cân); các API trả món có thêm `weight`, `weighedAt`; `POST /dine-in/orders/:id/bill-request` và `POST /dine-in/bills/:id/pay` báo 400 khi còn món chờ cân.

### Database

Migration `20261122011700_can_hai_san_theo_kg`:

| Thay đổi | Ý nghĩa |
|---|---|
| Enum `OrderItemStatus` thêm `WEIGHING` | Chờ cân |
| `OrderItem.weight Float?` | Số kg. Đang `WEIGHING`: số kg phục vụ ghi (tạm); đã cân: số kg thật. `null` = món theo phần (hoặc đơn cũ chưa có số kg) |
| `OrderItem.weighedAt DateTime?` | Lúc cân (null = hồ hải sản chưa cân) |

`OrderItem.price` của món theo kg là **giá 1 kg**. Tiền dòng món: có `weight` (hoặc đang `WEIGHING`) → `price × weight` (chưa có số kg = 0); còn lại → `price × quantity`. Công thức này viết giống nhau ở backend (`lineTotal` trong `dine-in.service.js`), web (`lineAmount` trong `components/dine-in/bill.js`) và app (`OrderItem.lineTotal`).

### Web nhân viên

| Trang | Thay đổi | File |
|---|---|---|
| **Cân hải sản** (mới) | Thẻ món chờ cân (bàn, khu, phục vụ, giờ gọi, ghi chú, giá / kg, "Phục vụ ghi 1 kg (tạm tính ...)"); ô nhập kg **điền sẵn số phục vụ ghi** (gõ "1,25" hay "1.25" đều được) xem trước thành tiền, Enter để cân. Bảng "Đã cân hôm nay" có nút **Cân lại**. Tự tải lại 10 giây, chuông + thông báo khi có món mới chờ cân, số đỏ trên menu | [Weighing.jsx](../frontend/src/pages/admin/dine-in/Weighing.jsx), [useDineInAlerts.js](../frontend/src/components/dine-in/useDineInAlerts.js) |
| Phiếu bếp | Dòng "Đã cân 1,3 kg" dưới tên món | [Kitchen.jsx](../frontend/src/pages/admin/dine-in/Kitchen.jsx) |
| Thanh toán tại bàn | "1,1 kg Cua gạch hấp bia"; món chưa cân: "1 kg ... (tạm, chờ cân)" + tiền tạm (đơn cũ chưa có số kg: "Chờ cân" và "—"); nhãn "Còn 1 món chờ cân" | [Cashier.jsx](../frontend/src/pages/admin/dine-in/Cashier.jsx), [bill.js](../frontend/src/components/dine-in/bill.js) |
| In bill | Dòng "1,25 kg x 1.890.000/kg" (chưa cân thì thêm "(tạm, chưa cân)") | [BillPrint.jsx](../frontend/src/pages/admin/dine-in/BillPrint.jsx) |
| Đơn hàng (chi tiết) | Cột số lượng hiện số kg ("(tạm, chờ cân)" khi chưa cân), thành tiền theo kg | [Orders.jsx](../frontend/src/pages/admin/Orders.jsx) |

### App phục vụ

| Màn | Thay đổi |
|---|---|
| S03 Sơ đồ bàn | Ô bàn ghi "1 chờ cân" khi còn món chưa cân |
| S04 Đơn của bàn | Nhãn xanh **Chờ cân**, dòng "Ghi 1 kg × 1.890.000đ/kg · chờ hồ hải sản cân" + tiền tạm; cân rồi: "Đã cân 0,98 kg × 1.890.000đ/kg" + thành tiền. (Đơn cũ chưa có số kg: "hồ hải sản đang cân", chỗ tiền ghi "Chờ cân") |
| S05 | Giá hiện "/kg" (theo đơn vị món). Nút "+" thêm **1 phần / 1 kg**, món kg báo "Đã thêm 1 kg ..., sửa số kg ở phiếu" |
| S06 Chi tiết món | Món theo phần: `[ − ] 1 [ + ]`; món theo kg: `[ − ] 1 kg [ + ]` (−/+ đổi 0,1 kg). Nút "Thêm vào phiếu · 1.890.000đ" (tiền tạm theo số kg) |
| S08 Phiếu gọi món | Món theo kg: "1.890.000đ / kg · hồ hải sản cân lại", `[ − ] 1 kg [ + ]` + tiền tạm; tạm tính ghi "(N món, món kg tính tạm)". Gửi bếp gửi kèm số kg |
| Mọi bộ chọn số lượng | **Bấm vào con số để gõ**: món theo kg gõ số lẻ ("0,98" hay "0.98"), 0,05 – 30 kg; món theo phần gõ số nguyên 1 – 50. Gõ sai thì báo ngay trong hộp. Code: `QuantityStepper`, `WeightStepper`, `showAmountDialog` ở [quantity_stepper.dart](../mobile/lib/widgets/quantity_stepper.dart); số kg lưu ở `CartItem.weight`, `CartNotifier.setWeight` ([cart_state.dart](../mobile/lib/state/cart_state.dart)) |
| S09 Gửi thanh toán | Khung xanh "Còn 1 món bán theo kg chưa cân…", nút **Gửi thanh toán** bị khóa |
| S13 Hủy món | Món theo kg không có ô chọn số phần (hủy cả dòng); chờ cân hủy không cần lý do |

---

## 4. Thử nhanh

1. `npm run dev`, đăng nhập app bằng `phucvu@fab.vn`, chọn bàn trống, gọi **Tôm hùm nướng phô mai** + **Cơm chiên hải sản**. Ở phiếu (S08) tôm hùm hiện `1 kg`: bấm vào số, gõ `1,2` → tiền tạm 2.268.000đ. Gửi bếp. S04 thấy "Ghi 1,2 kg ... · chờ hồ hải sản cân", tổng đã gồm tiền tạm.
2. Web: đăng nhập `hohaisan@fab.vn` / `123456` → menu **Cân hải sản** (số đỏ 1). Ô số kg điền sẵn `1,2`; sửa thành `1,25` → Xác nhận cân.
3. App S04 (tự tải lại 15 giây): "Đã cân 1,25 kg", tổng tăng thêm 94.500đ (0,05 kg). Gửi thanh toán.
4. Web `thungan@fab.vn`: In bill thấy dòng số kg, Đã thu tiền.
5. Web khách `/`: khối Best seller; bấm 1 món tôm hùm: nút "Đặt bàn để thưởng thức", không có "Thêm vào giỏ".

Kiểm tra tự động:

| Kiểm tra | Kết quả 22/11 |
|---|---|
| Script API qua backend thật (gửi bếp, chặn gửi thanh toán, phiếu bếp, quyền 403, cân, số kg sai, cân lại, gửi thanh toán, chặn đặt online) | 13/13 |
| App: `test/models/weight_test.dart` (định dạng kg, đọc số gõ "0,98", tiền dòng món, phiếu mặc định 1 kg, lưu số kg) + `test/state/cart_state_test.dart` (cộng số kg, kẹp 0,05 – 30 kg) + 3 test S04 / S09 trong `test/screens/s03_s04_table_test.dart` + test S08 trong `test/screens/s05_s08_ticket_test.dart` (gõ 0,98, gõ sai, −/+ 0,1 kg, gõ số phần, dữ liệu gửi bếp có `weight`) | 78 test app qua |
| Script API "phục vụ ghi số kg" (gửi 0,98 kg / không gửi số kg = 1 kg / món theo phần bỏ qua số kg, tiền tạm, 0,01 và 31 kg báo 400, chặn gửi thanh toán, trang Cân hải sản thấy số kg ghi, cân xác nhận + cân sửa đổi tiền đúng, gửi thanh toán). Đơn thử đã xóa | 14/14 |
| Web: `npx oxlint src && npx vite build` | không lỗi |
