// Tài khoản nhân viên demo: mỗi vai trò 1 tài khoản, mật khẩu 123456.
//
// Chạy riêng: npm --prefix backend run db:seed-staff
//   - KHÔNG xóa dữ liệu. Email nào đã có thì giữ nguyên (không đổi mật khẩu, không đổi vai trò).
//   - Dùng khi database được tạo trước lúc có ma trận phân quyền (seed cũ chưa có nhân viên),
//     hoặc lỡ xóa tài khoản demo.
// seed.js cũng gọi hàm seedDemoStaff() bên dưới, nên danh sách chỉ cần sửa ở đây.
//
// Chỉ là dữ liệu thử: đưa lên máy chủ thật thì KHÔNG chạy script này (mật khẩu ai cũng biết).
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedDefaultRoles } from '../src/modules/permissions/permissions.service.js';

export const DEMO_STAFF_PASSWORD = '123456';

// [tên, email, số điện thoại, key vai trò trong src/config/permissions.js]
// Vai trò ADMIN không cần tài khoản riêng: đã có admin@fab.vn (mật khẩu admin123).
export const DEMO_STAFF = [
  ['Ngô Chủ Nhà', 'chunha@fab.vn', '0930000005', 'OWNER'],
  ['Phạm Quản Lý', 'quanly@fab.vn', '0930000001', 'MANAGER'],
  ['Đặng Tổ Trưởng', 'totruong@fab.vn', '0930000006', 'TEAM_LEAD'],
  ['Lý Phục Vụ', 'phucvu@fab.vn', '0930000007', 'WAITER'],
  ['Hoàng Lễ Tân', 'letan@fab.vn', '0930000003', 'RECEPTIONIST'],
  ['Đỗ Thu Ngân', 'thungan@fab.vn', '0930000002', 'CASHIER'],
  ['Trương Kỹ Thuật', 'kythuat@fab.vn', '0930000008', 'TECHNICIAN'],
  ['Mai Tạp Vụ', 'tapvu@fab.vn', '0930000009', 'CLEANER'],
  ['Bùi Đầu Bếp', 'bep@fab.vn', '0930000004', 'KITCHEN'],
  ['Lâm Tiếp Thực', 'tiepthuc@fab.vn', '0930000010', 'RUNNER'],
  ['Hồ Văn Hải', 'hohaisan@fab.vn', '0930000011', 'SEAFOOD_KEEPER'],
  ['Vũ Nhân Bar', 'bar@fab.vn', '0930000012', 'BARTENDER'],
];

// Tạo các tài khoản còn thiếu. Trả về { created: [email...], skipped: [email...] }
export async function seedDemoStaff(db) {
  await seedDefaultRoles(db); // chắc chắn 12 vai trò đã có (chạy nhiều lần không bị trùng)
  const roleIds = Object.fromEntries((await db.staffRole.findMany()).map((r) => [r.key, r.id]));
  const passwordHash = await bcrypt.hash(DEMO_STAFF_PASSWORD, 10);

  const created = [];
  const skipped = [];
  for (const [name, email, phone, roleKey] of DEMO_STAFF) {
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      skipped.push(email);
      continue;
    }
    // Vai trò bị admin xóa trên giao diện -> vẫn tạo tài khoản nhưng chưa gán vai trò
    await db.user.create({ data: { name, email, phone, passwordHash, role: 'STAFF', staffRoleId: roleIds[roleKey] ?? null } });
    created.push(email);
  }
  return { created, skipped };
}

// Chỉ chạy đoạn này khi gọi trực tiếp `node prisma/seed-staff.js` (seed.js import thì không chạy)
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const prisma = new PrismaClient();
  try {
    const { created, skipped } = await seedDemoStaff(prisma);
    if (created.length) {
      console.log(`✅ Đã tạo ${created.length} tài khoản nhân viên demo (mật khẩu ${DEMO_STAFF_PASSWORD}):`);
      for (const email of created) console.log(`   + ${email}`);
    } else {
      console.log('✅ Không cần tạo thêm: đủ tài khoản nhân viên demo.');
    }
    if (skipped.length) console.log(`↩️  Đã có sẵn, giữ nguyên: ${skipped.join(', ')}`);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
