# 11. Thanh toán online với VNPay

Tài liệu này giải thích luồng thanh toán VNPay của FAB Seafood: tiền đi đường nào, code nằm ở đâu, cách đăng ký sandbox để chạy thử, và những việc cần làm trước khi nhận tiền thật.

## 1. Ý tưởng chính

Nguyên tắc quan trọng nhất: **web của mình không bao giờ tự quyết định "đã trả tiền"**. Chỉ VNPay mới biết khách có trả hay không, và VNPay báo lại bằng một thông điệp có **chữ ký**.

**Chữ ký** là gì? Mình và VNPay cùng giữ một chuỗi bí mật (`VNP_HASH_SECRET`). Mỗi thông điệp được "băm" cùng chuỗi bí mật đó bằng HMAC-SHA512, tạo ra một chuỗi 128 ký tự. Nếu ai đó sửa dù chỉ 1 ký tự trong thông điệp (ví dụ đổi `vnp_ResponseCode=24` thành `00`), chữ ký tính lại sẽ khác hẳn. Người không có chuỗi bí mật thì không thể tạo chữ ký đúng.

## 2. Luồng thanh toán

```
 Khách                     Frontend (React)              Backend (Express)                 VNPay
   │  Bấm "Đặt hàng VNPay"      │                              │                              │
   │ ─────────────────────────► │  POST /orders                │                              │
   │                            │ ───────────────────────────► │ tạo Order (UNPAID)           │
   │                            │  POST /payments/vnpay/:code  │                              │
   │                            │ ───────────────────────────► │ tạo Payment (PENDING)        │
   │                            │ ◄─────────────────────────── │ trả link có chữ ký           │
   │  chuyển sang trang VNPay   │                              │                              │
   │ ───────────────────────────────────────────────────────────────────────────────────────► │
   │  nhập thẻ / quét QR, OTP   │                              │                              │
   │                            │                              │ ◄──── (1) IPN: GET /ipn ──── │ máy chủ VNPay gọi thẳng
   │                            │                              │ ──── { RspCode: "00" } ────► │
   │ ◄──────────── (2) chuyển về /payment/vnpay-return?vnp_...&vnp_SecureHash=... ────────── │
   │                            │  GET /payments/vnpay/return  │                              │
   │                            │ ───────────────────────────► │ kiểm chữ ký, ghi nhận        │
   │  "Thanh toán thành công"   │ ◄─────────────────────────── │ (nếu IPN chưa làm)           │
```

Có **hai** đường báo kết quả, và cả hai đều có chữ ký:

| | (1) IPN | (2) Return URL |
|---|---|---|
| Ai gọi | Máy chủ VNPay gọi thẳng backend | Trình duyệt của khách |
| Khi khách tắt trình duyệt giữa chừng | Vẫn chạy | Không chạy |
| Khi chạy ở máy cá nhân (`localhost`) | **Không chạy** (VNPay không gọi được vào máy bạn) | Vẫn chạy |

Vì vậy cả hai đều gọi chung hàm `handleVnpayResult`. **Đường nào đến trước thì ghi nhận**, đường đến sau thấy "đã xử lý" và bỏ qua. Câu `updateMany({ where: { id, status: 'PENDING' } })` bảo đảm điều này, kể cả khi hai bên đến cùng một lúc.

## 3. Code nằm ở đâu

