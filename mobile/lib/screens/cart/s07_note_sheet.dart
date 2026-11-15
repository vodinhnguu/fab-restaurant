// S07. Bottom sheet: Ghi chú khẩu vị cho 1 món trong giỏ
// Xem docs/16-dac-ta-app-mobile-stitch.md mục S07. Không gọi API (ghi chú lưu trong giỏ trên máy).
// Thiết kế: design/S07.png
//
// Mở từ S08 và S09: showNoteSheet(context, dishName: 'Tôm sú hấp bia')

import 'package:flutter/material.dart';

import '../../widgets/placeholder_screen.dart';

Future<void> showNoteSheet(BuildContext context, {required String dishName}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true, // để sheet đẩy lên khi bàn phím hiện
    showDragHandle: true,
    builder: (_) => _NoteSheet(dishName: dishName),
  );
}

class _NoteSheet extends StatelessWidget {
  const _NoteSheet({required this.dishName});

  final String dishName;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 3): chip gợi ý theo danh mục, ô nhập tối đa 200 ký tự, bộ đếm.
    return PlaceholderSheet(code: 'S07', title: 'Ghi chú cho $dishName');
  }
}
