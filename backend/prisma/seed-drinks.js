// Tạo danh sách kiểm bia nước: mỗi món trong nhóm "Nước uống" 1 dòng, kèm quy cách thùng (docs/29).
// Chạy: npm --prefix backend run db:seed-drinks
// Chỉ thêm loại còn thiếu, KHÔNG ghi đè quy cách thùng đã sửa và không xóa phiếu kiểm cũ.
// (seed.js và db:seed-menu cũng tự làm việc này.)
import { PrismaClient } from '@prisma/client';
import { seedDrinkProducts } from '../src/config/drinks.js';
import { seedDefaultRoles } from '../src/modules/permissions/permissions.service.js';

const prisma = new PrismaClient();
try {
  // Chức năng "Bia nước & kiểm kho quầy" (DRINKS) là chức năng mới trong ma trận phân quyền:
  // chạy lại seedDefaultRoles để các vai trò có sẵn được cấp quyền mặc định (không xóa quyền admin đã sửa).
  await seedDefaultRoles(prisma);
  const r = await seedDrinkProducts(prisma);
  const list = await prisma.drinkProduct.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { packSize: true, isActive: true, dish: { select: { name: true, unit: true } } },
  });
  console.log(`✅ Kiểm bia nước: ${r.products} loại trong nhóm "Nước uống", vừa thêm ${r.created}`);
  for (const p of list) {
    console.log(`   🍺 ${p.dish.name}: thùng ${p.packSize} ${p.dish.unit}${p.isActive ? '' : ' (đã tắt)'}`);
  }
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
