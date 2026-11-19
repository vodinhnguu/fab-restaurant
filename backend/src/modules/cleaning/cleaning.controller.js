// Vệ sinh & dọn dẹp: việc của tạp vụ. Tài liệu: docs/20-ve-sinh.md
//
// Quyền (chức năng CLEANING trong ma trận phân quyền):
//   Xem  = vào 4 trang: Tổng quan, Nhiệm vụ vệ sinh, Khu vực cần dọn, Lịch sử công việc
//   Thêm = thêm việc / báo khu vực cần dọn (phục vụ, lễ tân, bếp cũng có quyền này)
//   Sửa  = nhận việc, bắt đầu, hoàn thành, sửa nội dung / giao việc (tạp vụ, tổ trưởng)
//   Xóa  = hủy việc, hoàn thành thay người khác, thêm / sửa / ẩn khu vực (quản lý)
import { STALE_HOURS, seedDefaultAreas } from '../../config/cleaning.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { addDays, getPagination, paginationMeta, startOfVnDay, vnDate } from '../../utils/helpers.js';
import { can } from '../permissions/permissions.service.js';

const userSelect = { select: { id: true, name: true, staffRole: { select: { name: true } } } };
const include = { area: { select: { id: true, name: true } }, assignee: userSelect, createdBy: userSelect };

const OPEN = ['TODO', 'IN_PROGRESS'];
// Việc gấp lên đầu, rồi việc đang làm, rồi việc tạo sớm nhất (enum sắp theo thứ tự khai báo trong schema)
const openOrder = [{ priority: 'desc' }, { status: 'desc' }, { createdAt: 'asc' }];

