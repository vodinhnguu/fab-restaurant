// Ăn tại quán: nhân viên phục vụ ghi món tại bàn bằng app mobile.
// Tài liệu: docs/23-app-nhan-vien-phuc-vu.md
//
// Luồng:
//   Phục vụ (app): chọn khu -> chọn bàn -> chọn món -> "Gửi bếp" (bàn chưa có đơn thì tạo đơn DINE_IN, có rồi thì gọi thêm)
//   Món bán theo kg "Chờ cân": phục vụ dẫn khách ra hồ, cân, nhập số kg ngay trên app -> tính tiền, sang bếp (docs/24)
//     Hồ hải sản / quản lý xem lại và cân lại trên web /admin/weighing
//   Bếp (web /admin/kitchen): "Nhận làm" -> món Đang làm
//   Phục vụ (app): "Check món" (tick món đã mang ra bàn) / "Hủy món" / "Order" (gọi thêm) / "Gửi thanh toán"
//   Thu ngân (web /admin/cashier): nhận thông báo -> "In bill" -> "Đã thu tiền" (đơn COMPLETED + PAID, bàn trống lại)
//
// Trạng thái từng món (OrderItem.status): [WEIGHING chờ cân, chỉ món theo kg] -> PENDING chờ bếp -> COOKING bếp đang làm
//   -> READY bếp xong (chờ phục vụ mang ra) -> SERVED đã lên bàn | CANCELLED đã hủy.
// Trạng thái ĐƠN tự suy ra từ các món (syncOrderStatus): còn món chờ bếp = CONFIRMED "Đã gửi bếp",
// còn món đang làm = PREPARING "Đang chế biến", lên hết = DELIVERING "Đã lên món", hủy hết món = CANCELLED.
import { restaurant } from '../../config/restaurant.js';
import { seedDefaultTables } from '../../config/tables.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { isSoldByWeight, startOfVnDay, withUniqueCode } from '../../utils/helpers.js';
import { recordDishWeight } from '../tank/tank.service.js';

// Đơn tại bàn chưa thu tiền. Đơn tại bàn tạo ra là CONFIRMED luôn (nhân viên ghi trực tiếp, không cần chờ xác nhận)
export const OPEN_ORDER = ['CONFIRMED', 'PREPARING', 'DELIVERING'];
// Món bếp còn phải làm (món chờ cân bếp chưa thấy)
const KITCHEN_ITEM = ['PENDING', 'COOKING'];
// Món chưa mang ra bàn (kể cả món đang chờ cân và bếp xong chờ mang ra)
const NOT_SERVED = ['WEIGHING', ...KITCHEN_ITEM, 'READY'];

// Dòng món bán theo kg: đang chờ cân hoặc đã cân (có số kg)
const byWeight = (i) => i.status === 'WEIGHING' || i.weight != null;
// Tiền 1 dòng món: theo kg = giá 1 kg × số kg (chờ cân: số kg phục vụ ghi, tiền tạm; đơn cũ chưa có số kg = 0),
// theo phần = giá × số phần. Web / app tính giống vậy.
export const lineTotal = (i) => (byWeight(i) ? Math.round(i.price * (i.weight ?? 0)) : i.price * i.quantity);

const tableSelect = { select: { id: true, code: true, area: true, seats: true } };
const staffSelect = { select: { id: true, name: true } };
const itemsInclude = { orderBy: { id: 'asc' }, include: { dish: { select: { image: true, slug: true } } } };
const sumQty = (items) => items.reduce((s, i) => s + i.quantity, 0);

// Đơn tại bàn đang mở của 1 bàn (mỗi bàn tối đa 1 đơn mở: gọi thêm món là cộng vào đơn này)
export function findOpenOrder(db, tableId) {
  return db.order.findFirst({ where: { type: 'DINE_IN', tableId, status: { in: OPEN_ORDER } }, orderBy: { createdAt: 'desc' } });
}

async function getActiveTable(db, tableId) {
  const table = await db.diningTable.findUnique({ where: { id: tableId } });
  if (!table || !table.isActive) throw ApiError.badRequest('Bàn này hiện không phục vụ, vui lòng chọn bàn khác');
  return table;
}

