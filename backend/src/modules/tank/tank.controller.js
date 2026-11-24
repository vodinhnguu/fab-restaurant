// Tồn hồ hải sản: nhập bao nhiêu, bán bao nhiêu, còn lại bao nhiêu. Tài liệu: docs/27-ton-ho-hai-san.md
//
// Quyền (chức năng SEAFOOD_TANK "Hồ hải sản & nhập hàng" trong ma trận phân quyền):
//   Xem  = vào trang Tồn hồ, xem sổ nhập - xuất (hồ hải sản, bếp, quản lý, tổ trưởng)
//   Sửa  = nhập hàng, kiểm hồ, ghi hao hụt (hồ hải sản, bếp, quản lý)
//   Thêm = thêm loại hải sản mới vào hồ
//   Xóa  = tắt / bật loại hải sản (hồ không nuôi nữa)
import { toId } from '../../utils/helpers.js';
import * as service from './tank.service.js';

const kgText = (kg) => String(Math.abs(kg)).replace('.', ',');

// GET /tank?all=1: danh sách loại hải sản + tồn + hôm nay nhập / bán / hao hụt
export async function list(req, res) {
  res.json({ success: true, data: await service.list({ all: req.query.all === '1' }) });
}

// GET /tank/entries?tankItemId=&type=&date=&page=&limit=: sổ nhập - xuất
export async function entries(req, res) {
  const { items, meta } = await service.entries(req.query);
  res.json({ success: true, data: items, meta });
}

// POST /tank/:id/import { kg, unitCost?, supplier?, note? }
export async function importStock(req, res) {
  const entry = await service.importStock(toId(req.params.id), req.body, req.user.id);
  res.json({
    success: true,
    data: entry,
    message: `Đã nhập ${kgText(entry.deltaKg)} kg ${entry.tankItem.name}, tồn ${kgText(entry.stockAfter)} kg`,
  });
}

// POST /tank/:id/audit { actualKg, note? }: kiểm hồ, ghi phần lệch
export async function audit(req, res) {
  const r = await service.audit(toId(req.params.id), req.body, req.user.id);
  const message = r.skipped
    ? `Số kiểm khớp với sổ (${kgText(r.stockKg)} kg), không cần ghi phiếu`
    : `Đã kiểm hồ: ${r.diff > 0 ? 'thừa' : 'thiếu'} ${kgText(r.diff)} kg, tồn còn ${kgText(r.stockKg)} kg`;
  res.json({ success: true, data: r, message });
}

// POST /tank/:id/loss { kg, note }: hao hụt (hải sản chết), bắt buộc lý do
export async function recordLoss(req, res) {
  const entry = await service.recordLoss(toId(req.params.id), req.body, req.user.id);
  res.json({
    success: true,
    data: entry,
    message: `Đã ghi hao hụt ${kgText(entry.deltaKg)} kg ${entry.tankItem.name}, tồn còn ${kgText(entry.stockAfter)} kg`,
  });
}

// POST /tank { name, lowStockKg?, note? }
export async function create(req, res) {
  const item = await service.create(req.body);
  res.status(201).json({ success: true, data: item, message: `Đã thêm loại "${item.name}" vào hồ` });
}

// PATCH /tank/:id { name?, lowStockKg?, note? }
export async function update(req, res) {
  const item = await service.update(toId(req.params.id), req.body);
  res.json({ success: true, data: item, message: `Đã lưu loại "${item.name}"` });
}

// PATCH /tank/:id/active { isActive }: tắt loại hồ không nuôi nữa (giữ lịch sử), hoặc bật lại
export async function setActive(req, res) {
  const item = await service.update(toId(req.params.id), { isActive: req.body.isActive });
  res.json({ success: true, data: item, message: item.isActive ? `Đã bật lại loại "${item.name}"` : `Đã tắt loại "${item.name}"` });
}
