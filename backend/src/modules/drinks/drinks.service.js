// Kiểm bia nước cuối ngày. Tài liệu: docs/29-kiem-bia-nuoc.md
//
//   xuất ra quầy = issuedPacks × packSize + issuedUnits   (xuất theo THÙNG, thêm lon lẻ nếu có)
//   bán          = số lon / chai trong các đơn của NGÀY đó (món đã hủy không tính) - backend tự tính
//   trả lại      = số còn lại trả về kho cuối ngày (người kiểm nhập)
//
//   lệch = (bán + trả lại) − xuất
//      0      = khớp, giải thích được hết số hàng đã xuất
//      ÂM     = THIẾU hàng: xuất ra mà không bán, không trả lại (mất, uống không ghi đơn)
//      DƯƠNG  = THỪA: bán + trả lại nhiều hơn số xuất (quên ghi phiếu xuất, hoặc lấy thêm từ kho không ghi)
//
// Mỗi loại 1 phiếu / ngày (@@unique([productId, date])). Lưu lại `soldUnits` và `diffUnits` lúc ghi phiếu
// để xem lại lịch sử không phải tính lại, nhưng khi MỞ phiếu luôn tính "bán" theo đơn mới nhất.
import { prisma } from '../../lib/prisma.js';
import { DRINK_CATEGORY, packSizeForDish } from '../../config/drinks.js';
import { ApiError } from '../../utils/ApiError.js';
import { startOfVnDay } from '../../utils/helpers.js';

const DAY_MS = 24 * 3600 * 1000;

const userSelect = { select: { id: true, name: true, staffRole: { select: { name: true } } } };
const productSelect = {
  id: true,
  packSize: true,
  isActive: true,
  sortOrder: true,
  dish: { select: { id: true, name: true, unit: true, price: true, salePrice: true } },
};

/** 0h (giờ VN) của ngày `yyyy-MM-dd`; không truyền thì hôm nay. Sai định dạng = 400. */
export function parseVnDate(text) {
  if (!text) return startOfVnDay();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw ApiError.badRequest('Ngày phải có dạng yyyy-MM-dd');
  const d = new Date(`${text}T00:00:00+07:00`);
  if (Number.isNaN(d.getTime())) throw ApiError.badRequest('Ngày không hợp lệ');
  return startOfVnDay(d);
}

/** Số lon / chai đã bán theo đơn trong ngày [from, from+1), theo từng món. */
async function soldByDish(from) {
  const rows = await prisma.orderItem.groupBy({
    by: ['dishId'],
    where: {
      status: { not: 'CANCELLED' },
      createdAt: { gte: from, lt: new Date(from.getTime() + DAY_MS) },
      dish: { category: { name: DRINK_CATEGORY } },
    },
    _sum: { quantity: true },
  });
  return new Map(rows.map((r) => [r.dishId, r._sum.quantity ?? 0]));
}

const issuedTotal = (check, packSize) =>
  check ? (check.issuedPacks ?? 0) * packSize + (check.issuedUnits ?? 0) : 0;

/**
 * Phiếu kiểm của 1 ngày: mỗi loại đồ uống 1 dòng kèm xuất / bán / trả lại / lệch.
 * [all] = true: kể cả loại đã tắt.
 */
export async function dayCheck(date, { all = false } = {}) {
  const from = parseVnDate(date);
  const [products, sold] = await Promise.all([
    prisma.drinkProduct.findMany({
      where: all ? {} : { isActive: true },
      orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      select: productSelect,
    }),
    soldByDish(from),
  ]);

  const checks = await prisma.drinkDayCheck.findMany({
    where: { date: from, productId: { in: products.map((p) => p.id) } },
    include: { user: userSelect },
  });
  const checkByProduct = new Map(checks.map((c) => [c.productId, c]));

  const rows = products.map((p) => {
    const check = checkByProduct.get(p.id) ?? null;
    const issued = issuedTotal(check, p.packSize);
    const soldUnits = sold.get(p.dish.id) ?? 0;
    const returned = check?.returnedUnits ?? 0;
    return {
      productId: p.id,
      dishId: p.dish.id,
      name: p.dish.name,
      unit: p.dish.unit, // lon / chai
      packSize: p.packSize,
      isActive: p.isActive,
      issuedPacks: check?.issuedPacks ?? 0,
      issuedUnits: check?.issuedUnits ?? 0,
      issued,
      sold: soldUnits,
      returned,
      // Chưa ghi phiếu thì chưa kết luận lệch (xuất = 0 không có nghĩa là thiếu hàng)
      diff: check ? soldUnits + returned - issued : 0,
      checked: !!check,
      note: check?.note ?? null,
      by: check?.user?.name ?? null,
      updatedAt: check?.updatedAt ?? null,
    };
  });

  const checkedRows = rows.filter((r) => r.checked);
  return {
    date: from.toISOString(),
    rows,
    summary: {
      issued: checkedRows.reduce((s, r) => s + r.issued, 0),
      sold: rows.reduce((s, r) => s + r.sold, 0),
      returned: checkedRows.reduce((s, r) => s + r.returned, 0),
      diff: checkedRows.reduce((s, r) => s + r.diff, 0),
      checked: checkedRows.length,
      total: rows.length,
      // Loại có lệch khác 0: cần giải thích
      mismatched: checkedRows.filter((r) => r.diff !== 0).length,
    },
  };
}

