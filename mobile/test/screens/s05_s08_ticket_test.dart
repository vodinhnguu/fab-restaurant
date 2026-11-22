// S05 → S08: thêm món vào phiếu gọi món của bàn, gửi bếp (dữ liệu gửi đi, xóa phiếu, về S04), lỗi giữ phiếu,
// phiếu đang ghi cho bàn khác; 3 nút dưới S08: "Hủy order", "Cất order", "Gửi bếp".

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/app/routes.dart';
import 'package:fab_seafood/state/cart_state.dart';
import 'package:fab_seafood/widgets/floating_cart_bar.dart';
import 'package:fab_seafood/widgets/quantity_stepper.dart';

import '../helpers/test_app.dart';

/// Phiếu có sẵn trên máy: 2 Tôm sú (ghi chú "Ít cay") + 1 Sashimi, của bàn [tableId].
Map<String, Object> ticketPrefs({int tableId = 2, String code = 'T02'}) => {
      'ticket': jsonEncode([
        {'dishId': 1, 'name': 'Tôm sú hấp bia', 'slug': 'tom-su-hap-bia', 'price': 250000, 'quantity': 2, 'note': 'Ít cay'},
        {'dishId': 2, 'name': 'Sashimi cá hồi Na Uy', 'slug': 'sashimi-ca-hoi-na-uy', 'price': 320000, 'quantity': 1, 'note': ''},
      ]),
      'ticketTable': jsonEncode({'id': tableId, 'code': code}),
    };