// Đơn tại bàn còn mở (chưa thu tiền, chưa hủy). Không có / đã đóng thì báo lỗi
async function getOpenOrder(db, orderId) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.type !== 'DINE_IN') throw ApiError.notFound('Không tìm thấy đơn của bàn');
  if (!OPEN_ORDER.includes(order.status)) throw ApiError.badRequest('Đơn của bàn này đã thanh toán hoặc đã hủy');
  return order;
}

// Trạng thái đơn đi theo các món (xem đầu file). Gọi sau mỗi lần đổi món.
export async function syncOrderStatus(db, orderId) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: { select: { status: true } } } });
  if (!order || order.type !== 'DINE_IN' || !OPEN_ORDER.includes(order.status)) return;

  const live = order.items.filter((i) => i.status !== 'CANCELLED');
  let status = 'DELIVERING';
  if (live.length === 0) status = 'CANCELLED';
  else if (live.some((i) => i.status === 'PENDING' || i.status === 'WEIGHING')) status = 'CONFIRMED';
  else if (live.some((i) => i.status === 'COOKING' || i.status === 'READY')) status = 'PREPARING';
  if (status === order.status) return;

  const data = { status };
  // Hủy hết món = đóng đơn, bàn trống lại (số lượng đã bán đã trả lại lúc hủy từng món)
  if (status === 'CANCELLED') Object.assign(data, { cancelReason: 'Đã hủy hết món', billRequestedAt: null });
  await db.order.update({ where: { id: orderId }, data });
}

// Gom các bàn theo khu vực (thứ tự khu vực theo restaurant.reservationAreas), bỏ khu không có bàn
function groupByArea(tables, mapTable) {
  return restaurant.reservationAreas
    .map((name) => ({ name, tables: tables.filter((t) => t.area === name).map(mapTable) }))
    .filter((a) => a.tables.length > 0);
}

// Sơ đồ phục vụ: mọi bàn đang hoạt động (kèm vị trí x, y trên sơ đồ) + đơn đang mở (nếu có)
export async function floor() {
  if ((await prisma.diningTable.count()) === 0) await seedDefaultTables(prisma); // DB mới -> tạo bàn mặc định
  const [tables, orders] = await Promise.all([
    prisma.diningTable.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } }),
    prisma.order.findMany({
      where: { type: 'DINE_IN', status: { in: OPEN_ORDER } },
      select: {
        id: true, code: true, tableId: true, status: true, total: true, createdAt: true, billRequestedAt: true,
        items: { where: { status: { not: 'CANCELLED' } }, select: { quantity: true, status: true } },
      },
    }),
  ]);

  return groupByArea(tables, (t) => {
    const o = orders.find((x) => x.tableId === t.id);
    return {
      id: t.id,
      code: t.code,
      seats: t.seats,
      x: t.x,
      y: t.y,
      order: o
        ? {
            id: o.id,
            code: o.code,
            status: o.status,
            total: o.total,
            createdAt: o.createdAt,
            billRequestedAt: o.billRequestedAt,
            itemCount: sumQty(o.items),
            // Số phần chưa mang ra bàn (chờ cân + chờ bếp + bếp đang làm)
            waitingCount: sumQty(o.items.filter((i) => NOT_SERVED.includes(i.status))),
            // Số phần bán theo kg còn chờ hồ hải sản cân (chưa gửi thanh toán được)
            weighingCount: sumQty(o.items.filter((i) => i.status === 'WEIGHING')),
          }
        : null,
    };
  });
}

// 1 bàn + đơn đang mở (đủ món, kể cả món đã hủy để app gạch ngang; null = bàn trống)
export async function tableDetail(tableId) {
  const table = await prisma.diningTable.findUnique({ where: { id: tableId }, ...tableSelect });
  if (!table) throw ApiError.notFound('Không tìm thấy bàn');
  const order = await prisma.order.findFirst({
    where: { type: 'DINE_IN', tableId, status: { in: OPEN_ORDER } },
    orderBy: { createdAt: 'desc' },
    include: { items: itemsInclude, staff: staffSelect },
  });
  return { table, order };
}

// Đơn tại bàn hôm nay (giờ VN), mới nhất lên đầu: tab "Đơn hôm nay" của app
export async function todayOrders() {
  const orders = await prisma.order.findMany({
    where: { type: 'DINE_IN', createdAt: { gte: startOfVnDay() } },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { table: tableSelect, staff: staffSelect, items: { where: { status: { not: 'CANCELLED' } }, select: { quantity: true } } },
  });
  return orders.map(({ items, ...o }) => ({ ...o, itemCount: sumQty(items) }));
}

