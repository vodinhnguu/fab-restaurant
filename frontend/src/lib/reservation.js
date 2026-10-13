// Tiện ích dùng chung cho trang đặt bàn (khách) và quản lý đặt bàn (admin)

// Danh sách khung giờ 30 phút một, từ giờ mở cửa đến trước giờ đóng 1 tiếng
export function timeSlots(open = '10:00', close = '22:00') {
  const slots = [];
  const [oh, om] = open.split(':').map(Number);
  const [ch] = close.split(':').map(Number);
  for (let m = oh * 60 + om; m <= (ch - 1) * 60; m += 30) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

// Ngày 'YYYY-MM-DD' + giờ 'HH:mm' theo giờ Việt Nam -> chuỗi ISO gửi lên backend
export const toVnIso = (day, time) => new Date(`${day}T${time}:00+07:00`).toISOString();

// Trạng thái bàn -> màu. "small" (không đủ ghế) và "selected" do frontend tự tính.
export const TABLE_STATUS = {
  free: { label: 'Bàn trống', box: 'border-green-400 bg-green-50 text-green-800 hover:bg-green-100', dot: 'bg-green-500' },
  selected: { label: 'Bàn bạn chọn', box: 'border-ocean-700 bg-ocean-600 text-white ring-4 ring-ocean-200', dot: 'bg-ocean-600' },
  pending: { label: 'Đã đặt - chờ xác nhận', box: 'border-amber-400 bg-amber-50 text-amber-800', dot: 'bg-amber-400' },
  occupied: { label: 'Đã có khách', box: 'border-red-400 bg-red-50 text-red-700', dot: 'bg-red-500' },
  small: { label: 'Không đủ ghế', box: 'border-dashed border-slate-300 bg-slate-50 text-slate-400', dot: 'bg-slate-300' },
  inactive: { label: 'Tạm ngưng', box: 'border-slate-200 bg-slate-100 text-slate-400 line-through', dot: 'bg-slate-200' },
};

// Trạng thái hiển thị của 1 bàn
export function tableState(table, { guests, selectedId } = {}) {
  if (table.id === selectedId) return 'selected';
  if (table.status !== 'free') return table.status;
  if (guests && table.seats < guests) return 'small';
  return 'free';
}
