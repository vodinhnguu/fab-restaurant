# 26. Mỗi lần chạy app thì làm gì

Quy trình ngắn cho **máy Windows hiện tại** (Postgres 18 cài sẵn, 7,7 GB RAM). Làm đúng thứ tự 1 → 2 → 3.

## 1. Dọn bộ nhớ trước (máy chỉ 7,7 GB RAM)

- Tắt **Docker Desktop** và **WSL** nếu đang bật (chúng ăn ~3 GB và dự án này **không cần** Docker).
- Đóng bớt Chrome / Zalo / Cursor nếu định mở máy ảo Android.
- **Không** chạy `docker compose up -d` trên máy này (database trong Docker là trống, dễ nối nhầm).

## 2. Bật backend + web

```bash
cd d:/fab-restaurant
npm run dev
```

- Backend: http://localhost:4000 — Web: http://localhost:5173
- `npm run dev` tự kiểm tra database (`check-db.js`): tự cập nhật bảng khi cần, **không** xóa dữ liệu.
- Thấy dòng `[db] ✖` → đọc gợi ý ngay dưới nó (thường là dịch vụ `postgresql-x64-18` chưa bật: mở `services.msc` → start).
- **Đừng** chạy `npm run setup` nữa: lệnh đó xóa hết 91 đơn + 16 tài khoản đang có.
- Cứ để terminal này mở suốt. Muốn xóa bộ đếm chặn đăng nhập (lỗi 429) thì Ctrl+C rồi `npm run dev` lại.

## 3. Bật app nhân viên (Flutter)

Mở **terminal thứ hai** (terminal 1 đang chạy `npm run dev`).

### Cách A — máy ảo Android, bản release (nên dùng, mở app 2–5 giây)

```bash
cd d:/fab-restaurant/mobile
flutter build apk --release --target-platform android-x64   # ~5 phút, chỉ chạy lại khi đã sửa code
adb install -r "D:/fab-restaurant/mobile/build/app/outputs/flutter-apk/app-release.apk"
```

Rồi bấm icon app trên máy ảo. Không sửa code thì **bỏ qua 2 lệnh này**, mở app luôn.

> Trên Git Bash phải dùng đường dẫn kiểu `D:/...` cho `adb`, viết `/d/...` sẽ báo `failed to stat`.

### Cách B — vừa sửa code vừa xem (hot reload, nhưng chậm, mở app 10–30 giây)

```bash
cd d:/fab-restaurant/mobile
flutter run
```

Sửa code → bấm `r` để hot reload, `R` restart, `q` thoát.

### Cách C — xem nhanh trên Chrome (không cần máy ảo)

```bash
cd d:/fab-restaurant/mobile
flutter run -d chrome --dart-define=API_URL=http://localhost:4000/api/v1
```

### Chạy trên điện thoại thật (cùng Wi-Fi)

Lấy IP máy tính (`ipconfig` → IPv4), rồi:

```bash
flutter run --dart-define=API_URL=http://192.168.1.10:4000/api/v1
```

Mặc định app gọi `http://10.0.2.2:4000/api/v1` — đó là `localhost` của máy tính khi nhìn từ máy ảo Android, nên máy ảo không cần `--dart-define`.

## 4. Đăng nhập thử

App nhân viên: `phucvu@fab.vn` / `123456` (ghi món tại bàn). Web thu ngân: `thungan@fab.vn` / `123456`. Danh sách đầy đủ xem bảng tài khoản demo trong [CLAUDE.md](../CLAUDE.md).

## 5. Khi xong

- Terminal `npm run dev`: Ctrl+C.
- Máy ảo: đóng cửa sổ Android Emulator cho nhẹ máy.
- Dữ liệu thử (đơn, lịch đặt bàn) tạo trong lúc test thì xóa đi.

## Hay gặp

| Hiện tượng | Cách xử lý |
|---|---|
| App "Không nối được máy chủ" | Terminal 1 còn chạy `npm run dev` không? Máy ảo thì URL phải là `10.0.2.2`, không phải `localhost` |
| Đăng nhập báo sai mật khẩu với `bep@fab.vn`... | `npm --prefix backend run db:seed-staff` |
| Thực đơn còn món cũ | `npm --prefix backend run db:seed-menu` |
| Lỗi 429 khi đăng nhập | Sai mật khẩu quá 20 lần/15 phút → khởi động lại backend |
| `prisma generate` lỗi EPERM | Tắt `npm run dev` trước rồi generate lại |
| App mở rất chậm | Bản debug + máy yếu, không phải lỗi code → dùng bản release (Cách A) |
