// =============================================================
//  Ma trận phân quyền: DANH SÁCH CHỨC NĂNG + VAI TRÒ MẶC ĐỊNH
//  Tài liệu: docs/12-ma-tran-phan-quyen.md
//
//  - MODULES: các chức năng trong nhà hàng (cố định trong code, muốn thêm thì sửa ở đây)
//  - DEFAULT_ROLES: 12 vai trò tạo sẵn lần đầu (sau đó admin chỉnh trên giao diện, lưu ở DB)
// =============================================================

// 4 quyền trên mỗi chức năng
export const ACTIONS = [
  { key: 'view', label: 'Xem' },
  { key: 'create', label: 'Thêm' },
  { key: 'edit', label: 'Sửa' },
  { key: 'delete', label: 'Xóa' },
];

export const MODULES = [
  { key: 'DASHBOARD', name: 'Tổng quan & báo cáo', description: 'Doanh thu, thống kê đơn hàng, món bán chạy' },
  { key: 'ORDERS', name: 'Đơn hàng & gọi món', description: 'Tạo đơn tại bàn, đơn online, cập nhật trạng thái' },
  { key: 'RESERVATIONS', name: 'Đặt bàn', description: 'Nhận lịch đặt bàn, xếp bàn, xác nhận / hủy' },
  { key: 'MENU', name: 'Thực đơn & danh mục', description: 'Món ăn, giá bán, bật / tắt món hết hàng' },
  { key: 'KITCHEN', name: 'Phiếu bếp & chế biến', description: 'Nhận phiếu bếp, báo món đang làm / đã xong' },
  { key: 'SEAFOOD_TANK', name: 'Hồ hải sản & nhập hàng', description: 'Theo dõi hải sản sống, cân ký, nhập / xuất hồ' },
  { key: 'PAYMENTS', name: 'Thu ngân & thanh toán', description: 'Tính tiền, in hóa đơn, đối soát VNPay' },
  // Trang: app Quản lý màn Kiểm bia nước (docs/29-kiem-bia-nuoc.md). Xem = xem phiếu kiểm,
  // Sửa = ghi số xuất / trả lại, Thêm + Xóa = sửa quy cách thùng, tắt / bật loại
  { key: 'DRINKS', name: 'Bia nước & kiểm kho quầy', description: 'Xuất bia nước ra quầy theo thùng, kiểm số trả lại cuối ngày' },
  { key: 'COUPONS', name: 'Khuyến mãi & mã giảm giá', description: 'Tạo và áp dụng mã giảm giá' },
  { key: 'REVIEWS', name: 'Đánh giá khách hàng', description: 'Xem, phản hồi, ẩn đánh giá' },
  { key: 'STAFF', name: 'Nhân sự & phân quyền', description: 'Tài khoản nhân viên, vai trò, ma trận quyền' },
  { key: 'FACILITY', name: 'Thiết bị & bảo trì', description: 'Báo hỏng, sửa chữa điện nước, máy lạnh, hệ thống hồ' },
  // Trang: /admin/cleaning (docs/20-ve-sinh.md). Xem = vào 4 trang vệ sinh, Thêm = báo cần dọn / thêm việc,
  // Sửa = nhận và làm việc, Xóa = hủy việc + quản lý danh sách khu vực
  { key: 'CLEANING', name: 'Vệ sinh & dọn dẹp', description: 'Rửa chén bát, rửa ly, quét lau sàn, dọn nhà vệ sinh, đổ rác' },
];

export const MODULE_KEYS = MODULES.map((m) => m.key);
export const OWNER_KEY = 'OWNER'; // Chủ nhà hàng: luôn toàn quyền, không sửa được

// Viết tắt quyền: V = Xem, C = Thêm, E = Sửa, D = Xóa. Chức năng không ghi = không có quyền.
const ALL = Object.fromEntries(MODULE_KEYS.map((k) => [k, 'VCED']));

