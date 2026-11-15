// S14. Bottom sheet: Đánh giá món (cần đăng nhập)
// Xem docs/16-dac-ta-app-mobile-stitch.md mục S14
// API: POST /reviews { dishId, rating (1-5), comment? }
// Thiết kế: design/S14.png
//
// Mở từ S06 và S13: showReviewSheet(context, dishName: 'Tôm sú hấp bia')

import 'package:flutter/material.dart';

import '../../widgets/placeholder_screen.dart';

Future<void> showReviewSheet(BuildContext context, {required String dishName}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (_) => _ReviewSheet(dishName: dishName),
  );
}

class _ReviewSheet extends StatelessWidget {
  const _ReviewSheet({required this.dishName});

  final String dishName;

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 8): 5 ngôi sao, chữ theo số sao, ô nhận xét, nút "Gửi đánh giá".
    return PlaceholderSheet(code: 'S14', title: 'Đánh giá món', note: dishName);
  }
}