// Nhân viên bấm "Gửi bếp": bàn chưa có đơn thì tạo đơn mới, có rồi thì gọi thêm (thêm dòng mới, cộng tiền).
// Món bán theo kg: 1 dòng, số kg = số phục vụ ghi trên app (mặc định 1 kg), cộng TIỀN TẠM theo số kg đó.
// Món vào "Chờ cân": phục vụ cân tại hồ cùng khách rồi nhập số kg (weighItem) thì tiền đổi theo, món mới sang bếp.
export async function addItems({ tableId, items: lines, note }, staff) {
  // Gộp các dòng trùng món trong 1 lần gửi (giống đặt online). Món theo kg cộng dồn số kg.
  const qtyByDish = new Map();
  const kgByDish = new Map();
  const noteByDish = new Map();
  for (const { dishId, quantity, weight, note: n } of lines) {
    qtyByDish.set(dishId, (qtyByDish.get(dishId) || 0) + quantity);
    kgByDish.set(dishId, (kgByDish.get(dishId) || 0) + (weight ?? quantity)); // không gửi số kg: coi mỗi phần là 1 kg
    if (n) noteByDish.set(dishId, [noteByDish.get(dishId), n].filter(Boolean).join('; '));
  }

  await withUniqueCode('FAB', (code) => prisma.$transaction(async (tx) => {
    const table = await getActiveTable(tx, tableId);

    // Giá lấy từ DB, không tin giá app gửi
    const dishes = await tx.dish.findMany({ where: { id: { in: [...qtyByDish.keys()] } }, include: { tankItem: true } });
    if (dishes.length !== qtyByDish.size) throw ApiError.badRequest('Có món không tồn tại');
    // Giữ đúng thứ tự nhân viên bấm (bếp đọc phiếu theo thứ tự này)
    const items = [...qtyByDish.keys()].map((id) => dishes.find((x) => x.id === id)).map((d) => {
      if (!d.isAvailable) throw ApiError.badRequest(`Món "${d.name}" hiện đã hết`);
      if (isSoldByWeight(d) && d.tankItem && d.tankItem.stockKg <= 0) {
        throw ApiError.badRequest(`Hồ đang hết "${d.tankItem.name ?? d.name}", không thể ghi món`);
      }
      const base = { dishId: d.id, name: d.name, price: d.salePrice ?? d.price, note: noteByDish.get(d.id) ?? null };
      if (!isSoldByWeight(d)) return { ...base, quantity: qtyByDish.get(d.id), status: 'PENDING' };
      // Món theo kg: price là giá 1 kg; số kg làm tròn tới gam
      const kg = Math.round(kgByDish.get(d.id) * 1000) / 1000;
      if (kg > 30) throw ApiError.badRequest(`Món "${d.name}" nhiều nhất 30 kg mỗi lần gọi`);
      return { ...base, quantity: 1, weight: kg, status: 'WEIGHING' };
    });
    const added = items.reduce((sum, i) => sum + lineTotal(i), 0);

    const order = await findOpenOrder(tx, tableId);
    if (!order) {
      await tx.order.create({
        data: {
          code,
          type: 'DINE_IN',
          status: 'CONFIRMED',
          tableId,
          staffId: staff.id,
          customerName: `Khách bàn ${table.code}`,
          phone: '',
          note: note || null,
          subtotal: added,
          total: added,
          items: { create: items },
        },
      });
    } else {
      await tx.orderItem.createMany({ data: items.map((i) => ({ ...i, orderId: order.id })) });
      // Gọi thêm sau khi đã gửi thanh toán -> bill cũ không còn đúng, rút yêu cầu (phục vụ gửi lại khi khách ăn xong)
      const data = { subtotal: { increment: added }, total: { increment: added }, billRequestedAt: null };
      if (note) data.note = [order.note, note].filter(Boolean).join('; ');
      await tx.order.update({ where: { id: order.id }, data });
      await syncOrderStatus(tx, order.id); // có món mới chờ bếp -> về "Đã gửi bếp"
    }

    for (const i of items) {
      await tx.dish.update({ where: { id: i.dishId }, data: { soldCount: { increment: i.quantity } } });
    }
  }));

  return tableDetail(tableId);
}

