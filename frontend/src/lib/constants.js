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

export const PAYMENT_METHOD = { COD: 'Tiền mặt khi nhận', ONLINE: 'Thanh toán online' };
export const ORDER_TYPE = { DELIVERY: 'Giao tận nơi', PICKUP: 'Đến lấy tại quán' };

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Bán chạy' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
];

// Nhãn nút hành động cho admin khi chuyển trạng thái đơn
export const STATUS_ACTION_LABEL = {
  CONFIRMED: 'Xác nhận đơn',
  PREPARING: 'Bắt đầu chế biến',
  DELIVERING: 'Giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Hủy đơn',
};
