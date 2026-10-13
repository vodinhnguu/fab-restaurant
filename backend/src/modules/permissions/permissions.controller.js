import { ACTIONS, MODULES } from '../../config/permissions.js';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { formatRole, generateKey, replacePermissions, seedDefaultRoles } from './permissions.service.js';

const include = { permissions: true, _count: { select: { users: true } } };

async function findRole(id) {
  const role = await prisma.staffRole.findUnique({ where: { id: Number(id) }, include });
  if (!role) throw ApiError.notFound('Không tìm thấy vai trò');
  return role;
}

// Trả cả danh sách chức năng + vai trò để frontend vẽ ma trận, không phải khai báo lại
export async function list(req, res) {
  if ((await prisma.staffRole.count()) === 0) await seedDefaultRoles(prisma); // DB mới -> tự tạo vai trò mặc định
  const roles = await prisma.staffRole.findMany({ include, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  res.json({ success: true, data: { modules: MODULES, actions: ACTIONS, roles: roles.map(formatRole) } });
}

export async function detail(req, res) {
  res.json({ success: true, data: formatRole(await findRole(req.params.id)) });
}

export async function create(req, res) {
  const { name, description, permissions } = req.body;
  const key = await generateKey(prisma, name);
  const max = await prisma.staffRole.aggregate({ _max: { sortOrder: true } });
  const role = await prisma.$transaction(async (tx) => {
    const r = await tx.staffRole.create({ data: { key, name, description, sortOrder: (max._max.sortOrder ?? 0) + 1 } });
    await replacePermissions(tx, r, permissions);
    return tx.staffRole.findUnique({ where: { id: r.id }, include });
  });
  res.status(201).json({ success: true, data: formatRole(role) });
}

export async function update(req, res) {
  const role = await findRole(req.params.id);
  const { name, description, permissions } = req.body;
  const updated = await prisma.$transaction(async (tx) => {
    await tx.staffRole.update({ where: { id: role.id }, data: { name, description } });
    await replacePermissions(tx, role, permissions);
    return tx.staffRole.findUnique({ where: { id: role.id }, include });
  });
  res.json({ success: true, data: formatRole(updated) });
}

export async function remove(req, res) {
  const role = await findRole(req.params.id);
  if (role.isSystem) throw ApiError.badRequest('Không thể xóa vai trò mặc định, chỉ có thể sửa quyền');
  const used = await prisma.user.count({ where: { staffRoleId: role.id } });
  if (used) throw ApiError.badRequest(`Còn ${used} nhân viên đang giữ vai trò này, hãy đổi vai trò cho họ trước`);
  await prisma.staffRole.delete({ where: { id: role.id } }); // quyền đi kèm tự xóa (onDelete: Cascade)
  res.json({ success: true, message: 'Đã xóa vai trò' });
}
