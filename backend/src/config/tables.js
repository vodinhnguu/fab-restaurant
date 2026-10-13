// =============================================================
//  Sơ đồ bàn mặc định. Tài liệu: docs/13-so-do-ban.md
//
//  Mỗi khu vực là 1 lưới; x = cột, y = hàng (bắt đầu từ 1).
//  Tên khu vực phải khớp restaurant.reservationAreas.
//  Chỉ dùng để tạo bàn lần đầu; sau đó dữ liệu nằm trong bảng DiningTable.
// =============================================================

// [mã bàn, số ghế, cột, hàng]
const layout = {
  'Trong nhà': [
    ['T01', 2, 1, 1], ['T02', 2, 2, 1], ['T03', 4, 3, 1], ['T04', 4, 4, 1],
    ['T05', 4, 1, 2], ['T06', 4, 2, 2], ['T07', 6, 3, 2], ['T08', 6, 4, 2],
    ['T09', 2, 1, 3], ['T10', 2, 2, 3], ['T11', 8, 3, 3], ['T12', 10, 4, 3],
  ],
  // Hàng 1 sát biển
  'Ngoài trời - view biển': [
    ['B01', 2, 1, 1], ['B02', 2, 2, 1], ['B03', 4, 3, 1], ['B04', 4, 4, 1],
    ['B05', 4, 1, 2], ['B06', 6, 2, 2], ['B07', 6, 3, 2], ['B08', 8, 4, 2],
  ],
  'Phòng VIP': [
    ['VIP1', 10, 1, 1], ['VIP2', 12, 2, 1], ['VIP3', 20, 3, 1],
  ],
};

export const DEFAULT_TABLES = Object.entries(layout).flatMap(([area, tables]) =>
  tables.map(([code, seats, x, y]) => ({ code, area, seats, x, y })),
);

// Tạo bàn mặc định nếu chưa có (chạy nhiều lần không trùng). Nhận `db` để seed.js dùng lại.
export async function seedDefaultTables(db) {
  await db.diningTable.createMany({ data: DEFAULT_TABLES, skipDuplicates: true });
}
