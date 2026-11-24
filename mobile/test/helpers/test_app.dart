// Mở cả app trong test (widget test) với server giả, kho lưu giả, khung màn hình cỡ điện thoại.
//
//   final server = await pumpApp(tester, initialLocation: AppRoutes.tables, token: 'abc',
//       api: (req) => req.path == '/dine-in/orders' ? ok(...) : null);

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:fab_seafood/app/routes.dart';
import 'package:fab_seafood/main.dart';
import 'package:fab_seafood/services/token_store.dart';
import 'package:fab_seafood/state/app_providers.dart';
import 'package:fab_seafood/widgets/app_text_field.dart';

import 'fake_server.dart';

/// Xử lý 1 đường dẫn API. Trả null = "không phải việc của tôi" (dùng trả lời mặc định / 404).
typedef FakeRoute = Future<ResponseBody>? Function(RequestOptions request);

Map<String, Object> _perms(String orders) => {
      'ORDERS': {
        'view': orders.contains('V'),
        'create': orders.contains('C'),
        'edit': orders.contains('E'),
        'delete': orders.contains('D'),
      },
      'MENU': {'view': true, 'create': false, 'edit': false, 'delete': false},
    };

/// Nhân viên phục vụ: Xem, Thêm, Sửa đơn hàng (ghi món, lên món, thu tiền).
final phucVuJson = {
  'id': 3,
  'name': 'Lý Phục Vụ',
  'email': 'phucvu@fab.vn',
  'phone': null,
  'role': 'STAFF',
  'staffRole': {'id': 5, 'key': 'WAITER', 'name': 'Nhân viên phục vụ'},
  'permissions': _perms('VCE'),
};

/// Quản lý: như phục vụ + quyền Xem "Tổng quan" (DASHBOARD) → thấy nhóm Quản lý trong app (docs/28).
final quanLyJson = {
  ...phucVuJson,
  'id': 2,
  'name': 'Phạm Quản Lý',
  'email': 'quanly@fab.vn',
  'staffRole': {'id': 4, 'key': 'MANAGER', 'name': 'Quản lý'},
  'permissions': {
    ..._perms('VCE'),
    'DASHBOARD': {'view': true, 'create': false, 'edit': false, 'delete': false},
    'DRINKS': {'view': true, 'create': true, 'edit': true, 'delete': true},
  },
};

/// Thu ngân: Xem, Sửa (thu tiền) nhưng không ghi món.
final thuNganJson = {
  ...phucVuJson,
  'id': 4,
  'name': 'Trần Thu Ngân',
  'email': 'thungan@fab.vn',
  'staffRole': {'id': 7, 'key': 'CASHIER', 'name': 'Thu ngân'},
  'permissions': _perms('VE'),
};

/// Bếp: chỉ xem đơn.
final bepJson = {
  ...phucVuJson,
  'id': 8,
  'name': 'Đỗ Bếp',
  'email': 'bep@fab.vn',
  'staffRole': {'id': 10, 'key': 'KITCHEN', 'name': 'Bếp'},
  'permissions': _perms('V'),
};

/// Tạp vụ: không có quyền đơn hàng → không dùng được app.
final tapVuJson = {
  ...phucVuJson,
  'id': 9,
  'name': 'Võ Tạp Vụ',
  'email': 'tapvu@fab.vn',
  'staffRole': {'id': 11, 'key': 'CLEANER', 'name': 'Tạp vụ'},
  'permissions': _perms(''),
};

/// Khách hàng: không dùng được app.
final khachJson = {
  'id': 7,
  'name': 'Nguyễn Văn An',
  'email': 'khach@fab.vn',
  'phone': '0901234567',
  'role': 'CUSTOMER',
  'staffRole': null,
  'permissions': _perms(''),
};

const categoriesJson = [
  {'id': 1, 'name': 'Khai vị', 'slug': 'khai-vi', 'image': null, '_count': {'dishes': 12}},
  {'id': 2, 'name': 'Tôm', 'slug': 'tom', 'image': null, '_count': {'dishes': 15}},
  {'id': 3, 'name': 'Cá', 'slug': 'ca', 'image': null, '_count': {'dishes': 18}},
];

