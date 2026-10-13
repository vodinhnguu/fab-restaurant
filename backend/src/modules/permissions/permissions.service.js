import { DEFAULT_ROLES, lettersToFlags, MODULE_KEYS, OWNER_KEY } from '../../config/permissions.js';

const FULL = { canView: true, canCreate: true, canEdit: true, canDelete: true };

// Tạo 12 vai trò mặc định nếu chưa có. Chạy nhiều lần không bị trùng (skipDuplicates).
// Nhận `db` làm tham số để seed.js (có PrismaClient riêng) dùng lại được.
export async function seedDefaultRoles(db) {
  await db.staffRole.createMany({
    data: DEFAULT_ROLES.map((r, i) => ({ key: r.key, name: r.name, description: r.description, sortOrder: i + 1, isSystem: true })),
    skipDuplicates: true,
  });
  const roles = await db.staffRole.findMany({ where: { key: { in: DEFAULT_ROLES.map((r) => r.key) } } });
  const data = roles.flatMap((role) => {
    const perms = DEFAULT_ROLES.find((r) => r.key === role.key).perms;
    return MODULE_KEYS.map((module) => ({ roleId: role.id, module, ...lettersToFlags(perms[module]) }));
  });
  await db.rolePermission.createMany({ data, skipDuplicates: true });
}

// Quyền của 1 tài khoản (user đã include staffRole.permissions):
// ADMIN = toàn quyền, STAFF = theo vai trò được gán, còn lại = không có quyền gì
export function userPermissions(user) {
  const result = {};
  for (const module of MODULE_KEYS) {
    if (user?.role === 'ADMIN') {
      result[module] = { view: true, create: true, edit: true, delete: true };
      continue;
    }
    const p = user?.role === 'STAFF' ? user.staffRole?.permissions?.find((x) => x.module === module) : null;
    result[module] = { view: !!p?.canView, create: !!p?.canCreate, edit: !!p?.canEdit, delete: !!p?.canDelete };
  }
  return result;
}

// can(user, 'ORDERS', 'edit') -> true / false
export const can = (user, module, action) => !!userPermissions(user)[module]?.[action];

// Dòng DB -> dạng gọn cho frontend: { ORDERS: { view, create, edit, delete }, ... } (đủ mọi chức năng)
export function formatRole(role) {
  const permissions = {};
  for (const module of MODULE_KEYS) {
    const p = role.permissions.find((x) => x.module === module);
    permissions[module] = { view: !!p?.canView, create: !!p?.canCreate, edit: !!p?.canEdit, delete: !!p?.canDelete };
  }
  const { permissions: _, _count, ...rest } = role;
  return { ...rest, userCount: _count?.users ?? 0, isLocked: role.key === OWNER_KEY, permissions };
}

// Ghi đè toàn bộ quyền của 1 vai trò (xóa cũ - tạo mới), dùng bên trong transaction
export async function replacePermissions(tx, role, permissions = {}) {
  await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
  await tx.rolePermission.createMany({
    data: MODULE_KEYS.map((module) => {
      if (role.key === OWNER_KEY) return { roleId: role.id, module, ...FULL };
      const p = permissions[module] ?? {};
      return { roleId: role.id, module, canView: !!p.view, canCreate: !!p.create, canEdit: !!p.edit, canDelete: !!p.delete };
    }),
  });
}

// "Bảo vệ ca đêm" -> "BAO_VE_CA_DEM"; trùng thì thêm số: BAO_VE_CA_DEM_2
export async function generateKey(db, name) {
  const base =
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'D')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'ROLE';
  let key = base;
  for (let i = 2; await db.staffRole.findUnique({ where: { key } }); i++) key = `${base}_${i}`;
  return key;
}
