import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, paginationMeta } from '../../utils/helpers.js';
import * as orderService from './orders.service.js';

export async function create(req, res) {
  const order = await orderService.createOrder(req.body, req.user);
  res.status(201).json({ success: true, data: order });
}

// Đơn hàng của tôi (đã đăng nhập)
export async function myOrders(req, res) {
  const { page, limit, skip, take } = getPagination(req.query, 10);
  const where = { userId: req.user.id };
  const [items, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { items: { include: { dish: { select: { image: true, slug: true } } } } },
    }),
    prisma.order.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: paginationMeta(total, page, limit) });
}

// Tra cứu đơn: GET /orders/track/:code?phone=0901234567
export async function track(req, res) {
  const order = await orderService.findAccessibleOrder(req.params.code, req.user, req.query.phone);
  res.json({ success: true, data: order });
}

// Thanh toán online (MÔ PHỎNG) - thực tế sẽ redirect sang VNPay/MoMo rồi nhận callback
export async function pay(req, res) {
  const order = await orderService.findAccessibleOrder(req.params.code, req.user, req.body.phone);
  if (order.paymentMethod !== 'ONLINE') throw ApiError.badRequest('Đơn này thanh toán khi nhận hàng');
  if (order.paymentStatus === 'PAID') throw ApiError.badRequest('Đơn đã được thanh toán');
  if (order.status === 'CANCELLED') throw ApiError.badRequest('Đơn đã bị hủy');

  const updated = await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'PAID' } });
  res.json({ success: true, data: updated, message: 'Thanh toán thành công' });
}

// Khách tự hủy khi đơn còn chờ xác nhận
export async function cancel(req, res) {
  const order = await orderService.findAccessibleOrder(req.params.code, req.user, req.body.phone);
  if (order.status !== 'PENDING') throw ApiError.badRequest('Chỉ có thể hủy đơn đang chờ xác nhận');
  const updated = await orderService.changeStatus(order, 'CANCELLED');
  res.json({ success: true, data: updated, message: 'Đã hủy đơn hàng' });
}

// ---- Admin ----
export async function list(req, res) {
  const q = req.validatedQuery;
  const { page, limit, skip, take } = getPagination(q, 15);

  const where = {};
  if (q.status) where.status = q.status;
  if (q.search) {
    where.OR = [
      { code: { contains: q.search, mode: 'insensitive' } },
      { customerName: { contains: q.search, mode: 'insensitive' } },
      { phone: { contains: q.search } },
    ];
  }
  if (q.from || q.to) where.createdAt = { gte: q.from, lte: q.to };

  const [items, total, counts] = await prisma.$transaction([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { items: true } }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true }, orderBy: { status: 'asc' } }),
  ]);

  // Số đơn theo từng trạng thái để hiển thị trên các tab
  const statusCounts = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  res.json({ success: true, data: items, meta: { ...paginationMeta(total, page, limit), statusCounts } });
}

export async function detail(req, res) {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      items: { include: { dish: { select: { image: true, slug: true } } } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!order) throw ApiError.notFound('Không tìm thấy đơn hàng');
  res.json({ success: true, data: order });
}

export async function updateStatus(req, res) {
  const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
  if (!order) throw ApiError.notFound('Không tìm thấy đơn hàng');
  const updated = await orderService.changeStatus(order, req.body.status);
  res.json({ success: true, data: updated });
}
