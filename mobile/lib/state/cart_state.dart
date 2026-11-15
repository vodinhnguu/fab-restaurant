// Giỏ hàng dùng chung cả app, lưu trên máy (tắt app mở lại vẫn còn, đăng xuất vẫn giữ).
// Quy tắc: mục S06, S07, S08 docs/16 (giống frontend/src/stores/cart.js).
//
// Đọc trong màn hình:
//   final items = ref.watch(cartProvider);           // List<CartItem>
//   final count = ref.watch(cartCountProvider);      // tổng số phần, vd 3
//   final subtotal = ref.watch(cartSubtotalProvider); // tạm tính, vd 850000
//
// Làm việc:
//   final cart = ref.read(cartProvider.notifier);
//   cart.add(item);                  // thêm / cộng dồn
//   cart.setQuantity(dishId, 2);     // 0 = xóa món
//   final removed = cart.remove(dishId);  ...  cart.restore(removed!);   // "Hoàn tác"

import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/cart_item.dart';
import 'app_providers.dart';

/// Món vừa xóa và vị trí cũ của nó, để nút "Hoàn tác" đặt lại đúng chỗ.
class RemovedCartItem {
  const RemovedCartItem(this.item, this.index);
  final CartItem item;
  final int index;
}

class CartNotifier extends Notifier<List<CartItem>> {
  static const maxQuantity = 50; // mỗi món tối đa 50 phần
  static const maxNoteLength = 200; // ghi chú mỗi món tối đa 200 ký tự
  static const _key = 'cart';

  @override
  List<CartItem> build() {
    final raw = ref.read(sharedPreferencesProvider).getString(_key);
    if (raw == null) return const [];
    try {
      final list = jsonDecode(raw) as List;
      return [for (final e in list) CartItem.fromJson(e as Map<String, dynamic>)];
    } catch (_) {
      return const []; // dữ liệu cũ hỏng thì bỏ, không để app lỗi
    }
  }

  /// Thêm món. Món đã có thì cộng dồn số lượng (tối đa 50), giữ nguyên ghi chú cũ.
  void add(CartItem item) {
    final index = state.indexWhere((i) => i.dishId == item.dishId);
    if (index == -1) {
      _save([...state, item.copyWith(quantity: _clampQuantity(item.quantity))]);
    } else {
      final old = state[index];
      _save([
        for (final i in state)
          if (i.dishId == item.dishId) old.copyWith(quantity: _clampQuantity(old.quantity + item.quantity)) else i,
      ]);
    }
  }

  /// Đổi số lượng. [quantity] ≤ 0 thì xóa món khỏi giỏ.
  void setQuantity(int dishId, int quantity) {
    if (quantity <= 0) {
      remove(dishId);
      return;
    }
    _save([
      for (final i in state)
        if (i.dishId == dishId) i.copyWith(quantity: _clampQuantity(quantity)) else i,
    ]);
  }

  /// Ghi chú khẩu vị của 1 món (S07). Bỏ khoảng trắng thừa, cắt ở 200 ký tự.
  void setNote(int dishId, String note) {
    var clean = note.trim();
    if (clean.length > maxNoteLength) clean = clean.substring(0, maxNoteLength);
    _save([
      for (final i in state)
        if (i.dishId == dishId) i.copyWith(note: clean) else i,
    ]);
  }

  /// Xóa 1 món. Trả về món đã xóa để làm "Hoàn tác" (null nếu không có món đó).
  RemovedCartItem? remove(int dishId) {
    final index = state.indexWhere((i) => i.dishId == dishId);
    if (index == -1) return null;
    final removed = RemovedCartItem(state[index], index);
    _save([...state]..removeAt(index));
    return removed;
  }

  /// Nút "Hoàn tác" sau khi xóa: đặt món về đúng vị trí cũ.
  void restore(RemovedCartItem removed) {
    if (state.any((i) => i.dishId == removed.item.dishId)) return;
    final list = [...state];
    list.insert(removed.index.clamp(0, list.length), removed.item);
    _save(list);
  }

  /// Xóa hết (nút "Xóa hết" ở S08, hoặc sau khi đặt đơn thành công).
  void clear() => _save(const []);

  int _clampQuantity(int q) => q.clamp(1, maxQuantity);

  void _save(List<CartItem> items) {
    state = items;
    ref.read(sharedPreferencesProvider).setString(_key, jsonEncode([for (final i in items) i.toJson()]));
  }
}

final cartProvider = NotifierProvider<CartNotifier, List<CartItem>>(CartNotifier.new);

/// Tổng số phần trong giỏ (số trên thanh giỏ nổi: "3 món").
final cartCountProvider = Provider<int>(
  (ref) => ref.watch(cartProvider).fold(0, (sum, i) => sum + i.quantity),
);

/// Tạm tính (chỉ để hiển thị, backend tính lại khi đặt).
final cartSubtotalProvider = Provider<int>(
  (ref) => ref.watch(cartProvider).fold(0, (sum, i) => sum + i.lineTotal),
);
