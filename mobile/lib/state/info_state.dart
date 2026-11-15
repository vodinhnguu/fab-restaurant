// Thông tin nhà hàng (GET /info) dùng chung cả app: hotline, giờ mở cửa, phí ship...
//
// Trong màn hình:
//   final info = ref.watch(infoProvider);          // AsyncValue: đang tải / lỗi / có dữ liệu
//   info.when(loading: ..., error: ..., data: (i) => Text(i.phone));
// Hoặc khi chắc chắn đã tải xong (sau S01):
//   final info = ref.watch(infoProvider).valueOrNull;
//
// Tải lại (nút "Thử lại"): ref.invalidate(infoProvider)

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/restaurant_info.dart';
import '../services/info_service.dart';

final infoProvider = FutureProvider<RestaurantInfo>((ref) => ref.watch(infoServiceProvider).fetch());
