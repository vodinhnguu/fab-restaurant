// Đơn hàng / lịch đặt bàn khách CHƯA ĐĂNG NHẬP đã tạo trên máy này (mục 4 docs/16).
//
// Sau khi đặt thành công (S09, S17):
//   ref.read(guestOrdersProvider.notifier).add(GuestEntry(code: ..., phone: ..., time: DateTime.now()));
// S15 / S20 đọc danh sách rồi tra từng mã:
//   final entries = ref.watch(guestOrdersProvider);

import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/guest_entry.dart';
import 'app_providers.dart';

class GuestHistoryNotifier extends Notifier<List<GuestEntry>> {
  GuestHistoryNotifier(this._key);

  final String _key; // 'guestOrders' hoặc 'guestReservations'
  static const _maxEntries = 50; // giữ 50 mã mới nhất là đủ

  @override
  List<GuestEntry> build() {
    final raw = ref.read(sharedPreferencesProvider).getString(_key);
    if (raw == null) return const [];
    try {
      return [for (final e in jsonDecode(raw) as List) GuestEntry.fromJson(e as Map<String, dynamic>)];
    } catch (_) {
      return const [];
    }
  }

  /// Thêm mã mới lên đầu danh sách (trùng mã thì thay bản cũ).
  void add(GuestEntry entry) {
    final list = [entry, ...state.where((e) => e.code != entry.code)];
    _save(list.length > _maxEntries ? list.sublist(0, _maxEntries) : list);
  }

  /// Bỏ 1 mã (vd tra không còn thấy đơn đó nữa).
  void remove(String code) => _save(state.where((e) => e.code != code).toList());

  void _save(List<GuestEntry> list) {
    state = list;
    ref.read(sharedPreferencesProvider).setString(_key, jsonEncode([for (final e in list) e.toJson()]));
  }
}

/// Đơn hàng đặt khi chưa đăng nhập (cho S15).
final guestOrdersProvider =
    NotifierProvider<GuestHistoryNotifier, List<GuestEntry>>(() => GuestHistoryNotifier('guestOrders'));

/// Lịch đặt bàn khi chưa đăng nhập (cho S20).
final guestReservationsProvider =
    NotifierProvider<GuestHistoryNotifier, List<GuestEntry>>(() => GuestHistoryNotifier('guestReservations'));
