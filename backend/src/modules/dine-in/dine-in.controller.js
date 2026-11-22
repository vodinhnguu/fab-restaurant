// Ăn tại quán: nhân viên phục vụ ghi món tại bàn (app mobile), bếp và thu ngân (web).
// Tài liệu: docs/23-app-nhan-vien-phuc-vu.md
import { ApiError } from '../../utils/ApiError.js';
import * as service from './dine-in.service.js';

const toId = (value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw ApiError.notFound();
  return id;
};

// ---- Phục vụ (app) ----

// GET /dine-in/tables
export async function floor(req, res) {
  res.json({ success: true, data: await service.floor() });
}

// GET /dine-in/tables/:id
export async function tableDetail(req, res) {
  res.json({ success: true, data: await service.tableDetail(toId(req.params.id)) });
}

// GET /dine-in/orders
export async function todayOrders(req, res) {
  res.json({ success: true, data: await service.todayOrders() });
}

// POST /dine-in/orders
export async function addItems(req, res) {
  const data = await service.addItems(req.body, req.user);
  res.status(201).json({ success: true, data, message: 'Đã gửi bếp' });
}

// POST /dine-in/items/serve
export async function serveItems(req, res) {
  const data = await service.serveItems(req.body);
  res.json({ success: true, data, message: req.body.served ? 'Đã check món' : 'Đã bỏ check món' });
}

// POST /dine-in/items/:id/cancel
export async function cancelItem(req, res) {
  const data = await service.cancelItem(toId(req.params.id), req.body);
  res.json({ success: true, data, message: 'Đã hủy món' });
}

// POST /dine-in/orders/:id/bill-request
export async function requestBill(req, res) {
  const data = await service.requestBill(toId(req.params.id), true);
  res.json({ success: true, data, message: 'Đã gửi thanh toán cho thu ngân' });
}

// DELETE /dine-in/orders/:id/bill-request
export async function cancelBillRequest(req, res) {
  const data = await service.requestBill(toId(req.params.id), false);
  res.json({ success: true, data, message: 'Đã rút yêu cầu thanh toán' });
}

// ---- Thu ngân (web) ----

// GET /dine-in/bills
export async function bills(req, res) {
  res.json({ success: true, data: await service.bills() });
}

// GET /dine-in/bills/:id
export async function bill(req, res) {
  res.json({ success: true, data: await service.bill(toId(req.params.id)) });
}

// POST /dine-in/bills/:id/printed
export async function markPrinted(req, res) {
  res.json({ success: true, data: await service.markPrinted(toId(req.params.id)) });
}

// POST /dine-in/bills/:id/pay
export async function pay(req, res) {
  const data = await service.pay(toId(req.params.id));
  res.json({ success: true, data, message: `Đã thu tiền bàn ${data.table?.code ?? ''}`.trim() });
}

// ---- Bếp (web) ----

// GET /dine-in/kitchen
export async function kitchen(req, res) {
  res.json({ success: true, data: await service.kitchen() });
}

// POST /dine-in/kitchen/start
export async function startCooking(req, res) {
  const data = await service.startCooking(req.body.itemIds);
  res.json({ success: true, data, message: 'Đã nhận làm' });
}

// ---- Hồ hải sản ----

// GET /dine-in/weighing: { waiting: món chờ cân, weighed: món đã cân hôm nay }
export async function weighingList(req, res) {
  res.json({ success: true, data: await service.weighingList() });
}

// POST /dine-in/items/:id/weigh { weight }: nhập số kg thực tế
export async function weighItem(req, res) {
  const data = await service.weighItem(toId(req.params.id), req.body.weight);
  res.json({ success: true, data, message: `Đã cân ${data.name}: ${String(data.weight).replace('.', ',')} kg` });
}
