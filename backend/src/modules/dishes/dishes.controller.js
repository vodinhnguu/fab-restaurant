import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, paginationMeta, slugify } from '../../utils/helpers.js';

const SORTS = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  popular: { soldCount: 'desc' },
  rating: { ratingAvg: 'desc' },
};

// GET /dishes?search=&category=&featured=&sort=&page=&limit=
export async function list(req, res) {
  const q = req.validatedQuery;
  const { page, limit, skip, take } = getPagination(q);

  const where = {};
  if (q.search) where.name = { contains: q.search, mode: 'insensitive' };
  if (q.category) where.category = { slug: q.category };
  if (q.featured === 'true') where.isFeatured = true;
  // Mặc định khách chỉ thấy món đang bán; admin truyền available=all để xem hết
  if (q.available !== 'all') where.isAvailable = q.available !== 'false';
  if (q.minPrice || q.maxPrice) where.price = { gte: q.minPrice, lte: q.maxPrice };

  const [items, total] = await prisma.$transaction([
    prisma.dish.findMany({
      where,
      orderBy: SORTS[q.sort],
      skip,
      take,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.dish.count({ where }),
  ]);

  res.json({ success: true, data: items, meta: paginationMeta(total, page, limit) });
}

// GET /dishes/:idOrSlug  - nhận cả id (số) lẫn slug
export async function detail(req, res) {
  const { idOrSlug } = req.params;
  const where = /^\d+$/.test(idOrSlug) ? { id: Number(idOrSlug) } : { slug: idOrSlug };

  const dish = await prisma.dish.findUnique({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });
  if (!dish) throw ApiError.notFound('Không tìm thấy món ăn');

  // Gợi ý món cùng danh mục
  const related = await prisma.dish.findMany({
    where: { categoryId: dish.categoryId, id: { not: dish.id }, isAvailable: true },
    take: 4,
    orderBy: { soldCount: 'desc' },
  });

  res.json({ success: true, data: { ...dish, related } });
}

// Tạo slug không trùng: "tom-hap-bia", "tom-hap-bia-2"...
async function uniqueSlug(name, excludeId) {
  const base = slugify(name);
  let slug = base;
  let i = 2;
  while (await prisma.dish.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function create(req, res) {
  const dish = await prisma.dish.create({ data: { ...req.body, slug: await uniqueSlug(req.body.name) } });
  res.status(201).json({ success: true, data: dish });
}

export async function update(req, res) {
  const id = Number(req.params.id);
  const dish = await prisma.dish.update({
    where: { id },
    data: { ...req.body, slug: await uniqueSlug(req.body.name, id) },
  });
  res.json({ success: true, data: dish });
}

// PATCH /dishes/:id/toggle - bật/tắt nhanh trạng thái còn món
export async function toggleAvailable(req, res) {
  const id = Number(req.params.id);
  const current = await prisma.dish.findUnique({ where: { id } });
  if (!current) throw ApiError.notFound();
  const dish = await prisma.dish.update({ where: { id }, data: { isAvailable: !current.isAvailable } });
  res.json({ success: true, data: dish });
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  const used = await prisma.orderItem.count({ where: { dishId: id } });
  if (used > 0) {
    // Món đã có trong đơn hàng -> không xóa hẳn để giữ lịch sử, chỉ ẩn đi
    await prisma.dish.update({ where: { id }, data: { isAvailable: false } });
    return res.json({ success: true, message: 'Món đã có trong đơn hàng nên được chuyển sang trạng thái ngừng bán' });
  }
  await prisma.dish.delete({ where: { id } });
  res.json({ success: true, message: 'Đã xóa món' });
}
