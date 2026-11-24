// S17 Kiểm bia nước: docs/29-kiem-bia-nuoc.md
// Kiểm: xuất / bán / trả lại từng loại, dấu lệch (âm = thiếu, dương = thừa), tổng kết ngày,
//       sheet nhập số thùng tính lại lệch trước khi lưu, gửi PUT đúng, tài khoản chỉ xem.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/app/routes.dart';

import '../helpers/test_app.dart';

void main() {
  group('S17 Kiểm bia nước', () {
    testWidgets('hiện xuất / bán / trả lại và dấu lệch từng loại', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.drinks, token: 'abc', me: quanLyJson);

      // Tổng kết ngày: tổng lệch −8 → thiếu
      expect(find.text('Thiếu 8 lon / chai'), findsOneWidget);
      expect(find.text('Đã kiểm 2/3 loại · 1 loại lệch'), findsOneWidget);
      expect(find.text('Cả ngày: xuất 72 · bán 20 · trả lại 48'), findsOneWidget);

      // Bia Tiger: xuất 48 (2 thùng), bán 10, trả lại 30 → thiếu 8
      expect(find.text('Bia Tiger'), findsOneWidget);
      expect(find.text('Thùng 24 lon'), findsWidgets);
      expect(find.text('thiếu 8 lon'), findsOneWidget);
      expect(find.text('48'), findsOneWidget);
      expect(find.text('2 thùng'), findsOneWidget);
      expect(find.text('Ghi chú: 2 lon bị móp'), findsOneWidget);
      expect(find.text('Người kiểm: Đỗ Thu Ngân'), findsWidgets);

      // Coca-Cola: khớp
      expect(find.text('khớp'), findsOneWidget);
      // Heineken: chưa ghi phiếu
      expect(find.text('chưa kiểm'), findsOneWidget);
    });

    testWidgets('mở sheet, đổi số thùng thì tính lại lệch, lưu gửi PUT đúng', (tester) async {
      final server = await pumpApp(tester, initialLocation: AppRoutes.drinks, token: 'abc', me: quanLyJson);

      await tester.tap(find.text('Bia Tiger'));
      await tester.pumpAndSettle();

      // Sheet mở với số đang lưu: 2 thùng, trả lại 30, đã bán 10 → thiếu 8
      expect(find.text('Thùng 24 lon · đã bán theo đơn: 10 lon'), findsOneWidget);
      expect(find.text('Thiếu 8 lon'), findsOneWidget);
      expect(find.text('bán 10 + trả lại 30 − xuất 48 = -8'), findsOneWidget);

      // Bớt 1 thùng (còn 1 thùng = 24 lon) → bán 10 + trả 30 − 24 = +16 → thừa
      await tester.tap(find.byIcon(Icons.remove_rounded).first);
      await tester.pumpAndSettle();
      expect(find.text('Thừa 16 lon'), findsOneWidget);
      expect(find.text('bán 10 + trả lại 30 − xuất 24 = +16'), findsOneWidget);

      await tester.tap(find.widgetWithText(FilledButton, 'Lưu phiếu kiểm'));
      await tester.pumpAndSettle();

      final sent = server.requests.where((r) => r.method == 'PUT' && r.path == '/drinks/check').toList();
      expect(sent, hasLength(1));
      expect(sent.single.data, {
        'productId': 8,
        'issuedPacks': 1,
        'issuedUnits': 0,
        'returnedUnits': 30,
        'note': '2 lon bị móp',
      });
    });

    testWidgets('tài khoản chỉ xem: không mở được sheet, có dòng nhắc quyền', (tester) async {
      // Tổ trưởng mẫu: chỉ Xem DRINKS (không Sửa)
      final me = {
        ...quanLyJson,
        'staffRole': {'id': 6, 'key': 'TEAM_LEAD', 'name': 'Tổ trưởng'},
        'permissions': {
          ...(quanLyJson['permissions']! as Map<String, Object?>),
          'DRINKS': {'view': true, 'create': false, 'edit': false, 'delete': false},
        },
      };
      await pumpApp(tester, initialLocation: AppRoutes.drinks, token: 'abc', me: me);

      expect(find.textContaining('Tài khoản của bạn chỉ xem'), findsOneWidget);
      await tester.tap(find.text('Bia Tiger'));
      await tester.pumpAndSettle();
      expect(find.text('Lưu phiếu kiểm'), findsNothing); // sheet không mở
    });

    testWidgets('không có quyền DRINKS: bị chặn, có nút về Sơ đồ bàn', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.drinks, token: 'abc'); // phục vụ

      expect(find.text('Tài khoản của bạn không xem được phiếu kiểm bia nước'), findsOneWidget);
      await tester.tap(find.widgetWithText(FilledButton, 'Về sơ đồ bàn'));
      await tester.pumpAndSettle();
      expect(find.text('Sơ đồ bàn'), findsWidgets);
    });
  });
}
