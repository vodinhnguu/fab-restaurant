// Hàm dùng chung cho trang Thanh toán tại bàn + trang in bill (docs/23-app-nhan-vien-phuc-vu.md)

// Dòng món bán theo kg (hải sản sống, docs/24): đang chờ cân hoặc đã cân
export const isWeighedLine = (i) => i.status === 'WEIGHING' || i.weight != null;

// Tiền 1 dòng món, khớp lineTotal ở backend: theo kg = giá 1 kg × số kg (chờ cân: số kg phục vụ ghi, tiền tạm;
// đơn cũ chưa có số kg = 0), theo phần = giá × số phần
export const lineAmount = (i) => (isWeighedLine(i) ? Math.round(i.price * (i.weight ?? 0)) : i.price * i.quantity);

// Món tính tiền: bỏ món đã hủy, gộp cùng món cùng giá (gọi 2 lần "Cơm chiên" thì bill ghi 1 dòng số lượng 2).
// Món theo kg không gộp: mỗi lần cân là 1 dòng "1,25 kg x 1.890.000".
export function mergeBillItems(items = []) {
  const lines = new Map();
  for (const i of items) {
    if (i.status === 'CANCELLED') continue;
    if (isWeighedLine(i)) {
      // weighing = số kg mới là số phục vụ ghi (tạm), hồ hải sản chưa cân
      lines.set(`kg-${i.id}`, { key: `kg-${i.id}`, name: i.name, price: i.price, quantity: i.quantity, weight: i.weight, byWeight: true, weighing: i.status === 'WEIGHING' });
      continue;
    }
    const key = `${i.dishId}-${i.price}`;
    const line = lines.get(key) ?? { key, name: i.name, price: i.price, quantity: 0 };
    line.quantity += i.quantity;
    lines.set(key, line);
  }
  return [...lines.values()].map((l) => ({ ...l, amount: lineAmount(l.byWeight ? { ...l, status: 'WEIGHING' } : l) }));
}

// Mở trang in bill ở cửa sổ mới (trang đó tự bật hộp thoại in, khổ giấy máy in nhiệt 80mm)
export const openBillPrint = (orderId) => window.open(`/admin/bill/${orderId}/print`, '_blank', 'width=420,height=760');

// Số phần chưa mang ra bàn (chờ cân / chờ bếp / bếp đang làm)
export const waitingCount = (items = []) =>
  items.filter((i) => ['WEIGHING', 'PENDING', 'COOKING'].includes(i.status)).reduce((s, i) => s + i.quantity, 0);

// Số món bán theo kg còn chờ hồ hải sản cân (chưa tính tiền)
export const weighingCount = (items = []) => items.filter((i) => i.status === 'WEIGHING').length;
