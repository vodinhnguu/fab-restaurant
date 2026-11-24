// Tồn hồ hải sản: nhập bao nhiêu, bán bao nhiêu, còn lại bao nhiêu. Tài liệu: docs/27-ton-ho-hai-san.md
//
// Hồ nuôi 6 loại hải sản sống (TankItem). Mỗi lần tồn đổi là 1 dòng sổ (TankEntry), không bao giờ
// sửa `stockKg` mà không ghi sổ -> luôn giải thích được tồn hiện tại từ đâu ra.
//
//   IMPORT  Nhập hàng   (+kg, hồ hải sản ghi, có giá nhập)
//   SALE    Bán         (−kg, TỰ ĐỘNG khi phục vụ nhập số kg món bán theo kg ở app)
//   RETURN  Trả lại hồ  (+kg, TỰ ĐỘNG khi hủy món đã cân mà bếp chưa nhận làm)
//   AUDIT   Kiểm hồ     (±kg lệch, hồ hải sản cân / đếm thực tế rồi nhập số đúng)
//   LOSS    Hao hụt     (−kg, hải sản chết / thất thoát, bắt buộc ghi lý do)
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, paginationMeta, slugify, startOfVnDay } from '../../utils/helpers.js';

const userSelect = { select: { id: true, name: true, staffRole: { select: { name: true } } } };

// Số kg: làm tròn tới gam để khỏi lệch số lẻ (0,1 + 0,2 = 0,30000000000000004)
export const roundKg = (kg) => Math.round(kg * 1000) / 1000;

/**
 * Ghi 1 dòng sổ và cộng / trừ tồn trong cùng transaction [tx].
 * Dùng cho cả phiếu người ghi tay (nhập hàng, kiểm hồ, hao hụt) và phiếu tự động (bán, trả lại hồ).
 * Tồn không xuống dưới 0 (đếm lệch, bán món lúc tồn đang 0): kẹp ở 0 và vẫn ghi sổ đúng số kg thật.
 */
export async function addEntry(tx, { tankItemId, type, deltaKg, unitCost, supplier, note, userId, orderId, orderItemId }) {
  const item = await tx.tankItem.findUnique({ where: { id: tankItemId }, select: { id: true, stockKg: true } });
  if (!item) throw ApiError.notFound('Không tìm thấy loại hải sản này trong hồ');

  const delta = roundKg(deltaKg);
  const stockAfter = Math.max(0, roundKg(item.stockKg + delta));
  await tx.tankItem.update({ where: { id: item.id }, data: { stockKg: stockAfter } });
  return tx.tankEntry.create({
    data: {
      tankItemId: item.id,
      type,
      deltaKg: delta,
      stockAfter,
      unitCost: unitCost ?? null,
      supplier: supplier?.trim() || null,
      note: note?.trim() || null,
      userId: userId ?? null,
      orderId: orderId ?? null,
      orderItemId: orderItemId ?? null,
    },
    include: { tankItem: { select: { id: true, name: true, stockKg: true, lowStockKg: true } } },
  });
}

/**
 * Trừ hồ khi món bán theo kg được nhập số kg (phục vụ cân tại hồ), cộng lại khi hủy món đã cân.
 * Gọi từ dine-in.service.js trong cùng transaction. Món không gắn loại hồ nào thì bỏ qua (không lỗi):
 * thực đơn có thể thêm nhóm món theo kg mới mà chưa khai báo trong config/tank.js.
 */
export async function recordDishWeight(tx, { dishId, kg, type, userId, orderId, orderItemId, note }) {
  if (!kg) return null;
  const dish = await tx.dish.findUnique({ where: { id: dishId }, select: { tankItemId: true } });
  if (!dish?.tankItemId) return null;
  return addEntry(tx, {
    tankItemId: dish.tankItemId,
    type,
    deltaKg: type === 'SALE' ? -Math.abs(kg) : Math.abs(kg),
    userId,
    orderId,
    orderItemId,
    note,
  });
}

/** Tổng kg theo loại phiếu trong khoảng thời gian, trả về Map(tankItemId -> { IMPORT, SALE, ... }) */
async function totalsSince(from) {
  const rows = await prisma.tankEntry.groupBy({
    by: ['tankItemId', 'type'],
    where: { createdAt: { gte: from } },
    _sum: { deltaKg: true },
  });
  const map = new Map();
  for (const r of rows) {
    const cur = map.get(r.tankItemId) ?? {};
    cur[r.type] = roundKg(Math.abs(r._sum.deltaKg ?? 0));
    map.set(r.tankItemId, cur);
  }
  return map;
}

/**
 * Trang Tồn hồ: mỗi loại kèm tồn hiện tại, hôm nay nhập / bán / hao hụt bao nhiêu, số món trên thực đơn.
 * [all] = true: kể cả loại đã tắt (hồ không nuôi nữa).
 */
