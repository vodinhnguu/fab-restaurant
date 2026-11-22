// S10 Đơn hôm nay (tổng tiền, lọc, xem lại đơn đã hủy) và S11 Tài khoản (vai trò, quyền, đăng xuất).

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/app/routes.dart';
import 'package:fab_seafood/state/cart_state.dart';

import '../helpers/test_app.dart';

void main() {
  testWidgets('S10: tổng đã thu / đang phục vụ, lọc "Đã hủy", xem lại đơn kèm lý do hủy', (tester) async {
    final server = await pumpApp(
      tester,
      initialLocation: AppRoutes.orders,
      token: 'abc',
      api: (req) => req.path == '/orders/48'
          ? ok({
              ...todayOrdersJson[2],
              'items': [
                {'dishId': 1, 'name': 'Tôm sú hấp bia', 'price': 250000, 'quantity': 1, 'note': null},
              ],
            })
          : null,
    );

    expect(find.text('1.500.000đ'), findsWidgets); // đã thu (đơn B05)
    expect(find.text('1 đơn'), findsOneWidget);
    expect(find.text('Bàn T02'), findsOneWidget);
    expect(find.text('Bàn B05'), findsOneWidget);

    await tester.tap(find.widgetWithText(ChoiceChip, 'Đã hủy (1)'));
    await tester.pumpAndSettle();
    expect(find.text('Bàn T01'), findsOneWidget);
    expect(find.text('Bàn T02'), findsNothing);

    await tester.tap(find.text('Bàn T01'));
    await tester.pumpAndSettle();
    expect(sent(server, 'GET', '/orders/48'), hasLength(1));
    expect(find.text('Lý do hủy: Ghi nhầm bàn'), findsOneWidget);
  });

  testWidgets('S10: bấm đơn đang phục vụ → mở S04 của bàn đó', (tester) async {
    await pumpApp(tester, initialLocation: AppRoutes.orders, token: 'abc');

    await tester.tap(find.text('Bàn T02'));
    await tester.pumpAndSettle();
    expect(find.text('Món đã gọi (3 món)'), findsOneWidget);
  });

  testWidgets('S11: thu ngân thấy vai trò và việc KHÔNG làm được (ghi món)', (tester) async {
    await pumpApp(tester, initialLocation: AppRoutes.account, token: 'abc', me: thuNganJson);

    expect(find.text('Trần Thu Ngân'), findsOneWidget);
    expect(find.text('Thu ngân'), findsOneWidget);
    expect(find.byIcon(Icons.block_rounded), findsOneWidget); // "Ghi món, gửi bếp"
  });

  testWidgets('S11: đăng xuất khi phiếu còn món → hỏi lại, xóa phiếu, về màn đăng nhập', (tester) async {
    await pumpApp(
      tester,
      initialLocation: AppRoutes.account,
      token: 'abc',
      prefs: {
        'ticket': jsonEncode([
          {'dishId': 1, 'name': 'Tôm sú hấp bia', 'slug': 'tom-su-hap-bia', 'price': 250000, 'quantity': 2, 'note': ''},
        ]),
        'ticketTable': jsonEncode({'id': 2, 'code': 'T02'}),
      },
    );

    await tester.tap(find.text('Đăng xuất'));
    await tester.pumpAndSettle();
    expect(find.text('Phiếu gọi món còn 2 món chưa gửi bếp sẽ bị xóa. Vẫn đăng xuất?'), findsOneWidget);
    await tester.tap(find.widgetWithText(FilledButton, 'Đăng xuất')); // nút trong hộp hỏi lại (tiêu đề cũng là "Đăng xuất")
    await tester.pumpAndSettle();

    expect(find.text('Đăng nhập nhân viên'), findsOneWidget);
    expect(appContainer(tester).read(cartProvider), isEmpty);
    expect(appContainer(tester).read(ticketTableProvider), isNull);
  });
}
