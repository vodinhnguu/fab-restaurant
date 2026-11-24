// S02. Đăng nhập nhân viên: docs/23-app-nhan-vien-phuc-vu.md mục 2
// API: POST /auth/login { email, password } → { user, token }  (qua authProvider)
// Thiết kế: design/S02.png
//
// Vào từ: S01 (chưa đăng nhập), S11 (Đăng xuất), hoặc khi phiên đăng nhập hết hạn.
// Xong thì vào tab Bàn (S03). Tài khoản khách hàng / nhân viên không có quyền "Đơn hàng & gọi món"
// (tạp vụ, kỹ thuật...) bị chặn với câu notStaffMessage (state/auth_state.dart).

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/routes.dart';
import '../../services/api_exception.dart';
import '../../state/auth_state.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../utils/validators.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_snackbar.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/fab_logo.dart';

/// Tài khoản demo (dữ liệu mẫu của `npm run setup`, không phải tài khoản thật), bấm để điền nhanh.
const demoAccounts = [
  ('Phục vụ', 'phucvu@fab.vn'),
  ('Tổ trưởng', 'totruong@fab.vn'),
  ('Tiếp thực', 'tiepthuc@fab.vn'),
  ('Quản lý', 'quanly@fab.vn'),
];
const demoPassword = '123456';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();

  bool _sending = false;

  /// Lỗi backend trả về cho từng ô (errors[].field), hiện ngay dưới ô đó.
  Map<String, String> _serverErrors = const {};

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _serverErrors = const {});
    if (!_formKey.currentState!.validate()) return;

    setState(() => _sending = true);
    try {
      final user = await ref
          .read(authProvider.notifier)
          .login(email: _email.text.trim(), password: _password.text);
      TextInput.finishAutofillContext(); // cho điện thoại gợi ý lưu mật khẩu
      showAppSnack('Xin chào, ${user.name}!');
      // Quản lý / chủ / tổ trưởng / thu ngân (có quyền Xem "Tổng quan") vào thẳng màn Quản lý;
      // phục vụ, bếp, tiếp thực vào Sơ đồ bàn. Đổi mục bất cứ lúc nào bằng menu trái. (docs/28)
      if (mounted) context.go(user.canSeeManager ? AppRoutes.manager : AppRoutes.tables);
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _serverErrors = e.fieldErrors);
      showAppSnack(e.friendlyMessage(tooMany: 'Bạn thử đăng nhập quá nhiều lần'), error: true);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _fillDemo(String email) {
    _email.text = email;
    _password.text = demoPassword;
    _clearServerErrors();
  }

  void _clearServerErrors() {
    if (_serverErrors.isNotEmpty) setState(() => _serverErrors = const {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // SliverFillRemaining: màn cao thì khối tài khoản demo nằm sát đáy,
            // bàn phím hiện lên thì cả form cuộn được.
            SliverFillRemaining(
              hasScrollBody: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                child: AutofillGroup(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Center(child: FabLogo(vertical: true, fontSize: 20)),
                        const SizedBox(height: 20),
                        Text('Đăng nhập nhân viên', textAlign: TextAlign.center, style: AppText.pageTitle()),
                        const SizedBox(height: 6),
                        const Text(
                          'Ghi món tại bàn, gửi bếp',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppColors.slate500),
                        ),
                        const SizedBox(height: 28),
                        AppTextField(
                          label: 'Email',
                          controller: _email,
                          hint: 'ten@fab.vn',
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
                          validator: Validators.email,
                          serverError: _serverErrors['email'],
                          onChanged: (_) => _clearServerErrors(),
                        ),
                        const SizedBox(height: 16),
                        PasswordField(
                          label: 'Mật khẩu',
                          controller: _password,
                          textInputAction: TextInputAction.done,
                          validator: Validators.loginPassword,
                          serverError: _serverErrors['password'],
                          onChanged: (_) => _clearServerErrors(),
                          onSubmitted: (_) => _submit(),
                        ),
                        const SizedBox(height: 24),
                        AppButton(label: 'Đăng nhập', loading: _sending, onPressed: _submit),
                        const Spacer(),
                        const SizedBox(height: 28),
                        const Text(
                          'Tài khoản demo (mật khẩu 123456)',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppColors.slate500, fontSize: 13),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          alignment: WrapAlignment.center,
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            for (final (label, email) in demoAccounts)
                              ActionChip(label: Text(label), onPressed: _sending ? null : () => _fillDemo(email)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