/// 2 món: Tôm sú (nổi bật, đang giảm giá) và Sashimi (không nổi bật, chưa ai mua).
const dishesJson = [
  {
    'id': 1,
    'name': 'Tôm sú hấp bia',
    'slug': 'tom-su-hap-bia',
    'price': 290000,
    'salePrice': 250000,
    'unit': 'đĩa',
    'image': null,
    'isAvailable': true,
    'isFeatured': true,
    'soldCount': 120,
    'ratingAvg': 4.8,
    'ratingCount': 120,
    'category': {'id': 2, 'name': 'Tôm', 'slug': 'tom'},
  },
  {
    'id': 2,
    'name': 'Sashimi cá hồi Na Uy',
    'slug': 'sashimi-ca-hoi-na-uy',
    'price': 320000,
    'salePrice': null,
    'unit': 'phần',
    'image': null,
    'isAvailable': true,
    'isFeatured': false,
    'soldCount': 0,
    'ratingAvg': 4.9,
    'ratingCount': 185,
    'category': {'id': 5, 'name': 'Món Nhật', 'slug': 'mon-nhat'},
  },
  // Món bán theo kg kèm tồn hồ hải sản (docs/27-ton-ho-hai-san.md)
  {
    'id': 9,
    'name': 'Tôm hùm nướng phô mai',
    'slug': 'tom-hum-nuong-pho-mai',
    'price': 1890000,
    'salePrice': null,
    'unit': 'kg',
    'image': null,
    'isAvailable': true,
    'isFeatured': false,
    'soldCount': 12,
    'ratingAvg': 5,
    'ratingCount': 8,
    'category': {'id': 1, 'name': 'Tôm hùm', 'slug': 'tom-hum'},
    'tankItem': {'id': 1, 'name': 'Tôm hùm', 'stockKg': 3.2, 'lowStockKg': 3, 'isActive': true},
  },
];

/// Đơn đang mở của bàn T02 (id 2), tổng 820.000đ, 3 phần còn tính tiền, chưa phần nào ra bàn:
///   lần 1 (19:05 giờ VN): Tôm sú × 2 "Chờ bếp" (ghi chú Ít cay), Sashimi × 1 "Bếp đang làm"
///   lần 2 (19:40): Bia tươi × 1 đã hủy (Khách đổi món), không tính tiền
final openOrderJson = {
  'id': 50,
  'code': 'FAB261120000050',
  'type': 'DINE_IN',
  'status': 'CONFIRMED',
  'paymentStatus': 'UNPAID',
  'subtotal': 820000,
  'total': 820000,
  'tableId': 2,
  'note': null,
  'billRequestedAt': null,
  'createdAt': '2026-11-20T12:05:00.000Z',
  'staff': {'id': 3, 'name': 'Lý Phục Vụ'},
  'items': [
    {
      'id': 1,
      'dishId': 1,
      'name': 'Tôm sú hấp bia',
      'price': 250000,
      'quantity': 2,
      'status': 'PENDING',
      'note': 'Ít cay',
      'createdAt': '2026-11-20T12:05:00.000Z',
      'dish': {'image': null, 'slug': 'tom-su-hap-bia'},
    },
    {
      'id': 2,
      'dishId': 2,
      'name': 'Sashimi cá hồi Na Uy',
      'price': 320000,
      'quantity': 1,
      'status': 'COOKING',
      'note': null,
      'createdAt': '2026-11-20T12:05:00.000Z',
      'dish': {'image': null, 'slug': 'sashimi-ca-hoi-na-uy'},
    },
    {
      'id': 3,
      'dishId': 3,
      'name': 'Bia tươi',
      'price': 30000,
      'quantity': 1,
      'status': 'CANCELLED',
      'cancelReason': 'Khách đổi món',
      'note': null,
      'createdAt': '2026-11-20T12:40:00.000Z',
      'dish': {'image': null, 'slug': 'bia-tuoi'},
    },
  ],
};

/// Đơn T02 sửa vài trường (vd đã gửi thanh toán, món đã ra bàn) để test từng trường hợp.
Map<String, Object?> openOrderWith({Map<String, Object?> fields = const {}, Map<int, String> itemStatus = const {}}) => {
      ...openOrderJson,
      ...fields,
      'items': [
        for (final item in openOrderJson['items'] as List)
          {...(item as Map<String, Object?>), if (itemStatus.containsKey(item['id'])) 'status': itemStatus[item['id']]},
      ],
    };

