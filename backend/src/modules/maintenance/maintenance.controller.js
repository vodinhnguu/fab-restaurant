// Kỹ thuật: thiết bị, phiếu sửa chữa, bảo trì định kỳ. Tài liệu: docs/22-ky-thuat-bao-tri.md
//
// Quyền (chức năng FACILITY "Thiết bị & bảo trì" trong ma trận phân quyền):
//   Xem  = trang Thiết bị (bếp, hồ hải sản, tổ trưởng xem tình trạng máy)
//   Thêm = nút "Báo hỏng" (phục vụ, lễ tân, tạp vụ, bếp, hồ hải sản...)
//   Sửa  = nhận sửa, chờ linh kiện, hoàn thành, ghi bảo trì; thấy Tổng quan / Phiếu sửa chữa / Lịch sử
//   Xóa  = hủy phiếu, hoàn thành thay người khác, thêm / sửa / ngưng dùng thiết bị (Kỹ thuật)
import { DUE_SOON_DAYS, seedDefaultEquipment } from '../../config/equipment.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { addDays, getPagination, paginationMeta, startOfVnDay, vnDate } from '../../utils/helpers.js';
import { can } from '../permissions/permissions.service.js';

const userSelect = { select: { id: true, name: true, staffRole: { select: { name: true } } } };
const include = {
  equipment: { select: { id: true, name: true, category: true, location: true } },
  reportedBy: userSelect,
  assignee: userSelect,
};

const ACTIVE = ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS'];
// Phiếu gấp lên đầu, rồi phiếu cũ nhất (báo lâu nhất phải xử lý trước)
const activeOrder = [{ priority: 'desc' }, { createdAt: 'asc' }];

