// Dữ liệu thực đơn dùng chung: danh mục (dải chip ở S05).
//
// Tải lại: ref.invalidate(categoriesProvider)

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/category.dart';
import '../services/dish_service.dart';

final categoriesProvider = FutureProvider<List<Category>>((ref) => ref.watch(dishServiceProvider).categories());
