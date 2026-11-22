// S02 Đăng nhập nhân viên: điền nhanh tài khoản demo, chặn tài khoản khách / không có quyền, vào Sơ đồ bàn.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/app/routes.dart';
import 'package:fab_seafood/state/auth_state.dart';

import '../helpers/test_app.dart';

void main() {
  testWidgets('Bấm tài khoản demo "Phục vụ" → đăng nhập → Sơ đồ bàn', (tester) async {
    final server = await pumpApp(
      tester,
      initialLocation: AppRoutes.login,
      api: (req) => req.path == '/auth/login' ? ok({'user': phucVuJson, 'token': 'token-moi'}) : null,
    );

    await tester.tap(find.widgetWithText(ActionChip, 'Phục vụ'));
    await tester.pump();
    await tapButton(tester, 'Đăng nhập');

    final login = sent(server, 'POST', '/auth/login').single;
    expect(login.data, {'email': 'phucvu@fab.vn', 'password': '123456'});
    expect(find.text('Sơ đồ bàn'), findsOneWidget);
    expect(find.text('Xin chào, Lý Phục Vụ!'), findsOneWidget); // snackbar
  });

  testWidgets('Tài khoản khách hàng → báo không dùng được app, ở lại màn đăng nhập', (tester) async {
    await pumpApp(
      tester,
      initialLocation: AppRoutes.login,
      api: (req) => req.path == '/auth/login' ? ok({'user': khachJson, 'token': 'token-khach'}) : null,
    );

    await enterField(tester, 'Email', 'khach@fab.vn');
    await enterField(tester, 'Mật khẩu', '123456');
    await tapButton(tester, 'Đăng nhập');

    expect(find.text(notStaffMessage), findsOneWidget);
    expect(find.text('Đăng nhập nhân viên'), findsOneWidget);
  });

  testWidgets('Sai mật khẩu → hiện câu lỗi của backend', (tester) async {
    await pumpApp(
      tester,
      initialLocation: AppRoutes.login,
      api: (req) => req.path == '/auth/login' ? apiError(401, 'Email hoặc mật khẩu không đúng') : null,
    );

    await enterField(tester, 'Email', 'phucvu@fab.vn');
    await enterField(tester, 'Mật khẩu', 'sai-mat-khau');
    await tapButton(tester, 'Đăng nhập');

    expect(find.text('Email hoặc mật khẩu không đúng'), findsOneWidget);
    expect(find.text('Đăng nhập nhân viên'), findsOneWidget);
  });
}