/**
 * Ghi / sửa phiếu kiểm 1 loại trong 1 ngày. Tính lại "bán" theo đơn ngay lúc lưu.
 * Không cho ghi phiếu cho ngày tương lai (chưa bán thì chưa kiểm được).
 */
export async function saveCheck(
  { date, productId, issuedPacks = 0, issuedUnits = 0, returnedUnits = 0, note = null },
  userId,
) {
  const from = parseVnDate(date);
  if (from.getTime() > startOfVnDay().getTime()) throw ApiError.badRequest('Chưa kiểm được cho ngày chưa tới');

  const product = await prisma.drinkProduct.findUnique({ where: { id: productId }, select: productSelect });
  if (!product) throw ApiError.notFound('Không tìm thấy loại đồ uống này');
  if (!product.isActive) throw ApiError.badRequest(`"${product.dish.name}" đã tắt, bật lại mới kiểm được`);

  const issued = issuedPacks * product.packSize + issuedUnits;
  const sold = (await soldByDish(from)).get(product.dish.id) ?? 0;
  if (returnedUnits > issued) {
    throw ApiError.badRequest(`Trả lại ${returnedUnits} ${product.dish.unit} nhiều hơn số xuất ra quầy (${issued})`);
  }
  const diff = sold + returnedUnits - issued; // âm = thiếu hàng, dương = thừa

  const data = { issuedPacks, issuedUnits, returnedUnits, soldUnits: sold, diffUnits: diff, note: note?.trim() || null, userId: userId ?? null };
  const check = await prisma.drinkDayCheck.upsert({
    where: { productId_date: { productId, date: from } },
    create: { productId, date: from, ...data },
    update: data,
    include: { product: { select: productSelect }, user: userSelect },
  });
  return { check, issued, sold, returned: returnedUnits, diff, name: product.dish.name, unit: product.dish.unit };
}

/** Danh sách loại đồ uống + quy cách thùng (để sửa quy cách). */
export const products = ({ all = false } = {}) =>
  prisma.drinkProduct.findMany({
    where: all ? {} : { isActive: true },
    orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }],
    select: productSelect,
  });

/** Sửa quy cách thùng / tắt - bật 1 loại. */
export async function updateProduct(id, data) {
  const product = await prisma.drinkProduct.findUnique({ where: { id }, select: productSelect });
  if (!product) throw ApiError.notFound('Không tìm thấy loại đồ uống này');
  return prisma.drinkProduct.update({ where: { id }, data, select: productSelect });
}

/**
 * Thêm 1 món đồ uống vào danh sách kiểm (món mới admin vừa tạo trên web).
 * Quy cách thùng đoán theo tên món nếu không truyền.
 */
export async function addProduct({ dishId, packSize }) {
  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    select: { id: true, name: true, drink: { select: { id: true } }, category: { select: { name: true } } },
  });
  if (!dish) throw ApiError.notFound('Không tìm thấy món này');
  if (dish.drink) throw ApiError.badRequest(`"${dish.name}" đã có trong danh sách kiểm`);
  if (dish.category?.name !== DRINK_CATEGORY) {
    throw ApiError.badRequest(`Chỉ kiểm món trong nhóm "${DRINK_CATEGORY}" (đóng lon / chai)`);
  }
  const last = await prisma.drinkProduct.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  return prisma.drinkProduct.create({
    data: { dishId, packSize: packSize ?? packSizeForDish(dish.name), sortOrder: (last?.sortOrder ?? 0) + 1 },
    select: productSelect,
  });
}

/** Lịch sử: các ngày đã kiểm gần đây + tổng lệch mỗi ngày (để thấy ngày nào hay thiếu hàng). */
export async function history({ days = 14 } = {}) {
  const from = new Date(startOfVnDay().getTime() - (days - 1) * DAY_MS);
  const rows = await prisma.drinkDayCheck.groupBy({
    by: ['date'],
    where: { date: { gte: from } },
    _sum: { issuedUnits: true, soldUnits: true, returnedUnits: true, diffUnits: true },
    _count: { _all: true },
    orderBy: { date: 'desc' },
  });
  return rows.map((r) => ({
    date: r.date,
    checked: r._count._all,
    sold: r._sum.soldUnits ?? 0,
    returned: r._sum.returnedUnits ?? 0,
    diff: r._sum.diffUnits ?? 0,
  }));
}
