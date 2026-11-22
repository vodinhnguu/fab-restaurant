// Kiểm tra định dạng (mục 2.4 docs/16) và kiểm tra ô nhập (bảng "Kiểm tra" từng màn).

import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/utils/format.dart';
import 'package:fab_seafood/utils/validators.dart';

void main() {
  group('Định dạng', () {
    test('Tiền: dấu chấm ngăn nghìn, chữ đ liền sau', () {
      expect(formatMoney(850000), '850.000đ');
      expect(formatMoney(20000), '20.000đ');
      expect(formatMoney(0), '0đ');
      expect(formatMoney(null), '0đ');
      expect(formatMoney(-50000), '-50.000đ');
    });

    test('Giờ UTC của API hiện theo giờ Việt Nam', () {
      final createdAt = parseApiDate('2026-10-27T12:05:00.000Z'); // 19:05 giờ VN
      expect(formatDateTime(createdAt), '19:05 27/10/2026');
      expect(formatDate(createdAt), '27/10/2026');
      expect(formatTime(createdAt), '19:05');
      // 20:00 UTC = 03:00 sáng hôm sau ở VN
      expect(formatDate(DateTime.utc(2026, 10, 27, 20)), '28/10/2026');
    });

    test('Thứ viết tắt cho dải chọn ngày', () {
      expect(formatShortDay(DateTime.utc(2026, 10, 26, 5)), 'T2 26/10'); // thứ Hai
      expect(formatShortDay(DateTime.utc(2026, 11, 1, 5)), 'CN 01/11'); // Chủ nhật
    });

    test('Thời gian tương đối', () {
      final now = DateTime.utc(2026, 11, 15, 12);
      expect(timeAgo(now.subtract(const Duration(seconds: 20)), now: now), 'vừa xong');
      expect(timeAgo(now.subtract(const Duration(minutes: 5)), now: now), '5 phút trước');
      expect(timeAgo(now.subtract(const Duration(days: 3)), now: now), '3 ngày trước');
      expect(timeAgo(now.subtract(const Duration(days: 65)), now: now), '2 tháng trước');
    });

    test('Ảnh: /uploads ghép địa chỉ server, http giữ nguyên, trống → null', () {
      expect(imageUrl('/uploads/a.jpg'), endsWith(':4000/uploads/a.jpg'));
      expect(imageUrl('https://images.unsplash.com/x'), 'https://images.unsplash.com/x');
      expect(imageUrl(''), isNull);
      expect(imageUrl(null), isNull);
    });
  });

  group('Kiểm tra ô nhập', () {
    test('Số điện thoại: 0 hoặc +84 rồi 9–10 số, bỏ dấu cách', () {
      expect(Validators.phone('0901234567'), isNull);
      expect(Validators.phone('090 123 4567'), isNull);
      expect(Validators.phone('+84901234567'), isNull);
      expect(Validators.phone('12345'), 'Số điện thoại không hợp lệ');
      expect(Validators.phone(''), 'Vui lòng nhập số điện thoại');
      expect(Validators.phone('', required: false), isNull);
      expect(Validators.normalizePhone('090.123-4567'), '0901234567');
    });

    test('Email', () {
      expect(Validators.email('khach@fab.vn'), isNull);
      expect(Validators.email('khach@fab'), 'Email không hợp lệ');
      expect(Validators.email(''), 'Vui lòng nhập email');
      expect(Validators.email('', required: false), isNull);
    });

    test('Họ tên, mật khẩu', () {
      expect(Validators.name('A'), 'Tối thiểu 2 ký tự');
      expect(Validators.name('  '), 'Vui lòng nhập họ tên');
      expect(Validators.name('An'), isNull);
      expect(Validators.newPassword('12345'), 'Tối thiểu 6 ký tự');
      expect(Validators.newPassword('123456'), isNull);
      expect(Validators.confirmPassword('123', '1234'), 'Mật khẩu không khớp');
      expect(Validators.loginPassword(''), 'Vui lòng nhập mật khẩu');
    });
  });
}
