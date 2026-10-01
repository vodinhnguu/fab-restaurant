import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, paginationMeta } from '../../utils/helpers.js';

export const updateUserSchema = z.object({
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

const publicFields = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  _count: { select: { orders: true, reservations: true } },
};

export async function list(req, res) {
  const { page, limit, skip, take } = getPagination(req.query, 20);
  const where = {};
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: 'insensitive' } },
      { email: { contains: req.query.search, mode: 'insensitive' } },
      { phone: { contains: req.query.search } },
    ];
  }
  if (['CUSTOMER', 'ADMIN'].includes(req.query.role)) where.role = req.query.role;

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: publicFields, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: paginationMeta(total, page, limit) });
}

export async function update(req, res) {
  const id = Number(req.params.id);
  if (id === req.user.id) throw ApiError.badRequest('Không thể tự thay đổi quyền / khóa tài khoản của chính mình');
  const user = await prisma.user.update({ where: { id }, data: req.body, select: publicFields });
  res.json({ success: true, data: user });
}