/// Sơ đồ: Trong nhà T01 (trống), T02 (đang phục vụ); Ngoài trời B05 (trống). x, y = vị trí trên lưới.
final floorJson = [
  {
    'name': 'Trong nhà',
    'tables': [
      {'id': 1, 'code': 'T01', 'seats': 2, 'x': 1, 'y': 1, 'order': null},
      {
        'id': 2,
        'code': 'T02',
        'seats': 4,
        'x': 2,
        'y': 1,
        'order': {
          'id': 50,
          'code': 'FAB261120000050',
          'status': 'CONFIRMED',
          'total': 820000,
          'itemCount': 3,
          'waitingCount': 3,
          'billRequestedAt': null,
          'createdAt': '2026-11-20T12:05:00.000Z',
        },
      },
    ],
  },
  {
    'name': 'Ngoài trời - view biển',
    'tables': [
      {'id': 17, 'code': 'B05', 'seats': 4, 'x': 1, 'y': 1, 'order': null},
    ],
  },
];

const _tables = {
  1: {'id': 1, 'code': 'T01', 'area': 'Trong nhà', 'seats': 2},
  2: {'id': 2, 'code': 'T02', 'area': 'Trong nhà', 'seats': 4},
  17: {'id': 17, 'code': 'B05', 'area': 'Ngoài trời - view biển', 'seats': 4},
};

/// GET /dine-in/tables/:id: T02 có đơn đang mở, bàn khác trống.
Map<String, Object?> tableDetailJson(int id) => {'table': _tables[id], 'order': id == 2 ? openOrderJson : null};

/// Đơn hôm nay: T02 đang phục vụ, B05 đã thu tiền, T01 đã hủy.
final todayOrdersJson = [
  {
    'id': 50,
    'code': 'FAB261120000050',
    'type': 'DINE_IN',
    'status': 'CONFIRMED',
    'paymentStatus': 'UNPAID',
    'total': 820000,
    'tableId': 2,
    'createdAt': '2026-11-20T12:05:00.000Z',
    'table': _tables[2],
    'staff': {'id': 3, 'name': 'Lý Phục Vụ'},
    'itemCount': 3,
  },
  {
    'id': 49,
    'code': 'FAB261120000049',
    'type': 'DINE_IN',
    'status': 'COMPLETED',
    'paymentStatus': 'PAID',
    'total': 1500000,
    'tableId': 17,
    'createdAt': '2026-11-20T11:00:00.000Z',
    'table': _tables[17],
    'staff': {'id': 3, 'name': 'Lý Phục Vụ'},
    'itemCount': 6,
  },
  {
    'id': 48,
    'code': 'FAB261120000048',
    'type': 'DINE_IN',
    'status': 'CANCELLED',
    'paymentStatus': 'UNPAID',
    'total': 250000,
    'tableId': 1,
    'cancelReason': 'Ghi nhầm bàn',
    'createdAt': '2026-11-20T10:00:00.000Z',
    'table': _tables[1],
    'staff': {'id': 3, 'name': 'Lý Phục Vụ'},
    'itemCount': 1,
  },
];

/// Trả lời mặc định của server giả cho các API "chung" (khi test không tự trả lời).
/// [me]: người đang đăng nhập (GET /auth/me).
Future<ResponseBody>? defaultReply(RequestOptions request, {Map<String, Object?>? me}) {
  final path = request.path;
  final tableMatch = RegExp(r'^/dine-in/tables/(\d+)$').firstMatch(path);
  if (tableMatch != null) {
    final id = int.parse(tableMatch.group(1)!);
    return _tables.containsKey(id) ? ok(tableDetailJson(id)) : apiError(404, 'Không tìm thấy bàn');
  }
  if (path.startsWith('/dishes/')) {
    final dish = dishesJson.where((d) => d['slug'] == path.substring('/dishes/'.length)).firstOrNull;
    return dish == null ? apiError(404, 'Không tìm thấy món ăn') : ok({...dish, 'reviews': [], 'related': []});
  }
  return switch (path) {
    '/auth/me' => me == null ? apiError(401, 'Vui lòng đăng nhập') : ok(me),
    '/dine-in/tables' => ok(floorJson),
    '/dine-in/orders' when request.method == 'GET' => ok(todayOrdersJson),
    '/categories' => ok(categoriesJson),
    '/dishes' => FakeServer.json(200, {
        'success': true,
        'data': dishesJson,
        'meta': {'page': 1, 'totalPages': 1, 'total': dishesJson.length},
      }),
    // App Quản lý (docs/28-app-quan-ly.md)
    '/stats/manager' => ok(managerStatsJson),
    '/stats/cancellations' => ok(cancellationsJson),
    // Kiểm bia nước (docs/29-kiem-bia-nuoc.md)
    '/drinks/check' when request.method == 'GET' => ok(drinkCheckJson),
    '/drinks/check' => ok(drinkCheckJson['rows']),
    _ => null,
  };
}

