# 25. Giao diện trang khách: làm nổi bật web

Ngày 22/11/2026 trang khách (web) được làm nổi bật hơn để khách vào là thấy ngay món đinh và cách đặt bàn. Chỉ sửa giao diện, không đổi API hay database.

| Thay đổi | Ở đâu | File |
|---|---|---|
| **Thanh thông tin trên cùng** (nền xanh đậm): "Hải sản sống tại hồ mỗi ngày · chọn con, cân tại chỗ", giờ mở cửa, hotline bấm là gọi | Mọi trang khách, trên thanh menu (cuộn xuống thì trôi đi, menu vẫn dính trên cùng) | [TopBar.jsx](../frontend/src/components/layout/TopBar.jsx) |
| **Nút liên hệ luôn thấy**: máy tính có nút nổi góc dưới phải "Đặt bàn" + nút tròn gọi hotline (vòng sóng nhấp nháy); điện thoại có thanh cố định ở đáy "Gọi ngay \| Đặt bàn" (nút nổi sẽ che chữ trên màn nhỏ). Đang ở trang Đặt bàn thì ẩn nút Đặt bàn | Mọi trang khách | [FloatingContact.jsx](../frontend/src/components/layout/FloatingContact.jsx), `pb-16` trong [CustomerLayout.jsx](../frontend/src/components/layout/CustomerLayout.jsx) chừa chỗ cho thanh đáy |
| **Ảnh bìa mới**: ảnh phóng to rất chậm, 2 nhãn (Biển Mỹ Khê · Chọn con tại hồ, cân tại chỗ), nút chính **Đặt bàn ngay** (món theo kg phải tới quán), nút phụ Xem thực đơn, dải số liệu thật (số món, số nhóm lấy từ API danh mục; giờ mở cửa từ `/info`) | Trang chủ | [Home.jsx](../frontend/src/pages/Home.jsx) |
| **Thẻ món đinh** kính mờ, bồng bềnh bên phải ảnh bìa (màn rộng): món Best seller bán theo kg đắt nhất (thường là Tôm hùm nướng phô mai), bấm vào mở chi tiết món | Trang chủ | hàm `SignatureCard` cuối [Home.jsx](../frontend/src/pages/Home.jsx) |
| **Khu "Chọn con nào, cân con đó"**: 3 bước Chọn con tại hồ → Cân trước mặt bạn → Chế biến theo ý, nút "Đặt bàn để chọn hải sản". Đây là điểm khác biệt của quán (món bán theo kg, [docs/24](24-thuc-don-ban-theo-kg.md)) | Trang chủ, ngay sau khối Best seller | mảng `STEPS` đầu [Home.jsx](../frontend/src/pages/Home.jsx) |
| **Hiện dần khi cuộn**: danh mục, ưu đãi, về chúng tôi, đánh giá, đặt bàn, 3 bước (lần lượt từng thẻ) | Trang chủ | [Reveal.jsx](../frontend/src/components/Reveal.jsx) + class `.reveal` trong [index.css](../frontend/src/index.css) |
| Thẻ đánh giá: icon trích dẫn, avatar chữ cái đầu, nổi lên khi rê chuột; "Về chúng tôi" ghi đúng số món trong thực đơn | Trang chủ | [Home.jsx](../frontend/src/pages/Home.jsx) |

## Hiệu ứng (CSS)

Khai báo cuối [frontend/src/index.css](../frontend/src/index.css):

| Class | Làm gì |
|---|---|
| `animate-slow-zoom` | Phóng to 1 → 1,08 trong 20 giây rồi thu lại (ảnh bìa) |
| `animate-float` | Lên xuống 10px mỗi 6 giây (thẻ món đinh) |
| `reveal` / `reveal is-visible` | Mờ + thấp 28px → rõ, đúng chỗ trong 0,7 giây. Component `Reveal` tự thêm `is-visible` khi khối cuộn vào màn hình (IntersectionObserver); trình duyệt không hỗ trợ thì hiện luôn |

Máy bật **giảm chuyển động** (cài đặt trợ năng của Windows / điện thoại) thì cả 3 hiệu ứng và vòng sóng nút gọi đều tắt.

Dùng `Reveal` cho khối mới:

```jsx
import Reveal from '../components/Reveal';

<Reveal as="section" className="container-page mt-20">...</Reveal>   // cả khối hiện dần
<Reveal delay={150}>...</Reveal>                                      // trễ 150ms, cho các thẻ hiện lần lượt
```

## Muốn sửa gì

| Muốn sửa | File |
|---|---|
| Câu trên thanh thông tin trên cùng | [TopBar.jsx](../frontend/src/components/layout/TopBar.jsx) |
| Hotline, giờ mở cửa (thanh trên cùng, nút gọi, dải số liệu) | `phone`, `openingHours` ở [backend/src/config/restaurant.js](../backend/src/config/restaurant.js) |
| Chữ / icon 3 bước "Chọn con tại hồ" | Mảng `STEPS` ở [Home.jsx](../frontend/src/pages/Home.jsx) |
| Món hiện trên thẻ nổi ảnh bìa | Biến `signature` trong `Home()`: món Best seller bán theo kg đắt nhất. Muốn món khác thì bật / tắt ô Best seller ở trang admin Món ăn |
| Tốc độ hiệu ứng | Các `@keyframes` và `.reveal` cuối [index.css](../frontend/src/index.css) |
| Bỏ nút nổi / thanh đáy | Xóa `<FloatingContact />` và `pb-16 sm:pb-0` trong [CustomerLayout.jsx](../frontend/src/components/layout/CustomerLayout.jsx) |

## Đã kiểm tra (22/11)

- `npx oxlint src` không lỗi, `npx vite build` chạy được.
- Chụp trang chủ khổ 1280px và khổ điện thoại 390px (giả lập thiết bị): không tràn ngang, thanh đáy không che chữ, dải số liệu "10h-22h" nằm 1 dòng.
