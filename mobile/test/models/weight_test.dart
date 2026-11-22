// Món bán theo kg (hải sản sống, docs/24-thuc-don-ban-theo-kg.md): định dạng số kg, tiền dòng món.

import 'package:flutter_test/flutter_test.dart';

import 'package:fab_seafood/models/cart_item.dart';
import 'package:fab_seafood/models/order.dart';
import 'package:fab_seafood/models/status.dart';
import 'package:fab_seafood/utils/format.dart';

void main() {
  test('formatKg: dấu phẩy thập phân, bỏ số 0 thừa', () {
    expect(formatKg(1.25), '1,25 kg');
    expect(formatKg(0.5), '0,5 kg');
    expect(formatKg(2), '2 kg');
    expect(formatKg(10), '10 kg');
    expect(formatKg(1.105), '1,105 kg');
  });

  group('OrderItem', () {
    OrderItem item(Map<String, Object?> json) =>
        OrderItem.fromJson({'id': 1, 'dishId': 1, 'name': 'Tôm hùm', 'price': 1890000, 'quantity': 1, ...json});

    test('Chờ cân, có số kg phục vụ ghi: tiền tạm = giá 1 kg × số kg', () {
      final i = item({'status': 'WEIGHING', 'weight': 1});
      expect(i.status, OrderItemStatus.weighing);
      expect(i.isWeighing, isTrue);
      expect(i.lineTotal, 1890000);
      expect(item({'status': 'WEIGHING', 'weight': 0.98}).lineTotal, 1852200);
    });

    test('Chờ cân, chưa có số kg (đơn gửi từ bản app cũ): chưa có tiền', () {
      final i = item({'status': 'WEIGHING'});
      expect(i.isByWeight, isTrue);
      expect(i.lineTotal, 0);
    });

    test('Đã cân: giá 1 kg × số kg, làm tròn đồng', () {
      final i = item({'status': 'PENDING', 'weight': 1.25});
      expect(i.isByWeight, isTrue);
      expect(i.isWeighing, isFalse);
      expect(i.lineTotal, 2362500);
      expect(item({'status': 'PENDING', 'weight': 1.333}).lineTotal, 2519370);
    });

    test('Món theo phần: giá × số phần', () {
      final i = item({'price': 89000, 'quantity': 2, 'status': 'PENDING'});
      expect(i.isByWeight, isFalse);
      expect(i.lineTotal, 178000);
    });
  });

  test('Phiếu gọi món: món theo kg mặc định 1 kg, tiền tạm = giá 1 kg × số kg (làm tròn đồng)', () {
    const lobster = CartItem(dishId: 1, name: 'Tôm hùm', slug: 'tom-hum', price: 1890000, unit: 'kg');
    const rice = CartItem(dishId: 2, name: 'Cơm chiên', slug: 'com-chien', price: 89000, unit: 'phần', quantity: 2);
    expect(lobster.soldByWeight, isTrue);
    expect(lobster.weight, 1);
    expect(lobster.lineTotal, 1890000);
    expect(lobster.copyWith(weight: 0.98).lineTotal, 1852200);
    expect(lobster.copyWith(weight: 1.333).lineTotal, 2519370);
    expect(rice.soldByWeight, isFalse);
    expect(rice.lineTotal, 178000); // món theo phần không dùng số kg
  });

  test('Phiếu gọi món lưu / đọc số kg; phiếu lưu từ bản cũ (chưa có số kg) thì 1 kg', () {
    const lobster = CartItem(dishId: 1, name: 'Tôm hùm', slug: 'tom-hum', price: 1890000, unit: 'kg', weight: 0.98);
    expect(CartItem.fromJson(lobster.toJson()).weight, 0.98);
    final old = lobster.toJson()..remove('weight');
    expect(CartItem.fromJson(old).weight, 1);
  });

  test('formatDecimal / parseDecimal: gõ dấu phẩy hay dấu chấm đều được', () {
    expect(formatDecimal(0.98), '0,98');
    expect(formatDecimal(1), '1');
    expect(formatDecimal(0.1 + 0.2), '0,3'); // không hiện 0,30000000000000004
    expect(parseDecimal('0,98'), 0.98);
    expect(parseDecimal(' 0.98 '), 0.98);
    expect(parseDecimal('2'), 2);
    for (final bad in ['', 'abc', '1,2,3', '-1', '1.', ',5']) {
      expect(parseDecimal(bad), isNull, reason: bad);
    }
  });
}
