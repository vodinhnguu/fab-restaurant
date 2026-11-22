// S03 chọn khu → bàn; S04 đơn của bàn: trạng thái món, Check món (S12), Hủy món (S13), Order,
// Gửi thanh toán (S09) / Rút lại, Hủy cả đơn, nút theo quyền.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/app/routes.dart';

import '../helpers/test_app.dart';

/// Mở S04 bàn T02, [order] thay đơn mặc định (vd đã gửi thanh toán).
Future<dynamic> openT02(WidgetTester tester, {Map<String, Object?>? order, Map<String, Object?>? me, FakeRoute? api}) =>
    pumpApp(
      tester,
      initialLocation: AppRoutes.table(2),
      token: 'abc',
      me: me,
      api: (req) {
        final custom = api?.call(req);
        if (custom != null) return custom;
        if (order != null && req.method == 'GET' && req.path == '/dine-in/tables/2') {
          return ok({'table': tableDetailJson(2)['table'], 'order': order});
        }
        // Mọi API thao tác trả lại bàn (giống backend)
        if (req.method != 'GET' && req.path.startsWith('/dine-in/')) return ok(tableDetailJson(2));
        return null;
      },
    );

/// Đơn T02 gọi thêm 1 tôm hùm bán theo kg (giá 1 kg 1.890.000đ). weight = null: chưa cân.
Map<String, Object?> orderWithLobster({String status = 'WEIGHING', double? weight}) => {
      ...openOrderJson,
      'items': [
        ...openOrderJson['items'] as List,
        {
          'id': 4,
          'dishId': 9,
          'name': 'Tôm hùm nướng phô mai',
          'price': 1890000,
          'quantity': 1,
          'status': status,
          'weight': weight,
          'note': null,
          'createdAt': '2026-11-20T12:50:00.000Z',
          'dish': {'image': null, 'slug': 'tom-hum-nuong-pho-mai'},
        },
      ],
    };

/// Chỉ tìm trong bottom sheet đang mở (S04 phía sau cũng có tên món giống vậy).
Finder inSheet(Finder finder) => find.descendant(of: find.byType(BottomSheet), matching: finder);

Future<void> tapAction(WidgetTester tester, String label) async {
  await tester.tap(find.widgetWithText(OutlinedButton, label));
  await tester.pumpAndSettle();
}