// Chuyển bàn: chuyển đơn đang mở từ bàn này sang bàn khác (bàn đích phải trống).
export async function moveTable(fromTableId, { toTableId, reason }, staff) {
  if (fromTableId === toTableId) throw ApiError.badRequest('Bàn đích trùng bàn hiện tại');

  await prisma.$transaction(async (tx) => {
    await getActiveTable(tx, fromTableId);
    await getActiveTable(tx, toTableId);

    const order = await findOpenOrder(tx, fromTableId);
    if (!order) throw ApiError.badRequest('Bàn này chưa có đơn nào đang mở');

    const existing = await findOpenOrder(tx, toTableId);
    if (existing) throw ApiError.badRequest('Bàn đích đang có khách, không chuyển được');

    await tx.order.update({
      where: { id: order.id },
      data: {
        tableId: toTableId,
        note: [order.note, reason ? `Chuyển bàn: ${reason}` : 'Chuyển bàn'].filter(Boolean).join('; '),
      },
    });
  });

  return tableDetail(toTableId);
}

// "Check món": tick (served = true) / bỏ tick các món đã mang ra bàn. Các món phải cùng 1 đơn đang mở.
export async function serveItems({ itemIds, served }) {
  const tableId = await prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { id: { in: itemIds } } });
    if (items.length !== new Set(itemIds).size) throw ApiError.notFound('Không tìm thấy món');
    const orderIds = new Set(items.map((i) => i.orderId));
    if (orderIds.size > 1) throw ApiError.badRequest('Chỉ check món của cùng 1 bàn');
    const order = await getOpenOrder(tx, items[0].orderId);
    if (items.some((i) => i.status === 'CANCELLED')) throw ApiError.badRequest('Có món đã hủy, không check được');

    if (served) {
      // Phục vụ check: chỉ món bếp đã xong (READY) mới tick được
      await tx.orderItem.updateMany({ where: { id: { in: itemIds }, status: 'READY' }, data: { status: 'SERVED', servedAt: new Date() } });
    } else {
      // Bỏ tick (bấm nhầm): bếp đã xong nên về READY (chờ mang ra)
      await tx.orderItem.updateMany({ where: { id: { in: itemIds }, status: 'SERVED' }, data: { status: 'READY', servedAt: null } });
    }
    await syncOrderStatus(tx, order.id);
    return order.tableId;
  });
  return tableDetail(tableId);
}

// "Hủy món": hủy cả dòng hoặc bớt vài phần (quantity). Chờ cân / bếp chưa làm hủy luôn; bếp đã làm phải có lý do.
// Món theo kg chỉ hủy cả dòng (số kg cân chung cho cả dòng).
export async function cancelItem(itemId, { quantity, reason }, userId) {
  const tableId = await prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findUnique({ where: { id: itemId } });
    if (!item) throw ApiError.notFound('Không tìm thấy món');
    const order = await getOpenOrder(tx, item.orderId);
    if (item.status === 'CANCELLED') throw ApiError.badRequest('Món này đã hủy rồi');
    if (!['WEIGHING', 'PENDING'].includes(item.status) && !reason) {
      throw ApiError.badRequest(item.status === 'SERVED' ? 'Món đã mang ra bàn, vui lòng ghi lý do hủy' : 'Bếp đã làm món này (đang chờ mang ra hoặc đang nấu), vui lòng ghi lý do hủy');
    }
    const qty = quantity ?? item.quantity;
    if (qty > item.quantity) throw ApiError.badRequest(`Món này chỉ có ${item.quantity} phần`);
    if (byWeight(item) && qty < item.quantity) throw ApiError.badRequest('Món bán theo kg chỉ hủy được cả dòng');

    const cancelled = { status: 'CANCELLED', cancelReason: reason || null, cancelledAt: new Date() };
    if (qty < item.quantity) {
      // Hủy bớt: dòng cũ giảm số phần, phần hủy tách thành dòng mới (giữ giờ gọi để vẫn nằm cùng "lần gửi bếp")
      await tx.orderItem.update({ where: { id: item.id }, data: { quantity: { decrement: qty } } });
      const { id: _id, ...copy } = item;
      await tx.orderItem.create({ data: { ...copy, quantity: qty, ...cancelled } });
    } else {
      await tx.orderItem.update({ where: { id: item.id }, data: cancelled });
    }

    // Món bán theo kg đã cân mà bếp CHƯA nhận làm: con hải sản còn sống, trả lại hồ (docs/27).
    // Bếp đã làm (COOKING / SERVED) thì không trả lại - hàng đã mất.
    if (byWeight(item) && item.weighedAt && item.status === 'PENDING' && item.weight) {
      await recordDishWeight(tx, {
        dishId: item.dishId,
        kg: item.weight,
        type: 'RETURN',
        userId,
        orderId: order.id,
        orderItemId: item.id,
        note: `Hủy món khi bếp chưa nhận làm${reason ? `: ${reason}` : ''}`,
      });
    }

    const amount = byWeight(item) ? lineTotal(item) : item.price * qty;
    await tx.order.update({ where: { id: order.id }, data: { subtotal: { decrement: amount }, total: { decrement: amount } } });
    await tx.dish.update({ where: { id: item.dishId }, data: { soldCount: { decrement: qty } } });
    await syncOrderStatus(tx, order.id);
    return order.tableId;
  });
  return tableDetail(tableId);
}