| File | Vai trò |
|---|---|
| [backend/src/modules/payments/vnpay.js](../backend/src/modules/payments/vnpay.js) | Hàm thuần: `buildPaymentUrl` (tạo link + chữ ký), `verifySignature`, bảng `RESPONSE_MESSAGES` |
| [backend/src/modules/payments/payments.service.js](../backend/src/modules/payments/payments.service.js) | `createVnpayPayment` (kiểm tra đơn, tạo dòng `Payment`), `handleVnpayResult` (kiểm chữ ký, số tiền, ghi nhận đúng 1 lần) |
| [backend/src/modules/payments/payments.controller.js](../backend/src/modules/payments/payments.controller.js) | 3 API: tạo link, IPN, return |
| [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) | Model `Payment`: mỗi lần bấm thanh toán là 1 dòng |
| [frontend/src/pages/Checkout.jsx](../frontend/src/pages/Checkout.jsx) | Đặt đơn ONLINE xong thì lấy link rồi `window.location.href = link` |
| [frontend/src/pages/OrderDetail.jsx](../frontend/src/pages/OrderDetail.jsx) | Nút "Thanh toán qua VNPay" cho đơn chưa trả (thanh toán lại) |
| [frontend/src/pages/PaymentResult.jsx](../frontend/src/pages/PaymentResult.jsx) | Trang `/payment/vnpay-return`: gửi nguyên query lên backend để kiểm tra |
| [frontend/src/pages/admin/Orders.jsx](../frontend/src/pages/admin/Orders.jsx) | Chi tiết đơn có "Lịch sử thanh toán VNPay" để đối soát |

### Các API

| Method | Endpoint | Ai gọi | Mô tả |
|---|---|---|---|
| POST | `/payments/vnpay/:code` | Khách | Body `{ phone }` (khách vãng lai). Trả `{ paymentUrl }` |
| GET | `/payments/vnpay/ipn` | **Chỉ VNPay** | Luôn trả HTTP 200 + `{ RspCode, Message }` |
| GET | `/payments/vnpay/return` | Trang kết quả | Gửi nguyên query `vnp_...`. Trả `{ paid, message, orderCode, phone, amount, transactionNo, bankCode }` |

`RspCode` trả cho VNPay: `00` ghi nhận thành công, `01` không tìm thấy giao dịch, `02` đã xử lý trước đó, `04` sai số tiền, `97` sai chữ ký, `99` lỗi khác.

## 4. Các quy tắc đã cài sẵn

- **Số tiền luôn lấy từ database**, không lấy từ client. Khi nhận kết quả, backend so `vnp_Amount / 100` với số tiền đã lưu trong `Payment`.
- **Mỗi lần bấm thanh toán là một mã giao dịch mới** (`vnp_TxnRef` = mã đơn + đuôi thời gian), vì VNPay không cho dùng lại mã cũ khi khách hủy rồi thanh toán lại.
- Thành công khi **cả hai** mã `vnp_ResponseCode` và `vnp_TransactionStatus` đều là `"00"`.
- Link thanh toán hết hạn sau **15 phút** (`vnp_ExpireDate`).
- Đơn đã trả tiền thì **khách không tự hủy được**, phải gọi nhà hàng. Khi admin hủy đơn đã trả, hệ thống ghi `REFUNDED`, nhưng **tiền không tự về tài khoản khách**: admin phải vào trang quản trị VNPay để hoàn tiền.
- Chưa điền `VNP_TMN_CODE` / `VNP_HASH_SECRET` thì `/info` trả `onlinePayment: false`, trang Checkout làm mờ lựa chọn VNPay, và backend từ chối đơn `ONLINE`.

## 5. Chạy thử với sandbox (miễn phí)

**B1. Đăng ký tài khoản sandbox** tại https://sandbox.vnpayment.vn/devreg/. VNPay sẽ gửi email chứa:
- `vnp_TmnCode` (mã website, khoảng 8 ký tự)
- `vnp_HashSecret` (chuỗi bí mật)

**B2. Điền vào `backend/.env`** (không commit file này):
```env
VNP_TMN_CODE="ABCD1234"
VNP_HASH_SECRET="CHUOI_BI_MAT_TRONG_EMAIL"
VNP_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNP_RETURN_URL="http://localhost:5173/payment/vnpay-return"
```
Khởi động lại backend (`npm run dev`).

**B3. Đặt một đơn, chọn "Thanh toán VNPay".** Trên trang VNPay, chọn **Thẻ nội địa → NCB** và nhập thẻ test (lấy từ tài liệu sandbox của VNPay, tại thời điểm viết là):

| Trường | Giá trị |
|---|---|
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | `NGUYEN VAN A` |
| Ngày phát hành | `07/15` |
| OTP | `123456` |

Nếu thẻ trên không dùng được, hãy xem lại danh sách thẻ test trong email hoặc trang tài liệu của VNPay sandbox.

