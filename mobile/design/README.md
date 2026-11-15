# Ảnh thiết kế từ Stitch

Mỗi màn hình Stitch sinh ra thì lưu vào đây, **đặt tên theo mã màn** trong docs/16:

- `S04.png`: ảnh chụp màn Trang chủ
- `S05.png`, `S05-sort.png`, `S05-empty.png`: màn Thực đơn và các biến thể (bottom sheet sắp xếp, trạng thái trống)
- `S04.html`: (không bắt buộc) mã HTML Stitch xuất ra, để tra cỡ chữ, khoảng cách

Đầu mỗi file màn hình trong `lib/screens/` có dòng `// Thiết kế: design/S05.png` trỏ về đây.
Thư mục này chỉ để tham khảo khi code, app không dùng tới (không khai báo trong `pubspec.yaml`).