void main() {
  group('S03 Sơ đồ bàn', () {
    testWidgets('Chọn khu: mặc định khu đầu tiên, bấm khu khác thì hiện bàn của khu đó', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.tables, token: 'abc');

      expect(find.text('Chọn khu'), findsOneWidget);
      expect(find.text('1/2 có khách'), findsOneWidget); // Trong nhà
      expect(find.text('T01'), findsOneWidget);
      expect(find.text('T02'), findsOneWidget);
      expect(find.text('B05'), findsNothing);
      expect(find.text('3 chưa ra'), findsOneWidget); // T02 còn 3 phần chưa ra bàn

      await tester.tap(find.text('Ngoài trời - view biển'));
      await tester.pumpAndSettle();
      expect(find.text('B05'), findsOneWidget);
      expect(find.text('T02'), findsNothing);
    });

    testWidgets('Bàn đã gửi thanh toán: ô bàn "Chờ thu tiền", ô khu đếm số bàn chờ thanh toán', (tester) async {
      final floor = [
        {
          ...floorJson[0],
          'tables': [
            (floorJson[0]['tables'] as List)[0],
            {
              ...((floorJson[0]['tables'] as List)[1] as Map<String, Object?>),
              'order': {
                ...(((floorJson[0]['tables'] as List)[1] as Map)['order'] as Map<String, Object?>),
                'billRequestedAt': '2026-11-20T13:15:00.000Z',
              },
            },
          ],
        },
        floorJson[1],
      ];
      await pumpApp(
        tester,
        initialLocation: AppRoutes.tables,
        token: 'abc',
        api: (req) => req.path == '/dine-in/tables' ? ok(floor) : null,
      );

      expect(find.text('Chờ thu tiền'), findsOneWidget);
      expect(find.text('1 chờ thanh toán'), findsOneWidget);
    });
  });

  group('S04 Đơn của bàn', () {
    testWidgets('Hiện món theo lần gửi bếp, nhãn trạng thái, món hủy kèm lý do, tạm tính', (tester) async {
      await openT02(tester);

      expect(find.text('Bàn T02'), findsOneWidget);
      expect(find.text('Lần 1 · 19:05'), findsOneWidget);
      expect(find.text('Lần 2 · 19:40'), findsOneWidget);
      expect(find.text('Chờ bếp'), findsOneWidget);
      expect(find.text('Bếp đang làm'), findsOneWidget);
      expect(find.text('Đã hủy'), findsOneWidget);
      expect(find.text('Lý do hủy: Khách đổi món'), findsOneWidget);
      expect(find.text('3 món · 3 món chưa ra bàn'), findsOneWidget);
      expect(find.text('820.000đ'), findsOneWidget);
      for (final label in ['Check món', 'Hủy món', 'Order']) {
        expect(find.widgetWithText(OutlinedButton, label), findsOneWidget);
      }
      expect(find.text('Gửi thanh toán · 820.000đ'), findsOneWidget);
    });

    testWidgets('Check món: tick món đã ra bàn → gửi đúng món; bỏ tick món đã ra → served: false', (tester) async {
      final server = await openT02(tester, order: openOrderWith(itemStatus: {2: 'SERVED'}));

      await tapAction(tester, 'Check món');
      expect(find.text('Check món bàn T02'), findsOneWidget);
      expect(find.text('Chưa đổi gì'), findsOneWidget);

      final boxes = find.byType(Checkbox);
      expect(boxes, findsNWidgets(2)); // món đã hủy không có trong danh sách
      await tester.tap(boxes.at(0)); // Tôm sú: tick
      await tester.tap(boxes.at(1)); // Sashimi (đã ra bàn): bỏ tick
      await tester.pump();
      await tapButton(tester, 'Lưu (2 món)');

      final calls = sent(server, 'POST', '/dine-in/items/serve').map((r) => r.data).toList();
      expect(calls, [
        {'itemIds': [1], 'served': true},
        {'itemIds': [2], 'served': false},
      ]);
      expect(find.text('Đã cập nhật món ra bàn'), findsOneWidget);
    });

    testWidgets('Hủy món "Chờ bếp": hủy bớt 1 trong 2 phần, không cần lý do', (tester) async {
      final server = await openT02(tester);

      await tapAction(tester, 'Hủy món');
      await tester.tap(inSheet(find.text('Tôm sú hấp bia')));
      await tester.pumpAndSettle();
      expect(find.text('Lý do hủy (không bắt buộc)'), findsOneWidget);
      expect(find.text('Hủy 2 × Tôm sú hấp bia'), findsOneWidget); // mặc định hủy cả dòng

      await tester.tap(find.byIcon(Icons.remove_rounded).last); // bớt còn 1 phần
      await tester.pump();
      await tapButton(tester, 'Hủy 1 × Tôm sú hấp bia');

      expect(sent(server, 'POST', '/dine-in/items/1/cancel').single.data, {'quantity': 1});
      expect(find.text('Đã hủy 1 × Tôm sú hấp bia'), findsOneWidget);
    });

    testWidgets('Hủy món "Bếp đang làm": bắt buộc lý do, chip lý do điền nhanh', (tester) async {
      final server = await openT02(tester);

      await tapAction(tester, 'Hủy món');
      await tester.tap(inSheet(find.text('Sashimi cá hồi Na Uy')));
      await tester.pumpAndSettle();
      expect(find.text('Lý do hủy (bắt buộc)'), findsOneWidget);
      expect(find.text('Bếp đã làm món này nên phải ghi lý do'), findsOneWidget);
      final submit = find.widgetWithText(FilledButton, 'Hủy 1 × Sashimi cá hồi Na Uy');
      expect(tester.widget<FilledButton>(submit).onPressed, isNull); // chưa có lý do thì khóa nút

      await tester.tap(find.widgetWithText(ActionChip, 'Khách không chờ được'));
      await tester.pump();
      await tapButton(tester, 'Hủy 1 × Sashimi cá hồi Na Uy');

      expect(sent(server, 'POST', '/dine-in/items/2/cancel').single.data, {'reason': 'Khách không chờ được'});
    });

    testWidgets('Hủy món: backend báo lỗi → hiện ngay trong sheet', (tester) async {
      await openT02(
        tester,
        api: (req) => req.path == '/dine-in/items/1/cancel' ? apiError(400, 'Đơn của bàn này đã thanh toán hoặc đã hủy') : null,
      );

      await tapAction(tester, 'Hủy món');
      await tester.tap(inSheet(find.text('Tôm sú hấp bia')));
      await tester.pumpAndSettle();
      await tapButton(tester, 'Hủy 2 × Tôm sú hấp bia');

      expect(find.text('Đơn của bàn này đã thanh toán hoặc đã hủy'), findsOneWidget);
      expect(find.text('Hủy món bàn T02'), findsOneWidget); // sheet vẫn mở
    });

    testWidgets('Gửi thanh toán: xem lại bill, nhắc món chưa ra, gửi xong về sơ đồ bàn', (tester) async {
      final server = await openT02(tester);

      await tapButton(tester, 'Gửi thanh toán · 820.000đ');
      expect(find.text('Gửi thanh toán bàn T02'), findsOneWidget);
      expect(find.textContaining('Còn 3 món chưa ra bàn'), findsOneWidget);
      expect(inSheet(find.text('Bia tươi')), findsNothing); // món đã hủy không có trong bill
      await tester.tap(find.widgetWithText(FilledButton, 'Gửi thanh toán'));
      await tester.pumpAndSettle();

      expect(sent(server, 'POST', '/dine-in/orders/50/bill-request'), hasLength(1));
      expect(find.text('Đã gửi thanh toán bàn T02 cho thu ngân'), findsOneWidget);
      expect(find.text('Sơ đồ bàn'), findsOneWidget);
    });

    testWidgets('Món theo kg "Chờ cân": chưa tính tiền, khóa "Gửi thanh toán"', (tester) async {
      await openT02(tester, order: orderWithLobster());

      await tester.scrollUntilVisible(find.text('1.890.000đ/kg · hồ hải sản đang cân'), 200);
      expect(find.text('Chờ cân'), findsNWidgets(2)); // nhãn trạng thái + chỗ tiền
      await tapButton(tester, 'Gửi thanh toán · 820.000đ');
      expect(find.text('Còn 1 món bán theo kg chưa cân. Nhờ hồ hải sản cân xong mới gửi thanh toán được.'), findsOneWidget);
      expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Gửi thanh toán')).onPressed, isNull);
    });

    testWidgets('Món theo kg "Chờ cân" có số kg phục vụ ghi: hiện số kg + tiền tạm, vẫn khóa "Gửi thanh toán"', (tester) async {
      // Backend đã cộng tiền tạm 1 kg vào đơn: 820.000 + 1.890.000
      await openT02(tester, order: {...orderWithLobster(weight: 1), 'total': 2710000});

      await tester.scrollUntilVisible(find.text('Ghi 1 kg × 1.890.000đ/kg · chờ hồ hải sản cân'), 200);
      expect(find.text('1.890.000đ'), findsOneWidget); // chỗ tiền: tiền tạm, không còn "Chờ cân"
      expect(find.text('Chờ cân'), findsOneWidget); // chỉ còn nhãn trạng thái
      await tapButton(tester, 'Gửi thanh toán · 2.710.000đ');
      expect(find.text('Còn 1 món bán theo kg chưa cân. Nhờ hồ hải sản cân xong mới gửi thanh toán được.'), findsOneWidget);
      expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Gửi thanh toán')).onPressed, isNull);
    });

    testWidgets('Món theo kg đã cân: hiện số kg và tiền = giá 1 kg × số kg', (tester) async {
      await openT02(tester, order: orderWithLobster(status: 'PENDING', weight: 1.25));

      await tester.scrollUntilVisible(find.text('Đã cân 1,25 kg × 1.890.000đ/kg'), 200);
      expect(find.text('2.362.500đ'), findsOneWidget);
    });

    testWidgets('Đã gửi thanh toán: khung cam + "Rút yêu cầu thanh toán" gọi DELETE', (tester) async {
      final server = await openT02(tester, order: openOrderWith(fields: {'billRequestedAt': '2026-11-20T13:15:00.000Z'}));

      expect(find.text('Đã gửi thanh toán lúc 20:15'), findsOneWidget);
      expect(find.text('Gửi thanh toán · 820.000đ'), findsNothing);
      await tapButton(tester, 'Rút yêu cầu thanh toán');

      expect(sent(server, 'DELETE', '/dine-in/orders/50/bill-request'), hasLength(1));
      expect(find.text('Đã rút yêu cầu thanh toán'), findsOneWidget);
    });

    testWidgets('Hủy cả đơn: bắt buộc lý do, gửi PATCH CANCELLED, về sơ đồ', (tester) async {
      final server = await openT02(
        tester,
        api: (req) => req.method == 'PATCH' && req.path == '/orders/50/status' ? ok({'id': 50}) : null,
      );

      await tester.tap(find.byType(PopupMenuButton<String>));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Hủy cả đơn').last);
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(TextButton, 'Hủy cả đơn'));
      await tester.pump();
      expect(find.text('Vui lòng nhập lý do hủy'), findsOneWidget);

      await tester.enterText(find.byType(TextFormField), 'Khách bỏ về');
      await tester.tap(find.widgetWithText(TextButton, 'Hủy cả đơn'));
      await tester.pumpAndSettle();

      expect(sent(server, 'PATCH', '/orders/50/status').single.data, {'status': 'CANCELLED', 'reason': 'Khách bỏ về'});
      expect(find.text('Sơ đồ bàn'), findsOneWidget);
    });

    testWidgets('Order (gọi thêm): gắn phiếu vào bàn rồi mở S05', (tester) async {
      await openT02(tester);

      await tapAction(tester, 'Order');
      expect(find.text('Ghi món'), findsOneWidget);
      expect(find.text('Bàn T02'), findsOneWidget);
    });

    testWidgets('Thu ngân: có Check món / Hủy món / Gửi thanh toán, KHÔNG có Order', (tester) async {
      await openT02(tester, me: thuNganJson);

      expect(find.widgetWithText(OutlinedButton, 'Check món'), findsOneWidget);
      expect(find.widgetWithText(OutlinedButton, 'Order'), findsNothing);
    });

    testWidgets('Bếp (chỉ xem): không có nút thao tác nào', (tester) async {
      await openT02(tester, me: bepJson);

      expect(find.text('Món đã gọi (3 món)'), findsOneWidget);
      expect(find.widgetWithText(OutlinedButton, 'Check món'), findsNothing);
      expect(find.textContaining('Gửi thanh toán'), findsNothing);
    });

    testWidgets('Bàn trống: "Bàn đang trống" + "Ghi món"', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.table(1), token: 'abc');

      expect(find.text('Bàn đang trống'), findsOneWidget);
      await tapButton(tester, 'Ghi món');
      expect(find.text('Ghi món'), findsWidgets); // S05
    });
  });
}