/// Số liệu màn Quản lý (S15): doanh thu hôm nay 12,5 triệu, tháng 240 triệu, 1 đơn hủy hôm nay.
const managerStatsJson = {
  'today': {
    'revenue': 12500000,
    'orders': 8,
    'avgPerOrder': 1562500,
    'dineIn': {'revenue': 10000000, 'orders': 5},
    'online': {'revenue': 2500000, 'orders': 3},
  },
  'month': {
    'revenue': 240000000,
    'orders': 150,
    'avgPerOrder': 1600000,
    'dineIn': {'revenue': 200000000, 'orders': 120},
    'online': {'revenue': 40000000, 'orders': 30},
    'label': '11/2026',
    'fromDay': 1,
  },
  'cancelled': {
    'today': {'orders': 1, 'amount': 250000},
    'month': {'orders': 6, 'amount': 3400000},
  },
  'tables': {'total': 23, 'busy': 5, 'free': 18, 'billRequested': 2, 'servingAmount': 4200000},
  'drinks': {
    'items': [
      {'dishId': 70, 'name': 'Bia Saigon lon', 'unit': 'lon', 'quantity': 24, 'revenue': 600000},
      {'dishId': 71, 'name': 'Nước suối', 'unit': 'chai', 'quantity': 10, 'revenue': 150000},
    ],
    'quantity': 34,
    'revenue': 750000,
  },
  'tank': [
    {'id': 1, 'name': 'Tôm hùm', 'stockKg': 8.5, 'lowStockKg': 3, 'isLow': false, 'isEmpty': false},
    {'id': 3, 'name': 'Cua gạch', 'stockKg': 1.2, 'lowStockKg': 3, 'isLow': true, 'isEmpty': false},
    {'id': 5, 'name': 'Cá mú', 'stockKg': 0, 'lowStockKg': 5, 'isLow': true, 'isEmpty': true},
  ],
  'topDishes': [
    {'name': 'Tôm hùm nướng phô mai', 'quantity': 4},
    {'name': 'Cơm chiên hải sản', 'quantity': 3},
  ],
};

/// Phiếu kiểm bia nước hôm nay (S17): Bia Tiger thiếu 8 lon, Coca khớp, Heineken chưa kiểm.
const drinkCheckJson = {
  'date': '2026-11-24T17:00:00.000Z',
  'rows': [
    {
      'productId': 8,
      'dishId': 68,
      'name': 'Bia Tiger',
      'unit': 'lon',
      'packSize': 24,
      'issuedPacks': 2,
      'issuedUnits': 0,
      'issued': 48,
      'sold': 10,
      'returned': 30,
      'diff': -8,
      'checked': true,
      'note': '2 lon bị móp',
      'by': 'Đỗ Thu Ngân',
    },
    {
      'productId': 1,
      'dishId': 61,
      'name': 'Coca-Cola',
      'unit': 'lon',
      'packSize': 24,
      'issuedPacks': 1,
      'issuedUnits': 0,
      'issued': 24,
      'sold': 6,
      'returned': 18,
      'diff': 0,
      'checked': true,
      'note': null,
      'by': 'Đỗ Thu Ngân',
    },
    {
      'productId': 9,
      'dishId': 69,
      'name': 'Bia Heineken',
      'unit': 'lon',
      'packSize': 24,
      'issuedPacks': 0,
      'issuedUnits': 0,
      'issued': 0,
      'sold': 4,
      'returned': 0,
      'diff': 0,
      'checked': false,
      'note': null,
      'by': null,
    },
  ],
  'summary': {'issued': 72, 'sold': 20, 'returned': 48, 'diff': -8, 'checked': 2, 'total': 3, 'mismatched': 1},
};

