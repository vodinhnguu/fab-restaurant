import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { OWNER_KEY } from '../../config/permissions.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, paginationMeta } from '../../utils/helpers.js';

const ROLES = ['CUSTOMER', 'STAFF', 'ADMIN'];
const password = z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100);

export const updateUserSchema = z.object({
  role: z.enum(ROLES).optional(),
  staffRoleId: z.number().int().positive().nullable().optional(), // vai trò nhân viên (khi role = STAFF)
  isActive: z.boolean().optional(),
});

// Admin / quản lý tạo tài khoản nhân viên ngay trong trang admin, không cần nhân viên tự đăng ký
export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(100),
  email: z.email('Email không hợp lệ').toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  password,
  role: z.enum(['STAFF', 'ADMIN']).default('STAFF'),
  staffRoleId: z.number().int().positive().optional(),
});

export const resetPasswordSchema = z.object({ password });

const publicFields = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  staffRole: { select: { id: true, name: true } },
  _count: { select: { orders: true, reservations: true } },
};

// Nhân viên có quyền quản lý nhân sự vẫn KHÔNG được đụng tới tài khoản ADMIN / người giữ vai trò Chủ.
// Không ai tự sửa / khóa / đặt lại mật khẩu chính mình ở đây (đổi mật khẩu của mình ở trang Tài khoản).
async function findManageableUser(actor, id) {
  if (id === actor.id) throw ApiError.badRequest('Không thể tự thay đổi tài khoản của chính mình ở đây');
  const target = await prisma.user.findUnique({ where: { id }, include: { staffRole: true } });
  if (!target) throw ApiError.notFound('Không tìm thấy tài khoản');
  if (actor.role !== 'ADMIN' && (target.role === 'ADMIN' || target.staffRole?.key === OWNER_KEY)) {
    throw ApiError.forbidden('Chỉ quản trị viên (ADMIN) mới được thay đổi tài khoản này');
  }
  return target;
}

// Kiểm tra vai trò nhân viên hợp lệ; nhân viên không được gán vai trò Chủ nhà hàng
async function checkStaffRole(actor, staffRoleId) {
  if (!staffRoleId) throw ApiError.badRequest('Vui lòng chọn vai trò cho nhân viên');
  const staffRole = await prisma.staffRole.findUnique({ where: { id: staffRoleId } });
  if (!staffRole) throw ApiError.badRequest('Vai trò không tồn tại');
  if (actor.role !== 'ADMIN' && staffRole.key === OWNER_KEY) {
    throw ApiError.forbidden('Chỉ quản trị viên mới được gán vai trò Chủ nhà hàng');
  }
  return staffRoleId;
}

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
  if (ROLES.includes(req.query.role)) where.role = req.query.role;
  if (req.query.staffRoleId) where.staffRoleId = Number(req.query.staffRoleId);

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: publicFields, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: items, meta: paginationMeta(total, page, limit) });
}

export async function create(req, res) {
  const { password, role, staffRoleId, ...rest } = req.body;
  if (role === 'ADMIN' && req.user.role !== 'ADMIN') throw ApiError.forbidden('Chỉ quản trị viên mới tạo được tài khoản quản trị');
  if (await prisma.user.findUnique({ where: { email: rest.email } })) throw ApiError.conflict('Email đã được sử dụng');

  const user = await prisma.user.create({
    data: {
      ...rest,
      role,
      staffRoleId: role === 'STAFF' ? await checkStaffRole(req.user, staffRoleId) : null,
      passwordHash: await bcrypt.hash(password, 10),
    },
    select: publicFields,
  });
  res.status(201).json({ success: true, data: user });
}

export async function update(req, res) {
  const target = await findManageableUser(req.user, Number(req.params.id));
  if (req.user.role !== 'ADMIN' && req.body.role === 'ADMIN') {
    throw ApiError.forbidden('Chỉ quản trị viên (ADMIN) mới được cấp quyền quản trị');
  }

  const data = { ...req.body };
  const role = data.role ?? target.role;
  // Khách hàng / admin không cần vai trò nhân viên
  data.staffRoleId = role === 'STAFF' ? await checkStaffRole(req.user, data.staffRoleId ?? target.staffRoleId) : null;

  const user = await prisma.user.update({ where: { id: target.id }, data, select: publicFields });
  res.json({ success: true, data: user });
}

// Nhân viên quên mật khẩu -> admin đặt mật khẩu mới rồi báo lại cho họ
export async function resetPassword(req, res) {
  const target = await findManageableUser(req.user, Number(req.params.id));
  await prisma.user.update({ where: { id: target.id }, data: { passwordHash: await bcrypt.hash(req.body.password, 10) } });
  res.json({ success: true, message: `Đã đặt lại mật khẩu cho ${target.name}` });
}