export async function list({ all = false } = {}) {
  const [items, today] = await Promise.all([
    prisma.tankItem.findMany({
      where: all ? {} : { isActive: true },
      orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true, name: true, slug: true, note: true, stockKg: true, lowStockKg: true, isActive: true, sortOrder: true,
        _count: { select: { dishes: true } },
      },
    }),
    totalsSince(startOfVnDay()),
  ]);

  return items.map((i) => {
    const t = today.get(i.id) ?? {};
    return {
      ...i,
      dishCount: i._count.dishes,
      _count: undefined,
      isLow: i.isActive && i.stockKg <= i.lowStockKg, // hết (0 kg) cũng tính là "gần hết"
      isEmpty: i.isActive && i.stockKg <= 0,
      today: {
        imported: t.IMPORT ?? 0,
        sold: t.SALE ?? 0,
        returned: t.RETURN ?? 0,
        lost: t.LOSS ?? 0,
        audited: t.AUDIT ?? 0,
      },
    };
  });
}

/** Sổ nhập - xuất: lọc theo loại, loại phiếu, 1 ngày (yyyy-MM-dd); mới nhất lên đầu. */
export async function entries({ tankItemId, type, date, page, limit } = {}) {
  const where = {
    ...(tankItemId ? { tankItemId: Number(tankItemId) } : {}),
    ...(type ? { type } : {}),
  };
  if (date) {
    const from = startOfVnDay(new Date(`${date}T00:00:00+07:00`));
    const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
    where.createdAt = { gte: from, lt: to };
  }
  const { page: p, limit: l, skip, take } = getPagination({ page, limit }, 20);
  const [rows, total] = await Promise.all([
    prisma.tankEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        tankItem: { select: { id: true, name: true } },
        user: userSelect,
        order: { select: { id: true, code: true, table: { select: { code: true, area: true } } } },
      },
    }),
    prisma.tankEntry.count({ where }),
  ]);
  return { items: rows, meta: paginationMeta(total, p, l) };
}

/** Nhập hàng: xe hàng về, cộng vào hồ. */
export const importStock = (id, { kg, unitCost, supplier, note }, userId) =>
  prisma.$transaction((tx) => addEntry(tx, { tankItemId: id, type: 'IMPORT', deltaKg: Math.abs(kg), unitCost, supplier, note, userId }));

/** Hao hụt: hải sản chết / thất thoát. Bắt buộc lý do (validation lo). */
export const recordLoss = (id, { kg, note }, userId) =>
  prisma.$transaction((tx) => addEntry(tx, { tankItemId: id, type: 'LOSS', deltaKg: -Math.abs(kg), note, userId }));

/**
 * Kiểm hồ: hồ hải sản cân / đếm thực tế được [actualKg], hệ thống ghi phần lệch so với tồn đang có.
 * Đúng y số máy đang ghi thì không tạo phiếu (trả về { skipped: true }) để sổ không bị rác.
 */
export async function audit(id, { actualKg, note }, userId) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.tankItem.findUnique({ where: { id }, select: { id: true, stockKg: true } });
    if (!item) throw ApiError.notFound('Không tìm thấy loại hải sản này trong hồ');
    const diff = roundKg(actualKg - item.stockKg);
    if (diff === 0) return { skipped: true, stockKg: item.stockKg, diff: 0 };
    const entry = await addEntry(tx, { tankItemId: id, type: 'AUDIT', deltaKg: diff, note, userId });
    return { skipped: false, stockKg: entry.stockAfter, diff, entry };
  });
}

/** Thêm loại hải sản mới (quyền Thêm). Tồn ban đầu 0, nhập hàng sau. */
export async function create({ name, lowStockKg, note }) {
  const slug = slugify(name);
  if (await prisma.tankItem.findFirst({ where: { OR: [{ slug }, { name }] } })) {
    throw ApiError.badRequest(`Hồ đã có loại "${name}"`);
  }
  const last = await prisma.tankItem.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  return prisma.tankItem.create({
    data: { name, slug, lowStockKg: lowStockKg ?? 2, note: note ?? null, sortOrder: (last?.sortOrder ?? 0) + 1 },
  });
}

/** Sửa tên / ngưỡng gần hết / ghi chú, hoặc tắt - bật loại. Không sửa tồn ở đây (phải qua phiếu). */
export async function update(id, data) {
  const item = await prisma.tankItem.findUnique({ where: { id } });
  if (!item) throw ApiError.notFound('Không tìm thấy loại hải sản này trong hồ');
  const patch = { ...data };
  if (data.name && data.name !== item.name) {
    patch.slug = slugify(data.name);
    if (await prisma.tankItem.findFirst({ where: { OR: [{ slug: patch.slug }, { name: data.name }], NOT: { id } } })) {
      throw ApiError.badRequest(`Hồ đã có loại "${data.name}"`);
    }
  }
  const updated = await prisma.tankItem.update({ where: { id }, data: patch });
  // Bật/tắt loại hồ -> bật/tắt tất cả món liên kết (app thấy ngay khi refresh)
  if ('isActive' in data) {
    await prisma.dish.updateMany({ where: { tankItemId: id }, data: { isAvailable: data.isActive } });
  }
  return updated;
}