// "Gửi thanh toán" (on = true) / rút lại (on = false). Thu ngân thấy ở trang Thanh toán tại bàn.
export async function requestBill(orderId, on = true) {
  const order = await getOpenOrder(prisma, orderId);
  if (on) {
    const live = await prisma.orderItem.findMany({ where: { orderId, status: { not: 'CANCELLED' } }, select: { name: true, status: true } });
    if (live.length === 0) throw ApiError.badRequest('Bàn chưa có món nào');
    const unweighed = live.filter((i) => i.status === 'WEIGHING');
    if (unweighed.length) {
      throw ApiError.badRequest(`Còn món chưa cân: ${unweighed.map((i) => i.name).join(', ')}. Nhập số kg (cân tại hồ) trước khi gửi thanh toán`);
    }
  }
  await prisma.order.update({ where: { id: orderId }, data: { billRequestedAt: on ? new Date() : null } });
  return tableDetail(order.tableId);
}

// ---------------- Thu ngân (web) ----------------

const billInclude = { table: tableSelect, staff: staffSelect, items: { orderBy: { id: 'asc' } } };

// Các bàn đang mở: bàn đã gửi thanh toán lên trước (gửi sớm trước), sau đó bàn đang ăn (mở bàn sớm trước)
export async function bills() {
  const orders = await prisma.order.findMany({
    where: { type: 'DINE_IN', status: { in: OPEN_ORDER } },
    orderBy: { createdAt: 'asc' },
    include: billInclude,
  });
  const requested = orders.filter((o) => o.billRequestedAt).sort((a, b) => a.billRequestedAt - b.billRequestedAt);
  return [...requested, ...orders.filter((o) => !o.billRequestedAt)];
}

// 1 bill để in (cả đơn đã thu tiền, để in lại)
export async function bill(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: billInclude });
  if (!order || order.type !== 'DINE_IN') throw ApiError.notFound('Không tìm thấy bill');
  return order;
}

export async function markPrinted(orderId) {
  await bill(orderId);
  return prisma.order.update({ where: { id: orderId }, data: { billPrintedAt: new Date() }, include: billInclude });
}

// "Đã thu tiền": đơn Hoàn thành + Đã thanh toán, bàn trống lại. Còn món theo kg chưa cân thì chưa thu được.
export async function pay(orderId, { paymentMethod = 'COD' } = {}) {
  await getOpenOrder(prisma, orderId);
  const unweighed = await prisma.orderItem.findMany({ where: { orderId, status: 'WEIGHING' }, select: { name: true } });
  if (unweighed.length) {
    throw ApiError.badRequest(`Còn món chưa cân: ${unweighed.map((i) => i.name).join(', ')}. Cần nhập số kg (cân tại hồ) trước khi thu tiền`);
  }
  return prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod },
    include: billInclude,
  });
}

