import { prisma } from '../../lib/prisma.js';

// GET /stats/overview?days=30
export async function overview(req, res) {
  const days = Math.min(365, Math.max(7, Number(req.query.days) || 30));
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - days + 1);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 24 * 3600 * 1000);

  // Doanh thu chỉ tính đơn đã hoàn thành
  const revenueWhere = { status: 'COMPLETED', createdAt: { gte: since } };

  const [revenue, orderCount, customerCount, pendingOrders, todayReservations, byStatus, topDishes, recentOrders] =
    await Promise.all([
      prisma.order.aggregate({ where: revenueWhere, _sum: { total: true }, _count: true }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.reservation.count({
        where: { date: { gte: todayStart, lt: todayEnd }, status: { in: ['PENDING', 'CONFIRMED'] } },
      }),
      prisma.order.groupBy({ by: ['status'], where: { createdAt: { gte: since } }, _count: { _all: true } }),
      prisma.orderItem.groupBy({
        by: ['dishId', 'name'],
        where: { order: revenueWhere },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    ]);

  // Doanh thu theo ngày: dùng SQL thuần (raw query) để group theo ngày
  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('day', "createdAt" AT TIME ZONE 'Asia/Ho_Chi_Minh'), 'YYYY-MM-DD') AS day,
           SUM(total)::int AS revenue,
           COUNT(*)::int AS orders
    FROM "Order"
    WHERE status = 'COMPLETED' AND "createdAt" >= ${since}
    GROUP BY day ORDER BY day`;

  // Lấp các ngày không có đơn bằng 0 để biểu đồ liên tục
  const map = new Map(rows.map((r) => [r.day, r]));
  const revenueByDay = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 24 * 3600 * 1000);
    const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    revenueByDay.push({ day: key, revenue: map.get(key)?.revenue ?? 0, orders: map.get(key)?.orders ?? 0 });
  }

  res.json({
    success: true,
    data: {
      days,
      totalRevenue: revenue._sum.total ?? 0,
      completedOrders: revenue._count,
      orderCount,
      customerCount,
      pendingOrders,
      todayReservations,
      ordersByStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
      topDishes: topDishes.map((d) => ({ dishId: d.dishId, name: d.name, quantity: d._sum.quantity })),
      revenueByDay,
      recentOrders,
    },
  });
}
