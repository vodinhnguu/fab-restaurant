// Phiếu gọi món của nhân viên (trong code vẫn gọi là "giỏ" / cart): các món đang ghi cho 1 bàn, CHƯA gửi bếp.
// Lưu trên máy (tắt app mở lại vẫn còn), đăng xuất thì xóa. Bàn của phiếu: ticketTableProvider.
// Gửi bếp xong (S08) thì xóa phiếu. "Cất order" (S08) chuyển phiếu sang savedTicketsProvider (cuối file).
//
// Đọc trong màn hình:
//   final items = ref.watch(cartProvider);           // List<CartItem>
//   final count = ref.watch(cartCountProvider);      // tổng số phần, vd 3
//   final subtotal = ref.watch(cartSubtotalProvider); // tạm tính, vd 850000
//   final table = ref.watch(ticketTableProvider);    // bàn đang ghi món, vd B05
//
// Làm việc:
//   final cart = ref.read(cartProvider.notifier);
//   cart.add(item);                  // thêm / cộng dồn
//   cart.setQuantity(dishId, 2);     // 0 = xóa món
//   cart.setWeight(dishId, 0.98);    // món theo kg: số kg (mặc định 1 kg)
//   final removed = cart.remove(dishId);  ...  cart.restore(removed!);   // "Hoàn tác"

import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/cart_item.dart';
import '../utils/notes.dart' as notes; // notes.appendNote, notes.maxNoteLength
import 'app_providers.dart';

/// Món vừa xóa và vị trí cũ của nó, để nút "Hoàn tác" đặt lại đúng chỗ.
class RemovedCartItem {
  const RemovedCartItem(this.item, this.index);
  final CartItem item;
  final int index;
}

class CartNotifier extends Notifier<List<CartItem>> {
  static const maxQuantity = 50; // mỗi món tối đa 50 phần
  // Món theo kg: 0,05 - 30 kg (giống ô cân ở trang Cân hải sản), nút −/+ đổi 0,1 kg
  static const minWeight = 0.05;
  static const maxWeight = 30.0;
  static const weightStep = 0.1;
  static const maxNoteLength = notes.maxNoteLength; // ghi chú mỗi món tối đa 200 ký tự
  static const _key = 'ticket';

  /// Làm tròn tới gam (3 chữ số lẻ) và giữ trong khoảng 0,05 - 30 kg.
  static double clampWeight(double kg) => (kg.clamp(minWeight, maxWeight) * 1000).round() / 1000;

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

  /// Thêm món. Món đã có thì cộng dồn số lượng (tối đa 50 phần; món theo kg cộng số kg, tối đa 30 kg)
  /// và nối ghi chú mới vào ghi chú cũ bằng ", " (ý nào đã có thì bỏ qua, tối đa 200 ký tự).
  /// Xem appendNote ở utils/notes.dart.
  void add(CartItem item) {
    final index = state.indexWhere((i) => i.dishId == item.dishId);
    if (index == -1) {
      _save([...state, _normalize(item).copyWith(note: _cleanNote(item.note))]);
    } else {
      final old = state[index];
      _save([
        for (final i in state)
          if (i.dishId == item.dishId)
            _normalize(old.copyWith(
              quantity: old.quantity + item.quantity,
              weight: old.weight + item.weight,
              note: notes.appendNote(old.note, item.note),
            ))
          else
            i,
      ]);
    }
  }

  /// Món theo kg: luôn 1 dòng (quantity = 1), số kg trong khoảng cho phép. Món theo phần: 1 - 50 phần.
  CartItem _normalize(CartItem i) => i.soldByWeight
      ? i.copyWith(quantity: 1, weight: clampWeight(i.weight))
      : i.copyWith(quantity: _clampQuantity(i.quantity));

  /// Số phần của 1 món đang có trong phiếu (0 = chưa có). S06 dùng để báo khi vượt 50 phần.
  int quantityOf(int dishId) => state.where((i) => i.dishId == dishId).fold(0, (sum, i) => sum + i.quantity);

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

  /// Đổi số kg của món bán theo kg (S08: nút −/+ hoặc gõ số, vd 0,98). Ngoài khoảng 0,05 - 30 kg thì kẹp lại.
  void setWeight(int dishId, double kg) {
    _save([
      for (final i in state)
        if (i.dishId == dishId && i.soldByWeight) i.copyWith(weight: clampWeight(kg)) else i,
    ]);
  }

  /// Ghi chú khẩu vị của 1 món (S07). Bỏ khoảng trắng thừa, cắt ở 200 ký tự.
  void setNote(int dishId, String note) {
    final clean = _cleanNote(note);
    _save([
      for (final i in state)
        if (i.dishId == dishId) i.copyWith(note: clean) else i,
    ]);
  }

