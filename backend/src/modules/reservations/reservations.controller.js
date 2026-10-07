import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateCode, getPagination, paginationMeta } from '../../utils/helpers.js';

export async function create(req, res) {
  const reservation = await prisma.reservation.create({
    data: { ...req.body, email: req.body.email || null, code: generateCode('RSV'), userId: req.user?.id ?? null },
  });
  res.status(201).json({ success: true, data: reservation });
}

export async function myReservations(req, res) {
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user.id },
    orderBy: { date: 'desc' },
  });
  res.json({ success: true, data: reservations });
}

async function findAccessible(code, user, phone) {
  const r = await prisma.reservation.findUnique({ where: { code } });
  const phoneMatch = phone && phone.replace(/\s/g, '') === r?.phone;
  const allowed = r && ((user && (r.userId === user.id || user.role === 'ADMIN')) || phoneMatch);
  if (!allowed) throw ApiError.notFound('Không tìm thấy lịch đặt bàn');
  return r;
}

export async function track(req, res) {
  const r = await findAccessible(req.params.code, req.user, req.query.phone);
  res.json({ success: true, data: r });
}

export async function cancel(req, res) {
  const r = await findAccessible(req.params.code, req.user, req.body?.phone);
  if (!['PENDING', 'CONFIRMED'].includes(r.status)) throw ApiError.badRequest('Không thể hủy lịch này');
  if (r.date < new Date()) throw ApiError.badRequest('Lịch đặt bàn đã qua, không thể hủy');
  const updated = await prisma.reservation.update({ where: { id: r.id }, data: { status: 'CANCELLED' } });
  res.json({ success: true, data: updated, message: 'Đã hủy đặt bàn' });
}

// ---- Admin ----
export async function list(req, res) {
  const q = req.validatedQuery;
  const { page, limit, skip, take } = getPagination(q, 20);

  const where = {};
  if (q.status) where.status = q.status;
  if (q.search) {
    where.OR = [
      { code: { contains: q.search, mode: 'insensitive' } },
      { name: { contains: q.search, mode: 'insensitive' } },
      { phone: { contains: q.search } },
    ];
  }
  if (q.date) {
    // Lọc theo ngày giờ Việt Nam
    const start = new Date(`${q.date}T00:00:00+07:00`);
    const end = new Date(start.getTime() + 24 * 3600 * 1000);
    where.date = { gte: start, lt: end };
  }

  const [items, total] = await prisma.$transaction([
    prisma.reservation.findMany({ where, orderBy: { date: 'asc' }, skip, take }),
    prisma.reservation.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: paginationMeta(total, page, limit) });
}

export async function updateStatus(req, res) {
  const r = await prisma.reservation.update({
    where: { id: Number(req.params.id) },
    data: { status: req.body.status },
  });
  res.json({ success: true, data: r });
}
