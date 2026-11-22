// S05 – Hàng công cụ: ô "Tìm món..." + nút sắp xếp ("⇅ Bán chạy").
// Bấm nút sắp xếp → bottom sheet "Sắp xếp theo" 5 lựa chọn (mục S05 docs/16).
//
// Khối này chỉ vẽ và báo lên màn S05 (onSearchChanged, onSortChanged).
// Việc chờ 0,4 giây rồi mới gọi API nằm ở s05_menu_screen.dart.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../services/dish_service.dart';
import '../../../theme/app_colors.dart';

class MenuToolbar extends StatelessWidget {
  const MenuToolbar({
    super.key,
    required this.searchController,
    required this.onSearchChanged,
    required this.onSearchSubmitted,
    required this.onSearchCleared,
    required this.sort,
    required this.onSortChanged,
  });

  final TextEditingController searchController;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onSearchSubmitted;
  final VoidCallback onSearchCleared;
  final DishSort sort;
  final ValueChanged<DishSort> onSortChanged;

  Future<void> _pickSort(BuildContext context) async {
    final picked = await _showSortSheet(context, sort);
    if (picked != null && picked != sort) onSortChanged(picked);
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          // Nghe ô nhập để hiện / ẩn nút xóa (x) khi có chữ.
          child: ValueListenableBuilder(
            valueListenable: searchController,
            builder: (context, value, _) => TextField(
              controller: searchController,
              onChanged: onSearchChanged,
              onSubmitted: onSearchSubmitted,
              textInputAction: TextInputAction.search,
              textAlignVertical: TextAlignVertical.center,
              decoration: InputDecoration(
                hintText: 'Tìm món...',
                // Cao tối thiểu 48, bằng nút sắp xếp bên cạnh.
                constraints: const BoxConstraints(minHeight: 48),
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                prefixIcon: const Icon(Icons.search_rounded, color: AppColors.slate500),
                suffixIcon: value.text.isEmpty
                    ? null
                    : IconButton(
                        tooltip: 'Xóa từ khóa',
                        onPressed: onSearchCleared,
                        icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.slate500),
                      ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        OutlinedButton.icon(
          onPressed: () => _pickSort(context),
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 48),
            padding: const EdgeInsets.symmetric(horizontal: 14),
            side: const BorderSide(color: AppColors.slate200),
          ),
          icon: const Icon(Icons.swap_vert_rounded, size: 20),
          label: Text(sort.label),
        ),
      ],
    );
  }
}

/// Bottom sheet "Sắp xếp theo": chọn 1 trong 5 cách. Trả về cách đã chọn (null = đóng sheet).
Future<DishSort?> _showSortSheet(BuildContext context, DishSort current) => showModalBottomSheet<DishSort>(
      context: context,
      useRootNavigator: true, // phủ lên cả thanh giỏ nổi và thanh tab dưới
      showDragHandle: true,
      backgroundColor: AppColors.white,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: Text(
                'Sắp xếp theo',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ocean950,
                ),
              ),
            ),
            // RadioGroup giữ lựa chọn đang chọn; bấm dòng nào thì đóng sheet và trả về dòng đó.
            RadioGroup<DishSort>(
              groupValue: current,
              onChanged: (value) => Navigator.pop(context, value),
              child: Column(
                children: [
                  for (final option in DishSort.values)
                    RadioListTile<DishSort>(
                      value: option,
                      title: Text(
                        option.label,
                        style: TextStyle(
                          fontWeight: option == current ? FontWeight.w700 : FontWeight.w500,
                          color: option == current ? AppColors.ocean900 : AppColors.slate800,
                        ),
                      ),
                      controlAffinity: ListTileControlAffinity.trailing,
                      fillColor: WidgetStateProperty.resolveWith(
                        (states) => states.contains(WidgetState.selected) ? AppColors.coral500 : AppColors.slate300,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