// Thu ngân chỉnh số lượng món (khách gọi thêm bia / trả lại nước). Chỉ món bán theo phần, chưa hủy.
export async function adjustBillItem(itemId, { quantity }, userId) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findUnique({ where: { id: itemId } });
    if (!item) throw ApiError.notFound('Không tìm thấy món');
    if (item.status === 'CANCELLED') throw ApiError.badRequest('Món này đã hủy');
    if (byWeight(item)) throw ApiError.badRequest('Món bán theo kg không chỉnh được số lượng, hãy cân lại');
    const order = await getOpenOrder(tx, item.orderId);

    const diff = quantity - item.quantity;
    if (diff === 0) return bill(order.id);

    if (quantity <= 0) {
      // Xóa hết = hủy món
      await tx.orderItem.update({ where: { id: item.id }, data: { status: 'CANCELLED', cancelReason: 'Thu ngân xóa khi thanh toán', cancelledAt: new Date() } });
      const amount = item.price * item.quantity;
      await tx.order.update({ where: { id: order.id }, data: { subtotal: { decrement: amount }, total: { decrement: amount } } });
      await tx.dish.update({ where: { id: item.dishId }, data: { soldCount: { decrement: item.quantity } } });
    } else {
      await tx.orderItem.update({ where: { id: item.id }, data: { quantity } });
      const amount = item.price * diff;
      await tx.order.update({ where: { id: order.id }, data: { subtotal: { increment: amount }, total: { increment: amount } } });
      if (diff !== 0) await tx.dish.update({ where: { id: item.dishId }, data: { soldCount: { increment: diff } } });
    }
    await syncOrderStatus(tx, order.id);
    return tx.order.findUnique({ where: { id: order.id }, include: billInclude });
  });
}

// Thu ngân thêm món mới vào bill (khách gọi thêm bia, nước khi chờ thanh toán)
export async function addBillItems(orderId, items, userId) {
  return prisma.$transaction(async (tx) => {
    const order = await getOpenOrder(tx, orderId);
    const dishes = await tx.dish.findMany({ where: { id: { in: items.map((i) => i.dishId) } } });
    if (dishes.length !== new Set(items.map((i) => i.dishId)).size) throw ApiError.badRequest('Có món không tồn tại');

    const newItems = items.map((line) => {
      const d = dishes.find((x) => x.id === line.dishId);
      if (!d.isAvailable) throw ApiError.badRequest(`Món "${d.name}" hiện đã hết`);
      if (isSoldByWeight(d)) throw ApiError.badRequest(`Món "${d.name}" bán theo kg, chỉ gọi được qua phục vụ tại hồ`);
      return { orderId, dishId: d.id, name: d.name, price: d.salePrice ?? d.price, quantity: line.quantity, status: 'PENDING' };
    });

    await tx.orderItem.createMany({ data: newItems });
    const added = newItems.reduce((s, i) => s + i.price * i.quantity, 0);
    await tx.order.update({ where: { id: orderId }, data: { subtotal: { increment: added }, total: { increment: added } } });
    for (const i of newItems) {
      await tx.dish.update({ where: { id: i.dishId }, data: { soldCount: { increment: i.quantity } } });
    }
    await syncOrderStatus(tx, orderId);
    return tx.order.findUnique({ where: { id: orderId }, include: billInclude });
  });
}

// ---------------- Bếp (web) ----------------

// Phiếu bếp: các bàn còn món chờ bếp / đang làm, phiếu chờ lâu nhất lên đầu
export async function kitchen() {
  const orders = await prisma.order.findMany({
    where: { type: 'DINE_IN', status: { in: OPEN_ORDER }, items: { some: { status: { in: KITCHEN_ITEM } } } },
    select: {
      id: true, code: true, note: true, createdAt: true, table: tableSelect, staff: staffSelect,
      items: { where: { status: { in: KITCHEN_ITEM } }, orderBy: { id: 'asc' } },
    },
  });
  const oldest = (o) => Math.min(...o.items.map((i) => i.createdAt.getTime()));
  return orders.sort((a, b) => oldest(a) - oldest(b));
}

// "Nhận làm": món chờ bếp -> bếp đang làm (từ giờ hủy món phải ghi lý do)
export async function startCooking(itemIds) {
  return prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({
      where: { id: { in: itemIds }, status: 'PENDING', order: { type: 'DINE_IN', status: { in: OPEN_ORDER } } },
      select: { id: true, orderId: true },
    });
    await tx.orderItem.updateMany({ where: { id: { in: items.map((i) => i.id) } }, data: { status: 'COOKING' } });
    for (const orderId of new Set(items.map((i) => i.orderId))) await syncOrderStatus(tx, orderId);
    return { updated: items.length };
  });
}

