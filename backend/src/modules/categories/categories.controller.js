import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { slugify } from '../../utils/helpers.js';

export async function list(req, res) {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { dishes: true } } },
  });
  res.json({ success: true, data: categories });
}

export async function create(req, res) {
  const category = await prisma.category.create({ data: { ...req.body, slug: slugify(req.body.name) } });
  res.status(201).json({ success: true, data: category });
}

export async function update(req, res) {
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { ...req.body, slug: slugify(req.body.name) },
  });
  res.json({ success: true, data: category });
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  const count = await prisma.dish.count({ where: { categoryId: id } });
  if (count > 0) throw ApiError.conflict(`Danh mục đang có ${count} món, hãy chuyển hoặc xóa món trước`);
  await prisma.category.delete({ where: { id } });
  res.json({ success: true, message: 'Đã xóa danh mục' });
}
