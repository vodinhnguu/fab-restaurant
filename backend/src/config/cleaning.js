// =============================================================
//  Vệ sinh & dọn dẹp (việc của tạp vụ). Tài liệu: docs/20-ve-sinh.md
//
//  - DEFAULT_AREAS: khu vực tạo sẵn lần đầu. Sau đó dữ liệu nằm trong bảng CleaningArea,
//    người có quyền Xóa ở chức năng "Vệ sinh & dọn dẹp" thêm / sửa / ẩn trên trang Khu vực cần dọn.
//  - Dọn bàn sau khi khách về là việc của phục vụ, KHÔNG nằm ở đây.
// =============================================================

// Khu vực quá số giờ này chưa được dọn thì hiện ở mục "Lâu chưa dọn" (trang Tổng quan, Khu vực cần dọn)
export const STALE_HOURS = 4;

// [tên khu vực, việc thường làm]
const areas = [
  ['Khu rửa chén bát', 'Rửa chén, bát, đĩa, nồi sau mỗi lượt khách; giữ bồn rửa và sàn khô ráo'],
  ['Quầy rửa ly', 'Rửa và lau khô ly, cốc, ca bia; xếp lên kệ'],
  ['Nhà vệ sinh nam', 'Lau sàn, bồn cầu, bồn tiểu, gương; thay giấy, xà phòng; đổ rác'],
  ['Nhà vệ sinh nữ', 'Lau sàn, bồn cầu, gương; thay giấy, xà phòng; đổ rác'],
  ['Sảnh & lối vào', 'Quét, lau sàn; lau cửa kính; dọn khu để xe'],
  ['Sàn phòng ăn trong nhà', 'Quét, lau sàn sau mỗi ca (bàn ghế do phục vụ dọn)'],
  ['Sân ngoài trời - view biển', 'Quét lá, cát; nhặt rác quanh khu bàn'],
  ['Phòng VIP', 'Lau sàn, lau kính; hút bụi rèm, thảm'],
  ['Sàn bếp & cống thoát nước', 'Lau sàn bếp chống trơn; thông cống, gom rác lưới chắn'],
  ['Khu tập kết rác', 'Phân loại, đổ rác; rửa thùng rác cuối ngày'],
];

export const DEFAULT_AREAS = areas.map(([name, description], i) => ({ name, description, sortOrder: i + 1 }));

// Tạo khu vực mặc định nếu chưa có (chạy nhiều lần không trùng vì name là unique). Nhận `db` để seed.js dùng lại.
export async function seedDefaultAreas(db) {
  await db.cleaningArea.createMany({ data: DEFAULT_AREAS, skipDuplicates: true });
}