Future<void> confirmDialog(WidgetTester tester, String label) async {
  await tester.tap(find.descendant(of: find.byType(AlertDialog), matching: find.text(label)));
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('S05: nút "+" thêm món vào phiếu, thanh phiếu nổi hiện bàn + số món, mở S08', (tester) async {
    await pumpApp(
      tester,
      initialLocation: AppRoutes.menu(2),
      token: 'abc',
      prefs: {'ticketTable': jsonEncode({'id': 2, 'code': 'T02'})},
    );
    expect(find.text('Ghi món'), findsOneWidget);
    expect(find.byType(FloatingCartBar), findsOneWidget);
    expect(find.text('Xem phiếu'), findsNothing); // phiếu trống thì ẩn thanh

    await tester.tap(find.byIcon(Icons.add_rounded).first); // Tôm sú hấp bia
    await tester.pumpAndSettle();
    expect(find.text('Đã thêm "Tôm sú hấp bia" vào phiếu'), findsOneWidget);
    expect(appContainer(tester).read(cartProvider).single.dishId, 1);

    final bar = find.byType(FloatingCartBar);
    expect(find.descendant(of: bar, matching: find.text('Bàn T02 · 1 món')), findsOneWidget);
    expect(find.descendant(of: bar, matching: find.text('250.000đ')), findsOneWidget);

    await tester.tap(find.descendant(of: bar, matching: find.text('Xem phiếu')));
    await tester.pumpAndSettle();
    expect(find.text('Phiếu gọi món'), findsOneWidget);
    expect(find.text('Bàn T02'), findsOneWidget);
  });

  testWidgets('S08 "Gửi bếp": hỏi lại, gửi đúng món + ghi chú, xóa phiếu, về S04', (tester) async {
    final server = await pumpApp(
      tester,
      initialLocation: AppRoutes.ticket(2),
      token: 'abc',
      prefs: ticketPrefs(),
      api: (req) => req.method == 'POST' && req.path == '/dine-in/orders' ? ok(tableDetailJson(2)) : null,
    );
    expect(find.text('Tạm tính (3 món)'), findsOneWidget);
    expect(find.text('820.000đ'), findsOneWidget);

    await tapButton(tester, 'Gửi bếp');
    expect(find.text('Gửi 3 món cho bàn T02 xuống bếp?'), findsOneWidget);
    await confirmDialog(tester, 'Gửi bếp');

    expect(sent(server, 'POST', '/dine-in/orders').single.data, {
      'tableId': 2,
      'items': [
        {'dishId': 1, 'quantity': 2, 'note': 'Ít cay'},
        {'dishId': 2, 'quantity': 1}, // không có ghi chú thì không gửi trường note
      ],
    });
    expect(appContainer(tester).read(cartProvider), isEmpty);
    expect(find.text('Đã gửi bếp 3 món cho bàn T02'), findsOneWidget);
    expect(find.text('Món đã gọi (3 món)'), findsOneWidget); // S04
  });

  testWidgets('S08 bấm "Xem lại" thì không gửi', (tester) async {
    final server = await pumpApp(tester, initialLocation: AppRoutes.ticket(2), token: 'abc', prefs: ticketPrefs());

    await tapButton(tester, 'Gửi bếp');
    await confirmDialog(tester, 'Xem lại');

    expect(sent(server, 'POST', '/dine-in/orders'), isEmpty);
    expect(appContainer(tester).read(cartProvider), hasLength(2));
  });

  testWidgets('S08 backend báo món hết → báo lỗi, phiếu giữ nguyên để sửa', (tester) async {
    await pumpApp(
      tester,
      initialLocation: AppRoutes.ticket(2),
      token: 'abc',
      prefs: ticketPrefs(),
      api: (req) => req.method == 'POST' && req.path == '/dine-in/orders'
          ? apiError(400, 'Món "Tôm sú hấp bia" hiện đã hết')
          : null,
    );

    await tapButton(tester, 'Gửi bếp');
    await confirmDialog(tester, 'Gửi bếp');

    expect(find.text('Món "Tôm sú hấp bia" hiện đã hết'), findsOneWidget);
    expect(appContainer(tester).read(cartProvider), hasLength(2));
    expect(find.text('Phiếu gọi món'), findsOneWidget);
  });

  testWidgets('S08 phiếu đang ghi cho bàn khác → không cho gửi nhầm bàn', (tester) async {
    await pumpApp(
      tester,
      initialLocation: AppRoutes.ticket(2),
      token: 'abc',
      prefs: ticketPrefs(tableId: 1, code: 'T01'),
    );

    expect(find.text('Phiếu đang ghi cho bàn T01'), findsOneWidget);
    expect(find.text('Gửi bếp'), findsNothing);
  });

  testWidgets('S08 món theo kg: mặc định 1 kg, bấm số gõ 0,98, −/+ 0,1 kg, gõ số phần, gửi bếp kèm số kg', (tester) async {
    final server = await pumpApp(
      tester,
      initialLocation: AppRoutes.ticket(2),
      token: 'abc',
      prefs: {
        'ticket': jsonEncode([
          // Phiếu lưu từ bản cũ: chưa có số kg -> mặc định 1 kg
          {'dishId': 9, 'name': 'Tôm hùm nướng phô mai', 'slug': 'tom-hum-nuong-pho-mai', 'price': 1890000, 'unit': 'kg', 'quantity': 1, 'note': ''},
          {'dishId': 4, 'name': 'Cơm chiên hải sản', 'slug': 'com-chien-hai-san', 'price': 89000, 'unit': 'phần', 'quantity': 1, 'note': ''},
        ]),
        'ticketTable': jsonEncode({'id': 2, 'code': 'T02'}),
      },
      api: (req) => req.method == 'POST' && req.path == '/dine-in/orders' ? ok(tableDetailJson(2)) : null,
    );
    final dialog = find.byType(AlertDialog);
    Future<void> typeInDialog(String text) async {
      await tester.enterText(find.descendant(of: dialog, matching: find.byType(TextFormField)), text);
      await tester.tap(find.descendant(of: dialog, matching: find.text('Xong')));
      await tester.pumpAndSettle();
    }

    expect(find.text('1 kg'), findsOneWidget);
    expect(find.text('1.890.000đ / kg · hồ hải sản cân lại'), findsOneWidget);
    expect(find.text('1.890.000đ'), findsOneWidget); // tiền tạm của dòng tôm hùm
    expect(find.text('Tạm tính (2 món, món kg tính tạm)'), findsOneWidget);
    expect(find.text('1.979.000đ'), findsOneWidget);

    // Bấm vào "1 kg" -> gõ sai thì báo, hộp vẫn mở
    await tester.tap(find.text('1 kg'));
    await tester.pumpAndSettle();
    expect(find.descendant(of: dialog, matching: find.text('Số kg')), findsOneWidget);
    await typeInDialog('abc');
    expect(find.text('Nhập số, vd 0,98'), findsOneWidget);
    await typeInDialog('40');
    expect(find.text('Từ 0,05 đến 30 kg'), findsOneWidget);
    await typeInDialog('0,98'); // cân thật 0,98 kg
    expect(dialog, findsNothing);
    expect(find.text('0,98 kg'), findsOneWidget);
    expect(find.text('1.852.200đ'), findsOneWidget);
    expect(find.text('1.941.200đ'), findsOneWidget); // tạm tính đổi theo

    // −/+ đổi 0,1 kg (nút đầu tiên là của dòng tôm hùm)
    await tester.tap(find.byTooltip('Tăng').first);
    await tester.pumpAndSettle();
    expect(find.text('1,08 kg'), findsOneWidget);
    await tester.tap(find.byTooltip('Giảm').first);
    await tester.pumpAndSettle();
    expect(find.text('0,98 kg'), findsOneWidget);

    // Món theo phần cũng bấm số để gõ được (số nguyên)
    await tester.tap(find.descendant(of: find.byType(QuantityStepper), matching: find.text('1')));
    await tester.pumpAndSettle();
    await typeInDialog('1,5');
    expect(find.text('Số phần phải là số nguyên'), findsOneWidget);
    await typeInDialog('3');
    expect(find.text('267.000đ'), findsOneWidget);

    await tapButton(tester, 'Gửi bếp');
    expect(find.text('Gửi 4 món cho bàn T02 xuống bếp?'), findsOneWidget); // 1 dòng kg + 3 phần cơm
    await confirmDialog(tester, 'Gửi bếp');
    expect(sent(server, 'POST', '/dine-in/orders').single.data, {
      'tableId': 2,
      'items': [
        {'dishId': 9, 'quantity': 1, 'weight': 0.98},
        {'dishId': 4, 'quantity': 3}, // món theo phần không gửi số kg
      ],
    });
  });

  group('S08 Cất order / Hủy order', () {
    testWidgets('Cất order: lưu phiếu, về sơ đồ (bàn có dấu cất), mở lại bàn → "Mở order" → món hiện lại', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.ticket(2), token: 'abc', prefs: ticketPrefs());
      for (final label in ['Hủy order', 'Cất order', 'Gửi bếp']) {
        expect(find.text(label), findsOneWidget);
      }

      await tapButton(tester, 'Cất order');
      expect(find.text('Đã cất order bàn T02 (3 món). Mở lại bàn để gửi bếp'), findsOneWidget);
      expect(find.text('Order đã cất, chưa gửi bếp'), findsOneWidget); // S03
      final container = appContainer(tester);
      expect(container.read(cartProvider), isEmpty);
      expect(container.read(savedTicketsProvider)[2]?.count, 3);

      await tester.tap(find.text('T02 · 3 món'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Order đã cất: 3 món'), findsOneWidget); // S04
      await tapButton(tester, 'Mở order');
      expect(find.text('Phiếu gọi món'), findsOneWidget); // S08
      expect(find.text('Tôm sú hấp bia'), findsOneWidget);
      expect(container.read(cartProvider).first.note, 'Ít cay'); // giữ ghi chú
      expect(container.read(savedTicketsProvider), isEmpty);
    });

    testWidgets('Hủy order: hỏi lại, xóa phiếu chưa gửi, về S04, không gửi gì', (tester) async {
      final server = await pumpApp(tester, initialLocation: AppRoutes.ticket(2), token: 'abc', prefs: ticketPrefs());

      await tapButton(tester, 'Hủy order');
      expect(find.text('Xóa 3 món chưa gửi bếp của bàn T02? Món đã gửi bếp trước đó vẫn giữ nguyên.'), findsOneWidget);
      await confirmDialog(tester, 'Hủy order');

      expect(appContainer(tester).read(cartProvider), isEmpty);
      expect(find.text('Món đã gọi (3 món)'), findsOneWidget); // S04 bàn T02
      expect(sent(server, 'POST', '/dine-in/orders'), isEmpty);
    });

    testWidgets('Đang ghi dở bàn T02, sang bàn T01 bấm "Ghi món" → phiếu T02 tự cất, không mất', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.table(1), token: 'abc', prefs: ticketPrefs());

      await tapButton(tester, 'Ghi món');
      expect(find.text('Đã cất order bàn T02 (3 món)'), findsOneWidget);
      final container = appContainer(tester);
      expect(container.read(ticketTableProvider)?.id, 1);
      expect(container.read(cartProvider), isEmpty);
      expect(container.read(savedTicketsProvider)[2]?.items, hasLength(2));
    });
  });
}
