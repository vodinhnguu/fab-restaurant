import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, paginationMeta } from '../../utils/helpers.js';

export const reviewSchema = z.object({
  dishId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1, 'Chọn từ 1 đến 5 sao').max(5),
  comment: z.string().trim().max(1000).optional().nullable(),
});

// Tính lại điểm trung bình của món sau mỗi lần thêm/sửa/xóa đánh giá
async function recalcRating(tx, dishId) {
  const agg = await tx.review.aggregate({ where: { dishId }, _avg: { rating: true }, _count: true });
  await tx.dish.update({
    where: { id: dishId },
    data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count },
  });
}

// Tạo hoặc cập nhật đánh giá (mỗi người 1 đánh giá / món)
export async function upsert(req, res) {
  const { dishId, rating, comment } = req.body;

  // Chỉ người đã từng đặt món (đơn đã hoàn thành) mới được đánh giá
  const ordered = await prisma.orderItem.findFirst({
    where: { dishId, order: { userId: req.user.id, status: 'COMPLETED' } },
  });
  if (!ordered) throw ApiError.forbidden('Bạn cần đặt và nhận món này trước khi đánh giá');

  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.upsert({
      where: { userId_dishId: { userId: req.user.id, dishId } },
      create: { userId: req.user.id, dishId, rating, comment },
      update: { rating, comment },
    });
    await recalcRating(tx, dishId);
    return r;
  });

  res.status(201).json({ success: true, data: review });
}

// ---- Admin ----
export async function list(req, res) {
  const { page, limit, skip, take } = getPagination(req.query, 20);
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { user: { select: { name: true, email: true } }, dish: { select: { name: true, slug: true } } },
    }),
    prisma.review.count(),
  ]);
  res.json({ success: true, data: items, meta: paginationMeta(total, page, limit) });
}

export async function remove(req, res) {
  await prisma.$transaction(async (tx) => {
    const r = await tx.review.delete({ where: { id: Number(req.params.id) } });
    await recalcRating(tx, r.dishId);
  });
  res.json({ success: true, message: 'Đã xóa đánh giá' });
}