// "Đã xong": bếp báo món nấu xong, sẵn sàng mang ra bàn. Phục vụ / tiếp thực thấy để mang ra.
export async function finishCooking(itemIds) {
  return prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({
      where: { id: { in: itemIds }, status: 'COOKING', order: { type: 'DINE_IN', status: { in: OPEN_ORDER } } },
      select: { id: true, orderId: true },
    });
    await tx.orderItem.updateMany({ where: { id: { in: items.map((i) => i.id) } }, data: { status: 'READY' } });
    for (const orderId of new Set(items.map((i) => i.orderId))) await syncOrderStatus(tx, orderId);
    return { updated: items.length };
  });
}

// ---------------- Món bán theo kg: nhập số kg (app phục vụ) / xem lại, cân lại (web hồ hải sản) ----------------

const weighSelect = {
  id: true, name: true, price: true, quantity: true, note: true, status: true, weight: true, weighedAt: true, createdAt: true,
  order: { select: { id: true, code: true, table: tableSelect, staff: staffSelect } },
};

// Món đang chờ cân (gọi sớm lên trước) + món đã cân hôm nay (mới nhất trước, để cân lại nếu nhập nhầm)
export async function weighingList() {
  const openOrder = { type: 'DINE_IN', status: { in: OPEN_ORDER } };
  const [waiting, weighed] = await Promise.all([
    prisma.orderItem.findMany({ where: { status: 'WEIGHING', order: openOrder }, orderBy: { createdAt: 'asc' }, select: weighSelect }),
    prisma.orderItem.findMany({
      where: { weight: { not: null }, weighedAt: { gte: startOfVnDay() }, status: { not: 'CANCELLED' } },
      orderBy: { weighedAt: 'desc' },
      take: 30,
      select: weighSelect,
    }),
  ]);
  return { waiting, weighed };
}

// Nhập số kg cân thật (phục vụ trên app tại hồ, hoặc hồ hải sản / quản lý trên web): tiền dòng món = giá 1 kg × số kg, món sang "Chờ bếp".
// Tiền đơn đổi theo CHÊNH LỆCH với tiền tạm (số kg phục vụ ghi lúc gửi bếp, vd ghi 1 kg cân ra 0,98 kg).
// Cân lại (nhập nhầm) được khi bếp chưa nhận làm.
export async function weighItem(itemId, weight, userId) {
  const kg = Math.round(weight * 1000) / 1000; // làm tròn tới gam
  return prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findUnique({ where: { id: itemId } });
    if (!item || !byWeight(item)) throw ApiError.notFound('Không tìm thấy món bán theo kg');
    const order = await getOpenOrder(tx, item.orderId);
    if (!['WEIGHING', 'PENDING'].includes(item.status)) {
      throw ApiError.badRequest(item.status === 'CANCELLED' ? 'Món này đã hủy' : 'Bếp đã nhận làm món này, không cân lại được');
    }

    const diff = lineTotal({ ...item, weight: kg }) - lineTotal(item);
    await tx.orderItem.update({ where: { id: item.id }, data: { weight: kg, weighedAt: new Date(), status: 'PENDING' } });

    // Trừ hồ hải sản đúng số kg đã cân (docs/27-ton-ho-hai-san.md).
    // Cân lại: chỉ ghi phần chênh lệch (sửa 1 → 0,98 thì trả lại hồ 0,02 kg).
    const weighedBefore = item.weighedAt ? (item.weight ?? 0) : 0;
    const kgDiff = Math.round((kg - weighedBefore) * 1000) / 1000;
    if (kgDiff !== 0) {
      await recordDishWeight(tx, {
        dishId: item.dishId,
        kg: Math.abs(kgDiff),
        type: kgDiff > 0 ? 'SALE' : 'RETURN',
        userId,
        orderId: order.id,
        orderItemId: item.id,
        note: weighedBefore ? `Cân lại: ${String(weighedBefore).replace('.', ',')} → ${String(kg).replace('.', ',')} kg` : null,
      });
    }
    const data = { subtotal: { increment: diff }, total: { increment: diff } };
    if (diff !== 0 && item.weight != null) data.billRequestedAt = null; // cân lại làm đổi tiền -> bill cũ không còn đúng
    await tx.order.update({ where: { id: order.id }, data });
    await syncOrderStatus(tx, order.id);
    return tx.orderItem.findUnique({ where: { id: item.id }, select: weighSelect });
  });
}
