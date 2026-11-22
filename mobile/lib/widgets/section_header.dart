// Tiêu đề 1 khối trong trang (theo thiết kế S04):
//   dòng nhỏ in hoa màu coral ("THỰC ĐƠN") + tiêu đề Playfair ("Khám phá theo danh mục")
//   + (tùy chọn) nút chữ bên phải ("Xem tất cả ›").
//
//   SectionHeader(eyebrow: 'Thực đơn', title: 'Khám phá theo danh mục')
//   SectionHeader(title: 'Món đặc biệt của FAB', action: 'Xem tất cả', onAction: ...)

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/app_colors.dart';

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.eyebrow, this.action, this.onAction});

  final String title;
  final String? eyebrow;
  final String? action;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (eyebrow != null)
                Text(
                  eyebrow!.toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.coral600,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1,
                  ),
                ),
              Text(
                title,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 21,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ocean950,
                ),
              ),
            ],
          ),
        ),
        if (action != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(padding: const EdgeInsets.only(left: 8), minimumSize: const Size(0, 36)),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(action!, style: const TextStyle(fontSize: 13)),
                const Icon(Icons.chevron_right_rounded, size: 18),
              ],
            ),
          ),
      ],
    );
  }
}
