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

  test('Thêm món đã có kèm ghi chú (S06) thì nối vào ghi chú cũ, bỏ ý trùng', () async {
    final c = await makeContainer();
    final cart = c.read(cartProvider.notifier);

    cart.add(tom.copyWith(note: '  Ít cay '));
    expect(c.read(cartProvider).single.note, 'Ít cay');

    cart.add(tom.copyWith(note: 'Không hành, ít cay'));
    cart.add(tom); // không ghi chú: giữ nguyên
    final item = c.read(cartProvider).single;
    expect(item.note, 'Ít cay, Không hành');
    expect(item.quantity, 3);
    expect(cart.quantityOf(tom.dishId), 3);
    expect(cart.quantityOf(ca.dishId), 0);
  });

  test('Món theo kg: mặc định 1 kg, thêm lần nữa cộng số kg (vẫn 1 dòng), sửa số kg kẹp 0,05 - 30 kg', () async {
    final c = await makeContainer();
    final cart = c.read(cartProvider.notifier);
    const lobster = CartItem(dishId: 9, name: 'Tôm hùm', slug: 'tom-hum', price: 1890000, unit: 'kg', quantity: 3);

    cart.add(lobster); // quantity gửi nhầm 3 thì vẫn 1 dòng 1 kg
    expect(c.read(cartProvider).single.quantity, 1);
    expect(c.read(cartProvider).single.weight, 1);
    expect(c.read(cartCountProvider), 1); // 1 món

    cart.add(lobster.copyWith(weight: 0.5));
    expect(c.read(cartProvider).single.weight, 1.5);

    cart.setWeight(9, 0.98);
    expect(c.read(cartProvider).single.weight, 0.98);
    expect(c.read(cartSubtotalProvider), 1852200);

    cart.setWeight(9, 0.9876); // làm tròn tới gam
    expect(c.read(cartProvider).single.weight, 0.988);
    cart.setWeight(9, 0.01);
    expect(c.read(cartProvider).single.weight, CartNotifier.minWeight);
    cart.setWeight(9, 45);
    expect(c.read(cartProvider).single.weight, CartNotifier.maxWeight);

    cart.setWeight(tom.dishId, 2); // món theo phần không bị đổi
    cart.add(tom);
    cart.setWeight(tom.dishId, 2);
    expect(c.read(cartProvider).last.weight, 1);
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

  group('Order đã cất (savedTicketsProvider)', () {
    test('Cất phiếu giữ số kg + ghi chú, tắt app mở lại vẫn còn; mở lại bàn thì món về phiếu', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final c = ProviderContainer(overrides: [sharedPreferencesProvider.overrideWithValue(prefs)]);
      addTearDown(c.dispose);

      c.read(ticketTableProvider.notifier).set(const TicketTable(id: 5, code: 'B05'));
      c.read(cartProvider.notifier)
        ..add(const CartItem(dishId: 9, name: 'Tôm hùm', slug: 'tom-hum', price: 1890000, unit: 'kg'))
        ..setWeight(9, 0.98)
        ..add(const CartItem(dishId: 4, name: 'Cơm chiên', slug: 'com-chien', price: 89000, quantity: 2, note: 'Ít dầu'));

      final saved = c.read(savedTicketsProvider.notifier).stashCurrent();
      expect(saved?.count, 3);
      expect(c.read(cartProvider), isEmpty);
      expect(c.read(ticketTableProvider), isNull);

      // "Tắt app mở lại": container mới đọc lại từ máy
      final c2 = ProviderContainer(overrides: [sharedPreferencesProvider.overrideWithValue(prefs)]);
      addTearDown(c2.dispose);
      expect(c2.read(savedTicketsProvider)[5]?.items.first.weight, 0.98);

      c2.read(savedTicketsProvider.notifier).openFor(const TicketTable(id: 5, code: 'B05'));
      final items = c2.read(cartProvider);
      expect(items.first.weight, 0.98);
      expect(items.last.note, 'Ít dầu');
      expect(c2.read(ticketTableProvider)?.code, 'B05');
      expect(c2.read(savedTicketsProvider), isEmpty);
    });

    test('Phiếu trống thì không cất gì', () async {
      SharedPreferences.setMockInitialValues({});
      final prefs = await SharedPreferences.getInstance();
      final c = ProviderContainer(overrides: [sharedPreferencesProvider.overrideWithValue(prefs)]);
      addTearDown(c.dispose);
      c.read(ticketTableProvider.notifier).set(const TicketTable(id: 5, code: 'B05'));
      expect(c.read(savedTicketsProvider.notifier).stashCurrent(), isNull);
      expect(c.read(savedTicketsProvider), isEmpty);
    });
  });
}
