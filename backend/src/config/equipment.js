// =============================================================
//  Kỹ thuật: thiết bị & bảo trì. Tài liệu: docs/22-ky-thuat-bao-tri.md
//
//  - EQUIPMENT_CATEGORIES: nhóm thiết bị (hiện thành từng cụm trên trang Thiết bị)
//  - DEFAULT_EQUIPMENT: thiết bị tạo sẵn lần đầu. Sau đó dữ liệu nằm trong bảng Equipment,
//    người có quyền Xóa ở "Thiết bị & bảo trì" (Kỹ thuật) thêm / sửa / ngưng dùng trên giao diện.
// =============================================================

export const EQUIPMENT_CATEGORIES = ['Điện lạnh', 'Hồ hải sản', 'Bếp', 'Điện nước', 'An toàn', 'Khác'];

// Còn ít hơn số ngày này là tới hạn bảo trì -> hiện "Sắp đến hạn"
export const DUE_SOON_DAYS = 7;

// [tên, nhóm, vị trí, chu kỳ bảo trì (ngày, null = không bảo trì định kỳ)]
const items = [
  ['Máy lạnh phòng ăn trong nhà 1', 'Điện lạnh', 'Trong nhà', 90],
  ['Máy lạnh phòng ăn trong nhà 2', 'Điện lạnh', 'Trong nhà', 90],
  ['Máy lạnh phòng VIP', 'Điện lạnh', 'Phòng VIP', 90],
  ['Tủ đông hải sản', 'Điện lạnh', 'Bếp', 60],
  ['Tủ mát đồ uống', 'Điện lạnh', 'Quầy bar', 90],
  ['Máy sục khí hồ tôm hùm', 'Hồ hải sản', 'Hồ tôm hùm', 30],
  ['Hệ thống lọc nước hồ hải sản', 'Hồ hải sản', 'Khu hồ', 30],
  ['Máy làm lạnh nước hồ (chiller)', 'Hồ hải sản', 'Khu hồ', 60],
  ['Bếp gas công nghiệp', 'Bếp', 'Bếp', 30],
  ['Máy hút khói bếp', 'Bếp', 'Bếp', 30],
  ['Lò nướng than', 'Bếp', 'Bếp', null],
  ['Máy phát điện dự phòng', 'Điện nước', 'Kho sau', 90],
  ['Máy bơm nước', 'Điện nước', 'Kho sau', 180],
  ['Đèn chiếu sáng sân ngoài trời', 'Điện nước', 'Ngoài trời - view biển', null],
  ['Bình nóng lạnh nhà vệ sinh', 'Điện nước', 'Nhà vệ sinh', 180],
  ['Bình chữa cháy', 'An toàn', 'Toàn nhà hàng', 180],
  ['Camera an ninh', 'An toàn', 'Toàn nhà hàng', 180],
  // Người báo không biết là thiết bị nào thì chọn mục này và ghi rõ ở mô tả
  ['Khác / chưa rõ thiết bị', 'Khác', null, null],
];

export const DEFAULT_EQUIPMENT = items.map(([name, category, location, maintenanceDays], i) => ({
  name,
  category,
  location,
  maintenanceDays,
  sortOrder: i + 1,
}));

// Tạo thiết bị mặc định nếu chưa có (chạy nhiều lần không trùng vì name là unique). Nhận `db` để seed.js dùng lại.
export async function seedDefaultEquipment(db) {
  await db.equipment.createMany({ data: DEFAULT_EQUIPMENT, skipDuplicates: true });
}
