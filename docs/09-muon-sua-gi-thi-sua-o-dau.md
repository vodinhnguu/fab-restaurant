# 09. Muốn sửa gì thì sửa ở đâu

Tài liệu này gom các **tình huống sửa đổi hay gặp nhất**. Mỗi tình huống cho biết cần mở file nào, dòng nào, và **những chỗ dễ quên**.

> Muốn hiểu từng file làm gì: xem [08-ban-do-ma-nguon.md](08-ban-do-ma-nguon.md).
> Số dòng ghi ở đây đúng với phiên bản hiện tại. Sau khi bạn sửa code, số dòng có thể lệch đi vài dòng; khi đó hãy tìm theo **tên biến** được nhắc kèm.

---

## Mục lục

- [0. Trước khi sửa: 4 thói quen nên có](#0-trước-khi-sửa-4-thói-quen-nên-có)
- [A. Thông tin nhà hàng & giao diện](#a-thông-tin-nhà-hàng--giao-diện) (không cần hiểu nhiều về code)
- [B. Quy tắc nghiệp vụ](#b-quy-tắc-nghiệp-vụ)
- [C. Thêm một trường dữ liệu mới (ví dụ đầy đủ từ DB tới giao diện)](#c-thêm-một-trường-dữ-liệu-mới)
- [D. Thêm một trang mới](#d-thêm-một-trang-mới)
- [E. Dữ liệu mẫu & tài khoản demo](#e-dữ-liệu-mẫu--tài-khoản-demo)
- [F. ⚠️ Những chỗ phải sửa CÙNG LÚC](#f-️-những-chỗ-phải-sửa-cùng-lúc)
- [G. Sửa xong rồi cần làm gì để thấy thay đổi?](#g-sửa-xong-rồi-cần-làm-gì-để-thấy-thay-đổi)
- [H. Gặp lỗi thì tìm ở đâu?](#h-gặp-lỗi-thì-tìm-ở-đâu)

---

## 0. Trước khi sửa: 4 thói quen nên có

1. **Tạo nhánh git mới** trước khi thử nghiệm, để lỡ hỏng thì quay lại được:
   ```bash
   git checkout -b thu-doi-mau
   # ... sửa, thử ...
   git checkout main            # bỏ ngang, quay về bản cũ
   ```
2. **Tìm trong toàn dự án** bằng `Cmd + Shift + F` (Mac) hoặc `Ctrl + Shift + F` (Windows). Thấy một dòng chữ trên web mà không biết nằm ở file nào? Copy dòng chữ đó rồi tìm. Đây là cách nhanh nhất.
3. **Đi tới định nghĩa** của hàm/biến: giữ `Cmd`/`Ctrl` rồi bấm vào tên hàm.
4. **Sửa ít, thử ngay.** Sửa 1 chỗ, lưu file, xem trình duyệt. Đừng sửa 10 chỗ rồi mới thử, vì khi lỗi sẽ không biết lỗi do chỗ nào.

---

## A. Thông tin nhà hàng & giao diện

### A1. Đổi tên, hotline, email, địa chỉ, bản đồ, giờ mở cửa, khu vực đặt bàn

**File chính:** [backend/src/config/restaurant.js](../backend/src/config/restaurant.js)

```js
export const restaurant = {
  name: 'FAB Seafood',
  phone: '1900 1234',
  address: '123 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng',
  mapEmbedUrl: 'https://www.google.com/maps?q=...&output=embed',
  openingHours: { open: '10:00', close: '22:00' },
  reservationAreas: ['Trong nhà', 'Ngoài trời - view biển', 'Phòng VIP'],
  ...
};
```

Sửa ở đây thì **tự động cập nhật**: footer, dòng giờ mở cửa ở trang chủ, các khung giờ và khu vực ở trang đặt bàn, và cả **quy tắc kiểm tra giờ đặt bàn** ở backend.

**Lấy link bản đồ:** mở Google Maps → tìm địa chỉ → Chia sẻ → Nhúng bản đồ → copy giá trị `src="..."`.

**⚠️ Những chữ đang viết cứng, phải sửa tay:**

| Nội dung | File | Dòng |
|---|---|---|
| Chữ "FAB Seafood" trên logo | [Logo.jsx](../frontend/src/components/layout/Logo.jsx#L8-L10) | 8-10 |
| Mô tả SEO và tiêu đề tab mặc định | [index.html](../frontend/index.html#L7) | 7, 14 |
| Tiêu đề tab của **từng trang** ("Thực đơn \| FAB Seafood") | Dòng `useDocumentTitle('...')` đầu mỗi file trong `pages/`. Phần đuôi " \| FAB Seafood" nằm trong [lib/hooks.js](../frontend/src/lib/hooks.js) | |
| "Biển Mỹ Khê, Đà Nẵng" trên ảnh lớn trang chủ | [Home.jsx](../frontend/src/pages/Home.jsx#L46) | 46 |
| Dòng bản quyền "© FAB Seafood" | [Footer.jsx](../frontend/src/components/layout/Footer.jsx#L59) | 59 |
| Câu giới thiệu dưới logo ở footer | [Footer.jsx](../frontend/src/components/layout/Footer.jsx#L15) | 15 |

### A2. Đổi phí giao hàng và mức miễn phí giao hàng

**File chính:** `backend/.env` (file của riêng máy bạn, tạo từ `.env.example`)

```
SHIPPING_FEE=20000          # phí ship
FREE_SHIPPING_MIN=500000    # đơn từ mức này trở lên được miễn phí ship
```

Sau khi sửa phải **tắt backend rồi chạy lại** (nodemon chỉ theo dõi thư mục `src/`, không theo dõi `.env`).

Backend dùng giá trị này để tính tiền thật. Trang thanh toán cũng lấy nó qua `/info` để hiển thị, nên **phần tính tiền tự khớp**.

Dòng "Miễn phí giao hàng cho đơn từ ..." ở **Footer** và ở mục ưu điểm (mảng `FEATURES`) của **trang chủ** cũng đọc số từ `info.freeShippingMin`, nên chỉ cần đổi `.env` là cả web cập nhật theo.

Chỗ duy nhất còn viết cứng là [seed.js](../backend/prisma/seed.js#L159) (dòng 159). Chỗ này chỉ ảnh hưởng đến các đơn hàng **mẫu**.

### A3. Đổi màu chủ đạo của website

**File chính:** [frontend/src/index.css](../frontend/src/index.css#L4-L35), khối `@theme`

```css
--color-ocean-900: #0b3954;   /* xanh đậm: header, nút tối, chữ tiêu đề */
--color-coral-500: #f5602e;   /* cam: nút chính, giá tiền, điểm nhấn */
--color-sand-50:  #fdfbf7;    /* nền kem của trang */
```

Mỗi màu có nhiều sắc độ (50 nhạt nhất → 950 đậm nhất). Muốn đổi cả dải màu, dùng công cụ như **uicolors.app**: nhập 1 màu, nó sinh ra đủ dải 50–950 rồi dán đè vào.

Tên màu được dùng trong class Tailwind, ví dụ `bg-ocean-900`, `text-coral-600`. Nếu bạn **đổi tên** dải màu (vd `ocean` → `brand`) thì phải tìm-thay-thế toàn bộ `ocean-` trong `frontend/src`. Vì vậy **chỉ nên đổi mã màu, giữ nguyên tên**.

**Những màu nằm ngoài `index.css`:**

| Chỗ | File |
|---|---|
| Màu biểu đồ dashboard | [Dashboard.jsx](../frontend/src/pages/admin/Dashboard.jsx#L14) dòng 14: `SERIES` |
| Màu ảnh giữ chỗ khi món chưa có ảnh | [format.js](../frontend/src/lib/format.js#L16) dòng 16 (`d5ebf4/0b3954` trong URL) |
| Màu logo | [public/favicon.svg](../frontend/public/favicon.svg) |
| Màu các badge trạng thái | [Badge.jsx](../frontend/src/components/ui/Badge.jsx#L3-L12) |

### A4. Đổi font chữ

Phải sửa **2 chỗ**:
1. [index.html](../frontend/index.html#L10-L13) dòng 10-13: link tải font từ Google Fonts (vào fonts.google.com, chọn font, copy thẻ `<link>`).
2. [index.css](../frontend/src/index.css#L5-L6) dòng 5-6: `--font-sans` (chữ thường) và `--font-display` (tiêu đề lớn).

Nhớ chọn font **có hỗ trợ tiếng Việt** (trên Google Fonts, lọc theo Language → Vietnamese).

### A5. Đổi logo

- Hình: thay file [frontend/public/favicon.svg](../frontend/public/favicon.svg) (giữ tên file). Nếu dùng PNG, đổi đường dẫn trong [Logo.jsx](../frontend/src/components/layout/Logo.jsx#L7) dòng 7 và [index.html](../frontend/index.html#L5) dòng 5.
- Chữ cạnh logo: [Logo.jsx](../frontend/src/components/layout/Logo.jsx#L8-L10).

### A6. Đổi ảnh và chữ trên trang chủ

Tất cả nằm trong [frontend/src/pages/Home.jsx](../frontend/src/pages/Home.jsx):

| Muốn đổi | Tìm |
|---|---|
| Ảnh lớn đầu trang, 2 ảnh mục "Về chúng tôi" | Hằng `HERO`, `ABOUT_1`, `ABOUT_2` (dòng 11-13) |
| 4 ô ưu điểm (Tươi sống, Đầu bếp...) | Mảng `FEATURES` (dòng 15-20) |
| 3 lời khen của khách | Mảng `TESTIMONIALS` (dòng 22-26) |
| Câu khẩu hiệu "Hương vị đại dương..." | Dòng 48-51 |
| Đoạn giới thiệu, các con số 10+ / 50+ / 20K+ | Dòng 160-171 |
| Khối kêu gọi đặt bàn | Dòng 190-200 |

Ảnh có thể là link `https://...` hoặc file đặt trong `frontend/public/` (ví dụ đặt `public/hero.jpg` thì dùng `'/hero.jpg'`).

Icon (con cá, mũ đầu bếp...) lấy từ thư viện **lucide-react**. Tìm tên icon tại lucide.dev, thêm vào dòng `import { ... } from 'lucide-react'` rồi dùng.

### A7. Thêm, bớt, đổi tên mục menu

| Menu | File | Biến |
|---|---|---|
| Thanh menu trên cùng (khách) | [Header.jsx](../frontend/src/components/layout/Header.jsx#L9-L14) | `NAV` |
| Menu thả xuống khi bấm tên người dùng | [Header.jsx](../frontend/src/components/layout/Header.jsx#L40-L56) | trong `UserMenu` |
| Các liên kết ở footer | [Footer.jsx](../frontend/src/components/layout/Footer.jsx#L32-L37) | |
| Sidebar trang admin | [AdminLayout.jsx](../frontend/src/components/layout/AdminLayout.jsx#L21-L30) | `MENU` |
| Các tab trang tài khoản | [AccountLayout.jsx](../frontend/src/pages/account/AccountLayout.jsx#L6-L10) | `TABS` |

Thêm mục menu mới trỏ tới một trang **chưa có** thì xem [mục D](#d-thêm-một-trang-mới).

### A8. Đổi nhãn tiếng Việt hoặc màu của trạng thái

[frontend/src/lib/constants.js](../frontend/src/lib/constants.js):

```js
export const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', color: 'amber' },   // đổi label hoặc color ở đây
  ...
};
```

`color` phải là một trong các màu có trong [Badge.jsx](../frontend/src/components/ui/Badge.jsx#L3-L12): `amber`, `blue`, `indigo`, `cyan`, `green`, `red`, `slate`, `coral`. Muốn màu khác thì thêm vào đó trước.

Chữ trên **nút** đổi trạng thái của admin ("Xác nhận đơn", "Bắt đầu chế biến"...) nằm ở `STATUS_ACTION_LABEL` cùng file.

### A9. Đổi các lựa chọn sắp xếp hoặc số món mỗi trang

- Nhãn và thứ tự các lựa chọn sắp xếp: `SORT_OPTIONS` trong [constants.js](../frontend/src/lib/constants.js#L36-L42).
- Thêm **kiểu sắp xếp mới** (ví dụ "Giảm giá nhiều nhất") cần sửa 3 chỗ:
  1. [dishes.controller.js](../backend/src/modules/dishes/dishes.controller.js#L5-L11): thêm vào `SORTS`.
  2. [dishes.validation.js](../backend/src/modules/dishes/dishes.validation.js#L27): thêm tên vào `z.enum([...])` của `sort`.
  3. [constants.js](../frontend/src/lib/constants.js#L36): thêm vào `SORT_OPTIONS`.
- Số món mỗi trang ở Thực đơn: `limit: 12` trong [Menu.jsx](../frontend/src/pages/Menu.jsx#L39) dòng 39. Ở trang admin món ăn: `limit: 15` trong [admin/Dishes.jsx](../frontend/src/pages/admin/Dishes.jsx#L108).

---

## B. Quy tắc nghiệp vụ

### B1. Đổi quy trình trạng thái đơn hàng

Ví dụ: muốn cho phép chuyển thẳng từ "Đã xác nhận" sang "Hoàn thành".

Phải sửa **cả hai phía** cho khớp:

| Phía | File | Biến |
|---|---|---|
| Backend (quyết định thật) | [orders.service.js](../backend/src/modules/orders/orders.service.js#L8-L15) | `STATUS_FLOW` |
| Frontend (quyết định nút nào hiện) | [constants.js](../frontend/src/lib/constants.js#L11-L18) | `NEXT_STATUS` |

```js
CONFIRMED: ['PREPARING', 'COMPLETED', 'CANCELLED'],   // thêm 'COMPLETED' ở CẢ HAI file
```

Nếu chỉ sửa frontend: nút hiện ra nhưng bấm vào bị backend báo lỗi "Không thể chuyển đơn...".
Nếu chỉ sửa backend: API cho phép nhưng admin không có nút để bấm.

### B2. Thêm một trạng thái đơn hàng mới

Ví dụ: thêm `READY` ("Sẵn sàng, chờ khách đến lấy"). Đây là thay đổi lớn, đi qua nhiều tầng:

1. [schema.prisma](../backend/prisma/schema.prisma#L27-L34): thêm `READY` vào `enum OrderStatus`. Chạy `npm run db:migrate`.
2. [orders.validation.js](../backend/src/modules/orders/orders.validation.js#L30): thêm `'READY'` vào **2** chỗ `z.enum([...])` (dòng 30 và 38).
3. [orders.service.js](../backend/src/modules/orders/orders.service.js#L8): thêm vào `STATUS_FLOW` (cả dòng `READY: [...]` lẫn các trạng thái được phép đi tới `READY`).
4. [constants.js](../frontend/src/lib/constants.js): thêm vào `ORDER_STATUS` (nhãn + màu), `NEXT_STATUS`, `STATUS_ACTION_LABEL`.
5. [OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx#L16): thêm vào mảng `STEPS` để thanh tiến trình của khách hiện bước mới.

Tab lọc và thống kê ở admin tự cập nhật, vì chúng lặp qua `ORDER_STATUS`.

### B3. Cho khách tự hủy đơn ở trạng thái khác

Hiện tại khách chỉ được hủy khi đơn còn `PENDING`. Sửa 2 chỗ:
- Backend: [orders.controller.js](../backend/src/modules/orders/orders.controller.js#L48) dòng 48: điều kiện `order.status !== 'PENDING'`.
- Frontend: [OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx#L185) dòng 185: điều kiện hiện nút "Hủy đơn".

### B4. Đổi quy tắc đặt bàn

| Quy tắc | Backend | Frontend |
|---|---|---|
| Đặt trước ít nhất 30 phút | [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js#L22-L25) dòng 22-25 | (không kiểm tra) |
| Giờ đặt muộn nhất = giờ đóng cửa − 1 tiếng | [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js#L32) dòng 32: `- 60` | [Reservation.jsx](../frontend/src/pages/Reservation.jsx#L22) dòng 22: `(ch - 1)` |
| Các khung giờ cách nhau 30 phút | | [Reservation.jsx](../frontend/src/pages/Reservation.jsx#L22) dòng 22: `m += 30` |
| Tối đa 50 khách | [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js#L18) dòng 18 | [Reservation.jsx](../frontend/src/pages/Reservation.jsx#L122) dòng 122 |
| Ngày mặc định trên form là ngày mai, 19:00 | | [Reservation.jsx](../frontend/src/pages/Reservation.jsx#L38-L39) dòng 38-39 |
| Hủy được khi ở trạng thái nào | [reservations.controller.js](../backend/src/modules/reservations/reservations.controller.js#L34) dòng 34 | [MyReservations.jsx](../frontend/src/pages/account/MyReservations.jsx#L46) dòng 46 |
| Admin thấy nút nào ở trạng thái nào | | [admin/Reservations.jsx](../frontend/src/pages/admin/Reservations.jsx#L15-L18): `ACTIONS` |

### B5. Đổi số lượng tối đa mỗi món trong giỏ (đang là 50)

| File | Dòng |
|---|---|
| [orders.validation.js](../backend/src/modules/orders/orders.validation.js#L19) | 19: `.max(50)` |
| [stores/cart.js](../frontend/src/stores/cart.js#L21) | 21 và 42: `Math.min(50, ...)` |
| [QuantityInput.jsx](../frontend/src/components/ui/QuantityInput.jsx#L3) | 3: `max = 50` |

### B6. Đổi quy tắc số điện thoại hợp lệ

Regex hiện tại `^(0|\+84)\d{9,10}$` (bắt đầu bằng 0 hoặc +84, sau đó 9–10 chữ số) xuất hiện ở **7 chỗ**:

| Backend | Frontend |
|---|---|
| [auth.validation.js](../backend/src/modules/auth/auth.validation.js#L6) dòng 6 | [Checkout.jsx](../frontend/src/pages/Checkout.jsx#L131) dòng 131 |
| [orders.validation.js](../backend/src/modules/orders/orders.validation.js#L9) dòng 9 | [Register.jsx](../frontend/src/pages/Register.jsx#L42) dòng 42 |
| [reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js#L15) dòng 15 | [Reservation.jsx](../frontend/src/pages/Reservation.jsx#L104) dòng 104 |
| | [Profile.jsx](../frontend/src/pages/account/Profile.jsx#L28) dòng 28 (có thêm `( ... )?` vì được để trống) |

> 💡 **Bài tập refactor:** gom regex về một chỗ. Backend: tạo `src/utils/validators.js` export `phoneSchema`. Frontend: thêm `PHONE_REGEX` vào `lib/constants.js`. Rồi thay 7 chỗ trên bằng biến dùng chung. Sau này đổi chỉ cần sửa 2 chỗ.

### B7. Đổi cách tính tiền đơn hàng

Toàn bộ nằm trong `createOrder` ở [orders.service.js](../backend/src/modules/orders/orders.service.js#L19-L77):

| Muốn đổi | Dòng |
|---|---|
| Giá dùng để tính (hiện tại: giá KM nếu có, không thì giá gốc) | 33: `d.salePrice ?? d.price` |
| Công thức phí ship | 38 |
| Tổng tiền | 64: `subtotal - discount + shippingFee` |

Cách tính **giảm giá** của mã nằm trong [coupons.service.js](../backend/src/modules/coupons/coupons.service.js#L19-L21).

⚠️ Trang Checkout cũng tự tính một **con số ước tính** để hiển thị ([Checkout.jsx](../frontend/src/pages/Checkout.jsx#L85-L88) dòng 85-88). Đổi công thức ở backend thì nhớ sửa luôn ở đây, nếu không khách sẽ thấy một số tiền và bị tính một số khác.

### B8. Đổi thời gian tự cập nhật trạng thái đơn

| Trang | File | Dòng |
|---|---|---|
| Khách xem đơn (15 giây) | [OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx#L98) | 98: `refetchInterval: 15000`, và chữ "mỗi 15 giây" ở dòng 136 |
| Admin danh sách đơn (30 giây) | [admin/Orders.jsx](../frontend/src/pages/admin/Orders.jsx#L106) | 106: `refetchInterval: 30000` |

Đơn vị là **mili-giây** (1000 = 1 giây).

### B9. Các quy tắc khác

| Muốn đổi | Ở đâu |
|---|---|
| Thời gian giữ đăng nhập (đang 7 ngày) | `backend/.env`: `JWT_EXPIRES_IN="7d"` (có thể dùng `12h`, `30d`...) |
| Dung lượng ảnh tối đa (5MB) | [middlewares/upload.js](../backend/src/middlewares/upload.js#L17) dòng 17, câu báo lỗi ở [error.js](../backend/src/middlewares/error.js#L36) dòng 36, chữ gợi ý ở [ImageUpload.jsx](../frontend/src/components/ImageUpload.jsx#L43) dòng 43 |
| Loại ảnh được phép tải lên | [middlewares/upload.js](../backend/src/middlewares/upload.js#L19) dòng 19 |
| Ai được đánh giá món | [reviews.controller.js](../backend/src/modules/reviews/reviews.controller.js#L26-L29): hiện yêu cầu có đơn `COMPLETED` chứa món đó |
| Doanh thu dashboard tính những đơn nào | [stats.controller.js](../backend/src/modules/stats/stats.controller.js#L15) dòng 15 **và** câu SQL dòng 43 (sửa cả hai cho khớp) |
| Xóa món đã từng bán: ẩn hay xóa hẳn | [dishes.controller.js](../backend/src/modules/dishes/dishes.controller.js#L102-L112) |
| Độ dài mật khẩu tối thiểu | [auth.validation.js](../backend/src/modules/auth/auth.validation.js#L12) dòng 12 và 29; [Register.jsx](../frontend/src/pages/Register.jsx#L45) dòng 45; [Profile.jsx](../frontend/src/pages/account/Profile.jsx#L55) dòng 55 |
| Đơn mới trong bao lâu thì hiện "Cảm ơn bạn đã đặt món!" | [OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx#L124) dòng 124 (đang 10 phút) |

---

## C. Thêm một trường dữ liệu mới

Đây là bài tập quan trọng nhất để hiểu dữ liệu chảy qua các tầng như thế nào.
**Ví dụ:** thêm trường `calories` (lượng calo) cho món ăn.

```
schema.prisma → migrate → validation → (controller) → form admin → trang hiển thị
```

**Bước 1. Database:** [schema.prisma](../backend/prisma/schema.prisma#L89), trong `model Dish`, thêm:
```prisma
  calories    Int?        // dấu ? = không bắt buộc, món cũ sẽ có giá trị null
```
Rồi chạy trong `backend/`:
```bash
npm run db:migrate
# Prisma hỏi tên migration → gõ: add_dish_calories
```
Kiểm tra: `npm run db:studio` → bảng `Dish` có cột `calories`.

**Bước 2. Validation:** [dishes.validation.js](../backend/src/modules/dishes/dishes.validation.js#L4-L14), thêm vào `dishSchema`:
```js
    calories: z.coerce.number().int().min(0).optional().nullable(),
```
⚠️ **Bước hay bị quên nhất.** Zod **tự loại bỏ** các trường không khai báo trong schema. Thiếu dòng này thì frontend gửi `calories` lên nhưng backend lặng lẽ bỏ qua, không báo lỗi gì.

**Bước 3. Controller:** không cần sửa. `create` và `update` đã dùng `...req.body`, nên trường mới tự được lưu. API `GET /dishes` cũng tự trả về cột mới.

**Bước 4. Form admin:** [admin/Dishes.jsx](../frontend/src/pages/admin/Dishes.jsx)
- Dòng 18, hằng `EMPTY`: thêm `calories: ''`.
- Trong `onSubmit` (dòng 38-49): thêm `calories: v.calories ? Number(v.calories) : null,`
- Trong form (khoảng dòng 86-89, cạnh ô "Đơn vị"): thêm ô nhập
  ```jsx
  <Field label="Calo">
    <Input type="number" {...register('calories')} />
  </Field>
  ```
- Khi sửa món, `defaultValues` ở dòng 24 lấy `null` từ món cũ. Thêm `calories: dish.calories ?? ''` vào đó để ô nhập không bị lỗi.

**Bước 5. Hiển thị cho khách:** [DishDetail.jsx](../frontend/src/pages/DishDetail.jsx#L101), dưới phần mô tả:
```jsx
{dish.calories && <p className="mt-2 text-sm text-slate-500">🔥 {dish.calories} kcal</p>}
```

**Bước 6 (tùy chọn).** Thêm `calories` cho các món mẫu trong [seed.js](../backend/prisma/seed.js), rồi cập nhật [06-api-reference.md](06-api-reference.md) để app Flutter biết có trường mới.

Áp dụng cùng quy trình cho mọi trường mới (thêm `note` cho danh mục, `birthday` cho người dùng...).

---

## D. Thêm một trang mới

Ví dụ: trang **Giới thiệu** tại `/about`.

**Bước 1.** Tạo file `frontend/src/pages/About.jsx`:
```jsx
export default function About() {
  return (
    <div className="container-page py-10">
      <h1 className="heading-display text-4xl">Về FAB Seafood</h1>
      <p className="mt-4 text-slate-600">Nội dung giới thiệu...</p>
    </div>
  );
}
```

**Bước 2.** Đăng ký route trong [App.jsx](../frontend/src/App.jsx):
```jsx
const About = lazy(() => import('./pages/About'));              // cạnh các dòng lazy khác (dòng 10-18)
...
<Route path="about" element={<About />} />                       // trong khối CustomerLayout, TRƯỚC dòng path="*"
```
- Đặt trong khối `<Route element={<CustomerLayout />}>` → trang có header và footer.
- Muốn bắt buộc đăng nhập → đặt trong `<Route element={<ProtectedRoute />}>`.
- Trang admin → đặt trong khối `path="admin"` và thêm mục vào `MENU` của `AdminLayout.jsx`.

**Bước 3.** Thêm link vào menu: `NAV` trong [Header.jsx](../frontend/src/components/layout/Header.jsx#L9).

**Bước 4.** Nếu trang cần dữ liệu từ server: thêm hàm vào [services/index.js](../frontend/src/services/index.js), rồi dùng `useQuery` trong trang (xem [Menu.jsx](../frontend/src/pages/Menu.jsx#L40-L44) làm mẫu). Nếu backend chưa có API đó, làm theo hướng dẫn thêm module ở [04-backend-express.md mục 7](04-backend-express.md#7-hướng-dẫn-thêm-một-module-mới).

---

## E. Dữ liệu mẫu & tài khoản demo

File: [backend/prisma/seed.js](../backend/prisma/seed.js). Sửa xong chạy `npm run db:seed` trong `backend/`.

> ⚠️ `db:seed` **XÓA HẾT** dữ liệu hiện có (kể cả đơn và món bạn đã tự thêm qua trang admin) rồi mới nạp lại dữ liệu mẫu.

| Muốn đổi | Dòng |
|---|---|
| Danh mục mẫu | 20-29: mảng `categories` |
| Món mẫu | 32-66: mảng `dishes`, mỗi dòng là `[tên, danh mục, giá, giá KM, đơn vị, mã ảnh Unsplash, nổi bật, mô tả]` |
| Tài khoản admin | 91-99 |
| Tài khoản khách | 102-106 (mật khẩu chung ở dòng 100) |
| Mã giảm giá mẫu | 142-148 |
| Số đơn mẫu (80) và khoảng thời gian (30 ngày) | khoảng dòng 152-154 |
| Lịch đặt bàn mẫu | 235-242 |

**Đổi email/mật khẩu demo** thì nhớ sửa cả:
- 2 nút điền nhanh trên [Login.jsx](../frontend/src/pages/Login.jsx#L49-L56) dòng 49-56,
- bảng tài khoản trong [README.md](../README.md),
- dòng in ra màn hình cuối file seed.

**Trước khi chạy thật:** xóa khối "Tài khoản demo" (dòng 49-56) trong [Login.jsx](../frontend/src/pages/Login.jsx#L49-L56) và đổi mật khẩu admin.

---

## F. ⚠️ Những chỗ phải sửa CÙNG LÚC

Đây là các thông tin đang được **lặp lại ở nhiều file**. Sửa một chỗ mà quên chỗ kia sẽ gây lỗi khó phát hiện. Khi nâng cấp dự án, gom chúng về một nơi là một bài tập refactor rất tốt.

| Thông tin | Các nơi đang lặp |
|---|---|
| Quy trình trạng thái đơn | `STATUS_FLOW` ([orders.service.js](../backend/src/modules/orders/orders.service.js#L8)) ↔ `NEXT_STATUS` ([constants.js](../frontend/src/lib/constants.js#L11)) |
| Danh sách trạng thái đơn | `enum OrderStatus` (schema) ↔ 2 chỗ `z.enum` ([orders.validation.js](../backend/src/modules/orders/orders.validation.js#L30)) ↔ `ORDER_STATUS` (constants) ↔ `STEPS` ([OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx#L16)) |
| Danh sách trạng thái đặt bàn | `enum ReservationStatus` (schema) ↔ 2 chỗ `z.enum` ([reservations.validation.js](../backend/src/modules/reservations/reservations.validation.js#L38)) ↔ `RESERVATION_STATUS` (constants) |
| Kiểu sắp xếp món | `SORTS` (dishes.controller) ↔ `sort: z.enum` (dishes.validation) ↔ `SORT_OPTIONS` (constants) |
| Regex số điện thoại | 7 chỗ, xem [B6](#b6-đổi-quy-tắc-số-điện-thoại-hợp-lệ) |
| Tối đa 50 phần/món | 4 chỗ, xem [B5](#b5-đổi-số-lượng-tối-đa-mỗi-món-trong-giỏ-đang-là-50) |
| Mốc miễn phí ship "500.000đ" (chữ hiển thị) | `.env` ↔ Footer.jsx ↔ Home.jsx, xem [A2](#a2-đổi-phí-giao-hàng-và-mức-miễn-phí-giao-hàng) |
| Giờ đặt muộn nhất (đóng cửa − 1 tiếng) | reservations.validation.js ↔ Reservation.jsx `timeSlots` |
| Công thức phí ship | orders.service.js ↔ Checkout.jsx (ước tính) ↔ seed.js |
| Cổng backend 4000 | `backend/.env` `PORT` ↔ [vite.config.js](../frontend/vite.config.js#L11-L12) proxy |
| Địa chỉ frontend 5173 | `backend/.env` `CORS_ORIGIN` ↔ cổng trong vite.config.js |

---

## G. Sửa xong rồi cần làm gì để thấy thay đổi?

| Bạn vừa sửa | Cần làm |
|---|---|
| File `.js` trong `backend/src/` | Không cần làm gì. Nodemon tự khởi động lại (terminal hiện `[nodemon] restarting...`) |
| `backend/.env` | **Tắt backend (`Ctrl+C`) và chạy lại** `npm run dev` |
| `backend/prisma/schema.prisma` | `npm run db:migrate` trong `backend/`, rồi khởi động lại backend |
| `backend/prisma/seed.js` | `npm run db:seed` (⚠️ xóa hết dữ liệu cũ) |
| File trong `frontend/src/` | Không cần làm gì. Vite tự cập nhật trình duyệt (Hot Module Replacement) |
| `frontend/index.html` | Thường tự tải lại. Nếu không thấy thì F5 |
| `frontend/vite.config.js` hoặc `frontend/.env` | Tắt frontend và chạy lại |
| Thêm thư viện (`npm install ...`) | Khởi động lại phần tương ứng |
| Đã sửa mà trình duyệt vẫn hiện bản cũ | Hard reload: `Cmd + Shift + R` (Mac) hoặc `Ctrl + Shift + R` (Windows) |
| Giỏ hàng / đăng nhập bị lỗi lạ sau khi đổi cấu trúc store | DevTools → Application → Local Storage → xóa key `fab-cart` / `fab-auth` |

---

## H. Gặp lỗi thì tìm ở đâu?

### H1. Quy trình 4 bước

1. **Đọc thông báo lỗi** (toast đỏ trên web, hoặc chữ đỏ trong terminal). Hầu hết thông báo trong dự án là tiếng Việt và **viết đúng nguyên văn trong code**. Copy câu đó, `Cmd + Shift + F` tìm trong dự án là ra ngay chỗ ném lỗi.
2. **Mở DevTools** (`F12`) → tab **Network** → bấm vào request màu đỏ → xem tab **Response**. Ở đây bạn thấy chính xác backend trả về gì, kể cả mảng `errors` cho biết trường nào sai.
3. **Xem terminal chạy backend.** Mỗi request in ra một dòng, ví dụ `POST /api/v1/orders 400 12.3 ms`. Lỗi 500 sẽ in nguyên stack trace, dòng đầu tiên có đường dẫn `src/...` là chỗ hỏng.
4. **Xem tab Console** của DevTools với lỗi giao diện (trang trắng, "Đã có lỗi xảy ra").

### H2. Bảng tra theo mã lỗi

| Mã | Nghĩa là | Tìm ở đâu |
|---|---|---|
| **400** | Dữ liệu gửi lên sai | File `*.validation.js` của module đó. Xem `errors[].field` trong Response để biết trường nào |
| **401** | Chưa đăng nhập / token hết hạn | [middlewares/auth.js](../backend/src/middlewares/auth.js). Thử đăng xuất rồi đăng nhập lại |
| **403** | Đăng nhập rồi nhưng không đủ quyền | File `*.routes.js`: route đó có `requireAdmin` không? |
| **404** "Không tìm thấy đường dẫn" | Sai URL hoặc chưa đăng ký route | `*.routes.js` và [routes.js](../backend/src/routes.js). Kiểm tra lại method (GET/POST...) |
| **404** "Không tìm thấy dữ liệu" | Có route nhưng không có bản ghi | Controller tương ứng, và mở Prisma Studio kiểm tra dữ liệu |
| **409** | Trùng dữ liệu (email, mã giảm giá...) hoặc đang được dùng nên không xóa được | [error.js](../backend/src/middlewares/error.js#L22-L33) |
| **500** | Lỗi code backend | Stack trace trong terminal backend |
| "Không thể kết nối máy chủ" | Backend không chạy, hoặc sai cổng | Terminal backend; cổng trong `.env` và `vite.config.js` |

### H3. Mẹo debug

- **In giá trị ra để xem:** thêm `console.log('order', order)` trong controller (in ra **terminal backend**), hoặc trong component React (in ra **Console trình duyệt**). Nhớ xóa sau khi xong.
- **Xem và sửa dữ liệu trực tiếp:** `npm run db:studio` trong `backend/` → mở http://localhost:5555.
- **Thử API không cần giao diện:** dùng [docs/api.http](api.http) để biết lỗi nằm ở backend hay frontend. API chạy đúng mà web vẫn sai → lỗi ở frontend.
- **React Query Devtools** (nâng cao): cài `@tanstack/react-query-devtools` để xem cache, query nào đang tải, query nào lỗi.
