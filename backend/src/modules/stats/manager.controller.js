// Số liệu cho app Quản lý (docs/28-app-quan-ly.md).
//
// Khác /stats/overview (trang web Tổng quan, trả nhiều dữ liệu cho biểu đồ):
// endpoint ở đây gom sẵn đúng những gì màn hình điện thoại cần, gọn để 3G cũng mở nhanh:
//   - doanh thu HÔM NAY và THÁNG NÀY (từ ngày 1), tách tại quán / online
//   - đơn đã hủy hôm nay / tháng này (số đơn + số tiền mất)
//   - bàn đang phục vụ, bàn chờ thu tiền
//   - bia & nước bán hôm nay (nhóm "Nước uống")
//   - tồn hồ hải sản (loại nào gần hết)
//
// Quyền: DASHBOARD Xem (quản lý, chủ, admin, tổ trưởng, thu ngân).
import { prisma } from '../../lib/prisma.js';
import { getPagination, paginationMeta, startOfVnDay } from '../../utils/helpers.js';

const DAY_MS = 24 * 3600 * 1000;
const VN_OFFSET_MS = 7 * 3600 * 1000;

/** 0h ngày 1 của tháng đang chứa thời điểm `now`, theo giờ Việt Nam. */
function startOfVnMonth(now = new Date()) {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), 1) - VN_OFFSET_MS);
}

/** Nhãn tháng kiểu Việt: "11/2026" (theo giờ VN). */
function vnMonthLabel(now = new Date()) {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  return `${vn.getUTCMonth() + 1}/${vn.getUTCFullYear()}`;
}

/** Doanh thu + số đơn đã hoàn thành từ [from], tách theo loại đơn. */
async function revenueSince(from) {
  const where = { status: 'COMPLETED', createdAt: { gte: from } };
  const [all, byType] = await Promise.all([
    prisma.order.aggregate({ where, _sum: { total: true }, _count: true }),
    prisma.order.groupBy({ by: ['type'], where, _sum: { total: true }, _count: { _all: true } }),
  ]);
  const sum = (types) =>
    byType.filter((t) => types.includes(t.type)).reduce((s, t) => s + (t._sum.total ?? 0), 0);
  const count = (types) =>
    byType.filter((t) => types.includes(t.type)).reduce((s, t) => s + (t._count._all ?? 0), 0);

  const revenue = all._sum.total ?? 0;
  const orders = all._count ?? 0;
  return {
    revenue,
    orders,
    avgPerOrder: orders ? Math.round(revenue / orders) : 0,
    dineIn: { revenue: sum(['DINE_IN']), orders: count(['DINE_IN']) },
    online: { revenue: sum(['DELIVERY', 'PICKUP']), orders: count(['DELIVERY', 'PICKUP']) },
  };
}

/** Đơn đã hủy từ [from]: số đơn + số tiền của các đơn đó (tiền "mất" ước theo tổng đơn lúc hủy). */
async function cancelledSince(from) {
  const r = await prisma.order.aggregate({
    where: { status: 'CANCELLED', createdAt: { gte: from } },
    _sum: { total: true },
    _count: true,
  });
  return { orders: r._count ?? 0, amount: r._sum.total ?? 0 };
}

