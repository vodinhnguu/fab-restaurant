// S18. Chọn bàn trên sơ đồ: xem docs/16-dac-ta-app-mobile-stitch.md mục S18
// API: GET /reservations/tables?date=<ISO> → { diningMinutes, areas: [{ name, cols, rows, tables: [...] }] }
// Thiết kế: design/S18.png
//
// Chọn xong thì đóng màn và trả bàn đã chọn về S17: context.pop(banDaChon)

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../widgets/placeholder_screen.dart';

class TablePickerScreen extends StatelessWidget {
  const TablePickerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 6): vẽ sơ đồ bàn theo cols / rows, tô màu theo trạng thái, tự tải lại mỗi 30 giây.
    return PlaceholderScreen(
      code: 'S18',
      title: 'Chọn bàn',
      links: [
        PlaceholderLink('Chọn bàn này → quay về S17', (c) => c.pop()),
      ],
    );
  }
}
