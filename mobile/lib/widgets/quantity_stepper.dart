// Bộ chọn số lượng [ − ] 1 [ + ]. Dùng ở S06 (số phần), S08 (giỏ, bản nhỏ), S17 (số khách).
//
//   QuantityStepper(value: qty, min: 1, max: 50, onChanged: (v) => setState(() => qty = v))
//   QuantityStepper(value: item.quantity, min: 0, small: true, onChanged: ...)  // 0 = xóa món

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

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

  /// Bản nhỏ cho dòng món trong giỏ.
  final bool small;

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
          _StepButton(
            icon: Icons.remove_rounded,
            size: size,
            tooltip: 'Giảm',
            onPressed: value > min ? () => onChanged(value - 1) : null,
          ),
          SizedBox(
            width: small ? 28 : 36,
            child: Text(
              '$value',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: small ? 14 : 16, color: AppColors.ocean900),
            ),
          ),
          _StepButton(
            icon: Icons.add_rounded,
            size: size,
            tooltip: 'Tăng',
            onPressed: value < max ? () => onChanged(value + 1) : null,
          ),
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
