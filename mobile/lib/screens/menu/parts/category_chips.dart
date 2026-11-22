// S05 – Dải chip danh mục cuộn ngang: "Tất cả", rồi từng danh mục (GET /categories).
// Chip đang chọn: nền Ocean 900 chữ trắng. Màn S05 ghim dải này trên đầu khi cuộn.
//
// Mở S05 từ ô danh mục ở cuối dải (vd "Đồ uống") thì dải tự cuộn tới chip đó cho thấy được.

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../models/category.dart';
import '../../../theme/app_colors.dart';
import '../../../widgets/state_views.dart';

class CategoryChips extends StatefulWidget {
  const CategoryChips({super.key, required this.categories, required this.selected, required this.onSelected});

  final AsyncValue<List<Category>> categories;

  /// Slug danh mục đang chọn. null = "Tất cả".
  final String? selected;
  final ValueChanged<String?> onSelected;

  @override
  State<CategoryChips> createState() => _CategoryChipsState();
}

class _CategoryChipsState extends State<CategoryChips> {
  final _scroll = ScrollController();
  final _keys = <String?, GlobalKey>{}; // mỗi chip 1 key, để tìm vị trí chip đang chọn

  /// Chip đã được cuộn tới lần gần nhất ('' = chưa cuộn lần nào).
  String? _revealed = '';

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  /// Cuộn ngang cho chip đang chọn nằm giữa dải.
  /// Không dùng Scrollable.ensureVisible: hàm đó cuộn luôn cả trang dọc bên ngoài.
  void _revealSelected() {
    final box = _keys[widget.selected]?.currentContext?.findRenderObject();
    // Màn chưa được vẽ (S05 nằm dưới S06 khi mở thẳng đường dẫn món): chip chưa có kích thước, bỏ qua
    if (box is! RenderBox || !box.hasSize || !_scroll.hasClients) return;
    final viewport = RenderAbstractViewport.maybeOf(box);
    if (viewport == null) return;
    final position = _scroll.position;
    final target = viewport
        .getOffsetToReveal(box, 0.5)
        .offset
        .clamp(position.minScrollExtent, position.maxScrollExtent);
    _scroll.animateTo(target, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
  }

  @override
  Widget build(BuildContext context) {
    final categories = widget.categories;
    if (!categories.hasValue && !categories.hasError) {
      // Đang tải lần đầu: vài chip xám giữ chỗ.
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        physics: const NeverScrollableScrollPhysics(),
        child: Row(
          children: [
            for (final w in [70.0, 84.0, 64.0, 56.0, 110.0])
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: SkeletonBox(width: w, height: 40, radius: 999),
              ),
          ],
        ),
      );
    }

    // Tải danh mục lỗi: chỉ còn chip "Tất cả" (danh sách món vẫn dùng được). Kéo xuống để tải lại.
    final list = categories.valueOrNull ?? const <Category>[];

    if (_revealed != widget.selected) {
      _revealed = widget.selected;
      WidgetsBinding.instance.addPostFrameCallback((_) => _revealSelected());
    }

    // Ít chip (dưới 20) nên vẽ hết một lần bằng Row, không cần ListView.
    return SingleChildScrollView(
      controller: _scroll,
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          _chip(null, 'Tất cả'),
          for (final c in list) _chip(c.slug, c.name),
        ],
      ),
    );
  }

  Widget _chip(String? slug, String label) {
    final selected = slug == widget.selected;
    return Padding(
      key: _keys.putIfAbsent(slug, GlobalKey.new),
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) {
          if (!selected) widget.onSelected(slug);
        },
        labelStyle: TextStyle(
          color: selected ? AppColors.white : AppColors.slate800,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
        ),
        side: BorderSide(color: selected ? AppColors.ocean900 : AppColors.slate200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      ),
    );
  }
}
