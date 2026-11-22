// Kiểm tra khung app nhân viên: mở app → Splash → Đăng nhập / Sơ đồ bàn → đi qua 3 màn chính bằng menu trái
// (kiểu CukCuk, lib/app/app_drawer.dart), nút quay lại của điện thoại, đăng xuất từ menu.
// Chạy: cd mobile && flutter test

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/app/routes.dart';

import 'helpers/test_app.dart';

/// Bấm nút ☰ góc trái để mở menu trái.
Future<void> openMenu(WidgetTester tester) async {
  await tester.tap(find.byType(DrawerButton));
  await tester.pumpAndSettle();
}

/// Mở menu trái rồi bấm 1 mục theo tên.
Future<void> tapMenu(WidgetTester tester, String label) async {
  await openMenu(tester);
  await tester.tap(find.descendant(of: find.byType(Drawer), matching: find.text(label)));
  await tester.pumpAndSettle();
}

/// Giả lập bấm nút quay lại (back) của điện thoại Android.
Future<void> pressSystemBack(WidgetTester tester) async {
  await tester.binding.handlePopRoute();
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('Chưa đăng nhập: Splash → màn Đăng nhập nhân viên (không có menu trái)', (tester) async {
    await pumpApp(tester);

    expect(find.text('Đăng nhập nhân viên'), findsOneWidget);
    expect(find.byType(DrawerButton), findsNothing);
  });

  testWidgets('Đã đăng nhập: Sơ đồ bàn, menu trái có tên + 3 số của ca, đi qua 3 màn', (tester) async {
    await pumpApp(tester, token: 'token-cu');

    // S03: chỉ còn chọn khu + sơ đồ bàn, lời chào đã chuyển vào menu trái
    expect(find.text('Sơ đồ bàn'), findsOneWidget);
    expect(find.text('Trong nhà'), findsOneWidget);
    expect(find.text('T02'), findsOneWidget);
    expect(find.text('Bàn có khách'), findsNothing);

    await openMenu(tester);
    final drawer = find.byType(Drawer);
    Finder inDrawer(String text) => find.descendant(of: drawer, matching: find.text(text));
    expect(inDrawer('Lý Phục Vụ'), findsOneWidget);
    expect(inDrawer('Nhân viên phục vụ'), findsOneWidget);
    expect(inDrawer('1'), findsOneWidget); // bàn có khách: T02
    expect(inDrawer('2'), findsOneWidget); // bàn trống: T01, B05
    expect(inDrawer('820.000đ'), findsOneWidget); // tiền đang phục vụ
    for (final label in ['Sơ đồ bàn', 'Đơn hôm nay', 'Tài khoản', 'Đăng xuất']) {
      expect(inDrawer(label), findsOneWidget);
    }
    await tester.tap(inDrawer('Đơn hôm nay'));
    await tester.pumpAndSettle();
    expect(find.byType(Drawer), findsNothing); // bấm mục xong menu tự đóng
    expect(find.text('Đã thu hôm nay'), findsOneWidget);

    await tapMenu(tester, 'Tài khoản');
    expect(find.text('Bạn làm được gì trong app'), findsOneWidget);

    await tapMenu(tester, 'Sơ đồ bàn');
    expect(find.text('Chọn khu'), findsOneWidget);
  });

  testWidgets('Nút quay lại của điện thoại: ở Đơn hôm nay thì về Sơ đồ bàn; đang mở menu thì chỉ đóng menu', (tester) async {
    await pumpApp(tester, token: 'token-cu');
    await tapMenu(tester, 'Đơn hôm nay');

    await openMenu(tester);
    await pressSystemBack(tester);
    expect(find.byType(Drawer), findsNothing);
    expect(find.text('Đã thu hôm nay'), findsOneWidget);

    await pressSystemBack(tester);
    expect(find.text('Chọn khu'), findsOneWidget);
  });

  testWidgets('Bấm bàn → S04 (che cả màn, có nút ←), quay lại về sơ đồ', (tester) async {
    await pumpApp(tester, token: 'token-cu');

    await tester.tap(find.text('T02'));
    await tester.pumpAndSettle();
    expect(find.text('Bàn T02'), findsOneWidget);
    expect(find.byType(DrawerButton), findsNothing);

    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Sơ đồ bàn'), findsOneWidget);
  });

  testWidgets('Đăng xuất từ menu trái: hỏi lại → về màn đăng nhập', (tester) async {
    await pumpApp(tester, initialLocation: AppRoutes.orders, token: 'token-cu');

    await tapMenu(tester, 'Đăng xuất');
    expect(find.text('Bạn muốn đăng xuất?'), findsOneWidget);
    await tester.tap(find.widgetWithText(FilledButton, 'Đăng xuất'));
    await tester.pumpAndSettle();

    expect(find.text('Đăng nhập nhân viên'), findsOneWidget);
  });
}