// Bước chuyển trạng thái hợp lệ. Đã xong / đã hủy thì không đổi được nữa.
export const REPAIR_FLOW = {
  OPEN: ['IN_PROGRESS', 'DONE', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_PARTS', 'DONE', 'CANCELLED'],
  WAITING_PARTS: ['IN_PROGRESS', 'DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
};

const isManager = (user) => can(user, 'FACILITY', 'delete');
const DAY_MS = 24 * 3600 * 1000;

// Hạn bảo trì tiếp theo = lần bảo trì gần nhất (chưa có thì ngày thêm thiết bị) + chu kỳ.
// maintainedToday: hôm nay (giờ VN) đã ghi bảo trì rồi -> giao diện khóa nút, backend chặn ghi trùng
function maintenanceInfo(eq, now = new Date()) {
  const maintainedToday = !!eq.lastMaintainedAt && eq.lastMaintainedAt >= startOfVnDay(now);
  if (!eq.maintenanceDays) return { nextDueAt: null, daysLeft: null, maintenance: 'none', maintainedToday };
  const base = eq.lastMaintainedAt ?? eq.createdAt;
  const nextDueAt = new Date(base.getTime() + eq.maintenanceDays * DAY_MS);
  const daysLeft = Math.ceil((nextDueAt - now) / DAY_MS);
  const maintenance = daysLeft < 0 ? 'overdue' : daysLeft <= DUE_SOON_DAYS ? 'soon' : 'ok';
  return { nextDueAt, daysLeft, maintenance, maintainedToday };
}

// Người được bấm "Hoàn thành": phiếu chưa ai nhận, phiếu của mình, hoặc người có quyền Xóa (xác nhận thay)
function assertCanFinish(user, t) {
  if (!t.assigneeId || t.assigneeId === user.id || isManager(user)) return;
  throw ApiError.forbidden(`Phiếu này do ${t.assignee?.name ?? 'người khác'} đang sửa. Bấm "Nhận sửa" để nhận thay trước.`);
}

async function assertAssignee(assigneeId) {
  if (!assigneeId) return;
  const u = await prisma.user.findUnique({ where: { id: assigneeId } });
  if (!u || !u.isActive || u.role === 'CUSTOMER') throw ApiError.badRequest('Người được giao không phải nhân viên đang làm việc');
}

async function assertActiveEquipment(id) {
  const eq = await prisma.equipment.findUnique({ where: { id } });
  if (!eq || !eq.isActive) throw ApiError.badRequest('Thiết bị không tồn tại hoặc đã ngưng sử dụng');
  return eq;
}

async function ensureEquipment() {
  if ((await prisma.equipment.count()) === 0) await seedDefaultEquipment(prisma); // DB mới -> tạo thiết bị mặc định
}

// ============ Tổng quan ============
// GET /maintenance/overview
export async function overview(req, res) {
  await ensureEquipment();
  const me = req.user.id;
  const now = new Date();
  // Đầu tháng này theo giờ VN
  const vnToday = new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 7); // "2026-11"
  const monthStart = vnDate(`${vnToday}-01`);
  const todayStart = startOfVnDay(now);

  const [active, equipment, doneMonth] = await Promise.all([
    prisma.repairTicket.findMany({ where: { status: { in: ACTIVE } }, include, orderBy: activeOrder }),
    prisma.equipment.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
    prisma.repairTicket.findMany({ where: { status: 'DONE', completedAt: { gte: monthStart } }, include, orderBy: { completedAt: 'desc' } }),
  ]);

  // Thiết bị đang có sự cố (phiếu sửa chữa chưa xong)
  const brokenIds = new Set(active.filter((t) => t.type === 'REPAIR').map((t) => t.equipmentId));
  const maintenanceDue = equipment
    .map((e) => ({
      id: e.id, name: e.name, category: e.category, location: e.location, lastMaintainedAt: e.lastMaintainedAt,
      // Phiếu sửa chữa chưa xong của máy: hộp thoại "Đã bảo trì" hỏi có đóng luôn không
      openTickets: active.filter((t) => t.equipmentId === e.id && t.type === 'REPAIR'),
      ...maintenanceInfo(e, now),
    }))
    .filter((e) => e.maintenance === 'overdue' || e.maintenance === 'soon')
    .sort((a, b) => a.daysLeft - b.daysLeft);

  res.json({
    success: true,
    data: {
      counts: {
        open: active.filter((t) => t.status === 'OPEN').length,
        inProgress: active.filter((t) => t.status === 'IN_PROGRESS').length,
        waiting: active.filter((t) => t.status === 'WAITING_PARTS').length,
        urgent: active.filter((t) => t.priority === 'URGENT').length,
        mine: active.filter((t) => t.assigneeId === me).length,
        broken: brokenIds.size,
        equipment: equipment.length,
        overdue: maintenanceDue.filter((e) => e.maintenance === 'overdue').length,
        dueSoon: maintenanceDue.filter((e) => e.maintenance === 'soon').length,
        doneToday: doneMonth.filter((t) => t.completedAt >= todayStart).length,
        doneMonth: doneMonth.length,
        costMonth: doneMonth.reduce((s, t) => s + (t.cost ?? 0), 0),
      },
      dueSoonDays: DUE_SOON_DAYS,
      urgentTickets: active.filter((t) => t.priority === 'URGENT').slice(0, 6),
      myTickets: active.filter((t) => t.assigneeId === me).slice(0, 6),
      newTickets: active.filter((t) => t.status === 'OPEN' && t.priority !== 'URGENT').slice(0, 6),
      maintenanceDue: maintenanceDue.slice(0, 8),
      recentDone: doneMonth.slice(0, 5),
    },
  });
}

// ============ Thiết bị ============
// GET /maintenance/equipment: thiết bị + phiếu chưa xong + hạn bảo trì
export async function listEquipment(req, res) {
  await ensureEquipment();
  const showRetired = req.validatedQuery.all && isManager(req.user);
  const now = new Date();
  const list = await prisma.equipment.findMany({
    where: showRetired ? {} : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { tickets: { where: { status: { in: ACTIVE } }, include, orderBy: activeOrder } },
  });
  res.json({
    success: true,
    data: list.map(({ tickets, ...e }) => ({
      ...e,
      openTickets: tickets,
      hasIssue: tickets.some((t) => t.type === 'REPAIR'),
      ...maintenanceInfo(e, now),
    })),
    meta: { dueSoonDays: DUE_SOON_DAYS },
  });
}

export async function createEquipment(req, res) {
  const eq = await prisma.equipment.create({ data: req.body });
  res.status(201).json({ success: true, data: eq });
}

export async function updateEquipment(req, res) {
  const eq = await prisma.equipment.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json({ success: true, data: eq });
}

// POST /maintenance/equipment/:id/maintain { note?, cost?, closeTickets? }: ghi 1 lần bảo trì định kỳ (vào lịch sử) và tính lại hạn.
// - Bảo trì KHÔNG tự đóng phiếu sửa chữa (máy hỏng và máy đến hạn vệ sinh là 2 việc khác nhau).
//   Gửi closeTickets: true khi máy đã sửa xong luôn: đóng các phiếu đang mở mà người này được phép hoàn thành.
// - Mỗi máy chỉ ghi 1 lần / ngày (giờ VN), tránh bấm nhiều lần ra nhiều dòng lịch sử trùng.
export async function maintain(req, res) {
  const user = req.user;
  const eq = await assertActiveEquipment(Number(req.params.id));
  const now = new Date();
  const { note, cost, closeTickets } = req.body;
  if (maintenanceInfo(eq, now).maintainedToday) {
    const at = eq.lastMaintainedAt.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
    throw ApiError.badRequest(`${eq.name} đã được ghi bảo trì hôm nay lúc ${at}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    let closed = 0;
    let skipped = 0;
    if (closeTickets) {
      const open = await tx.repairTicket.findMany({ where: { equipmentId: eq.id, type: 'REPAIR', status: { in: ACTIVE } }, include });
      for (const t of open) {
        // Phiếu người khác đang sửa thì để nguyên (trừ người có quyền Xóa), giống luật nút Hoàn thành
        if (t.assigneeId && t.assigneeId !== user.id && !isManager(user)) {
          skipped++;
          continue;
        }
        await tx.repairTicket.update({
          where: { id: t.id },
          data: { status: 'DONE', resolution: note, completedAt: now, assigneeId: t.assigneeId ?? user.id, startedAt: t.startedAt ?? now },
        });
        closed++;
      }
    }
    const ticket = await tx.repairTicket.create({
      data: {
        type: 'MAINTENANCE',
        title: 'Bảo trì định kỳ',
        equipmentId: eq.id,
        status: 'DONE',
        reportedById: user.id,
        assigneeId: user.id,
        resolution: note || 'Bảo trì định kỳ',
        cost: cost ?? null, // chi phí chỉ tính 1 lần ở dòng bảo trì, không chia cho các phiếu vừa đóng
        startedAt: now,
        completedAt: now,
      },
      include,
    });
    await tx.equipment.update({ where: { id: eq.id }, data: { lastMaintainedAt: now } });
    return { ticket, closed, skipped };
  });

  const parts = [`Đã ghi bảo trì ${eq.name}`];
  if (result.closed) parts.push(`đóng ${result.closed} phiếu sửa chữa`);
  if (eq.maintenanceDays) parts.push(`hạn tiếp theo sau ${eq.maintenanceDays} ngày`);
  let message = parts.join(', ');
  if (result.skipped) message += `. Còn ${result.skipped} phiếu người khác đang sửa, chưa đóng`;
  res.json({ success: true, data: { ...result.ticket, closed: result.closed, skipped: result.skipped }, message });
}

// ============ Phiếu sửa chữa ============
// GET /maintenance/tickets: phiếu chưa xong (không phân trang, mỗi lúc chỉ vài chục phiếu)
export async function listTickets(req, res) {
  const q = req.validatedQuery;
  const where = { status: q.status === 'ACTIVE' ? { in: ACTIVE } : q.status };
  if (q.mine) where.assigneeId = req.user.id;
  if (q.equipmentId) where.equipmentId = q.equipmentId;
  if (q.category) where.equipment = { category: q.category };
  const tickets = await prisma.repairTicket.findMany({ where, include, orderBy: activeOrder, take: 200 });
  res.json({ success: true, data: tickets });
}

// GET /maintenance/tickets/reported: 10 phiếu gần nhất tôi đã báo (người báo theo dõi tiến độ)
export async function myReported(req, res) {
  const tickets = await prisma.repairTicket.findMany({
    where: { reportedById: req.user.id, type: 'REPAIR' },
    include,
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  res.json({ success: true, data: tickets });
}

// POST /maintenance/tickets: báo hỏng (bất kỳ ai có quyền Thêm), kỹ thuật / quản lý tạo và giao phiếu
export async function createTicket(req, res) {
  const { assigneeId, ...body } = req.body;
  await assertActiveEquipment(body.equipmentId);
  // Chỉ người có quyền Sửa mới giao phiếu cho ai đó; nhân viên báo hỏng thì để trống, kỹ thuật tự nhận
  const assignTo = can(req.user, 'FACILITY', 'edit') ? (assigneeId ?? null) : null;
  await assertAssignee(assignTo);
  const ticket = await prisma.repairTicket.create({
    data: { ...body, description: body.description || null, assigneeId: assignTo, reportedById: req.user.id },
    include,
  });
  res.status(201).json({ success: true, data: ticket, message: 'Đã gửi báo hỏng, bộ phận kỹ thuật sẽ xử lý' });
}

// PUT /maintenance/tickets/:id: sửa nội dung / giao lại (chỉ phiếu chưa xong)
export async function updateTicket(req, res) {
  const id = Number(req.params.id);
  const current = await prisma.repairTicket.findUnique({ where: { id } });
  if (!current) throw ApiError.notFound('Không tìm thấy phiếu sửa chữa');
  if (!ACTIVE.includes(current.status)) throw ApiError.badRequest('Phiếu đã xong hoặc đã hủy, không sửa được nữa');

  const { assigneeId, ...body } = req.body;
  if (body.equipmentId !== current.equipmentId) await assertActiveEquipment(body.equipmentId);
  if (assigneeId !== undefined) await assertAssignee(assigneeId);

  const ticket = await prisma.repairTicket.update({
    where: { id },
    data: { ...body, description: body.description || null, ...(assigneeId !== undefined && { assigneeId }) },
    include,
  });
  res.json({ success: true, data: ticket });
}

// PATCH /maintenance/tickets/:id/status { status, note?, cost? }
export async function updateTicketStatus(req, res) {
  const id = Number(req.params.id);
  const user = req.user;
  const { status, note, cost } = req.body;

  const current = await prisma.repairTicket.findUnique({ where: { id }, include });
  if (!current) throw ApiError.notFound('Không tìm thấy phiếu sửa chữa');
  if (!REPAIR_FLOW[current.status].includes(status)) {
    throw ApiError.badRequest(current.status === 'DONE' ? 'Phiếu này đã sửa xong rồi' : 'Không thể đổi trạng thái phiếu này');
  }

  const now = new Date();
  let data;
  if (status === 'IN_PROGRESS') {
    // Nhận sửa / tiếp tục sửa: người bấm thành người sửa
    data = { status, assigneeId: user.id, startedAt: current.startedAt ?? now };
  } else if (status === 'WAITING_PARTS') {
    assertCanFinish(user, current);
    data = { status, waitingNote: note, assigneeId: current.assigneeId ?? user.id, startedAt: current.startedAt ?? now };
  } else if (status === 'DONE') {
    assertCanFinish(user, current);
    data = { status, resolution: note, cost: cost ?? null, completedAt: now, assigneeId: current.assigneeId ?? user.id, startedAt: current.startedAt ?? now };
  } else {
    if (!isManager(user)) throw ApiError.forbidden('Chỉ kỹ thuật trưởng / quản trị mới hủy được phiếu');
    data = { status, resolution: note, completedAt: now };
  }

  // Điều kiện status trong where: 2 người bấm cùng lúc thì người sau không ghi đè được
  const { count } = await prisma.repairTicket.updateMany({ where: { id, status: current.status }, data });
  if (count === 0) throw ApiError.conflict('Phiếu này vừa được người khác cập nhật, vui lòng tải lại');
  const ticket = await prisma.repairTicket.findUnique({ where: { id }, include });
  res.json({ success: true, data: ticket });
}

// ============ Lịch sử ============
// GET /maintenance/history?from=&to=&type=&status=DONE&userId=&equipmentId=&page=
export async function history(req, res) {
  const q = req.validatedQuery;
  const { page, limit, skip, take } = getPagination(q, 20);

  const to = q.to ? vnDate(q.to) : startOfVnDay();
  const from = q.from ? vnDate(q.from) : addDays(to, -29); // mặc định 30 ngày gần nhất
  if (from > to) throw ApiError.badRequest('Ngày bắt đầu phải trước ngày kết thúc');

  const where = { status: q.status, completedAt: { gte: from, lt: addDays(to, 1) } };
  if (q.type) where.type = q.type;
  if (q.userId) where.assigneeId = q.userId;
  if (q.equipmentId) where.equipmentId = q.equipmentId;

  const [items, total, sum, grouped] = await Promise.all([
    prisma.repairTicket.findMany({ where, include, orderBy: { completedAt: 'desc' }, skip, take }),
    prisma.repairTicket.count({ where }),
    prisma.repairTicket.aggregate({ where, _sum: { cost: true } }),
    prisma.repairTicket.groupBy({ by: ['assigneeId'], where, _count: { _all: true }, _sum: { cost: true } }),
  ]);

  // Số phiếu + chi phí theo từng người trong khoảng ngày đang lọc
  const users = await prisma.user.findMany({ where: { id: { in: grouped.map((g) => g.assigneeId).filter(Boolean) } }, ...userSelect });
  const byUser = grouped
    .map((g) => ({ user: users.find((u) => u.id === g.assigneeId) ?? null, count: g._count._all, cost: g._sum.cost ?? 0 }))
    .sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    data: items,
    meta: { ...paginationMeta(total, page, limit), from: from.toISOString(), to: to.toISOString(), totalCost: sum._sum.cost ?? 0, byUser },
  });
}

// ============ Nhân viên ============
// GET /maintenance/staff: người nhận sửa được (nhân viên có quyền Sửa ở "Thiết bị & bảo trì")
export async function staff(req, res) {
  const users = await prisma.user.findMany({
    where: { role: 'STAFF', isActive: true, staffRole: { permissions: { some: { module: 'FACILITY', canEdit: true } } } },
    ...userSelect,
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: users });
}