// Bước chuyển trạng thái hợp lệ. Đã xong / đã hủy thì không đổi được nữa.
export const CLEANING_FLOW = {
  TODO: ['IN_PROGRESS', 'DONE', 'CANCELLED'],
  IN_PROGRESS: ['DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
};

const isManager = (user) => can(user, 'CLEANING', 'delete');
const staleBefore = () => new Date(Date.now() - STALE_HOURS * 3600 * 1000);

// Người được bấm "Hoàn thành": việc chưa ai nhận, việc của mình, hoặc quản lý (xác nhận thay)
function assertCanFinish(user, task) {
  if (!task.assigneeId || task.assigneeId === user.id || isManager(user)) return;
  throw ApiError.forbidden(`Việc này đang giao cho ${task.assignee?.name ?? 'người khác'}. Bấm "Bắt đầu" để nhận làm thay trước.`);
}

// Người được giao việc phải là nhân viên đang làm việc
async function assertAssignee(assigneeId) {
  if (!assigneeId) return;
  const u = await prisma.user.findUnique({ where: { id: assigneeId } });
  if (!u || !u.isActive || u.role === 'CUSTOMER') throw ApiError.badRequest('Người được giao không phải nhân viên đang làm việc');
}

async function assertActiveArea(areaId) {
  const area = await prisma.cleaningArea.findUnique({ where: { id: areaId } });
  if (!area || !area.isActive) throw ApiError.badRequest('Khu vực không tồn tại hoặc đang ẩn');
  return area;
}

// ============ Tổng quan ============
// GET /cleaning/overview
export async function overview(req, res) {
  const me = req.user.id;
  const todayStart = startOfVnDay();

  if ((await prisma.cleaningArea.count()) === 0) await seedDefaultAreas(prisma); // DB mới -> tạo khu vực mặc định

  const [open, doneToday, areas] = await Promise.all([
    prisma.cleaningTask.findMany({ where: { status: { in: OPEN }, area: { isActive: true } }, include, orderBy: openOrder }),
    prisma.cleaningTask.findMany({
      where: { status: 'DONE', completedAt: { gte: todayStart } },
      include,
      orderBy: { completedAt: 'desc' },
    }),
    prisma.cleaningArea.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  // Khu vực đang có việc chưa xong = cần dọn
  const dirtyAreas = areas
    .map((a) => {
      const tasks = open.filter((t) => t.areaId === a.id);
      return { id: a.id, name: a.name, openCount: tasks.length, urgent: tasks.some((t) => t.priority === 'URGENT') };
    })
    .filter((a) => a.openCount > 0)
    .sort((a, b) => b.urgent - a.urgent || b.openCount - a.openCount);

  // Khu vực sạch nhưng đã lâu chưa ai dọn (nhắc đi một vòng kiểm tra)
  const dirtyIds = new Set(dirtyAreas.map((a) => a.id));
  const staleAreas = areas
    .filter((a) => !dirtyIds.has(a.id) && (!a.lastCleanedAt || a.lastCleanedAt < staleBefore()))
    .map((a) => ({ id: a.id, name: a.name, lastCleanedAt: a.lastCleanedAt }));

  // Hôm nay ai làm được bao nhiêu việc
  const byUser = new Map();
  for (const t of doneToday) {
    const key = t.assigneeId ?? 0;
    const row = byUser.get(key) ?? { user: t.assignee, count: 0 };
    row.count++;
    byUser.set(key, row);
  }

  res.json({
    success: true,
    data: {
      counts: {
        todo: open.filter((t) => t.status === 'TODO').length,
        inProgress: open.filter((t) => t.status === 'IN_PROGRESS').length,
        urgent: open.filter((t) => t.priority === 'URGENT').length,
        unassigned: open.filter((t) => !t.assigneeId).length,
        mine: open.filter((t) => t.assigneeId === me).length,
        doneToday: doneToday.length,
        myDoneToday: doneToday.filter((t) => t.assigneeId === me).length,
        dirtyAreas: dirtyAreas.length,
        areas: areas.length,
      },
      staleHours: STALE_HOURS,
      urgentTasks: open.filter((t) => t.priority === 'URGENT').slice(0, 5),
      myTasks: open.filter((t) => t.assigneeId === me).slice(0, 5),
      dirtyAreas,
      staleAreas,
      recentDone: doneToday.slice(0, 5),
      doneTodayByUser: [...byUser.values()].sort((a, b) => b.count - a.count),
    },
  });
}

// ============ Khu vực ============
// GET /cleaning/areas: khu vực + việc chưa xong của từng khu
export async function listAreas(req, res) {
  if ((await prisma.cleaningArea.count()) === 0) await seedDefaultAreas(prisma);
  const showHidden = req.validatedQuery.all && isManager(req.user);

  const areas = await prisma.cleaningArea.findMany({
    where: showHidden ? {} : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { tasks: { where: { status: { in: OPEN } }, include, orderBy: openOrder } },
  });
  const before = staleBefore();
  res.json({
    success: true,
    data: areas.map(({ tasks, ...a }) => ({
      ...a,
      openTasks: tasks,
      needsCleaning: tasks.length > 0,
      isStale: tasks.length === 0 && (!a.lastCleanedAt || a.lastCleanedAt < before),
    })),
    meta: { staleHours: STALE_HOURS },
  });
}

export async function createArea(req, res) {
  const area = await prisma.cleaningArea.create({ data: req.body });
  res.status(201).json({ success: true, data: area });
}

export async function updateArea(req, res) {
  const area = await prisma.cleaningArea.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json({ success: true, data: area });
}

// POST /cleaning/areas/:id/clean: tạp vụ báo "Đã dọn xong" cả khu.
// - Khu đang có việc chưa xong: đánh dấu xong các việc người này được phép hoàn thành
//   (việc người khác đang làm thì để nguyên).
// - Khu chưa có việc nào: ghi 1 lần "Dọn định kỳ" vào lịch sử (như tờ giấy ký tên dán ở cửa nhà vệ sinh).
export async function cleanArea(req, res) {
  const user = req.user;
  const area = await assertActiveArea(Number(req.params.id));
  const now = new Date();
  const note = req.body.note || null;

  const result = await prisma.$transaction(async (tx) => {
    const open = await tx.cleaningTask.findMany({ where: { areaId: area.id, status: { in: OPEN } }, include });
    const mine = open.filter((t) => !t.assigneeId || t.assigneeId === user.id || isManager(user));

    for (const t of mine) {
      await tx.cleaningTask.update({
        where: { id: t.id },
        data: { status: 'DONE', completedAt: now, assigneeId: t.assigneeId ?? user.id, resultNote: note ?? t.resultNote },
      });
    }
    if (mine.length === 0) {
      await tx.cleaningTask.create({
        data: { title: 'Dọn định kỳ', areaId: area.id, status: 'DONE', assigneeId: user.id, createdById: user.id, completedAt: now, resultNote: note },
      });
    }
    await tx.cleaningArea.update({ where: { id: area.id }, data: { lastCleanedAt: now } });
    return { closed: mine.length, skipped: open.length - mine.length };
  });

  const message =
    result.closed > 0
      ? `Đã hoàn thành ${result.closed} việc ở ${area.name}`
      : `Đã ghi nhận dọn ${area.name}`;
  res.json({ success: true, data: result, message: result.skipped ? `${message}. Còn ${result.skipped} việc người khác đang làm.` : message });
}

// ============ Nhiệm vụ ============
// GET /cleaning/tasks: việc chưa xong (không phân trang, mỗi lúc chỉ có vài chục việc)
export async function listTasks(req, res) {
  const q = req.validatedQuery;
  const where = { status: q.status === 'OPEN' ? { in: OPEN } : q.status, area: { isActive: true } };
  if (q.mine) where.assigneeId = req.user.id;
  if (q.areaId) where.areaId = q.areaId;

  const tasks = await prisma.cleaningTask.findMany({ where, include, orderBy: openOrder, take: 200 });
  res.json({ success: true, data: tasks });
}

// POST /cleaning/tasks: quản lý giao việc, tạp vụ tự thêm, phục vụ / lễ tân báo cần dọn
export async function createTask(req, res) {
  const { assigneeId, ...body } = req.body;
  await assertActiveArea(body.areaId);
  // Chỉ người có quyền Sửa (người làm / người điều phối) mới giao việc cho ai đó; phục vụ báo thì để trống
  const assignTo = can(req.user, 'CLEANING', 'edit') ? (assigneeId ?? null) : null;
  await assertAssignee(assignTo);

  const task = await prisma.cleaningTask.create({
    data: { ...body, note: body.note || null, assigneeId: assignTo, createdById: req.user.id },
    include,
  });
  res.status(201).json({ success: true, data: task });
}

// PUT /cleaning/tasks/:id: sửa nội dung / đổi người được giao (chỉ việc chưa xong)
export async function updateTask(req, res) {
  const id = Number(req.params.id);
  const current = await prisma.cleaningTask.findUnique({ where: { id } });
  if (!current) throw ApiError.notFound('Không tìm thấy việc');
  if (!OPEN.includes(current.status)) throw ApiError.badRequest('Việc đã xong hoặc đã hủy, không sửa được nữa');

  const { assigneeId, ...body } = req.body;
  if (body.areaId !== current.areaId) await assertActiveArea(body.areaId);
  if (assigneeId !== undefined) await assertAssignee(assigneeId);

  const task = await prisma.cleaningTask.update({
    where: { id },
    data: { ...body, note: body.note || null, ...(assigneeId !== undefined && { assigneeId }) },
    include,
  });
  res.json({ success: true, data: task });
}

// PATCH /cleaning/tasks/:id/status
//   IN_PROGRESS: "Bắt đầu" = nhận việc, người bấm thành người làm
//   DONE: "Hoàn thành", kèm ghi chú (không bắt buộc)
//   CANCELLED: "Hủy" (cần quyền Xóa), bắt buộc lý do
export async function updateTaskStatus(req, res) {
  const id = Number(req.params.id);
  const user = req.user;
  const { status, note } = req.body;

  const current = await prisma.cleaningTask.findUnique({ where: { id }, include });
  if (!current) throw ApiError.notFound('Không tìm thấy việc');
  if (!CLEANING_FLOW[current.status].includes(status)) {
    throw ApiError.badRequest(current.status === 'DONE' ? 'Việc này đã xong rồi' : 'Không thể đổi trạng thái việc này');
  }

  const now = new Date();
  let data;
  if (status === 'IN_PROGRESS') {
    data = { status, startedAt: now, assigneeId: user.id };
  } else if (status === 'DONE') {
    assertCanFinish(user, current);
    data = { status, completedAt: now, assigneeId: current.assigneeId ?? user.id, resultNote: note || null };
  } else {
    if (!isManager(user)) throw ApiError.forbidden('Chỉ quản lý mới hủy được việc');
    data = { status, completedAt: now, resultNote: note };
  }

  const task = await prisma.$transaction(async (tx) => {
    // Điều kiện status trong where: 2 người bấm cùng lúc thì người sau không ghi đè được
    const { count } = await tx.cleaningTask.updateMany({ where: { id, status: current.status }, data });
    if (count === 0) throw ApiError.conflict('Việc này vừa được người khác cập nhật, vui lòng tải lại');
    if (status === 'DONE') await tx.cleaningArea.update({ where: { id: current.areaId }, data: { lastCleanedAt: now } });
    return tx.cleaningTask.findUnique({ where: { id }, include });
  });
  res.json({ success: true, data: task });
}

// ============ Lịch sử ============
// GET /cleaning/history?from=2026-11-13&to=2026-11-19&userId=&areaId=&status=DONE
export async function history(req, res) {
  const q = req.validatedQuery;
  const { page, limit, skip, take } = getPagination(q, 20);

  const to = q.to ? vnDate(q.to) : startOfVnDay();
  const from = q.from ? vnDate(q.from) : addDays(to, -6); // mặc định 7 ngày gần nhất
  if (from > to) throw ApiError.badRequest('Ngày bắt đầu phải trước ngày kết thúc');

  const where = { status: q.status, completedAt: { gte: from, lt: addDays(to, 1) } };
  if (q.userId) where.assigneeId = q.userId;
  if (q.areaId) where.areaId = q.areaId;

  const [items, total, grouped] = await Promise.all([
    prisma.cleaningTask.findMany({ where, include, orderBy: { completedAt: 'desc' }, skip, take }),
    prisma.cleaningTask.count({ where }),
    prisma.cleaningTask.groupBy({ by: ['assigneeId'], where, _count: { _all: true } }),
  ]);

  // Tổng số việc theo từng người trong khoảng ngày đang lọc
  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.assigneeId).filter(Boolean) } },
    ...userSelect,
  });
  const byUser = grouped
    .map((g) => ({ user: users.find((u) => u.id === g.assigneeId) ?? null, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    data: items,
    meta: { ...paginationMeta(total, page, limit), from: from.toISOString(), to: to.toISOString(), byUser },
  });
}

// ============ Nhân viên ============
// GET /cleaning/staff: người có thể giao việc vệ sinh (nhân viên được quyền Sửa ở chức năng này)
export async function staff(req, res) {
  const users = await prisma.user.findMany({
    where: {
      role: 'STAFF',
      isActive: true,
      staffRole: { permissions: { some: { module: 'CLEANING', canEdit: true } } },
    },
    ...userSelect,
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: users });
}
