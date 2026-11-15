// Kiểm tra giỏ hàng: cộng dồn, tối đa 50, xóa / hoàn tác, ghi chú, lưu trên máy.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:fab_seafood/models/cart_item.dart';
import 'package:fab_seafood/state/app_providers.dart';
import 'package:fab_seafood/state/cart_state.dart';

const tom = CartItem(dishId: 1, name: 'Tôm sú hấp bia', slug: 'tom-su-hap-bia', price: 289000, category: 'Tôm');
const ca = CartItem(dishId: 2, name: 'Cá vược nướng', slug: 'ca-vuoc-nuong', price: 250000, category: 'Cá');

Future<ProviderContainer> makeContainer() async {
  final prefs = await SharedPreferences.getInstance();
  final container = ProviderContainer(overrides: [sharedPreferencesProvider.overrideWithValue(prefs)]);
  addTearDown(container.dispose);
  return container;
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('Thêm món đã có thì cộng dồn, tối đa 50', () async {
    final c = await makeContainer();
    final cart = c.read(cartProvider.notifier);

    cart.add(tom.copyWith(quantity: 2));
    cart.add(tom.copyWith(quantity: 3));
    expect(c.read(cartProvider).single.quantity, 5);

    cart.add(tom.copyWith(quantity: 100));
    expect(c.read(cartProvider).single.quantity, 50);
  });

  test('Số lượng về 0 thì xóa món', () async {
    final c = await makeContainer();
    final cart = c.read(cartProvider.notifier);
    cart.add(tom);
    cart.setQuantity(tom.dishId, 0);
    expect(c.read(cartProvider), isEmpty);
  });

  test('Xóa rồi "Hoàn tác" thì món về đúng vị trí cũ, giữ ghi chú', () async {
    final c = await makeContainer();
    final cart = c.read(cartProvider.notifier);
    cart.add(tom);
    cart.add(ca);
    cart.setNote(tom.dishId, 'Ít cay');

    final removed = cart.remove(tom.dishId)!;
    expect(c.read(cartProvider).map((i) => i.dishId), [2]);

    cart.restore(removed);
    expect(c.read(cartProvider).map((i) => i.dishId), [1, 2]);
    expect(c.read(cartProvider).first.note, 'Ít cay');
  });

  test('Ghi chú bỏ khoảng trắng thừa, cắt ở 200 ký tự', () async {
    final c = await makeContainer();
    final cart = c.read(cartProvider.notifier);
    cart.add(tom);

    cart.setNote(tom.dishId, '  Không hành  ');
    expect(c.read(cartProvider).single.note, 'Không hành');

    cart.setNote(tom.dishId, 'a' * 250);
    expect(c.read(cartProvider).single.note.length, 200);
  });

  test('Tổng số phần và tạm tính', () async {
    final c = await makeContainer();
    final cart = c.read(cartProvider.notifier);
    cart.add(tom.copyWith(quantity: 2)); // 578.000
    cart.add(ca); // 250.000

    expect(c.read(cartCountProvider), 3);
    expect(c.read(cartSubtotalProvider), 828000);
  });

  test('Tắt app mở lại (container mới) giỏ vẫn còn', () async {
    final first = await makeContainer();
    first.read(cartProvider.notifier)
      ..add(tom.copyWith(quantity: 2))
      ..setNote(tom.dishId, '2 phần ít cay');

    final second = await makeContainer(); // cùng kho lưu, như mở lại app
    final items = second.read(cartProvider);
    expect(items.single.quantity, 2);
    expect(items.single.note, '2 phần ít cay');
  });
}