// GET /stats/manager: màn Tổng quan của app Quản lý (S15)
export async function managerOverview(req, res) {
  const todayStart = startOfVnDay();
  const monthStart = startOfVnMonth();

  const [today, month, cancelledToday, cancelledMonth, tables, openOrders, drinks, tank, topDishes] = await Promise.all([
    revenueSince(todayStart),
    revenueSince(monthStart),
    cancelledSince(todayStart),
    cancelledSince(monthStart),
    prisma.diningTable.count({ where: { isActive: true } }),
    // Bàn đang có khách (đơn tại quán chưa thu tiền): kèm tiền đang phục vụ và bàn đã gửi thanh toán
    prisma.order.findMany({
      where: { type: 'DINE_IN', status: { in: ['CONFIRMED', 'PREPARING', 'DELIVERING'] } },
      select: { id: true, total: true, billRequestedAt: true },
    }),
    // Bia & nước bán hôm nay (nhóm "Nước uống"), chỉ món còn tính tiền
    prisma.orderItem.groupBy({
      by: ['dishId', 'name'],
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: todayStart },
        dish: { category: { name: 'Nước uống' } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
    }),
    prisma.tankItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, stockKg: true, lowStockKg: true },
    }),
    // Món bán chạy hôm nay
    prisma.orderItem.groupBy({
      by: ['name'],
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: todayStart } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  // Giá bia / nước để tính doanh thu đồ uống hôm nay (lấy giá đang bán, đủ dùng cho con số tham khảo)
  const drinkDishes = drinks.length
    ? await prisma.dish.findMany({
        where: { id: { in: drinks.map((d) => d.dishId) } },
        select: { id: true, price: true, salePrice: true, unit: true },
      })
    : [];
  const priceById = new Map(drinkDishes.map((d) => [d.id, { price: d.salePrice ?? d.price, unit: d.unit }]));
  const drinkRows = drinks.map((d) => {
    const info = priceById.get(d.dishId);
    const quantity = d._sum.quantity ?? 0;
    return {
      dishId: d.dishId,
      name: d.name,
      unit: info?.unit ?? 'lon',
      quantity,
      revenue: (info?.price ?? 0) * quantity,
    };
  });

  res.json({
    success: true,
    data: {
      today,
      month: { ...month, label: vnMonthLabel(), fromDay: 1 },
      cancelled: { today: cancelledToday, month: cancelledMonth },
      tables: {
        total: tables,
        busy: openOrders.length,
        free: Math.max(0, tables - openOrders.length),
        billRequested: openOrders.filter((o) => o.billRequestedAt).length,
        servingAmount: openOrders.reduce((s, o) => s + o.total, 0),
      },
      drinks: {
        items: drinkRows,
        quantity: drinkRows.reduce((s, d) => s + d.quantity, 0),
        revenue: drinkRows.reduce((s, d) => s + d.revenue, 0),
      },
      tank: tank.map((t) => ({ ...t, isLow: t.stockKg <= t.lowStockKg, isEmpty: t.stockKg <= 0 })),
      topDishes: topDishes.map((d) => ({ name: d.name, quantity: d._sum.quantity ?? 0 })),
    },
  });
}

/**
 * GET /stats/cancellations?range=today|7d|month&page=&limit=
 * Màn "Đơn đã hủy" (S16): đơn bị hủy cả đơn + món bị hủy lẻ (bếp đã làm thì bắt buộc có lý do).
 * Quản lý xem để biết hủy nhiều vì lý do gì, ai hủy, mất bao nhiêu tiền.
 */
export async function cancellations(req, res) {
  const range = ['today', '7d', 'month'].includes(req.query.range) ? req.query.range : 'today';
  const todayStart = startOfVnDay();
  const from =
    range === 'today' ? todayStart : range === '7d' ? new Date(todayStart.getTime() - 6 * DAY_MS) : startOfVnMonth();

  const { page, limit, skip, take } = getPagination(req.query, 20);

  const [orders, total, items, summary] = await Promise.all([
    prisma.order.findMany({
      where: { status: 'CANCELLED', createdAt: { gte: from } },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
      select: {
        id: true, code: true, type: true, total: true, cancelReason: true, customerName: true,
        createdAt: true, updatedAt: true,
        table: { select: { code: true, area: true } },
        staff: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where: { status: 'CANCELLED', createdAt: { gte: from } } }),
    // Món hủy lẻ: đơn vẫn còn, chỉ bỏ vài món (hủy khi bếp đã làm là mất hàng thật)
    prisma.orderItem.findMany({
      where: { status: 'CANCELLED', cancelledAt: { gte: from }, order: { status: { not: 'CANCELLED' } } },
      orderBy: { cancelledAt: 'desc' },
      take: 50,
      select: {
        id: true, name: true, quantity: true, price: true, weight: true, cancelReason: true, cancelledAt: true,
        order: { select: { id: true, code: true, type: true, table: { select: { code: true } } } },
      },
    }),
    prisma.order.aggregate({ where: { status: 'CANCELLED', createdAt: { gte: from } }, _sum: { total: true } }),
  ]);

  res.json({
    success: true,
    data: {
      range,
      orders,
      items,
      summary: { orders: total, amount: summary._sum.total ?? 0, items: items.length },
    },
    meta: paginationMeta(total, page, limit),
  });
}
