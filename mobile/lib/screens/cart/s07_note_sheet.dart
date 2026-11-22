// S07. Bottom sheet: Ghi chú khẩu vị cho 1 món trong phiếu gọi món
// Xem docs/16-dac-ta-app-mobile-stitch.md mục S07. Không gọi API (ghi chú lưu trong phiếu trên máy,
// gửi lên cùng món khi bấm "Gửi bếp").
//
// Mở từ S08: showNoteSheet(context, item)
// Bấm "Xong" thì lưu vào phiếu. Đóng (×) hoặc vuốt xuống thì bỏ thay đổi.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../models/cart_item.dart';
import '../../state/cart_state.dart';
import '../../theme/app_colors.dart';
import '../../widgets/note_input.dart';

Future<void> showNoteSheet(BuildContext context, CartItem item) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true, // để sheet đẩy lên khi bàn phím hiện
    useRootNavigator: true,
    showDragHandle: true,
    backgroundColor: AppColors.white,
    builder: (_) => _NoteSheet(item: item),
  );
}

class _NoteSheet extends ConsumerStatefulWidget {
  const _NoteSheet({required this.item});

  final CartItem item;

  @override
  ConsumerState<_NoteSheet> createState() => _NoteSheetState();
}

class _NoteSheetState extends ConsumerState<_NoteSheet> {
  late final _note = TextEditingController(text: widget.item.note);

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  void _save() {
    ref.read(cartProvider.notifier).setNote(widget.item.dishId, _note.text);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      // Bàn phím hiện thì đẩy cả sheet lên trên bàn phím.
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      'Ghi chú cho ${widget.item.name}',
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ocean950,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Đóng',
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, color: AppColors.slate500),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              NoteInput(controller: _note, dishName: widget.item.name, categoryName: widget.item.category),
              const SizedBox(height: 8),
              FilledButton(onPressed: _save, child: const Text('Xong')),
            ],
          ),
        ),
      ),
    );
  }
}
