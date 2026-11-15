// S25. Thông tin nhà hàng: xem docs/16-dac-ta-app-mobile-stitch.md mục S25
// API: GET /info (đã tải sẵn ở S01, lấy từ state/info_state.dart)
// Thiết kế: design/S25.png

import 'package:flutter/material.dart';

import '../../widgets/placeholder_screen.dart';

class RestaurantInfoScreen extends StatelessWidget {
  const RestaurantInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO(Bước 8): thay khung giữ chỗ bằng giao diện thật.
    return const PlaceholderScreen(code: 'S25', title: 'Thông tin nhà hàng');
  }
}