  String _cleanNote(String note) {
    final clean = note.trim();
    return clean.length > maxNoteLength ? clean.substring(0, maxNoteLength) : clean;
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

  /// Xóa hết (nút "Xóa hết" ở S08, sau khi gửi bếp, khi đăng xuất).
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

/// Bàn của phiếu gọi món đang ghi.
class TicketTable {
  const TicketTable({required this.id, required this.code});
  final int id;
  final String code; // "B05"

  Map<String, dynamic> toJson() => {'id': id, 'code': code};
  factory TicketTable.fromJson(Map<String, dynamic> json) =>
      TicketTable(id: json['id'] as int, code: json['code'] as String? ?? '');
}

class TicketTableNotifier extends Notifier<TicketTable?> {
  static const _key = 'ticketTable';

  @override
  TicketTable? build() {
    final raw = ref.read(sharedPreferencesProvider).getString(_key);
    if (raw == null) return null;
    try {
      return TicketTable.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  void set(TicketTable? table) {
    state = table;
    final prefs = ref.read(sharedPreferencesProvider);
    if (table == null) {
      prefs.remove(_key);
    } else {
      prefs.setString(_key, jsonEncode(table.toJson()));
    }
  }
}

/// Bàn đang ghi món (null = chưa chọn bàn). Đổi bàn khi phiếu còn món thì S04 hỏi lại trước.
final ticketTableProvider = NotifierProvider<TicketTableNotifier, TicketTable?>(TicketTableNotifier.new);

// ---------------- Order đã cất (S08 nút "Cất order") ----------------
//
// Phục vụ ghi dở món cho 1 bàn mà chưa muốn gửi bếp (khách còn chọn, phải chạy sang bàn khác...): bấm "Cất order".
// Phiếu đang ghi được cất vào danh sách theo từng bàn (nhiều bàn cùng lúc), lưu trên máy này.
// Mở lại bàn đó, bấm "Order" / "Ghi món" (hoặc "Mở order" ở S04) thì món đã cất hiện lại trong phiếu.
//
//   final saved = ref.watch(savedTicketsProvider);            // Map<id bàn, SavedTicket>
//   ref.read(savedTicketsProvider.notifier).stashCurrent();   // "Cất order"
//   ref.read(savedTicketsProvider.notifier).openFor(table);   // ghi món cho bàn: lấy lại order đã cất

/// Order đã cất của 1 bàn: các món (giữ cả ghi chú, số kg món bán theo kg) + lúc cất.
class SavedTicket {
  const SavedTicket({required this.table, required this.items, required this.savedAt});
  final TicketTable table;
  final List<CartItem> items;
  final DateTime savedAt;

  /// Số món (món bán theo kg tính là 1).
  int get count => items.fold(0, (sum, i) => sum + i.quantity);

  Map<String, dynamic> toJson() => {
        'table': table.toJson(),
        'items': [for (final i in items) i.toJson()],
        'savedAt': savedAt.toIso8601String(),
      };

  factory SavedTicket.fromJson(Map<String, dynamic> json) => SavedTicket(
        table: TicketTable.fromJson(json['table'] as Map<String, dynamic>),
        items: [for (final e in json['items'] as List) CartItem.fromJson(e as Map<String, dynamic>)],
        savedAt: DateTime.tryParse(json['savedAt'] as String? ?? '') ?? DateTime.now(),
      );
}

class SavedTicketsNotifier extends Notifier<Map<int, SavedTicket>> {
  static const _key = 'savedTickets';

  @override
  Map<int, SavedTicket> build() {
    final raw = ref.read(sharedPreferencesProvider).getString(_key);
    if (raw == null) return const {};
    try {
      final tickets = [for (final e in jsonDecode(raw) as List) SavedTicket.fromJson(e as Map<String, dynamic>)];
      return {for (final t in tickets) t.table.id: t};
    } catch (_) {
      return const {}; // dữ liệu cũ hỏng thì bỏ, không để app lỗi
    }
  }

  /// "Cất order": phiếu đang ghi → order đã cất của bàn đó; phiếu đang ghi trống lại.
  /// Trả về order vừa cất (null nếu phiếu đang trống, không có gì để cất).
  SavedTicket? stashCurrent() {
    final table = ref.read(ticketTableProvider);
    final items = ref.read(cartProvider);
    if (table == null || items.isEmpty) return null;
    final ticket = SavedTicket(table: table, items: items, savedAt: DateTime.now());
    _save({...state, table.id: ticket});
    ref.read(cartProvider.notifier).clear();
    ref.read(ticketTableProvider.notifier).set(null);
    return ticket;
  }

  /// Bắt đầu ghi món cho bàn [table] (S04 "Order" / "Ghi món" / "Mở order"):
  /// - phiếu đang ghi dở của BÀN KHÁC được cất lại trước (không mất món), trả về để màn hình báo;
  /// - bàn này có order đã cất thì đưa món đã cất vào phiếu đang ghi.
  SavedTicket? openFor(TicketTable table) {
    final current = ref.read(ticketTableProvider);
    final stashedOther = current != null && current.id != table.id ? stashCurrent() : null;
    final saved = state[table.id];
    if (saved != null) {
      final cart = ref.read(cartProvider.notifier);
      for (final item in saved.items) {
        cart.add(item);
      }
      _save({...state}..remove(table.id));
    }
    ref.read(ticketTableProvider.notifier).set(table);
    return stashedOther;
  }

  /// "Hủy order" của 1 bàn: bỏ order đã cất (nếu có).
  void remove(int tableId) {
    if (state.containsKey(tableId)) _save({...state}..remove(tableId));
  }

  /// Đăng xuất: bỏ hết order đã cất (máy có thể đưa cho người khác dùng).
  void clear() => _save(const {});

  void _save(Map<int, SavedTicket> tickets) {
    state = tickets;
    ref.read(sharedPreferencesProvider).setString(_key, jsonEncode([for (final t in tickets.values) t.toJson()]));
  }
}

/// Order đã cất theo id bàn (S03 ô bàn có dấu, S04 nút "Mở order").
final savedTicketsProvider = NotifierProvider<SavedTicketsNotifier, Map<int, SavedTicket>>(SavedTicketsNotifier.new);
