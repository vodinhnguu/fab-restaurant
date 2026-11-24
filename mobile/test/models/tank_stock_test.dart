// Tồn hồ hải sản trên app (docs/27-ton-ho-hai-san.md): món bán theo kg đọc được còn bao nhiêu kg trong hồ.
// App chỉ HIỆN tồn để phục vụ tư vấn khách, không chặn ghi món (xem docs/27 mục 2).

import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/models/dish.dart';

void main() {
  Dish dish(Map<String, Object?> json) => Dish.fromJson({
        'id': 9,
        'name': 'Tôm hùm nướng phô mai',
        'slug': 'tom-hum-nuong-pho-mai',
        'price': 1890000,
        'unit': 'kg',
        'category': {'id': 1, 'name': 'Tôm hùm', 'slug': 'tom-hum'},
        ...json,
      });

  group('Dish đọc tồn hồ từ API', () {
    test('món bán theo kg: lấy đủ tên loại, tồn, ngưỡng gần hết', () {
      final d = dish({
        'tankItem': {'id': 1, 'name': 'Tôm hùm', 'stockKg': 3.2, 'lowStockKg': 3, 'isActive': true},
      });
      expect(d.soldByWeight, isTrue);
      expect(d.tankName, 'Tôm hùm');
      expect(d.tankStockKg, 3.2);
      expect(d.tankLowKg, 3);
      expect(d.tankEmpty, isFalse);
      expect(d.tankLow, isFalse, reason: '3,2 kg vẫn trên ngưỡng 3 kg');
    });

    test('tồn bằng đúng ngưỡng: tính là gần hết', () {
      final d = dish({
        'tankItem': {'name': 'Tôm hùm', 'stockKg': 3, 'lowStockKg': 3, 'isActive': true},
      });
      expect(d.tankLow, isTrue);
      expect(d.tankEmpty, isFalse);
    });

    test('hồ hết hàng: tankEmpty, không tính là gần hết', () {
      final d = dish({
        'tankItem': {'name': 'Tôm hùm', 'stockKg': 0, 'lowStockKg': 3, 'isActive': true},
      });
      expect(d.tankEmpty, isTrue);
      expect(d.tankLow, isFalse);
    });

    test('món theo phần (không có tankItem): không có tồn, không hiện gì', () {
      final d = dish({'unit': 'phần', 'name': 'Cơm chiên hải sản'});
      expect(d.soldByWeight, isFalse);
      expect(d.tankStockKg, isNull);
      expect(d.tankEmpty, isFalse);
      expect(d.tankLow, isFalse);
    });

    test('đơn / API cũ chưa có tankItem: không lỗi', () {
      final d = dish({});
      expect(d.tankStockKg, isNull);
      expect(d.tankName, isNull);
    });

    test('hết hàng vẫn thêm được vào phiếu (app không chặn, docs/27 mục 2)', () {
      final d = dish({
        'tankItem': {'name': 'Tôm hùm', 'stockKg': 0, 'lowStockKg': 3, 'isActive': true},
      });
      final line = d.toCartItem(weight: 1.2);
      expect(line.dishId, 9);
      expect(line.weight, 1.2);
      expect(line.quantity, 1, reason: 'món theo kg luôn 1 dòng, số lượng tính bằng kg');
    });
  });
}
