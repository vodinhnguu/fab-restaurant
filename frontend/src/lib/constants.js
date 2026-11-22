export const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', color: 'amber' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
  PREPARING: { label: 'Đang chế biến', color: 'indigo' },
  DELIVERING: { label: 'Đang giao', color: 'cyan' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
};

// Bước admin có thể chuyển tiếp (khớp với STATUS_FLOW ở backend)
export const NEXT_STATUS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['DELIVERING', 'COMPLETED', 'CANCELLED'],
  DELIVERING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const RESERVATION_STATUS = {
  PENDING: { label: 'Chờ xác nhận', color: 'amber' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
  COMPLETED: { label: 'Đã đến', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
};

export const PAYMENT_STATUS = {
  UNPAID: { label: 'Chưa thanh toán', color: 'amber' },
  PAID: { label: 'Đã thanh toán', color: 'green' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'slate' },
};

// Kết quả từng lần thanh toán qua VNPay (bảng Payment)
export const PAYMENT_TXN_STATUS = {
  PENDING: { label: 'Chờ thanh toán', color: 'amber' },
  SUCCESS: { label: 'Thành công', color: 'green' },
  FAILED: { label: 'Thất bại', color: 'red' },
};

export const PAYMENT_METHOD = { COD: 'Tiền mặt khi nhận', ONLINE: 'VNPay' };
export const ORDER_TYPE = { DELIVERY: 'Giao tận nơi', PICKUP: 'Đến lấy tại quán' };

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Bán chạy' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
];

// Việc vệ sinh của tạp vụ (khớp enum CleaningStatus / CleaningPriority ở backend)
export const CLEANING_STATUS = {
  TODO: { label: 'Chờ làm', color: 'amber' },
  IN_PROGRESS: { label: 'Đang làm', color: 'blue' },
  DONE: { label: 'Đã xong', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'slate' },
};

export const CLEANING_PRIORITY = {
  NORMAL: { label: 'Bình thường', color: 'slate' },
  URGENT: { label: 'Gấp', color: 'red' },
};

// Tên việc hay gặp của tạp vụ: bấm để điền nhanh khi thêm việc
export const CLEANING_SUGGESTIONS = ['Rửa chén bát', 'Rửa ly', 'Quét sàn', 'Lau sàn', 'Dọn nhà vệ sinh', 'Thay giấy, xà phòng', 'Đổ rác', 'Lau cửa kính'];

// Phiếu sửa chữa của kỹ thuật (khớp enum RepairStatus / RepairType ở backend)
export const REPAIR_STATUS = {
  OPEN: { label: 'Mới báo', color: 'amber' },
  IN_PROGRESS: { label: 'Đang sửa', color: 'blue' },
  WAITING_PARTS: { label: 'Chờ linh kiện', color: 'indigo' },
  DONE: { label: 'Đã sửa xong', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'slate' },
};
export const REPAIR_TYPE = { REPAIR: 'Sửa chữa', MAINTENANCE: 'Bảo trì định kỳ' };

// Nhóm thiết bị: phải khớp EQUIPMENT_CATEGORIES trong backend/src/config/equipment.js
export const EQUIPMENT_CATEGORIES = ['Điện lạnh', 'Hồ hải sản', 'Bếp', 'Điện nước', 'An toàn', 'Khác'];

// Mô tả sự cố hay gặp: bấm để điền nhanh khi báo hỏng
export const ISSUE_SUGGESTIONS = ['Không chạy', 'Không lạnh', 'Chảy nước', 'Kêu to bất thường', 'Rò rỉ nước', 'Mất điện', 'Có mùi khét'];

// Trạng thái từng món của đơn ăn tại quán (khớp enum OrderItemStatus ở backend)
export const DINE_IN_ITEM_STATUS = {
  WEIGHING: { label: 'Chờ cân', color: 'cyan' }, // món bán theo kg, chờ hồ hải sản cân
  PENDING: { label: 'Chờ bếp', color: 'amber' },
  COOKING: { label: 'Đang làm', color: 'blue' },
  SERVED: { label: 'Đã lên', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'slate' },
};

// Nhãn nút hành động cho admin khi chuyển trạng thái đơn
export const STATUS_ACTION_LABEL = {
  CONFIRMED: 'Xác nhận đơn',
  PREPARING: 'Bắt đầu chế biến',
  DELIVERING: 'Giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Hủy đơn',
};

// Món bán theo kg (hải sản sống ở hồ: tôm hùm, tôm sú, cua, cá mú, tôm tít). Giá của món là giá 1 kg,
// tại quán nhân viên hồ hải sản cân rồi mới tính tiền, nên KHÔNG đặt online được (web hiện nút Đặt bàn).
// Khớp backend/src/utils/helpers.js. Xem docs/24-thuc-don-ban-theo-kg.md
export const WEIGHT_UNIT = 'kg';
export const isSoldByWeight = (dish) => dish?.unit === WEIGHT_UNIT;