/// Đơn đã hủy (S16): 1 đơn tại quán hủy cả đơn + 1 món hủy lẻ.
const cancellationsJson = {
  'range': 'today',
  'orders': [
    {
      'id': 48,
      'code': 'FAB261120000048',
      'type': 'DINE_IN',
      'total': 250000,
      'cancelReason': 'Ghi nhầm bàn',
      'customerName': 'Khách tại bàn',
      'createdAt': '2026-11-20T10:00:00.000Z',
      'updatedAt': '2026-11-20T10:30:00.000Z',
      'table': {'code': 'T01', 'area': 'Trong nhà'},
      'staff': {'id': 3, 'name': 'Lý Phục Vụ'},
      '_count': {'items': 1},
    },
  ],
  'items': [
    {
      'id': 99,
      'name': 'Tôm sú hấp bia',
      'quantity': 2,
      'price': 690000,
      'weight': null,
      'cancelReason': 'Khách không chờ được',
      'cancelledAt': '2026-11-20T12:30:00.000Z',
      'order': {'id': 50, 'code': 'FAB261120000050', 'type': 'DINE_IN', 'table': {'code': 'T02'}},
    },
  ],
  'summary': {'orders': 1, 'amount': 250000, 'items': 1},
};

/// Trả lời thành công { success: true, data }.
Future<ResponseBody> ok(Object? data) => FakeServer.json(200, {'success': true, 'data': data});

/// Trả lời lỗi { success: false, message }.
Future<ResponseBody> apiError(int status, String message, {Map<String, String> headers = const {}}) =>
    FakeServer.json(status, {'success': false, 'message': message}, headers: headers);

/// Mở app. [token]: giả lập đã đăng nhập từ trước, [me] là người đó (mặc định nhân viên phục vụ).
/// [prefs]: dữ liệu có sẵn trên máy (vd phiếu gọi món). [settle] = false: dừng ở khung hình đầu.
Future<FakeServer> pumpApp(
  WidgetTester tester, {
  String initialLocation = AppRoutes.splash,
  String? token,
  Map<String, Object?>? me,
  Map<String, Object> prefs = const {},
  FakeRoute? api,
  bool settle = true,
}) async {
  // Khung màn hình cỡ điện thoại: 360 × 800
  tester.view.physicalSize = const Size(1080, 2400);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);

  SharedPreferences.setMockInitialValues(prefs);
  final sharedPrefs = await SharedPreferences.getInstance();

  // Thứ tự trả lời: kịch bản riêng của test ([api]) → dữ liệu mặc định → 404.
  final user = me ?? (token == null ? null : phucVuJson);
  final server = FakeServer((request) {
    final custom = api?.call(request);
    if (custom != null) return custom;
    return defaultReply(request, me: user) ?? apiError(404, 'Không tìm thấy ${request.path}');
  });

  await tester.pumpWidget(ProviderScope(
    overrides: [
      sharedPreferencesProvider.overrideWithValue(sharedPrefs),
      tokenStoreProvider.overrideWithValue(MemoryTokenStore(token)),
      dioProvider.overrideWithValue(server.dio),
    ],
    child: FabApp(initialLocation: initialLocation),
  ));
  if (settle) {
    await tester.pumpAndSettle();
  } else {
    await tester.pump();
  }
  return server;
}

/// Lấy "kho" Riverpod của app đang chạy trong test (để đọc phiếu gọi món, gọi API...).
ProviderContainer appContainer(WidgetTester tester) =>
    ProviderScope.containerOf(tester.element(find.byType(FabApp)));

/// Các request app đã gửi tới [path] bằng [method].
List<RequestOptions> sent(FakeServer server, String method, String path) =>
    server.requests.where((r) => r.method == method && r.path == path).toList();

/// Gõ chữ vào ô có nhãn [label] (AppTextField / PasswordField).
Future<void> enterField(WidgetTester tester, String label, String text) async {
  final field = find.descendant(
    of: find.byWidgetPredicate((w) => w is AppTextField && w.label == label),
    matching: find.byType(TextFormField),
  );
  await tester.ensureVisible(field);
  await tester.enterText(field, text);
}

/// Bấm nút có chữ [label] (FilledButton / OutlinedButton / TextButton, kể cả nút có icon).
Future<void> tapButton(WidgetTester tester, String label) async {
  final button = find.ancestor(of: find.text(label), matching: find.byWidgetPredicate(
    (w) => w is FilledButton || w is OutlinedButton || w is TextButton,
  ));
  await tester.ensureVisible(button.first);
  await tester.tap(button.first);
  await tester.pumpAndSettle();
}
