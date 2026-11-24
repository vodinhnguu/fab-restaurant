// Kiểm bia nước cuối ngày. Tài liệu: docs/29-kiem-bia-nuoc.md
//
// Quyền (chức năng DRINKS "Bia nước & kiểm kho quầy"):
//   Xem  = xem phiếu kiểm + lịch sử (quản lý, tổ trưởng, thu ngân)
//   Sửa  = ghi số thùng xuất ra quầy và số trả lại cuối ngày (thu ngân, quản lý)
//   Thêm = thêm món đồ uống vào danh sách kiểm
//   Xóa  = sửa quy cách thùng, tắt / bật loại
import { toId } from '../../utils/helpers.js';
import * as service from './drinks.service.js';

// GET /drinks/check?date=yyyy-MM-dd&all=1
export async function dayCheck(req, res) {
  const data = await service.dayCheck(req.query.date, { all: req.query.all === '1' });
  res.json({ success: true, data });
}

// PUT /drinks/check { date?, productId, issuedPacks?, issuedUnits?, returnedUnits?, note? }
export async function saveCheck(req, res) {
  const r = await service.saveCheck(req.body, req.user.id);
  // lệch = (bán + trả lại) − xuất: âm là thiếu hàng, dương là thừa (docs/29)
  const sign = r.diff < 0 ? `THIẾU ${Math.abs(r.diff)}` : r.diff > 0 ? `thừa ${r.diff}` : 'khớp';
  res.json({
    success: true,
    data: r.check,
    message: `${r.name}: xuất ${r.issued}, bán ${r.sold}, trả lại ${r.returned} ${r.unit} → ${sign}`,
  });
}

// GET /drinks/products?all=1
export async function products(req, res) {
  res.json({ success: true, data: await service.products({ all: req.query.all === '1' }) });
}

// POST /drinks/products { dishId, packSize? }
export async function addProduct(req, res) {
  const p = await service.addProduct(req.body);
  res.status(201).json({ success: true, data: p, message: `Đã thêm "${p.dish.name}" vào danh sách kiểm` });
}

// PATCH /drinks/products/:id { packSize?, isActive? }
export async function updateProduct(req, res) {
  const p = await service.updateProduct(toId(req.params.id), req.body);
  const message = req.body.isActive === false
    ? `Đã tắt "${p.dish.name}"`
    : req.body.isActive === true
      ? `Đã bật lại "${p.dish.name}"`
      : `"${p.dish.name}": thùng ${p.packSize} ${p.dish.unit}`;
  res.json({ success: true, data: p, message });
}

// GET /drinks/history?days=14
export async function history(req, res) {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
  res.json({ success: true, data: await service.history({ days }) });
}
