// Gọi API món ăn và danh mục. Xem docs/06-api-reference.md mục "Danh mục", "Món ăn".

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/category.dart';
import '../models/dish.dart';
import '../models/dish_detail.dart';
import '../models/paged.dart';
import '../state/app_providers.dart';
import 'api_client.dart';

class DishService {
  DishService(this._api);
  final ApiClient _api;

  /// GET /categories → danh mục kèm số món.
  Future<List<Category>> categories() async {
    final res = await _api.get('/categories');
    return [for (final c in res.data as List) Category.fromJson(c as Map<String, dynamic>)];
  }

  /// GET /dishes. [category] là slug danh mục. Món hết hàng backend tự ẩn khỏi danh sách.
  Future<Paged<Dish>> dishes({
    String? search,
    String? category,
    bool featured = false,
    DishSort sort = DishSort.popular,
    int page = 1,
    int limit = 12,
  }) async {
    final res = await _api.get('/dishes', query: {
      'search': search,
      'category': category,
      if (featured) 'featured': 'true',
      'sort': sort.apiValue,
      'page': page,
      'limit': limit,
    });
    final meta = res.meta ?? const {};
    return Paged(
      items: [for (final d in res.data as List) Dish.fromJson(d as Map<String, dynamic>)],
      page: meta['page'] as int? ?? page,
      totalPages: meta['totalPages'] as int? ?? 1,
      total: meta['total'] as int? ?? 0,
    );
  }

  /// GET /dishes/:slug → món + 20 đánh giá mới nhất + 4 món cùng danh mục (S06).
  /// Không có món: ApiException 404 "Không tìm thấy món ăn".
  Future<DishDetail> detail(String slug) async {
    final res = await _api.get('/dishes/${Uri.encodeComponent(slug)}');
    return DishDetail.fromJson(res.data as Map<String, dynamic>);
  }
}

final dishServiceProvider = Provider<DishService>((ref) => DishService(ref.watch(apiClientProvider)));

/// Cách sắp xếp món (nút "Sắp xếp" ở S05). [apiValue] là giá trị `sort=` gửi lên backend.
/// Lưu ý: backend xếp theo giá gốc (`price`), không theo giá khuyến mãi.
enum DishSort {
  popular('popular', 'Bán chạy'),
  newest('newest', 'Mới nhất'),
  rating('rating', 'Đánh giá cao'),
  priceAsc('price_asc', 'Giá thấp → cao'),
  priceDesc('price_desc', 'Giá cao → thấp');

  const DishSort(this.apiValue, this.label);
  final String apiValue;
  final String label;
}
