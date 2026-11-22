// Ô ghi chú khẩu vị của 1 món: chip gợi ý "+ Ít cay"... + ô nhập nhiều dòng, đếm "12/200".
// Dùng ở S06 (ghi chú trước khi thêm vào giỏ) và S07 (sửa ghi chú món trong giỏ).
//
//   NoteInput(controller: _note, categoryName: dish.categoryName, dishName: dish.name)
//
// Bấm chip: nối vào ghi chú bằng ", ", ý nào đã có thì bỏ qua (utils/notes.dart).

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../utils/notes.dart';

class NoteInput extends StatelessWidget {
  const NoteInput({super.key, required this.controller, required this.dishName, this.categoryName});

  final TextEditingController controller;
  final String dishName;

  /// Tên danh mục của món, để chọn chip gợi ý (Tôm, Cá, Đồ uống...).
  final String? categoryName;

  void _addSuggestion(String suggestion) {
    final text = appendNote(controller.text, suggestion);
    controller.value = TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length), // con trỏ về cuối
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final s in noteSuggestions(categoryName))
              ActionChip(
                label: Text('+ $s'),
                onPressed: () => _addSuggestion(s),
                labelStyle: const TextStyle(color: AppColors.ocean700, fontWeight: FontWeight.w500, fontSize: 13),
                side: const BorderSide(color: AppColors.slate300),
                backgroundColor: AppColors.white,
                padding: const EdgeInsets.symmetric(horizontal: 4),
                visualDensity: VisualDensity.compact,
              ),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          controller: controller,
          minLines: 2,
          maxLines: 4,
          maxLength: maxNoteLength, // đủ 200 ký tự thì không gõ thêm được, tự hiện "12/200"
          textCapitalization: TextCapitalization.sentences,
          decoration: InputDecoration(
            hintText: 'Khẩu vị riêng cho $dishName, vd: 2 phần ít cay, 1 phần không hành',
            hintMaxLines: 2,
          ),
        ),
      ],
    );
  }
}
