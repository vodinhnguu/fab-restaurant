// S15 Quản lý · Tổng quan và S16 Đơn đã hủy: docs/28-app-quan-ly.md
// Kiểm: doanh thu ngày / tháng, tách tại quán - online, đơn hủy, bàn, bia nước, tồn hồ;
//       mở S16 xem lý do hủy; menu trái chỉ hiện mục "Quản lý" với người có quyền Xem Tổng quan;
//       phục vụ mở thẳng /manager thì bị chặn.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/app/routes.dart';

import '../helpers/test_app.dart';

void main() {
  group('S15 Tổng quan quản lý', () {
    testWidgets('hiện doanh thu hôm nay / tháng này, tách tại quán - online', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.manager, token: 'abc', me: quanLyJson);

      expect(find.text('Quản lý'), findsWidgets);
      expect(find.text('Doanh thu hôm nay'), findsOneWidget);
      expect(find.text('12.500.000đ'), findsOneWidget);
      expect(find.text('8 đơn đã thu · trung bình 1.562.500đ/đơn'), findsOneWidget);
      expect(find.text('10.000.000đ · 5 đơn'), findsOneWidget); // ăn tại quán
      expect(find.text('2.500.000đ · 3 đơn'), findsOneWidget); // đặt online

      expect(find.text('Doanh thu tháng 11/2026'), findsOneWidget);
      expect(find.text('240.000.000đ'), findsOneWidget);
    });

    testWidgets('hiện đơn đã hủy, bàn đang phục vụ, bia nước, tồn hồ, món bán chạy', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.manager, token: 'abc', me: quanLyJson);

      // Đơn đã hủy: hôm nay 1 đơn 250.000đ, tháng 6 đơn
      expect(find.text('Đơn đã hủy'), findsOneWidget);
      expect(find.text('1 đơn'), findsOneWidget);
      expect(find.text('6 đơn'), findsOneWidget);

      // Bàn
      await tester.scrollUntilVisible(find.text('Đang phục vụ'), 200);
      expect(find.text('Tiền đang phục vụ (chưa thu): 4.200.000đ'), findsOneWidget);

      // Bia & nước
      await tester.scrollUntilVisible(find.text('Bia & nước hôm nay'), 200);
      expect(find.text('34 · 750.000đ'), findsOneWidget);
      expect(find.text('24 lon'), findsOneWidget);
      expect(find.text('10 chai'), findsOneWidget);

      // Tồn hồ: Cua gạch gần hết, Cá mú hết -> khung nhắc nhập hàng
      await tester.scrollUntilVisible(find.text('Tồn hồ hải sản'), 200);
      expect(find.text('Cần nhập hàng: Cua gạch (1,2 kg), Cá mú (0 kg)'), findsOneWidget);
      expect(find.text('Tôm hùm · 8,5 kg'), findsOneWidget);
      expect(find.text('Cá mú · hết'), findsOneWidget);

      await tester.scrollUntilVisible(find.text('Món bán chạy hôm nay'), 200);
      expect(find.text('Tôm hùm nướng phô mai'), findsOneWidget);
    });

    testWidgets('bấm thẻ "Đơn đã hủy" mở S16 kèm lý do hủy', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.manager, token: 'abc', me: quanLyJson);

      await tester.tap(find.text('Đơn đã hủy'));
      await tester.pumpAndSettle();

      expect(find.text('1 đơn bị hủy · Hôm nay'), findsOneWidget);
      expect(find.text('FAB261120000048'), findsOneWidget);
      expect(find.text('Lý do: Ghi nhầm bàn'), findsOneWidget);
      expect(find.textContaining('Ăn tại quán · bàn T01'), findsOneWidget);
      expect(find.text('Nhân viên mở bàn: Lý Phục Vụ'), findsOneWidget);

      // Món hủy lẻ
      await tester.scrollUntilVisible(find.text('Món hủy lẻ (1)'), 200);
      expect(find.text('Tôm sú hấp bia'), findsOneWidget);
      expect(find.text('Lý do: Khách không chờ được'), findsOneWidget);
      expect(find.text('1.380.000đ'), findsOneWidget); // 2 × 690.000
    });
  });

  group('Quyền', () {
    testWidgets('quản lý: menu trái có mục "Quản lý"', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.tables, token: 'abc', me: quanLyJson);

      await tester.tap(find.byTooltip('Open navigation menu'));
      await tester.pumpAndSettle();
      expect(find.text('Quản lý'), findsWidgets);
      expect(find.text('Sơ đồ bàn'), findsWidgets);
    });

    testWidgets('phục vụ: menu trái KHÔNG có mục "Quản lý"', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.tables, token: 'abc');

      await tester.tap(find.byTooltip('Open navigation menu'));
      await tester.pumpAndSettle();
      expect(find.text('Quản lý'), findsNothing);
      expect(find.text('Đơn hôm nay'), findsOneWidget);
    });

    testWidgets('phục vụ mở thẳng /manager: bị chặn, có nút về Sơ đồ bàn', (tester) async {
      await pumpApp(tester, initialLocation: AppRoutes.manager, token: 'abc');

      expect(find.text('Tài khoản của bạn không xem được số liệu quản lý'), findsOneWidget);
      expect(find.text('12.500.000đ'), findsNothing);

      await tester.tap(find.widgetWithText(FilledButton, 'Về sơ đồ bàn'));
      await tester.pumpAndSettle();
      expect(find.text('Sơ đồ bàn'), findsWidgets);
    });
  });
}
