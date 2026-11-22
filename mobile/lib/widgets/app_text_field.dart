// Ô nhập chuẩn của app (mục 2.3 docs/16): nhãn ở TRÊN ô, ô cao 44, bo 12,
// lỗi thì viền đỏ + dòng chữ đỏ nhỏ bên dưới. Dùng ở mọi form (S02, S03, S09, S17, S23...).
//
//   AppTextField(label: 'Email', required: true, controller: _email,
//       keyboardType: TextInputType.emailAddress, validator: Validators.email)
//   PasswordField(label: 'Mật khẩu', controller: _password, validator: Validators.loginPassword)

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_colors.dart';

class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.label,
    this.controller,
    this.hint,
    this.helper,
    this.required = false,
    this.validator,
    this.serverError,
    this.onChanged,
    this.onSubmitted,
    this.keyboardType,
    this.textInputAction,
    this.autofillHints,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.obscureText = false,
    this.suffix,
    this.enabled = true,
    this.readOnly = false,
    this.maxLines = 1,
    this.maxLength,
  });

  final String label;
  final TextEditingController? controller;
  final String? hint; // chữ mờ trong ô
  final String? helper; // chữ nhỏ dưới ô, vd "Dùng để điền sẵn khi đặt món, đặt bàn"
  final bool required; // hiện dấu * đỏ sau nhãn
  final FormFieldValidator<String>? validator;

  /// Lỗi backend trả về cho ô này (ApiException.fieldErrors['email']). null = không có.
  final String? serverError;

  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;
  final TextCapitalization textCapitalization;
  final List<TextInputFormatter>? inputFormatters;
  final bool obscureText;
  final Widget? suffix; // nút ở cuối ô, vd con mắt hiện / ẩn mật khẩu
  final bool enabled;
  final bool readOnly;
  final int maxLines;
  final int? maxLength;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text.rich(
          TextSpan(
            text: label,
            children: [
              if (required) const TextSpan(text: ' *', style: TextStyle(color: AppColors.danger)),
            ],
          ),
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.slate800),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          validator: validator,
          forceErrorText: serverError,
          onChanged: onChanged,
          onFieldSubmitted: onSubmitted,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          autofillHints: autofillHints,
          textCapitalization: textCapitalization,
          inputFormatters: inputFormatters,
          obscureText: obscureText,
          enabled: enabled,
          readOnly: readOnly,
          maxLines: obscureText ? 1 : maxLines,
          maxLength: maxLength,
          style: TextStyle(color: enabled && !readOnly ? AppColors.slate800 : AppColors.slate500),
          decoration: InputDecoration(
            hintText: hint,
            helperText: helper,
            helperMaxLines: 2,
            helperStyle: const TextStyle(color: AppColors.slate500, fontSize: 12),
            suffixIcon: suffix,
            fillColor: enabled && !readOnly ? AppColors.white : AppColors.sand100,
          ),
        ),
      ],
    );
  }
}

/// Ô mật khẩu có nút con mắt để hiện / ẩn (S02, S03, S24).
class PasswordField extends StatefulWidget {
  const PasswordField({
    super.key,
    required this.label,
    this.controller,
    this.required = false,
    this.validator,
    this.serverError,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction,
    this.autofillHints = const [AutofillHints.password],
  });

  final String label;
  final TextEditingController? controller;
  final bool required;
  final FormFieldValidator<String>? validator;
  final String? serverError;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _hidden = true;

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      label: widget.label,
      controller: widget.controller,
      required: widget.required,
      validator: widget.validator,
      serverError: widget.serverError,
      onChanged: widget.onChanged,
      onSubmitted: widget.onSubmitted,
      textInputAction: widget.textInputAction,
      autofillHints: widget.autofillHints,
      keyboardType: TextInputType.visiblePassword,
      obscureText: _hidden,
      suffix: IconButton(
        tooltip: _hidden ? 'Hiện mật khẩu' : 'Ẩn mật khẩu',
        color: AppColors.slate500,
        icon: Icon(_hidden ? Icons.visibility_rounded : Icons.visibility_off_rounded),
        onPressed: () => setState(() => _hidden = !_hidden),
      ),
    );
  }
}
