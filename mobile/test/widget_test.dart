// Kiểm tra khung app (Bước 0): mở app → Splash → Trang chủ → bấm qua các tab và màn.
// Chạy: cd mobile && flutter test

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:fab_seafood/main.dart';
import 'package:fab_seafood/services/token_store.dart';
import 'package:fab_seafood/state/app_providers.dart';

/// Bấm 1 tab ở thanh tab dưới theo tên.
Future<void> tapTab(WidgetTester tester, String label) async {
  await tester.tap(find.descendant(of: find.byType(NavigationBar), matching: find.text(label)));
  await tester.pumpAndSettle();
}

/// Bấm 1 nút có chữ [label]. Danh sách chỉ dựng phần đang hiện trên màn hình,
/// nên cuộn xuống tới khi thấy nút rồi mới bấm.
Future<void> tapButton(WidgetTester tester, String label) async {
  final button = find.widgetWithText(OutlinedButton, label);
  await tester.scrollUntilVisible(button, 200, scrollable: find.byType(Scrollable).first);
  await tester.tap(button);
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('Mở app, đi qua 5 tab và vài màn chính', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
        tokenStoreProvider.overrideWithValue(MemoryTokenStore()),
      ],
      child: const FabApp(),
    ));

    // S01 Splash
    expect(find.text('FAB Seafood'), findsOneWidget);

    // Sau 1,2 giây tự vào S04 Trang chủ
    await tester.pump(const Duration(seconds: 2));
    await tester.pumpAndSettle();
    expect(find.text('S04'), findsOneWidget);
    expect(find.byType(NavigationBar), findsOneWidget);

    // Tab Thực đơn → S05, bấm thẻ món → S06 (che thanh tab)
    await tapTab(tester, 'Thực đơn');
    expect(find.text('S05'), findsOneWidget);
    await tapButton(tester, 'Thẻ món → S06');
    expect(find.text('S06'), findsOneWidget);
    expect(find.byType(NavigationBar), findsNothing);

    // Quay lại → về S05
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('S05'), findsOneWidget);

    // Tab Đặt bàn → S17
    await tapTab(tester, 'Đặt bàn');
    expect(find.text('S17'), findsOneWidget);

    // Tab Tài khoản → S22 → "Lịch đặt bàn" mở tab Hoạt động, tab con Đặt bàn (S20)
    await tapTab(tester, 'Tài khoản');
    expect(find.text('S22'), findsOneWidget);
    await tapButton(tester, 'Lịch đặt bàn → S20');
    expect(find.text('S20'), findsOneWidget);
  });
}