**B4. Kiểm tra kết quả:** web quay về trang "Thanh toán thành công", đơn hiện "Đã thanh toán", và trong admin (Đơn hàng → chi tiết) có dòng lịch sử thanh toán kèm mã giao dịch VNPay.

Thử thêm trường hợp **bấm "Hủy" trên trang VNPay**: web sẽ báo "Bạn đã hủy giao dịch", đơn vẫn chưa thanh toán và khách có thể bấm thanh toán lại.

### Thử IPN khi đang chạy ở máy cá nhân (không bắt buộc)

VNPay không gọi được `localhost`. Muốn thử IPN, bạn cần mở một đường hầm ra Internet, ví dụ:
```bash
npx cloudflared tunnel --url http://localhost:4000
# hoặc: ngrok http 4000
```
Sau đó khai báo **IPN URL** là `https://<địa-chỉ-đường-hầm>/api/v1/payments/vnpay/ipn` với VNPay (trong trang quản trị merchant sandbox; nếu không thấy mục này thì liên hệ hỗ trợ của VNPay).

## 6. App Flutter dùng thế nào

Flutter dùng chung API, không cần sửa backend:
1. Gọi `POST /payments/vnpay/:code` để lấy `paymentUrl`.
2. Mở `paymentUrl` trong **WebView**.
3. Theo dõi điều hướng của WebView: khi URL bắt đầu bằng `VNP_RETURN_URL`, đóng WebView và gửi phần query (`?vnp_...`) lên `GET /payments/vnpay/return` để lấy kết quả.

## 7. Trước khi nhận tiền thật

- [ ] Ký hợp đồng với VNPay. Họ cấp `TmnCode` / `HashSecret` **thật** (khác sandbox).
- [ ] Đổi `VNP_URL` sang `https://pay.vnpay.vn/vpcpay.html`, và đổi `VNP_RETURN_URL` sang domain thật (`https://...`).
- [ ] Khai báo IPN URL thật: `https://api.<domain>/api/v1/payments/vnpay/ipn`.
- [ ] Nếu backend chạy sau Nginx hoặc proxy, thêm `app.set('trust proxy', 1)` để `req.ip` lấy đúng IP của khách (đồng thời giúp rate limit hoạt động đúng).
- [ ] **Không bao giờ** commit `VNP_HASH_SECRET` lên git, và không để nó xuất hiện trong code frontend.
- [ ] Hằng ngày đối soát: so sánh các dòng `Payment` có status `SUCCESS` với báo cáo trên trang quản trị VNPay.

## 8. Lỗi thường gặp

| Hiện tượng | Nguyên nhân hay gặp |
|---|---|
| Trang VNPay báo **"Sai chữ ký"** | `VNP_HASH_SECRET` sai hoặc thừa dấu cách / xuống dòng; sửa xong quên khởi động lại backend |
| VNPay báo **website chưa được phê duyệt / sai TmnCode** | `VNP_TMN_CODE` sai, hoặc đang dùng mã sandbox với URL thật (và ngược lại) |
| Trang kết quả báo **"sai chữ ký"** | Query trên URL bị cắt hoặc sửa. Kiểm tra `VNP_RETURN_URL` có trỏ đúng `/payment/vnpay-return` không |
| Đã trả tiền nhưng đơn vẫn "Chưa thanh toán" | Khách tắt trình duyệt trước khi quay về **và** IPN chưa được cấu hình (thường gặp ở localhost). Xem bảng `Payment` để tra cứu |
| "Số tiền quá nhỏ để thanh toán online" | VNPay không nhận giao dịch dưới 5.000đ |

## 9. Câu hỏi tự kiểm tra

1. Vì sao trang `PaymentResult` không tự đọc `vnp_ResponseCode=00` trên URL để báo thành công?
2. Nếu IPN và return đến cùng lúc, điều gì ngăn đơn bị ghi nhận hai lần?
3. Vì sao `vnp_Amount` phải nhân 100?
4. Khách bấm thanh toán, hủy, rồi bấm thanh toán lại: bảng `Payment` có mấy dòng, và mỗi dòng ở trạng thái gì?
