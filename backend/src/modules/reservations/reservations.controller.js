import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, paginationMeta, withUniqueCode } from '../../utils/helpers.js';
import { can } from '../permissions/permissions.service.js';
import { assertTableAvailable, tableMap } from './tables.service.js';

const include = { table: { select: { id: true, code: true, area: true, seats: true } } };

// Các bước chuyển trạng thái hợp lệ (giống STATUS_FLOW của đơn hàng).
// Lịch đã hủy / đã hoàn thành thì không đổi được nữa.
export const RESERVATION_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
};

export async function create(req, res) {
  const { tableId, ...body } = req.body;
  const data = { ...body, email: body.email || null, userId: req.user?.id ?? null };

  const reservation = await withUniqueCode('RSV', async (code) => {
    if (!tableId) return prisma.reservation.create({ data: { ...data, code }, include });
    // Có chọn bàn: kiểm tra + tạo trong 1 transaction Serializable để 2 người không giữ được cùng 1 bàn
    try {
      return await prisma.$transaction(
        async (tx) => {
          const table = await assertTableAvailable(tx, tableId, data.date, data.guests);
          return tx.reservation.create({ data: { ...data, code, tableId, area: table.area }, include });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (err) {
      // P2034: 2 người đặt cùng bàn cùng lúc, người sau bị hủy giao dịch
      if (err?.code === 'P2034') throw ApiError.conflict('Bàn vừa có người khác đặt, vui lòng chọn bàn khác');
      throw err;
    }
  });
  res.status(201).json({ success: true, data: reservation });
}

// Sơ đồ bàn tại 1 thời điểm (khách xem để chọn bàn; nhân viên xem kèm thông tin khách)
export async function tables(req, res) {
  const data = await tableMap(prisma, req.validatedQuery.date, can(req.user, 'RESERVATIONS', 'view'));
  res.json({ success: true, data });
}

export async function myReservations(req, res) {
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user.id },
    include,
    orderBy: { date: 'desc' },
  });
  res.json({ success: true, data: reservations });
}

async function findAccessible(code, user, phone, action = 'view') {
  const r = await prisma.reservation.findUnique({ where: { code }, include });
  const phoneMatch = phone && phone.replace(/\s/g, '') === r?.phone;
  const allowed = r && ((user && (r.userId === user.id || can(user, 'RESERVATIONS', action))) || phoneMatch);
  if (!allowed) throw ApiError.notFound('Không tìm thấy lịch đặt bàn');
  return r;
}

export async function track(req, res) {
  const r = await findAccessible(req.params.code, req.user, req.query.phone);
  res.json({ success: true, data: r });
}

export async function cancel(req, res) {
  const r = await findAccessible(req.params.code, req.user, req.body?.phone, 'edit');
  if (!['PENDING', 'CONFIRMED'].includes(r.status)) throw ApiError.badRequest('Không thể hủy lịch này');
  if (r.date < new Date()) throw ApiError.badRequest('Lịch đặt bàn đã qua, không thể hủy');
  const updated = await prisma.reservation.update({ where: { id: r.id }, data: { status: 'CANCELLED' }, include });
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
    prisma.reservation.findMany({ where, include, orderBy: { date: 'asc' }, skip, take }),
    prisma.reservation.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: paginationMeta(total, page, limit) });
}

export async function updateStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;
  const current = await prisma.reservation.findUnique({ where: { id } });
  if (!current) throw ApiError.notFound('Không tìm thấy lịch đặt bàn');
  if (!RESERVATION_FLOW[current.status].includes(status)) {
    throw ApiError.badRequest(`Không thể chuyển lịch đặt bàn từ ${current.status} sang ${status}`);
  }

  // Điều kiện status trong where: nếu 2 admin bấm cùng lúc, người sau sẽ không ghi đè được
  const { count } = await prisma.reservation.updateMany({ where: { id, status: current.status }, data: { status } });
  if (count === 0) throw ApiError.conflict('Lịch đặt bàn vừa được người khác cập nhật, vui lòng tải lại trang');

  const r = await prisma.reservation.findUnique({ where: { id }, include });
  res.json({ success: true, data: r });
}