export const DEFAULT_ROLES = [
  { key: 'OWNER', name: 'Chủ nhà hàng', description: 'Toàn quyền, xem mọi báo cáo và quyết định cuối cùng', perms: ALL },
  { key: 'ADMIN', name: 'Admin', description: 'Quản trị hệ thống, tài khoản và cấu hình website', perms: ALL },
  {
    key: 'MANAGER',
    name: 'Quản lý',
    description: 'Điều hành ca, xử lý khiếu nại, duyệt thực đơn và khuyến mãi',
    perms: { DASHBOARD: 'V', ORDERS: 'VCED', RESERVATIONS: 'VCED', MENU: 'VCED', KITCHEN: 'VCE', SEAFOOD_TANK: 'VCE', PAYMENTS: 'VE', DRINKS: 'VCED', COUPONS: 'VCED', REVIEWS: 'VD', STAFF: 'V', FACILITY: 'VCE', CLEANING: 'VCED' },
  },
  {
    key: 'TEAM_LEAD',
    name: 'Tổ trưởng',
    description: 'Phân công nhân viên trong ca, giám sát phục vụ tại khu vực',
    perms: { DASHBOARD: 'V', ORDERS: 'VCE', RESERVATIONS: 'VCE', MENU: 'V', KITCHEN: 'V', SEAFOOD_TANK: 'V', PAYMENTS: 'V', DRINKS: 'V', REVIEWS: 'V', STAFF: 'V', FACILITY: 'VC', CLEANING: 'VCE' },
  },
  {
    key: 'WAITER',
    name: 'Nhân viên phục vụ',
    description: 'Đón khách tại bàn, ghi món, tư vấn hải sản trong hồ, dọn bàn sau khi khách về',
    perms: { ORDERS: 'VCE', RESERVATIONS: 'V', MENU: 'V', KITCHEN: 'V', SEAFOOD_TANK: 'V', FACILITY: 'C', CLEANING: 'VC' },
  },
  {
    key: 'RECEPTIONIST',
    name: 'Lễ tân',
    description: 'Nghe điện thoại, nhận đặt bàn, đón và xếp chỗ cho khách',
    perms: { ORDERS: 'V', RESERVATIONS: 'VCE', MENU: 'V', COUPONS: 'V', REVIEWS: 'V', FACILITY: 'C', CLEANING: 'VC' },
  },
  {
    key: 'CASHIER',
    name: 'Thu ngân',
    description: 'Tính tiền, áp mã giảm giá, in hóa đơn, chốt tiền cuối ca',
    perms: { DASHBOARD: 'V', ORDERS: 'VE', RESERVATIONS: 'V', MENU: 'V', PAYMENTS: 'VCE', DRINKS: 'VE', COUPONS: 'V' },
  },
  {
    key: 'TECHNICIAN',
    name: 'Nhân viên kỹ thuật',
    description: 'Bảo trì điện nước, máy lạnh, hệ thống lọc và sục khí hồ',
    perms: { KITCHEN: 'V', SEAFOOD_TANK: 'V', FACILITY: 'VCED' },
  },
  {
    key: 'CLEANER',
    name: 'Tạp vụ',
    description: 'Vệ sinh quanh nhà hàng: rửa chén bát, rửa ly, quét lau sàn, dọn nhà vệ sinh, đổ rác (dọn bàn là việc của phục vụ)',
    perms: { FACILITY: 'C', CLEANING: 'VCE' },
  },
  {
    key: 'KITCHEN',
    name: 'Bếp',
    description: 'Sơ chế và chế biến món, báo món hết nguyên liệu',
    perms: { ORDERS: 'V', MENU: 'VE', KITCHEN: 'VCE', SEAFOOD_TANK: 'VE', FACILITY: 'VC', CLEANING: 'VC' },
  },
  {
    key: 'RUNNER',
    name: 'Nhân viên tiếp thực',
    description: 'Nhận món từ bếp, mang ra đúng bàn, báo đã ra món',
    perms: { ORDERS: 'VE', RESERVATIONS: 'V', MENU: 'V', KITCHEN: 'VE' },
  },
  {
    key: 'SEAFOOD_KEEPER',
    name: 'Nhân viên hồ hải sản',
    description: 'Chăm sóc hồ, vớt và cân hải sản, nhập hàng, báo hải sản hết / chết',
    perms: { ORDERS: 'V', MENU: 'VE', KITCHEN: 'V', SEAFOOD_TANK: 'VCED', FACILITY: 'VC' },
  },
];

// 'VCE' -> { canView: true, canCreate: true, canEdit: true, canDelete: false }
export function lettersToFlags(letters = '') {
  return {
    canView: letters.includes('V'),
    canCreate: letters.includes('C'),
    canEdit: letters.includes('E'),
    canDelete: letters.includes('D'),
  };
}
