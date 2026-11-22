// Bộ chọn số lượng. Bấm −/+ để đổi, BẤM VÀO CON SỐ để gõ số mới.
//
//   Món theo phần (S06, S08):  [ − ] 1 [ + ]
//     QuantityStepper(value: qty, min: 1, max: 50, onChanged: (v) => setState(() => qty = v))
//     QuantityStepper(value: item.quantity, min: 0, small: true, onChanged: ...)  // 0 = xóa món
//
//   Món theo kg (S06, S08):    [ − ] 1 kg [ + ]   (−/+ đổi 0,1 kg; gõ được số lẻ, vd 0,98)
//     WeightStepper(value: item.weight, onChanged: (kg) => cart.setWeight(item.dishId, kg))

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../utils/format.dart';

class QuantityStepper extends StatelessWidget {
  const QuantityStepper({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 1,
    this.max = 50,
    this.small = false,
  });

  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;

  /// Bản nhỏ cho dòng món trong phiếu.
  final bool small;

  Future<void> _type(BuildContext context) async {
    final typed = await showAmountDialog(
      context,
      title: 'Số phần',
      initial: '$value',
      decimal: false,
      min: min < 1 ? 1 : min.toDouble(),
      max: max.toDouble(),
      unit: 'phần',
    );
    if (typed != null && typed.round() != value) onChanged(typed.round());
  }

  @override
  Widget build(BuildContext context) {
    return _StepperFrame(
      small: small,
      valueWidth: small ? 34 : 40,
      label: '$value',
      semanticsHint: 'Bấm để gõ số phần',
      onTapValue: () => _type(context),
      onMinus: value > min ? () => onChanged(value - 1) : null,
      onPlus: value < max ? () => onChanged(value + 1) : null,
    );
  }
}

/// Bộ chọn số kg cho món bán theo kg. Mặc định 1 kg; −/+ đổi [step] kg; bấm vào số để gõ (vd 0,98).
class WeightStepper extends StatelessWidget {
  const WeightStepper({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0.05,
    this.max = 30,
    this.step = 0.1,
    this.small = false,
  });

  final double value;
  final ValueChanged<double> onChanged;
  final double min;
  final double max;
  final double step;
  final bool small;

  // Tính theo gam để khỏi lệch số lẻ (0,1 + 0,2 = 0,30000000000000004)
  double _round(double kg) => (kg.clamp(min, max) * 1000).round() / 1000;

  Future<void> _type(BuildContext context) async {
    final typed = await showAmountDialog(
      context,
      title: 'Số kg',
      initial: formatDecimal(value),
      decimal: true,
      min: min,
      max: max,
      unit: 'kg',
    );
    if (typed != null && _round(typed) != value) onChanged(_round(typed));
  }

  @override
  Widget build(BuildContext context) {
    return _StepperFrame(
      small: small,
      valueWidth: small ? 64 : 76,
      label: formatKg(value),
      semanticsHint: 'Bấm để gõ số kg',
      onTapValue: () => _type(context),
      onMinus: value > min ? () => onChanged(_round(value - step)) : null,
      onPlus: value < max ? () => onChanged(_round(value + step)) : null,
    );
  }
}

/// Khung chung: [ − ] số [ + ], con số ở giữa bấm được (gạch chân chấm để biết bấm được).
class _StepperFrame extends StatelessWidget {
  const _StepperFrame({
    required this.small,
    required this.valueWidth,
    required this.label,
    required this.semanticsHint,
    required this.onTapValue,
    required this.onMinus,
    required this.onPlus,
  });

  final bool small;
  final double valueWidth;
  final String label;
  final String semanticsHint;
  final VoidCallback onTapValue;
  final VoidCallback? onMinus;
  final VoidCallback? onPlus;

  @override
  Widget build(BuildContext context) {
    final size = small ? 30.0 : 40.0;
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.slate300),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StepButton(icon: Icons.remove_rounded, size: size, tooltip: 'Giảm', onPressed: onMinus),
          Semantics(
            button: true,
            hint: semanticsHint,
            child: InkWell(
              onTap: onTapValue,
              borderRadius: BorderRadius.circular(6),
              child: SizedBox(
                width: valueWidth,
                height: size,
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      label,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: small ? 14 : 16,
                        color: AppColors.ocean900,
                        decoration: TextDecoration.underline,
                        decorationStyle: TextDecorationStyle.dotted,
                        decorationColor: AppColors.slate300,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          _StepButton(icon: Icons.add_rounded, size: size, tooltip: 'Tăng', onPressed: onPlus),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.size, required this.tooltip, this.onPressed});

  final IconData icon;
  final double size;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: size,
        height: size,
        child: IconButton(
          tooltip: tooltip,
          padding: EdgeInsets.zero,
          iconSize: size * 0.5,
          color: AppColors.ocean900,
          disabledColor: AppColors.slate300,
          onPressed: onPressed,
          icon: Icon(icon),
        ),
      );
}

/// Hộp gõ số (bấm vào con số của QuantityStepper / WeightStepper). Trả null nếu bấm "Hủy".
/// [decimal] = true cho số kg (gõ "0,98" hay "0.98" đều được), false cho số phần (số nguyên).
Future<double?> showAmountDialog(
  BuildContext context, {
  required String title,
  required String initial,
  required bool decimal,
  required double min,
  required double max,
  required String unit,
}) =>
    showDialog<double>(
      context: context,
      builder: (_) => _AmountDialog(title: title, initial: initial, decimal: decimal, min: min, max: max, unit: unit),
    );

/// Ô nhập nằm trong State của hộp: chỉ hủy (dispose) khi hộp đã đóng hẳn.
class _AmountDialog extends StatefulWidget {
  const _AmountDialog({
    required this.title,
    required this.initial,
    required this.decimal,
    required this.min,
    required this.max,
    required this.unit,
  });

  final String title;
  final String initial;
  final bool decimal;
  final double min;
  final double max;
  final String unit;

  @override
  State<_AmountDialog> createState() => _AmountDialogState();
}

class _AmountDialogState extends State<_AmountDialog> {
  late final _controller = TextEditingController(text: widget.initial)
    ..selection = TextSelection(baseOffset: 0, extentOffset: widget.initial.length); // bôi đen sẵn để gõ đè
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String? _validate(String? text) {
    final v = parseDecimal(text ?? '');
    if (v == null) return widget.decimal ? 'Nhập số, vd 0,98' : 'Nhập số nguyên, vd 2';
    if (!widget.decimal && v != v.roundToDouble()) return 'Số phần phải là số nguyên';
    if (v < widget.min || v > widget.max) {
      return 'Từ ${formatDecimal(widget.min)} đến ${formatDecimal(widget.max)} ${widget.unit}';
    }
    return null;
  }

  void _submit() {
    if (_formKey.currentState!.validate()) Navigator.pop(context, parseDecimal(_controller.text));
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      content: Form(
        key: _formKey,
        child: TextFormField(
          controller: _controller,
          autofocus: true,
          keyboardType: TextInputType.numberWithOptions(decimal: widget.decimal),
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _submit(),
          decoration: InputDecoration(suffixText: widget.unit, hintText: widget.decimal ? 'vd 0,98' : 'vd 2'),
          validator: _validate,
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Hủy')),
        FilledButton(onPressed: _submit, child: const Text('Xong')),
      ],
    );
  }
}
